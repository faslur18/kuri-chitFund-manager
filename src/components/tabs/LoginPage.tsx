import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Lock, ShieldCheck, AlertTriangle } from 'lucide-react';
import logo from '../../assets/logo.png';
import type { TabType } from '../Sidebar';

interface LoginTabProps {
  setActiveTab: (tab: TabType) => void;
}

const LoginPage: React.FC<LoginTabProps> = ({ setActiveTab }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAdmin, logout } = useAuth();
  const { t } = useLanguage();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const success = await login(email, password);
    if (success) {
      setActiveTab('setup');
    } else {
      setError(t('login.error_invalid'));
    }
    setIsLoading(false);
  };

  if (isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-8">
        <div className="w-28 h-28 bg-structural-black border-4 border-structural-black shadow-[8px_8px_0_0_#000000] flex items-center justify-center overflow-hidden">
          <img src={logo} alt="Kuri Logo" className="w-full h-full object-cover" />
        </div>
        <div className="text-center">
          <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-2">{t('login.active_title')}</h2>
          <p className="font-bold text-structural-black/60 uppercase text-xs tracking-widest">{t('login.active_desc')}</p>
        </div>
        <button
          onClick={logout}
          className="brutal-btn bg-accent-pink text-white px-8 py-4 text-xl font-black uppercase italic shadow-[6px_6px_0_0_#000000]"
        >
          {t('login.btn_logout')}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="bg-white border-4 border-structural-black shadow-[12px_12px_0_0_#000000] overflow-hidden">
        <div className="bg-structural-black p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-accent-primary border-2 border-white flex items-center justify-center rotate-3">
            <Lock className="w-6 h-6 text-structural-black" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none">{t('login.portal_title')}</h2>
            <p className="text-accent-primary text-[10px] font-black uppercase mt-1 tracking-widest">{t('login.awaiting_id')}</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="p-8 space-y-6">
          {error && (
            <div className="bg-accent-pink/10 border-2 border-accent-pink p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-accent-pink shrink-0" />
              <p className="text-accent-pink font-black uppercase text-[10px] italic leading-tight">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-xs font-black uppercase tracking-widest">{t('login.id_label')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ADMIN@KURI.APP"
                className="w-full bg-bg-canvas border-4 border-structural-black p-4 font-black uppercase text-sm focus:outline-none focus:ring-0 focus:border-accent-primary transition-colors placeholder:text-structural-black/20"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-black uppercase tracking-widest">{t('login.pass_label')}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-bg-canvas border-4 border-structural-black p-4 font-black text-sm focus:outline-none focus:ring-0 focus:border-accent-primary transition-colors placeholder:text-structural-black/20"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`brutal-btn w-full py-5 text-xl font-black uppercase italic ${
              isLoading ? 'bg-bg-canvas/50 pointer-events-none' : 'bg-accent-primary hover:opacity-90 shadow-[8px_8px_0_0_#000000]'
            }`}
          >
            {isLoading ? t('login.btn_verify') : t('login.btn_auth')}
          </button>
        </form>
      </div>

      <div className="mt-8 flex items-center gap-4 p-4 border-2 border-structural-black/10 grayscale opacity-50">
        <ShieldCheck className="w-5 h-5" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em]">{t('login.protocol_msg')}</p>
      </div>
    </div>
  );
};

export default LoginPage;
 
