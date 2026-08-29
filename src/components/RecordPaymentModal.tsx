import React, { useState, useEffect } from 'react';
import { 
  X, 
  Receipt, 
  CheckCircle2, 
  Calendar, 
  CreditCard, 
  Upload, 
  Trash2, 
  Check, 
  AlertCircle,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { InstallmentItem, LoanContract } from '../types';
import { formatCurrency, formatDateLao } from '../services/loanCalculator';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: LoanContract;
  item: InstallmentItem | null;
  onSavePayment: (period: number, paymentData: {
    status: 'paid' | 'pending';
    paidDate?: string;
    paidAmount?: number;
    paymentMethod?: string;
    receiptNote?: string;
    slipImage?: string;
  }) => void;
  activeLanguage: 'lo' | 'en';
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  contract,
  item,
  onSavePayment,
  activeLanguage,
}) => {
  if (!isOpen || !item) return null;

  const [paidDate, setPaidDate] = useState<string>(
    item.paidDate || new Date().toISOString().split('T')[0]
  );
  const [paidAmount, setPaidAmount] = useState<number>(
    item.paidAmount || item.installmentAmount
  );
  const [paymentMethod, setPaymentMethod] = useState<string>(
    item.paymentMethod || 'BCEL One'
  );
  const [receiptNote, setReceiptNote] = useState<string>(
    item.receiptNote || ''
  );
  const [slipImage, setSlipImage] = useState<string | undefined>(item.slipImage);
  const [isMarkingPaid, setIsMarkingPaid] = useState<boolean>(
    item.status === 'paid' ? true : true
  );

  useEffect(() => {
    if (item) {
      setPaidDate(item.paidDate || new Date().toISOString().split('T')[0]);
      setPaidAmount(item.paidAmount || item.installmentAmount);
      setPaymentMethod(item.paymentMethod || 'BCEL One');
      setReceiptNote(item.receiptNote || '');
      setSlipImage(item.slipImage);
      setIsMarkingPaid(item.status === 'paid' ? true : true);
    }
  }, [item]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSlipImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isMarkingPaid) {
      // Trigger festive celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (err) {
        // Safe fallback
      }

      onSavePayment(item.period, {
        status: 'paid',
        paidDate,
        paidAmount: Number(paidAmount),
        paymentMethod,
        receiptNote,
        slipImage,
      });
    } else {
      onSavePayment(item.period, {
        status: 'pending',
        paidDate: undefined,
        paidAmount: undefined,
        paymentMethod: undefined,
        receiptNote: undefined,
        slipImage: undefined,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden my-6 text-slate-900">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-2xs">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {activeLanguage === 'lo' ? `ບັນທຶກການຊຳລະຄ່າງວດ ງວດທີ ${item.period}` : `Record Payment - Period #${item.period}`}
              </h3>
              <p className="text-xs text-slate-500">
                {contract.carName} • {contract.storeName}
              </p>
            </div>
          </div>
          <button
            id="btn-close-payment-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Installment Summary Pill */}
        <div className="px-6 py-3 bg-slate-50/50 border-b border-slate-200 flex flex-wrap items-center justify-between text-xs gap-2">
          <div>
            <span className="text-slate-500 block">{activeLanguage === 'lo' ? 'ວັນທີຄົບກຳນົດ:' : 'Due Date:'}</span>
            <span className="font-semibold text-slate-900">{formatDateLao(item.dueDate)}</span>
          </div>
          <div>
            <span className="text-slate-500 block">{activeLanguage === 'lo' ? 'ຄ່າງວດປົກກະຕິ:' : 'Installment:'}</span>
            <span className="font-bold text-blue-700">{formatCurrency(item.installmentAmount, contract.currency)}</span>
          </div>
          <div>
            <span className="text-slate-500 block">{activeLanguage === 'lo' ? 'ເງິນຕົ້ນ / ດອກເບ້ຍ:' : 'Principal / Interest:'}</span>
            <span className="text-slate-700">
              {formatCurrency(item.principalAmount, contract.currency)} / {formatCurrency(item.interestAmount, contract.currency)}
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Status Mode Toggle */}
          <div className="flex items-center justify-between bg-slate-100 p-1.5 rounded-xl border border-slate-200 gap-1.5">
            <button
              type="button"
              onClick={() => setIsMarkingPaid(true)}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                isMarkingPaid
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{activeLanguage === 'lo' ? 'ຊຳລະແລ້ວ (Mark as Paid)' : 'Paid'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsMarkingPaid(false)}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                !isMarkingPaid
                  ? 'bg-white text-slate-900 border border-slate-300 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>{activeLanguage === 'lo' ? 'ຍັງບໍ່ທັນຈ່າຍ (Pending)' : 'Unpaid'}</span>
            </button>
          </div>

          {isMarkingPaid && (
            <>
              {/* Payment Date & Amount */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-700 font-medium mb-1">
                    {activeLanguage === 'lo' ? 'ວັນທີຊຳລະຈິງ' : 'Payment Date'}
                  </label>
                  <input
                    id="input-paid-date"
                    type="date"
                    required
                    value={paidDate}
                    onChange={(e) => setPaidDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-700 font-medium mb-1">
                    {activeLanguage === 'lo' ? 'ຈຳນວນເງິນທີ່ຈ່າຍ' : 'Amount Paid'}
                  </label>
                  <input
                    id="input-paid-amount"
                    type="number"
                    required
                    min="0"
                    step="1"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-xs text-slate-700 font-medium mb-1">
                  {activeLanguage === 'lo' ? 'ຊ່ອງທາງການຊຳລະເງິນ' : 'Payment Method'}
                </label>
                <select
                  id="select-payment-method"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
                >
                  <option value="BCEL One">BCEL One (ໂອນຜ່ານແອັບ BCEL)</option>
                  <option value="LDB Trust">LDB Trust (ທະນາຄານພັດທະນາລາວ)</option>
                  <option value="JDB Yes">JDB Yes (ທະນາຄານຮ່ວມພັດທະນາ)</option>
                  <option value="APB Online">APB Online (ທະນາຄານສົ່ງເສີມກະສິກຳ)</option>
                  <option value="Cash">ເງິນສົດ (Cash at Showroom)</option>
                  <option value="Bank Transfer">ໂອນເງິນເຂົ້າບັນຊີທະນາຄານ</option>
                  <option value="Other">ອື່ນໆ (Other)</option>
                </select>
              </div>

              {/* Transaction Ref / Receipt Note */}
              <div>
                <label className="block text-xs text-slate-700 font-medium mb-1">
                  {activeLanguage === 'lo' ? 'ເລກອ້າງອີງ / ໝາຍເຫດໃບບິນ' : 'Reference / Receipt Note'}
                </label>
                <input
                  id="input-receipt-note"
                  type="text"
                  placeholder={activeLanguage === 'lo' ? 'e.g. TXN998822 ຫຼື ໃບບິນເລກທີ...' : 'e.g. TXN-123456...'}
                  value={receiptNote}
                  onChange={(e) => setReceiptNote(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
                />
              </div>

              {/* Slip Image Attachment */}
              <div>
                <label className="block text-xs text-slate-700 font-medium mb-1">
                  {activeLanguage === 'lo' ? 'ຮູບສະລິບໃບບິນ / ຫຼັກຖານການໂອນ' : 'Payment Slip / Receipt Image'}
                </label>

                {slipImage ? (
                  <div className="relative rounded-xl border border-emerald-300 p-2.5 bg-emerald-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={slipImage}
                        alt="Slip preview"
                        className="w-12 h-12 object-cover rounded-lg border border-emerald-200"
                      />
                      <span className="text-xs text-emerald-800 font-semibold">
                        {activeLanguage === 'lo' ? 'ແນບຮູບສະລິບແລ້ວ' : 'Slip attached'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSlipImage(undefined)}
                      className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Remove image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer bg-slate-50 hover:bg-blue-50/30 transition-colors group">
                    <Upload className="w-6 h-6 text-slate-400 group-hover:text-blue-600 mb-1" />
                    <span className="text-xs text-slate-700 font-medium group-hover:text-blue-700">
                      {activeLanguage === 'lo' ? 'ກົດເພື່ອອັບໂຫຼດຮູບສະລິບ' : 'Click or drop payment slip image'}
                    </span>
                    <span className="text-[10px] text-slate-400">PNG, JPG, JPEG (Max 5MB)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            >
              {activeLanguage === 'lo' ? 'ຍົກເລີກ' : 'Cancel'}
            </button>

            <button
              id="btn-save-payment-submit"
              type="submit"
              className="px-5 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{activeLanguage === 'lo' ? 'ບັນທຶກການຊຳລະ' : 'Save Payment'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
