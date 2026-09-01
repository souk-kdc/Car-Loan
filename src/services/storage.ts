import { Bank, LoanContract, Store } from '../types';
import { calculateLoanParameters, generateInstallmentSchedule, refreshScheduleStatuses } from './loanCalculator';

const STORAGE_KEY_CONTRACTS = 'auto_loan_tracker_contracts_v1';
const STORAGE_KEY_STORES = 'auto_loan_tracker_stores_v1';
const STORAGE_KEY_BANKS = 'auto_loan_tracker_banks_v1';
const STORAGE_KEY_SELECTED_ID = 'auto_loan_tracker_selected_id_v1';

export const DEFAULT_STORES: Store[] = [
  { id: 'store_vk', name: 'VK group showroom (ລົດໄຟຟ້າ VK)', phone: '020 5555 9999', location: 'ນະຄອນຫຼວງວຽງຈັນ', color: 'amber' },
  { id: 'store_toyota', name: 'Toyota Lao Thani (ໂຕໂຢຕ້າ ລາວທານີ)', phone: '021 454545', location: 'ຖະໜົນມິດຕະພາບ', color: 'red' },
  { id: 'store_byd', name: 'BYD Lao Auto (ບີວາຍດີ ລາວ)', phone: '020 9898 7777', location: 'ດົງໂດກ, ວຽງຈັນ', color: 'blue' },
  { id: 'store_aion', name: 'AION Lao EV (ໄອອອນ ລາວ)', phone: '020 7766 5544', location: 'ໂພນຕ້ອງ', color: 'emerald' },
  { id: 'store_ford', name: 'Lao Ford City (ລາວຟອດ ຊີຕີ້)', phone: '021 241108', location: 'ຖະໜົນທ່າເດື່ອ', color: 'indigo' },
];

export const DEFAULT_BANKS: Bank[] = [
  { id: 'bank_bcel', name: 'ທະນາຄານການຄ້າຕ່າງປະເທດລາວ ມະຫາຊົນ (BCEL)', nameEn: 'Banque Pour Le Commerce Exterieur Lao Public (BCEL)', shortName: 'BCEL', color: 'red' },
  { id: 'bank_jdb', name: 'ທະນາຄານ ຮ່ວມພັດທະນາ (JDB)', nameEn: 'Joint Development Bank (JDB)', shortName: 'JDB', color: 'blue' },
  { id: 'bank_ldb', name: 'ທະນາຄານ ພັດທະນາລາວ (LDB)', nameEn: 'Lao Development Bank (LDB)', shortName: 'LDB', color: 'emerald' },
  { id: 'bank_apb', name: 'ທະນາຄານ ສົ່ງເສີມກະສິກຳ (APB)', nameEn: 'Agricultural Promotion Bank (APB)', shortName: 'APB', color: 'green' },
  { id: 'bank_maruhan', name: 'ທະນາຄານ ມາຣູຮານ ເຈແປນ ລາວ (MJBL)', nameEn: 'Maruhan Japan Bank Lao', shortName: 'Maruhan', color: 'rose' },
  { id: 'bank_lvb', name: 'ທະນາຄານ ລາວ-ຫວຽດ (Lao-Viet Bank)', nameEn: 'Lao-Viet Bank', shortName: 'LVB', color: 'amber' },
  { id: 'bank_indochina', name: 'ທະນາຄານ ອິນໂດຈີນ (Indochina Bank)', nameEn: 'Indochina Bank', shortName: 'IB', color: 'indigo' },
  { id: 'bank_bic', name: 'ທະນາຄານ ບີໄອຊີ ລາວ (BIC Bank)', nameEn: 'BIC Bank Lao', shortName: 'BIC', color: 'cyan' },
  { id: 'bank_sacom', name: 'ທະນາຄານ ຊາຄອມແບັງ ລາວ (Sacombank)', nameEn: 'Sacombank Lao', shortName: 'Sacombank', color: 'blue' },
  { id: 'bank_st', name: 'ທະນາຄານ ເອັສທີ (ST Bank)', nameEn: 'ST Bank', shortName: 'ST Bank', color: 'purple' },
  { id: 'bank_vk_finance', name: 'ສິນເຊື່ອໂດຍກົງຈາກໂຊຣູມ VK (VK Auto Finance)', nameEn: 'VK Showroom Direct Financing', shortName: 'VK Finance', color: 'amber' },
];

