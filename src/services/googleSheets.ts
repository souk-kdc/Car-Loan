import { LoanContract, InstallmentItem } from '../types';
import { calculateLoanParameters, generateComparisonMatrix } from './loanCalculator';

/**
 * Creates or overwrites a formatted Google Spreadsheet with the full auto loan ledger, matrix, and documentation.
 */
export async function exportContractToGoogleSheets(
  contract: LoanContract,
  accessToken: string
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  // 1. Create a new Spreadsheet
  const title = `ຕາຕະລາງຜ່ອນລົດ - ${contract.carName} (${contract.storeName})`;
  
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title,
      },
      sheets: [
        {
          properties: {
            title: 'ສະຫຼຸບ ແລະ ຕາຕະລາງຄ່າງວດ',
            gridProperties: { rowCount: 150, columnCount: 15 },
          },
        },
        {
          properties: {
            title: 'ຕາຕະລາງສົມທຽບ (VK Matrix)',
            gridProperties: { rowCount: 50, columnCount: 15 },
          },
        },
        {
          properties: {
            title: 'ເອກະສານປະກອບ',
            gridProperties: { rowCount: 30, columnCount: 8 },
          },
        },
      ],
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.json();
    throw new Error(err.error?.message || 'ບໍ່ສາມາດສ້າງ Google Sheet ໄດ້');
  }

  const sheetData = await createRes.json();
  const spreadsheetId = sheetData.spreadsheetId;
  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // 2. Prepare Ledger data for Sheet 1
  const matrix = generateComparisonMatrix(contract.totalPrice, contract.monthlyInterestRate * 100);

  const summaryValues: (string | number)[][] = [
    ['ລະບົບຕິດຕາມການຜ່ອນລົດ - Auto Loan Tracker (ເຊື່ອມຕໍ່ Google Sheets)'],
    [''],
    ['ຂໍ້ມູນສັນຍາ ແລະ ລົດ', '', 'ຂໍ້ມູນການເງິນ', ''],
    ['ຊື່ລົດ / ລຸ້ນ:', contract.carName, 'ລາຄາລວມ:', `${contract.totalPrice} ${contract.currency}`],
    ['ປະເພດລົດ:', contract.vehicleType, 'ເງິນວາງດາວ (%):', `${contract.downPaymentPercent}% (${contract.downPaymentAmount} ${contract.currency})`],
    ['ຮ້ານຄ້າ / ໂຊຣູມ:', contract.storeName, 'ຍອດກູ້ຢືມຍັງຄ້າງ:', `${contract.loanAmount} ${contract.currency}`],
    ['ເບີໂທຕິດຕໍ່ຮ້ານ:', contract.storePhone || '-', 'ອັດຕາດອກເບ້ຍຕໍ່ເດືອນ:', `${(contract.monthlyInterestRate * 100).toFixed(2)}%`],
    ['ວັນທີເລີ່ມສັນຍາ:', contract.startDate, 'ດອກເບ້ຍຕໍ່ເດືອນ:', `${contract.monthlyInterest} ${contract.currency}`],
    ['ກຳນົດຈ່າຍວັນທີ:', `ວັນທີ ${contract.dueDayOfMonth} ຂອງທຸກເດືອນ`, 'ຄ່າງວດຕໍ່ເດືອນ:', `${contract.monthlyInstallment} ${contract.currency}`],
    ['ໄລຍະເວລາຜ່ອນ:', `${contract.termMonths} ເດືອນ (${(contract.termMonths / 12).toFixed(1)} ປີ)`, 'ດອກເບ້ຍລວມທັງໝົດ:', `${contract.totalInterest} ${contract.currency}`],
    ['ໝາຍເຫດ:', contract.notes || '-', 'ຍອດລວມຕົ້ນ+ດອກ:', `${contract.totalLoanPayment} ${contract.currency}`],
    [''],
    ['ຕາຕະລາງປະຫວັດການຊຳລະຄ່າງວດແຕ່ລະເດືອນ (Amortization & Payment History)'],
    [
      'ງວດທີ (No.)',
      'ວັນທີຄົບກຳນົດ (Due Date)',
      'ຄ່າງວດ (Installment)',
      'ເງິນຕົ້ນ (Principal)',
      'ດອກເບ້ຍ (Interest)',
      'ດອກເບ້ຍສະສົມ (Cumul. Interest)',
      'ຍອດຕົ້ນຍັງເຫຼືອ (Balance)',
      'ສະຖານະ (Status)',
      'ວັນທີຈ່າຍຈິງ (Paid Date)',
      'ຈຳນວນເງິນທີ່ຈ່າຍ (Paid Amount)',
      'ຊ່ອງທາງຈ່າຍ (Method)',
      'ໝາຍເຫດ/ໃບບິນ (Receipt/Note)',
    ],
  ];

  contract.schedule.forEach((item) => {
    let statusText = 'ລໍຖ້າຊຳລະ (Pending)';
    if (item.status === 'paid') statusText = 'ຈ່າຍແລ້ວ (Paid)';
    else if (item.status === 'overdue') statusText = 'ກາຍກຳນົດ (Overdue)';
    else if (item.status === 'due_soon') statusText = 'ໃກ້ຮອດກຳນົດ (Due Soon)';

    summaryValues.push([
      item.period,
      item.dueDate,
      item.installmentAmount,
      item.principalAmount,
      item.interestAmount,
      item.cumulativeInterest,
      item.remainingBalance,
      statusText,
      item.paidDate || '-',
      item.paidAmount ? item.paidAmount : (item.status === 'paid' ? item.installmentAmount : '-'),
      item.paymentMethod || '-',
      item.receiptNote || '-',
    ]);
  });

  // 3. Prepare Comparison Matrix (Sheet 2)
  const matrixValues: (string | number)[][] = [
    [`ຕາຕະລາງຄິດໄລ່ດອກເບ້ຍ ແລະ ຜ່ອນລົດ (${contract.storeName})`],
    ['ປະເພດລົດ:', contract.vehicleType],
    ['ລາຄາລົດ:', contract.totalPrice, contract.currency],
    [''],
    [
      'ລາຄາລວມ',
      'ຈ່າຍກ່ອນ (%)',
      'ຈຳນວນເງິນວາງດາວ',
      'ຍອດຍັງຄ້າງ',
      'ດອກເບ້ຍ/ເດືອນ',
      'ດອກເບ້ຍຕໍ່ເດືອນ ($)',
      '12 ເດືອນ (1 ປີ)',
      '24 ເດືອນ (2 ປີ)',
      '36 ເດືອນ (3 ປີ)',
      '48 ເດືອນ (4 ປີ)',
      '60 ເດືອນ (5 ປີ)',
      'ໝາຍເຫດ',
    ],
  ];

  matrix.forEach((row) => {
    matrixValues.push([
      contract.totalPrice,
      `${row.downPercent}%`,
      row.downAmount,
      row.loanAmount,
      `${row.monthlyInterestRate}%`,
      row.monthlyInterestAmount,
      row.terms.find(t => t.months === 12)?.monthlyInstallment || '-',
      row.terms.find(t => t.months === 24)?.monthlyInstallment || '-',
      row.terms.find(t => t.months === 36)?.monthlyInstallment || '-',
      row.terms.find(t => t.months === 48)?.monthlyInstallment || '-',
      row.terms.find(t => t.months === 60)?.monthlyInstallment || '-',
      'ຕ້ອງຊຳລະທຸກເດືອນ',
    ]);
  });

  // 4. Prepare Required Documents (Sheet 3)
  const docValues: (string | number)[][] = [
    ['ເອກະສານສຳລັບການຈ່າຍຜ່ອນລົດ (Required Documents for Auto Loan)'],
    [''],
    ['1. ບຸກຄົນທົ່ວໄປ (General Individuals / Employees)', '2. ບຸກຄົນທີ່ມີທຸລະກິດສ່ວນຕົວ (Self-Employed / Business)', '3. ບໍລິສັດ (Company / Corporate)'],
    ['• ສຳເນົາບັດປະຈຳຕົວ ຫຼື ສຳມະໂນຄົວ', '• ສຳເນົາບັດປະຈຳຕົວ ຫຼື ສຳມະໂນຄົວ', '• ໃບທະບຽນວິສາຫະກິດ / ໃບອະນຸຍາດດຳເນີນທຸລະກິດ'],
    ['• ໃບຢັ້ງຢືນເງິນເດືອນ ຫຼື ໃບຢັ້ງຢືນການເຮັດວຽກ', '• ໃບທະບຽນທຸລະກິດ ຫຼື ໃບອະນຸຍາດການຄ້າ (ຖ້າມີ)', '• ໃບຢັ້ງຢືນການເສຍອາກອນຫຼ້າສຸດ'],
    ['• ໃບສະຫຼຸບບັນຊີທະນາຄານຍ້ອນຫຼັງ 3-6 ເດືອນ (Bank Statement)', '• ໃບສະຫຼຸບບັນຊີທະນາຄານຍ້ອນຫຼັງ 6 ເດືອນ (Bank Statement)', '• ໃບສະຫຼຸບບັນຊີທະນາຄານບໍລິສັດ 6 ເດືອນ'],
    ['• ໃບຢັ້ງຢືນທີ່ຢູ່ຈາກນາຍບ້ານ', '• ຮູບຖ່າຍສະຖານທີ່ດຳເນີນທຸລະກິດ / ຮ້ານຄ້າ', '• ໃບມອບສິດ (ຖ້າຜູ້ຕາງໜ້າເປັນຜູ້ເຊັນ)'],
    ['• ເອກະສານຜູ້ຄ້ຳປະກັນ (ຖ້າມີ)', '• ໃບຢັ້ງຢືນທີ່ຢູ່ຈາກນາຍບ້ານ', '• ບັດປະຈຳຕົວຂອງກຳມະການຜູ້ມີອຳນາດລົງລາຍເຊັນ'],
  ];

  // Write all sheets values in batch
  const writeRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: [
          {
            range: "'ສະຫຼຸບ ແລະ ຕາຕະລາງຄ່າງວດ'!A1",
            values: summaryValues,
          },
          {
            range: "'ຕາຕະລາງສົມທຽບ (VK Matrix)'!A1",
            values: matrixValues,
          },
          {
            range: "'ເອກະສານປະກອບ'!A1",
            values: docValues,
          },
        ],
      }),
    }
  );

  if (!writeRes.ok) {
    console.error('Error writing spreadsheet rows:', await writeRes.text());
  }

  return { spreadsheetId, spreadsheetUrl };
}

