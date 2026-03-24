import { useRef, useEffect } from 'react';
import { useKuri } from '../../context/KuriContext';
import { FileText, CheckCircle2, XCircle, TrendingUp, Lock } from 'lucide-react';

const LedgerTab = () => {
  const { participants, updateParticipantStatus, shareSize, activeMonth, fundDetails } = useKuri();
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
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-8">
        <div className="w-12 h-12 flex items-center justify-center bg-zinc-100 text-zinc-900 rounded-xl border border-zinc-200 mb-2 sm:mb-0">
          <FileText className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Monthly Ledger</h2>
          <p className="text-sm text-zinc-500 mt-1">Track current month payments and collections.</p>
        </div>
      </div>

      <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl shadow-sm border border-zinc-200">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8">
          <div>
            <h3 className="text-xl font-semibold mb-1 text-zinc-900">Month {activeMonth}</h3>
            {fundDetails && (
              <p className="text-sm text-zinc-500 font-bold tracking-wider uppercase">
                {new Date(new Date(fundDetails.startDate).setMonth(new Date(fundDetails.startDate).getMonth() + activeMonth - 1)).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
              </p>
            )}
          </div>

          {/* Progress Summary */}
          <div className="w-full xl:max-w-xl bg-zinc-50 p-4 sm:p-5 rounded-xl border border-zinc-200 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <div className="p-3 bg-zinc-900 text-white rounded-lg shadow-sm hidden sm:block">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="flex-1 w-full">
              <div className="flex justify-between text-xs sm:text-sm font-semibold mb-2">
                <span className="text-zinc-700">Collected: ₹{totalCollected.toLocaleString('en-IN')}</span>
                <span className="text-zinc-500">Target: ₹{totalExpected.toLocaleString('en-IN')}</span>
              </div>
              <div className="h-2.5 w-full bg-zinc-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    progressPercentage === 100 ? 'bg-zinc-900' : 'bg-zinc-500'
                  }`}
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
            <div className="w-full flex justify-between sm:w-auto sm:text-right mt-1 sm:mt-0">
              <span className="sm:hidden text-sm font-semibold text-zinc-500">Progress</span>
              <span className={`text-2xl font-black tabular-nums ${progressPercentage === 100 ? 'text-zinc-900' : 'text-zinc-500'}`}>
                {progressPercentage}%
              </span>
            </div>
          </div>
        </div>

        {/* Ledger Table */}
        <div ref={tableContainerRef} className="overflow-x-auto w-full border border-zinc-200 rounded-xl relative scroll-smooth">
          <table className="w-full text-left border-collapse min-w-max">
            <thead>
              <tr className="bg-white border-b border-zinc-200 text-xs uppercase text-zinc-500 tracking-wider">
                <th className="px-4 md:px-6 py-4 font-semibold sticky left-0 z-10 bg-white border-r border-zinc-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] min-w-[220px] sm:min-w-[280px]">
                  <div className="flex items-center justify-between gap-4">
                    <span>Participant</span>
                    <span>Due/Mo</span>
                  </div>
                </th>
                {Array.from({ length: participants.length || 1 }, (_, i) => {
                  const d = fundDetails ? new Date(fundDetails.startDate) : new Date();
                  d.setMonth(d.getMonth() + i);
                  const monthLabel = d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
                  
                  return (
                    <th id={`month-col-${i + 1}`} key={i} className={`px-4 py-4 font-semibold text-center whitespace-nowrap ${i + 1 === activeMonth ? 'bg-zinc-100 text-zinc-900' : ''}`}>
                      {monthLabel}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-sm">
              {participants.length > 0 ? (
                participants.map((p) => {
                  const isIndi = p.type === 'Individual';
                  const amount = isIndi ? p.monthlyAmountDue : p.combinedMonthlyAmountDue;
                  return (
                    <tr key={p.id} className="hover:bg-zinc-50/50 transition-colors group">
                      <td className="px-4 md:px-6 py-4 sticky left-0 z-10 bg-white group-hover:bg-zinc-50 border-r border-zinc-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] min-w-[220px] sm:min-w-[280px]">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-zinc-900 pb-1 truncate max-w-[120px] sm:max-w-[170px]">
                              {isIndi ? p.name : p.groupName}
                            </div>
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] uppercase font-bold tracking-widest border ${
                              isIndi ? 'bg-zinc-50 text-zinc-500 border-zinc-200' : 'bg-zinc-100 text-zinc-700 border-zinc-300'
                            }`}>
                              {p.type}
                            </span>
                          </div>
                          <div className="font-semibold tabular-nums text-zinc-800 whitespace-nowrap shrink-0">
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
                          <td key={m} className={`px-2 py-4 text-center min-w-[110px] ${isActive ? 'bg-zinc-50/50' : ''} ${isLocked ? 'opacity-80' : ''}`}>
                            <button
                              disabled={isLocked}
                              onClick={() => !isLocked && updateParticipantStatus(p.id, m, isPaid ? 'Unpaid' : 'Paid')}
                              className={`inline-flex items-center justify-center w-full gap-1.5 px-2 py-2 rounded-md text-[10px] uppercase tracking-widest font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 border shadow-sm ${
                                isPaid 
                                  ? 'bg-zinc-900 text-white border-zinc-900 hover:bg-zinc-800' 
                                  : 'bg-white text-zinc-400 border-zinc-200 hover:bg-zinc-50 hover:text-zinc-600'
                              } ${isLocked ? 'cursor-not-allowed hover:bg-zinc-900 contrast-75' : ''}`}
                            >
                              {isLocked && <Lock className="w-2.5 h-2.5 mr-0.5" />}
                              {isPaid ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                              {isPaid ? 'Paid' : 'Unpaid'}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                    No participants added yet.
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