export function getInitialSampleContract(): LoanContract {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 2); // started 2 months ago
  const startDateStr = startDate.toISOString().split('T')[0];

  const calc = calculateLoanParameters(21800, 50, 0.8, 24);
  const schedule = generateInstallmentSchedule(calc.loanAmount, calc.monthlyInterest, 24, startDateStr, 15);

  // Mark period 1 and 2 as paid
  if (schedule[0]) {
    schedule[0].status = 'paid';
    schedule[0].paidDate = schedule[0].dueDate;
    schedule[0].paidAmount = schedule[0].installmentAmount;
    schedule[0].paymentMethod = 'BCEL One';
    schedule[0].receiptNote = 'ໂອນຜ່ານ BCEL One ສຳເລັດ (Ref: TXN882910)';
  }
  if (schedule[1]) {
    schedule[1].status = 'paid';
    schedule[1].paidDate = schedule[1].dueDate;
    schedule[1].paidAmount = schedule[1].installmentAmount;
    schedule[1].paymentMethod = 'BCEL One';
    schedule[1].receiptNote = 'ຊຳລະກົງເວລາ (Ref: TXN994821)';
  }

  const updatedSchedule = refreshScheduleStatuses(schedule);

  return {
    id: 'contract_sample_vk_ev',
    carName: 'EV Car (Neta V / BYD Atto 3)',
    licensePlate: 'ກກ 8899 ກຳແພງນະຄອນ',
    storeName: 'VK group showroom',
    storePhone: '020 5555 9999',
    bankName: 'ທະນາຄານການຄ້າຕ່າງປະເທດລາວ ມະຫາຊົນ (BCEL)',
    bankPhone: '1555',
    bankAccountNo: '010-12-00-00123456-001',
    earlyPayoffRatePercent: 5,
    vehicleType: 'EV car',
    totalPrice: 21800,
    downPaymentPercent: 50,
    downPaymentAmount: 10900,
    loanAmount: 10900,
    monthlyInterestRate: 0.008,
    termMonths: 24,
    monthlyInstallment: calc.monthlyInstallment,
    monthlyInterest: calc.monthlyInterest,
    monthlyPrincipal: calc.monthlyPrincipal,
    totalInterest: calc.totalInterest,
    totalLoanPayment: calc.totalLoanPayment,
    startDate: startDateStr,
    dueDayOfMonth: 15,
    currency: 'USD',
    notes: 'ສັນຍາຜ່ອນລົດໄຟຟ້າ VK Group ດອກເບ້ຍ 0.8%/ເດືອນ ໄລຍະ 24 ເດືອນ (ຄ່າຕັດຍອດ 5%)',
    schedule: updatedSchedule,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function loadContracts(): LoanContract[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONTRACTS);
    if (!raw) {
      const initial = [getInitialSampleContract()];
      saveContracts(initial);
      return initial;
    }
    const parsed: LoanContract[] = JSON.parse(raw);
    return parsed.map((contract) => ({
      ...contract,
      bankName: contract.bankName || 'ທະນາຄານການຄ້າຕ່າງປະເທດລາວ ມະຫາຊົນ (BCEL)',
      earlyPayoffRatePercent: contract.earlyPayoffRatePercent ?? 5,
      schedule: refreshScheduleStatuses(contract.schedule || []),
    }));
  } catch (e) {
    console.error('Failed to load contracts from localStorage', e);
    return [getInitialSampleContract()];
  }
}

export function saveContracts(contracts: LoanContract[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_CONTRACTS, JSON.stringify(contracts));
  } catch (e) {
    console.error('Failed to save contracts to localStorage', e);
  }
}

export function loadStores(): Store[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STORES);
    if (!raw) {
      saveStores(DEFAULT_STORES);
      return DEFAULT_STORES;
    }
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_STORES;
  }
}

export function saveStores(stores: Store[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_STORES, JSON.stringify(stores));
  } catch (e) {
    console.error('Failed to save stores', e);
  }
}

export function loadBanks(): Bank[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BANKS);
    if (!raw) {
      saveBanks(DEFAULT_BANKS);
      return DEFAULT_BANKS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_BANKS;
  }
}

export function saveBanks(banks: Bank[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_BANKS, JSON.stringify(banks));
  } catch (e) {
    console.error('Failed to save banks', e);
  }
}

export function getSelectedContractId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY_SELECTED_ID);
  } catch (e) {
    return null;
  }
}

export function setSelectedContractId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_SELECTED_ID, id);
  } catch (e) {
    console.warn('Failed to set selected contract id:', e);
  }
}

