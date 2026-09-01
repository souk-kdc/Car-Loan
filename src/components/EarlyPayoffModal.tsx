import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  DollarSign, 
  TrendingDown, 
  ShieldCheck, 
  Percent, 
  Calendar, 
  Landmark, 
  Sparkles, 
  Printer, 
  HelpCircle, 
  Upload, 
  FileText, 
  Info, 
  ArrowRight,
  Calculator,
  Receipt,
  Car,
  Store
} from 'lucide-react';
import { Currency, LoanContract } from '../types';
import { calculateEarlyPayoff, formatCurrency, formatDateLao } from '../services/loanCalculator';

interface EarlyPayoffModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: LoanContract;
  onConfirmSettlement: (params: {
    settledDate: string;
    settledAmount: number;
    feeAmount: number;
    paymentMethod: string;
    note: string;
    slipImage?: string;
  }) => void;
  activeLanguage: 'lo' | 'en';
}

export const EarlyPayoffModal: React.FC<EarlyPayoffModalProps> = ({
  isOpen,
  onClose,
  contract,
  onConfirmSettlement,
  activeLanguage,
}) => {
  if (!isOpen) return null;

  // Calculation parameters
  const [payoffRatePercent, setPayoffRatePercent] = useState<number>(
    contract.earlyPayoffRatePercent ?? 5
  );
  const [simulatedPeriod, setSimulatedPeriod] = useState<number | null>(null);

  // Settlement execution form
  const [isConfirming, setIsConfirming] = useState(false);
  const [settledDate, setSettledDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('BCEL One');
  const [settlementNote, setSettlementNote] = useState('ຕັດຍອດປິດສັນຍາກ່ອນກຳນົດ (ຄ່າທຳນຽມ 5%)');
  const [slipImage, setSlipImage] = useState<string | null>(null);
  const [isSuccessView, setIsSuccessView] = useState(Boolean(contract.isFullySettled));

  // Current calculation based on actual remaining installments
  const actualPayoff = calculateEarlyPayoff(contract, payoffRatePercent);

  // Simulated payoff if user is playing with future period
  const effectivePayoff = simulatedPeriod !== null
    ? calculateEarlyPayoff(contract, payoffRatePercent, simulatedPeriod)
    : actualPayoff;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert(activeLanguage === 'lo' ? 'ຂະໜາດຮູບພາບຕ້ອງບໍ່ເກີນ 5MB' : 'File size must be under 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSlipImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleExecuteSettlement = () => {
    onConfirmSettlement({
      settledDate,
      settledAmount: actualPayoff.totalPayoffAmount,
      feeAmount: actualPayoff.payoffFeeAmount,
      paymentMethod,
      note: settlementNote,
      slipImage: slipImage || undefined,
    });
    setIsSuccessView(true);
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-slate-200 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden my-6 text-slate-900 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shadow-2xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>{activeLanguage === 'lo' ? 'ການຕັດຍອດປິດສັນຍາສິນເຊື່ອ (Early Payoff)' : 'Early Loan Payoff & Settlement'}</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {payoffRatePercent}% {activeLanguage === 'lo' ? 'ຄ່າຕັດຍອດ' : 'Fee'}
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                {activeLanguage === 'lo'
                  ? 'ຄິດໄລ່ຍອດເງິນຕົ້ນຍັງເຫຼືອ + ຄ່າທຳນຽມຕັດຍອດ 5% ເພື່ອປິດສັນຍາກ່ອນກຳນົດ'
                  : 'Calculate remaining principal balance + 5% early payoff fee to close contract'}
              </p>
            </div>
          </div>
          <button
            id="btn-close-payoff-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Certificate / Receipt View for Fully Settled Contracts */}
          {isSuccessView || contract.isFullySettled ? (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h4 className="text-xl font-black text-emerald-800">
                  {activeLanguage === 'lo' ? 'ສັນຍານີ້ໄດ້ຮັບການຕັດຍອດປິດສັນຍາຮຽບຮ້ອຍແລ້ວ!' : 'Loan Contract Successfully Settled!'}
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  {activeLanguage === 'lo' 
                    ? `ວັນທີຕັດຍອດ: ${formatDateLao(contract.settledDate || settledDate)} | ຍອດເງິນທີ່ຊຳລະ: ${formatCurrency(contract.settledAmount || actualPayoff.totalPayoffAmount, contract.currency)}`
                    : `Settlement Date: ${contract.settledDate || settledDate} | Paid: ${formatCurrency(contract.settledAmount || actualPayoff.totalPayoffAmount, contract.currency)}`}
                </p>
              </div>

              {/* Settlement Certificate Card */}
              <div className="bg-slate-50 border-2 border-emerald-200 rounded-2xl p-6 text-left space-y-4 shadow-2xs relative overflow-hidden">
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
                
                <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-200 gap-2">
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      {activeLanguage === 'lo' ? 'ໃບຢັ້ງຢືນການປິດສັນຍາ & ຕັດຍອດ' : 'Certificate of Loan Settlement'}
                    </span>
                    <span className="text-sm font-black text-slate-900">{contract.carName}</span>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                    {activeLanguage === 'lo' ? '✓ ປິດສັນຍາສົມບູນ (SETTLED)' : '✓ FULLY SETTLED'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[11px]">{activeLanguage === 'lo' ? 'ທະນາຄານໃຫ້ສິນເຊື່ອ:' : 'Financing Bank:'}</span>
                    <span className="font-bold text-slate-800">{contract.bankName || 'BCEL'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">{activeLanguage === 'lo' ? 'ໂຊຣູມ / ຮ້ານຄ້າ:' : 'Dealership:'}</span>
                    <span className="font-bold text-slate-800">{contract.storeName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">{activeLanguage === 'lo' ? 'ປ້າຍທະບຽນ:' : 'License Plate:'}</span>
                    <span className="font-bold text-slate-800">{contract.licensePlate || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">{activeLanguage === 'lo' ? 'ຍອດເງິນຕົ້ນຕັດຍອດ:' : 'Principal Settled:'}</span>
                    <span className="font-bold text-slate-900">{formatCurrency(actualPayoff.remainingPrincipal, contract.currency)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">{activeLanguage === 'lo' ? 'ຄ່າທຳນຽມຕັດຍອດ (5%):' : 'Early Payoff Fee (5%):'}</span>
                    <span className="font-bold text-amber-700">{formatCurrency(actualPayoff.payoffFeeAmount, contract.currency)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">{activeLanguage === 'lo' ? 'ດອກເບ້ຍທີ່ປະຢັດໄດ້:' : 'Interest Saved:'}</span>
                    <span className="font-bold text-emerald-700">{formatCurrency(actualPayoff.remainingFutureInterest, contract.currency)}</span>
                  </div>
                </div>

                {slipImage && (
                  <div className="pt-3 border-t border-slate-200 flex items-center gap-3">
                    <img src={slipImage} alt="Payment Slip" className="w-12 h-12 object-cover rounded-lg border border-slate-300 shadow-2xs" />
                    <span className="text-xs text-slate-600 font-medium">{activeLanguage === 'lo' ? 'ມີຫຼັກຖານສະລິບການໂອນເງິນຕັດຍອດ' : 'Payment slip attached'}</span>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  id="btn-print-settlement-cert"
                  onClick={handlePrintCertificate}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Printer className="w-4 h-4" />
                  <span>{activeLanguage === 'lo' ? 'ພິມໃບຢັ້ງຢືນການປິດສັນຍາ' : 'Print Certificate'}</span>
                </button>
                <button
                  id="btn-done-settlement"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer active:scale-95"
                >
                  <span>{activeLanguage === 'lo' ? 'ປິດໜ້າຕ່າງ' : 'Close'}</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Contract & Bank Header Overview */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <Car className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{contract.carName}</h4>
                    <p className="text-slate-500 text-[11px] flex items-center gap-1.5 mt-0.5">
                      <Landmark className="w-3.5 h-3.5 text-blue-600" />
                      <span>{activeLanguage === 'lo' ? 'ທະນາຄານ:' : 'Bank:'} <strong className="text-slate-700">{contract.bankName || 'BCEL'}</strong></span>
                      <span>•</span>
                      <Store className="w-3.5 h-3.5 text-blue-600" />
                      <span>{contract.storeName}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-right">
                    <span className="text-[10px] text-slate-500 block">{activeLanguage === 'lo' ? 'ຈ່າຍແລ້ວ' : 'Paid'}</span>
                    <span className="font-bold text-emerald-700">{actualPayoff.paidInstallmentsCount} / {contract.schedule.length} {activeLanguage === 'lo' ? 'ງວດ' : 'periods'}</span>
                  </div>
                  <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-right">
                    <span className="text-[10px] text-slate-500 block">{activeLanguage === 'lo' ? 'ຍັງເຫຼືອ' : 'Remaining'}</span>
                    <span className="font-bold text-amber-700">{actualPayoff.remainingInstallmentsCount} {activeLanguage === 'lo' ? 'ງວດ' : 'periods'}</span>
                  </div>
                </div>
              </div>

              {/* Main Calculation Highlight Card */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50/40 border-2 border-emerald-300/80 rounded-2xl p-5 shadow-2xs relative overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-emerald-200/80">
                  <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Calculator className="w-4 h-4 text-emerald-700" />
                    <span>{activeLanguage === 'lo' ? 'ຍອດເງິນທີ່ຕ້ອງຈ່າຍຕັດຍອດທັງໝົດ' : 'Total Early Payoff Required'}</span>
                  </span>
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-slate-600 font-medium">{activeLanguage === 'lo' ? 'ອັດຕາຄ່າຕັດຍອດ:' : 'Payoff Fee Rate:'}</span>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      step="0.5"
                      value={payoffRatePercent}
                      onChange={(e) => setPayoffRatePercent(Number(e.target.value))}
                      className="w-14 bg-white border border-emerald-300 rounded px-1.5 py-0.5 text-center font-bold text-emerald-800 text-xs shadow-2xs"
                    />
                    <span className="font-bold text-emerald-800">%</span>
                  </div>
                </div>

                {/* Big Grand Total Amount */}
                <div className="my-4 text-center">
                  <span className="text-xs text-emerald-800 font-medium block mb-1">
                    {activeLanguage === 'lo' 
                      ? `ຍອດເງິນລວມຕັດຍອດ (ເງິນຕົ້ນຍັງເຫຼືອ + ຄ່າທຳນຽມ ${payoffRatePercent}%)` 
                      : `Total Payoff (Remaining Principal + ${payoffRatePercent}% Fee)`}
                  </span>
                  <div className="text-3xl sm:text-4xl font-black text-emerald-700 tracking-tight">
                    {formatCurrency(effectivePayoff.totalPayoffAmount, contract.currency)}
                  </div>
                  <span className="text-xs text-slate-600 block mt-1">
                    ({formatCurrency(effectivePayoff.remainingPrincipal, contract.currency)} ຕົ້ນຍັງເຫຼືອ + {formatCurrency(effectivePayoff.payoffFeeAmount, contract.currency)} ຄ່າຕັດຍອດ {payoffRatePercent}%)
                  </span>
                </div>

                {/* 3 Detail Metric Blocks */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-3 border-t border-emerald-200/80 text-xs">
                  {/* Block 1: Remaining Principal */}
                  <div className="bg-white/80 backdrop-blur-xs p-3 rounded-xl border border-emerald-100 shadow-2xs">
                    <span className="text-slate-500 block text-[11px] mb-0.5">
                      {activeLanguage === 'lo' ? '1. ຍອດເງິນຕົ້ນຍັງເຫຼືອ' : '1. Remaining Principal'}
                    </span>
                    <span className="font-bold text-slate-900 text-sm">
                      {formatCurrency(effectivePayoff.remainingPrincipal, contract.currency)}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      {activeLanguage === 'lo' ? `ຈາກ ${effectivePayoff.remainingInstallmentsCount} ງວດທີ່ເຫຼືອ` : `For ${effectivePayoff.remainingInstallmentsCount} remaining months`}
                    </span>
                  </div>

                  {/* Block 2: 5% Payoff Fee */}
                  <div className="bg-white/80 backdrop-blur-xs p-3 rounded-xl border border-emerald-100 shadow-2xs">
                    <span className="text-slate-500 block text-[11px] mb-0.5">
                      {activeLanguage === 'lo' ? `2. ຄ່າທຳນຽມຕັດຍອດ (${payoffRatePercent}%)` : `2. Payoff Fee (${payoffRatePercent}%)`}
                    </span>
                    <span className="font-bold text-amber-700 text-sm">
                      {formatCurrency(effectivePayoff.payoffFeeAmount, contract.currency)}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      {payoffRatePercent}% {activeLanguage === 'lo' ? 'ຂອງຍອດເງິນຕົ້ນ' : 'of principal'}
                    </span>
                  </div>

                  {/* Block 3: Future Interest Saved */}
                  <div className="bg-white/80 backdrop-blur-xs p-3 rounded-xl border border-emerald-100 shadow-2xs">
                    <span className="text-slate-500 block text-[11px] mb-0.5">
                      {activeLanguage === 'lo' ? '3. ດອກເບ້ຍທີ່ປະຢັດໄດ້' : '3. Interest Saved'}
                    </span>
                    <span className="font-bold text-emerald-700 text-sm">
                      {formatCurrency(effectivePayoff.remainingFutureInterest, contract.currency)}
                    </span>
                    <span className="text-[10px] text-emerald-600 block mt-0.5 font-semibold">
                      {activeLanguage === 'lo' ? `ປະຢັດສຸດທິ: ${formatCurrency(effectivePayoff.netSavings, contract.currency)}` : `Net save: ${formatCurrency(effectivePayoff.netSavings, contract.currency)}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Comparison Box: Early Payoff vs Month-by-Month Regular Payment */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2.5">
                <h5 className="font-bold text-slate-800 flex items-center gap-1.5">
                  <TrendingDown className="w-4 h-4 text-emerald-600" />
                  <span>{activeLanguage === 'lo' ? 'ສົມທຽບ: ຕັດຍອດດຽວນີ້ VS ຜ່ອນຕໍ່ຈົນຄົບສັນຍາ' : 'Comparison: Settle Now vs Pay Month-by-Month'}</span>
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">{activeLanguage === 'lo' ? 'ຖ້າສືບຕໍ່ຜ່ອນລາຍເດືອນຈົນຄົບ:' : 'If paying regular installments:'}</span>
                    <div className="font-bold text-slate-900 text-base mt-0.5">
                      {formatCurrency(effectivePayoff.regularTotalRemaining, contract.currency)}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      {formatCurrency(effectivePayoff.remainingPrincipal, contract.currency)} ຕົ້ນ + {formatCurrency(effectivePayoff.remainingFutureInterest, contract.currency)} ດອກເບ້ຍ
                    </p>
                  </div>

                  <div className="p-3 bg-emerald-50/70 rounded-lg border border-emerald-200">
                    <span className="text-emerald-900 block text-[11px] font-semibold">{activeLanguage === 'lo' ? 'ຖ້າເອົາເງິນມາຕັດຍອດທັງໝົດ:' : 'If paying off in full early:'}</span>
                    <div className="font-bold text-emerald-700 text-base mt-0.5">
                      {formatCurrency(effectivePayoff.totalPayoffAmount, contract.currency)}
                    </div>
                    <p className="text-[10px] text-emerald-700 font-semibold mt-1">
                      {activeLanguage === 'lo' 
                        ? `🎉 ທ່ານຈະປະຢັດເງິນໄດ້ທັນທີ: ${formatCurrency(effectivePayoff.netSavings, contract.currency)}!` 
                        : `🎉 You will save ${formatCurrency(effectivePayoff.netSavings, contract.currency)} immediately!`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Settlement Form Accordion */}
              {!isConfirming ? (
                <button
                  id="btn-open-confirm-settlement"
                  onClick={() => setIsConfirming(true)}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Receipt className="w-4 h-4" />
                  <span>
                    {activeLanguage === 'lo' 
                      ? `ດຳເນີນການຕັດຍອດປິດສັນຍາ (${formatCurrency(actualPayoff.totalPayoffAmount, contract.currency)})` 
                      : `Proceed with Early Payoff (${formatCurrency(actualPayoff.totalPayoffAmount, contract.currency)})`}
                  </span>
                </button>
              ) : (
                <div className="bg-slate-50 border border-emerald-300 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <h5 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-emerald-600" />
                      <span>{activeLanguage === 'lo' ? 'ບັນທຶກການຊຳລະເງິນຕັດຍອດປິດສັນຍາ' : 'Record Payoff Settlement Payment'}</span>
                    </h5>
                    <button
                      type="button"
                      onClick={() => setIsConfirming(false)}
                      className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      {activeLanguage === 'lo' ? 'ຍົກເລີກ' : 'Cancel'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">
                        {activeLanguage === 'lo' ? 'ວັນທີຕັດຍອດ' : 'Settlement Date'}
                      </label>
                      <input
                        type="date"
                        value={settledDate}
                        onChange={(e) => setSettledDate(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-2xs"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-medium mb-1">
                        {activeLanguage === 'lo' ? 'ຊ່ອງທາງການຊຳລະ' : 'Payment Method'}
                      </label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-2xs"
                      >
                        <option value="BCEL One">BCEL One (ໂອນຜ່ານ BCEL)</option>
                        <option value="LDB Trust">LDB Trust (ທະນາຄານພັດທະນາລາວ)</option>
                        <option value="JDB Yes">JDB Yes (ທະນາຄານຮ່ວມພັດທະນາ)</option>
                        <option value="Cash">ເງິນສົດ (Cash at Showroom/Bank)</option>
                        <option value="Bank Transfer">ໂອນຜ່ານທະນາຄານອື່ນໆ (Bank Transfer)</option>
                      </select>
                    </div>
                  </div>

                  {/* Upload slip */}
                  <div>
                    <label className="block text-xs text-slate-700 font-medium mb-1">
                      {activeLanguage === 'lo' ? 'ຮູບສະລິບຫຼັກຖານການໂອນເງິນຕັດຍອດ (Optional)' : 'Payment Slip (Optional)'}
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 shadow-2xs transition-colors">
                        <Upload className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{activeLanguage === 'lo' ? 'ເລືອກຮູບສະລິບ...' : 'Choose Slip Image...'}</span>
                        <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                      </label>
                      {slipImage && (
                        <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{activeLanguage === 'lo' ? 'ອັບໂຫຼດຮູບແລ້ວ' : 'Slip loaded'}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-700 font-medium mb-1">
                      {activeLanguage === 'lo' ? 'ໝາຍເຫດການຕັດຍອດ' : 'Settlement Note'}
                    </label>
                    <input
                      type="text"
                      value={settlementNote}
                      onChange={(e) => setSettlementNote(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-2xs"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      id="btn-confirm-settlement-final"
                      onClick={handleExecuteSettlement}
                      className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{activeLanguage === 'lo' ? 'ຢັ້ງຢືນການຕັດຍອດປິດສັນຍາ (Confirm & Settle Loan)' : 'Confirm & Settle Loan'}</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
