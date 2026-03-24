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
    <div className="space-y-12">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:gap-6 mb-8 lg:mb-12">
        <div className="w-12 h-12 lg:w-16 lg:h-16 flex items-center justify-center bg-accent-blue text-white border-2 lg:border-4 border-structural-black shadow-[4px_4px_0_0_#000000] rounded-none">
          <Users className="w-6 h-6 lg:w-8 lg:h-8" />
        </div>
        <div>
          <h2 className="text-3xl lg:text-4xl font-black tracking-tighter text-structural-black uppercase italic leading-none">Member Roster</h2>
          <p className="text-[10px] lg:text-sm font-bold text-structural-black mt-2 bg-accent-primary px-2 py-0.5 inline-block border-2 border-structural-black shadow-[2px_2px_0_0_#000000] rounded-none">Add individuals or groups holding a share in the fund.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 lg:gap-12">
        
        {/* ADD PARTICIPANT FORM */}
        <div className="xl:col-span-1 bg-white p-6 lg:p-8 border-4 border-structural-black shadow-[6px_6px_0_0_#000000] lg:shadow-[10px_10px_0_0_#000000] self-start rounded-none">
          <h3 className="text-xl lg:text-2xl font-black mb-6 lg:mb-8 flex items-center gap-3 text-structural-black uppercase italic tracking-tight">
            <UserPlus className="w-5 h-5 lg:w-6 lg:h-6 text-accent-pink" /> Register New
          </h3>

          <div className="flex bg-bg-canvas p-2 border-2 border-structural-black mb-8 shadow-[4px_4px_0_0_#000000] rounded-none">
            <button
              onClick={() => { setParticipantType('Individual'); setFormError(''); }}
              className={`flex-1 py-3 text-sm font-black uppercase tracking-widest transition-all focus-visible:outline-none rounded-none ${
                participantType === 'Individual' ? 'bg-accent-primary text-structural-black border-2 border-structural-black shadow-[2px_2px_0_0_#000000]' : 'text-structural-black/50 hover:text-structural-black'
              }`}
            >
              Individual
            </button>
            <button
              onClick={() => { setParticipantType('Group'); setFormError(''); }}
              className={`flex-1 py-3 text-sm font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 focus-visible:outline-none rounded-none ${
                participantType === 'Group' ? 'bg-accent-primary text-structural-black border-2 border-structural-black shadow-[2px_2px_0_0_#000000]' : 'text-structural-black/50 hover:text-structural-black'
              }`}
            >
              Group
            </button>
          </div>

          {formError && (
             <div className="bg-accent-pink text-white text-sm font-black uppercase p-4 border-2 border-structural-black mb-6 flex items-start gap-3 shadow-[4px_4px_0_0_#000000] rounded-none">
               <AlertCircle className="w-6 h-6 shrink-0" /> {formError}
             </div>
          )}

          <form onSubmit={handleAddParticipant} className="space-y-8">
            {participantType === 'Individual' ? (
              <div>
                <label className="block text-xs font-black text-structural-black uppercase tracking-widest mb-3">Identity Name</label>
                <input
                  type="text"
                  value={indiName}
                  onChange={(e) => setIndiName(e.target.value)}
                  placeholder="E.G. JOHN DOE"
                  className="brutal-input text-lg font-bold rounded-none"
                />
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-black text-structural-black uppercase tracking-widest mb-3">Group Identity</label>
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="E.G. OFFICE COLLEAGUES"
                    className="brutal-input text-lg font-bold uppercase rounded-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-structural-black uppercase tracking-widest mb-3">Members (Comma Split)</label>
                  <textarea
                    value={groupMembersText}
                    onChange={(e) => setGroupMembersText(e.target.value)}
                    placeholder="ALICE, BOB, CHARLIE..."
                    rows={3}
                    className="brutal-input text-lg font-bold uppercase resize-none h-32 rounded-none"
                  />
                  {groupMembersText.split(',').filter(Boolean).length > 0 && (
                     <p className="text-[10px] text-structural-black font-black uppercase tracking-widest mt-4 bg-accent-blue text-white px-2 py-1 inline-block border-2 border-structural-black shadow-[2px_2px_0_0_#000000] rounded-none">
                       {groupMembersText.split(',').filter(Boolean).length} MEMBERS DETECTED.
                     </p>
                  )}
                </div>
              </>
            )}

            <button
              type="submit"
              className="brutal-btn w-full text-xl py-4 rounded-none"
            >
              DEPLOY MEMBER
            </button>
          </form>
        </div>

        {/* PARTICIPANTS LIST */}
        <div className="xl:col-span-2 bg-white border-4 border-structural-black shadow-[8px_8px_0_0_#000000] lg:shadow-[12px_12px_0_0_#000000] rounded-none">
          <div className="p-4 lg:p-6 lg:px-10 border-b-4 border-structural-black flex flex-col sm:flex-row sm:justify-between sm:items-center bg-bg-canvas gap-4 lg:gap-6 rounded-none">
             <h3 className="text-2xl lg:text-3xl font-black text-structural-black uppercase italic tracking-tighter">Registered ({participants.length})</h3>
             <span className="text-[10px] lg:text-xs font-black text-structural-black bg-accent-primary px-3 py-1.5 lg:px-4 lg:py-2 border-2 border-structural-black shadow-[2px_2px_0_0_#000000] lg:shadow-[3px_3px_0_0_#000000] tabular-nums uppercase tracking-widest rounded-none">
               Expected: ₹{(participants.length * shareSize).toLocaleString('en-IN')}
             </span>
          </div>
          
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-structural-black text-white text-[10px] uppercase font-black tracking-[0.2em]">
                  <th className="px-8 py-4">Identity</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4">Due (Monthly)</th>
                  <th className="px-8 py-4 text-right">Ops</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-structural-black text-sm">
                {participants.length > 0 ? (
                  participants.map((p) => (
                    <tr key={p.id} className="hover:bg-bg-canvas transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-structural-black border-2 border-structural-black shrink-0 overflow-hidden shadow-[3px_3px_0_0_#CCFF00] rounded-none">
                            <div className={`w-full h-full flex items-center justify-center font-black text-xl rounded-none ${p.type === 'Individual' ? 'bg-accent-pink text-white' : 'bg-accent-blue text-white'}`}>
                              {p.type === 'Individual' ? p.name.charAt(0) : p.groupName.charAt(0)}
                            </div>
                          </div>
                          <div>
                            <div className="font-black text-xl text-structural-black uppercase italic tracking-tight leading-none mb-1">
                              {p.type === 'Individual' ? p.name : p.groupName}
                            </div>
                            {p.type === 'Group' && (
                              <div className="text-[10px] text-structural-black font-bold uppercase tracking-widest max-w-[240px] truncate" title={p.members.join(', ')}>
                                {p.members.length} MEMBERS: {p.members.join(', ')}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`inline-flex items-center px-3 py-1 border-2 border-structural-black text-[10px] font-black uppercase tracking-widest shadow-[2px_2px_0_0_#000000] rounded-none ${
                          p.type === 'Individual' ? 'bg-white text-structural-black' : 'bg-white text-structural-black'
                        }`}>
                          {p.type}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="font-black tabular-nums text-xl text-structural-black italic">
                          ₹{(p.type === 'Individual' ? p.monthlyAmountDue : p.combinedMonthlyAmountDue).toLocaleString('en-IN')}
                        </div>
                        {p.type === 'Group' && (
                          <div className="text-[10px] text-structural-black font-bold uppercase tracking-widest mt-1 opacity-70">
                           (₹{Math.round(p.combinedMonthlyAmountDue / p.members.length).toLocaleString('en-IN')} / HEAD)
                          </div>
                        )}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end">
                          <button 
                            onClick={() => setParticipantToDelete(p.id)}
                            className="w-10 h-10 flex items-center justify-center bg-white border-2 border-structural-black shadow-[3px_3px_0_0_#FF3366] hover:bg-accent-pink hover:text-white transition-all transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-none rounded-none"
                            title="Purge Member"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center font-black uppercase italic text-structural-black/30 text-2xl tracking-widest">
                      Roster is Empty.
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
        <div className="fixed inset-0 bg-structural-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-white border-4 border-structural-black max-w-md w-full p-8 shadow-[15px_15px_0_0_#FF3366] rounded-none">
            <div className="flex items-center gap-4 text-accent-pink mb-6">
              <div className="p-3 bg-white border-2 border-structural-black shadow-[3px_3px_0_0_#FF3366] rounded-none">
                <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="text-3xl font-black uppercase italic tracking-tighter">Purge Record?</h3>
            </div>
            <p className="text-structural-black font-medium mb-8 uppercase tracking-tight text-sm">
              Are you sure you want to remove this participant from the roster? This action is irreversible.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setParticipantToDelete(null)}
                className="flex-1 brutal-btn brutal-btn-blue text-sm rounded-none"
              >
                ABORT
              </button>
              <button
                onClick={async () => {
                   await deleteParticipant(participantToDelete);
                   setParticipantToDelete(null);
                }}
                className="flex-1 brutal-btn brutal-btn-pink text-sm rounded-none"
              >
                CONFIRM PURGE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParticipantsTab;
