require("dotenv").config();

const fs = require("fs");
const csv = require("csv-parser");
const pool = require("./db");

console.log("Bulk CSV import started...");

const BATCH_SIZE = 500;
let batch = [];
let totalInserted = 0;

async function insertBatch(rows) {
  const values = [];
  const placeholders = [];

  rows.forEach((row, i) => {
    const baseIndex = i * 10;

    placeholders.push(
      `($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${baseIndex + 4},
        $${baseIndex + 5}, $${baseIndex + 6}, $${baseIndex + 7}, $${baseIndex + 8},
        $${baseIndex + 9}, $${baseIndex + 10})`
    );

    values.push(
      row.asin || null,
      row.title || null,
      row.img_url || null,                 // ✅ FIX
      row.product_url || null,             // ✅ FIX
      row.description || row.about_product || null, // ✅ MAIN FIX
      row.stars ? parseFloat(row.stars) : null,
      row.reviews ? parseInt(row.reviews) : null,
      row.price ? parseFloat(row.price) : null,
      row.list_price ? parseFloat(row.list_price) : null, // ✅ FIX
      row.category_name || null
    );
  });

  const query = `
    INSERT INTO products
    (asin, title, img_url, product_url, description, stars, reviews, price, list_price, category_name)
    VALUES ${placeholders.join(",")}
  `;

  await pool.query(query, values);
}

(async () => {
  try {
    const stream = fs
      .createReadStream("./products.csv")
      .pipe(csv());

    for await (const row of stream) {
      batch.push(row);

      if (batch.length === BATCH_SIZE) {
        await insertBatch(batch);
        totalInserted += batch.length;
        console.log(`Inserted ${totalInserted} rows`);
        batch = [];
      }
    }

    if (batch.length > 0) {
      await insertBatch(batch);
      totalInserted += batch.length;
    }

    console.log(`CSV import completed. Total rows inserted: ${totalInserted}`);
    process.exit(0);
  } catch (err) {
    console.error("Bulk import error:", err.message);
    process.exit(1);
  }
})();
