import React from 'react';
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Car, 
  Store, 
  ArrowRight,
  ShieldCheck,
  Percent,
  Receipt,
  Edit3
} from 'lucide-react';
import { LoanContract, InstallmentItem } from '../types';
import { formatCurrency, formatDateLao, getContractStats, getDaysRemaining } from '../services/loanCalculator';

interface DashboardStatsProps {
  contract: LoanContract;
  onRecordPayment: (item: InstallmentItem) => void;
  onEditContract?: () => void;
  activeLanguage: 'lo' | 'en';
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  contract,
  onRecordPayment,
  onEditContract,
  activeLanguage,
}) => {
  const stats = getContractStats(contract);
  const upcoming = stats.upcomingItem;
  const daysInfo = upcoming ? getDaysRemaining(upcoming.dueDate) : null;

  return (
    <div className="space-y-4">
      {/* Alert Banner for Overdue / Due Soon */}
      {stats.overdueCount > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 border border-red-200 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-red-900">
                {activeLanguage === 'lo' 
                  ? `⚠️ ມີຄ່າງວດກາຍກຳນົດຊຳລະ ${stats.overdueCount} ງວດ!` 
                  : `⚠️ ${stats.overdueCount} Overdue Installment(s)!`}
              </h4>
              <p className="text-xs text-red-700">
                {activeLanguage === 'lo'
                  ? `ຍອດກາຍກຳນົດລວມ: ${formatCurrency(stats.overdueAmount, contract.currency)} (ກະລຸນາຊຳລະເພື່ອຫຼີກລ່ຽງຄ່າປັບໃໝ)`
                  : `Total Overdue: ${formatCurrency(stats.overdueAmount, contract.currency)}`}
              </p>
            </div>
          </div>
          {upcoming && (
            <button
              id="btn-alert-pay-overdue"
              onClick={() => onRecordPayment(upcoming)}
              className="px-4 py-2 text-xs font-bold rounded-lg bg-red-600 hover:bg-red-700 text-white shadow-xs transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <Receipt className="w-4 h-4" />
              <span>{activeLanguage === 'lo' ? 'ຊຳລະຄ່າງວດດຽວນີ້' : 'Pay Now'}</span>
            </button>
          )}
        </div>
      )}

      {stats.overdueCount === 0 && stats.dueSoonCount > 0 && upcoming && daysInfo && (
        <div className="bg-amber-50 border-l-4 border-amber-500 border border-amber-200 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900">
                {activeLanguage === 'lo' 
                  ? `🔔 ຮອດກຳນົດຈ່າຍຄ່າງວດງວດທີ ${upcoming.period} (${daysInfo.label})` 
                  : `🔔 Installment #${upcoming.period} Due Soon (${daysInfo.label})`}
              </h4>
              <p className="text-xs text-amber-800">
                {activeLanguage === 'lo'
                  ? `ວັນທີຄົບກຳນົດ: ${formatDateLao(upcoming.dueDate)} | ຈຳນວນ: ${formatCurrency(upcoming.installmentAmount, contract.currency)}`
                  : `Due Date: ${upcoming.dueDate} | Amount: ${formatCurrency(upcoming.installmentAmount, contract.currency)}`}
              </p>
            </div>
          </div>
          <button
            id="btn-alert-pay-due-soon"
            onClick={() => onRecordPayment(upcoming)}
            className="px-4 py-2 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <Receipt className="w-4 h-4" />
            <span>{activeLanguage === 'lo' ? 'ບັນທຶກການຈ່າຍ' : 'Record Payment'}</span>
          </button>
        </div>
      )}

      {/* Contract & Dealership Summary Pill */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 text-slate-900 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-2xs">
              <Car className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">{contract.carName}</h3>
                {contract.licensePlate && (
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-mono font-semibold">
                    {contract.licensePlate}
                  </span>
                )}
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 font-medium">
                  {contract.vehicleType}
                </span>
                {onEditContract && (
                  <button
                    id="btn-edit-contract-dashboard"
                    onClick={onEditContract}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-0.5 rounded-md transition-colors cursor-pointer ml-1 shadow-2xs"
                    title="Edit Contract Terms"
                  >
                    <Edit3 className="w-3 h-3 text-blue-600" />
                    <span>{activeLanguage === 'lo' ? 'ແກ້ໄຂສັນຍາ' : 'Edit Contract'}</span>
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                <Store className="w-3.5 h-3.5 text-blue-600" />
                <span className="font-medium text-slate-700">{contract.storeName}</span>
                {contract.storePhone && <span>• ໂທ: {contract.storePhone}</span>}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200/80">
              <span className="text-slate-500 block text-[10px] font-medium">{activeLanguage === 'lo' ? 'ລາຄາລົດລວມ' : 'Total Price'}</span>
              <span className="font-bold text-slate-900 text-sm">{formatCurrency(contract.totalPrice, contract.currency)}</span>
            </div>
            <div className="bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200/80">
              <span className="text-slate-500 block text-[10px] font-medium">{activeLanguage === 'lo' ? 'ເງິນວາງດາວ' : 'Down Payment'}</span>
              <span className="font-bold text-blue-700 text-sm">
                {contract.downPaymentPercent}% ({formatCurrency(contract.downPaymentAmount, contract.currency)})
              </span>
            </div>
            <div className="bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200/80">
              <span className="text-slate-500 block text-[10px] font-medium">{activeLanguage === 'lo' ? 'ດອກເບ້ຍຕໍ່ເດືອນ' : 'Interest Rate'}</span>
              <span className="font-bold text-emerald-600 text-sm">
                {(contract.monthlyInterestRate * 100).toFixed(2)}% / {activeLanguage === 'lo' ? 'ເດືອນ' : 'mo'}
              </span>
            </div>
            <div className="bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200/80">
              <span className="text-slate-500 block text-[10px] font-medium">{activeLanguage === 'lo' ? 'ໄລຍະເວລາຜ່ອນ' : 'Loan Term'}</span>
              <span className="font-bold text-slate-900 text-sm">
                {contract.termMonths} {activeLanguage === 'lo' ? 'ເດືອນ' : 'months'}
              </span>
            </div>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {/* Card 1: Remaining Principal */}
          <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
              <span>{activeLanguage === 'lo' ? 'ຍອດເງິນຕົ້ນຍັງຄ້າງ' : 'Remaining Principal'}</span>
              <DollarSign className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">
              {formatCurrency(stats.remainingPrincipal, contract.currency)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex justify-between">
              <span>{activeLanguage === 'lo' ? 'ຕົ້ນທັງໝົດ:' : 'Orig. Loan:'} {formatCurrency(contract.loanAmount, contract.currency)}</span>
              <span className="text-emerald-600 font-bold">{stats.principalProgressPercent}% {activeLanguage === 'lo' ? 'ຊຳລະແລ້ວ' : 'Paid'}</span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${stats.principalProgressPercent}%` }}
              />
            </div>
          </div>

          {/* Card 2: Cumulative Interest */}
          <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
              <span>{activeLanguage === 'lo' ? 'ດອກເບ້ຍສະສົມທີ່ຈ່າຍແລ້ວ' : 'Cumulative Interest Paid'}</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-700">
              {formatCurrency(stats.totalInterestPaid, contract.currency)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex justify-between">
              <span>{activeLanguage === 'lo' ? 'ດອກເບ້ຍລວມ:' : 'Total Interest:'} {formatCurrency(contract.totalInterest, contract.currency)}</span>
              <span>{activeLanguage === 'lo' ? 'ເຫຼືອ:' : 'Left:'} {formatCurrency(stats.totalInterestRemaining, contract.currency)}</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${contract.totalInterest > 0 ? Math.round((stats.totalInterestPaid / contract.totalInterest) * 100) : 0}%` 
                }}
              />
            </div>
          </div>

          {/* Card 3: Monthly Installment */}
          <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
              <span>{activeLanguage === 'lo' ? 'ຄ່າງວດປະຈຳເດືອນ' : 'Monthly Installment'}</span>
              <Calendar className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-indigo-900">
              {formatCurrency(contract.monthlyInstallment, contract.currency)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex justify-between">
              <span>{activeLanguage === 'lo' ? 'ຕົ້ນ:' : 'Prin:'} {formatCurrency(contract.monthlyPrincipal, contract.currency)}</span>
              <span>{activeLanguage === 'lo' ? 'ດອກ:' : 'Int:'} {formatCurrency(contract.monthlyInterest, contract.currency)}</span>
            </div>
            <div className="text-[11px] text-indigo-700 mt-2 font-semibold">
              {activeLanguage === 'lo' ? `ກຳນົດຈ່າຍ: ວັນທີ ${contract.dueDayOfMonth} ຂອງທຸກເດືອນ` : `Due: Day ${contract.dueDayOfMonth} each month`}
            </div>
          </div>

          {/* Card 4: Progress & Schedule Count */}
          <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-medium">
              <span>{activeLanguage === 'lo' ? 'ສະຖານະງວດ' : 'Installment Progress'}</span>
              <CheckCircle2 className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-purple-900">
              {stats.paidCount} / {stats.totalInstallments}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex justify-between">
              <span>{activeLanguage === 'lo' ? 'ເຫຼືອ:' : 'Remaining:'} {stats.remainingCount} {activeLanguage === 'lo' ? 'ງວດ' : 'periods'}</span>
              <span className="text-purple-700 font-bold">{stats.progressPercent}%</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-purple-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${stats.progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