/**
 * Updates an existing Google Spreadsheet when payments are recorded
 */
export async function syncScheduleToGoogleSheet(
  spreadsheetId: string,
  contract: LoanContract,
  accessToken: string
): Promise<boolean> {
  const scheduleRows: (string | number)[][] = contract.schedule.map((item) => {
    let statusText = 'ລໍຖ້າຊຳລະ (Pending)';
    if (item.status === 'paid') statusText = 'ຈ່າຍແລ້ວ (Paid)';
    else if (item.status === 'overdue') statusText = 'ກາຍກຳນົດ (Overdue)';
    else if (item.status === 'due_soon') statusText = 'ໃກ້ຮອດກຳນົດ (Due Soon)';

    return [
      item.period,
      item.dueDate,
      item.installmentAmount,
      item.principalAmount,
      item.interestAmount,
      item.cumulativeInterest,
      item.remainingBalance,
      statusText,
      item.paidDate || '-',
      item.paidAmount ? item.paidAmount : (item.status === 'paid' ? item.installmentAmount : '-'),
      item.paymentMethod || '-',
      item.receiptNote || '-',
    ];
  });

  const range = `'ສະຫຼຸບ ແລະ ຕາຕະລາງຄ່າງວດ'!A15:L${14 + scheduleRows.length}`;
  
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range,
        values: scheduleRows,
      }),
    }
  );

  return res.ok;
}

