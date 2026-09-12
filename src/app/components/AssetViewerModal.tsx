import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { API_BASE } from '../api/client';

type Asset = {
  _id: string;
  title: string;
  description: string;
  fileMime: string;
  fileName?: string;
  price: number;
  owned?: boolean;
};

type Props = {
  asset: Asset | null;
  onClose: () => void;
};

export default function AssetViewerModal({ asset, onClose }: Props) {
  if (!asset) return null;

  const token = document.cookie.match(/auth_token=([^;]+)/)?.[1] || document.cookie.match(/token=([^;]+)/)?.[1] || '';
  const viewUrl = `${API_BASE}/store/${asset._id}/download?view=true&token=${token}`;
  const downloadUrl = `${API_BASE}/store/${asset._id}/download?token=${token}`;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => onClose()}
      >
        <motion.div
          className="bg-white dark:bg-[#111] w-full max-w-full h-full flex flex-col relative"
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/10 shrink-0">
            <h2 className="text-lg font-bold text-[#0a2617] dark:text-white truncate pr-4">{asset.title}</h2>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 transition shrink-0">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-hidden relative bg-gray-50 dark:bg-[#1a1a1a]">
            {/* Native PDF iframe rendering */}
            {asset.fileMime === 'application/pdf' ? (
              <iframe 
                src={viewUrl} 
                className="w-full h-full border-0" 
                title={asset.title}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center p-6">
                <div className="bg-white dark:bg-[#222] px-6 py-4 rounded-xl border border-gray-200 dark:border-white/10 text-center">
                  <p className="text-[#0a2617] dark:text-gray-200 font-medium mb-2">
                    Preview is not available for this file type. Please download the file to view it.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="p-4 border-t border-gray-100 dark:border-white/10 shrink-0 flex gap-3 justify-end bg-white dark:bg-[#111] rounded-b-2xl">
            {asset.price === 0 || asset.owned ? (
              <a href={downloadUrl} download={asset.fileName || `${asset.title}.pdf`} className="px-5 py-2.5 bg-[#0d5d3a] text-white rounded-xl hover:bg-[#0a4a2e] font-bold text-sm transition">
                Download File
              </a>
            ) : (
              <button className="px-5 py-2.5 bg-gray-400 text-white rounded-xl cursor-not-allowed font-bold text-sm" disabled title="Premium asset – download disabled">
                Purchase to Download
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
