import { LoanContract, Store } from '../types';
import { calculateLoanParameters, generateInstallmentSchedule, refreshScheduleStatuses } from './loanCalculator';

const STORAGE_KEY_CONTRACTS = 'auto_loan_tracker_contracts_v1';
const STORAGE_KEY_STORES = 'auto_loan_tracker_stores_v1';
const STORAGE_KEY_SELECTED_ID = 'auto_loan_tracker_selected_id_v1';

export const DEFAULT_STORES: Store[] = [
  { id: 'store_vk', name: 'VK group showroom (ລົດໄຟຟ້າ VK)', phone: '020 5555 9999', location: 'ນະຄອນຫຼວງວຽງຈັນ', color: 'amber' },
  { id: 'store_toyota', name: 'Toyota Lao Thani (ໂຕໂຢຕ້າ ລາວທານີ)', phone: '021 454545', location: 'ຖະໜົນມິດຕະພາບ', color: 'red' },
  { id: 'store_byd', name: 'BYD Lao Auto (ບີວາຍດີ ລາວ)', phone: '020 9898 7777', location: 'ດົງໂດກ, ວຽງຈັນ', color: 'blue' },
  { id: 'store_aion', name: 'AION Lao EV (ໄອອອນ ລາວ)', phone: '020 7766 5544', location: 'ໂພນຕ້ອງ', color: 'emerald' },
  { id: 'store_ford', name: 'Lao Ford City (ລາວຟອດ ຊີຕີ້)', phone: '021 241108', location: 'ຖະໜົນທ່າເດື່ອ', color: 'indigo' },
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
    notes: 'ສັນຍາຜ່ອນລົດໄຟຟ້າ VK Group ດອກເບ້ຍ 0.8%/ເດືອນ ໄລຍະ 24 ເດືອນ',
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

