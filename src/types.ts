/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type MemberRole = 'treasurer' | 'member' | 'chairperson';

export interface Member {
  id: string; // Phone number or generated unique ID
  name: string;
  phone: string; // M-Pesa registered number, e.g., 2547XXXXXXXX
  joinDate: string;
  totalContributed: number; // accumulated savings/shares
  loanBalance: number;
  penaltyBalance: number;
  role: MemberRole;
}

export interface ContributionCycle {
  id: string; // e.g., 'cycle-2026-05' (May 2026)
  name: string; // "May 2026"
  expectedAmountPerMember: number; // fixed amount, e.g., KES 2,000
  dueDate: string;
}

export interface ContributionEntry {
  id: string;
  memberId: string;
  cycleId: string;
  expectedAmount: number;
  actualAmountPaid: number;
  paymentMethod: 'M-Pesa' | 'Cash';
  timestamp: string;
  mpesaRef?: string;
  rawVerificationText?: string;
  verificationEvidence?: {
    paymentId: string;
    amount: number;
    dateStr: string;
  };
}

export interface Installment {
  amount: number;
  date: string;
  ref: string;
  verificationEvidence?: {
    paymentId: string;
    amount: number;
    dateStr: string;
  };
}

export interface Loan {
  id: string;
  memberId: string;
  memberName: string;
  principal: number;
  disbursementDate: string;
  dueDate: string;
  interestRate: number; // monthly interest rate in decimals, e.g., 0.10 for 10%
  durationMonths: number;
  installmentsPaid: Installment[];
  outstandingBalance: number; // principal + interest - paid
  interestOwed: number; // principal * interestRate * durationMonths
  penaltyBalance: number; // accumulated penalty
  penaltyFlag: boolean; // true if overdue
  status: 'active' | 'repaid' | 'overdue' | 'pending_approval' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionRemarks?: string;
  remarks?: string;
  rawVerificationText?: string;
  verificationEvidence?: {
    paymentId: string;
    amount: number;
    dateStr: string;
  };
}

export interface MpesaTransaction {
  id: string; // Transaction code, e.g., QWF48DH74X
  senderPhone: string;
  senderName: string;
  amount: number;
  timestamp: string;
  rawMessage: string;
  matchedMemberId?: string; // matched if phone / name fuzzy match succeeds
  reconciliationStatus: 'auto-matched' | 'flagged-ambiguous' | 'reconciled-manual';
  remarks?: string;
}

export interface BylawRule {
  id: string;
  clause: string; // e.g., "7.3"
  text: string;
  category: 'contributions' | 'loans' | 'penalties' | 'meetings' | 'general';
  version: string; // e.g., "v1.2"
  effectiveDate: string;
}

export interface Dispute {
  id: string;
  memberId: string;
  memberName: string;
  text: string;
  timestamp: string;
  rulingText?: string;
  bylawClause?: string;
  status: 'pending' | 'resolved';
}

export interface ReminderLog {
  id: string;
  recipientName: string;
  phone: string;
  message: string;
  timestamp: string;
  channel: 'SMS' | 'WhatsApp';
  status: 'sent' | 'failed';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  detectedLanguage?: 'Sheng' | 'Kiswahili' | 'English';
}

export interface ChamaState {
  members: Member[];
  cycles: ContributionCycle[];
  contributions: ContributionEntry[];
  loans: Loan[];
  mpesaTransactions: MpesaTransaction[];
  bylaws: BylawRule[];
  disputes: Dispute[];
  reminders: ReminderLog[];
}
