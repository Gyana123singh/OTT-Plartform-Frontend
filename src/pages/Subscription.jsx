import React, { useState, useEffect } from 'react';
import { Check, Zap, Crown, Star, ShieldCheck, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { createOrder, verifyPayment, getPlans } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Subscription = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(null);
  const [fetching, setFetching] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const currentPlanName = user.subscription?.plan || "Free";

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data } = await getPlans();
        // If no plans in DB, we could show a fallback or just empty
        setPlans(data);
      } catch (error) {
        console.error("Error fetching plans:", error);
      } finally {
        setFetching(false);
      }
    };
    fetchPlans();
  }, []);

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubscribe = async (plan) => {
    if (!localStorage.getItem('token')) {
      alert("Please login first to subscribe to a plan.");
      navigate('/login');
      return;
    }

    if (plan.name === currentPlanName) {
      alert("You are already on this plan!");
      return;
    }
    
    if (plan.price === 0) return; // For Free plan logic
    
    if (plan.name === "Enterprise") {
      window.location.href = "mailto:sales@gplus.com";
      return;
    }

    setLoading(plan.name);
    const res = await loadRazorpay();

    if (!res) {
      alert("Razorpay SDK failed to load. Are you online?");
      setLoading(null);
      return;
    }

    try {
      // 1. Create Order
      console.log("Creating order for plan:", plan.name);
      const { data: order } = await createOrder({ 
        amount: parseInt(plan.price), 
        planName: plan.name 
      });

      console.log("Order Created:", order);

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_your_id_here", 
        amount: order.amount,
        currency: order.currency,
        name: "G Plus OTT",
        description: `${plan.name} Subscription`,
        image: "https://res.cloudinary.com/dbcbk3nl2/image/upload/v1715840000/gplus_logo.png", // Optional logo
        order_id: order.id,
        handler: async (response) => {
          console.log("Payment Success Response:", response);
          try {
            setLoading("Verifying...");
            // 2. Verify Payment
            const verifyRes = await verifyPayment({
              ...response,
              planName: plan.name
            });

            console.log("Verification Response:", verifyRes.data);

            if (verifyRes.data.success) {
              // Update local user data
              const existingUser = JSON.parse(localStorage.getItem('user')) || {};
              const updatedUser = { 
                ...existingUser, 
                subscription: { 
                  plan: plan.name, 
                  status: 'active' 
                } 
              };
              localStorage.setItem('user', JSON.stringify(updatedUser));
              alert(`Subscription Successful! Welcome to G Plus ${plan.name}.`);
              navigate('/');
              window.location.reload();
            } else {
              alert("Payment verification failed: " + verifyRes.data.message);
            }
          } catch (err) {
            console.error("Verification Error:", err);
            alert("Payment verification failed. Please contact support if amount was deducted.");
          } finally {
            setLoading(null);
          }
        },
        prefill: {
          name: user.name || "",
          email: user.email || "",
          contact: "9999999999" // Optional
        },
        theme: {
          color: "#F43F5E", // G Plus Primary color
        },
        modal: {
          ondismiss: () => {
            setLoading(null);
            console.log("Payment Modal Closed");
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error("Payment Initiation Error:", error);
      const msg = error.response?.data?.message || "Failed to initiate payment. Please try again.";
      alert(msg);
    } finally {
      if (loading !== "Verifying...") setLoading(null);
    }
  };

  return (
    <div className="py-10 space-y-12">
      <div className="text-center space-y-4 max-w-2xl mx-auto px-4">
        <h1 className="text-4xl font-black text-white tracking-tight">Choose Your Experience</h1>
        <p className="text-slate-400">Unlock the full power of G Plus with our premium features and high-fidelity streaming.</p>
      </div>

      {fetching ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-4 opacity-30">
          <Loader2 className="animate-spin" size={40} />
          <p className="text-xs font-black uppercase tracking-widest">Fetching live plans...</p>
        </div>
      ) : plans.length === 0 ? (
        <div className="py-20 text-center glass-card max-w-xl mx-auto space-y-4">
           <Zap className="mx-auto text-slate-700" size={48} />
           <p className="text-slate-500 font-bold">No active plans available at the moment. <br/> Please check back later or contact support.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
          {plans.map((plan) => {
            const isCurrentPlan = plan.name === currentPlanName;
            const isPremium = plan.isPopular;
            
            return (
              <motion.div 
                key={plan._id}
                whileHover={{ y: -10 }}
                className={`glass-card p-8 flex flex-col relative overflow-hidden transition-all duration-500
                  ${isCurrentPlan ? 'border-primary ring-1 ring-primary/20 bg-primary/5' : 'border-white/5'}
                  ${isPremium && !isCurrentPlan ? 'ring-2 ring-primary/30' : ''}
                `}
              >
                {isPremium && (
                  <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-black px-4 py-1 rounded-bl-xl uppercase tracking-widest">
                    Most Popular
                  </div>
                )}
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-white tracking-tight">{plan.name}</h3>
                    {isCurrentPlan && <Check size={16} className="text-primary" />}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-white">₹{plan.price}</span>
                    {plan.price !== 0 && <span className="text-slate-500 font-bold text-sm">/month</span>}
                  </div>
                </div>

                <div className="mt-8 space-y-4 flex-1">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm text-slate-300">
                      <div className={`mt-1 p-0.5 rounded-full bg-white/10 text-primary shrink-0`}>
                        <Check size={12} />
                      </div>
                      <span className="leading-tight">{feature}</span>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => handleSubscribe(plan)}
                  disabled={loading === plan.name || isCurrentPlan}
                  className={`mt-10 w-full py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2
                    ${isCurrentPlan 
                      ? 'bg-emerald-500/20 text-emerald-500 cursor-default border border-emerald-500/30' 
                      : plan.isPopular
                        ? 'bg-primary text-white hover:shadow-lg shadow-primary/40' 
                        : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/10'
                    }
                    ${loading === plan.name ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  {loading === plan.name ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    isCurrentPlan ? "Active Plan" : (plan.buttonText || "Subscribe Now")
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Trust Badges */}
      <div className="flex flex-wrap justify-center gap-12 pt-10 px-4">
        {[
          { icon: ShieldCheck, label: 'SECURE PAYMENTS' },
          { icon: Star, label: 'TRUSTED BY 1M+' },
          { icon: Zap, label: 'INSTANT ACTIVATION' }
        ].map((badge, i) => (
          <div key={i} className="flex items-center gap-2 text-slate-500 font-black text-[10px] tracking-widest uppercase">
            <badge.icon size={18} className="text-primary/60" /> {badge.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Subscription;
