/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { 
  Car, 
  Calculator, 
  Plus, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  Trash2, 
  Edit3, 
  ExternalLink,
  ShieldAlert,
  Sparkles,
  Info
} from 'lucide-react';
import { Header } from './components/Header';
import { DashboardStats } from './components/DashboardStats';
import { PaymentScheduleTable } from './components/PaymentScheduleTable';
import { VKLoanCalculatorModal } from './components/VKLoanCalculatorModal';
import { RecordPaymentModal } from './components/RecordPaymentModal';
import { GoogleSheetsSyncModal } from './components/GoogleSheetsSyncModal';
import { StoreManagerModal } from './components/StoreManagerModal';
import { SlipViewerModal } from './components/SlipViewerModal';
import { AuthHelpModal } from './components/AuthHelpModal';

import { LoanContract, Store, InstallmentItem, VehicleType, Currency } from './types';
import { 
  loadContracts, 
  saveContracts, 
  loadStores, 
  saveStores, 
  getSelectedContractId, 
  setSelectedContractId,
  getInitialSampleContract
} from './services/storage';
import { 
  calculateLoanParameters, 
  generateInstallmentSchedule, 
  refreshScheduleStatuses,
  recalculateAndMergeContract,
  formatCurrency
} from './services/loanCalculator';
import { 
  initAuth, 
  signInWithGoogle, 
  logOutGoogle, 
  getAccessToken,
  formatAuthError
} from './services/firebaseAuth';
import { 
  exportContractToGoogleSheets, 
  syncScheduleToGoogleSheet 
} from './services/googleSheets';

