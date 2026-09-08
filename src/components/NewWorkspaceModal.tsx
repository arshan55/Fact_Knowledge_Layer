import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, FolderPlus } from 'lucide-react';

interface NewWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, emoji: string) => void;
}

const EMOJIS = ['📁', '🏦', '⚖️', '📊', '🏢', '🔬', '📋', '🗂️', '💼', '🌐', '🔖', '📑'];

export const NewWorkspaceModal: React.FC<NewWorkspaceModalProps> = ({
  isOpen, onClose, onCreate
}) => {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('📁');

  const handleCreate = () => {
    if (!name.trim()) return;
    onCreate(name.trim(), emoji);
    setName('');
    setEmoji('📁');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-sm bg-white rounded-[1.8rem] border-[1.6px] border-[#E5E5E9] shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E5E9]">
          <div className="flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-[#2B2B2B]">New Workspace</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#F4F4FB] text-[#838385] transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-bold text-[#717077] uppercase tracking-wider mb-2">
              Workspace Name
            </label>
            <input
              autoFocus
              type="text"
              placeholder="e.g. Acme Corp Q3 Analysis"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              className="w-full px-4 py-2.5 bg-[#F4F4FB] border border-[#E5E5E9] rounded-2xl text-xs text-[#2B2B2B] placeholder-[#838385] focus:outline-none focus:border-emerald-600 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#717077] uppercase tracking-wider mb-2">
              Icon
            </label>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map(e => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition border ${
                    emoji === e
                      ? 'bg-emerald-50 border-emerald-400 scale-110 shadow-sm'
                      : 'bg-[#F4F4FB] border-[#E5E5E9] hover:bg-white'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-[#E5E5E9] bg-[#F4F4FB]">
          <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-[#717077] hover:text-[#2B2B2B] transition">
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!name.trim()}
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-emerald-600/20 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Workspace
          </button>
        </div>
      </motion.div>
    </div>
  );
};
