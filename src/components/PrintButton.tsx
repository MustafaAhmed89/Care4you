"use client";

import { Printer } from "lucide-react";

export default function PrintButton({ label = "Print" }: { label?: string }) {
  return (
    <button onClick={() => window.print()} className="btn-primary no-print">
      <Printer size={16} /> {label}
    </button>
  );
}
