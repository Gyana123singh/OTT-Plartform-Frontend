import React from 'react';
import BaseModal from './BaseModal';
import { CreditCard, Check, ShieldCheck, Zap } from 'lucide-react';

const PaymentModal = ({ isOpen, onClose, plan }) => {
  if (!plan) return null;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Complete Subscription" maxWidth="max-w-md">
      <div className="space-y-6 md:space-y-8">
        {/* Selected Plan Summary */}
        <div className="p-5 md:p-6 bg-gradient-to-br from-primary/20 to-accent/20 border border-white/10 rounded-2xl md:rounded-3xl relative overflow-hidden">
           <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/5 blur-3xl rounded-full" />
           <div className="relative z-10 flex justify-between items-end gap-2">
              <div className="min-w-0">
                 <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Current Selection</p>
                 <h4 className="text-lg md:text-2xl font-black text-white truncate">{plan.name}</h4>
              </div>
              <div className="text-right shrink-0">
                 <h5 className="text-lg md:text-xl font-black text-white">₹{plan.price}</h5>
                 <p className="text-[10px] text-slate-500 font-bold">PER MONTH</p>
              </div>
           </div>
        </div>

        {/* Security Trust Badges */}
        <div className="grid grid-cols-2 gap-3 md:gap-4">
           <div className="flex flex-col md:flex-row md:items-center justify-center md:justify-start gap-1 md:gap-3 p-2.5 md:p-3 bg-white/5 rounded-xl md:rounded-2xl border border-white/5 text-center md:text-left">
              <ShieldCheck size={18} className="md:w-5 md:h-5 text-green-500 mx-auto md:mx-0" />
              <span className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-tighter">Secure 256-bit SSL</span>
           </div>
           <div className="flex flex-col md:flex-row md:items-center justify-center md:justify-start gap-1 md:gap-3 p-2.5 md:p-3 bg-white/5 rounded-xl md:rounded-2xl border border-white/5 text-center md:text-left">
              <Zap size={18} className="md:w-5 md:h-5 text-amber-500 mx-auto md:mx-0" />
              <span className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-tighter">Instant Activation</span>
           </div>
        </div>

        {/* Payment Methods */}
        <div className="space-y-3 md:space-y-4">
           <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Select Payment Method</h5>
           <div className="space-y-2">
              {['Razorpay / UPI', 'Credit or Debit Card', 'Net Banking'].map((method, i) => (
                <div key={i} className={`p-3 md:p-4 border rounded-xl md:rounded-2xl flex items-center justify-between cursor-pointer transition-all group
                  ${i === 0 ? 'bg-primary/10 border-primary/40' : 'bg-dark border-white/5 hover:border-white/20'}`}>
                   <div className="flex items-center gap-3 md:gap-4">
                      <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center transition-all shrink-0
                        ${i === 0 ? 'bg-primary text-white' : 'bg-white/5 text-slate-500 group-hover:text-white'}`}>
                         <CreditCard size={16} className="md:w-5 md:h-5" />
                      </div>
                      <span className={`text-xs md:text-sm font-bold truncate ${i === 0 ? 'text-white' : 'text-slate-500 group-hover:text-white'}`}>{method}</span>
                   </div>
                   {i === 0 && <Check size={16} className="md:w-[18px] md:h-[18px] text-primary shrink-0" />}
                </div>
              ))}
           </div>
        </div>

        {/* Action Button */}
        <button className="w-full py-4 md:py-5 btn-primary rounded-2xl md:rounded-3xl font-black text-sm md:text-lg tracking-[0.1em] shadow-[0_20px_40px_rgba(99,102,241,0.3)] group flex items-center justify-center">
           PROCEED TO PAY <span className="group-hover:translate-x-2 inline-block transition-transform ml-2">→</span>
        </button>

        <p className="text-[10px] text-slate-600 text-center font-bold uppercase tracking-widest px-4">
          By continuing, you agree to our <span className="text-slate-400 hover:underline cursor-pointer">Terms of Service</span> and <span className="text-slate-400 hover:underline cursor-pointer">Refund Policy</span>.
        </p>
      </div>
    </BaseModal>
  );
};

export default PaymentModal;
