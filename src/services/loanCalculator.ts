import { Currency, InstallmentItem, LoanContract, PaymentStatus, VehicleType, EarlyPayoffCalculation } from '../types';

export interface CalculationMatrixRow {
  downPercent: number; // 50, 60, 70, 80
  downAmount: number;
  loanAmount: number;
  monthlyInterestRate: number; // 0.8%
  monthlyInterestAmount: number;
  terms: {
    months: number;
    monthlyInstallment: number;
    totalInterest: number;
    totalPayable: number;
  }[];
}

/**
 * Calculates loan details based on vehicle price, down payment percentage, monthly interest rate, and term
 */
export function calculateLoanParameters(
  totalPrice: number,
  downPaymentPercent: number,
  monthlyInterestRatePercent: number, // e.g. 0.8
  termMonths: number
) {
  const downPaymentAmount = Math.round((totalPrice * downPaymentPercent) / 100);
  const loanAmount = Math.max(0, totalPrice - downPaymentAmount);
  const monthlyRateDecimal = monthlyInterestRatePercent / 100;
  
  // Monthly interest = loan principal * monthly rate
  const monthlyInterest = loanAmount * monthlyRateDecimal;
  
  // Monthly principal = loan principal / termMonths
  const monthlyPrincipal = termMonths > 0 ? loanAmount / termMonths : 0;
  
  // Monthly installment = monthly principal + monthly interest
  const monthlyInstallment = Math.round(monthlyPrincipal + monthlyInterest);
  
  // Total interest across the whole duration = monthlyInterest * termMonths
  const totalInterest = Math.round(monthlyInterest * termMonths);
  const totalLoanPayment = loanAmount + totalInterest;

  return {
    totalPrice,
    downPaymentPercent,
    downPaymentAmount,
    loanAmount,
    monthlyInterestRate: monthlyRateDecimal,
    monthlyInterestRatePercent,
    monthlyInterest: Math.round(monthlyInterest * 100) / 100,
    monthlyPrincipal: Math.round(monthlyPrincipal * 100) / 100,
    monthlyInstallment,
    totalInterest,
    totalLoanPayment,
    termMonths,
  };
}

/**
 * Generates the VK Group comparison matrix (12, 24, 36, 48, 60 months x 50%, 60%, 70%, 80% down payments)
 */
export function generateComparisonMatrix(
  totalPrice: number,
  monthlyInterestRatePercent = 0.8,
  downPercentages = [50, 60, 70, 80],
  termList = [12, 24, 36, 48, 60]
): CalculationMatrixRow[] {
  return downPercentages.map((downPercent) => {
    const downAmount = Math.round((totalPrice * downPercent) / 100);
    const loanAmount = Math.max(0, totalPrice - downAmount);
    const monthlyInterestAmount = Math.round((loanAmount * (monthlyInterestRatePercent / 100)) * 100) / 100;

    const terms = termList.map((months) => {
      const principalPerMonth = months > 0 ? loanAmount / months : 0;
      const monthlyInstallment = Math.round(principalPerMonth + monthlyInterestAmount);
      const totalInterest = Math.round(monthlyInterestAmount * months);
      const totalPayable = loanAmount + totalInterest;

      return {
        months,
        monthlyInstallment,
        totalInterest,
        totalPayable,
      };
    });

    return {
      downPercent,
      downAmount,
      loanAmount,
      monthlyInterestRate: monthlyInterestRatePercent,
      monthlyInterestAmount,
      terms,
    };
  });
}

/**
 * Generates initial installment schedule
 */
export function generateInstallmentSchedule(
  loanAmount: number,
  monthlyInterest: number,
  termMonths: number,
  startDate: string, // YYYY-MM-DD
  dueDayOfMonth = 15
): InstallmentItem[] {
  const schedule: InstallmentItem[] = [];
  const principalPerMonth = termMonths > 0 ? loanAmount / termMonths : 0;
  const monthlyInstallment = Math.round(principalPerMonth + monthlyInterest);

  const start = new Date(startDate);
  let runningPrincipalBalance = loanAmount;
  let runningCumulativeInterest = 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 1; i <= termMonths; i++) {
    // Determine payment due date for month i
    const dueDateObj = new Date(start.getFullYear(), start.getMonth() + (i - 1), dueDayOfMonth);
    const dueDateStr = dueDateObj.toISOString().split('T')[0];

    const interestThisMonth = monthlyInterest;
    runningCumulativeInterest += interestThisMonth;

    // Remaining balance after paying this month's principal
    const remainingBalance = Math.max(0, runningPrincipalBalance - principalPerMonth);
    runningPrincipalBalance = remainingBalance;

    // Determine initial status based on due date vs today
    const dueTime = new Date(dueDateStr).getTime();
    const todayTime = today.getTime();
    const diffDays = Math.round((dueTime - todayTime) / (1000 * 60 * 60 * 24));

    let status: PaymentStatus = 'pending';
    if (diffDays < 0) {
      status = 'overdue';
    } else if (diffDays <= 7) {
      status = 'due_soon';
    }

    schedule.push({
      period: i,
      dueDate: dueDateStr,
      installmentAmount: monthlyInstallment,
      principalAmount: Math.round(principalPerMonth * 100) / 100,
      interestAmount: Math.round(interestThisMonth * 100) / 100,
      cumulativeInterest: Math.round(runningCumulativeInterest * 100) / 100,
      remainingBalance: Math.round(remainingBalance * 100) / 100,
      status,
    });
  }

  return schedule;
}

/**
 * Updates status of schedule items dynamically (evaluates if pending items are due soon or overdue)
 */
export function refreshScheduleStatuses(schedule: InstallmentItem[]): InstallmentItem[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTime = today.getTime();

  return schedule.map((item) => {
    if (item.status === 'paid') return item;

    const dueTime = new Date(item.dueDate).getTime();
    const diffDays = Math.round((dueTime - todayTime) / (1000 * 60 * 60 * 24));

    let newStatus: PaymentStatus = 'pending';
    if (diffDays < 0) {
      newStatus = 'overdue';
    } else if (diffDays <= 7) {
      newStatus = 'due_soon';
    }

    return {
      ...item,
      status: newStatus,
    };
  });
}

/**
 * Recalculates and updates an existing contract with new terms (e.g. changing term from 36 to 48 months, car model, rate, etc.)
 * while safely preserving all previously paid installment records (payment method, slip, notes, paid amount).
 */
