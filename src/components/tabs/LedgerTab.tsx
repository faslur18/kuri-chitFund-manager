import React, { useRef, useEffect } from 'react';
import { useKuri } from '../../context/KuriContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { FileText, CheckCircle2, XCircle, TrendingUp, Lock, ShieldAlert } from 'lucide-react';

const LedgerTab: React.FC = () => {
  const { participants, updateParticipantStatus, shareSize, activeMonth, fundDetails } = useKuri();
  const { t, language } = useLanguage();
  const { isAdmin } = useAuth();
  const tableContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Automatically scroll to the active month column when the component mounts or activeMonth changes
    const element = document.getElementById(`month-col-${activeMonth}`);
    if (element && tableContainerRef.current) {
      const containerLeft = tableContainerRef.current.getBoundingClientRect().left;
      const elementLeft = element.getBoundingClientRect().left;
      // Scroll by the difference, offset by exactly the width of the frozen Participant column roughly (around 250px)
      tableContainerRef.current.scrollBy({ left: elementLeft - containerLeft - 250, behavior: 'smooth' });
    }
  }, [activeMonth]);

  const totalExpected = participants.length * shareSize;
  const totalCollected = participants.reduce((sum, p) => {
    const isPaid = p.paymentHistory.find(h => h.monthIndex === activeMonth)?.status === 'Paid';
    if (!isPaid) return sum;
    return sum + (p.type === 'Individual' ? p.monthlyAmountDue : p.combinedMonthlyAmountDue);
  }, 0);

  const progressPercentage = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0;

  return (
    <div className="space-y-8">
      {!isAdmin && (
        <div className="bg-accent-pink/10 border-2 border-accent-pink p-3 flex items-center gap-3 mb-2">
          <ShieldAlert className="w-5 h-5 text-accent-pink shrink-0" />
          <p className="text-[10px] font-black uppercase text-accent-pink tracking-tight leading-tight">
            {t('status.readonly_ledger')}
          </p>
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
        <div className="w-12 h-12 flex items-center justify-center bg-accent-pink text-white border-2 border-structural-black shadow-[3px_3px_0_0_#000000] rounded-none">
          <FileText className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-black tracking-tighter text-structural-black uppercase italic leading-none">{t('ledger.title')}</h2>
          <p className="text-[10px] font-bold text-structural-black mt-1 bg-accent-blue text-white px-1.5 py-0.5 inline-block border-2 border-structural-black shadow-[2px_2px_0_0_#000000] rounded-none">{t('ledger.subtitle')}</p>
        </div>
      </div>

      <div className="bg-white p-4 lg:p-6 border-4 border-structural-black shadow-[4px_4px_0_0_#000000] lg:shadow-[8px_8px_0_0_#000000] rounded-none">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 lg:gap-8 mb-6 lg:mb-10">
          <div>
            <h3 className="text-2xl lg:text-3xl font-black mb-1.5 text-structural-black uppercase italic tracking-tighter">{t('ledger.month', { count: activeMonth })}</h3>
            {fundDetails && (
              <p className="text-[9px] lg:text-[10px] text-structural-black font-black tracking-widest uppercase bg-accent-primary px-2 py-0.5 border-2 border-structural-black inline-block shadow-[2px_2px_0_0_#000000] rounded-none">
                {new Date(new Date(fundDetails.startDate).setMonth(new Date(fundDetails.startDate).getMonth() + activeMonth - 1)).toLocaleDateString(language === 'ml' ? 'ml-IN' : 'en-IN', { month: 'long', year: 'numeric' }).toUpperCase()}
              </p>
            )}
          </div>

          {/* Progress Summary */}
          <div className="w-full xl:max-w-xl bg-bg-canvas p-4 lg:p-6 border-4 border-structural-black shadow-[3px_3px_0_0_#000000] lg:shadow-[6px_6px_0_0_#000000] flex flex-col sm:flex-row items-center gap-4 lg:gap-6 rounded-none">
            <div className="p-2 lg:p-3 bg-structural-black text-white border-2 border-structural-black shadow-[2px_2px_0_0_#af7b4c] hidden sm:block rounded-none">
              <TrendingUp className="w-5 h-5 lg:w-6 lg:h-6" />
            </div>
            <div className="flex-1 w-full">
              <div className="flex justify-between text-[9px] lg:text-[11px] font-black uppercase tracking-widest mb-2 lg:mb-3">
                <span className="text-structural-black">{t('ledger.collected', { amount: totalCollected.toLocaleString('en-IN') })}</span>
                <span className="text-structural-black/50">{t('ledger.target', { amount: totalExpected.toLocaleString('en-IN') })}</span>
              </div>
              <div className="h-3 lg:h-4 w-full bg-white border-2 border-structural-black overflow-hidden shadow-inner rounded-none">
                <div
                  className={`h-full transition-all duration-500 border-r-2 border-structural-black ${
                    progressPercentage === 100 ? 'bg-accent-primary' : 'bg-accent-blue'
                  }`}
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
            <div className="w-full flex justify-between sm:w-auto sm:text-right mt-0.5 sm:mt-0">
              <span className="sm:hidden text-[9px] font-black uppercase italic text-structural-black/60">{t('ledger.progress')}</span>
              <span className={`text-3xl lg:text-4xl font-black tabular-nums tracking-tighter ${progressPercentage === 100 ? 'text-accent-primary' : 'text-structural-black'}`}>
                {progressPercentage}%
              </span>
            </div>
          </div>
        </div>

        {/* Mobile Ledger Card View (visible on < lg screens) */}
        <div className="lg:hidden space-y-6">
          {participants.length > 0 ? (
            participants.map((p) => {
              const isIndi = p.type === 'Individual';
              const amount = isIndi ? p.monthlyAmountDue : p.combinedMonthlyAmountDue;
              return (
                <div key={p.id} className="bg-white border-4 border-structural-black shadow-[4px_4px_0_0_#000000] p-4 space-y-4 rounded-none">
                  {/* Card Header */}
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-black text-xl text-structural-black uppercase italic tracking-tighter leading-tight mb-1.5 break-words">
                        {isIndi ? p.name : p.groupName}
                      </div>
                      <span className={`inline-block px-1.5 py-0.5 border-2 border-structural-black text-[9px] uppercase font-black tracking-widest shadow-[1.5px_1.5px_0_0_#000000] rounded-none ${
                        isIndi ? 'bg-white text-structural-black' : 'bg-accent-blue text-white'
                      }`}>
                        {isIndi ? t('members.individual') : t('members.group')}
                      </span>
                    </div>
                    <div className="bg-bg-canvas border-2 border-structural-black p-2 shadow-[2px_2px_0_0_#000000] text-right rounded-none">
                      <p className="text-[8px] font-black uppercase tracking-widest text-structural-black/50 mb-0.5">{t('ledger.due')}</p>
                      <p className="font-black tabular-nums text-lg text-structural-black italic whitespace-nowrap">₹{amount.toLocaleString('en-IN')}</p>
                    </div>
                  </div>

                  {/* Payment Matrix (Mobile Grid) */}
                  <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-5 gap-2">
                    {Array.from({ length: participants.length || 1 }, (_, i) => i + 1).map(m => {
                      const historyRecord = p.paymentHistory?.find(h => h.monthIndex === m);
                      const isPaid = historyRecord?.status === 'Paid';
                      const isActive = m === activeMonth;
                      const isLocked = m < activeMonth && isPaid;

                      const d = fundDetails ? new Date(fundDetails.startDate) : new Date();
                      d.setMonth(d.getMonth() + m - 1);
                      const monthLabel = d.toLocaleDateString(language === 'ml' ? 'ml-IN' : 'en-IN', { month: 'short' }).toUpperCase();
                      
                      return (
                        <button
                          key={m}
                          disabled={isLocked || !isAdmin}
                          onClick={() => !isLocked && isAdmin && updateParticipantStatus(p.id, m, isPaid ? 'Unpaid' : 'Paid')}
                          className={`flex flex-col items-center justify-center p-2 border-2 border-structural-black transition-all transform active:translate-x-[1px] active:translate-y-[1px] active:shadow-none rounded-none ${
                            isPaid 
                              ? 'bg-accent-primary text-structural-black shadow-[2px_2px_0_0_#000000]' 
                              : 'bg-accent-pink text-white shadow-[2px_2px_0_0_#000000]'
                          } ${isLocked ? 'grayscale opacity-60 shadow-none cursor-not-allowed' : ''} ${isActive ? 'ring-[3px] ring-structural-black ring-inset' : ''}`}
                        >
                          <span className="text-[8px] font-black uppercase mb-0.5 tracking-tight">{monthLabel} {m}</span>
                          <div className="flex items-center gap-1">
                            {isLocked ? <Lock className="w-2 h-2" /> : (isPaid ? <CheckCircle2 className="w-2.5 h-2.5" /> : <XCircle className="w-2.5 h-2.5" />)}
                            <span className="text-[9px] font-black">{isPaid ? t('ledger.paid_status') : t('ledger.due_status')}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white p-8 border-4 border-structural-black shadow-[4px_4px_0_0_#000000] text-center rounded-none">
              <p className="font-black uppercase italic text-structural-black/20 text-lg tracking-widest">{t('ledger.no_records')}</p>
            </div>
          )}
        </div>

        {/* Desktop Ledger Table (visible on lg screens) */}
        <div ref={tableContainerRef} className="hidden lg:block overflow-x-auto w-full border-4 border-structural-black relative scroll-smooth shadow-[6px_6px_0_0_#000000] lg:shadow-[10px_10px_0_0_#000000] rounded-none">
          <table className="w-full text-left border-collapse min-w-max">
            <thead>
              <tr className="bg-structural-black text-white text-[10px] uppercase font-black tracking-[0.2em]">
                <th className="px-4 lg:px-6 py-4 lg:py-6 sticky left-0 z-20 bg-structural-black min-w-[200px] lg:min-w-[320px] border-r-2 lg:border-r-4 border-white shadow-[2px_0_0_0_#000000] lg:shadow-[4px_0_0_0_#000000]">
                  <div className="flex items-center justify-between gap-4 mr-2">
                    <span>{t('ledger.table_member')}</span>
                    <span>{t('ledger.table_due')}</span>
                  </div>
                </th>
                {Array.from({ length: participants.length || 1 }, (_, i) => {
                  const d = fundDetails ? new Date(fundDetails.startDate) : new Date();
                  d.setMonth(d.getMonth() + i);
                  const monthLabel = d.toLocaleDateString(language === 'ml' ? 'ml-IN' : 'en-IN', { month: 'short', year: 'numeric' }).toUpperCase();
                  
                  return (
                    <th id={`month-col-${i + 1}`} key={i} className={`px-6 py-6 font-black text-center whitespace-nowrap border-r-2 border-white/20 ${i + 1 === activeMonth ? 'bg-accent-pink text-white border-r-4 border-white' : ''}`}>
                      {monthLabel}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-structural-black text-sm">
              {participants.length > 0 ? (
                participants.map((p) => {
                  const isIndi = p.type === 'Individual';
                  const amount = isIndi ? p.monthlyAmountDue : p.combinedMonthlyAmountDue;
                  return (
                    <tr key={p.id} className="hover:bg-bg-canvas transition-colors group">
                      <td className="px-6 py-6 sticky left-0 z-10 bg-white group-hover:bg-bg-canvas border-r-4 border-structural-black shadow-[4px_0_0_0_rgba(0,0,0,0.1)] min-w-[280px] sm:min-w-[320px]">
                        <div className="flex items-center justify-between gap-6">
                          <div className="flex-1 min-w-0">
                            <div className="font-black text-xl text-structural-black uppercase italic tracking-tighter leading-none pb-2 pr-4 min-w-0 flex-1">
                              {isIndi ? p.name : p.groupName}
                            </div>
                            <span className={`inline-block px-2 py-0.5 border-2 border-structural-black text-[9px] uppercase font-black tracking-widest shadow-[2px_2px_0_0_#000000] ${
                              isIndi ? 'bg-white text-structural-black' : 'bg-accent-blue text-white'
                            }`}>
                              {isIndi ? t('members.individual') : t('members.group')}
                            </span>
                          </div>
                          <div className="font-black tabular-nums text-xl text-structural-black italic whitespace-nowrap shrink-0 pr-4">
                            ₹{amount.toLocaleString('en-IN')}
                          </div>
                        </div>
                      </td>
                      {Array.from({ length: participants.length || 1 }, (_, i) => i + 1).map(m => {
                        const historyRecord = p.paymentHistory?.find(h => h.monthIndex === m);
                        const isPaid = historyRecord?.status === 'Paid';
                        const isActive = m === activeMonth;
                        const isLocked = m < activeMonth && isPaid;
                        
                        return (
                          <td key={m} className={`px-4 py-6 text-center min-w-[140px] border-r-2 border-structural-black/10 ${isActive ? 'bg-accent-primary/10' : ''} ${isLocked ? 'opacity-80' : ''}`}>
                            <button
                              disabled={isLocked || !isAdmin}
                              onClick={() => !isLocked && isAdmin && updateParticipantStatus(p.id, m, isPaid ? 'Unpaid' : 'Paid')}
                              className={`w-full py-3 border-3 border-structural-black font-black text-[10px] uppercase tracking-widest shadow-[4px_4px_0_0_#000000] transition-all transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center justify-center gap-2 ${
                                isPaid 
                                  ? 'bg-accent-primary text-structural-black hover:opacity-90' 
                                  : 'bg-accent-pink text-white hover:opacity-90'
                              } ${isLocked || !isAdmin ? 'cursor-not-allowed contrast-50 shadow-none transform-none' : ''}`}
                            >
                              {isLocked && <Lock className="w-3 h-3" />}
                              {isPaid ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                              <span>{isPaid ? t('ledger.paid_status') : t('ledger.due_status')}</span>
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="px-10 py-24 text-center font-black uppercase italic text-structural-black/20 text-3xl tracking-widest">
                    {t('ledger.no_records')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LedgerTab;
