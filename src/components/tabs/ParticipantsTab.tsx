import React, { useState } from 'react';
import { useKuri } from '../../context/KuriContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import type { IndividualParticipant, GroupParticipant } from '../../types';
import { Users, UserPlus, Trash2, AlertCircle, ShieldAlert } from 'lucide-react';

const ParticipantsTab = () => {
  const { participants, addParticipant, deleteParticipant, fundDetails, shareSize } = useKuri();
  const { t } = useLanguage();
  const { isAdmin } = useAuth();
  
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
      setFormError(t('members.setup_error'));
      return;
    }

    if (participantType === 'Individual') {
      if (!indiName.trim()) {
        setFormError(t('members.name_error'));
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
        setFormError(t('members.group_name_error'));
        return;
      }
      const members = groupMembersText.split(',').map(m => m.trim()).filter(Boolean);
      if (members.length < 2) {
        setFormError(t('members.min_members_error'));
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
    <div className="space-y-8">
      {!isAdmin && (
        <div className="bg-accent-pink/10 border-2 border-accent-pink p-3 flex items-center gap-3 mb-2">
          <ShieldAlert className="w-5 h-5 text-accent-pink shrink-0" />
          <p className="text-[10px] font-black uppercase text-accent-pink tracking-tight leading-tight">
            {t('status.readonly_members')}
          </p>
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
        <div className="w-12 h-12 flex items-center justify-center bg-accent-blue text-white border-2 border-structural-black shadow-[3px_3px_0_0_#000000] rounded-none">
          <Users className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-black tracking-tighter text-structural-black uppercase italic leading-none">{t('members.title')}</h2>
          <p className="text-[10px] font-bold text-structural-black mt-1 bg-accent-primary px-1.5 py-0.5 inline-block border-2 border-structural-black shadow-[2px_2px_0_0_#000000] rounded-none">{t('members.subtitle')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 lg:gap-12">
        
        {/* ADD PARTICIPANT FORM */}
        <div className="xl:col-span-1 bg-white p-5 lg:p-6 border-4 border-structural-black shadow-[4px_4px_0_0_#000000] self-start rounded-none">
          <h3 className="text-lg lg:text-xl font-black mb-6 flex items-center gap-2.5 text-structural-black uppercase italic tracking-tight">
            <UserPlus className="w-5 h-5 text-accent-pink" /> {t('members.register_new')}
          </h3>

          <div className="flex bg-bg-canvas p-1.5 border-2 border-structural-black mb-6 shadow-[3px_3px_0_0_#000000] rounded-none">
            <button
              onClick={() => { setParticipantType('Individual'); setFormError(''); }}
              className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest transition-all focus-visible:outline-none rounded-none ${
                participantType === 'Individual' ? 'bg-accent-primary text-structural-black border-2 border-structural-black shadow-[2px_2px_0_0_#000000]' : 'text-structural-black/50 hover:text-structural-black'
              }`}
            >
              {t('members.individual')}
            </button>
            <button
              onClick={() => { setParticipantType('Group'); setFormError(''); }}
              className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 focus-visible:outline-none rounded-none ${
                participantType === 'Group' ? 'bg-accent-primary text-structural-black border-2 border-structural-black shadow-[2px_2px_0_0_#000000]' : 'text-structural-black/50 hover:text-structural-black'
              }`}
            >
              {t('members.group')}
            </button>
          </div>

          {formError && (
             <div className="bg-accent-pink text-white text-[11px] font-black uppercase p-3 border-2 border-structural-black mb-5 flex items-start gap-2.5 shadow-[3px_3px_0_0_#000000] rounded-none line-clamp-2">
               <AlertCircle className="w-5 h-5 shrink-0" /> {formError}
             </div>
          )}

          <form onSubmit={handleAddParticipant} className="space-y-6">
            {participantType === 'Individual' ? (
              <div>
                <label className="block text-[9px] font-black text-structural-black uppercase tracking-widest mb-2">{t('members.identity_name_label')}</label>
                <input
                  type="text"
                  value={indiName}
                  onChange={(e) => setIndiName(e.target.value)}
                  placeholder="E.G. JOHN DOE"
                  disabled={!isAdmin}
                  className="brutal-input text-base font-bold rounded-none disabled:bg-bg-canvas disabled:opacity-50"
                />
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-[9px] font-black text-structural-black uppercase tracking-widest mb-2">{t('members.group_identity_label')}</label>
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="E.G. OFFICE COLLEAGUES"
                    disabled={!isAdmin}
                    className="brutal-input text-base font-bold uppercase rounded-none disabled:bg-bg-canvas disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-structural-black uppercase tracking-widest mb-2">{t('members.members_label')}</label>
                  <textarea
                    value={groupMembersText}
                    onChange={(e) => setGroupMembersText(e.target.value)}
                    placeholder="ALICE, BOB, CHARLIE..."
                    rows={2}
                    disabled={!isAdmin}
                    className="brutal-input text-base font-bold uppercase resize-none h-24 rounded-none disabled:bg-bg-canvas disabled:opacity-50"
                  />
                  {groupMembersText.split(',').filter(Boolean).length > 0 && (
                     <p className="text-[10px] text-structural-black font-black uppercase tracking-widest mt-3 bg-accent-blue text-white px-2 py-1 inline-block border-2 border-structural-black shadow-[2px_2px_0_0_#000000] rounded-none">
                       {t('members.members_detected', { count: groupMembersText.split(',').filter(Boolean).length })}
                     </p>
                  )}
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={!isAdmin}
              className="brutal-btn w-full text-lg py-3 rounded-none disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
            >
              {t('members.deploy_btn')}
            </button>
          </form>
        </div>

        {/* PARTICIPANTS LIST */}
        <div className="xl:col-span-2 bg-white border-4 border-structural-black shadow-[6px_6px_0_0_#000000] rounded-none overflow-hidden">
          <div className="p-4 lg:px-8 border-b-4 border-structural-black flex flex-col sm:flex-row sm:justify-between sm:items-center bg-bg-canvas gap-3 rounded-none">
             <h3 className="text-xl lg:text-2xl font-black text-structural-black uppercase italic tracking-tighter">{t('members.registered_count', { count: participants.length })}</h3>
             <span className="text-[9px] lg:text-[10px] font-black text-structural-black bg-accent-primary px-3 py-1.5 border-2 border-structural-black shadow-[2px_2px_0_0_#000000] tabular-nums uppercase tracking-widest rounded-none">
               {t('members.expected_amount', { amount: (participants.length * shareSize).toLocaleString('en-IN') })}
             </span>
          </div>
          
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="bg-structural-black text-white text-[9px] uppercase font-black tracking-[0.2em]">
                  <th className="px-6 py-3">{t('members.table_identity')}</th>
                  <th className="px-6 py-3">{t('members.table_status')}</th>
                  <th className="px-6 py-3">{t('members.table_due')}</th>
                  <th className="px-6 py-3 text-right">{t('members.table_ops')}</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-structural-black text-xs">
                {participants.length > 0 ? (
                  participants.map((p) => (
                    <tr key={p.id} className="hover:bg-bg-canvas transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-structural-black border-2 border-structural-black shrink-0 overflow-hidden shadow-[2px_2px_0_0_#af7b4c] rounded-none">
                            <div className={`w-full h-full flex items-center justify-center font-black text-lg rounded-none ${p.type === 'Individual' ? 'bg-accent-pink text-white' : 'bg-accent-blue text-white'}`}>
                              {p.type === 'Individual' ? p.name.charAt(0) : p.groupName.charAt(0)}
                            </div>
                          </div>
                          <div className="min-w-0">
                            <div className="font-black text-lg text-structural-black uppercase italic tracking-tight leading-none mb-1 pr-2">
                              {p.type === 'Individual' ? p.name : p.groupName}
                            </div>
                            {p.type === 'Group' && (
                              <div className="text-[9px] text-structural-black font-bold uppercase tracking-widest max-w-[180px] truncate" title={p.members.join(', ')}>
                                {t('members.members_count', { count: p.members.length })}: {p.members.join(', ')}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 border-2 border-structural-black text-[9px] font-black uppercase tracking-widest shadow-[1.5px_1.5px_0_0_#000000] rounded-none bg-white text-structural-black">
                          {p.type === 'Individual' ? t('members.individual') : t('members.group')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-black tabular-nums text-lg text-structural-black italic">
                          ₹{(p.type === 'Individual' ? p.monthlyAmountDue : p.combinedMonthlyAmountDue).toLocaleString('en-IN')}
                        </div>
                        {p.type === 'Group' && (
                          <div className="text-[9px] text-structural-black font-bold uppercase tracking-widest mt-0.5 opacity-70">
                           {t('members.per_head', { amount: Math.round(p.combinedMonthlyAmountDue / p.members.length).toLocaleString('en-IN') })}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end">
                          {isAdmin && (
                            <button 
                              onClick={() => setParticipantToDelete(p.id)}
                              className="w-8 h-8 flex items-center justify-center bg-white border-2 border-structural-black shadow-[2px_2px_0_0_#af7b4c] hover:bg-accent-pink hover:text-white transition-all transform active:translate-x-px active:translate-y-px active:shadow-none rounded-none"
                              title="Purge Member"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center font-black uppercase italic text-structural-black/30 text-xl tracking-widest">
                      {t('members.empty_roster')}
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
              <h3 className="text-3xl font-black uppercase italic tracking-tighter">{t('members.purge_title')}</h3>
            </div>
            <p className="text-structural-black font-medium mb-8 uppercase tracking-tight text-sm">
              {t('members.purge_desc')}
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setParticipantToDelete(null)}
                className="flex-1 brutal-btn brutal-btn-blue text-sm rounded-none"
              >
                {t('members.abort')}
              </button>
              <button
                onClick={async () => {
                   await deleteParticipant(participantToDelete);
                   setParticipantToDelete(null);
                }}
                className="flex-1 brutal-btn brutal-btn-pink text-sm rounded-none"
              >
                {t('members.purge_confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParticipantsTab;
