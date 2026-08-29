import React from 'react';
import { 
  Car, 
  Calculator, 
  Plus, 
  FileSpreadsheet, 
  Store as StoreIcon, 
  Calendar, 
  CheckCircle2, 
  LogIn, 
  LogOut,
  AlertCircle
} from 'lucide-react';
import { LoanContract, Store } from '../types';
import { User } from 'firebase/auth';

interface HeaderProps {
  contracts: LoanContract[];
  selectedContract: LoanContract | null;
  onSelectContract: (contract: LoanContract) => void;
  stores: Store[];
  selectedStoreFilter: string;
  onSelectStoreFilter: (storeName: string) => void;
  onOpenCalculator: () => void;
  onOpenNewContract: () => void;
  onOpenSheetsModal: () => void;
  onOpenStoreManager: () => void;
  user: User | null;
  onSignIn: () => void;
  onSignOut: () => void;
  isLoggingIn: boolean;
  activeLanguage: 'lo' | 'en';
  onToggleLanguage: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  contracts,
  selectedContract,
  onSelectContract,
  stores,
  selectedStoreFilter,
  onSelectStoreFilter,
  onOpenCalculator,
  onOpenNewContract,
  onOpenSheetsModal,
  onOpenStoreManager,
  user,
  onSignIn,
  onSignOut,
  isLoggingIn,
  activeLanguage,
  onToggleLanguage,
}) => {
  const filteredContracts = selectedStoreFilter === 'all'
    ? contracts
    : contracts.filter((c) => c.storeName.toLowerCase().includes(selectedStoreFilter.toLowerCase()));

  return (
    <header className="bg-white text-slate-900 border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* Top utility row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-600/20 text-white font-black">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-slate-900">AutoLoan Lao</span>
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {activeLanguage === 'lo' ? 'ຕິດຕາມຜ່ອນລົດ' : 'Car Loan Tracker'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {activeLanguage === 'lo' ? 'ຄິດໄລ່ດອກເບ້ຍສະສົມ & ເຊື່ອມຕໍ່ Google Sheets' : 'Interest Amortization & Google Sheets'}
              </p>
            </div>
          </div>

          {/* Quick Actions & Auth */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* VK Calculator button */}
            <button
              id="btn-open-calculator"
              onClick={onOpenCalculator}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <Calculator className="w-4 h-4" />
              <span>{activeLanguage === 'lo' ? 'ຄິດໄລ່ດອກເບ້ຍ' : 'Loan Calculator'}</span>
            </button>

            {/* Google Sheets Sync button */}
            <button
              id="btn-open-sheets-modal"
              onClick={onOpenSheetsModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-100" />
              <span className="hidden sm:inline">Google Sheets</span>
              {selectedContract?.spreadsheetId && (
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
              )}
            </button>

            {/* Google Auth status */}
            {user ? (
              <div className="flex items-center gap-2 bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs text-slate-700 font-medium hidden md:inline max-w-[120px] truncate">
                  {user.displayName || user.email}
                </span>
                <button
                  id="btn-google-signout"
                  onClick={onSignOut}
                  title="Sign out"
                  className="p-1 hover:text-red-600 text-slate-400 hover:bg-slate-200/60 rounded transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                id="btn-google-signin"
                onClick={onSignIn}
                disabled={isLoggingIn}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 transition-colors shadow-2xs cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden md:inline">{isLoggingIn ? 'Logging in...' : 'Sign in'}</span>
              </button>
            )}

            {/* Language toggle */}
            <button
              id="btn-toggle-language"
              onClick={onToggleLanguage}
              className="px-2.5 py-1.5 text-xs font-bold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 cursor-pointer transition-colors"
              title="Toggle Language"
            >
              {activeLanguage === 'lo' ? 'ລາວ 🇱🇦' : 'EN 🇺🇸'}
            </button>
          </div>
        </div>
      </div>

      {/* Second row: Store filter & Active Car switcher */}
      <div className="bg-slate-50 border-t border-slate-200 px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Store Filter Selector */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <span className="text-xs font-semibold text-slate-600 flex items-center gap-1 flex-shrink-0">
              <StoreIcon className="w-3.5 h-3.5 text-blue-600" />
              {activeLanguage === 'lo' ? 'ໂຊຣູມ/ຮ້ານຄ້າ:' : 'Store:'}
            </span>
            <select
              id="select-store-filter"
              value={selectedStoreFilter}
              onChange={(e) => onSelectStoreFilter(e.target.value)}
              className="bg-white border border-slate-300 text-xs font-medium text-slate-800 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none shadow-2xs"
            >
              <option value="all">{activeLanguage === 'lo' ? 'ທຸກໂຊຣູມ / ຮ້ານຄ້າ (All Stores)' : 'All Dealerships'}</option>
              {stores.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>

            <button
              id="btn-manage-stores"
              onClick={onOpenStoreManager}
              className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 underline underline-offset-2 ml-1 flex-shrink-0 cursor-pointer"
            >
              {activeLanguage === 'lo' ? '+ ຈັດການຮ້ານຄ້າ' : 'Manage Stores'}
            </button>
          </div>

          {/* Active Car selector & Add new car button */}
          <div className="flex items-center gap-2 ml-auto">
            {filteredContracts.length > 0 ? (
              <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-xs text-slate-500 px-2 font-medium">
                  {activeLanguage === 'lo' ? 'ສັນຍາລົດ:' : 'Active Car:'}
                </span>
                <select
                  id="select-active-car"
                  value={selectedContract?.id || ''}
                  onChange={(e) => {
                    const found = contracts.find((c) => c.id === e.target.value);
                    if (found) onSelectContract(found);
                  }}
                  className="bg-slate-50 border border-slate-200 text-xs font-semibold text-blue-700 rounded-lg px-2.5 py-1 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none max-w-[180px] sm:max-w-xs truncate"
                >
                  {filteredContracts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.carName} • {c.storeName}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <span className="text-xs text-amber-600 font-medium italic">
                {activeLanguage === 'lo' ? 'ບໍ່ມີສັນຍາໃນຮ້ານນີ້' : 'No contracts for this store'}
              </span>
            )}

            <button
              id="btn-create-new-contract"
              onClick={onOpenNewContract}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{activeLanguage === 'lo' ? 'ເພີ່ມສັນຍາໃໝ່' : 'New Loan'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
