import React, { useState } from 'react';
import { X, Store as StoreIcon, Plus, Trash2, Phone, MapPin, Check, Building2 } from 'lucide-react';
import { Store } from '../types';

interface StoreManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  stores: Store[];
  onAddStore: (store: Store) => void;
  onDeleteStore: (storeId: string) => void;
  activeLanguage: 'lo' | 'en';
}

export const StoreManagerModal: React.FC<StoreManagerModalProps> = ({
  isOpen,
  onClose,
  stores,
  onAddStore,
  onDeleteStore,
  activeLanguage,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newStore: Store = {
      id: `store_${Date.now()}`,
      name: name.trim(),
      phone: phone.trim() || undefined,
      location: location.trim() || undefined,
    };

    onAddStore(newStore);
    setName('');
    setPhone('');
    setLocation('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden my-6 text-slate-900">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-2xs">
              <StoreIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {activeLanguage === 'lo' ? 'ຈັດການໂຊຣູມ & ຮ້ານຄ້າ' : 'Dealership & Store Manager'}
              </h3>
              <p className="text-xs text-slate-500">
                {activeLanguage === 'lo' ? 'ເພີ່ມ ແລະ ຈັດການລາຍຊື່ຮ້ານຄ້າທີ່ຮອງຮັບ' : 'Add custom showrooms & stores'}
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

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Add New Store Form */}
          <form onSubmit={handleAdd} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 shadow-2xs">
            <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider">
              {activeLanguage === 'lo' ? '+ ເພີ່ມໂຊຣູມ / ຮ້ານຄ້າໃໝ່' : '+ Add New Store'}
            </h4>

            <div>
              <label className="block text-xs text-slate-700 font-medium mb-1">
                {activeLanguage === 'lo' ? 'ຊື່ຮ້ານຄ້າ / ໂຊຣູມ *' : 'Store Name *'}
              </label>
              <input
                type="text"
                required
                placeholder="e.g. VK group showroom, Toyota Lao, BYD..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-700 font-medium mb-1">
                  {activeLanguage === 'lo' ? 'ເບີໂທຕິດຕໍ່' : 'Phone'}
                </label>
                <input
                  type="text"
                  placeholder="020 xxxx xxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-700 font-medium mb-1">
                  {activeLanguage === 'lo' ? 'ສະຖານທີ່ / ສາຂາ' : 'Location'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. ວຽງຈັນ, ປາກເຊ..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{activeLanguage === 'lo' ? 'ບັນທຶກຮ້ານຄ້າໃໝ່' : 'Add Store'}</span>
            </button>
          </form>

          {/* Store List */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              {activeLanguage === 'lo' ? `ລາຍຊື່ຮ້ານຄ້າທັງໝົດ (${stores.length})` : `All Stores (${stores.length})`}
            </h4>

            <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar">
              {stores.map((store) => (
                <div
                  key={store.id}
                  className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-3 hover:border-slate-300 shadow-2xs transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-xs text-slate-900 truncate">{store.name}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2">
                        {store.phone && <span>📞 {store.phone}</span>}
                        {store.location && <span>📍 {store.location}</span>}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteStore(store.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Delete Store"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
