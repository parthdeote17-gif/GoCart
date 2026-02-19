"use client";

import { useEffect, useState } from "react";
import { getCategories } from "@/services/product.service";

interface Props {
  onSelect: (category: string) => void;
  selected?: string; // Highlight karne ke liye
}

export default function CategorySidebar({ onSelect, selected }: Props) {
  const [categories, setCategories] = useState<any[]>([]);
  const [showAll, setShowAll] = useState(false); // Toggle state

  useEffect(() => {
    getCategories().then((data) => {
      // Ensure data array hai
      setCategories(Array.isArray(data) ? data : []);
    });
  }, []);

  // Logic: Agar showAll true hai toh sab dikhao, nahi toh sirf top 5
  const visibleCategories = showAll ? categories : categories.slice(0, 5);

  return (
    <div className="bg-white p-4 h-full min-h-[300px] shadow-sm">
      <h3 className="font-bold text-lg mb-4">Department</h3>
      
      <ul className="space-y-1 text-sm">
        {/* 'All' Option */}
        <li 
          onClick={() => onSelect("All")}
          className={`cursor-pointer p-2 rounded hover:text-[#c45500] hover:underline ${selected === "All" ? "font-bold text-black" : "text-gray-700"}`}
        >
          All Categories
        </li>

        {/* Dynamic Categories */}
        {visibleCategories.map((c: any) => (
          <li
            key={c.category_name}
            onClick={() => onSelect(c.category_name)}
            className={`cursor-pointer p-2 rounded hover:text-[#c45500] hover:underline ${
              selected === c.category_name ? "font-bold text-black" : "text-gray-700"
            }`}
          >
            {c.category_name} 
            <span className="text-xs text-gray-400 ml-1">({c.count})</span>
          </li>
        ))}
      </ul>

      {/* Show More / Show Less Button */}
      {categories.length > 5 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-3 text-sm font-medium text-blue-600 hover:text-red-500 hover:underline flex items-center gap-1"
        >
          {showAll ? "See Less ▲" : `See All ${categories.length - 5} Categories ▼`}
        </button>
      )}
    </div>
  );
}