export function recalculateAndMergeContract(
  existingContract: LoanContract,
  newParams: {
    carName: string;
    licensePlate?: string;
    storeName: string;
    storePhone?: string;
    bankName?: string;
    bankPhone?: string;
    bankAccountNo?: string;
    earlyPayoffRatePercent?: number;
    vehicleType: VehicleType | string;
    totalPrice: number;
    downPaymentPercent: number;
    monthlyInterestRatePercent: number;
    termMonths: number;
    currency: Currency;
    startDate: string;
    dueDayOfMonth: number;
    notes?: string;
  }
): LoanContract {
  const calc = calculateLoanParameters(
    newParams.totalPrice,
    newParams.downPaymentPercent,
    newParams.monthlyInterestRatePercent,
    newParams.termMonths
  );

  // Generate new schedule based on new terms
  const rawNewSchedule = generateInstallmentSchedule(
    calc.loanAmount,
    calc.monthlyInterest,
    newParams.termMonths,
    newParams.startDate,
    newParams.dueDayOfMonth
  );

  // Map over new schedule and preserve any previous payment records for matching periods
  const existingSchedule = existingContract.schedule || [];
  const mergedSchedule: InstallmentItem[] = rawNewSchedule.map((newItem) => {
    const prevItem = existingSchedule.find((p) => p.period === newItem.period);
    if (prevItem && (prevItem.status === 'paid' || prevItem.status === 'settled')) {
      return {
        ...newItem,
        status: prevItem.status,
        paidDate: prevItem.paidDate,
        paidAmount: prevItem.paidAmount,
        paymentMethod: prevItem.paymentMethod,
        receiptNote: prevItem.receiptNote,
        slipImage: prevItem.slipImage,
      };
    }
    return newItem;
  });

  const finalSchedule = refreshScheduleStatuses(mergedSchedule);

  return {
    ...existingContract,
    carName: newParams.carName,
    licensePlate: newParams.licensePlate,
    storeName: newParams.storeName,
    storePhone: newParams.storePhone,
    bankName: newParams.bankName,
    bankPhone: newParams.bankPhone,
    bankAccountNo: newParams.bankAccountNo,
    earlyPayoffRatePercent: newParams.earlyPayoffRatePercent ?? existingContract.earlyPayoffRatePercent ?? 5,
    vehicleType: newParams.vehicleType,
    totalPrice: calc.totalPrice,
    downPaymentPercent: calc.downPaymentPercent,
    downPaymentAmount: calc.downPaymentAmount,
    loanAmount: calc.loanAmount,
    monthlyInterestRate: calc.monthlyInterestRate,
    termMonths: calc.termMonths,
    monthlyInstallment: calc.monthlyInstallment,
    monthlyInterest: calc.monthlyInterest,
    monthlyPrincipal: calc.monthlyPrincipal,
    totalInterest: calc.totalInterest,
    totalLoanPayment: calc.totalLoanPayment,
    startDate: newParams.startDate,
    dueDayOfMonth: newParams.dueDayOfMonth,
    currency: newParams.currency,
    notes: newParams.notes,
    schedule: finalSchedule,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Calculates overall contract statistics
 */
export function getContractStats(contract: LoanContract) {
  const schedule = contract.schedule || [];
  const totalInstallments = schedule.length;
  
  const paidItems = schedule.filter((item) => item.status === 'paid' || item.status === 'settled');
  const paidCount = paidItems.length;
  const remainingCount = totalInstallments - paidCount;

  const totalPaidAmount = paidItems.reduce((acc, curr) => acc + (curr.paidAmount || curr.installmentAmount), 0);
  const totalPrincipalPaid = paidItems.reduce((acc, curr) => acc + curr.principalAmount, 0);
  const totalInterestPaid = paidItems.reduce((acc, curr) => acc + curr.interestAmount, 0);

  const remainingPrincipal = Math.max(0, contract.loanAmount - totalPrincipalPaid);
  const totalInterestRemaining = Math.max(0, contract.totalInterest - totalInterestPaid);
  const remainingTotalPayable = remainingPrincipal + totalInterestRemaining;

  const overdueItems = schedule.filter((item) => item.status === 'overdue');
  const dueSoonItems = schedule.filter((item) => item.status === 'due_soon');

  // Next upcoming payment (first item that is not paid or settled)
  const upcomingItem = schedule.find((item) => item.status !== 'paid' && item.status !== 'settled');

  const progressPercent = totalInstallments > 0 ? Math.round((paidCount / totalInstallments) * 100) : 0;
  const principalProgressPercent = contract.loanAmount > 0 
    ? Math.min(100, Math.round((totalPrincipalPaid / contract.loanAmount) * 100))
    : 0;

  return {
    totalInstallments,
    paidCount,
    remainingCount,
    totalPaidAmount: Math.round(totalPaidAmount),
    totalPrincipalPaid: Math.round(totalPrincipalPaid),
    totalInterestPaid: Math.round(totalInterestPaid),
    remainingPrincipal: Math.round(remainingPrincipal),
    totalInterestRemaining: Math.round(totalInterestRemaining),
    remainingTotalPayable: Math.round(remainingTotalPayable),
    overdueCount: overdueItems.length,
    dueSoonCount: dueSoonItems.length,
    overdueAmount: overdueItems.reduce((acc, curr) => acc + curr.installmentAmount, 0),
    upcomingItem,
    progressPercent,
    principalProgressPercent,
    isFullySettled: contract.isFullySettled || (remainingCount === 0 && totalInstallments > 0),
  };
}

/**
 * Calculates Early Payoff (ການຕັດຍອດປິດສັນຍາ)
 * When paying off early, calculate:
 * - remainingPrincipal: unpaid principal balance
 * - payoffFeeRatePercent: default 5%
 * - payoffFeeAmount: remainingPrincipal * (payoffFeeRatePercent / 100)
 * - totalPayoffAmount: remainingPrincipal + payoffFeeAmount
 * - remainingFutureInterest: total future interest that the customer will save by paying off early
 * - regularTotalRemaining: remainingPrincipal + remainingFutureInterest
 * - netSavings: remainingFutureInterest - payoffFeeAmount (money saved compared to paying all monthly installments to the end)
 */
export function calculateEarlyPayoff(
  contract: LoanContract,
  customPayoffRatePercent?: number,
  targetPeriod?: number
): EarlyPayoffCalculation & {
  regularTotalRemaining: number;
  netSavings: number;
  targetDueDate: string;
} {
  const schedule = contract.schedule || [];
  const payoffRate = customPayoffRatePercent ?? contract.earlyPayoffRatePercent ?? 5;

  let unpaidItems: InstallmentItem[] = [];
  let currentPeriod = 1;
  let targetDueDate = new Date().toISOString().split('T')[0];

  if (targetPeriod !== undefined) {
    // Simulated payoff at specific period target
    unpaidItems = schedule.filter((item) => item.period >= targetPeriod);
    const targetItem = schedule.find((item) => item.period === targetPeriod);
    if (targetItem) {
      targetDueDate = targetItem.dueDate;
      currentPeriod = targetItem.period;
    }
  } else {
    // Actual remaining unpaid items
    unpaidItems = schedule.filter((item) => item.status !== 'paid' && item.status !== 'settled');
    const firstUnpaid = unpaidItems[0];
    if (firstUnpaid) {
      targetDueDate = firstUnpaid.dueDate;
      currentPeriod = firstUnpaid.period;
    }
  }

  // Calculate total unpaid principal and future interest
  const remainingPrincipal = unpaidItems.reduce((acc, item) => acc + item.principalAmount, 0);
  const remainingFutureInterest = unpaidItems.reduce((acc, item) => acc + item.interestAmount, 0);

  // Payoff fee amount = remainingPrincipal * 5%
  const payoffFeeAmount = Math.round((remainingPrincipal * (payoffRate / 100)) * 100) / 100;
  
  // Total payoff amount to close contract = remainingPrincipal + payoffFeeAmount
  const totalPayoffAmount = Math.round((remainingPrincipal + payoffFeeAmount) * 100) / 100;

  // Regular total remaining if paid month-by-month
  const regularTotalRemaining = Math.round((remainingPrincipal + remainingFutureInterest) * 100) / 100;

  // Net savings = future interest that won't be paid minus 5% fee
  const netSavings = Math.round((remainingFutureInterest - payoffFeeAmount) * 100) / 100;

  const paidInstallmentsCount = schedule.length - unpaidItems.length;

  return {
    remainingPrincipal: Math.round(remainingPrincipal * 100) / 100,
    payoffFeeRatePercent: payoffRate,
    payoffFeeAmount,
    totalPayoffAmount,
    remainingFutureInterest: Math.round(remainingFutureInterest * 100) / 100,
    paidInstallmentsCount,
    remainingInstallmentsCount: unpaidItems.length,
    currentPeriod,
    regularTotalRemaining,
    netSavings,
    targetDueDate,
  };
}

/**
 * Currency Formatter
 */
export function formatCurrency(amount: number, currency: Currency = 'USD'): string {
  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  }
  if (currency === 'THB') {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      maximumFractionDigits: 0,
    }).format(amount);
  }
  // LAK formatting
  return new Intl.NumberFormat('lo-LA', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(amount) + ' ₭';
}

export function formatDateLao(dateStr: string): string {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

export function getDaysRemaining(dueDateStr: string): { days: number; isOverdue: boolean; label: string } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDateStr);
  due.setHours(0, 0, 0, 0);

  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      days: Math.abs(diffDays),
      isOverdue: true,
      label: `ກາຍກຳນົດ ${Math.abs(diffDays)} ມື້ (Overdue ${Math.abs(diffDays)}d)`,
    };
  }
  if (diffDays === 0) {
    return {
      days: 0,
      isOverdue: false,
      label: `ຮອດກຳນົດມື້ນີ້ (Due Today)`,
    };
  }
  return {
    days: diffDays,
    isOverdue: false,
    label: `ຍັງອີກ ${diffDays} ມື້ (${diffDays} days left)`,
  };
}
