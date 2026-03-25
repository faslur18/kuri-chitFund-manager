import React, { useState, useEffect, useRef } from 'react';
import { useKuri } from '../../context/KuriContext';
import winnerMusic from '../../assets/draw_winner_music.mp3';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Trophy, Gift, Calendar, Sparkles, AlertCircle, ShieldCheck, ShieldAlert, Lock, Zap } from 'lucide-react';
import type { Participant } from '../../types';

const DrawTab: React.FC = () => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentBlink, setCurrentBlink] = useState<string | null>(null);
  const [winnerRevealed, setWinnerRevealed] = useState<Participant | null>(null);
  const [swappingDrawId, setSwappingDrawId] = useState<string | null>(null);
  const { 
    participants, 
    drawHistory, 
    conductDraw, 
    swapWinner, 
    activeMonth, 
    setActiveMonth, 
    shareSize,
    drawActive,
    toggleDrawActive 
  } = useKuri();
  const { t } = useLanguage();
  const { isAdmin } = useAuth();
  const winAudio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    winAudio.current = new Audio(winnerMusic);
  }, []);

  const playWinSound = () => {
    if (winAudio.current) {
        winAudio.current.currentTime = 0;
        winAudio.current.play().catch(e => console.warn('Audio play blocked:', e));
    }
  };

  const eligibleParticipants = participants.filter((p) => !p.hasWon);
  const prizeAmount = participants.length * shareSize;
  const allCaughtUpToCurrentMonth = participants.every(p => {
    for (let m = 1; m <= activeMonth; m++) {
      const history = p.paymentHistory?.find(h => h.monthIndex === m);
      if (history?.status !== 'Paid') return false;
    }
    return true;
  });

  const previousWinner = drawHistory.find(d => d.monthIndex === activeMonth - 1);
  const isFundComplete = activeMonth > participants.length && participants.length > 0;

  const handleDraw = () => {
    if (eligibleParticipants.length === 0) return;

    if (eligibleParticipants.length === 1) {
       setIsDrawing(true);
       setWinnerRevealed(eligibleParticipants[0]);
       playWinSound();
       conductDraw(eligibleParticipants[0].id, prizeAmount, activeMonth);
       
       setTimeout(() => {
          setWinnerRevealed(null);
          setActiveMonth(activeMonth + 1);
          setIsDrawing(false);
       }, 5000);
       return;
    }

    setIsDrawing(true);
    setWinnerRevealed(null);
    let blinkCount = 0;
    
    // Simulate lottery rotation effect
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * eligibleParticipants.length);
      setCurrentBlink(eligibleParticipants[randomIndex].id);
      blinkCount++;

      if (blinkCount > 20) {
        clearInterval(interval);
        
        // Pick actual winner
        const winnerIndex = Math.floor(Math.random() * eligibleParticipants.length);
        const winner = eligibleParticipants[winnerIndex];
        
        setWinnerRevealed(winner);
        playWinSound();
        setCurrentBlink(null);
        conductDraw(winner.id, prizeAmount, activeMonth);
        
        // Advance month
        setTimeout(() => {
           setWinnerRevealed(null);
           setActiveMonth(activeMonth + 1);
           setIsDrawing(false);
        }, 5000); // Wait 5s before advancing for the next month
      }
    }, 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 flex items-center justify-center bg-accent-primary text-structural-black border-4 border-structural-black shadow-[3px_3px_0_0_#000000]">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tighter text-structural-black uppercase italic leading-none">{t('draw.title')}</h2>
            <p className="text-[10px] font-bold text-structural-black mt-1 bg-accent-pink px-1.5 py-0.5 inline-block border-2 border-structural-black shadow-[2px_2px_0_0_#000000]">{t('draw.subtitle')}</p>
          </div>
        </div>

        {/* Global Draw Activation Status */}
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 border-2 border-structural-black shadow-[2px_2px_0_0_#000000] ${drawActive ? 'bg-accent-primary/20 text-structural-black' : 'bg-accent-pink/20 text-accent-pink'}`}>
            {drawActive ? <ShieldCheck className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            <span className="text-[10px] font-black uppercase tracking-tight">
              {drawActive ? 'Draw System: ACTIVE' : 'Draw System: LOCKED'}
            </span>
          </div>
          
          {isAdmin && (
            <button
              onClick={toggleDrawActive}
              className={`p-2 border-2 border-structural-black shadow-[2px_2px_0_0_#000000] transition-all active:translate-x-px active:translate-y-px active:shadow-none ${
                drawActive ? 'bg-accent-pink text-white hover:opacity-90' : 'bg-accent-primary text-structural-black hover:opacity-90'
              }`}
              title={drawActive ? 'Lock Draw' : 'Activate Draw'}
            >
              <Zap className={`w-5 h-5 ${drawActive ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-12">
        
        {/* Draw Logic Section */}
        <div className="bg-white p-6 md:p-10 border-4 border-structural-black shadow-[10px_10px_0_0_#ebd8c1] flex flex-col items-center justify-center text-center min-h-[400px] lg:min-h-[500px] relative overflow-hidden">
          
          <div className="absolute top-0 w-full h-3 bg-structural-black"></div>

          {isFundComplete ? (
             <div className="flex flex-col items-center w-full z-10 py-6 lg:py-10">
               <div className="p-6 lg:p-8 bg-accent-primary border-4 border-structural-black shadow-[4px_4px_0_0_#000000] lg:shadow-[6px_6px_0_0_#000000] text-structural-black mb-5 lg:mb-6 rounded-none">
                 <Trophy className="w-12 h-12 sm:w-16 sm:h-16" />
               </div>
               <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-structural-black tracking-tighter uppercase italic mb-3 lg:mb-4 leading-none">
                 {t('draw.op_complete')}
               </h3>
               <p className="text-structural-black font-black uppercase text-center max-w-xs px-3 text-[9px] lg:text-[10px] tracking-widest leading-relaxed bg-accent-blue text-white p-2.5 lg:p-3 border-2 border-structural-black shadow-[3px_3px_0_0_#000000] rounded-none">
                 {t('draw.archive_desc', { count: participants.length })}
               </p>
             </div>
          ) : winnerRevealed ? (
             <div className="flex flex-col items-center space-y-5 lg:space-y-6 z-10 w-full px-3 py-6">
               <div className="p-6 lg:p-8 bg-accent-primary border-4 border-structural-black shadow-[4px_4px_0_0_#000000] lg:shadow-[8px_8px_0_0_#000000] text-structural-black mb-1 relative rounded-none">
                 <Sparkles className="absolute -top-3 -right-3 text-accent-pink w-8 h-8 lg:w-10 lg:h-10" />
                 <Trophy className="w-12 h-12 lg:w-16 lg:h-16" />
               </div>
               <h3 className="text-3xl lg:text-5xl font-black text-structural-black tracking-tighter uppercase italic leading-none">
                 {t('draw.winner_title')}
               </h3>
               <p className="text-xl sm:text-2xl lg:text-4xl font-black text-white bg-structural-black px-3 lg:px-5 py-2 lg:py-3 border-4 border-accent-primary shadow-[3px_3px_0_0_#af7b4c] lg:shadow-[6px_6px_0_0_#af7b4c] uppercase tracking-tighter rounded-none text-center">
                 {winnerRevealed.type === 'Individual' ? winnerRevealed.name : winnerRevealed.groupName}
               </p>
               <div className="mt-3 px-4 lg:py-3 bg-accent-blue text-white font-black tabular-nums text-lg lg:text-xl border-4 border-structural-black shadow-[3px_3px_0_0_#000000] lg:shadow-[5px_5px_0_0_#000000] italic rounded-none">
                 {t('draw.prize', { amount: prizeAmount.toLocaleString('en-IN') })}
               </div>
               <p className="text-[9px] uppercase font-black text-structural-black mt-3 lg:mt-6 tracking-[0.2em] animate-pulse">{t('draw.syncing')}</p>
             </div>
          ) : previousWinner && !allCaughtUpToCurrentMonth ? (
             <div className="flex flex-col items-center w-full z-10">
               <div className="p-6 bg-bg-canvas border-4 border-structural-black shadow-[4px_4px_0_0_#000000] text-structural-black/20 mb-8">
                 <Trophy className="w-16 h-16" />
               </div>
               <h3 className="text-[9px] font-black text-structural-black mb-3 uppercase tracking-widest bg-accent-blue text-white px-2 py-1 border-2 border-structural-black">
                 {t('draw.dispatched', { count: activeMonth - 1 })}
               </h3>
               <p className="text-3xl sm:text-4xl font-black text-structural-black mb-3 uppercase italic tracking-tighter leading-none">
                 {previousWinner.winnerName}
               </p>
               <div className="mb-10 px-5 py-2 bg-white border-3 border-structural-black font-black tabular-nums text-lg text-structural-black shadow-[3px_3px_0_0_#000000]">
                 {t('draw.disbursed', { amount: previousWinner.amountWon.toLocaleString('en-IN') })}
               </div>

               <div className="flex items-start gap-3 p-5 bg-accent-pink text-white border-4 border-structural-black shadow-[6px_6px_0_0_#000000] w-full max-w-sm">
                 <AlertCircle className="w-6 h-6 shrink-0" />
                 <p className="font-black uppercase tracking-tighter text-[9px] leading-relaxed text-left">
                   {t('draw.locked_msg', { count: activeMonth })}
                 </p>
               </div>
             </div>
          ) : (
             <div className="flex flex-col items-center w-full z-10">
               <Gift className="w-20 h-20 sm:w-24 sm:h-24 text-bg-canvas mb-8 stroke-structural-black stroke-[1.5px]" />
               <h3 className="text-2xl lg:text-3xl font-black mb-3 text-structural-black uppercase italic tracking-tighter">
                 {eligibleParticipants.length === 1 ? t('draw.final_cycle', { count: activeMonth }) : t('draw.draw_cycle', { count: activeMonth })}
               </h3>
               <p className="text-[10px] text-structural-black/60 font-black uppercase tracking-widest mb-8 max-w-xs px-3">
                 {eligibleParticipants.length === 1 
                    ? t('draw.single_candidate') 
                    : t('draw.multiple_candidates', { count: eligibleParticipants.length })}
               </p>

               <button
                 onClick={handleDraw}
                 disabled={isDrawing || eligibleParticipants.length === 0 || !allCaughtUpToCurrentMonth || !drawActive}
                 className={`brutal-btn w-full max-w-xs py-4 text-xl ${
                   (isDrawing || eligibleParticipants.length === 0 || !allCaughtUpToCurrentMonth || !drawActive) 
                    ? 'opacity-50 cursor-not-allowed grayscale shadow-none transform-none' 
                    : 'bg-accent-primary hover:opacity-90 shadow-[6px_6px_0_0_#000000]'
                 }`}
               >
                 {isDrawing 
                    ? (eligibleParticipants.length === 1 ? t('draw.btn_processing') : t('draw.btn_rotating')) 
                    : (eligibleParticipants.length === 1 ? t('draw.btn_authorize') : t('draw.btn_initiate'))}
               </button>

               {!drawActive && !isDrawing && !winnerRevealed && (
                 <div className="mt-6 flex flex-col items-center gap-2 p-3 bg-accent-pink/10 text-accent-pink border-2 border-accent-pink shadow-[3px_3px_0_0_#000000] w-full max-w-xs">
                   <ShieldAlert className="w-4 h-4 shrink-0" />
                   <span className="font-black uppercase tracking-tighter text-[9px] text-center">{t('draw.admin_locked')}</span>
                 </div>
               )}

               {drawActive && !allCaughtUpToCurrentMonth && !isDrawing && !winnerRevealed && (
                 <div className="mt-6 flex flex-col items-center gap-3 p-3 bg-accent-pink text-white border-3 border-structural-black shadow-[4px_4px_0_0_#000000] w-full max-w-xs">
                   <AlertCircle className="w-5 h-5 shrink-0" />
                   <span className="font-black uppercase tracking-tighter text-[9px] text-center italic">{t('draw.pending_block')}</span>
                 </div>
               )}
             </div>
          )}

          {/* Lottery Blinking Ring effect */}
          {isDrawing && !winnerRevealed && (
            <div className="absolute inset-0 flex items-center justify-center bg-accent-blue/95 z-50">
              <div className="flex flex-col items-center justify-center w-full px-6">
                 <div className="w-20 h-20 border-[6px] border-white border-t-accent-primary animate-spin mb-8 shadow-[6px_6px_0_0_#000000]"></div>
                 <span className="text-white text-[9px] font-black uppercase tracking-[0.3em] block mb-4 animate-pulse">
                   {t('draw.scanning')}
                 </span>
                 
                 <div className="w-full bg-white border-4 border-structural-black p-6 shadow-[8px_8px_0_0_#000000]">
                   <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-structural-black tracking-tighter uppercase italic text-center truncate">
                     {(() => {
                        const blinkingParticipant = eligibleParticipants.find(p => p.id === currentBlink);
                        if (!blinkingParticipant) return '---';
                        return blinkingParticipant.type === 'Individual' ? blinkingParticipant.name : blinkingParticipant.groupName;
                     })()}
                   </h2>
                 </div>
              </div>
            </div>
          )}
        </div>

        {/* History Section */}
        <div className="bg-white border-4 border-structural-black shadow-[8px_8px_0_0_#3e6394] overflow-hidden flex flex-col h-full max-h-[500px] lg:max-h-[600px]">
           <div className="p-6 lg:p-8 border-b-4 border-structural-black flex flex-col sm:flex-row justify-between sm:items-center bg-bg-canvas shrink-0 gap-4 lg:gap-6">
             <h3 className="text-xl lg:text-2xl font-black text-structural-black uppercase italic tracking-tighter flex items-center gap-3 lg:gap-4">
               <Calendar className="w-6 h-6 lg:w-8 lg:h-8 text-accent-blue" /> {t('draw.log_title')}
             </h3>
             <span className="text-[9px] lg:text-[10px] font-black text-white bg-structural-black px-3 py-1.5 lg:px-4 lg:py-2 border-2 border-structural-black shadow-[2px_2px_0_0_#ebd8c1] lg:shadow-[3px_3px_0_0_#ebd8c1] tabular-nums uppercase tracking-widest">
               {t('draw.log_entries', { count: drawHistory.length })}
             </span>
          </div>

          <div className="overflow-y-auto w-full flex-1 p-6 lg:p-8 space-y-6 lg:space-y-8 bg-white">
            {drawHistory.length > 0 ? (
                drawHistory.map((history) => {
                  const isLatestDraw = history.monthIndex === activeMonth - 1;
                  const canSwap = isLatestDraw && !history.isSwapped;

                  return (
                    <div key={history.id} className="relative">
                      <div className={`p-4 lg:p-5 border-4 border-structural-black bg-bg-canvas flex flex-col sm:flex-row sm:items-center justify-between hover:bg-accent-primary/20 transition-all hover:translate-x-1 hover:-translate-y-1 shadow-[4px_4px_0_0_#000000] gap-4 lg:gap-6 ${swappingDrawId === history.id ? 'opacity-30 pointer-events-none' : ''}`}>
                        <div className="flex items-center gap-4 lg:gap-6">
                          <div className="hidden sm:block p-3 lg:p-4 bg-structural-black text-white border-2 border-structural-black shadow-[2px_2px_0_0_#3e6394]">
                            <Trophy className="w-5 h-5 lg:w-6 lg:h-6" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[9px] text-structural-black/50 font-black mb-0.5 uppercase tracking-widest truncate">
                              {t('ledger.month', { count: history.monthIndex })} {history.isSwapped && <span className="text-accent-pink ml-2">{t('draw.swapped')}</span>}
                            </p>
                            <p className="font-black text-structural-black text-lg lg:text-xl uppercase italic tracking-tighter leading-none pr-3">
                              {history.winnerName}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:gap-6">
                           <div className="sm:text-right border-t-2 border-structural-black/10 sm:border-t-0 pt-3 lg:pt-4 sm:pt-0">
                            <p className="text-[9px] text-structural-black/50 font-black mb-0.5 uppercase tracking-widest truncate">{history.date.toUpperCase()}</p>
                            <p className="font-black tabular-nums text-accent-blue text-lg lg:text-xl italic">₹{history.amountWon.toLocaleString('en-IN')}</p>
                          </div>
                          {canSwap && (
                            <button
                              onClick={() => setSwappingDrawId(history.id)}
                               className="brutal-btn bg-accent-pink text-white px-3 py-1.5 text-[9px] font-black uppercase italic shadow-[3px_3px_0_0_#000000] hover:opacity-90"
                            >
                              {t('draw.swap_btn')}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Swap Overlay/Selection */}
                      {swappingDrawId === history.id && (
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white border-4 border-accent-pink p-3 lg:p-4 shadow-[6px_6px_0_0_#000000]">
                          <p className="text-[9px] font-black text-structural-black uppercase mb-3 lg:mb-4 italic">{t('draw.transfer_to')}</p>
                          <div className="flex flex-wrap gap-1.5 lg:gap-2 justify-center max-w-full">
                            {eligibleParticipants.map(participant => (
                              <button
                                key={participant.id}
                                onClick={async () => {
                                  await swapWinner(history.id, participant.id);
                                  setSwappingDrawId(null);
                                }}
                                className="brutal-btn bg-white hover:bg-accent-primary px-2.5 py-1 text-[8px] font-black uppercase border-2 shadow-[1.5px_1.5px_0_0_#000000]"
                              >
                                {participant.type === 'Individual' ? participant.name : participant.groupName}
                              </button>
                            ))}
                            <button
                              onClick={() => setSwappingDrawId(null)}
                               className="brutal-btn bg-structural-black text-white px-2.5 py-1 text-[8px] font-black uppercase border-2 shadow-[1.5px_1.5px_0_0_black] ml-2 lg:ml-4"
                            >
                              {t('draw.cancel_btn')}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }).reverse()
            ) : (
               <div className="h-full flex flex-col items-center justify-center text-structural-black/20 space-y-5 lg:space-y-6 py-16 lg:py-24">
                 <Trophy className="w-16 h-16 lg:w-20 lg:h-20 opacity-10" />
                 <p className="font-black uppercase italic text-xl lg:text-2xl tracking-[0.2em]">{t('draw.log_empty')}</p>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrawTab;