export default function App() {
  // Core Application States
  const [contracts, setContracts] = useState<LoanContract[]>([]);
  const [selectedContractIdState, setSelectedContractIdState] = useState<string>('');
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStoreFilter, setSelectedStoreFilter] = useState<string>('all');
  const [activeLanguage, setActiveLanguage] = useState<'lo' | 'en'>('lo');

  // Auth & Sync States
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSyncingSheets, setIsSyncingSheets] = useState(false);
  const [syncSuccessUrl, setSyncSuccessUrl] = useState<string | undefined>(undefined);

  // Modal States
  const [isCalcModalOpen, setIsCalcModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<LoanContract | null>(null);
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState(false);
  const [isStoreManagerOpen, setIsStoreManagerOpen] = useState(false);
  const [recordingPaymentItem, setRecordingPaymentItem] = useState<InstallmentItem | null>(null);
  const [viewingSlipItem, setViewingSlipItem] = useState<InstallmentItem | null>(null);
  const [deleteConfirmContract, setDeleteConfirmContract] = useState<LoanContract | null>(null);

  // Auth error & Domain help modal state
  const [isAuthHelpModalOpen, setIsAuthHelpModalOpen] = useState(false);
  const [authErrorCode, setAuthErrorCode] = useState('');
  const [authErrorMessage, setAuthErrorMessage] = useState('');

  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // 1. Initial Data Loading
  useEffect(() => {
    const loadedContracts = loadContracts();
    const loadedStores = loadStores();
    setContracts(loadedContracts);
    setStores(loadedStores);

    const savedId = getSelectedContractId();
    if (savedId && loadedContracts.some((c) => c.id === savedId)) {
      setSelectedContractIdState(savedId);
    } else if (loadedContracts.length > 0) {
      setSelectedContractIdState(loadedContracts[0].id);
      setSelectedContractId(loadedContracts[0].id);
    }

    // Initialize Auth state listener
    initAuth(
      (authenticatedUser, token) => {
        setUser(authenticatedUser);
        setAccessToken(token);
      },
      () => {
        setUser(null);
        setAccessToken(null);
      }
    );
  }, []);

  // Sync contracts to storage when changed
  const updateContracts = (newContracts: LoanContract[]) => {
    setContracts(newContracts);
    saveContracts(newContracts);
  };

  // Selected Active Contract
  const selectedContract = contracts.find((c) => c.id === selectedContractIdState) || contracts[0] || null;

  const handleSelectContract = (contract: LoanContract) => {
    setSelectedContractIdState(contract.id);
    setSelectedContractId(contract.id);
  };

  // Auth Handlers
  const handleSignIn = async () => {
    setIsLoggingIn(true);
    try {
      const res = await signInWithGoogle();
      if (res) {
        setUser(res.user);
        setAccessToken(res.accessToken);
        showToast(
          activeLanguage === 'lo' 
            ? `ຍິນດີຕ້ອນຮັບ ${res.user.displayName || res.user.email}!` 
            : `Welcome ${res.user.displayName || res.user.email}!`
        );
      }
    } catch (err: any) {
      console.error('Sign in failure:', err);
      const { message, isDomainError, code } = formatAuthError(err, activeLanguage);
      setAuthErrorCode(code);
      setAuthErrorMessage(message);

      if (isDomainError) {
        setIsAuthHelpModalOpen(true);
      } else {
        showToast(message, 'error');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = async () => {
    await logOutGoogle();
    setUser(null);
    setAccessToken(null);
    showToast(activeLanguage === 'lo' ? 'ອອກຈາກລະບົບແລ້ວ' : 'Signed out successfully', 'info');
  };

  // Google Sheets Export & Sync
  const handleSyncToSheets = async () => {
    if (!selectedContract) return;

    let token = accessToken || await getAccessToken();
    if (!token || !user) {
      setIsSheetsModalOpen(true);
      showToast(
        activeLanguage === 'lo' 
          ? 'ກະລຸນາເຂົ້າສູ່ລະບົບດ້ວຍ Google ເພື່ອເຊື່ອມຕໍ່ Google Sheets' 
          : 'Please sign in with Google to sync with Sheets',
        'info'
      );
      return;
    }

    setIsSyncingSheets(true);
    try {
      const { spreadsheetId, spreadsheetUrl } = await exportContractToGoogleSheets(selectedContract, token);
      
      const updated = contracts.map((c) => {
        if (c.id === selectedContract.id) {
          return {
            ...c,
            spreadsheetId,
            spreadsheetUrl,
            lastSyncedAt: new Date().toISOString(),
          };
        }
        return c;
      });

      updateContracts(updated);
      setSyncSuccessUrl(spreadsheetUrl);
      showToast(
        activeLanguage === 'lo'
          ? 'ສົ່ງອອກ ແລະ ສ້າງ Google Sheet ສຳເລັດແລ້ວ!'
          : 'Spreadsheet created and synced to Google Sheets!',
        'success'
      );
    } catch (err: any) {
      console.error('Sync failed:', err);
      showToast(
        activeLanguage === 'lo'
          ? `ການເຊື່ອມຕໍ່ Google Sheet ຂັດຂ້ອງ: ${err.message || ''}`
          : `Sync error: ${err.message}`,
        'error'
      );
    } finally {
      setIsSyncingSheets(false);
    }
  };

  // Record or Update Payment
  const handleSavePayment = async (
    period: number,
    paymentData: {
      status: 'paid' | 'pending';
      paidDate?: string;
      paidAmount?: number;
      paymentMethod?: string;
      receiptNote?: string;
      slipImage?: string;
    }
  ) => {
    if (!selectedContract) return;

    const updatedSchedule = selectedContract.schedule.map((item) => {
      if (item.period === period) {
        return {
          ...item,
          ...paymentData,
        };
      }
      return item;
    });

    const refreshed = refreshScheduleStatuses(updatedSchedule);

    const updatedContract: LoanContract = {
      ...selectedContract,
      schedule: refreshed,
      updatedAt: new Date().toISOString(),
    };

    const newContracts = contracts.map((c) => (c.id === selectedContract.id ? updatedContract : c));
    updateContracts(newContracts);

    showToast(
      paymentData.status === 'paid'
        ? (activeLanguage === 'lo' ? `ບັນທຶກການຊຳລະງວດທີ ${period} ສຳເລັດແລ້ວ!` : `Period #${period} marked as Paid!`)
        : (activeLanguage === 'lo' ? `ອັບເດດງວດທີ ${period} ເປັນລໍຖ້າຊຳລະແລ້ວ` : `Period #${period} marked as Pending`),
      'success'
    );

    // If already connected to Google Sheets, auto-sync the change
    if (selectedContract.spreadsheetId && accessToken) {
      try {
        await syncScheduleToGoogleSheet(selectedContract.spreadsheetId, updatedContract, accessToken);
      } catch (e) {
        console.warn('Auto-sync to Google Sheet failed in background:', e);
      }
    }
  };

  // Open New Contract Modal
  const handleOpenNewContract = () => {
    setEditingContract(null);
    setIsCalcModalOpen(true);
  };

  // Open Edit Contract Modal
  const handleOpenEditContract = (contract?: LoanContract | null) => {
    const target = contract || selectedContract;
    if (target) {
      setEditingContract(target);
      setIsCalcModalOpen(true);
    }
  };

  // Create or Update Contract from Calculator
  const handleSaveAsContract = async (
    params: {
      carName: string;
      licensePlate?: string;
      storeName: string;
      storePhone?: string;
      vehicleType: VehicleType | string;
      totalPrice: number;
      downPaymentPercent: number;
      monthlyInterestRatePercent: number;
      termMonths: number;
      currency: Currency;
      startDate: string;
      dueDayOfMonth: number;
      notes?: string;
    },
    contractIdToUpdate?: string
  ) => {
    // Auto-save store to list if new
    if (!stores.some((s) => s.name.toLowerCase() === params.storeName.toLowerCase())) {
      const newStore: Store = {
        id: `store_${Date.now()}`,
        name: params.storeName,
        phone: params.storePhone,
      };
      const newStoreList = [...stores, newStore];
      setStores(newStoreList);
      saveStores(newStoreList);
    }

    if (contractIdToUpdate) {
      const existing = contracts.find((c) => c.id === contractIdToUpdate);
      if (existing) {
        const updatedContract = recalculateAndMergeContract(existing, params);
        const updatedContracts = contracts.map((c) => (c.id === contractIdToUpdate ? updatedContract : c));
        updateContracts(updatedContracts);
        setSelectedContractIdState(updatedContract.id);
        setSelectedContractId(updatedContract.id);
        setEditingContract(null);

        showToast(
          activeLanguage === 'lo'
            ? `ແກ້ໄຂສັນຍາ ${updatedContract.carName} ສຳເລັດແລ້ວ! (ປ່ຽນເປັນ ${updatedContract.termMonths} ເດືອນ)`
            : `Updated ${updatedContract.carName} successfully (${updatedContract.termMonths} months)!`,
          'success'
        );

        // If synced with Google Sheets, automatically sync updated schedule in background
        if (updatedContract.spreadsheetId && accessToken) {
          try {
            await syncScheduleToGoogleSheet(updatedContract.spreadsheetId, updatedContract, accessToken);
          } catch (e) {
            console.warn('Auto-sync to Google Sheet failed after contract edit:', e);
          }
        }
        return;
      }
    }

    // Creating new contract
    const calc = calculateLoanParameters(
      params.totalPrice,
      params.downPaymentPercent,
      params.monthlyInterestRatePercent,
      params.termMonths
    );

    const schedule = generateInstallmentSchedule(
      calc.loanAmount,
      calc.monthlyInterest,
      params.termMonths,
      params.startDate,
      params.dueDayOfMonth
    );

    const newContract: LoanContract = {
      id: `contract_${Date.now()}`,
      carName: params.carName,
      licensePlate: params.licensePlate,
      storeName: params.storeName,
      storePhone: params.storePhone,
      vehicleType: params.vehicleType,
      totalPrice: params.totalPrice,
      downPaymentPercent: params.downPaymentPercent,
      downPaymentAmount: calc.downPaymentAmount,
      loanAmount: calc.loanAmount,
      monthlyInterestRate: calc.monthlyInterestRate,
      termMonths: params.termMonths,
      monthlyInstallment: calc.monthlyInstallment,
      monthlyInterest: calc.monthlyInterest,
      monthlyPrincipal: calc.monthlyPrincipal,
      totalInterest: calc.totalInterest,
      totalLoanPayment: calc.totalLoanPayment,
      startDate: params.startDate,
      dueDayOfMonth: params.dueDayOfMonth,
      currency: params.currency,
      notes: params.notes,
      schedule,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newContractsList = [newContract, ...contracts];
    updateContracts(newContractsList);
    setSelectedContractIdState(newContract.id);
    setSelectedContractId(newContract.id);
    setEditingContract(null);

    showToast(
      activeLanguage === 'lo'
        ? `ສ້າງສັນຍາ ${newContract.carName} ສຳເລັດແລ້ວ!`
        : `Created contract for ${newContract.carName}!`,
      'success'
    );
  };

  // Delete Contract Handler with Confirmation Dialog
  const handleDeleteContract = (contract: LoanContract) => {
    const updated = contracts.filter((c) => c.id !== contract.id);
    updateContracts(updated);
    if (updated.length > 0) {
      setSelectedContractIdState(updated[0].id);
      setSelectedContractId(updated[0].id);
    } else {
      const sample = getInitialSampleContract();
      updateContracts([sample]);
      setSelectedContractIdState(sample.id);
    }
    setDeleteConfirmContract(null);
    showToast(activeLanguage === 'lo' ? 'ລຶບສັນຍາອອກແລ້ວ' : 'Contract deleted', 'info');
  };

  // Add / Delete Store Handlers
  const handleAddStore = (newStore: Store) => {
    const updated = [...stores, newStore];
    setStores(updated);
    saveStores(updated);
    showToast(activeLanguage === 'lo' ? `ເພີ່ມຮ້ານ ${newStore.name} ແລ້ວ` : `Added ${newStore.name}`);
  };

  const handleDeleteStore = (storeId: string) => {
    const updated = stores.filter((s) => s.id !== storeId);
    setStores(updated);
    saveStores(updated);
    showToast(activeLanguage === 'lo' ? 'ລຶບຮ້ານຄ້າແລ້ວ' : 'Store deleted');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className={`px-4 py-3 rounded-xl shadow-2xl border text-xs font-bold flex items-center gap-2.5 ${
            toast.type === 'success' 
              ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-900/10' 
              : toast.type === 'error'
              ? 'bg-red-600 text-white border-red-500 shadow-red-900/10'
              : 'bg-slate-900 text-white border-slate-700'
          }`}>
            <Sparkles className="w-4 h-4 flex-shrink-0 text-emerald-300" />
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Main Header */}
      <Header
        contracts={contracts}
        selectedContract={selectedContract}
        onSelectContract={handleSelectContract}
        stores={stores}
        selectedStoreFilter={selectedStoreFilter}
        onSelectStoreFilter={setSelectedStoreFilter}
        onOpenCalculator={handleOpenNewContract}
        onOpenNewContract={handleOpenNewContract}
        onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
        onOpenStoreManager={() => setIsStoreManagerOpen(true)}
        user={user}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        isLoggingIn={isLoggingIn}
        activeLanguage={activeLanguage}
        onToggleLanguage={() => setActiveLanguage(activeLanguage === 'lo' ? 'en' : 'lo')}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {selectedContract ? (
          <>
            {/* Action Bar for Active Contract */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 font-medium">{activeLanguage === 'lo' ? 'ສັນຍາປັດຈຸບັນ:' : 'Current Contract:'}</span>
                <span className="font-bold text-blue-700">{selectedContract.carName}</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-600 font-medium">{selectedContract.storeName}</span>
                {selectedContract.spreadsheetId && (
                  <a
                    href={selectedContract.spreadsheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md hover:bg-emerald-100 ml-2 transition-colors cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Google Sheets</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="btn-edit-contract-actionbar"
                  onClick={() => handleOpenEditContract(selectedContract)}
                  className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                  title="Edit contract details"
                >
                  <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                  <span>{activeLanguage === 'lo' ? 'ແກ້ໄຂສັນຍາ' : 'Edit Contract'}</span>
                </button>

                <button
                  id="btn-sync-sheets-main"
                  onClick={handleSyncToSheets}
                  disabled={isSyncingSheets}
                  className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isSyncingSheets ? (activeLanguage === 'lo' ? 'ກຳລັງຊິງຄ໌...' : 'Syncing...') : (activeLanguage === 'lo' ? 'ຊິງຄ໌ Google Sheets' : 'Sync to Sheets')}</span>
                </button>

                <button
                  id="btn-delete-contract-trigger"
                  onClick={() => setDeleteConfirmContract(selectedContract)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  title="Delete this contract"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Dashboard Stats */}
            <DashboardStats
              contract={selectedContract}
              onRecordPayment={(item) => setRecordingPaymentItem(item)}
              onEditContract={() => handleOpenEditContract(selectedContract)}
              activeLanguage={activeLanguage}
            />

            {/* Detailed Installment Schedule & Ledger Table */}
            <PaymentScheduleTable
              contract={selectedContract}
              onRecordPayment={(item) => setRecordingPaymentItem(item)}
              onViewSlip={(item) => setViewingSlipItem(item)}
              onSyncGoogleSheets={handleSyncToSheets}
              onEditContract={() => handleOpenEditContract(selectedContract)}
              isSyncing={isSyncingSheets}
              activeLanguage={activeLanguage}
            />
          </>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 space-y-4 shadow-2xs">
            <Car className="w-12 h-12 text-blue-600 mx-auto opacity-80" />
            <h3 className="text-lg font-bold text-slate-900">
              {activeLanguage === 'lo' ? 'ຍັງບໍ່ມີສັນຍາຜ່ອນລົດ' : 'No active loan contracts'}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {activeLanguage === 'lo' 
                ? 'ກົດປຸ່ມດ້ານລຸ່ມເພື່ອຄິດໄລ່ດອກເບ້ຍ ແລະ ສ້າງສັນຍາຜ່ອນລົດໃໝ່ຂອງທ່ານ' 
                : 'Click below to calculate and add your auto loan'}
            </p>
            <button
              onClick={handleOpenNewContract}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs inline-flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{activeLanguage === 'lo' ? 'ຄິດໄລ່ & ເພີ່ມສັນຍາໃໝ່' : 'Add New Loan'}</span>
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="font-medium text-slate-700">
            AutoLoan Lao — ລະບົບຕິດຕາມການຜ່ອນລົດ, ຄິດໄລ່ດອກເບ້ຍສະສົມ & ເຊື່ອມຕໍ່ Google Sheets
          </p>
          <p className="text-[11px] text-slate-400">
            ຮອງຮັບຫຼາຍໂຊຣູມ/ຮ້ານຄ້າ • ບັນທຶກປະຫວັດການຊຳລະ • ອັດຕະໂນມັດດ້ວຍ Google Apps Script
          </p>
        </div>
      </footer>

      {/* Modals */}
      <VKLoanCalculatorModal
        isOpen={isCalcModalOpen}
        onClose={() => {
          setIsCalcModalOpen(false);
          setEditingContract(null);
        }}
        contractToEdit={editingContract}
        stores={stores}
        onSaveAsContract={handleSaveAsContract}
        activeLanguage={activeLanguage}
      />

      <RecordPaymentModal
        isOpen={!!recordingPaymentItem}
        onClose={() => setRecordingPaymentItem(null)}
        contract={selectedContract || contracts[0]}
        item={recordingPaymentItem}
        onSavePayment={handleSavePayment}
        activeLanguage={activeLanguage}
      />

      <GoogleSheetsSyncModal
        isOpen={isSheetsModalOpen}
        onClose={() => setIsSheetsModalOpen(false)}
        contract={selectedContract || contracts[0]}
        user={user}
        onSignIn={handleSignIn}
        onSync={handleSyncToSheets}
        onOpenAuthHelp={() => setIsAuthHelpModalOpen(true)}
        isSyncing={isSyncingSheets}
        syncSuccessUrl={syncSuccessUrl}
        activeLanguage={activeLanguage}
      />

      <AuthHelpModal
        isOpen={isAuthHelpModalOpen}
        onClose={() => setIsAuthHelpModalOpen(false)}
        errorCode={authErrorCode}
        errorMessage={authErrorMessage}
        activeLanguage={activeLanguage}
      />

      <StoreManagerModal
        isOpen={isStoreManagerOpen}
        onClose={() => setIsStoreManagerOpen(false)}
        stores={stores}
        onAddStore={handleAddStore}
        onDeleteStore={handleDeleteStore}
        activeLanguage={activeLanguage}
      />

      <SlipViewerModal
        isOpen={!!viewingSlipItem}
        onClose={() => setViewingSlipItem(null)}
        item={viewingSlipItem}
        contract={selectedContract || contracts[0]}
        activeLanguage={activeLanguage}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirmContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 w-full max-w-sm rounded-2xl p-6 text-slate-900 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  {activeLanguage === 'lo' ? 'ຢືນຢັນການລຶບສັນຍາ?' : 'Delete Contract?'}
                </h3>
                <span className="text-xs text-slate-400">
                  {deleteConfirmContract.carName}
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {activeLanguage === 'lo'
                ? `ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບສັນຍາ "${deleteConfirmContract.carName}" (${deleteConfirmContract.storeName})? ຂໍ້ມູນປະຫວັດການຊຳລະທັງໝົດຈະຖືກລຶບ.`
                : `Are you sure you want to delete "${deleteConfirmContract.carName}" (${deleteConfirmContract.storeName})? All payment records will be removed.`}
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setDeleteConfirmContract(null)}
                className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                {activeLanguage === 'lo' ? 'ຍົກເລີກ' : 'Cancel'}
              </button>
              <button
                id="btn-confirm-delete-contract"
                onClick={() => handleDeleteContract(deleteConfirmContract)}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-xs transition-colors cursor-pointer"
              >
                {activeLanguage === 'lo' ? 'ລຶບສັນຍາ' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
