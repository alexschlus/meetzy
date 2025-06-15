
import React from "react";

export default function Logo() {
  // Using the provided logo image
  return (
    <div className="flex items-center gap-2">
      <img
        src="/lovable-uploads/33fa5e16-2928-47ff-ba88-8fb2b97c5a58.png"
        alt="Meetzy logo"
        className="w-10 h-10 rounded-full bg-blue-300/20 object-contain shadow"
      />
      <span className="text-2xl font-bold text-blue-200 tracking-tight drop-shadow">meetzy</span>
    </div>
  );
}
