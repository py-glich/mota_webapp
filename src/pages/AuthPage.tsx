import React, { useState } from 'react';
import { 
  Lock, User as UserIcon, Eye, EyeOff, 
  ArrowRight, ShieldCheck, AlertCircle, Database
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PART_IMAGES } from '../utils/imageUtils';

export const AuthPage: React.FC = () => {
  const { login } = useAuth();

  // Sign In Form State
  const [signInUsername, setSignInUsername] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Handle Login Submit
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!signInUsername.trim() || !signInPassword.trim()) {
      setErrorMsg('Please enter both your username/email and password.');
      return;
    }

    setLoading(true);
    const res = await login(signInUsername, signInPassword);
    setLoading(false);

    if (!res.success) {
      setErrorMsg(res.message || 'Invalid credentials. Access restricted to authorized personnel.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0D14] flex flex-col justify-center items-center p-4 sm:p-6 text-slate-100 font-sans selection:bg-rose-600 selection:text-white">
      {/* Background ambient motorcycle styling */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-rose-600 rounded-full blur-[140px]" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-red-800 rounded-full blur-[160px]" />
      </div>

      <div className="w-full max-w-4xl relative z-10 flex flex-col md:flex-row overflow-hidden rounded-3xl border border-[#1E2638] bg-[#111622] shadow-2xl shadow-black/80">
        
        {/* Left Visual Hero (Visible on md screens and up) */}
        <div className="hidden md:flex md:w-5/12 bg-gradient-to-br from-[#161C2C] via-[#121622] to-[#0A0D14] p-8 flex-col justify-between relative overflow-hidden border-r border-[#1E2638]">
          {/* Superbike background image overlay */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-screen pointer-events-none"
            style={{
              backgroundImage: `url('${PART_IMAGES.CHAIN_SPROCKET}')`,
              maskImage: 'linear-gradient(to top, transparent 0%, black 50%, black 90%)',
              WebkitMaskImage: 'linear-gradient(to top, transparent 0%, black 50%, black 90%)'
            }}
          />

          <div className="relative z-10">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-red-500 flex items-center justify-center text-white shadow-lg shadow-rose-600/30">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <circle cx="5.5" cy="17.5" r="3.5"/>
                  <circle cx="18.5" cy="17.5" r="3.5"/>
                  <circle cx="15" cy="5" r="1"/>
                  <path d="M12 17.5V14l-3-3 4-3 2 3h2"/>
                </svg>
              </div>
              <div>
                <div className="text-xl font-black tracking-tight leading-none text-white">
                  <span>Moto</span>
                  <span className="text-rose-500">Pro</span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase block mt-0.5">
                  Shop Management & POS
                </span>
              </div>
            </div>

            <div className="mt-12 space-y-3">
              <h2 className="text-2xl font-black italic tracking-tight text-white leading-tight">
                Drive Your Business{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-red-600 font-black">
                  Forward
                </span>
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Enterprise motorcycle spare parts management, dual-counter real-time POS billing, and centralized MongoDB inventory.
              </p>
            </div>
          </div>

          <div className="relative z-10 space-y-2 pt-6 border-t border-[#1E2638]">
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>MongoDB Engine Online</span>
            </div>
            <p className="text-[10px] text-slate-500">
              Powered by CyberOrion.pk • Enterprise Edition v2.5
            </p>
          </div>
        </div>

        {/* Right Form Card (Professional Dedicated Login) */}
        <div className="flex-1 p-7 sm:p-10 flex flex-col justify-between bg-[#111622]">
          <div>
            {/* Top Bar on Mobile */}
            <div className="flex md:hidden items-center justify-between pb-4 mb-6 border-b border-[#1E2638]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/>
                  </svg>
                </div>
                <div className="text-lg font-black text-white">
                  Moto<span className="text-rose-500">Pro</span>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-950 text-rose-400 border border-rose-800/40 font-bold uppercase">
                Enterprise POS
              </span>
            </div>

            {/* Title & Professional Context */}
            <div className="mb-6">
              <h3 className="text-xl font-extrabold text-white tracking-tight">
                Terminal Sign In
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Enter your authorized credentials to access your shop terminal and billing desk.
              </p>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 mb-5 rounded-xl text-xs font-semibold bg-rose-950/70 border border-rose-800/60 text-rose-300 flex items-center gap-2.5 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Secure Sign In Form */}
            <form onSubmit={handleSignInSubmit} className="space-y-4">
              <div>
                <label className="font-bold text-xs text-slate-300 block mb-1.5">
                  Username or Email
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="Enter your username or email"
                    value={signInUsername}
                    onChange={e => setSignInUsername(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-[#0B0E14] border border-[#1E2638] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-xs text-slate-300">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter your password"
                    value={signInPassword}
                    onChange={e => setSignInPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-[#0B0E14] border border-[#1E2638] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-300">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="rounded bg-[#0B0E14] border-slate-700 text-rose-600 focus:ring-rose-500"
                  />
                  <span>Keep session active</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 mt-2 bg-rose-600 hover:bg-rose-500 active:scale-[0.99] text-white font-extrabold text-xs rounded-xl shadow-lg shadow-rose-600/30 transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>Authenticating Credentials...</span>
                ) : (
                  <>
                    <span>Sign In to Terminal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Professional Security Notice */}
          <div className="mt-8 pt-4 border-t border-[#1E2638] flex items-center gap-2.5 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Authorized access only. System activity and billing logs are encrypted and audited.</span>
          </div>
        </div>

      </div>
    </div>
  );
};
