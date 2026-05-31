/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, getDocFromServer } from 'firebase/firestore';
import { 
  ChamaState, Member, ContributionCycle, ContributionEntry, 
  Loan, MpesaTransaction, BylawRule, Dispute, ReminderLog, Installment 
} from '../src/types.js'; // Note the adjustment to '../src/' since this file now sits inside the 'api/' folder
import { parsePaymentSms } from '../src/utils/parser.js';

dotenv.config();

const app = express();
app.use(express.json());

// Helper to write numbers in Kiswahili/Sheng words
function numberToShengWords(amount: number): string {
  if (amount === 2000) return "elfu mbili";
  if (amount === 1000) return "elfu moja";
  if (amount === 5500) return "elfu tano mia tano";
  if (amount === 10000) return "elfu kumi";
  if (amount === 11000) return "elfu kumi na moja";
  if (amount === 20000) return "elfu ishirini";
  if (amount === 22000) return "elfu ishirini na mbili";
  if (amount === 3500) return "elfu tatu mia tano";
  if (amount === 250) return "mia mbili hamsini";
  if (amount === 200) return "mia mbili";
  
  if (amount >= 1000 && amount < 100000) {
    const thousands = Math.floor(amount / 1000);
    const remainder = amount % 1000;
    let word = `elfu ${thousands === 1 ? 'moja' : thousands === 2 ? 'mbili' : thousands === 5 ? 'tano' : thousands === 10 ? 'kumi' : thousands === 20 ? 'ishirini' : thousands}`;
    if (remainder > 0) {
      if (remainder === 500) word += " mia tano";
      else word += ` na ${remainder}`;
    }
    return word;
  }
  return `${amount}`;
}

const DEFAULT_BYLAWS: BylawRule[] = [
  { id: "bylaw-1", clause: "1.1", text: "Kila mwanachama lazima achange mchango wa kikundi wa KES 2,000 kila mwezi ifikapo siku ya tano (tarehe 5). Every member must contribute monthly group contributions of KES 2,000 by the 5th.", category: "contributions", version: "v1.2", effectiveDate: "2026-01-01" },
  { id: "bylaw-2", clause: "1.2", text: "Mwanachama yeyote anayechelewa kutoa mchango wake baada ya tarehe 5 ya mwezi husika atatozwa faini kulingana na Katiba ya KES 200 kama faini ya kuchelewa (late contribution flat fine of KES 200).", category: "contributions", version: "v1.2", effectiveDate: "2026-01-01" },
  { id: "bylaw-3", clause: "2.1", text: "Mwanachama anaruhusiwa kupata mkopo wa hadi mara tatu (3x) ya jumla ya akiba/michango yake katika chama. Members can borrow up to three times (3x) their total accumulated savings/shares.", category: "loans", version: "v1.2", effectiveDate: "2026-01-01" },
  { id: "bylaw-4", clause: "2.2", text: "Mikopo yote inatozwa riba ya kiwango sawa cha 10% kwa mwezi mmoja (flat interest rate of 10% per month, standard duration is 1 month). Interest owed = principal * 10% * months.", category: "loans", version: "v1.2", effectiveDate: "2026-01-01" },
  { id: "bylaw-5", clause: "2.3", text: "Muda wa kulipa unapoisha na mkopo haujalipwa (overdue repayment), kutakuwa na faini ya asilimia 0.5% kila siku kwenye salio lililosalia (0.5% daily accrued late loan penalty applied on outstanding principal + interest balance).", category: "penalties", version: "v1.2", effectiveDate: "2026-01-01" },
  { id: "bylaw-6", clause: "3.1", text: "Dividends na magawio ya faida ya mwaka yatagawanywa kulingana na uzani wa akiba (total contributions share proportionality at year end). Each member gets proportional dividends according to their savings.", category: "general", version: "v1.2", effectiveDate: "2026-01-01" }
];

const DEFAULT_MEMBERS: Member[] = [
  { id: "mem-1", name: "Esther Wanjiku", phone: "+254705554433", joinDate: "2026-01-10", totalContributed: 50000, loanBalance: 0, penaltyBalance: 0, role: "treasurer" },
  { id: "mem-2", name: "Mary Atieno", phone: "+254712345678", joinDate: "2026-01-12", totalContributed: 30000, loanBalance: 5500, penaltyBalance: 1347.5, role: "member" },
  { id: "mem-3", name: "John Mwangi", phone: "+254722987654", joinDate: "2026-01-15", totalContributed: 45000, loanBalance: 0, penaltyBalance: 0, role: "member" },
  { id: "mem-4", name: "Brian Kiprop", phone: "+254733112233", joinDate: "2026-01-18", totalContributed: 35000, loanBalance: 0, penaltyBalance: 0, role: "chairperson" },
  { id: "mem-5", name: "Kevin Otieno", phone: "+254789123456", joinDate: "2026-02-01", totalContributed: 15000, loanBalance: 0, penaltyBalance: 0, role: "member" }
];

