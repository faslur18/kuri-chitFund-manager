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
    <div className="space-y-6 fade-in">
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-8">
        <div className="w-12 h-12 flex items-center justify-center bg-zinc-100 text-zinc-900 rounded-xl mb-4 md:mb-0 border border-zinc-200">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Setup / Configuration</h2>
          <p className="text-sm text-zinc-500 mt-1">Configure or update the active Kuri chit fund details.</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        {view === 'dashboard' ? (
          <>
            {!hasFund ? (
              <div className="flex flex-col items-center justify-center py-20 md:py-32 bg-white border border-zinc-200 rounded-2xl shadow-sm px-6">
                <Settings className="w-16 h-16 text-zinc-300 mb-6" />
                <h3 className="text-2xl font-bold text-zinc-900 mb-2">No Active Fund</h3>
                <p className="text-zinc-500 mb-8 max-w-sm text-center">There is currently no Kuri fund configured. Create one to start managing participants.</p>
                <button 
                  onClick={() => {
                     setFormData({
                       name: '',
                       monthlyAmount: 0,
                       startDate: new Date().toISOString().split('T')[0]
                     });
                     setView('create');
                  }} 
                  className="px-8 py-4 bg-zinc-900 text-white font-bold rounded-xl shadow-lg hover:bg-zinc-800 transition-all hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2"
                >
                   + Add New Fund
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-end sm:items-center gap-4 mb-3">
                   <div className="flex items-center gap-3">
                     <button 
                       onClick={() => setShowCreateModal(true)} 
                       className="px-5 py-2.5 bg-zinc-100 border border-zinc-200 text-zinc-900 font-bold rounded-lg hover:bg-zinc-200 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 text-sm"
                     >
                       + Create New Fund
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
                       className="px-5 py-2.5 bg-zinc-900 text-white font-bold rounded-lg hover:bg-zinc-800 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 text-sm"
                     >
                       Edit Details
                     </button>
                   </div>
                </div>

                {/* Summary Card */}
                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-zinc-200 flex flex-col justify-center">
                  <div className="space-y-6 text-zinc-900">
                    <div className="bg-zinc-50 border border-zinc-200 p-8 rounded-xl text-center">
                      <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-zinc-900 tracking-tight lowercase mb-6 truncate px-4">
                        {fundDetails.name}
                      </h2>
                      <div className="w-full h-px bg-zinc-200 mb-6 max-w-sm mx-auto"></div>
                      <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-2">Gross Total of Fund</p>
                      <div className="text-4xl sm:text-5xl lg:text-6xl font-black tabular-nums tracking-tight text-zinc-800">
                        ₹{(shareSize * (participants.length > 0 ? participants.length : 1) * (participants.length > 0 ? participants.length : 1)).toLocaleString('en-IN')}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="p-5 bg-zinc-50 rounded-xl border border-zinc-200 flex flex-col items-center text-center gap-3">
                        <div className="bg-white p-3 text-zinc-600 rounded-lg shadow-sm border border-zinc-200">
                          <Coins className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Monthly Amount</p>
                          <p className="font-bold tabular-nums text-lg">
                            ₹{shareSize.toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>

                      <div className="p-5 bg-zinc-50 rounded-xl border border-zinc-200 flex flex-col items-center text-center gap-3">
                        <div className="bg-white p-3 text-zinc-600 rounded-lg shadow-sm border border-zinc-200">
                          <CalendarDays className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Duration</p>
                          <p className="font-bold text-lg">{participants.length > 0 ? participants.length : 1} Months</p>
                        </div>
                      </div>

                      <div className="p-5 bg-zinc-50 rounded-xl border border-zinc-200 flex flex-col items-center text-center gap-3 sm:col-span-2 lg:col-span-1">
                        <div className="bg-white p-3 text-zinc-600 rounded-lg shadow-sm border border-zinc-200">
                          <Wallet className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Start Date</p>
                          <p className="font-bold text-lg">{new Date(fundDetails.startDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-zinc-200">
            <div className="flex justify-between items-center mb-8">
               <h3 className="text-xl font-bold text-zinc-900">
                 {view === 'create' ? 'Create New Fund' : 'Edit Fund Details'}
               </h3>
               {hasFund && (
                 <button 
                   onClick={() => setView('dashboard')}
                   className="text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors"
                 >
                   Cancel
                 </button>
               )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Fund Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Friends Co-op 2026"
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 transition-all outline-none text-zinc-900 font-medium"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                    Monthly Amount (₹) {view === 'edit' && <span className="text-zinc-400 font-normal">(Locked)</span>}
                  </label>
                  <input
                    type="number"
                    name="monthlyAmount"
                    required
                    min="0"
                    disabled={view === 'edit'}
                    value={formData.monthlyAmount || ''}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 transition-all outline-none tabular-nums font-medium text-zinc-900 ${view === 'edit' ? 'opacity-50 cursor-not-allowed bg-zinc-100' : ''}`}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  required
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 transition-all outline-none font-medium text-zinc-900"
                />
              </div>

              {hasParticipants && view === 'create' && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 flex gap-3 rounded-xl text-sm mb-4">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p><strong>Warning:</strong> Creating a new fund will overwrite the existing fund logic, but current participants will be retained. Please review your setup.</p>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-4 rounded-xl shadow-md transition-all flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2"
              >
                {view === 'create' ? 'Save & Create Fund' : 'Update Fund Details'}
              </button>
              {successMsg && <p className="text-emerald-600 text-sm xl:text-base text-center font-bold mt-4">{successMsg}</p>}
            </form>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border border-zinc-200">
            <div className="p-6">
              <h3 className="text-xl font-bold text-zinc-900 mb-2">Create New Fund?</h3>
              <p className="text-zinc-500 text-sm mb-6">
                Are you sure you want to create a completely new fund? The current active fund details will be overwritten, but participants will remain.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2.5 bg-zinc-100 text-zinc-700 font-bold rounded-lg hover:bg-zinc-200 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
                >
                  Cancel
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
                  className="flex-1 px-4 py-2.5 bg-zinc-900 text-white font-bold rounded-lg hover:bg-zinc-800 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2"
                >
                  Confirm
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
