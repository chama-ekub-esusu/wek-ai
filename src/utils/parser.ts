/**
 * Weka Payment Verification Text Parser Utility.
 * This satisfies Deliverable 2 of the business requirements.
 * 
 * Extracts Transaction ID, Amount, and Date from common mobile money templates
 * like Safaricom's M-Pesa.
 */

export interface ParsedPayment {
  transactionId: string;
  amount: number;
  dateStr: string;
  senderName?: string;
  senderPhone?: string;
  isSuccessful: boolean;
}

/**
 * Parses raw copied confirmation SMS text to extract receipt details.
 * Supports multiple formats including Standard M-Pesa, Daraja confirmations,
 * cash-reconciliations, and older notification styles.
 * 
 * Standard Example Input:
 * "RCA192DJ81 Confirmed. KES 2,000.00 received from ESTHER WANJIKU 254705554433 on 3/3/26 at 9:15 AM."
 * 
 * Returns parsed attributes or null if parsing failed completely.
 */
export function parsePaymentSms(smsText: string): ParsedPayment {
  const cleanInput = smsText ? smsText.trim() : "";
  
  if (!cleanInput) {
    return {
      transactionId: "",
      amount: 0,
      dateStr: "",
      isSuccessful: false
    };
  }

  // 1. EXTRACTION OF TRANSACTION/RECEIPT ID
  // M-Pesa IDs are strictly 10 characters long, alphanumeric uppercase. Usually starts near string boundary.
  const receiptRegex = /\b([A-Z0-9]{10})\b/;
  const receiptMatch = receiptRegex.exec(cleanInput);
  const transactionId = receiptMatch ? receiptMatch[1] : `GEN-${Date.now().toString().slice(-6)}`;

  // 2. EXTRACTION OF MONETARY AMOUNT
  // Typical formats: "KES 2,000.00", "KES 5,500.00", "KES2000.00", "Ksh 10,000.00", "KES 2000"
  let amount = 0;
  const amountRegex = /(?:KES|Ksh|Ksh\s*|KES\s*)\s*([\d,]+(?:\.\d{2})?)/i;
  const amountMatch = amountRegex.exec(cleanInput);
  
  if (amountMatch) {
    amount = parseFloat(amountMatch[1].replace(/,/g, ''));
  } else {
    // Fallback: search for numbers with decimals that might be amounts (e.g. "received 2000 shillings")
    const fallbackPctRegex = /(?:received|amount|paid)\s*(?:of\s*)?([\d,]+(?:\.\d{2})?)/i;
    const fallbackMatch = fallbackPctRegex.exec(cleanInput);
    if (fallbackMatch) {
      amount = parseFloat(fallbackMatch[1].replace(/,/g, ''));
    } else {
      // Find any number with decimals or integer
      const simpleNumberRegex = /\b([\d,]{3,}(?:\.\d{2})?)\b/;
      const simpleMatch = simpleNumberRegex.exec(cleanInput);
      if (simpleMatch) {
        amount = parseFloat(simpleMatch[1].replace(/,/g, ''));
      }
    }
  }

  // 3. EXTRACTION OF DATE
  // Typical: "on 3/3/26", "on 12/04/2026", "on 25/3/26", "on 10th May 2026", etc.
  let dateStr = "";
  // Look for date structured like DD/MM/YY or DD/MM/YYYY
  const standardDateRegex = /(\d{1,2}\/\d{1,2}\/\d{2,4})/;
  // Look for written Date: e.g. "5th May 2026", "25 March 2026"
  const writtenDateRegex = /(\d{1,2}(?:st|nd|rd|th)?\s*(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[A-Za-z]*\s*\d{2,4})/i;
  // ISO date format YYYY-MM-DD
  const isoDateRegex = /(\d{4}-\d{2}-\d{2})/;

  const dateMatch = standardDateRegex.exec(cleanInput) || 
                    writtenDateRegex.exec(cleanInput) || 
                    isoDateRegex.exec(cleanInput);

  if (dateMatch) {
    dateStr = dateMatch[1] || dateMatch[0];
  } else {
    // If no date found, default to today's date
    dateStr = new Date().toLocaleDateString('en-GB');
  }

  // 4. EXTRACTION OF SENDER PHONE & NAME
  // Phone: digits starting with standard prefix or local zero
  const phoneRegex = /(?:\+?254|0)(7\d{8}|1\d{8})\b/;
  const phoneMatch = phoneRegex.exec(cleanInput);
  const senderPhone = phoneMatch ? phoneMatch[0] : undefined;

  // Name: typically captured after "received from" and before date or digits
  const senderNameRegex = /received\s+from\s+([A-Z\s]+?)(?:\s+\+?254|07|on\s+|$)/i;
  const nameMatch = senderNameRegex.exec(cleanInput);
  const senderName = nameMatch ? nameMatch[1].trim() : undefined;

  const isSuccessful = !!receiptMatch && amount > 0;

  return {
    transactionId,
    amount,
    dateStr,
    senderPhone,
    senderName,
    isSuccessful
  };
}
