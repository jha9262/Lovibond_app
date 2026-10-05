import React from "react";
import Button from "../../ui/Button";
import { AlertCircle, X } from "lucide-react";

const ConfirmationModal = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-industrial-900/40 backdrop-blur-sm">
      <div className="bg-white border border-industrial-200 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-industrial-50 px-6 py-4 border-b border-industrial-200 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <h2 className="text-sm font-black text-industrial-900 tracking-wider uppercase">
              CONFIRM ACTION
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-industrial-200 text-industrial-400 hover:text-industrial-900 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          <p className="text-sm font-bold text-industrial-700 uppercase tracking-wide leading-relaxed text-center mb-6">
            {message}
          </p>
          <div className="flex gap-4 pt-2">
            <Button label="CANCEL" variant="secondary" onClick={onCancel} className="flex-1" />
            <Button label="CONFIRM" variant="danger" onClick={onConfirm} className="flex-1" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
