import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { 
  doc, 
  collection, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy
} from "firebase/firestore";
import { db } from '../lib/firebase';
import type { KuriState, FundDetails, Participant, DrawWinner } from '../types';

interface KuriContextType extends KuriState {
  setFundDetails: (details: FundDetails) => Promise<void>;
  setShareSize: (size: number) => Promise<void>;
  addParticipant: (participant: Participant) => Promise<void>;
  updateParticipantStatus: (id: string, monthIndex: number, status: 'Paid' | 'Unpaid') => Promise<void>;
  conductDraw: (winnerId: string, amountWon: number, monthIndex: number) => Promise<void>;
  setActiveMonth: (month: number) => Promise<void>;
  deleteParticipant: (id: string) => Promise<void>;
  isLoading: boolean;
}


const KuriContext = createContext<KuriContextType | undefined>(undefined);

export const KuriProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<KuriState>({
    fundDetails: null,
    shareSize: 0,
    activeMonth: 1,
    participants: [],
    drawHistory: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  // Initial load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const settingsRef = doc(db, "settings", "current");
        const participantsRef = collection(db, "participants");
        const drawHistoryRef = collection(db, "drawHistory");

        const [settingsSnap, participantsSnap, drawHistorySnap] = await Promise.all([
          getDoc(settingsRef),
          getDocs(participantsRef),
          getDocs(query(drawHistoryRef, orderBy("monthIndex", "asc"))),
        ]);

        const settingsData = settingsSnap.exists() ? settingsSnap.data() : { fundDetails: null, shareSize: 0, activeMonth: 1 };
        const participantsData = participantsSnap.docs.map(doc => doc.data() as Participant);
        const drawHistoryData = drawHistorySnap.docs.map(doc => doc.data() as DrawWinner);
        
        setState({
          fundDetails: settingsData.fundDetails || null,
          shareSize: settingsData.shareSize || 0,
          activeMonth: settingsData.activeMonth || 1,
          participants: participantsData,
          drawHistory: drawHistoryData,
        });
      } catch (error) {
        console.error('Error fetching data from Firestore:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const updateStateField = async (field: keyof KuriState, value: any) => {
    try {
      const settingsRef = doc(db, "settings", "current");
      await updateDoc(settingsRef, { [field]: value });
      setState(s => ({ ...s, [field]: value }));
    } catch (error) {
      // If doc doesn't exist, create it
      if ((error as any).code === 'not-found') {
        const settingsRef = doc(db, "settings", "current");
        await setDoc(settingsRef, { [field]: value }, { merge: true });
        setState(s => ({ ...s, [field]: value }));
      } else {
        console.error(`Error updating ${field}:`, error);
      }
    }
  };

  const setFundDetails = async (details: FundDetails) => {
    await updateStateField('fundDetails', details);
  };

  const setShareSize = async (size: number) => {
    await updateStateField('shareSize', size);
  };

  const setActiveMonth = async (month: number) => {
    await updateStateField('activeMonth', month);
  };

  const addParticipant = async (participant: Participant) => {
    try {
      const newCount = state.participants.length + 1;

      // 1. Update existing participants in Firestore to heal all gaps up to newCount
      const updatedParticipantsList = await Promise.all(state.participants.map(async (p) => {
        let changed = false;
        const newHistory = [...p.paymentHistory];
        
        for (let m = 1; m <= newCount; m++) {
          if (!newHistory.find(h => h.monthIndex === m)) {
            newHistory.push({ monthIndex: m, status: 'Unpaid' as const });
            changed = true;
          }
        }
        
        if (changed) {
          newHistory.sort((a, b) => a.monthIndex - b.monthIndex);
          const pRef = doc(db, "participants", p.id);
          await updateDoc(pRef, { paymentHistory: newHistory });
          return { ...p, paymentHistory: newHistory };
        }
        return p;
      }));

      // 2. Add the new participant
      const participantRef = doc(db, "participants", participant.id);
      await setDoc(participantRef, participant);

      // 3. Update global settings (duration matches participant count)
      const settingsRef = doc(db, "settings", "current");
      const newTotal = state.shareSize * newCount * newCount;
      await updateDoc(settingsRef, { 
        "fundDetails.durationMonths": newCount,
        totalAmount: newTotal
      });

      setState(s => ({
        ...s,
        fundDetails: s.fundDetails ? { ...s.fundDetails, durationMonths: newCount } : null,
        participants: [...updatedParticipantsList, participant]
      }));
    } catch (error) {
      console.error('Error adding participant:', error);
    }
  };

  const updateParticipantStatus = async (id: string, monthIndex: number, status: 'Paid' | 'Unpaid') => {
    try {
      const participant = state.participants.find(p => p.id === id);
      if (!participant) return;
      let found = false;
      const newHistory = participant.paymentHistory.map(h => {
        if (h.monthIndex === monthIndex) {
          found = true;
          return { ...h, status };
        }
        return h;
      });
      if (!found) {
        newHistory.push({ monthIndex, status });
      }

      const participantRef = doc(db, "participants", id);
      await updateDoc(participantRef, { paymentHistory: newHistory });

      setState(s => ({
        ...s,
        participants: s.participants.map(p => p.id === id ? { ...p, paymentHistory: newHistory } : p)
      }));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const deleteParticipant = async (id: string) => {
    try {
      const newCount = state.participants.length - 1;
      const participantRef = doc(db, "participants", id);
      await deleteDoc(participantRef);

      // 1. Update remaining participants to remove the extra month
      const updatedParticipants = await Promise.all(
        state.participants
          .filter(p => p.id !== id)
          .map(async (p) => {
            const newHistory = p.paymentHistory.filter(h => h.monthIndex <= newCount);
            if (newHistory.length !== p.paymentHistory.length) {
              const pRef = doc(db, "participants", p.id);
              await updateDoc(pRef, { paymentHistory: newHistory });
              return { ...p, paymentHistory: newHistory };
            }
            return p;
          })
      );

      // 2. Update global settings
      const settingsRef = doc(db, "settings", "current");
      const newTotal = state.shareSize * (newCount > 0 ? newCount : 0) * (newCount > 0 ? newCount : 0);
      await updateDoc(settingsRef, { 
        "fundDetails.durationMonths": newCount > 0 ? newCount : 0,
        totalAmount: newTotal
      });

      setState(s => ({
        ...s,
        fundDetails: s.fundDetails ? { ...s.fundDetails, durationMonths: newCount > 0 ? newCount : 0 } : null,
        participants: updatedParticipants
      }));
    } catch (error) {
      console.error('Error deleting participant:', error);
    }
  };

  const conductDraw = async (winnerId: string, amountWon: number, monthIndex: number) => {
    try {
      const winner = state.participants.find(p => p.id === winnerId);
      if (!winner) return;

      const winnerName = winner.type === 'Group' ? winner.groupName : winner.name;
      const newWinner: DrawWinner = {
        id: `draw-${Date.now()}`,
        monthIndex,
        date: new Date().toISOString().split('T')[0],
        winnerId,
        winnerName,
        amountWon,
      };

      // 1. Mark participant as hasWon
      const participantRef = doc(db, "participants", winnerId);
      await updateDoc(participantRef, { hasWon: true });
      
      // 2. Add history
      const drawRef = doc(db, "drawHistory", newWinner.id);
      await setDoc(drawRef, newWinner);

      setState(s => ({
        ...s,
        drawHistory: [...s.drawHistory, newWinner],
        participants: s.participants.map(p => p.id === winnerId ? { ...p, hasWon: true } : p)
      }));
    } catch (error) {
      console.error('Error conducting draw:', error);
    }
  };

  return (
    <KuriContext.Provider
      value={{
        ...state,
        setFundDetails,
        setShareSize,
        addParticipant,
        updateParticipantStatus,
        conductDraw,
        setActiveMonth,
        deleteParticipant,
        isLoading
      }}
    >
      {isLoading ? (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-emerald-500 mb-4"></div>
        </div>
      ) : children}
    </KuriContext.Provider>
  );
};

export const useKuri = () => {
  const context = useContext(KuriContext);
  if (context === undefined) {
    throw new Error('useKuri must be used within a KuriProvider');
  }
  return context;
};
