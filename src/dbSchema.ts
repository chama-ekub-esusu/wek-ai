/**
 * Database Schema Design for Chama Cooperative Savings and Investment Ledgers.
 * 
 * Below are production-ready schema architectures using best practices for double-entry financial bookkeeping:
 * 1. SQL (PostgreSQL) - Recommended for absolute transaction consistency, ACID guarantees, and ledger foreign keys.
 * 2. NoSQL (MongoDB/Firestore) - Ideal for flexibility, horizontal scalability, and nested proof logs.
 */

// ============================================================================
// PART 1: RELATIONAL SQL SCHEMA (PostgreSQL)
// ============================================================================
export const POSTGRESQL_SCHEMA = `
-- Enable UUID extension for secure, non-sequential primary keys
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ROLES ENUM
CREATE TYPE member_role AS ENUM ('member', 'treasurer', 'chairperson');

-- 2. DARAJA / RECONCILIATION STATUS ENUM
CREATE TYPE reconciliation_status AS ENUM ('auto-matched', 'flagged-ambiguous', 'reconciled-manual');

-- 3. LOAN APPROVAL STATUS ENUM
CREATE TYPE loan_status AS ENUM ('pending_approval', 'active', 'repaid', 'overdue', 'rejected');

-- 4. MEMBERS TABLE (Users)
CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL, -- e.g., '+254712345678'
    role member_role NOT NULL DEFAULT 'member',
    join_date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_contributed NUMERIC(15, 2) NOT NULL DEFAULT 0.00, -- accumulated savings/shares
    loan_balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    penalty_balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast user searches and matching by telephone
CREATE INDEX idx_members_phone ON members(phone);

-- 5. CONTRIBUTION CYCLES TABLE
CREATE TABLE contribution_cycles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL, -- e.g., 'May 2026'
    expected_amount NUMERIC(15, 2) NOT NULL, -- e.g., 2000.00
    due_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. DARAJA / MPESA DUMP & PARSED AUDIT TRAIL
-- Ensures audit trails of all mobile-money receipts received directly from webhooks.
CREATE TABLE payment_proofs (
    id VARCHAR(50) PRIMARY KEY, -- MPESA Transaction ID / Receipt Number e.g., 'RCA192DJ81'
    sender_phone VARCHAR(20),
    sender_name VARCHAR(150),
    amount NUMERIC(15, 2) NOT NULL,
    transaction_date TIMESTAMP WITH TIME ZONE NOT NULL,
    raw_sms_message TEXT NOT NULL, -- The original copied text payload
    parsed_metadata JSONB, -- Backup metadata parsed via Regex
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. LEDGER TRANSACTIONS (Contributions / Savings)
-- Tracks exact member deposits with hard links to verification tokens as immutable evidence
CREATE TABLE contribution_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
    cycle_id UUID NOT NULL REFERENCES contribution_cycles(id) ON DELETE RESTRICT,
    expected_amount NUMERIC(15, 2) NOT NULL,
    actual_amount_paid NUMERIC(15, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL DEFAULT 'M-Pesa', -- 'M-Pesa', 'Cash'
    mpesa_receipt_id VARCHAR(50) REFERENCES payment_proofs(id) ON DELETE RESTRICT, -- link to immutable proof
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id UUID REFERENCES members(id), -- Maker track
    CONSTRAINT unique_member_cycle UNIQUE (member_id, cycle_id)
);

-- 8. LOANS TABLE
-- Implements Maker-Checker paradigm for credit risk.
-- Created by Treasurer (Maker), approved or rejected by Chairperson (Checker).
CREATE TABLE loans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
    principal NUMERIC(15, 2) NOT NULL,
    interest_rate NUMERIC(5, 4) NOT NULL DEFAULT 0.1000, -- 10% monthly interest rate
    duration_months INT NOT NULL DEFAULT 1,
    outstanding_balance NUMERIC(15, 2) NOT NULL,
    interest_owed NUMERIC(15, 2) NOT NULL,
    penalty_balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    penalty_flag BOOLEAN NOT NULL DEFAULT FALSE,
    status loan_status NOT NULL DEFAULT 'pending_approval',
    
    -- Maker Column (Treasurer)
    disbursement_date DATE,
    due_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES members(id), -- Maker

    -- Checker Columns (Chairperson)
    approved_by UUID REFERENCES members(id), -- Checker
    approved_at TIMESTAMP WITH TIME ZONE,
    rejected_by UUID REFERENCES members(id), 
    rejected_at TIMESTAMP WITH TIME ZONE,
    remarks TEXT
);

CREATE INDEX idx_loans_status ON loans(status);

-- 9. LOAN REPAYMENT INSTALLMENTS
CREATE TABLE loan_installments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE RESTRICT,
    amount NUMERIC(15, 2) NOT NULL,
    repayment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    mpesa_receipt_id VARCHAR(50) REFERENCES payment_proofs(id) ON DELETE RESTRICT, -- link to proof-of-payment SMS
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
`;

