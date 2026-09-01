export type Currency = 'USD' | 'LAK' | 'THB';

export type VehicleType = 'EV car' | 'SUV' | 'Sedan' | 'Pickup' | 'Motorcycle' | 'Truck' | 'Other';

export interface Store {
  id: string;
  name: string;
  phone?: string;
  location?: string;
  color?: string;
}

export interface Bank {
  id: string;
  name: string;
  nameEn?: string;
  shortName?: string;
  logo?: string;
  color?: string;
  phone?: string;
  accountNo?: string;
}

export type PaymentStatus = 'paid' | 'due_soon' | 'overdue' | 'pending' | 'settled';

export interface InstallmentItem {
  period: number; // 1, 2, 3...
  dueDate: string; // YYYY-MM-DD
  installmentAmount: number; // Monthly payment
  principalAmount: number; // Monthly principal portion
  interestAmount: number; // Monthly interest portion
  cumulativeInterest: number; // Total interest up to this month
  remainingBalance: number; // Remaining principal balance
  status: PaymentStatus;
  paidDate?: string; // YYYY-MM-DD
  paidAmount?: number;
  paymentMethod?: string; // e.g. 'BCEL One', 'LDB Trust', 'JDB Yes', 'Cash', 'Bank Transfer'
  receiptNote?: string;
  slipImage?: string; // Base64 data URL
}

export interface EarlyPayoffCalculation {
  remainingPrincipal: number; // ຍອດເງິນຕົ້ນຍັງເຫຼືອ
  payoffFeeRatePercent: number; // 5%
  payoffFeeAmount: number; // ຄ່າຕັດຍອດ 5%
  totalPayoffAmount: number; // ຍອດເງິນລວມທີ່ຕ້ອງຈ່າຍຕັດຍອດ
  remainingFutureInterest: number; // ດອກເບ້ຍໃນອະນາຄົດທີ່ປະຢັດໄດ້
  paidInstallmentsCount: number; // ຈຳນວນງວດທີ່ຈ່າຍແລ້ວ
  remainingInstallmentsCount: number; // ຈຳນວນງວດທີ່ເຫຼືອ
  currentPeriod: number;
}

export interface LoanContract {
  id: string;
  carName: string; // e.g. 'BYD Atto 3 EV', 'Neta V', 'Toyota Hilux'
  licensePlate?: string;
  storeName: string; // Dealership / Showroom name e.g. 'VK group showroom' or custom
  storePhone?: string;
  bankName?: string; // Lender / Financing Bank (ທະນາຄານທີ່ໃຫ້ສິນເຊື່ອ e.g. 'ທະນາຄານການຄ້າຕ່າງປະເທດລາວ (BCEL)')
  bankPhone?: string;
  bankAccountNo?: string;
  earlyPayoffRatePercent?: number; // Default 5%
  vehicleType: VehicleType | string;
  totalPrice: number; // Total Car Price (ລາຄາລວມ)
  downPaymentPercent: number; // % Down payment e.g. 50, 60, 70, 80
  downPaymentAmount: number; // Down payment amount (ຈຳນວນເງິນວາງດາວ)
  loanAmount: number; // Balance to finance (ຍອດຍັງຄ້າງ)
  monthlyInterestRate: number; // e.g. 0.8% = 0.008
  termMonths: number; // 12, 24, 36, 48, 60
  monthlyInstallment: number; // Monthly installment (ຄ່າງວດຕໍ່ເດືອນ)
  monthlyInterest: number; // Monthly interest (ດອກເບ້ຍຕໍ່ເດືອນ)
  monthlyPrincipal: number; // Monthly principal (ເງິນຕົ້ນຕໍ່ເດືອນ)
  totalInterest: number; // Total interest over loan term (ດອກເບ້ຍລວມທັງໝົດ)
  totalLoanPayment: number; // Total payable including interest (ຍອດລວມຕົ້ນ+ດອກ)
  startDate: string; // First payment date / contract start (YYYY-MM-DD)
  dueDayOfMonth: number; // Day of month payment is due e.g. 15
  currency: Currency;
  notes?: string;
  isFullySettled?: boolean;
  settledDate?: string;
  settledAmount?: number;
  schedule: InstallmentItem[];
  spreadsheetId?: string;
  spreadsheetUrl?: string;
  lastSyncedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GoogleSheetsConfig {
  spreadsheetId: string;
  spreadsheetUrl: string;
  sheetTitle: string;
  lastSyncTime: string;
}

export interface RequiredDocumentCategory {
  title: string;
  titleLao: string;
  items: string[];
}
