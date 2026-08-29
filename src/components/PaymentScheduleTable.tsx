import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Search, 
  Filter, 
  Receipt, 
  FileSpreadsheet, 
  Eye, 
  ArrowUpDown,
  Printer,
  FileCheck2,
  Calendar,
  Check,
  Edit3
} from 'lucide-react';
import { LoanContract, InstallmentItem, PaymentStatus } from '../types';
import { formatCurrency, formatDateLao, getDaysRemaining } from '../services/loanCalculator';

interface PaymentScheduleTableProps {
  contract: LoanContract;
  onRecordPayment: (item: InstallmentItem) => void;
  onViewSlip: (item: InstallmentItem) => void;
  onSyncGoogleSheets: () => void;
  onEditContract?: () => void;
  isSyncing: boolean;
  activeLanguage: 'lo' | 'en';
}

export const PaymentScheduleTable: React.FC<PaymentScheduleTableProps> = ({
  contract,
  onRecordPayment,
  onViewSlip,
  onSyncGoogleSheets,
  onEditContract,
  isSyncing,
  activeLanguage,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | PaymentStatus>('all');

  const filteredSchedule = contract.schedule.filter((item) => {
    const matchesSearch = 
      item.period.toString().includes(searchTerm) ||
      item.dueDate.includes(searchTerm) ||
      (item.paymentMethod && item.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.receiptNote && item.receiptNote.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (item: InstallmentItem) => {
    switch (item.status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
            <CheckCircle2 className="w-3 h-3" />
            <span>{activeLanguage === 'lo' ? 'ຈ່າຍແລ້ວ' : 'Paid'}</span>
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200 shadow-2xs animate-pulse">
            <AlertTriangle className="w-3 h-3" />
            <span>{activeLanguage === 'lo' ? 'ກາຍກຳນົດ' : 'Overdue'}</span>
          </span>
        );
      case 'due_soon':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs">
            <Clock className="w-3 h-3" />
            <span>{activeLanguage === 'lo' ? 'ໃກ້ຮອດກຳນົດ' : 'Due Soon'}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
            <span>{activeLanguage === 'lo' ? 'ລໍຖ້າຊຳລະ' : 'Pending'}</span>
          </span>
        );
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 text-slate-900 shadow-xs space-y-4">
      {/* Table Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-blue-600" />
            <span>{activeLanguage === 'lo' ? 'ຕາຕະລາງ ແລະ ປະຫວັດການຈ່າຍຄ່າງວດຢ່າງລະອຽດ' : 'Installment Schedule & Payment History'}</span>
          </h3>
          <p className="text-xs text-slate-500">
            {activeLanguage === 'lo' 
              ? 'ສະແດງການແບ່ງເງິນຕົ້ນ, ດອກເບ້ຍ, ດອກເບ້ຍສະສົມ ແລະ ຍອດຍັງເຫຼືອທຸກໆງວດ' 
              : 'Detailed monthly breakdown of principal, interest, cumulative interest, and balance'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {onEditContract && (
            <button
              id="btn-edit-contract-table"
              onClick={onEditContract}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 shadow-2xs transition-all cursor-pointer"
              title="Edit Contract Terms"
            >
              <Edit3 className="w-3.5 h-3.5 text-blue-600" />
              <span>{activeLanguage === 'lo' ? 'ແກ້ໄຂສັນຍາ' : 'Edit Contract'}</span>
            </button>
          )}

          <button
            id="btn-sync-sheets-table"
            onClick={onSyncGoogleSheets}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            title="Sync this contract to Google Sheets"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>{isSyncing ? (activeLanguage === 'lo' ? 'ກຳລັງຊິງຄ໌...' : 'Syncing...') : (activeLanguage === 'lo' ? 'ຊິງຄ໌ Google Sheet' : 'Sync Sheets')}</span>
          </button>

          <button
            id="btn-print-table"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-2xs transition-all cursor-pointer"
            title="Print Schedule"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{activeLanguage === 'lo' ? 'ພິມຕາຕະລາງ' : 'Print'}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            id="input-search-schedule"
            type="text"
            placeholder={activeLanguage === 'lo' ? 'ຄົ້ນຫາ ງວດທີ, ວັນທີ, ໝາຍເຫດ...' : 'Search period, date, notes...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
          />
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {activeLanguage === 'lo' ? 'ທັງໝົດ' : 'All'} ({contract.schedule.length})
          </button>

          <button
            onClick={() => setStatusFilter('due_soon')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === 'due_soon'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            {activeLanguage === 'lo' ? 'ໃກ້ຮອດກຳນົດ' : 'Due Soon'} ({contract.schedule.filter(i => i.status === 'due_soon').length})
          </button>

          <button
            onClick={() => setStatusFilter('overdue')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === 'overdue'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
            }`}
          >
            {activeLanguage === 'lo' ? 'ກາຍກຳນົດ' : 'Overdue'} ({contract.schedule.filter(i => i.status === 'overdue').length})
          </button>

          <button
            onClick={() => setStatusFilter('paid')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === 'paid'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            {activeLanguage === 'lo' ? 'ຈ່າຍແລ້ວ' : 'Paid'} ({contract.schedule.filter(i => i.status === 'paid').length})
          </button>

          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === 'pending'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
            }`}
          >
            {activeLanguage === 'lo' ? 'ລໍຖ້າ' : 'Pending'} ({contract.schedule.filter(i => i.status === 'pending').length})
          </button>
        </div>
      </div>

      {/* Main Schedule Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-2xs">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <th className="p-3 whitespace-nowrap text-center">{activeLanguage === 'lo' ? 'ງວດທີ' : 'Period'}</th>
              <th className="p-3 whitespace-nowrap">{activeLanguage === 'lo' ? 'ວັນທີຄົບກຳນົດ' : 'Due Date'}</th>
              <th className="p-3 whitespace-nowrap">{activeLanguage === 'lo' ? 'ຄ່າງວດ' : 'Installment'}</th>
              <th className="p-3 whitespace-nowrap">{activeLanguage === 'lo' ? 'ເງິນຕົ້ນ' : 'Principal'}</th>
              <th className="p-3 whitespace-nowrap">{activeLanguage === 'lo' ? 'ດອກເບ້ຍ' : 'Interest'}</th>
              <th className="p-3 whitespace-nowrap text-emerald-700">{activeLanguage === 'lo' ? 'ດອກເບ້ຍສະສົມ' : 'Cumul. Interest'}</th>
              <th className="p-3 whitespace-nowrap">{activeLanguage === 'lo' ? 'ຍອດຕົ້ນຍັງເຫຼືອ' : 'Remaining Balance'}</th>
              <th className="p-3 whitespace-nowrap text-center">{activeLanguage === 'lo' ? 'ສະຖານະ' : 'Status'}</th>
              <th className="p-3 whitespace-nowrap">{activeLanguage === 'lo' ? 'ປະຫວັດການຊຳລະ' : 'Payment Details'}</th>
              <th className="p-3 whitespace-nowrap text-center">{activeLanguage === 'lo' ? 'ຈັດການ' : 'Action'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-800">
            {filteredSchedule.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-8 text-slate-400">
                  {activeLanguage === 'lo' ? 'ບໍ່ພົບຂໍ້ມູນທີ່ກົງກັບເງື່ອນໄຂ' : 'No records found matching filter'}
                </td>
              </tr>
            ) : (
              filteredSchedule.map((item) => {
                const daysInfo = item.status !== 'paid' ? getDaysRemaining(item.dueDate) : null;

                return (
                  <tr
                    key={item.period}
                    className={`hover:bg-slate-50 transition-colors ${
                      item.status === 'due_soon' 
                        ? 'bg-amber-50/40' 
                        : item.status === 'overdue'
                        ? 'bg-red-50/40'
                        : item.status === 'paid'
                        ? 'bg-emerald-50/20'
                        : 'bg-white'
                    }`}
                  >
                    {/* Period # */}
                    <td className="p-3 text-center font-bold font-mono text-slate-700">
                      <span className="w-6 h-6 inline-flex items-center justify-center rounded-full bg-slate-100 text-xs text-slate-700 border border-slate-200">
                        {item.period}
                      </span>
                    </td>

                    {/* Due Date & countdown */}
                    <td className="p-3 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">{formatDateLao(item.dueDate)}</div>
                      {daysInfo && (
                        <div className={`text-[10px] font-semibold ${daysInfo.isOverdue ? 'text-red-600' : 'text-amber-700'}`}>
                          {daysInfo.label}
                        </div>
                      )}
                    </td>

                    {/* Installment Amount */}
                    <td className="p-3 whitespace-nowrap font-bold text-slate-900 font-mono">
                      {formatCurrency(item.installmentAmount, contract.currency)}
                    </td>

                    {/* Principal Portion */}
                    <td className="p-3 whitespace-nowrap font-mono text-slate-600">
                      {formatCurrency(item.principalAmount, contract.currency)}
                    </td>

                    {/* Interest Portion */}
                    <td className="p-3 whitespace-nowrap font-mono text-emerald-600 font-semibold">
                      {formatCurrency(item.interestAmount, contract.currency)}
                    </td>

                    {/* Cumulative Interest (Key requirement) */}
                    <td className="p-3 whitespace-nowrap font-mono font-bold text-emerald-800 bg-emerald-50/70">
                      {formatCurrency(item.cumulativeInterest, contract.currency)}
                    </td>

                    {/* Remaining Principal Balance */}
                    <td className="p-3 whitespace-nowrap font-mono text-slate-700 font-semibold">
                      {formatCurrency(item.remainingBalance, contract.currency)}
                    </td>

                    {/* Status Badge */}
                    <td className="p-3 whitespace-nowrap text-center">
                      {getStatusBadge(item)}
                    </td>

                    {/* Payment details (Paid Date, Method, Note) */}
                    <td className="p-3 max-w-[200px]">
                      {item.status === 'paid' ? (
                        <div className="space-y-0.5 text-[11px]">
                          <div className="text-emerald-700 font-semibold flex items-center gap-1">
                            <span>{formatDateLao(item.paidDate || item.dueDate)}</span>
                            {item.paymentMethod && (
                              <span className="px-1.5 py-0.2 rounded bg-slate-100 text-[10px] text-slate-700 border border-slate-200 font-medium">
                                {item.paymentMethod}
                              </span>
                            )}
                          </div>
                          {item.receiptNote && (
                            <p className="text-slate-500 truncate text-[10px] italic" title={item.receiptNote}>
                              {item.receiptNote}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">-</span>
                      )}
                    </td>

                    {/* Action buttons */}
                    <td className="p-3 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          id={`btn-record-payment-${item.period}`}
                          onClick={() => onRecordPayment(item)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all shadow-2xs active:scale-95 flex items-center gap-1 cursor-pointer ${
                            item.status === 'paid'
                              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                              : 'bg-blue-600 hover:bg-blue-700 text-white font-bold'
                          }`}
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span>
                            {item.status === 'paid' 
                              ? (activeLanguage === 'lo' ? 'ແກ້ໄຂ' : 'Edit') 
                              : (activeLanguage === 'lo' ? 'ຈ່າຍງວດນີ້' : 'Pay')}
                          </span>
                        </button>

                        {item.slipImage && (
                          <button
                            id={`btn-view-slip-${item.period}`}
                            onClick={() => onViewSlip(item)}
                            className="p-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 cursor-pointer shadow-2xs"
                            title="View Payment Slip"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
