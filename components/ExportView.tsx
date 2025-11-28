
import React from 'react';
import { Transaction } from '../types';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { FileText, Table, Download } from 'lucide-react';
import { format } from 'date-fns';

interface ExportViewProps {
  transactions: Transaction[];
}

export const ExportView: React.FC<ExportViewProps> = ({ transactions }) => {

  const exportPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text("FinanceFlow Daily Report", 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

    const tableColumn = ["Date", "Type", "Category", "Description", "Amount (AED)"];
    const tableRows: any[] = [];

    transactions.forEach(transaction => {
      const transactionData = [
        format(new Date(transaction.date), 'yyyy-MM-dd HH:mm'),
        transaction.type,
        transaction.category,
        transaction.description,
        transaction.type === 'income' ? `+ ${transaction.amount}` : `- ${transaction.amount}`
      ];
      tableRows.push(transactionData);
    });

    // Use type assertion to bypass strict checking for the plugin
    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] }
    });

    doc.save(`financeflow_report_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(transactions.map(t => ({
      Date: format(new Date(t.date), 'yyyy-MM-dd HH:mm'),
      Type: t.type,
      Category: t.category,
      Description: t.description,
      "Amount (AED)": t.type === 'income' ? t.amount : -t.amount
    })));
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    XLSX.writeFile(wb, `financeflow_export_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 text-center text-white shadow-xl">
        <Download className="w-16 h-16 mx-auto mb-4 text-indigo-400 opacity-80" />
        <h2 className="text-2xl font-bold mb-2">Export Data</h2>
        <p className="text-gray-400 text-sm mb-8">Download your financial history for external analysis or record keeping.</p>
        
        <div className="space-y-3">
          <button 
            onClick={exportPDF}
            className="w-full flex items-center justify-center gap-3 bg-red-500 hover:bg-red-600 text-white font-semibold py-4 rounded-xl transition-all shadow-lg shadow-red-500/20 active:scale-95"
          >
            <FileText className="w-5 h-5" />
            Export as PDF
          </button>
          
          <button 
            onClick={exportExcel}
            className="w-full flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 text-white font-semibold py-4 rounded-xl transition-all shadow-lg shadow-green-600/20 active:scale-95"
          >
            <Table className="w-5 h-5" />
            Export as Excel
          </button>
        </div>
      </div>
      
      <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm border border-blue-100">
        <p><strong>Note:</strong> All data is stored locally on your device. Exporting creates a local file copy.</p>
      </div>
    </div>
  );
};
