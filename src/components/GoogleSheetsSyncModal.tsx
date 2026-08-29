import React, { useState } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  ExternalLink, 
  Copy, 
  Check, 
  RefreshCw, 
  Code2, 
  Sparkles, 
  ShieldCheck, 
  AlertCircle,
  FileCheck,
  Download,
  ClipboardList,
  HelpCircle,
  Send
} from 'lucide-react';
import { User } from 'firebase/auth';
import { LoanContract } from '../types';
import { 
  generateAppsScriptTemplate, 
  copyScheduleToClipboard, 
  downloadScheduleAsCsv, 
  syncToAppsScriptWebhook 
} from '../services/googleSheets';

interface GoogleSheetsSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: LoanContract;
  user: User | null;
  onSignIn: () => void;
  onSync: () => void;
  onOpenAuthHelp?: () => void;
  isSyncing: boolean;
  syncSuccessUrl?: string;
  activeLanguage: 'lo' | 'en';
}

export const GoogleSheetsSyncModal: React.FC<GoogleSheetsSyncModalProps> = ({
  isOpen,
  onClose,
  contract,
  user,
  onSignIn,
  onSync,
  onOpenAuthHelp,
  isSyncing,
  syncSuccessUrl,
  activeLanguage,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'sync' | 'script' | 'direct'>('sync');
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedTable, setCopiedTable] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isWebhookSyncing, setIsWebhookSyncing] = useState(false);
  const [webhookResult, setWebhookResult] = useState<{ success?: boolean; message?: string } | null>(null);

  const scriptCode = generateAppsScriptTemplate(
    contract.spreadsheetId || 'YOUR_SPREADSHEET_ID',
    contract.carName,
    contract.storeName
  );

  const handleCopyScript = () => {
    navigator.clipboard.writeText(scriptCode);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  const handleCopyTable = () => {
    const success = copyScheduleToClipboard(contract);
    if (success) {
      setCopiedTable(true);
      setTimeout(() => setCopiedTable(false), 2500);
    }
  };

  const handleDownloadCsv = () => {
    downloadScheduleAsCsv(contract);
  };

  const handleWebhookSync = async () => {
    if (!webhookUrl.trim()) return;
    setIsWebhookSyncing(true);
    setWebhookResult(null);
    try {
      const res = await syncToAppsScriptWebhook(webhookUrl.trim(), contract);
      setWebhookResult({ success: true, message: res.message || 'Synced successfully!' });
    } catch (e: any) {
      setWebhookResult({ success: false, message: e.message || 'Sync failed' });
    } finally {
      setIsWebhookSyncing(false);
    }
  };

  const spreadsheetLink = syncSuccessUrl || contract.spreadsheetUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden my-6 text-slate-900 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-2xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {activeLanguage === 'lo' ? 'ເຊື່ອມຕໍ່ Google Sheets & Apps Script' : 'Google Sheets & Apps Script Sync'}
              </h3>
              <p className="text-xs text-slate-500">
                {contract.carName} • {contract.storeName}
              </p>
            </div>
          </div>
          <button
            id="btn-close-sheets-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 px-6 pt-2 overflow-x-auto no-scrollbar">
          <button
            id="tab-sheets-sync"
            onClick={() => setActiveTab('sync')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'sync'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{activeLanguage === 'lo' ? 'Google Sheets Sync' : 'Google Sheets Sync'}</span>
          </button>

          <button
            id="tab-sheets-direct"
            onClick={() => setActiveTab('direct')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'direct'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>{activeLanguage === 'lo' ? 'ສົ່ງອອກໂດຍກົງ (CSV / Copy)' : 'Direct Export'}</span>
          </button>

          <button
            id="tab-sheets-script"
            onClick={() => setActiveTab('script')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'script'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>{activeLanguage === 'lo' ? 'Apps Script (ແຈ້ງເຕືອນອັດຕະໂນມັດ)' : 'Apps Script'}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {activeTab === 'sync' && (
            <div className="space-y-4">
              {/* Account Status Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    user ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {user ? (user.displayName?.charAt(0) || user.email?.charAt(0)) : '?'}
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block">
                      {activeLanguage === 'lo' ? 'ບັນຊີ Google ທີ່ເຊື່ອມຕໍ່:' : 'Google Account:'}
                    </span>
                    <span className="text-sm font-semibold text-slate-900">
                      {user ? (user.displayName || user.email) : (activeLanguage === 'lo' ? 'ຍັງບໍ່ທັນເຂົ້າສູ່ລະບົບ' : 'Not signed in')}
                    </span>
                  </div>
                </div>

                {!user && (
                  <div className="flex items-center gap-2">
                    <button
                      id="btn-sheets-signin-google"
                      onClick={onSignIn}
                      className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      Sign in with Google
                    </button>
                    {onOpenAuthHelp && (
                      <button
                        onClick={onOpenAuthHelp}
                        className="p-2 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-200/50 transition-colors"
                        title="Help / Domain setup"
                      >
                        <HelpCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* What will be synced */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5 shadow-2xs">
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">
                  {activeLanguage === 'lo' ? 'ຂໍ້ມູນທີ່ຈະຖືກສ້າງໃນ Google Sheet' : 'What will be written to Google Sheet'}
                </span>
                <ul className="text-xs text-slate-700 space-y-1.5">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span><b>ແຜ່ນທີ 1:</b> ສະຫຼຸບສັນຍາ & ຕາຕະລາງຄ່າງວດທຸກໆງວດ ພ້ອມປະຫວັດການຊຳລະ</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span><b>ແຜ່ນທີ 2:</b> ຕາຕະລາງສົມທຽບ VK Matrix (12-60 ເດືອນ x 50-80% ວາງດາວ)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span><b>ແຜ່ນທີ 3:</b> ລາຍການເອກະສານປະກອບສຳລັບການຜ່ອນລົດ (ບຸກຄົນທົ່ວໄປ/ທຸລະກິດ/ບໍລິສັດ)</span>
                  </li>
                </ul>
              </div>

              {/* Spreadsheet Status & Direct Link */}
              {spreadsheetLink && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-3">
                    <FileCheck className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                    <div>
                      <span className="text-xs text-emerald-800 font-bold block">
                        {activeLanguage === 'lo' ? 'Google Sheet ພ້ອມໃຊ້ງານແລ້ວ' : 'Google Sheet Ready'}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {contract.lastSyncedAt ? `ຊິງຄ໌ຫຼ້າສຸດ: ${new Date(contract.lastSyncedAt).toLocaleString('lo-LA')}` : ''}
                      </span>
                    </div>
                  </div>

                  <a
                    id="btn-open-google-sheets-link"
                    href={spreadsheetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all active:scale-95 cursor-pointer"
                  >
                    <span>{activeLanguage === 'lo' ? 'ເປີດໃນ Google Sheets' : 'Open in Google Sheets'}</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}

              {/* Sync Action Button */}
              <div className="pt-2">
                <button
                  id="btn-trigger-sheets-sync"
                  onClick={onSync}
                  disabled={!user || isSyncing}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>
                    {isSyncing
                      ? (activeLanguage === 'lo' ? 'ກຳລັງສ້າງ ແລະ ຊິງຄ໌ຂໍ້ມູນ...' : 'Exporting to Google Sheets...')
                      : (activeLanguage === 'lo' ? 'ສົ່ງອອກ ແລະ ຊິງຄ໌ຂໍ້ມູນລົງ Google Sheets' : 'Export & Sync to Google Sheets')}
                  </span>
                </button>
                {!user && (
                  <div className="text-center mt-2 space-y-1">
                    <p className="text-[11px] text-amber-600 font-medium">
                      {activeLanguage === 'lo' ? '* ກະລຸນາເຂົ້າສູ່ລະບົບດ້ວຍ Google ກ່ອນເພື່ອຊິງຄ໌' : '* Please sign in with Google first'}
                    </p>
                    {onOpenAuthHelp && (
                      <button
                        onClick={onOpenAuthHelp}
                        className="text-[11px] text-blue-600 hover:underline font-semibold"
                      >
                        {activeLanguage === 'lo' ? '👉 ວິທີຕັ້ງຄ່າ Authorized Domain ໃນ Firebase' : '👉 Firebase Domain Setup Guide'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'direct' && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-3 shadow-2xs">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-blue-600" />
                  <span>{activeLanguage === 'lo' ? 'ສົ່ງອອກໂດຍບໍ່ຕ້ອງ Sign In (100% Offline & Direct)' : 'Direct Export without Login'}</span>
                </h4>
                <p className="text-slate-600">
                  {activeLanguage === 'lo'
                    ? 'ທ່ານສາມາດກັອບປີ້ຕາຕະລາງໄປວາງໃນ Google Sheets ຫຼື ດາວໂຫຼດໄຟລ໌ CSV ໄປເປີດໃນ Excel ໄດ້ທັນທີໂດຍບໍ່ຕ້ອງລັອກອິນ.'
                    : 'You can copy the schedule data and paste directly into Google Sheets or download a CSV file.'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    id="btn-copy-table-to-sheets"
                    onClick={handleCopyTable}
                    className="p-3 bg-white border border-slate-300 hover:border-blue-500 rounded-xl flex items-center gap-3 transition-all shadow-2xs cursor-pointer text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      {copiedTable ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block text-xs">
                        {copiedTable ? (activeLanguage === 'lo' ? 'ກັອບປີ້ແລ້ວ!' : 'Copied!') : (activeLanguage === 'lo' ? 'ສຳເນົາຕາຕະລາງ (Copy)' : 'Copy to Clipboard')}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {activeLanguage === 'lo' ? 'ກົດແລ້ວໄປກົດ Ctrl+V ໃນ Google Sheet' : 'Paste into Google Sheet'}
                      </span>
                    </div>
                  </button>

                  <button
                    id="btn-download-csv"
                    onClick={handleDownloadCsv}
                    className="p-3 bg-white border border-slate-300 hover:border-emerald-500 rounded-xl flex items-center gap-3 transition-all shadow-2xs cursor-pointer text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <Download className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block text-xs">
                        {activeLanguage === 'lo' ? 'ດາວໂຫຼດໄຟລ໌ CSV' : 'Download CSV File'}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {activeLanguage === 'lo' ? 'ເປີດໄດ້ທັງ Excel & Google Sheets' : 'Compatible with Excel & Sheets'}
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Webhook Sync Section */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-3 shadow-2xs">
                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                  <Send className="w-4 h-4 text-emerald-600" />
                  <span>{activeLanguage === 'lo' ? 'ຊິງຄ໌ຜ່ານ Google Apps Script Web App URL' : 'Sync via Apps Script Web App URL'}</span>
                </h4>
                <p className="text-slate-600">
                  {activeLanguage === 'lo'
                    ? 'ຖ້າທ່ານໄດ້ Deploy Apps Script ເປັນ Web App, ສາມາດວາງ URL ໃສ່ບ່ອນນີ້ເພື່ອສົ່ງຂໍ້ມູນອັດຕະໂນມັດ:'
                    : 'If you deployed your Apps Script as a Web App, enter the Web App URL below to sync:'}
                </p>

                <div className="flex gap-2">
                  <input
                    type="url"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://script.google.com/macros/s/.../exec"
                    className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <button
                    onClick={handleWebhookSync}
                    disabled={isWebhookSyncing || !webhookUrl.trim()}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isWebhookSyncing ? 'animate-spin' : ''}`} />
                    <span>{isWebhookSyncing ? 'Syncing...' : (activeLanguage === 'lo' ? 'ສົ່ງຂໍ້ມູນ' : 'Sync')}</span>
                  </button>
                </div>

                {webhookResult && (
                  <div className={`p-2.5 rounded-lg text-xs font-semibold ${
                    webhookResult.success ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {webhookResult.message}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'script' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                    {activeLanguage === 'lo' ? 'ໂຄດ Google Apps Script ສຳລັບແຈ້ງເຕືອນອັດຕະໂນມັດ' : 'Google Apps Script Automation Code'}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {activeLanguage === 'lo' ? 'ໃຊ້ສຳລັບແຈ້ງເຕືອນຄ່າງວດຜ່ານ Email ຫຼື LINE ອັດຕະໂນມັດທຸກໆເຊົ້າ' : 'Sends automatic due date reminders via Email or LINE'}
                  </p>
                </div>
                <button
                  id="btn-copy-apps-script"
                  onClick={handleCopyScript}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  {copiedScript ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedScript ? (activeLanguage === 'lo' ? 'ຄັດລອກແລ້ວ!' : 'Copied!') : (activeLanguage === 'lo' ? 'ຄັດລອກໂຄດ' : 'Copy Code')}</span>
                </button>
              </div>

              {/* Step-by-step Setup Guide */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2 text-slate-700 shadow-2xs">
                <span className="font-bold text-slate-900 block">
                  {activeLanguage === 'lo' ? 'ວິທີການຕິດຕັ້ງໃນ Google Sheets:' : 'How to install in Google Sheets:'}
                </span>
                <ol className="list-decimal list-inside space-y-1 text-slate-600">
                  <li>{activeLanguage === 'lo' ? 'ເປີດ Google Sheet ຂອງທ່ານ > ເລືອກເມນູ Extensions > Apps Script' : 'Open Google Sheet > Extensions > Apps Script'}</li>
                  <li>{activeLanguage === 'lo' ? 'ລຶບໂຄດເກົ່າອອກ ແລ້ວວາງໂຄດດ້ານລຸ່ມນີ້ໃສ່' : 'Paste the code below into Code.gs'}</li>
                  <li>{activeLanguage === 'lo' ? 'ກົດ Save (ຮູບແຜ່ນດິດ) ແລ້ວກົດ Run ເພື່ອທົດສອບ' : 'Save and Run to test'}</li>
                  <li>{activeLanguage === 'lo' ? 'ກົດປຸ່ມ Triggers (ຮູບໂມງດ້ານຊ້າຍ) > Add Trigger > ເລືອກໃຫ້ເຮັດວຽກ Time-driven ທຸກໆມື້ 08:00' : 'Add Trigger > Time-driven > Day timer (8:00 AM)'}</li>
                </ol>
              </div>

              {/* Code display */}
              <div className="relative rounded-xl border border-slate-300 bg-slate-900 p-4 font-mono text-[11px] text-emerald-400 overflow-x-auto max-h-64 no-scrollbar shadow-inner">
                <pre>{scriptCode}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

