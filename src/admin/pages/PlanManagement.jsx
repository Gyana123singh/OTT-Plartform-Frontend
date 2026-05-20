import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  X, 
  Check, 
  Crown, 
  Zap, 
  Star,
  Settings,
  Layout,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getPlans, createPlan, updatePlan, deletePlan } from '../../services/api';

const PlanManagement = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPlan, setNewPlan] = useState({
    name: '',
    price: '',
    features: '',
    color: 'primary',
    isPopular: false,
    buttonText: 'Subscribe Now'
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data } = await getPlans();
      setPlans(data);
    } catch (error) {
      console.error("Error fetching plans:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlan = async (e) => {
    e.preventDefault();
    try {
      const formattedPlan = {
        ...newPlan,
        features: newPlan.features.split(',').map(f => f.trim())
      };
      await createPlan(formattedPlan);
      fetchPlans();
      setShowAddForm(false);
      setNewPlan({
        name: '',
        price: '',
        features: '',
        color: 'primary',
        isPopular: false,
        buttonText: 'Subscribe Now'
      });
    } catch (error) {
      alert("Error creating plan: " + error.message);
    }
  };

  const handleUpdatePlan = async (id, updatedData) => {
    try {
      if (typeof updatedData.features === 'string') {
        updatedData.features = updatedData.features.split(',').map(f => f.trim());
      }
      await updatePlan(id, updatedData);
      setIsEditing(null);
      fetchPlans();
    } catch (error) {
      alert("Error updating plan: " + error.message);
    }
  };

  const handleDeletePlan = async (id) => {
    if (window.confirm("Are you sure you want to delete this plan?")) {
      try {
        await deletePlan(id);
        fetchPlans();
      } catch (error) {
        alert("Error deleting plan: " + error.message);
      }
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Subscription Engine</h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">Manage plans, pricing, and premium features.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="w-full sm:w-auto btn-primary flex items-center justify-center gap-2 py-3 px-6 text-sm md:text-base"
        >
          <Plus size={20} className="md:w-5 md:h-5 w-4 h-4" /> Create New Plan
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="animate-spin text-primary" size={40} />
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">Loading Configuration...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-8">
          <AnimatePresence>
            {showAddForm && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="glass-card p-5 md:p-8 border-primary/40 bg-primary/5 space-y-4 md:space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">Add New Plan</h3>
                  <button onClick={() => setShowAddForm(false)} className="text-slate-500 hover:text-white">
                    <X size={20} />
                  </button>
                </div>
                <form onSubmit={handleAddPlan} className="space-y-4">
                  <input 
                    type="text" 
                    placeholder="Plan Name (e.g. Premium)" 
                    className="w-full bg-dark border border-white/10 rounded-xl p-3 text-sm focus:ring-1 ring-primary outline-none"
                    value={newPlan.name}
                    onChange={(e) => setNewPlan({...newPlan, name: e.target.value})}
                    required
                  />
                  <input 
                    type="number" 
                    placeholder="Price (Monthly)" 
                    className="w-full bg-dark border border-white/10 rounded-xl p-3 text-sm focus:ring-1 ring-primary outline-none"
                    value={newPlan.price}
                    onChange={(e) => setNewPlan({...newPlan, price: e.target.value})}
                    required
                  />
                  <textarea 
                    placeholder="Features (comma separated)" 
                    className="w-full bg-dark border border-white/10 rounded-xl p-3 text-sm focus:ring-1 ring-primary outline-none min-h-[100px]"
                    value={newPlan.features}
                    onChange={(e) => setNewPlan({...newPlan, features: e.target.value})}
                    required
                  />
                  <div className="flex items-center gap-4">
                     <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="accent-primary"
                          checked={newPlan.isPopular}
                          onChange={(e) => setNewPlan({...newPlan, isPopular: e.target.checked})}
                        />
                        <span className="text-xs font-bold text-slate-400">Mark as Popular</span>
                     </label>
                  </div>
                  <button type="submit" className="w-full py-4 bg-primary text-white font-black rounded-xl hover:shadow-lg shadow-primary/20 transition-all">
                    SAVE CONFIGURATION
                  </button>
                </form>
              </motion.div>
            )}

            {plans.map((plan) => (
              <motion.div 
                key={plan._id}
                layout
                className={`glass-card p-5 md:p-8 space-y-4 md:space-y-6 relative group border-white/5 hover:border-primary/20 transition-all duration-500
                  ${plan.isPopular ? 'ring-1 ring-primary/30' : ''}`}
              >
                {plan.isPopular && (
                  <div className="absolute top-4 right-4 bg-primary text-white text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest">
                    Popular
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-primary`}>
                    <Crown size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white tracking-tight">{plan.name}</h3>
                    <p className="text-slate-500 text-xs font-bold">₹{plan.price}/month</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Included Features</p>
                  <ul className="space-y-2">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="text-xs text-slate-300 flex items-center gap-2">
                        <Check size={14} className="text-emerald-500" /> {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6 flex items-center gap-3 border-t border-white/5">
                  <button 
                    onClick={() => handleDeletePlan(plan._id)}
                    className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 rounded-xl hover:text-white transition-all flex-1 flex items-center justify-center"
                  >
                    <Trash2 size={18} />
                  </button>
                  <button 
                    className="p-3 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white rounded-xl transition-all flex-1 flex items-center justify-center"
                  >
                    <Edit3 size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default PlanManagement;
