import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { exportToExcel, exportToPDF, shareData } from "@/lib/export";
import { Download, FileSpreadsheet, FileText, Share2 } from "lucide-react";

interface ExportButtonsProps {
  title: string;
  headers: string[];
  rows: (string | number)[][];
  filename: string;
}

export function ExportButtons({ title, headers, rows, filename }: ExportButtonsProps) {
  const handleExcel = () => {
    exportToExcel({ headers, rows, title }, filename);
    toast({
      title: "Export Successful",
      description: `${title} exported to Excel`,
    });
  };

  const handlePDF = () => {
    exportToPDF({ headers, rows, title }, filename, "Dr. Poornima");
    toast({
      title: "Export Successful",
      description: `${title} exported to PDF for Dr. Poornima`,
    });
  };

  const handleShare = () => {
    const summary = `${title}\nTotal Records: ${rows.length}\nGenerated: ${new Date().toLocaleDateString()}`;
    const copied = shareData(title, summary);
    if (copied) {
      toast({
        title: "Copied to Clipboard",
        description: "Share link copied to clipboard",
      });
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={handleShare} className="gap-2">
        <Share2 className="w-4 h-4" />
        Share
      </Button>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleExcel} className="gap-2 cursor-pointer">
            <FileSpreadsheet className="w-4 h-4 text-success" />
            Export to Excel
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handlePDF} className="gap-2 cursor-pointer">
            <FileText className="w-4 h-4 text-destructive" />
            Export to PDF (for Dr. Poornima)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
