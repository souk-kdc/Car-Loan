import React from 'react';
import { 
  X, 
  AlertCircle, 
  ExternalLink, 
  CheckCircle2, 
  Copy, 
  FileSpreadsheet, 
  Globe, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

interface AuthHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  errorCode?: string;
  errorMessage?: string;
  activeLanguage: 'lo' | 'en';
}

export const AuthHelpModal: React.FC<AuthHelpModalProps> = ({
  isOpen,
  onClose,
  errorCode = 'auth/unauthorized-domain',
  errorMessage,
  activeLanguage,
}) => {
  const [copiedDomain, setCopiedDomain] = React.useState(false);
  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : 'souk-kdc.github.io';

  if (!isOpen) return null;

  const handleCopyDomain = () => {
    navigator.clipboard.writeText(currentHostname);
    setCopiedDomain(true);
    setTimeout(() => setCopiedDomain(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-slate-200 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden my-6 text-slate-900 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-amber-50 border-b border-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 shadow-2xs">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-amber-950">
                {activeLanguage === 'lo' ? 'ແກ້ໄຂການ Sign In ເຂົ້າ Google (Domain Authorization)' : 'Google Sign-in Configuration'}
              </h3>
              <p className="text-xs text-amber-700">
                {errorCode ? `Error: ${errorCode}` : 'Google Authentication Notice'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Explanation */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
            <div className="font-semibold text-slate-800 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-blue-600" />
              <span>
                {activeLanguage === 'lo' 
                  ? `ສາເຫດ: ໂດເມນ ${currentHostname} ຍັງບໍ່ໄດ້ຖືກອະນຸຍາດໃນ Firebase` 
                  : `Reason: Domain ${currentHostname} is not authorized yet in Firebase Auth`}
              </span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              {activeLanguage === 'lo'
                ? 'ເນື່ອງຈາກລະບົບຄວາມປອດໄພຂອງ Google & Firebase ຈະບລັອກການ Login ຈາກໂດເມນໃໝ່ ຖ້າຫາກຍັງບໍ່ທັນໄດ້ເພີ່ມຊື່ໂດເມນເຂົ້າໃນ Authorized Domains.'
                : 'Google and Firebase security blocks sign-ins from any new domain unless explicitly whitelisted in the Firebase Console.'}
            </p>
          </div>

          {/* Step-by-Step Fix */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{activeLanguage === 'lo' ? 'ວິທີແກ້ໄຂ (ໃຊ້ເວລາພຽງ 1 ນາທີ):' : 'How to Authorize Your GitHub Domain (1 minute):'}</span>
            </h4>

            <ol className="space-y-2.5 text-xs text-slate-700">
              <li className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
                <div>
                  <p className="font-medium text-slate-900">
                    {activeLanguage === 'lo' ? 'ເປີດ Firebase Console:' : 'Open Firebase Console:'}
                  </p>
                  <a
                    href="https://console.firebase.google.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold mt-1 underline underline-offset-2"
                  >
                    <span>https://console.firebase.google.com</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </li>

              <li className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
                <div>
                  <p className="font-medium text-slate-900">
                    {activeLanguage === 'lo'
                      ? 'ເລືອກໂຄງການຂອງທ່ານ > ໄປທີ່ Authentication > ເລືອກແທັບ Settings'
                      : 'Select your project > Go to Authentication > Click the Settings tab'}
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</span>
                <div className="w-full">
                  <p className="font-medium text-slate-900">
                    {activeLanguage === 'lo'
                      ? 'ເລື່ອນຫາຫົວຂໍ້ Authorized domains > ກົດ Add domain ແລ້ວວາງໂດເມນນີ້ໃສ່:'
                      : 'Scroll down to Authorized domains > Click "Add domain" and enter:'}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <code className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-blue-700 font-mono text-xs font-bold select-all">
                      {currentHostname}
                    </code>
                    <button
                      onClick={handleCopyDomain}
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg border border-blue-200 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      {copiedDomain ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedDomain ? (activeLanguage === 'lo' ? 'ກັອບແລ້ວ' : 'Copied') : (activeLanguage === 'lo' ? 'ກັອບປີ້ໂດເມນ' : 'Copy Domain')}</span>
                    </button>
                  </div>
                </div>
              </li>
            </ol>
          </div>

          {/* Alternative: Works without login */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 text-xs space-y-2">
            <div className="font-bold text-emerald-900 flex items-center gap-1.5">
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
              <span>{activeLanguage === 'lo' ? 'ທາງເລືອກ: ໃຊ້ງານ Google Sheets ໂດຍບໍ່ຕ້ອງ Sign In' : 'Alternative: Use Google Sheets without Sign In'}</span>
            </div>
            <p className="text-emerald-800 leading-relaxed">
              {activeLanguage === 'lo'
                ? 'ທ່ານສາມາດໃຊ້ຟັງຊັນ "ສຳເນົາຕາຕະລາງ (Copy to Sheets)", "ດາວໂຫຼດ CSV" ຫຼື ໃຊ້ "Apps Script Web App" ເພື່ອສົ່ງຂໍ້ມູນລົງ Google Sheets ໄດ້ທັນທີໂດຍບໍ່ຈຳເປັນຕ້ອງ Sign In.'
                : 'You can use "Copy to Sheets", "Download CSV", or "Apps Script Web App" to sync data directly to Google Sheets without needing OAuth sign in.'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs cursor-pointer"
          >
            {activeLanguage === 'lo' ? 'ເຂົ້າໃຈແລ້ວ (Close)' : 'Got it'}
          </button>
        </div>
      </div>
    </div>
  );
};
