import React from 'react';
import { ShieldCheck, ArrowRight, X } from 'lucide-react';

interface LoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (success: boolean) => void;
}

const LoginDialog: React.FC<LoginDialogProps> = ({ isOpen, onClose, onLogin }) => {
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-[28px] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
            <ShieldCheck className="w-8 h-8" />
          </div>
          
          <h2 className="text-2xl text-gray-900 font-medium mb-2">Admin Access</h2>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed">
            Enter the administration dashboard to manage schedules, teachers, and rooms.
          </p>

          <form onSubmit={handleSubmit} className="w-full">
            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white py-3.5 rounded-full font-medium shadow-lg shadow-blue-200 hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
            >
              Enter Dashboard 
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button 
              type="button" 
              onClick={onClose}
              className="mt-4 text-gray-500 hover:text-gray-700 text-sm font-medium px-4 py-2 rounded-full hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginDialog;