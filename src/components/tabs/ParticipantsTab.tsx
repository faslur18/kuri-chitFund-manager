import { useState } from 'react';
import { useKuri } from '../../context/KuriContext';
import type { IndividualParticipant, GroupParticipant } from '../../types';
import { Users, UserPlus, Trash2, AlertCircle } from 'lucide-react';

const ParticipantsTab: React.FC = () => {
  const { participants, addParticipant, deleteParticipant, shareSize, fundDetails } = useKuri();
  
  const [participantToDelete, setParticipantToDelete] = useState<string | null>(null);
  
  const [participantType, setParticipantType] = useState<'Individual' | 'Group'>('Individual');
  const [indiName, setIndiName] = useState('');
  
  const [groupName, setGroupName] = useState('');
  const [groupMembersText, setGroupMembersText] = useState('');

  const [formError, setFormError] = useState('');

  const handleAddParticipant = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!fundDetails || shareSize === 0) {
      setFormError('Please configure the Fund Details in Setup first!');
      return;
    }

    if (participantType === 'Individual') {
      if (!indiName.trim()) {
        setFormError('Name is required.');
        return;
      }
      
      const duration = participants.length + 1;
      const history = Array.from({ length: duration }, (_, i) => ({
        monthIndex: i + 1,
        status: 'Unpaid' as const
      }));

      const newParticipant: IndividualParticipant = {
        id: `ind-${Date.now()}`,
        type: 'Individual',
        name: indiName.trim(),
        shareFraction: 1.0,
        monthlyAmountDue: shareSize,
        paymentHistory: history,
        hasWon: false,
      };
      
      addParticipant(newParticipant);
      setIndiName('');
      
    } else {
      if (!groupName.trim()) {
        setFormError('Group Name is required.');
        return;
      }
      const members = groupMembersText.split(',').map(m => m.trim()).filter(Boolean);
      if (members.length < 2) {
        setFormError('A group must have at least 2 members. Separate names with commas.');
        return;
      }

      const fraction = Number((1 / members.length).toFixed(4));
      
      const duration = participants.length + 1;
      const history = Array.from({ length: duration }, (_, i) => ({
        monthIndex: i + 1,
        status: 'Unpaid' as const
      }));

      const newParticipant: GroupParticipant = {
        id: `grp-${Date.now()}`,
        type: 'Group',
        groupName: groupName.trim(),
        members,
        shareFractionPerMember: fraction,
        combinedMonthlyAmountDue: shareSize,
        paymentHistory: history,
        hasWon: false,
      };

      addParticipant(newParticipant);
      setGroupName('');
      setGroupMembersText('');
    }
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-8">
        <div className="w-12 h-12 flex items-center justify-center bg-zinc-100 text-zinc-900 rounded-xl border border-zinc-200 mb-2 sm:mb-0">
          <Users className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Participant Management</h2>
          <p className="text-sm text-zinc-500 mt-1">Add individuals or groups holding a share in the fund.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* ADD PARTICIPANT FORM */}
        <div className="xl:col-span-1 bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-zinc-200 self-start">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-zinc-900">
            <UserPlus className="w-5 h-5 text-zinc-400" /> Register New
          </h3>

          <div className="flex bg-zinc-100 p-1.5 rounded-xl mb-6 border border-zinc-200">
            <button
              onClick={() => { setParticipantType('Individual'); setFormError(''); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 ${
                participantType === 'Individual' ? 'bg-white shadow-sm border border-zinc-200 text-zinc-900' : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              Individual
            </button>
            <button
              onClick={() => { setParticipantType('Group'); setFormError(''); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 ${
                participantType === 'Group' ? 'bg-white shadow-sm border border-zinc-200 text-zinc-900' : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              Group Share
            </button>
          </div>

          {formError && (
             <div className="bg-rose-50 text-rose-600 text-sm p-3 rounded-lg mb-4 flex items-start gap-2 border border-rose-100">
               <AlertCircle className="w-5 h-5 shrink-0" /> {formError}
             </div>
          )}

          <form onSubmit={handleAddParticipant} className="space-y-5">
            {participantType === 'Individual' ? (
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={indiName}
                  onChange={(e) => setIndiName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-all text-zinc-900"
                />
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">Group Name</label>
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="e.g. Office Colleagues"
                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-all text-zinc-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">Members (comma separated)</label>
                  <textarea
                    value={groupMembersText}
                    onChange={(e) => setGroupMembersText(e.target.value)}
                    placeholder="Alice, Bob, Charlie..."
                    rows={3}
                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-all resize-none text-zinc-900"
                  />
                  {groupMembersText.split(',').filter(Boolean).length > 0 && (
                     <p className="text-xs text-zinc-500 mt-2">
                       {groupMembersText.split(',').filter(Boolean).length} members detected. Each will pay ₹{Math.round(shareSize / groupMembersText.split(',').filter(Boolean).length)}.
                     </p>
                  )}
                </div>
              </>
            )}

            <button
              type="submit"
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-medium py-3 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2"
            >
              Add Participant
            </button>
          </form>
        </div>

        {/* PARTICIPANTS LIST */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
          <div className="p-4 sm:p-6 md:px-8 border-b border-zinc-100 flex flex-col sm:flex-row sm:justify-between sm:items-center bg-zinc-50 gap-4">
             <h3 className="text-lg font-semibold text-zinc-900">Registered ({participants.length})</h3>
             <span className="text-xs font-bold text-zinc-600 bg-white px-3 py-1.5 rounded-full shadow-sm border border-zinc-200 tabular-nums self-start sm:self-auto">
               Total Expected: ₹{(participants.length * shareSize).toLocaleString('en-IN')}
             </span>
          </div>
          
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="bg-white border-b border-zinc-200 text-xs uppercase text-zinc-500 tracking-wider">
                  <th className="px-6 py-4 font-semibold">Name / Group</th>
                  <th className="px-6 py-4 font-semibold">Type</th>
                  <th className="px-6 py-4 font-semibold">Monthly Due</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-sm">
                {participants.length > 0 ? (
                  participants.map((p) => (
                    <tr key={p.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-zinc-800">
                          {p.type === 'Individual' ? p.name : p.groupName}
                        </div>
                        {p.type === 'Group' && (
                          <div className="text-xs text-zinc-500 mt-1 max-w-[200px] truncate" title={p.members.join(', ')}>
                            {p.members.length} Members ({p.members.join(', ')})
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${
                          p.type === 'Individual' ? 'bg-zinc-100 text-zinc-700' : 'bg-zinc-100 text-zinc-700'
                        }`}>
                          {p.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold tabular-nums text-zinc-800">
                          ₹{(p.type === 'Individual' ? p.monthlyAmountDue : p.combinedMonthlyAmountDue).toLocaleString('en-IN')}
                        </span>
                        {p.type === 'Group' && (
                          <span className="text-xs text-zinc-500 ml-2 tabular-nums">
                           (₹{Math.round(p.combinedMonthlyAmountDue / p.members.length).toLocaleString('en-IN')}/each)
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {/* Actions placeholders */}
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => setParticipantToDelete(p.id)}
                            className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
                            title="Remove Participant"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
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

      {/* Delete Confirmation Modal */}
      {participantToDelete && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-rose-600 mb-4">
              <div className="p-2 bg-rose-100 rounded-full">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold">Remove Participant</h3>
            </div>
            <p className="text-slate-600 mb-6">
              Are you sure you want to remove this participant? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setParticipantToDelete(null)}
                className="px-4 py-2 text-zinc-600 font-medium hover:bg-zinc-100 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await deleteParticipant(participantToDelete);
                  setParticipantToDelete(null);
                }}
                className="px-4 py-2 bg-rose-600 text-white font-medium hover:bg-rose-700 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-900 focus-visible:ring-offset-2"
              >
                Confirm Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParticipantsTab;
