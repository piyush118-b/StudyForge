"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import * as htmlToImage from "html-to-image";

interface ExportButtonProps {
  targetId: string;
}

export function ExportButton({ targetId }: ExportButtonProps) {
  const handleExport = async () => {
    const element = document.getElementById(targetId);
    if (!element) return;
    
    try {
      const dataUrl = await htmlToImage.toPng(element, { quality: 0.95 });
      const link = document.createElement("a");
      link.download = "my-timetable.png";
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Oops, could not export image!", err);
    }
  };

  return (
    <Button onClick={handleExport} className="bg-teal-500 hover:bg-teal-600 text-white font-semibold">
      <Download className="w-4 h-4 mr-2" /> Export PNG
    </Button>
  );
}
