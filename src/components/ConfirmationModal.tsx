import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import { Portal } from './ui';

interface ConfirmationModalProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ message, onConfirm, onCancel }) => (
  <Portal>
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-industrial-900/40 backdrop-blur-sm">
      <div className="bg-white border-2 border-industrial-200 rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-industrial-100 px-6 py-4 border-b-2 border-industrial-200 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            <h2 className="text-sm font-black text-industrial-900 tracking-wider uppercase">Confirm Action</h2>
          </div>
          <button onClick={onCancel} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-industrial-200 text-industrial-400">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          <p className="text-sm font-bold text-industrial-700 uppercase tracking-wide text-center mb-6">{message}</p>
          <div className="flex gap-4">
            <button onClick={onCancel} className="flex-1 py-2.5 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300 uppercase tracking-widest text-sm transition-colors">Cancel</button>
            <button onClick={onConfirm} style={{ backgroundColor: '#4a35e8' }} className="flex-1 py-2.5 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700 shadow-md shadow-brand-600/20 uppercase tracking-widest text-sm transition-all active:scale-[0.99]">Confirm</button>
          </div>
        </div>
      </div>
    </div>
  </Portal>
);

export default ConfirmationModal;