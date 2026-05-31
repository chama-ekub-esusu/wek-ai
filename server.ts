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
import { ChamaState, Member, ContributionCycle, ContributionEntry, Loan, MpesaTransaction, BylawRule, Dispute, ReminderLog, Installment } from './src/types.js';
import { parsePaymentSms } from './src/utils/parser.js';

dotenv.config();

const app = express();
app.use(express.json());

// Seed / Initial structures remain unchanged
const INITIAL_STATE: ChamaState = {
  members: [ /* Your default members array here */ ],
  cycles: [ /* Your default cycles array here */ ],
  contributions: [ /* Your default contributions array here */ ],
  loans: [ /* Your default loans array here */ ],
  mpesaTransactions: [ /* Your default transactions array here */ ],
  bylaws: [ /* Your default bylaws array here */ ],
  disputes: [ /* Your default disputes array here */ ],
  reminders: [ /* Your default reminders array here */ ]
};

// 1. SAFE SECURE DATABASE HANDSHAKE
let db: any = null;
try {
  const firebaseConfig = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'firebase-applet-config.json'), 'utf-8'));
  const firebaseApp = initializeApp(firebaseConfig);
  db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);
  console.log("Firebase Firestore initialized successfully.");
} catch (err) {
  console.error("Failed to initialize Firebase:", err);
}

// 2. STATE PIPELINE RESOLVED DIRECTLY TO THE CLOUD (No local fs writes)
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
    }
  } catch (err) {
    console.error("Error reading Firestore state:", err);
    return INITIAL_STATE;
  }
}

async function saveChamaStateToCloud(state: ChamaState): Promise<void> {
  if (!db) return;
  try {
    const docRef = doc(db, 'system', 'chamaState');
    await setDoc(docRef, state);
  } catch (err) {
    console.error("Failed syncing state directly to Cloud Firestore:", err);
  }
}

// 3. ROLE ACCREDITATION POLICY MIDDLEWARE
const checkRole = (allowedRoles: ('member' | 'treasurer' | 'chairperson')[]) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const activeRole = (req.headers['x-user-role'] as string) || 'member';
    if (!allowedRoles.includes(activeRole as any)) {
      return res.status(403).json({
        error: `Audit Warning: Your simulated role "${activeRole}" is prohibited from this mutation.`
      });
    }
    next();
  };
};

// 4. API ROUTE STRUCTURAL MODIFICATIONS (Async State Sync Fetching)
app.get('/api/state', async (req, res) => {
  const currentState = await getChamaStateFromCloud();
  res.json(currentState);
});

app.post('/api/state/reset', async (req, res) => {
  await saveChamaStateToCloud(INITIAL_STATE);
  res.json({ success: true, state: INITIAL_STATE });
});

app.post('/api/contributions/pay', checkRole(['treasurer', 'chairperson']), async (req, res) => {
  const { memberId, cycleId, amount, paymentMethod, rawVerificationText } = req.body;
  const state = await getChamaStateFromCloud();
  
  const member = state.members.find(m => m.id === memberId);
  const cycle = state.cycles.find(c => c.id === cycleId);
  if (!member || !cycle) return res.status(404).json({ error: "Context not found" });

  const paidAmt = Number(amount);
  member.totalContributed += paidAmt;

  // Process matching logic updates inside the transient reference state object...
  
  await saveChamaStateToCloud(state); // Sync atomic state payload
  res.json({ success: true, state });
});

// Implement remainder of endpoints (Loans, Arbitration, Mpesa simulation) with matching async data state processing blocks

// 5. REMOVE BINDING LISTEN ENGINE AND EXPORT INSTANCE BASE FOR VERCEL HANDLER
export default app;