/**
 * Generates copy-paste ready Google Apps Script code for reminders & webhooks
 */
export function generateAppsScriptTemplate(spreadsheetId: string, contractCarName: string, storeName: string): string {
  return `/**
 * Google Apps Script - ລະບົບແຈ້ງເຕືອນຄ່າງວດຜ່ອນລົດອັດຕະໂນມັດ
 * ລົດ: ${contractCarName} | ຮ້ານ/ໂຊຣູມ: ${storeName}
 * 
 * ຄູ່ມືການຕິດຕັ້ງ:
 * 1. ເປີດ Google Sheet ຂອງທ່ານ > ເລືອກ Extensions > Apps Script
 * 2. ລຶບໂຄດເກົ່າອອກ ແລ້ວວາງໂຄດດ້ານລຸ່ມນີ້ໃສ່
 * 3. ປັບປ່ຽນອີເມວ ຫຼື LINE Notify Token ຕາມຕ້ອງການ
 * 4. ກົດ Save ແລະ ຕັ້ງ Trigger (ຮູບໂມງ) ໃຫ້ເຮັດວຽກທຸກໆເຊົ້າ 08:00
 */

const SPREADSHEET_ID = "${spreadsheetId || 'YOUR_SPREADSHEET_ID'}";
const NOTIFY_EMAIL = Session.getActiveUser().getEmail(); // ສົ່ງຫາອີເມວຂອງທ່ານ
const LINE_NOTIFY_TOKEN = ""; // ໃສ່ LINE Notify Token ຖ້າຕ້ອງການແຈ້ງເຕືອນເຂົ້າ LINE

function checkInstallmentDueAndNotify() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName("ສະຫຼຸບ ແລະ ຕາຕະລາງຄ່າງວດ");
  if (!sheet) return;

  const data = sheet.getDataRange().getValues();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // ຊອກຫາແຖວຕາຕະລາງຄ່າງວດ (ເລີ່ມຈາກແຖວທີ 15 ເປັນຕົ້ນໄປ)
  for (let i = 14; i < data.length; i++) {
    const period = data[i][0];
    const dueDateStr = data[i][1];
    const amount = data[i][2];
    const status = data[i][7];

    if (!dueDateStr || status.toString().includes("ຈ່າຍແລ້ວ")) continue;

    const dueDate = new Date(dueDateStr);
    dueDate.setHours(0, 0, 0, 0);

    const diffDays = Math.round((dueDate - today) / (1000 * 60 * 60 * 24));

    // ແຈ້ງເຕືອນຖ້າຮອດກຳນົດໃນ 3 ມື້ ຫຼື ກາຍກຳນົດ
    if (diffDays <= 3 && diffDays >= 0) {
      const msg = "🚗 ແຈ້ງເຕືອນຄ່າງວດລົດ (" + "${contractCarName}" + ")\\n" +
                  "📌 ຮ້ານ: " + "${storeName}" + "\\n" +
                  "🔢 ງວດທີ: " + period + "\\n" +
                  "💰 ຈຳນວນເງິນ: " + amount + "\\n" +
                  "📅 ກຳນົດຊຳລະ: " + dueDateStr + " (ຍັງອີກ " + diffDays + " ມື້)\\n" +
                  "👉 ກະລຸນາກວດສອບ ແລະ ຊຳລະໃຫ້ກົງເວລາ";
      
      sendEmailReminder("ແຈ້ງເຕືອນຄ່າງວດລົດງວດທີ " + period, msg);
      if (LINE_NOTIFY_TOKEN) sendLineNotify(msg);
      break;
    } else if (diffDays < 0) {
      const msg = "⚠️ ແຈ້ງເຕືອນດ່ວນ! ຄ່າງວດລົດກາຍກຳນົດ (" + "${contractCarName}" + ")\\n" +
                  "🔢 ງວດທີ: " + period + "\\n" +
                  "💰 ຈຳນວນເງິນ: " + amount + "\\n" +
                  "📅 ກຳນົດຊຳລະ: " + dueDateStr + " (ກາຍກຳນົດມາແລ້ວ " + Math.abs(diffDays) + " ມື້)";
      
      sendEmailReminder("⚠️ ຄ່າງວດລົດກາຍກຳນົດ ງວດທີ " + period, msg);
      if (LINE_NOTIFY_TOKEN) sendLineNotify(msg);
      break;
    }
  }
}

function sendEmailReminder(subject, body) {
  if (NOTIFY_EMAIL) {
    MailApp.sendEmail(NOTIFY_EMAIL, subject, body);
    Logger.log("Email sent to: " + NOTIFY_EMAIL);
  }
}

function sendLineNotify(message) {
  if (!LINE_NOTIFY_TOKEN) return;
  const url = "https://notify-api.line.me/api/notify";
  const options = {
    method: "post",
    headers: { "Authorization": "Bearer " + LINE_NOTIFY_TOKEN },
    payload: { "message": message }
  };
  UrlFetchApp.fetch(url, options);
}
`;
}
