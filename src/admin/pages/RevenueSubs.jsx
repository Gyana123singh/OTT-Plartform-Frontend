import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  ArrowUpRight, 
  CreditCard, 
  Sparkles, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ChevronRight, 
  Percent, 
  ShieldCheck,
  RefreshCw,
  PlusCircle,
  Ban,
  ArrowRight,
  TrendingDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const RevenueSubs = () => {
  const navigate = useNavigate();
  const [syncing, setSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlan, setFilterPlan] = useState('all'); // 'all' | 'premium' | 'enterprise' | 'free'

  // Mock list of active subscriber accounts
  const [subscribers, setSubscribers] = useState([
    { id: 'sub-1', name: 'Vikram Singh', email: 'vikram@gplus.com', plan: 'Premium', price: 499, startDate: 'May 12, 2026', expiryDate: 'June 12, 2026', status: 'Active', method: 'Razorpay' },
    { id: 'sub-2', name: 'Ananya Rao', email: 'ananya.rao@gmail.com', plan: 'Premium', price: 499, startDate: 'May 10, 2026', expiryDate: 'June 10, 2026', status: 'Active', method: 'Razorpay' },
    { id: 'sub-3', name: 'Kabir Dev', email: 'kabir.dev@gmail.com', plan: 'Enterprise', price: 1999, startDate: 'May 01, 2026', expiryDate: 'June 01, 2026', status: 'Active', method: 'Razorpay' },
    { id: 'sub-4', name: 'Neha Sharma', email: 'neha12@outlook.com', plan: 'Free', price: 0, startDate: 'April 20, 2026', expiryDate: 'N/A', status: 'Active', method: 'None' },
    { id: 'sub-5', name: 'Rajesh Patel', email: 'rajesh@patelexports.in', plan: 'Enterprise', price: 1999, startDate: 'April 15, 2026', expiryDate: 'May 15, 2026', status: 'Expired', method: 'Razorpay' }
  ]);

  // Mock list of recent Razorpay order/payment records
  const [transactions, setTransactions] = useState([
    { orderId: 'order_OP982312a', paymentId: 'pay_K1289ah18', customer: 'Vikram Singh', email: 'vikram@gplus.com', plan: 'Premium', amount: '₹499.00', date: '2 hours ago', status: 'Captured' },
    { orderId: 'order_OP981290b', paymentId: 'pay_K1287bh22', customer: 'Ananya Rao', email: 'ananya.rao@gmail.com', plan: 'Premium', amount: '₹499.00', date: '8 hours ago', status: 'Captured' },
    { orderId: 'order_OP980182c', paymentId: 'pay_K1265ch11', customer: 'Kabir Dev', email: 'kabir.dev@gmail.com', plan: 'Enterprise', amount: '₹1,999.00', date: '1 day ago', status: 'Captured' },
    { orderId: 'order_OP979872d', paymentId: 'pay_K1245dh01', customer: 'Rajesh Patel', email: 'rajesh@patelexports.in', plan: 'Enterprise', amount: '₹1,999.00', date: '3 days ago', status: 'Refunded' },
    { orderId: 'order_OP978182e', paymentId: 'pay_K1212eh90', customer: 'Amit Sen', email: 'amit.sen@live.com', plan: 'Premium', amount: '₹499.00', date: '4 days ago', status: 'Failed' }
  ]);

  const [stats, setStats] = useState({
    mrr: 12452000,
    payingUsers: 3324,
    freeUsers: 45578,
    refundedCount: 12
  });

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
    }, 1200);
  };

  // Admin subscriber control actions
  const handleTogglePremium = (subId) => {
    setSubscribers(prev => prev.map(sub => {
      if (sub.id === subId) {
        if (sub.plan === 'Free') {
          alert(`Granted Premium Access to ${sub.name}!`);
          return {
            ...sub,
            plan: 'Premium',
            price: 499,
            startDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
            expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
            status: 'Active',
            method: 'Admin Promo'
          };
        } else {
          alert(`Revoked premium access for ${sub.name}. Return to Free Tier.`);
          return {
            ...sub,
            plan: 'Free',
            price: 0,
            startDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
            expiryDate: 'N/A',
            status: 'Active',
            method: 'None'
          };
        }
      }
      return sub;
    }));
  };

  const handleCancelSub = (subId) => {
    setSubscribers(prev => prev.map(sub => {
      if (sub.id === subId) {
        alert(`Subscription for ${sub.name} is cancelled successfully.`);
        return {
          ...sub,
          status: 'Cancelled',
          expiryDate: 'Cancelled Immediately'
        };
      }
      return sub;
    }));
  };

  // Searching and plan filtering
  const filteredSubs = subscribers.filter(sub => {
    const matchesSearch = sub.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          sub.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterPlan === 'premium') return matchesSearch && sub.plan === 'Premium';
    if (filterPlan === 'enterprise') return matchesSearch && sub.plan === 'Enterprise';
    if (filterPlan === 'free') return matchesSearch && sub.plan === 'Free';
    return matchesSearch;
  });

  return (
    <div className="space-y-8 pb-20 text-slate-100 font-inter">
      
      {/* Top Banner Overview */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <DollarSign className="text-primary animate-pulse" size={32} />
            Revenue & Subscription Control
          </h1>
          <p className="text-xs md:text-sm text-slate-500 font-medium">
            Monitor Razorpay payment captures, audit premium accounts, analyze subscription plan tiers, and manage invoicing.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start lg:self-auto">
          {/* Quick link tab to switch to Analytics directly */}
          <button 
            onClick={() => navigate('/admin-panel/analytics')}
            className="px-4 py-2.5 bg-primary/10 border border-primary/20 rounded-xl text-primary hover:bg-primary/20 shrink-0 flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-all"
          >
            Platform Analytics <ArrowRight size={14} />
          </button>

          <button 
            onClick={handleSync}
            disabled={syncing}
            className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white shrink-0 flex items-center gap-2 text-xs font-bold uppercase tracking-wider hover:bg-white/10 transition-all justify-center"
          >
            <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} /> 
            {syncing ? 'Syncing...' : 'Sync Financials'}
          </button>
        </div>
      </div>

      {/* Top Level Financial Widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 space-y-3 relative overflow-hidden">
          <div className="flex justify-between items-center">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
              <DollarSign size={20} />
            </div>
            <span className="text-[10px] font-black uppercase text-green-500 bg-green-500/10 px-2 py-0.5 rounded flex items-center gap-0.5">
              <TrendingUp size={10} /> +12.4%
            </span>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Monthly Recur Revenue (MRR)</p>
            <h3 className="text-2xl font-black text-white mt-1">₹{(stats.mrr / 1000000).toFixed(2)}M</h3>
          </div>
        </div>

        <div className="glass-card p-5 space-y-3 relative overflow-hidden">
          <div className="flex justify-between items-center">
            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500">
              <Users size={20} />
            </div>
            <span className="text-[10px] font-black uppercase text-green-500 bg-green-500/10 px-2 py-0.5 rounded flex items-center gap-0.5">
              <TrendingUp size={10} /> +8.1%
            </span>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Active Paid Members</p>
            <h3 className="text-2xl font-black text-white mt-1">{(stats.payingUsers).toLocaleString()}</h3>
          </div>
        </div>

        <div className="glass-card p-5 space-y-3 relative overflow-hidden">
          <div className="flex justify-between items-center">
            <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-500">
              <Users size={20} />
            </div>
            <span className="text-[10px] font-black uppercase text-slate-500 bg-white/5 px-2 py-0.5 rounded">Standard Tier</span>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Free Platform Accounts</p>
            <h3 className="text-2xl font-black text-white mt-1">{(stats.freeUsers).toLocaleString()}</h3>
          </div>
        </div>

        <div className="glass-card p-5 space-y-3 relative overflow-hidden">
          <div className="flex justify-between items-center">
            <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500">
              <Percent size={20} />
            </div>
            <span className="text-[10px] font-black uppercase text-red-500 bg-red-500/10 px-2 py-0.5 rounded flex items-center gap-0.5">
              <TrendingDown size={10} /> -1.2%
            </span>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Refunds Ratio (30 Days)</p>
            <h3 className="text-2xl font-black text-white mt-1">{stats.refundedCount} accounts</h3>
          </div>
        </div>
      </div>

      {/* Subscription Plans Breakdown */}
      <div className="space-y-4">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Platform Active Subscription Packages</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Plan 1: Free Tier */}
          <div className="glass-card p-6 border-white/5 space-y-4 flex flex-col justify-between hover:border-white/10 transition-all">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="bg-slate-500/10 text-slate-400 text-[8px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider border border-slate-500/20">Standard Tier</span>
                <span className="text-slate-500 text-[10px] font-bold">21,578 active members</span>
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-lg text-white">Free Base Plan</h4>
                <p className="text-xs text-slate-400 leading-relaxed">Standard access with ads, supports up to 720p live streaming, active system moderation rules apply.</p>
              </div>
            </div>
            <div className="pt-4 border-t border-white/5 flex justify-between items-center">
              <span className="text-2xl font-black text-white">₹0 <span className="text-[10px] text-slate-500 font-bold">/ month</span></span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Base Catalog</span>
            </div>
          </div>

          {/* Plan 2: Premium Tier */}
          <div className="glass-card p-6 border-primary/20 ring-1 ring-primary/10 bg-primary/2 space-y-4 flex flex-col justify-between hover:border-primary/45 transition-all relative">
            <div className="absolute top-0 right-0 bg-primary text-white text-[8px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-widest">POPULAR</div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="bg-primary/10 text-primary text-[8px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider border border-primary/20">Premium Tier</span>
                <span className="text-primary text-[10px] font-bold">3,142 active members</span>
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-lg text-white">Premium Package</h4>
                <p className="text-xs text-slate-300 leading-relaxed">Ad-free high-fidelity 4K streaming, multi-device sync, exclusive live chat triggers, and VIP badge status.</p>
              </div>
            </div>
            <div className="pt-4 border-t border-white/5 flex justify-between items-center">
              <span className="text-2xl font-black text-white">₹499 <span className="text-[10px] text-slate-500 font-bold">/ month</span></span>
              <span className="text-[10px] text-primary font-black uppercase tracking-widest">94.8% SLA Captures</span>
            </div>
          </div>

          {/* Plan 3: Enterprise Tier */}
          <div className="glass-card p-6 border-white/5 space-y-4 flex flex-col justify-between hover:border-white/10 transition-all">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="bg-indigo-500/10 text-indigo-400 text-[8px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider border border-indigo-500/20">Enterprise Tier</span>
                <span className="text-indigo-400 text-[10px] font-bold">182 active members</span>
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-lg text-white">Enterprise Broadcaster</h4>
                <p className="text-xs text-slate-400 leading-relaxed">Unlimited concurrent active live broadcasts, custom WebRTC server allocations, custom domain integration.</p>
              </div>
            </div>
            <div className="pt-4 border-t border-white/5 flex justify-between items-center">
              <span className="text-2xl font-black text-white">₹1,999 <span className="text-[10px] text-slate-500 font-bold">/ month</span></span>
              <span className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">Custom Contracts</span>
            </div>
          </div>

        </div>
      </div>

      {/* Main Grid: Subscriber List and Razorpay Transactions Log */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Grid: Subscriber Management Panel (2 Columns) */}
        <div className="xl:col-span-2 space-y-6">
          <div className="glass-card p-6 space-y-6 border-white/5 shadow-2xl">
            
            {/* Header / Search Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
              <div className="space-y-1">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Subscriber Management</h3>
                <p className="text-xs text-slate-500 font-medium leading-none">Modify and audit member access control parameters</p>
              </div>

              {/* Filter controls */}
              <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/5 self-start sm:self-auto">
                {['all', 'premium', 'enterprise', 'free'].map(plan => (
                  <button
                    key={plan}
                    onClick={() => setFilterPlan(plan)}
                    className={`px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all
                      ${filterPlan === plan ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    {plan}
                  </button>
                ))}
              </div>
            </div>

            {/* Sub Search */}
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={16} />
              <input
                type="text"
                placeholder="Search active subscribers by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-black/40 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-white w-full"
              />
            </div>

            {/* Subscriber List Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                    <th className="pb-3 text-left">Member Account</th>
                    <th className="pb-3 text-center">Plan Tier</th>
                    <th className="pb-3 text-center">Cycle Dates</th>
                    <th className="pb-3 text-center">Billing</th>
                    <th className="pb-3 text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs">
                  {filteredSubs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-slate-500 font-bold uppercase tracking-wider">
                        No subscribers found matching the filters.
                      </td>
                    </tr>
                  ) : (
                    filteredSubs.map(sub => (
                      <tr key={sub.id} className="hover:bg-white/2 transition-colors">
                        
                        {/* Member Details */}
                        <td className="py-4.5 pr-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-slate-700 to-slate-900 border border-white/10 flex items-center justify-center font-black text-white shrink-0">
                              {sub.name[0]}
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-bold text-white truncate">{sub.name}</h4>
                              <p className="text-[10px] text-slate-500 truncate leading-none mt-0.5">{sub.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Plan */}
                        <td className="py-4.5 text-center">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border
                            ${sub.plan === 'Premium' ? 'bg-primary/10 text-primary border-primary/20' : 
                              sub.plan === 'Enterprise' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 
                              'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                            {sub.plan}
                          </span>
                        </td>

                        {/* cycle dates */}
                        <td className="py-4.5 text-center text-[10px] font-medium text-slate-400 leading-relaxed">
                          <p>{sub.startDate}</p>
                          <p className="text-[8px] text-slate-500 font-bold uppercase">EXP: {sub.expiryDate}</p>
                        </td>

                        {/* Billing status */}
                        <td className="py-4.5 text-center">
                          <div className="inline-flex items-center gap-1.5">
                            <div className={`w-1.5 h-1.5 rounded-full 
                              ${sub.status === 'Active' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`} />
                            <span className={`text-[8px] font-black uppercase tracking-wider
                              ${sub.status === 'Active' ? 'text-green-500' : 'text-red-500'}`}>
                              {sub.status}
                            </span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-4.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleTogglePremium(sub.id)}
                              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all
                                ${sub.plan === 'Free' 
                                  ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border-emerald-500/20'
                                  : 'bg-white/5 hover:bg-white/10 text-slate-400 border-white/5'
                                }`}
                              title={sub.plan === 'Free' ? 'Grant Premium Access' : 'Revoke Premium'}
                            >
                              {sub.plan === 'Free' ? 'Grant VIP' : 'Demote VIP'}
                            </button>

                            {sub.status === 'Active' && sub.plan !== 'Free' && (
                              <button
                                onClick={() => handleCancelSub(sub.id)}
                                className="px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                                title="Cancel Billing Cycle"
                              >
                                Cancel Billing
                              </button>
                            )}
                          </div>
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </div>

        {/* Right Grid: Razorpay Live Capture Feed */}
        <div className="space-y-6">
          <div className="glass-card p-6 border-white/5 space-y-6 flex flex-col justify-between h-full">
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <CreditCard size={18} className="text-primary" /> Razorpay Captures
                </h3>
                <span className="px-2 py-0.5 bg-primary/10 text-primary text-[8px] font-black rounded uppercase tracking-wider">LIVE</span>
              </div>

              {/* Transactions log items */}
              <div className="space-y-4">
                {transactions.map((tx, idx) => (
                  <div key={idx} className="p-3.5 bg-white/3 border border-white/5 rounded-2xl flex justify-between items-center hover:bg-white/5 transition-all group">
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0
                          ${tx.status === 'Captured' ? 'bg-green-500' : tx.status === 'Refunded' ? 'bg-amber-500' : 'bg-red-500'}`} />
                        <h4 className="font-bold text-xs text-white truncate">@{tx.customer}</h4>
                      </div>
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter truncate leading-none">{tx.paymentId}</p>
                      <p className="text-[8px] text-slate-600 font-bold uppercase tracking-wider">{tx.date}</p>
                    </div>

                    <div className="text-right shrink-0 space-y-0.5">
                      <span className="text-xs font-black text-white block">{tx.amount}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest
                        ${tx.status === 'Captured' ? 'bg-green-500/10 text-green-500' : 
                          tx.status === 'Refunded' ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'}`}>
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 p-4 bg-white/3 border border-white/5 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-slate-300">
                <ShieldCheck size={16} className="text-primary" />
                <h4 className="text-[9px] font-black uppercase tracking-widest">Razorpay Webhook Verified</h4>
              </div>
              <p className="text-[9px] text-slate-500 font-medium leading-relaxed">
                Payment signatures verified instantly via HMAC SHA-256 cloud verification. Subscriber cycles are automatically adjusted.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default RevenueSubs;
