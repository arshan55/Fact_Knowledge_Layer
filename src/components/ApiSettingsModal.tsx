import React, { useState } from 'react';
import { X, Key, ShieldCheck } from 'lucide-react';

interface ApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveKey: (key: string, provider: 'openai' | 'gemini') => void;
  currentKey: string;
  currentProvider: 'openai' | 'gemini';
}

export const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({
  isOpen,
  onClose,
  onSaveKey,
  currentKey,
  currentProvider
}) => {
  const [keyInput, setKeyInput] = useState(currentKey);
  const [provider, setProvider] = useState<'openai' | 'gemini'>(currentProvider);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveKey(keyInput, provider);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-600 text-white">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">LLM API Settings</h3>
              <p className="text-xs text-slate-500">Optional: Connect OpenAI or Gemini key</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
            <div className="flex items-center gap-1.5 font-bold mb-0.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Offline AI Engine Available
            </div>
            If no key is provided, the system uses a deterministic rule engine that works 100% offline out-of-the-box.
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Provider Selection</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setProvider('openai')}
                className={`py-2 px-3 rounded-lg text-xs font-bold border transition ${
                  provider === 'openai'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                OpenAI (GPT-4o)
              </button>
              <button
                type="button"
                onClick={() => setProvider('gemini')}
                className={`py-2 px-3 rounded-lg text-xs font-bold border transition ${
                  provider === 'gemini'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                Google Gemini
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">API Key</label>
            <input
              type="password"
              placeholder="sk-... or AIzaSy..."
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 font-mono"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-3.5 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
