import { useState } from 'react';
import { useKuri } from '../../context/KuriContext';
import { Settings, Wallet, CalendarDays, Coins, AlertCircle } from 'lucide-react';

const SetupTab = () => {
  const { fundDetails, setFundDetails, participants, setShareSize, shareSize } = useKuri();
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
    
    setSuccessMsg('Fund details updated successfully!');
    setTimeout(() => {
       setSuccessMsg('');
       setView('dashboard');
    }, 1500);
  };

  const hasFund = fundDetails && shareSize > 0;

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-center gap-6 mb-12">
        <div className="w-16 h-16 flex items-center justify-center bg-accent-primary text-structural-black border-[4px] border-structural-black shadow-[4px_4px_0_0_#000000]">
          <Settings className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-structural-black uppercase italic leading-none">Setup / Config</h2>
          <p className="text-sm font-bold text-structural-black mt-2 bg-accent-pink px-2 py-0.5 inline-block border-[2px] border-structural-black shadow-[2px_2px_0_0_#000000]">Configure the active Kuri chit fund details.</p>
        </div>
      </div>

      <div className="max-w-4xl">
        {view === 'dashboard' ? (
          <>
            {!hasFund ? (
              <div className="flex flex-col items-center justify-center py-24 bg-white border-[4px] border-structural-black shadow-[10px_10px_0_0_#000000] px-8 text-center">
                <Settings className="w-20 h-20 text-structural-black mb-8" />
                <h3 className="text-3xl font-black text-structural-black mb-4 uppercase">No Active Fund</h3>
                <p className="text-structural-black font-medium mb-10 max-w-sm">There is currently no Kuri fund configured. Create one to start managing participants.</p>
                <button 
                  onClick={() => {
                     setFormData({
                       name: '',
                       monthlyAmount: 0,
                       startDate: new Date().toISOString().split('T')[0]
                     });
                     setView('create');
                  }} 
                  className="brutal-btn text-xl"
                >
                   + Initialize New Fund
                </button>
              </div>
            ) : (
              <div className="space-y-10">
                <div className="flex flex-col sm:flex-row justify-end sm:items-center gap-4 lg:gap-6">
                   <div className="grid grid-cols-2 sm:flex items-center gap-4 w-full sm:w-auto">
                     <button 
                       onClick={() => setShowCreateModal(true)} 
                       className="brutal-btn brutal-btn-pink text-[10px] sm:text-sm py-3 sm:py-2"
                     >
                       + NEW FUND
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
                       className="brutal-btn brutal-btn-blue text-[10px] sm:text-sm py-3 sm:py-2"
                     >
                       EDIT DETAILS
                     </button>
                   </div>
                </div>

                {/* Summary Card */}
                <div className="bg-white p-6 md:p-8 lg:p-12 border-4 border-structural-black shadow-[6px_6px_0_0_#000000] lg:shadow-[12px_12px_0_0_#000000] rounded-none">
                  <div className="space-y-8 lg:space-y-10 text-structural-black">
                    <div className="bg-bg-canvas border-2 lg:border-[3px] border-structural-black p-6 lg:p-10 shadow-[4px_4px_0_0_#000000] lg:shadow-[6px_6px_0_0_#000000] text-center rounded-none">
                      <h2 className="text-3xl sm:text-5xl lg:text-7xl font-black text-structural-black tracking-tighter uppercase italic mb-6 lg:mb-8 leading-none">
                        {fundDetails.name}
                      </h2>
                      <div className="w-full h-1 lg:h-[3px] bg-structural-black mb-6 lg:mb-8 max-w-md mx-auto"></div>
                      <p className="text-[10px] lg:text-xs font-black uppercase tracking-widest mb-4">Gross Fund Capacity</p>
                      <div className="text-4xl sm:text-6xl lg:text-8xl font-black tabular-nums tracking-tighter text-structural-black leading-none bg-accent-primary p-3 lg:p-4 border-2 lg:border-[3px] border-structural-black inline-block shadow-[4px_4px_0_0_#000000] lg:shadow-[6px_6px_0_0_#000000] rounded-none">
                        ₹{(shareSize * (participants.length > 0 ? participants.length : 1) * (participants.length > 0 ? participants.length : 1)).toLocaleString('en-IN')}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                      <div className="p-6 lg:p-8 bg-white border-2 lg:border-[3px] border-structural-black shadow-[4px_4px_0_0_#000000] lg:shadow-[6px_6px_0_0_#000000] flex flex-col items-center text-center gap-4 rounded-none">
                        <div className="bg-accent-pink p-3 lg:p-4 text-white border-2 border-structural-black shadow-[2px_2px_0_0_#000000] lg:shadow-[3px_3px_0_0_#000000] rounded-none">
                          <Coins className="w-6 h-6 lg:w-8 lg:h-8" />
                        </div>
                        <div>
                          <p className="text-[10px] lg:text-xs text-structural-black font-black uppercase tracking-widest mb-1 lg:mb-2">Monthly Fee</p>
                          <p className="font-black tabular-nums text-2xl lg:text-3xl italic leading-none">
                            ₹{shareSize.toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>

                      <div className="p-6 lg:p-8 bg-white border-2 lg:border-[3px] border-structural-black shadow-[4px_4px_0_0_#000000] lg:shadow-[6px_6px_0_0_#000000] flex flex-col items-center text-center gap-4 rounded-none">
                        <div className="bg-accent-blue p-3 lg:p-4 text-white border-2 border-structural-black shadow-[2px_2px_0_0_#000000] lg:shadow-[3px_3px_0_0_#000000] rounded-none">
                          <CalendarDays className="w-6 h-6 lg:w-8 lg:h-8" />
                        </div>
                        <div>
                          <p className="text-[10px] lg:text-xs text-structural-black font-black uppercase tracking-widest mb-1 lg:mb-2">Term Duration</p>
                          <p className="font-black text-2xl lg:text-3xl italic leading-none">{participants.length > 0 ? participants.length : 1} MONTHS</p>
                        </div>
                      </div>

                      <div className="p-6 lg:p-8 bg-white border-2 lg:border-[3px] border-structural-black shadow-[4px_4px_0_0_#000000] lg:shadow-[6px_6px_0_0_#000000] flex flex-col items-center text-center gap-4 sm:col-span-2 lg:col-span-1 rounded-none">
                        <div className="bg-accent-primary p-3 lg:p-4 text-structural-black border-2 border-structural-black shadow-[2px_2px_0_0_#000000] lg:shadow-[3px_3px_0_0_#000000] rounded-none">
                          <Wallet className="w-6 h-6 lg:w-8 lg:h-8" />
                        </div>
                        <div>
                          <p className="text-[10px] lg:text-xs text-structural-black font-black uppercase tracking-widest mb-1 lg:mb-2">Launch Date</p>
                          <p className="font-black text-xl lg:text-2xl italic leading-none">{new Date(fundDetails.startDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }).toUpperCase()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white p-8 md:p-12 border-[4px] border-structural-black shadow-[12px_12px_0_0_#000000]">
            <div className="flex justify-between items-start mb-12">
               <h3 className="text-4xl font-black text-structural-black uppercase italic tracking-tighter border-b-[6px] border-accent-primary pb-2">
                 {view === 'create' ? 'Init New Fund' : 'Edit Fund Info'}
               </h3>
               {hasFund && (
                 <button 
                   onClick={() => setView('dashboard')}
                   className="brutal-btn brutal-btn-pink text-xs px-4 py-2"
                 >
                   CANCEL
                 </button>
               )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">
              <div>
                <label className="block text-sm font-black text-structural-black uppercase tracking-widest mb-3">Fund Identity (Name)</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="E.G. UNDERGROUND CHIT 2026"
                  className="brutal-input text-xl font-bold uppercase"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-black text-structural-black uppercase tracking-widest mb-3">
                    Monthly Stake (₹) {view === 'edit' && <span className="text-accent-pink">[LOCKED]</span>}
                  </label>
                  <input
                    type="number"
                    name="monthlyAmount"
                    required
                    min="0"
                    disabled={view === 'edit'}
                    value={formData.monthlyAmount || ''}
                    onChange={handleChange}
                    className={`brutal-input text-xl font-bold tabular-nums ${view === 'edit' ? 'bg-bg-canvas cursor-not-allowed opacity-70' : ''}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-black text-structural-black uppercase tracking-widest mb-3">Deployment Date</label>
                  <input
                    type="date"
                    name="startDate"
                    required
                    value={formData.startDate}
                    onChange={handleChange}
                    className="brutal-input text-xl font-bold"
                  />
                </div>
              </div>

              {hasParticipants && view === 'create' && (
                <div className="bg-accent-pink text-white p-6 border-[3px] border-structural-black shadow-[6px_6px_0_0_#000000] flex gap-4 items-center">
                  <AlertCircle className="w-10 h-10 shrink-0" />
                  <p className="font-black uppercase tracking-tighter text-sm italic">
                    Caution: New fund initialization will reset current logic. Members persist.
                  </p>
                </div>
              )}

              <button
                type="submit"
                className="brutal-btn w-full text-2xl py-6"
              >
                {view === 'create' ? 'START NEW OPERATION' : 'SYNC UPDATES'}
              </button>
              {successMsg && <p className="bg-accent-primary p-4 border-[2px] border-structural-black text-structural-black text-center font-black uppercase tracking-widest mt-8 shadow-[4px_4px_0_0_#000000]">{successMsg}</p>}
            </form>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-[4px] border-structural-black w-full max-w-md shadow-[15px_15px_0_0_#FF3366]">
            <div className="p-8">
              <h3 className="text-3xl font-black text-structural-black uppercase italic mb-4 tracking-tighter">Reset Operation?</h3>
              <p className="text-structural-black font-medium mb-8 uppercase tracking-tight text-sm">
                Initiating a new fund will overwrite active parameters. Existing members will remain in the database.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 brutal-btn brutal-btn-blue text-sm"
                >
                  ABORT
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
                  CONFIRM
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