const DEFAULT_CYCLES: ContributionCycle[] = [
  { id: "cycle-1", name: "March 2026", expectedAmountPerMember: 2000, dueDate: "2026-03-05" },
  { id: "cycle-2", name: "April 2026", expectedAmountPerMember: 2000, dueDate: "2026-04-05" },
  { id: "cycle-3", name: "May 2026", expectedAmountPerMember: 2000, dueDate: "2026-05-05" }
];

const DEFAULT_CONTRIBUTIONS: ContributionEntry[] = [
  { id: "contrib-1", memberId: "mem-1", cycleId: "cycle-1", expectedAmount: 2000, actualAmountPaid: 2000, paymentMethod: "M-Pesa", timestamp: "2026-03-03T09:15:00Z", mpesaRef: "RCA192DJ81" },
  { id: "contrib-2", memberId: "mem-2", cycleId: "cycle-1", expectedAmount: 2000, actualAmountPaid: 2000, paymentMethod: "M-Pesa", timestamp: "2026-03-04T14:22:00Z", mpesaRef: "RDA204FJ23" },
  { id: "contrib-3", memberId: "mem-3", cycleId: "cycle-1", expectedAmount: 2000, actualAmountPaid: 2000, paymentMethod: "M-Pesa", timestamp: "2026-03-04T18:05:00Z", mpesaRef: "REA309FL88" },
  { id: "contrib-4", memberId: "mem-4", cycleId: "cycle-1", expectedAmount: 2000, actualAmountPaid: 2000, paymentMethod: "M-Pesa", timestamp: "2026-03-05T10:11:00Z", mpesaRef: "RFA441AK99" },
  { id: "contrib-5", memberId: "mem-5", cycleId: "cycle-1", expectedAmount: 2000, actualAmountPaid: 2000, paymentMethod: "Cash", timestamp: "2026-03-05T17:30:00Z" },
  { id: "contrib-6", memberId: "mem-1", cycleId: "cycle-2", expectedAmount: 2000, actualAmountPaid: 2000, paymentMethod: "M-Pesa", timestamp: "2026-04-02T11:03:00Z", mpesaRef: "SCA482KH41" },
  { id: "contrib-7", memberId: "mem-3", cycleId: "cycle-2", expectedAmount: 2000, actualAmountPaid: 2000, paymentMethod: "M-Pesa", timestamp: "2026-04-04T08:55:00Z", mpesaRef: "SDA491LI20" },
  { id: "contrib-8", memberId: "mem-2", cycleId: "cycle-2", expectedAmount: 2000, actualAmountPaid: 2000, paymentMethod: "M-Pesa", timestamp: "2026-04-10T16:47:00Z", mpesaRef: "SFD931KK19" },
  { id: "contrib-9", memberId: "mem-4", cycleId: "cycle-2", expectedAmount: 2000, actualAmountPaid: 2000, paymentMethod: "M-Pesa", timestamp: "2026-04-05T20:10:00Z", mpesaRef: "SEA942NK45" },
  { id: "contrib-10", memberId: "mem-5", cycleId: "cycle-2", expectedAmount: 2000, actualAmountPaid: 2000, paymentMethod: "M-Pesa", timestamp: "2026-04-05T12:00:00Z", mpesaRef: "SEB112OK32" },
  { id: "contrib-11", memberId: "mem-1", cycleId: "cycle-3", expectedAmount: 2000, actualAmountPaid: 2000, paymentMethod: "M-Pesa", timestamp: "2026-05-03T10:30:00Z", mpesaRef: "TCA001ZA55" },
  { id: "contrib-12", memberId: "mem-3", cycleId: "cycle-3", expectedAmount: 2000, actualAmountPaid: 2000, paymentMethod: "M-Pesa", timestamp: "2026-05-04T09:12:00Z", mpesaRef: "TCA002ZB61" },
  { id: "contrib-13", memberId: "mem-4", cycleId: "cycle-3", expectedAmount: 2000, actualAmountPaid: 2000, paymentMethod: "M-Pesa", timestamp: "2026-05-05T15:00:00Z", mpesaRef: "TCA003ZC77" }
];

