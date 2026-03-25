export type ParticipantType = 'Individual' | 'Group';

export interface PaymentRecord {
  monthIndex: number;
  status: 'Paid' | 'Unpaid';
}

export interface ParticipantBase {
  id: string;
  type: ParticipantType;
  paymentHistory: PaymentRecord[];
  hasWon: boolean;
}

export interface IndividualParticipant extends ParticipantBase {
  type: 'Individual';
  name: string;
  shareFraction: number;
  monthlyAmountDue: number;
}

export interface GroupParticipant extends ParticipantBase {
  type: 'Group';
  groupName: string;
  members: string[];
  shareFractionPerMember: number;
  combinedMonthlyAmountDue: number;
}

export type Participant = IndividualParticipant | GroupParticipant;

export interface DrawWinner {
  id: string;
  monthIndex: number;
  date: string;
  winnerId: string;
  winnerName: string;
  amountWon: number;
  isSwapped?: boolean;
}

export interface FundDetails {
  name: string;
  totalAmount: number;
  durationMonths: number;
  startDate: string;
}

export interface KuriState {
  fundDetails: FundDetails | null;
  shareSize: number;
  participants: Participant[];
  drawHistory: DrawWinner[];
  activeMonth: number;
  drawActive: boolean;
}