// ============================================================================
// PART 2: DOCUMENT-BASED NOSQL SCHEMA (MongoDB / Firestore)
// ============================================================================
export const NOSQL_SCHEMA = {
  description: "Suggested schema for MongoDB or Google Cloud Firestore Collections",
  collections: {
    members: {
      collectionName: "members",
      documentAttributes: {
        _id: "ObjectId('...')",
        name: "string",
        phone: "string (Unique - regex searchable)",
        joinDate: "string (ISO Date)",
        totalContributed: "decimal128",
        loanBalance: "decimal128",
        penaltyBalance: "decimal128",
        role: "string ('member' | 'treasurer' | 'chairperson')"
      }
    },
    paymentProofs: {
      collectionName: "payment_proofs",
      documentAttributes: {
        _id: "string (e.g., 'RCA192DJ81' - Mpesa Code serves as primary key to prevent duplication)",
        senderPhone: "string",
        senderName: "string",
        amount: "number",
        transactionDate: "string (ISO Date)",
        rawSmsMessage: "string (Original pasted SMS text to audit integrity)",
        parsedMetadata: {
          confidenceScore: "number",
          clientAgentIp: "string",
          reconciledAt: "string (ISO Date)"
        }
      }
    },
    contributions: {
      collectionName: "contributions",
      documentAttributes: {
        _id: "ObjectId('...')",
        memberId: "ObjectId('members')",
        cycleId: "string ('cycle-3')",
        expectedAmount: "number",
        actualAmountPaid: "number",
        paymentMethod: "string ('M-Pesa' | 'Cash')",
        timestamp: "string (ISO Date)",
        verification: {
          mpesaRef: "string (links to payment_proofs._id - optional)",
          isVerified: "boolean",
          rawText: "string"
        },
        createdBy: "ObjectId('members') (Maker ID)"
      }
    },
    loans: {
      collectionName: "loans",
      documentAttributes: {
        _id: "ObjectId('...')",
        memberId: "ObjectId('members')",
        memberName: "string",
        principal: "number",
        disbursementDate: "string (ISO Date)",
        dueDate: "string (ISO Date)",
        interestRate: "number (decimal, e.g. 0.10)",
        durationMonths: "number",
        outstandingBalance: "number",
        interestOwed: "number",
        penaltyBalance: "number",
        penaltyFlag: "boolean",
        status: "string ('pending_approval' | 'active' | 'repaid' | 'overdue' | 'rejected')",
        
        // Audit Trails (Maker & Checker Coordination)
        maker: {
          createdById: "ObjectId('members')",
          createdAt: "string (ISO Date)"
        },
        checker: {
          approvedById: "ObjectId('members') (Optional)",
          approvedAt: "string (ISO Date) (Optional)",
          rejectedById: "ObjectId('members') (Optional)",
          rejectedAt: "string (ISO Date) (Optional)",
          remarks: "string"
        },
        
        installmentsPaid: [
          {
            amount: "number",
            date: "string (ISO Date)",
            ref: "string (Serves as unique key / MPESA id)",
            verificationProof: {
              rawText: "string",
              verifiedDate: "string"
            }
          }
        ]
      }
    }
  }
};
