import React, { useState } from 'react';
import { useKuri } from '../../context/KuriContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Settings, Wallet, CalendarDays, Coins, AlertCircle, ShieldAlert } from 'lucide-react';

const SetupTab = () => {
  const { fundDetails, setFundDetails, participants, setShareSize, shareSize } = useKuri();
  const { t } = useLanguage();
  const { isAdmin } = useAuth();
  const hasParticipants = participants.length > 0;

  const [view, setView] = useState<'dashboard' | 'create' | 'edit'>(fundDetails && shareSize > 0 ? 'dashboard' : 'dashboard');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [formData, setFormData] = useState({
    name: fundDetails?.name || '',
    monthlyAmount: shareSize || 0,
    startDate: fundDetails?.startDate || new Date().toISOString().split('T')[0],
  });

  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'monthlyAmount' ? Number(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    const actualShareSize = Number(formData.monthlyAmount);
    const sharesCount = participants.length > 0 ? participants.length : 1;
    const duration = sharesCount;
    
    setFundDetails({
      name: formData.name,
      totalAmount: actualShareSize * sharesCount * duration,
      durationMonths: duration,
      startDate: formData.startDate,
    });
    
    if (actualShareSize > 0 && view === 'create') {
      setShareSize(actualShareSize);
    }
    
    setSuccessMsg(t('setup.success_msg'));
    setTimeout(() => {
       setSuccessMsg('');
       setView('dashboard');
    }, 1500);
  };

  const hasFund = fundDetails && shareSize > 0;

  return (
    <div className="space-y-6">
      {!isAdmin && (
        <div className="bg-accent-pink/10 border-2 border-accent-pink p-3 flex items-center gap-3 mb-2">
          <ShieldAlert className="w-5 h-5 text-accent-pink shrink-0" />
          <p className="text-[10px] font-black uppercase text-accent-pink tracking-tight leading-tight">
            {t('status.readonly_setup')}
          </p>
        </div>
      )}
      
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
        <div className="w-12 h-12 flex items-center justify-center bg-accent-primary text-structural-black border-4 border-structural-black shadow-[3px_3px_0_0_#000000]">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-black tracking-tighter text-structural-black uppercase italic leading-none">{t('setup.title')}</h2>
          <p className="text-[10px] font-bold text-structural-black mt-1 bg-accent-pink px-1.5 py-0.5 inline-block border-2 border-structural-black shadow-[2px_2px_0_0_#000000]">{t('setup.subtitle')}</p>
        </div>
      </div>

      <div className="max-w-4xl">
        {view === 'dashboard' ? (
          <>
            {!hasFund ? (
              <div className="flex flex-col items-center justify-center py-24 bg-white border-4 border-structural-black shadow-[10px_10px_0_0_#000000] px-8 text-center" id="no-fund-container">
                <Settings className="w-20 h-20 text-structural-black mb-8" />
                <h3 className="text-3xl font-black text-structural-black mb-4 uppercase">{t('setup.no_active_fund_title')}</h3>
                <p className="text-structural-black font-medium mb-10 max-w-sm">{t('setup.no_active_fund_desc')}</p>
                <button 
                  onClick={() => {
                     setFormData({
                       name: '',
                       monthlyAmount: 0,
                       startDate: new Date().toISOString().split('T')[0]
                     });
                     setView('create');
                  }} 
                  className="brutal-btn text-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  id="initialize-fund-btn"
                  disabled={!isAdmin}
                >
                   {t('setup.init_btn')}
                </button>
              </div>
            ) : (
              <div className="space-y-10">
                <div className="flex flex-col sm:flex-row justify-end sm:items-center gap-4 lg:gap-6">
                   <div className="grid grid-cols-2 sm:flex items-center gap-4 w-full sm:w-auto">
                     <button 
                       onClick={() => setShowCreateModal(true)} 
                       className="brutal-btn brutal-btn-pink text-[10px] sm:text-sm py-3 sm:py-2 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
                       disabled={!isAdmin}
                     >
                       {t('setup.new_fund_btn')}
                     </button>
                     <button 
                       onClick={() => {
                         setFormData({
                           name: fundDetails.name,
                           monthlyAmount: shareSize,
                           startDate: fundDetails.startDate
                         });
                         setView('edit');
                       }} 
                       className="brutal-btn brutal-btn-blue text-[10px] sm:text-sm py-3 sm:py-2 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
                       disabled={!isAdmin}
                     >
                       {t('setup.edit_btn')}
                     </button>
                   </div>
                </div>

                {/* Summary Card */}
                <div className="bg-white p-6 lg:p-10 border-4 border-structural-black shadow-[4px_4px_0_0_#000000] lg:shadow-[8px_8px_0_0_#000000] rounded-none">
                  <div className="space-y-6 lg:space-y-8 text-structural-black">
                    <div className="bg-bg-canvas border-4 border-structural-black p-4 lg:p-8 shadow-[3px_3px_0_0_#000000] lg:shadow-[5px_5px_0_0_#000000] text-center rounded-none">
                      <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-structural-black tracking-tighter uppercase italic mb-4 lg:mb-6 leading-none">
                        {fundDetails.name}
                      </h2>
                      <div className="w-full h-1 bg-structural-black mb-4 lg:mb-6 max-w-xs mx-auto"></div>
                      <p className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest mb-3">{t('setup.gross_cap')}</p>
                      <div className="text-3xl sm:text-5xl lg:text-6xl font-black tabular-nums tracking-tighter text-structural-black leading-none bg-accent-primary p-2 lg:p-3 border-4 border-structural-black inline-block shadow-[3px_3px_0_0_#000000] lg:shadow-[5px_5px_0_0_#000000] rounded-none">
                        ₹{(shareSize * (participants.length > 0 ? participants.length : 1) * (participants.length > 0 ? participants.length : 1)).toLocaleString('en-IN')}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
                      <div className="p-4 lg:p-6 bg-white border-4 border-structural-black shadow-[3px_3px_0_0_#000000] lg:shadow-[5px_5px_0_0_#000000] flex flex-col items-center text-center gap-3 rounded-none">
                        <div className="bg-accent-pink p-2 lg:p-3 text-white border-2 border-structural-black shadow-[2px_2px_0_0_#000000] rounded-none">
                          <Coins className="w-5 h-5 lg:w-6 lg:h-6" />
                        </div>
                        <div>
                          <p className="text-[9px] lg:text-[10px] text-structural-black font-black uppercase tracking-widest mb-1">{t('setup.monthly_fee')}</p>
                          <p className="font-black tabular-nums text-xl lg:text-2xl italic leading-none">
                            ₹{shareSize.toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>

                      <div className="p-4 lg:p-6 bg-white border-4 border-structural-black shadow-[3px_3px_0_0_#000000] lg:shadow-[5px_5px_0_0_#000000] flex flex-col items-center text-center gap-3 rounded-none">
                        <div className="bg-accent-blue p-2 lg:p-3 text-white border-2 border-structural-black shadow-[2px_2px_0_0_#000000] rounded-none">
                          <CalendarDays className="w-5 h-5 lg:w-6 lg:h-6" />
                        </div>
                        <div>
                          <p className="text-[9px] lg:text-[10px] text-structural-black font-black uppercase tracking-widest mb-1">{t('setup.term_duration')}</p>
                          <p className="font-black text-xl lg:text-2xl italic leading-none">{participants.length > 0 ? participants.length : 1} {t('setup.months')}</p>
                        </div>
                      </div>

                      <div className="p-4 lg:p-6 bg-white border-4 border-structural-black shadow-[3px_3px_0_0_#000000] lg:shadow-[5px_5px_0_0_#000000] flex flex-col items-center text-center gap-3 sm:col-span-2 lg:col-span-1 rounded-none">
                        <div className="bg-accent-primary p-2 lg:p-3 text-structural-black border-2 border-structural-black shadow-[2px_2px_0_0_#000000] rounded-none">
                          <Wallet className="w-5 h-5 lg:w-6 lg:h-6" />
                        </div>
                        <div>
                          <p className="text-[9px] lg:text-[10px] text-structural-black font-black uppercase tracking-widest mb-1">{t('setup.launch_date')}</p>
                          <p className="font-black text-lg lg:text-xl italic leading-none">{new Date(fundDetails.startDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }).toUpperCase()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white p-8 md:p-12 border-4 border-structural-black shadow-[12px_12px_0_0_#000000]">
            <div className="flex justify-between items-start mb-12">
               <h3 className="text-4xl font-black text-structural-black uppercase italic tracking-tighter border-b-6 border-accent-primary pb-2">
                 {view === 'create' ? t('setup.init_title') : t('setup.edit_title')}
               </h3>
               {hasFund && (
                 <button 
                   onClick={() => setView('dashboard')}
                   className="brutal-btn brutal-btn-pink text-xs px-4 py-2"
                 >
                   {t('setup.cancel_btn')}
                 </button>
               )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">
              <div>
                <label className="block text-sm font-black text-structural-black uppercase tracking-widest mb-3">{t('setup.identity_label')}</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="E.G. UNDERGROUND CHIT 2026"
                  className="brutal-input text-xl font-bold uppercase transition-all focus:border-accent-primary disabled:bg-bg-canvas disabled:opacity-50"
                  disabled={!isAdmin}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-black text-structural-black uppercase tracking-widest mb-3">
                    {t('setup.stake_label')} {view === 'edit' && <span className="text-accent-pink">{t('setup.locked')}</span>}
                  </label>
                  <input
                    type="number"
                    name="monthlyAmount"
                    required
                    min="0"
                    disabled={view === 'edit' || !isAdmin}
                    value={formData.monthlyAmount || ''}
                    onChange={handleChange}
                    className={`brutal-input text-xl font-bold tabular-nums transition-all focus:border-accent-primary ${view === 'edit' || !isAdmin ? 'bg-bg-canvas cursor-not-allowed opacity-70' : ''}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-black text-structural-black uppercase tracking-widest mb-3">{t('setup.deployment_label')}</label>
                  <input
                    type="date"
                    name="startDate"
                    required
                    value={formData.startDate}
                    onChange={handleChange}
                    className="brutal-input text-xl font-bold transition-all focus:border-accent-primary disabled:bg-bg-canvas disabled:opacity-50"
                    disabled={!isAdmin}
                  />
                </div>
              </div>

              {hasParticipants && view === 'create' && (
                <div className="bg-accent-pink text-white p-6 border-4 border-structural-black shadow-[6px_6px_0_0_#000000] flex gap-4 items-center">
                  <AlertCircle className="w-10 h-10 shrink-0" />
                  <p className="font-black uppercase tracking-tighter text-sm italic">
                    {t('setup.reset_caution')}
                  </p>
                </div>
              )}

              <button
                type="submit"
                className="brutal-btn w-full text-2xl py-6 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
                disabled={!isAdmin}
              >
                {view === 'create' ? t('setup.start_btn') : t('setup.sync_btn')}
              </button>
              {successMsg && <p className="bg-accent-primary p-4 border-2 border-structural-black text-structural-black text-center font-black uppercase tracking-widest mt-8 shadow-[4px_4px_0_0_#000000]">{successMsg}</p>}
            </form>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-structural-black max-w-md w-full p-8 shadow-[15px_15px_0_0_#af7b4c] rounded-none">
            <div className="p-8">
              <h3 className="text-3xl font-black text-structural-black uppercase italic mb-4 tracking-tighter">{t('setup.reset_modal_title')}</h3>
              <p className="text-structural-black font-medium mb-8 uppercase tracking-tight text-sm">
                {t('setup.reset_modal_desc')}
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 brutal-btn brutal-btn-blue text-sm"
                >
                  {t('setup.abort_btn')}
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormData({
                      name: '',
                      monthlyAmount: 0,
                      startDate: new Date().toISOString().split('T')[0]
                    });
                    setView('create');
                  }}
                  className="flex-1 brutal-btn text-sm"
                >
                  {t('setup.confirm_btn')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SetupTab;
