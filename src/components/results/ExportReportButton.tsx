import React from 'react';
import { Printer, Download } from 'lucide-react';

interface ExportReportButtonProps {
  scanId: string;
  cropName: string;
  fieldName?: string;
}

export const ExportReportButton: React.FC<ExportReportButtonProps> = ({
  scanId,
  cropName,
  fieldName,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <button
      type="button"
      onClick={handlePrint}
      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cream-100 hover:bg-cream-200 text-soil-800 text-xs font-medium border border-soil-600/20 warm-shadow-sm btn-press cursor-pointer transition-colors no-print"
      title="Export and print visual pathology advisory report"
    >
      <Printer className="w-3.5 h-3.5 text-soil-600" />
      <span>Print / PDF Report</span>
    </button>
  );
};
