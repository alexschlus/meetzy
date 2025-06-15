
import React from "react";

export default function Logo() {
  // Placeholder logo - replace src with your uploaded logo when provided
  return (
    <div className="flex items-center gap-2">
      <img
        src="/placeholder.svg"
        alt="Meetzy logo"
        className="w-10 h-10 rounded-full bg-blue-300/20 object-contain shadow"
      />
      <span className="text-2xl font-bold text-blue-200 tracking-tight drop-shadow">meetzy</span>
    </div>
  );
}
