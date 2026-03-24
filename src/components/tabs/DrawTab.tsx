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
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-8">
        <div className="w-12 h-12 flex items-center justify-center bg-zinc-100 text-zinc-900 rounded-xl border border-zinc-200 mb-2 sm:mb-0">
          <Trophy className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Draw / Winner Selection</h2>
          <p className="text-sm text-zinc-500 mt-1">Conduct the monthly draw and view past winners.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Draw Logic Section */}
        <div className="bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-zinc-200 flex flex-col items-center justify-center text-center min-h-[400px] relative overflow-hidden">
          
          <div className="absolute top-0 w-full h-1 bg-zinc-900"></div>

          {isFundComplete ? (
             <div className="flex flex-col items-center w-full z-10 transition-all animate-in fade-in py-12">
               <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-500 mb-6">
                 <Trophy className="w-16 h-16 sm:w-20 sm:h-20" />
               </div>
               <h3 className="text-2xl sm:text-3xl font-black text-emerald-900 tracking-tight uppercase mb-3 text-center">
                 Fund Completed ✨
               </h3>
               <p className="text-emerald-700 text-center max-w-sm px-4 text-sm font-medium">
                 All {participants.length} months have been successfully drawn. The Kuri is now fully complete! Thank you for participating.
               </p>
             </div>
          ) : winnerRevealed ? (
             <div className="animate-in zoom-in duration-500 flex flex-col items-center space-y-4 z-10 w-full px-4">
               <div className="p-6 bg-zinc-100 border border-zinc-200 rounded-full text-zinc-900 mb-2 relative">
                 <Sparkles className="absolute -top-2 -right-2 text-zinc-400 w-8 h-8 animate-spin-slow" />
                 <Trophy className="w-16 h-16 sm:w-20 sm:h-20" />
               </div>
               <h3 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
                 Winner Month {activeMonth}!
               </h3>
               <p className="text-xl sm:text-2xl font-bold text-zinc-700 truncate max-w-full">
                 {winnerRevealed.type === 'Individual' ? winnerRevealed.name : winnerRevealed.groupName}
               </p>
               <div className="mt-4 px-6 py-2 bg-white rounded-full font-bold tabular-nums text-sm border border-zinc-200 text-zinc-800 shadow-sm">
                 Won: ₹{prizeAmount.toLocaleString('en-IN')}
               </div>
               <p className="text-[10px] uppercase font-bold text-zinc-400 mt-4 animate-pulse tracking-widest">Advancing to next month...</p>
             </div>
          ) : previousWinner && !allCaughtUpToCurrentMonth ? (
             <div className="flex flex-col items-center w-full z-10 transition-all animate-in fade-in">
               <div className="p-5 bg-zinc-50 border border-zinc-200 rounded-full text-zinc-300 mb-6">
                 <Trophy className="w-12 h-12 sm:w-16 sm:h-16" />
               </div>
               <h3 className="text-lg font-bold text-zinc-500 mb-2 uppercase tracking-widest">
                 Month {activeMonth - 1} Winner
               </h3>
               <p className="text-2xl sm:text-3xl font-black text-zinc-900 mb-3 truncate max-w-full px-4">
                 {previousWinner.winnerName}
               </p>
               <div className="mb-8 px-4 py-1.5 bg-zinc-100/50 rounded-full font-bold tabular-nums text-xs border border-zinc-200 text-zinc-500 shadow-sm">
                 Won: ₹{previousWinner.amountWon.toLocaleString('en-IN')}
               </div>

               <div className="flex items-start gap-3 p-4 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-600 text-sm font-medium w-full max-w-xs transition-colors hover:bg-zinc-100">
                 <div className="p-1.5 bg-white rounded-md shadow-sm border border-zinc-200 shrink-0">
                   <AlertCircle className="w-4 h-4 text-zinc-400" />
                 </div>
                 <span className="leading-snug">
                   Waiting for all participants to pay for <strong>Month {activeMonth}</strong> to unlock the {eligibleParticipants.length === 1 ? 'final prize' : 'next draw'}.
                 </span>
               </div>
             </div>
          ) : (
             <div className="flex flex-col items-center w-full z-10 transition-all">
               <Gift className="w-20 h-20 sm:w-24 sm:h-24 text-zinc-200 mb-6" />
               <h3 className="text-2xl font-bold mb-2 text-zinc-900">
                 {eligibleParticipants.length === 1 ? `Final Month (${activeMonth})` : `Month ${activeMonth} Draw`}
               </h3>
               <p className="text-sm text-zinc-500 mb-8 max-w-sm px-4">
                 {eligibleParticipants.length === 1 
                    ? `Only 1 participant remains. No random draw is required.` 
                    : `${eligibleParticipants.length} out of ${participants.length} participants are eligible for this month's draw.`}
               </p>

               <button
                 onClick={handleDraw}
                 disabled={isDrawing || eligibleParticipants.length === 0 || !allCaughtUpToCurrentMonth}
                 className={`w-full max-w-xs py-4 px-8 rounded-full text-sm sm:text-base font-bold transition-all duration-300 flex items-center justify-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 ${
                   isDrawing ? 'bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed scale-95' 
                   : (eligibleParticipants.length === 0 || !allCaughtUpToCurrentMonth) ? 'bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed'
                   : 'bg-zinc-900 text-white hover:bg-zinc-800 hover:-translate-y-1 hover:shadow-lg'
                 }`}
               >
                 {isDrawing 
                    ? (eligibleParticipants.length === 1 ? 'Finalizing...' : 'Selecting...') 
                    : (eligibleParticipants.length === 1 ? 'Award Final Prize' : 'Conduct Draw')}
               </button>

               {!allCaughtUpToCurrentMonth && !isDrawing && !winnerRevealed && (
                 <div className="mt-4 flex flex-col items-center gap-2 p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-sm font-medium w-full max-w-xs animate-in slide-in-from-bottom-2 fade-in">
                   <AlertCircle className="w-5 h-5 shrink-0" />
                   <span className="text-center">All participants must be fully paid up to Month {activeMonth} first!</span>
                 </div>
               )}
             </div>
          )}

          {/* Lottery Blinking Ring effect */}
          {isDrawing && !winnerRevealed && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/95 backdrop-blur-md z-20 select-none">
              <div className="flex flex-col items-center justify-center w-full px-6 animate-in zoom-in-95 duration-200">
                 <div className="w-16 h-16 rounded-full border-4 border-zinc-100 border-t-zinc-900 animate-spin mb-8 shadow-sm"></div>
                 <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest block mb-4 animate-pulse">
                   Selecting Winner...
                 </span>
                 
                 <div className="h-24 flex items-center justify-center">
                   <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-zinc-900 tracking-tight text-center max-w-full truncate">
                     {(() => {
                        const blinkingParticipant = eligibleParticipants.find(p => p.id === currentBlink);
                        if (!blinkingParticipant) return '???';
                        return blinkingParticipant.type === 'Individual' ? blinkingParticipant.name : blinkingParticipant.groupName;
                     })()}
                   </h2>
                 </div>
              </div>
            </div>
          )}
        </div>

        {/* History Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden flex flex-col h-full max-h-[600px] mt-8 xl:mt-0">
           <div className="p-4 sm:p-6 md:px-8 border-b border-zinc-100 flex flex-col sm:flex-row justify-between sm:items-center bg-zinc-50 shrink-0 gap-4">
             <h3 className="text-lg font-semibold flex items-center gap-2 text-zinc-900">
               <Calendar className="w-5 h-5 text-zinc-400" /> Winner History
             </h3>
             <span className="text-xs font-bold text-zinc-600 bg-white px-3 py-1.5 rounded-full border border-zinc-200 tabular-nums self-start sm:self-auto">
               {drawHistory.length} Winners
             </span>
          </div>

          <div className="overflow-y-auto w-full flex-1 p-4 sm:p-6 space-y-4">
            {drawHistory.length > 0 ? (
               drawHistory.map((history) => (
                 <div key={history.id} className="p-4 border border-zinc-200 rounded-xl bg-zinc-50 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-white hover:border-zinc-300 transition-colors shadow-sm gap-4">
                   <div className="flex items-center gap-4">
                     <div className="hidden sm:block p-2 bg-zinc-200 text-zinc-700 rounded-lg">
                       <Trophy className="w-5 h-5" />
                     </div>
                     <div>
                       <p className="text-[10px] text-zinc-500 font-bold mb-0.5 uppercase tracking-wider">Month {history.monthIndex}</p>
                       <p className="font-bold text-zinc-900 text-sm sm:text-base">{history.winnerName}</p>
                     </div>
                   </div>
                   <div className="sm:text-right">
                     <p className="text-[10px] text-zinc-500 font-bold mb-0.5 uppercase tracking-wider">{history.date}</p>
                     <p className="font-black tabular-nums text-zinc-900 text-sm sm:text-base">₹{history.amountWon.toLocaleString('en-IN')}</p>
                   </div>
                 </div>
               )).reverse()
            ) : (
               <div className="h-full flex flex-col items-center justify-center text-zinc-400 space-y-4 py-12">
                 <Trophy className="w-12 h-12 opacity-30" />
                 <p className="font-medium text-sm">No draws have been conducted yet.</p>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrawTab;
