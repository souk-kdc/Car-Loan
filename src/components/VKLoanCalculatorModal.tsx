import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calculator, 
  Car, 
  Store as StoreIcon, 
  DollarSign, 
  Calendar, 
  Check, 
  FileText, 
  Sparkles, 
  ArrowRight,
  HelpCircle,
  Percent,
  Plus,
  Edit3,
  Save,
  Info
} from 'lucide-react';
import { Currency, Store, VehicleType, LoanContract } from '../types';
import { 
  calculateLoanParameters, 
  generateComparisonMatrix, 
  formatCurrency 
} from '../services/loanCalculator';

interface VKLoanCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  stores: Store[];
  contractToEdit?: LoanContract | null;
  onSaveAsContract: (params: {
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
  }, contractIdToUpdate?: string) => void;
  activeLanguage: 'lo' | 'en';
}

export const VKLoanCalculatorModal: React.FC<VKLoanCalculatorModalProps> = ({
  isOpen,
  onClose,
  stores,
  contractToEdit,
  onSaveAsContract,
  activeLanguage,
}) => {
  if (!isOpen) return null;

  const isEditing = Boolean(contractToEdit);

  // Form states
  const [carName, setCarName] = useState('EV Car (VK group)');
  const [licensePlate, setLicensePlate] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleType>('EV car');
  const [selectedStorePreset, setSelectedStorePreset] = useState(stores[0]?.name || 'VK group showroom');
  const [customStoreName, setCustomStoreName] = useState('');
  const [isCustomStore, setIsCustomStore] = useState(false);
  const [storePhone, setStorePhone] = useState('020 5555 9999');

  const [totalPrice, setTotalPrice] = useState<number>(21800);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(50);
  const [monthlyInterestRatePercent, setMonthlyInterestRatePercent] = useState<number>(0.8);
  const [termMonths, setTermMonths] = useState<number>(24);
  const [currency, setCurrency] = useState<Currency>('USD');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDayOfMonth, setDueDayOfMonth] = useState<number>(15);
  const [notes, setNotes] = useState('ສັນຍາຜ່ອນລົດ ດອກເບ້ຍ 0.8%/ເດືອນ');
  const [activeTab, setActiveTab] = useState<'calculator' | 'matrix' | 'docs'>('calculator');
  const [docCategory, setDocCategory] = useState<'individual' | 'business' | 'company'>('individual');

  // Synchronize form with contractToEdit or defaults when modal opens
  useEffect(() => {
    if (contractToEdit) {
      setCarName(contractToEdit.carName || '');
      setLicensePlate(contractToEdit.licensePlate || '');
      setVehicleType((contractToEdit.vehicleType as VehicleType) || 'EV car');
      const isPreset = stores.some((s) => s.name.toLowerCase() === contractToEdit.storeName.toLowerCase());
      if (isPreset) {
        setSelectedStorePreset(contractToEdit.storeName);
        setIsCustomStore(false);
        setCustomStoreName('');
      } else {
        setIsCustomStore(true);
        setCustomStoreName(contractToEdit.storeName);
      }
      setStorePhone(contractToEdit.storePhone || '');
      setTotalPrice(contractToEdit.totalPrice);
      setDownPaymentPercent(contractToEdit.downPaymentPercent);
      setMonthlyInterestRatePercent(
        contractToEdit.monthlyInterestRate ? Math.round(contractToEdit.monthlyInterestRate * 10000) / 100 : 0.8
      );
      setTermMonths(contractToEdit.termMonths);
      setCurrency(contractToEdit.currency);
      setStartDate(contractToEdit.startDate);
      setDueDayOfMonth(contractToEdit.dueDayOfMonth || 15);
      setNotes(contractToEdit.notes || '');
    } else {
      setCarName('EV Car (VK group)');
      setLicensePlate('');
      setVehicleType('EV car');
      setSelectedStorePreset(stores[0]?.name || 'VK group showroom');
      setCustomStoreName('');
      setIsCustomStore(false);
      setStorePhone('020 5555 9999');
      setTotalPrice(21800);
      setDownPaymentPercent(50);
      setMonthlyInterestRatePercent(0.8);
      setTermMonths(24);
      setCurrency('USD');
      setStartDate(new Date().toISOString().split('T')[0]);
      setDueDayOfMonth(15);
      setNotes('ສັນຍາຜ່ອນລົດ ດອກເບ້ຍ 0.8%/ເດືອນ');
    }
  }, [contractToEdit, stores]);

  const effectiveStoreName = isCustomStore ? (customStoreName || 'ຮ້ານຄ້າທົ່ວໄປ') : selectedStorePreset;

  // Calculated single parameter output
  const calc = calculateLoanParameters(
    totalPrice || 0,
    downPaymentPercent,
    monthlyInterestRatePercent,
    termMonths
  );

  // Comparison matrix
  const matrix = generateComparisonMatrix(totalPrice || 0, monthlyInterestRatePercent);

  const handleCreateContract = () => {
    onSaveAsContract({
      carName: carName || 'My Vehicle',
      licensePlate: licensePlate || undefined,
      storeName: effectiveStoreName,
      storePhone: storePhone || undefined,
      vehicleType,
      totalPrice: Number(totalPrice),
      downPaymentPercent: Number(downPaymentPercent),
      monthlyInterestRatePercent: Number(monthlyInterestRatePercent),
      termMonths: Number(termMonths),
      currency,
      startDate,
      dueDayOfMonth: Number(dueDayOfMonth),
      notes,
    }, contractToEdit ? contractToEdit.id : undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-slate-200 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden my-6 text-slate-900 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-2xs ${
              isEditing 
                ? 'bg-amber-50 border border-amber-200 text-amber-600' 
                : 'bg-blue-50 border border-blue-100 text-blue-600'
            }`}>
              {isEditing ? <Edit3 className="w-5 h-5" /> : <Calculator className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>
                  {isEditing 
                    ? (activeLanguage === 'lo' ? 'ແກ້ໄຂສັນຍາຜ່ອນລົດ' : 'Edit Loan Contract')
                    : (activeLanguage === 'lo' ? 'ໂປຣແກຣມຄິດໄລ່ດອກເບ້ຍ & ຕາຕະລາງຜ່ອນລົດ' : 'Auto Loan & Interest Calculator')}
                </span>
                {isEditing && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200">
                    {contractToEdit?.carName}
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500">
                {isEditing
                  ? (activeLanguage === 'lo' 
                      ? 'ປັບປ່ຽນຈຳນວນເດືອນຜ່ອນ, ລຸ້ນລົດ, ລາຄາ, ດອກເບ້ຍ ແລະ ເງື່ອນໄຂສັນຍາ' 
                      : 'Update loan term (e.g. 36 to 48 months), car model, price, and terms')
                  : (activeLanguage === 'lo' 
                      ? 'ຮອງຮັບຫຼາຍໂຊຣູມ/ຮ້ານຄ້າ, ປັບແຕ່ງລາຄາ ແລະ ເບິ່ງຕາຕະລາງສົມທຽບ' 
                      : 'Supports multiple dealerships, custom prices & comparison matrix')}
              </p>
            </div>
          </div>
          <button
            id="btn-close-calc-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 px-6 pt-2">
          <button
            id="tab-calculator"
            onClick={() => setActiveTab('calculator')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'calculator'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {isEditing ? <Edit3 className="w-4 h-4" /> : <Calculator className="w-4 h-4" />}
            <span>{isEditing ? (activeLanguage === 'lo' ? 'ແກ້ໄຂຂໍ້ມູນສັນຍາ' : 'Contract Editor') : (activeLanguage === 'lo' ? 'ຄິດໄລ່ຄ່າງວດ' : 'Calculator')}</span>
          </button>

          <button
            id="tab-matrix"
            onClick={() => setActiveTab('matrix')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'matrix'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Percent className="w-4 h-4" />
            <span>{activeLanguage === 'lo' ? 'ຕາຕະລາງສົມທຽບ 1-5 ປີ' : 'Comparison Matrix (1-5 Yrs)'}</span>
          </button>

          <button
            id="tab-docs"
            onClick={() => setActiveTab('docs')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'docs'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{activeLanguage === 'lo' ? 'ເອກະສານປະກອບ' : 'Required Docs'}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Edit Mode Notice Banner */}
          {isEditing && activeTab === 'calculator' && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3 text-xs text-amber-900 shadow-2xs">
              <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-amber-800">
                  {activeLanguage === 'lo' ? `ກຳລັງແກ້ໄຂສັນຍາ: ${contractToEdit?.carName}` : `Editing Contract: ${contractToEdit?.carName}`}
                </span>
                <p className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
                  {activeLanguage === 'lo' 
                    ? 'ທ່ານສາມາດປ່ຽນແປງຈຳນວນເດືອນຜ່ອນ (ເຊັ່ນ: 36 ເດືອນ ມາເປັນ 48 ເດືອນ), ປ່ຽນລຸ້ນລົດ, ລາຄາ, ເງິນດາວ ແລະ ອັດຕາດອກເບ້ຍໄດ້ຕາມຕ້ອງການ. ລະບົບຈະຄິດໄລ່ຕາຕະລາງຄ່າງວດໃໝ່ອັດຕະໂນມັດ ໂດຍຮັກສາປະຫວັດງວດທີ່ເຄີຍຊຳລະແລ້ວໄວ້ຄືເກົ່າ.'
                    : 'You can modify the loan term (e.g. from 36 to 48 months), car model, price, down payment, and interest rate. The schedule will recalculate automatically while preserving paid installment history.'}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'calculator' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Form Inputs */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                  {activeLanguage === 'lo' ? '1. ຂໍ້ມູນລົດ ແລະ ຮ້ານຄ້າ' : '1. Vehicle & Store Info'}
                </h4>

                {/* Car name & Vehicle Type */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-700 font-medium mb-1">
                      {activeLanguage === 'lo' ? 'ຊື່ລົດ / ລຸ້ນ' : 'Car Name / Model'}
                    </label>
                    <input
                      id="input-calc-carname"
                      type="text"
                      value={carName}
                      onChange={(e) => setCarName(e.target.value)}
                      placeholder="e.g. BYD Atto 3, Neta V"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-700 font-medium mb-1">
                      {activeLanguage === 'lo' ? 'ປະເພດລົດ' : 'Vehicle Type'}
                    </label>
                    <select
                      id="select-calc-vehicletype"
                      value={vehicleType}
                      onChange={(e) => setVehicleType(e.target.value as VehicleType)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
                    >
                      <option value="EV car">EV car (ລົດໄຟຟ້າ)</option>
                      <option value="SUV">SUV</option>
                      <option value="Sedan">Sedan (ເກ໋ງ)</option>
                      <option value="Pickup">Pickup (ກະບະ)</option>
                      <option value="Motorcycle">Motorcycle (ລົດຈັກ)</option>
                      <option value="Truck">Truck (ລົດບັນທຸກ)</option>
                      <option value="Other">Other (ອື່ນໆ)</option>
                    </select>
                  </div>
                </div>

                {/* License Plate & Store Phone */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-700 font-medium mb-1">
                      {activeLanguage === 'lo' ? 'ປ້າຍທະບຽນລົດ (ຖ້າມີ)' : 'License Plate (Optional)'}
                    </label>
                    <input
                      id="input-calc-plate"
                      type="text"
                      value={licensePlate}
                      onChange={(e) => setLicensePlate(e.target.value)}
                      placeholder="e.g. ກກ 9999 ກພ"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-700 font-medium mb-1">
                      {activeLanguage === 'lo' ? 'ເບີໂທຕິດຕໍ່ຮ້ານ/ໂຊຣູມ' : 'Store Phone'}
                    </label>
                    <input
                      id="input-calc-store-phone"
                      type="text"
                      value={storePhone}
                      onChange={(e) => setStorePhone(e.target.value)}
                      placeholder="e.g. 020 5555 9999"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
                    />
                  </div>
                </div>

                {/* Store Selection (Supports Multiple Stores + Custom Entry) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs text-slate-700 font-medium">
                      {activeLanguage === 'lo' ? 'ໂຊຣູມ / ຮ້ານຄ້າ' : 'Dealership / Showroom'}
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCustomStore(!isCustomStore)}
                      className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 underline cursor-pointer"
                    >
                      {isCustomStore ? (activeLanguage === 'lo' ? 'ເລືອກຈາກລາຍຊື່' : 'Pick from list') : (activeLanguage === 'lo' ? '+ ພິມຊື່ຮ້ານເອງ' : '+ Type custom store')}
                    </button>
                  </div>

                  {isCustomStore ? (
                    <input
                      id="input-calc-custom-store"
                      type="text"
                      value={customStoreName}
                      onChange={(e) => setCustomStoreName(e.target.value)}
                      placeholder={activeLanguage === 'lo' ? 'ພິມຊື່ຮ້ານຄ້າຂອງທ່ານ...' : 'Enter store name...'}
                      className="w-full bg-slate-50 border border-blue-400 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
                    />
                  ) : (
                    <select
                      id="select-calc-store"
                      value={selectedStorePreset}
                      onChange={(e) => setSelectedStorePreset(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
                    >
                      {stores.map((s) => (
                        <option key={s.id} value={s.name}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="pt-2">
                  <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">
                    {activeLanguage === 'lo' ? '2. ເງື່ອນໄຂການເງິນ & ໄລຍະເວລາ' : '2. Financial Terms & Period'}
                  </h4>
                </div>

                {/* Car Price & Currency */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs text-slate-700 font-medium mb-1">
                      {activeLanguage === 'lo' ? 'ລາຄາລົດລວມ (Total Price)' : 'Total Price'}
                    </label>
                    <div className="relative">
                      <input
                        id="input-calc-price"
                        type="number"
                        min="0"
                        step="100"
                        value={totalPrice}
                        onChange={(e) => setTotalPrice(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-3 pr-8 py-2 text-xs text-slate-900 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-700 font-medium mb-1">
                      {activeLanguage === 'lo' ? 'ສະກຸນເງິນ' : 'Currency'}
                    </label>
                    <select
                      id="select-calc-currency"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value as Currency)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-xs text-slate-900 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="LAK">LAK (₭)</option>
                      <option value="THB">THB (฿)</option>
                    </select>
                  </div>
                </div>

                {/* Down Payment % Buttons + Slider */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-700 font-medium">
                      {activeLanguage === 'lo' ? 'ຈ່າຍກ່ອນ / ວາງດາວ (Down Payment)' : 'Down Payment'}
                    </span>
                    <span className="font-bold text-blue-700">
                      {downPaymentPercent}% ({formatCurrency(calc.downPaymentAmount, currency)})
                    </span>
                  </div>

                  {/* Preset down payment buttons */}
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    {[50, 60, 70, 80].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setDownPaymentPercent(pct)}
                        className={`py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                          downPaymentPercent === pct
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>

                  <input
                    type="range"
                    min="10"
                    max="90"
                    step="5"
                    value={downPaymentPercent}
                    onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                    className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Interest Rate & Term Selection */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-700 font-medium mb-1">
                      {activeLanguage === 'lo' ? 'ດອກເບ້ຍຕໍ່ເດືອນ (%)' : 'Monthly Rate (%)'}
                    </label>
                    <div className="relative">
                      <input
                        id="input-calc-rate"
                        type="number"
                        step="0.05"
                        min="0"
                        max="10"
                        value={monthlyInterestRatePercent}
                        onChange={(e) => setMonthlyInterestRatePercent(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
                      />
                      <span className="absolute right-3 top-2 text-xs text-slate-400 font-medium">%</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs text-slate-700 font-medium">
                        {activeLanguage === 'lo' ? 'ໄລຍະເວລາຜ່ອນ (ເດືອນ)' : 'Term (Months)'}
                      </label>
                      <span className="text-[11px] font-bold text-blue-600">
                        {termMonths} {activeLanguage === 'lo' ? 'ເດືອນ' : 'Mo'} ({termMonths >= 12 ? (termMonths / 12).toFixed(1) + (activeLanguage === 'lo' ? ' ປີ' : ' Yrs') : ''})
                      </span>
                    </div>
                    <select
                      id="select-calc-term"
                      value={termMonths}
                      onChange={(e) => setTermMonths(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
                    >
                      <option value="6">6 ເດືອນ (0.5 ປີ)</option>
                      <option value="12">12 ເດືອນ (1 ປີ)</option>
                      <option value="18">18 ເດືອນ (1.5 ປີ)</option>
                      <option value="24">24 ເດືອນ (2 ປີ)</option>
                      <option value="30">30 ເດືອນ (2.5 ປີ)</option>
                      <option value="36">36 ເດືອນ (3 ປີ)</option>
                      <option value="42">42 ເດືອນ (3.5 ປີ)</option>
                      <option value="48">48 ເດືອນ (4 ປີ)</option>
                      <option value="54">54 ເດືອນ (4.5 ປີ)</option>
                      <option value="60">60 ເດືອນ (5 ປີ)</option>
                      <option value="72">72 ເດືອນ (6 ປີ)</option>
                      <option value="84">84 ເດືອນ (7 ປີ)</option>
                    </select>
                  </div>
                </div>

                {/* Due day & Start Date */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-700 font-medium mb-1">
                      {activeLanguage === 'lo' ? 'ວັນທີເລີ່ມສັນຍາ' : 'Start Date'}
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-700 font-medium mb-1">
                      {activeLanguage === 'lo' ? 'ກຳນົດຈ່າຍວັນທີ (ຂອງທຸກເດືອນ)' : 'Due Day of Month'}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={dueDayOfMonth}
                      onChange={(e) => setDueDayOfMonth(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
                    />
                  </div>
                </div>

                {/* Contract Notes */}
                <div>
                  <label className="block text-xs text-slate-700 font-medium mb-1">
                    {activeLanguage === 'lo' ? 'ໝາຍເຫດສັນຍາ (Notes)' : 'Contract Notes'}
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. ດອກເບ້ຍ 0.8%/ເດືອນ, ໂປຣໂມຊັ່ນປະກັນໄພຟຣີ 1 ປີ"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
                  />
                </div>
              </div>

              {/* Right Column: Real-time Calculation Result Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                      {activeLanguage === 'lo' ? 'ຜົນການຄິດໄລ່ຄ່າງວດໃໝ່' : 'Calculation Summary'}
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                      {effectiveStoreName}
                    </span>
                  </div>

                  {/* Big Highlight: Monthly Installment */}
                  <div className="my-4 p-4 rounded-xl bg-blue-50/70 border border-blue-200/80 text-center shadow-2xs">
                    <span className="text-xs text-blue-800 font-medium block mb-1">
                      {activeLanguage === 'lo' ? 'ຄ່າງວດທີ່ຕ້ອງຈ່າຍຕໍ່ເດືອນ (Monthly Payment)' : 'Monthly Installment'}
                    </span>
                    <div className="text-3xl font-black text-blue-700">
                      {formatCurrency(calc.monthlyInstallment, currency)}
                    </div>
                    <span className="text-[11px] text-slate-600 block mt-1">
                      ({formatCurrency(calc.monthlyPrincipal, currency)} ຕົ້ນ + {formatCurrency(calc.monthlyInterest, currency)} ດອກ)
                    </span>
                  </div>

                  {/* Breakdown details */}
                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-600">{activeLanguage === 'lo' ? 'ລາຄາລົດລວມ:' : 'Total Price:'}</span>
                      <span className="font-semibold text-slate-900">{formatCurrency(calc.totalPrice, currency)}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-600">{activeLanguage === 'lo' ? 'ເງິນວາງດາວ:' : 'Down Payment:'}</span>
                      <span className="font-semibold text-blue-700">
                        {calc.downPaymentPercent}% ({formatCurrency(calc.downPaymentAmount, currency)})
                      </span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-600">{activeLanguage === 'lo' ? 'ຍອດກູ້ຢືມຍັງຄ້າງ (ເງິນຕົ້ນ):' : 'Loan Principal Amount:'}</span>
                      <span className="font-bold text-slate-900">{formatCurrency(calc.loanAmount, currency)}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-600">{activeLanguage === 'lo' ? 'ໄລຍະເວລາຜ່ອນ:' : 'Loan Term:'}</span>
                      <span className="font-bold text-slate-900">{termMonths} {activeLanguage === 'lo' ? 'ເດືອນ' : 'Months'}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-600">{activeLanguage === 'lo' ? 'ດອກເບ້ຍຕໍ່ເດືອນ:' : 'Monthly Interest Amount:'}</span>
                      <span className="font-semibold text-emerald-600">
                        {formatCurrency(calc.monthlyInterest, currency)} ({calc.monthlyInterestRatePercent}%)
                      </span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-600">{activeLanguage === 'lo' ? 'ດອກເບ້ຍລວມທັງໝົດ:' : 'Total Cumulative Interest:'}</span>
                      <span className="font-semibold text-emerald-600">{formatCurrency(calc.totalInterest, currency)}</span>
                    </div>

                    <div className="flex justify-between py-2 bg-white px-3 rounded-lg border border-slate-200 font-bold shadow-2xs">
                      <span className="text-slate-700">{activeLanguage === 'lo' ? 'ຍອດລວມຕົ້ນ+ດອກ:' : 'Total Payable:'}</span>
                      <span className="text-blue-700">{formatCurrency(calc.totalLoanPayment, currency)}</span>
                    </div>
                  </div>
                </div>

                {/* Action button */}
                <div className="pt-4 mt-4 border-t border-slate-200">
                  <button
                    id="btn-save-as-loan-contract"
                    onClick={handleCreateContract}
                    className={`w-full py-3 px-4 rounded-xl font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer ${
                      isEditing 
                        ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-900/10'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-900/10'
                    }`}
                  >
                    {isEditing ? <Save className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                    <span>
                      {isEditing 
                        ? (activeLanguage === 'lo' ? 'ບັນທຶກການແກ້ໄຂສັນຍາ' : 'Save Contract Changes')
                        : (activeLanguage === 'lo' ? 'ສ້າງເປັນສັນຍາຜ່ອນລົດ & ຕິດຕາມຄ່າງວດ' : 'Save & Start Tracking Contract')}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'matrix' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {activeLanguage === 'lo' 
                      ? `ຕາຕະລາງສົມທຽບຄ່າງວດ 12 - 60 ເດືອນ (${effectiveStoreName})` 
                      : `Loan Comparison Matrix (12 - 60 Months)`}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {activeLanguage === 'lo' 
                      ? `ລາຄາລົດ: ${formatCurrency(totalPrice, currency)} | ດອກເບ້ຍ: ${monthlyInterestRatePercent}% ຕໍ່ເດືອນ` 
                      : `Vehicle Price: ${formatCurrency(totalPrice, currency)} | Rate: ${monthlyInterestRatePercent}% / mo`}
                  </p>
                </div>

                <span className="text-xs px-3 py-1 rounded-full bg-red-50 text-red-700 font-semibold border border-red-200">
                  {activeLanguage === 'lo' ? 'ຕ້ອງຊຳລະທຸກເດືອນ' : 'Monthly Payment Required'}
                </span>
              </div>

              {/* Table rendering the exact spreadsheet look */}
              <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-2xs">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-blue-600 text-white font-bold border-b border-blue-700">
                      <th className="p-2.5 border-r border-blue-500">ລາຄາລວມ</th>
                      <th className="p-2.5 border-r border-blue-500">ຈ່າຍກ່ອນ</th>
                      <th className="p-2.5 border-r border-blue-500">ຈຳນວນເງິນວາງດາວ</th>
                      <th className="p-2.5 border-r border-blue-500">ຍອດຍັງຄ້າງ</th>
                      <th className="p-2.5 border-r border-blue-500">ດອກເບ້ຍ</th>
                      <th className="p-2.5 border-r border-blue-500">ດອກເບ້ຍ/ເດືອນ</th>
                      <th className="p-2.5 border-r border-blue-500 bg-blue-700">12 ເດືອນ</th>
                      <th className="p-2.5 border-r border-blue-500 bg-blue-700">24 ເດືອນ</th>
                      <th className="p-2.5 border-r border-blue-500 bg-blue-700">36 ເດືອນ</th>
                      <th className="p-2.5 border-r border-blue-500 bg-blue-700">48 ເດືອນ</th>
                      <th className="p-2.5 border-r border-blue-500 bg-blue-700">60 ເດືອນ</th>
                      <th className="p-2.5 bg-red-600 text-white">ໝາຍເຫດ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {matrix.map((row) => (
                      <tr 
                        key={row.downPercent}
                        className={`hover:bg-slate-50 transition-colors ${
                          downPaymentPercent === row.downPercent ? 'bg-blue-50/60 font-bold' : 'bg-white'
                        }`}
                      >
                        <td className="p-2.5 border-r border-slate-100 text-slate-700 font-mono">
                          {formatCurrency(totalPrice, currency)}
                        </td>
                        <td className="p-2.5 border-r border-slate-100 text-blue-700 font-bold">
                          {row.downPercent}%
                        </td>
                        <td className="p-2.5 border-r border-slate-100 text-slate-700 font-mono">
                          {formatCurrency(row.downAmount, currency)}
                        </td>
                        <td className="p-2.5 border-r border-slate-100 text-slate-700 font-mono">
                          {formatCurrency(row.loanAmount, currency)}
                        </td>
                        <td className="p-2.5 border-r border-slate-100 text-emerald-600 font-semibold">
                          {row.monthlyInterestRate}%
                        </td>
                        <td className="p-2.5 border-r border-slate-100 text-emerald-600 font-mono font-semibold">
                          {formatCurrency(row.monthlyInterestAmount, currency)}
                        </td>
                        {row.terms.map((t) => (
                          <td 
                            key={t.months}
                            className={`p-2.5 border-r border-slate-100 font-mono font-bold ${
                              termMonths === t.months && downPaymentPercent === row.downPercent
                                ? 'bg-blue-100 text-blue-800'
                                : 'text-slate-900'
                            }`}
                          >
                            {formatCurrency(t.monthlyInstallment, currency)}
                          </td>
                        ))}
                        <td className="p-2.5 text-red-600 text-[10px] whitespace-nowrap font-medium">
                          ຕ້ອງຊຳລະທຸກເດືອນ
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setActiveTab('calculator')}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 shadow-2xs cursor-pointer"
                >
                  {activeLanguage === 'lo' ? 'ເລືອກ ແລະ ປັບແຕ່ງສັນຍາ' : 'Customize & Select'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'docs' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                <FileText className="w-5 h-5 text-blue-600" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {activeLanguage === 'lo' ? 'ເອກະສານສຳລັບການຈ່າຍຜ່ອນລົດ' : 'Required Loan Documents Checklist'}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {activeLanguage === 'lo' ? 'ເອກະສານທີ່ຕ້ອງກະກຽມສຳລັບການຍື່ນຂໍຜ່ອນລົດ' : 'Prepare these documents when applying'}
                  </p>
                </div>
              </div>

              {/* Document Categories */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Category 1: ບຸກຄົນທົ່ວໄປ */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200">
                    1. ບຸກຄົນທົ່ວໄປ (General/Employees)
                  </div>
                  <ul className="space-y-2 text-xs text-slate-700">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>ສຳເນົາບັດປະຈຳຕົວ ຫຼື ສຳມະໂນຄົວ</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>ໃບຢັ້ງຢືນເງິນເດືອນ ຫຼື ໃບຢັ້ງຢືນການເຮັດວຽກ</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>ໃບສະຫຼຸບບັນຊີທະນາຄານຍ້ອນຫຼັງ 3-6 ເດືອນ (Bank Statement)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>ໃບຢັ້ງຢືນທີ່ຢູ່ຈາກນາຍບ້ານ</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>ເອກະສານຜູ້ຄ້ຳປະກັນ (ຖ້າມີ)</span>
                    </li>
                  </ul>
                </div>

                {/* Category 2: ທຸລະກິດສ່ວນຕົວ */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs border border-indigo-200">
                    2. ທຸລະກິດສ່ວນຕົວ (Self-Employed)
                  </div>
                  <ul className="space-y-2 text-xs text-slate-700">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>ສຳເນົາບັດປະຈຳຕົວ ຫຼື ສຳມະໂນຄົວ</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>ໃບທະບຽນທຸລະກິດ ຫຼື ໃບອະນຸຍາດການຄ້າ (ຖ້າມີ)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>ໃບສະຫຼຸບບັນຊີທະນາຄານຍ້ອນຫຼັງ 6 ເດືອນ</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>ຮູບຖ່າຍສະຖານທີ່ດຳເນີນທຸລະກິດ / ໜ້າຮ້ານ</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>ໃບຢັ້ງຢືນທີ່ຢູ່ຈາກນາຍບ້ານ</span>
                    </li>
                  </ul>
                </div>

                {/* Category 3: ບໍລິສັດ */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 font-bold text-xs border border-purple-200">
                    3. ບໍລິສັດ (Company / Corporate)
                  </div>
                  <ul className="space-y-2 text-xs text-slate-700">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>ໃບທະບຽນວິສາຫະກິດ / ໃບອະນຸຍາດລົງທຶນ</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>ໃບຢັ້ງຢືນການເສຍອາກອນຫຼ້າສຸດ</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>ໃບສະຫຼຸບບັນຊີທະນາຄານບໍລິສັດ 6 ເດືອນ</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>ໃບມອບສິດ (ຖ້າຜູ້ຕາງໜ້າເປັນຜູ້ເຊັນ)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>ບັດປະຈຳຕົວຂອງກຳມະການຜູ້ມີອຳນາດລົງລາຍເຊັນ</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
