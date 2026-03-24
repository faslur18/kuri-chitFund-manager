import { useState } from 'react';
import { useKuri } from '../../context/KuriContext';
import { Trophy, Gift, Calendar, Sparkles, AlertCircle } from 'lucide-react';
import type { Participant } from '../../types';

const DrawTab = () => {
  const { participants, drawHistory, conductDraw, activeMonth, setActiveMonth, shareSize } = useKuri();
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentBlink, setCurrentBlink] = useState<string | null>(null);
  const [winnerRevealed, setWinnerRevealed] = useState<Participant | null>(null);

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
    <div className="space-y-12">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:gap-6 mb-8 lg:mb-12">
        <div className="w-12 h-12 lg:w-16 lg:h-16 flex items-center justify-center bg-accent-primary text-structural-black border-2 lg:border-4 border-structural-black shadow-[4px_4px_0_0_#000000] rounded-none">
          <Trophy className="w-6 h-6 lg:w-8 lg:h-8" />
        </div>
        <div>
          <h2 className="text-3xl lg:text-4xl font-black tracking-tighter text-structural-black uppercase italic leading-none">Victory Selection</h2>
          <p className="text-[10px] lg:text-sm font-bold text-structural-black mt-2 bg-accent-pink px-2 py-0.5 inline-block border-2 border-structural-black shadow-[2px_2px_0_0_#000000] rounded-none">Conduct the monthly draw and authorize winners.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
        
        {/* Draw Logic Section */}
        <div className="bg-white p-8 md:p-12 border-4 border-structural-black shadow-[15px_15px_0_0_#CCFF00] flex flex-col items-center justify-center text-center min-h-[500px] relative overflow-hidden">
          
          <div className="absolute top-0 w-full h-4 bg-structural-black"></div>

          {isFundComplete ? (
             <div className="flex flex-col items-center w-full z-10 py-8 lg:py-12">
               <div className="p-8 lg:p-10 bg-accent-primary border-4 border-structural-black shadow-[6px_6px_0_0_#000000] lg:shadow-[8px_8px_0_0_#000000] text-structural-black mb-6 lg:mb-8 rounded-none">
                 <Trophy className="w-16 h-16 sm:w-24 sm:h-24" />
               </div>
               <h3 className="text-3xl sm:text-5xl font-black text-structural-black tracking-tighter uppercase italic mb-4 lg:mb-6 leading-none">
                 OPERATION COMPLETE
               </h3>
               <p className="text-structural-black font-black uppercase text-center max-w-sm px-4 text-[10px] lg:text-xs tracking-widest leading-relaxed bg-accent-blue text-white p-3 lg:p-4 border-2 border-structural-black shadow-[4px_4px_0_0_#000000] rounded-none">
                 All {participants.length} cycles have been successfully authorized. The fund is archived.
               </p>
             </div>
          ) : winnerRevealed ? (
             <div className="flex flex-col items-center space-y-6 lg:space-y-8 z-10 w-full px-4 py-8">
               <div className="p-8 lg:p-10 bg-accent-primary border-4 border-structural-black shadow-[6px_6px_0_0_#000000] lg:shadow-[10px_10px_0_0_#000000] text-structural-black mb-2 relative rounded-none">
                 <Sparkles className="absolute -top-4 -right-4 text-accent-pink w-10 h-10 lg:w-12 lg:h-12" />
                 <Trophy className="w-16 h-16 lg:w-24 lg:h-24" />
               </div>
               <h3 className="text-4xl lg:text-7xl font-black text-structural-black tracking-tighter uppercase italic leading-none">
                 WINNER!
               </h3>
               <p className="text-2xl sm:text-4xl lg:text-5xl font-black text-white bg-structural-black px-4 lg:px-6 py-3 lg:py-4 border-4 border-accent-primary shadow-[4px_4px_0_0_#FF3366] lg:shadow-[8px_8px_0_0_#FF3366] uppercase tracking-tighter rounded-none text-center">
                 {winnerRevealed.type === 'Individual' ? winnerRevealed.name : winnerRevealed.groupName}
               </p>
               <div className="mt-4 px-6 lg:py-4 bg-accent-blue text-white font-black tabular-nums text-xl lg:text-2xl border-4 border-structural-black shadow-[4px_4px_0_0_#000000] lg:shadow-[6px_6px_0_0_#000000] italic rounded-none">
                 PRIZE: ₹{prizeAmount.toLocaleString('en-IN')}
               </div>
               <p className="text-[10px] uppercase font-black text-structural-black mt-4 lg:mt-8 tracking-[0.3em] animate-pulse">SYNCING DATA...</p>
             </div>
          ) : previousWinner && !allCaughtUpToCurrentMonth ? (
             <div className="flex flex-col items-center w-full z-10">
               <div className="p-8 bg-bg-canvas border-4 border-structural-black shadow-[6px_6px_0_0_#000000] text-structural-black/20 mb-10">
                 <Trophy className="w-20 h-20" />
               </div>
               <h3 className="text-xs font-black text-structural-black mb-4 uppercase tracking-[0.2em] bg-accent-blue text-white px-3 py-1 border-2 border-structural-black">
                 MONTH {activeMonth - 1} DISPATCHED
               </h3>
               <p className="text-4xl sm:text-5xl font-black text-structural-black mb-4 uppercase italic tracking-tighter leading-none">
                 {previousWinner.winnerName}
               </p>
               <div className="mb-12 px-6 py-2 bg-white border-3 border-structural-black font-black tabular-nums text-xl text-structural-black shadow-[4px_4px_0_0_#000000]">
                 DISBURSED: ₹{previousWinner.amountWon.toLocaleString('en-IN')}
               </div>

               <div className="flex items-start gap-4 p-6 bg-accent-pink text-white border-4 border-structural-black shadow-[8px_8px_0_0_#000000] w-full max-w-sm">
                 <AlertCircle className="w-8 h-8 shrink-0" />
                 <p className="font-black uppercase tracking-tighter text-[10px] leading-relaxed text-left">
                   Critical: Outstanding debts detected for <strong>Month {activeMonth}</strong>. Authorization of next draw is locked until all dues are cleared.
                 </p>
               </div>
             </div>
          ) : (
             <div className="flex flex-col items-center w-full z-10">
               <Gift className="w-24 h-24 sm:w-32 sm:h-32 text-bg-canvas mb-10 stroke-structural-black stroke-[1.5px]" />
               <h3 className="text-4xl font-black mb-4 text-structural-black uppercase italic tracking-tighter">
                 {eligibleParticipants.length === 1 ? `FINAL CYCLE (${activeMonth})` : `DRAW CYCLE ${activeMonth}`}
               </h3>
               <p className="text-xs text-structural-black/60 font-black uppercase tracking-widest mb-10 max-w-sm px-4">
                 {eligibleParticipants.length === 1 
                    ? `Single candidate remaining. Direct authorization enabled.` 
                    : `${eligibleParticipants.length} candidates recognized for this lottery session.`}
               </p>

               <button
                 onClick={handleDraw}
                 disabled={isDrawing || eligibleParticipants.length === 0 || !allCaughtUpToCurrentMonth}
                 className={`brutal-btn w-full max-w-sm py-6 text-2xl ${
                   (isDrawing || eligibleParticipants.length === 0 || !allCaughtUpToCurrentMonth) 
                    ? 'opacity-50 cursor-not-allowed grayscale shadow-none transform-none' 
                    : 'bg-accent-primary hover:bg-[#b8e600] shadow-[10px_10px_0_0_#000000]'
                 }`}
               >
                 {isDrawing 
                    ? (eligibleParticipants.length === 1 ? 'PROCESSING...' : 'ROTATING...') 
                    : (eligibleParticipants.length === 1 ? 'AUTHORIZE PRIZE' : 'INITIATE DRAW')}
               </button>

               {!allCaughtUpToCurrentMonth && !isDrawing && !winnerRevealed && (
                 <div className="mt-8 flex flex-col items-center gap-4 p-4 bg-accent-pink text-white border-3 border-structural-black shadow-[6px_6px_0_0_#000000] w-full max-w-sm">
                   <AlertCircle className="w-6 h-6 shrink-0" />
                   <span className="font-black uppercase tracking-tighter text-[10px] text-center italic">PENDING PAYMENTS BLOCKING OPERATION</span>
                 </div>
               )}
             </div>
          )}

          {/* Lottery Blinking Ring effect */}
          {isDrawing && !winnerRevealed && (
            <div className="absolute inset-0 flex items-center justify-center bg-accent-blue/95 z-50">
              <div className="flex flex-col items-center justify-center w-full px-8">
                 <div className="w-24 h-24 border-8 border-white border-t-accent-primary animate-spin mb-10 shadow-[8px_8px_0_0_#000000]"></div>
                 <span className="text-white text-xs font-black uppercase tracking-[0.4em] block mb-6 animate-pulse">
                   SCANNING DATABASE...
                 </span>
                 
                 <div className="w-full bg-white border-4 border-structural-black p-8 shadow-[12px_12px_0_0_#000000]">
                   <h2 className="text-4xl sm:text-6xl font-black text-structural-black tracking-tighter uppercase italic text-center truncate">
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
        <div className="bg-white border-4 border-structural-black shadow-[12px_12px_0_0_#4A4AFF] overflow-hidden flex flex-col h-full max-h-[600px]">
           <div className="p-8 border-b-4 border-structural-black flex flex-col sm:flex-row justify-between sm:items-center bg-bg-canvas shrink-0 gap-6">
             <h3 className="text-3xl font-black text-structural-black uppercase italic tracking-tighter flex items-center gap-4">
               <Calendar className="w-8 h-8 text-accent-blue" /> WINNER LOG
             </h3>
             <span className="text-xs font-black text-white bg-structural-black px-4 py-2 border-2 border-structural-black shadow-[3px_3px_0_0_#CCFF00] tabular-nums uppercase tracking-widest">
               {drawHistory.length} ENTRIES
             </span>
          </div>

          <div className="overflow-y-auto w-full flex-1 p-8 space-y-8 bg-white">
            {drawHistory.length > 0 ? (
               drawHistory.map((history) => (
                 <div key={history.id} className="p-6 border-4 border-structural-black bg-bg-canvas flex flex-col sm:flex-row sm:items-center justify-between hover:bg-accent-primary/20 transition-all hover:translate-x-1 hover:-translate-y-1 shadow-[6px_6px_0_0_#000000] gap-6">
                   <div className="flex items-center gap-6">
                     <div className="hidden sm:block p-4 bg-structural-black text-white border-2 border-structural-black shadow-[2px_2px_0_0_#4A4AFF]">
                       <Trophy className="w-6 h-6" />
                     </div>
                     <div>
                       <p className="text-[10px] text-structural-black/50 font-black mb-1 uppercase tracking-widest">MONTH {history.monthIndex}</p>
                       <p className="font-black text-structural-black text-2xl uppercase italic tracking-tighter leading-none">{history.winnerName}</p>
                     </div>
                   </div>
                   <div className="sm:text-right border-t-2 border-structural-black/10 sm:border-t-0 pt-4 sm:pt-0">
                     <p className="text-[10px] text-structural-black/50 font-black mb-1 uppercase tracking-widest">{history.date.toUpperCase()}</p>
                     <p className="font-black tabular-nums text-accent-blue text-2xl italic">₹{history.amountWon.toLocaleString('en-IN')}</p>
                   </div>
                 </div>
               )).reverse()
            ) : (
               <div className="h-full flex flex-col items-center justify-center text-structural-black/20 space-y-6 py-24">
                 <Trophy className="w-24 h-24 opacity-10" />
                 <p className="font-black uppercase italic text-2xl tracking-[0.2em]">LOG IS EMPTY.</p>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrawTab;
