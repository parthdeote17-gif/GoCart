import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Providers from "./providers"; // ✅ Seedha same folder se import

export const metadata = {
  title: "MyShop",
  description: "Ecommerce App",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* ✅ Providers wrap kiya taaki cache poori app me chale */}
        <Providers>
          <Navbar />
          <main className="min-h-screen bg-gray-100">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}