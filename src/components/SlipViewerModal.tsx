import React from 'react';
import { X, Receipt, Download, Calendar, DollarSign } from 'lucide-react';
import { InstallmentItem, LoanContract } from '../types';
import { formatCurrency, formatDateLao } from '../services/loanCalculator';

interface SlipViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InstallmentItem | null;
  contract: LoanContract;
  activeLanguage: 'lo' | 'en';
}

export const SlipViewerModal: React.FC<SlipViewerModalProps> = ({
  isOpen,
  onClose,
  item,
  contract,
  activeLanguage,
}) => {
  if (!isOpen || !item || !item.slipImage) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden my-6 text-slate-900 flex flex-col">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Receipt className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">
              {activeLanguage === 'lo' ? `ສະລິບການໂອນ - ງວດທີ ${item.period}` : `Payment Slip - Period #${item.period}`}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Slip Image View */}
        <div className="p-4 bg-slate-100 flex flex-col items-center justify-center">
          <img
            src={item.slipImage}
            alt={`Payment Slip Period ${item.period}`}
            className="max-h-[60vh] w-auto object-contain rounded-xl border border-slate-300 shadow-sm"
          />
        </div>

        {/* Details Footer */}
        <div className="p-4 bg-white border-t border-slate-200 space-y-2 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>{activeLanguage === 'lo' ? 'ວັນທີຊຳລະ:' : 'Paid Date:'}</span>
            <span className="font-semibold text-slate-900">{formatDateLao(item.paidDate || item.dueDate)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>{activeLanguage === 'lo' ? 'ຈຳນວນເງິນ:' : 'Amount:'}</span>
            <span className="font-bold text-emerald-600">
              {formatCurrency(item.paidAmount || item.installmentAmount, contract.currency)}
            </span>
          </div>
          {item.paymentMethod && (
            <div className="flex justify-between text-slate-600">
              <span>{activeLanguage === 'lo' ? 'ຊ່ອງທາງ:' : 'Method:'}</span>
              <span className="font-medium text-blue-700">{item.paymentMethod}</span>
            </div>
          )}
          {item.receiptNote && (
            <div className="pt-1 text-slate-500 italic text-[11px]">
              "{item.receiptNote}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