const DEFAULT_LOANS: Loan[] = [
  {
    id: "loan-1", memberId: "mem-2", memberName: "Mary Atieno", principal: 10000, disbursementDate: "2026-03-03", dueDate: "2026-04-03",
    interestRate: 0.10, durationMonths: 1, outstandingBalance: 5500, interestOwed: 1000, penaltyBalance: 1347.5, penaltyFlag: true, status: "overdue",
    installmentsPaid: [{ amount: 5500, date: "2026-03-25", ref: "RCA192ZZ99" }]
  },
  {
    id: "loan-2", memberId: "mem-3", memberName: "John Mwangi", principal: 15000, disbursementDate: "2026-03-10", dueDate: "2026-04-10",
    interestRate: 0.10, durationMonths: 1, outstandingBalance: 0, interestOwed: 1500, penaltyBalance: 0, penaltyFlag: false, status: "repaid",
    installmentsPaid: [{ amount: 16500, date: "2026-04-09", ref: "SCA499ZZ66" }]
  }
];

const DEFAULT_TRANSACTIONS: MpesaTransaction[] = [
  { id: "RCA192DJ81", senderPhone: "254705554433", senderName: "Esther Wanjiku", amount: 2000, timestamp: "2026-03-03T09:15:00Z", rawMessage: "RCA192DJ81 Confirmed. KES 2,000.00 received from ESTHER WANJIKU 254705554433 on 3/3/26 at 9:15 AM.", matchedMemberId: "mem-1", reconciliationStatus: "auto-matched" },
  { id: "RDA204FJ23", senderPhone: "254712345678", senderName: "MARY ATIENO", amount: 2000, timestamp: "2026-03-04T14:22:00Z", rawMessage: "RDA204FJ23 Confirmed. KES 2,000.00 received from MARY ATIENO 254712345678 on 4/3/26 at 2:22 PM.", matchedMemberId: "mem-2", reconciliationStatus: "auto-matched" },
  { id: "SFD931KK19", senderPhone: "254712345678", senderName: "MARY ATIENO", amount: 2000, timestamp: "2026-04-10T16:47:00Z", rawMessage: "SFD931KK19 Confirmed. KES 2,000.00 received from MARY ATIENO 254712345678 on 10/4/26 at 4:47 PM.", matchedMemberId: "mem-2", reconciliationStatus: "auto-matched" },
  { id: "TFA903KL55", senderPhone: "254799887766", senderName: "MR JOHN O. MWANGI", amount: 2000, timestamp: "2025-05-18T11:20:00Z", rawMessage: "TFA903KL55 Confirmed. KES 2,000.00 received from MR JOHN O MWANGI 254799887766.", reconciliationStatus: "flagged-ambiguous", remarks: "Phone not matching, sender name is similar to John Mwangi. Awaiting treasurer confirmation." }
];

const DEFAULT_DISPUTES: Dispute[] = [
  { id: "disp-1", memberId: "mem-2", memberName: "Mary Atieno", text: "Mbona nimepigwa faini ya loan mwezi wa April na nililipa KES 5,500 mnamo tarehe 25 March? Nilikuwa nimebaki na decimal ndogo tu.", timestamp: "2026-05-20T14:10:00Z", status: "pending" }
];

const DEFAULT_REMINDERS: ReminderLog[] = [
  { id: "rem-1", recipientName: "Mary Atieno", phone: "+254712345678", message: "Weka Reminder: Mary, tafadhali kumbuka unastahili kulipa mchango wa May 2026 wa KES 2,000.", timestamp: "2026-05-10T08:00:00Z", channel: "WhatsApp", status: "sent" }
];

const INITIAL_STATE: ChamaState = {
  members: DEFAULT_MEMBERS,
  cycles: DEFAULT_CYCLES,
  contributions: DEFAULT_CONTRIBUTIONS,
  loans: DEFAULT_LOANS,
  mpesaTransactions: DEFAULT_TRANSACTIONS,
  bylaws: DEFAULT_BYLAWS,
  disputes: DEFAULT_DISPUTES,
  reminders: DEFAULT_REMINDERS
};

// Database Initialization
let db: any = null;
try {
  const firebaseConfig = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'api', 'firebase-applet-config.json'), 'utf-8'));
  const firebaseApp = initializeApp(firebaseConfig);
  db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);
  console.log("Firebase Firestore initialized successfully.");
} catch (err) {
  console.error("Failed to initialize Firebase:", err);
}

// State Cloud Sync Engine
async function getChamaStateFromCloud(): Promise<ChamaState> {
  if (!db) return INITIAL_STATE;
  try {
    const docRef = doc(db, 'system', 'chamaState');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as ChamaState;
    } else {
      await setDoc(docRef, INITIAL_STATE);
      return INITIAL_STATE;
