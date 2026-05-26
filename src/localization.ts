/**
 * Weka Pan-African Multilingual Personalization Lexicon
 * Features: Amharic (Habesha Equb), Swahili (East Africa), Sheng (Nairobi Street), Yoruba (Naija Ajo), English, and custom Mashup vibe.
 */

export type LanguageMode = 'english' | 'swahili' | 'sheng' | 'yoruba' | 'amharic' | 'panAfrican';

export interface LocalizedTerms {
  appName: string;
  appSubtitle: string;
  assistantHeader: string;
  tagline: string;
  talkToAi: string;
  
  // Navigation
  tabDashboard: string;
  tabMembers: string;
  tabSavings: string;
  tabLoans: string;
  tabChamaAi: string;
  tabBylaws: string;
  
  // Stats
  savingsLabel: string;
  savingsDesc: string;
  loansLabel: string;
  loansDesc: string;
  floatLabel: string;
  floatDesc: string;
  fainiLabel: string;
  fainiDesc: string;
  utilLabel: string;
  utilDesc: string;
  
  // Dashboard & actions
  memberTable: string;
  quickActions: string;
  recentActivity: string;
  finesWarning: string;
  sendNudge: string;
  nudgeSent: string;
  
  // Members List
  addMemberTitle: string;
  memberNamePlaceholder: string;
  memberPhonePlaceholder: string;
  selectRole: string;
  enrollBtn: string;
  kycVerification: string;
  totalMembersCount: string;
  
  // Savings list / simulator
  ledgerHistory: string;
  ledgerDesc: string;
  manualEntryTitle: string;
  manualEntryDesc: string;
  bookSavingsBtn: string;
  mpesaSandboxTitle: string;
  mpesaSandboxDesc: string;
  triggerMpesaBtn: string;
  fuzzyReconcileTitle: string;
  fuzzyReconcileDesc: string;
  resolveMatchBtn: string;
  
  // Loans list
  creditLedgerTitle: string;
  creditLedgerDesc: string;
  disbursedDate: string;
  repaymentMaturity: string;
  repayInstallmentBtn: string;
  creditFacilityTitle: string;
  creditMultiplierDesc: string;
  maxEligibilityLabel: string;
  projectedInterestLabel: string;
  maturityOwedLabel: string;
  disburseApprovedBtn: string;
  
  // Interactive Simulator
  estimatorTitle: string;
  estimatorSubtitle: string;
  theoreticalPrincipalLabel: string;
  monthlyRepayLabel: string;
  amortizationTitle: string;
  applySimBtn: string;
  appliedMsg: string;
  resetCalcBtn: string;
  
  // General feedback / reset
  resetBtn: string;
  bylawsConstitutionTitle: string;
  bylawsSubtitle: string;
  clauseLabel: string;
  amendBtn: string;
  saveClauseBtn: string;
  shengChatTab: string;
  arbitratorTab: string;
  growthTab: string;
  chatInputPlaceholder: string;
  loanBookTitle: string;
  loanBookDesc: string;
  applyLoanTitle: string;
  applyLoanDesc: string;
  disburseLoanBtn: string;
}

export const localizationData: Record<LanguageMode, LocalizedTerms> = {
  english: {
    appName: "Weka",
    appSubtitle: "Chama Arbitrator",
    assistantHeader: "Autonomous Treasurer Assistant",
    tagline: "Autonomous ledger, real-time credit engine, and bilingual AI arbitrator to secure flat financial transparency.",
    talkToAi: "Talk to Chama AI",
    tabDashboard: "Dashboard",
    tabMembers: "Members",
    tabSavings: "Savings",
    tabLoans: "Credit Facility",
    tabChamaAi: "Chama AI",
    tabBylaws: "Bylaws",
    savingsLabel: "Michango (Savings)",
    savingsDesc: "Verified savings pool",
    loansLabel: "Mikopo Out (Loans)",
    loansDesc: "Active interest assets",
    floatLabel: "Available Float",
    floatDesc: "Idle capital in bank/M-Pesa",
    fainiLabel: "Overdue Fines",
    fainiDesc: "Late payment flags active",
    utilLabel: "Book Utilisation",
    utilDesc: "Active-loan-to-savings ratio",
    memberTable: "Chama Roster & Standing",
    quickActions: "Quick Dispatch Actions",
    recentActivity: "Recent Ledger Feeds",
    finesWarning: "Member has active flat penalties for missing month's cycle!",
    sendNudge: "Send Alert Nudge",
    nudgeSent: "Nudge successfully dispatched",
    addMemberTitle: "Enroll New Chama Member",
    memberNamePlaceholder: "e.g. Mary Atieno",
    memberPhonePlaceholder: "e.g. 0712345678",
    selectRole: "Assign Board Role",
    enrollBtn: "Enroll Member",
    kycVerification: "Daraja C2B KYC Validation Approved",
    totalMembersCount: "Total Registered Voters",
    ledgerHistory: "Ledger History",
    ledgerDesc: "Audit logs of all validated monthly contribution activities",
    manualEntryTitle: "Manual Entry Log",
    manualEntryDesc: "Book savings for cash deposits or bank transfers",
    bookSavingsBtn: "Book Savings Entry",
    mpesaSandboxTitle: "Daraja webhook Sandbox",
    mpesaSandboxDesc: "Test real-time C2B API callbacks and fuzzy reconciliation",
    triggerMpesaBtn: "Trigger M-Pesa Event",
    fuzzyReconcileTitle: "Fuzzy Reconciliation Queue",
    fuzzyReconcileDesc: "Safaricom C2B callbacks having unmatched names or phone deviations",
    resolveMatchBtn: "Resolve Match",
    creditLedgerTitle: "Core Credit Ledger",
    creditLedgerDesc: "Outstanding active and archived loan books with flat interest rates",
    disbursedDate: "DISBURSED",
    repaymentMaturity: "MATURITY",
    repayInstallmentBtn: "Repay Installment",
    creditFacilityTitle: "Credit Facility Request",
    creditMultiplierDesc: "Model credit limits under the strict 3x savings multiplier rule",
    maxEligibilityLabel: "Max eligibility (3x cap):",
    projectedInterestLabel: "Total Interest Payable:",
    maturityOwedLabel: "Repayment Maturity Owed:",
    disburseApprovedBtn: "Disburse Approved Loan",
    estimatorTitle: "Interactive Estimator",
    estimatorSubtitle: "Model payments & see schedule prior to applying",
    theoreticalPrincipalLabel: "Theoretical Principal (KES)",
    monthlyRepayLabel: "Est. Monthly Repay:",
    amortizationTitle: "Monthly Installment Run",
    applySimBtn: "Apply Simulation to Form",
    appliedMsg: "Applied parameters!",
    resetCalcBtn: "Clear Model",
    resetBtn: "Reset Demo State",
    bylawsConstitutionTitle: "Group Constitution Laws",
    bylawsSubtitle: "Active registered regulatory clauses ruling contributions, loan caps, and local fines.",
    clauseLabel: "Clause",
    amendBtn: "Amend Clause",
    saveClauseBtn: "Save Clause",
    shengChatTab: "Sheng Chat",
    arbitratorTab: "Arbitrator",
    growthTab: "Growth AI",
    chatInputPlaceholder: "Ask anything in Sheng, Swahili, or English...",
    loanBookTitle: "Loan Directory Book",
    loanBookDesc: "Outstanding active and historical group credit obligations",
    applyLoanTitle: "Request New Credit Line",
    applyLoanDesc: "Lock principal and submit to core approval cycle",
    disburseLoanBtn: "Disburse Approved Loan"
  },
  swahili: {
    appName: "Weka",
    appSubtitle: "Mwamuzi wa Chama",
    assistantHeader: "Mwekahazina Msaidizi wa Kujitegemea",
    tagline: "Daftari huru, mfumo wa mikopo wa papo hapo, na mwamuzi mwerevu aliyejengwa kwa ajili ya uwazi wa kifedha.",
    talkToAi: "Ongea na AI wa Chama",
    tabDashboard: "Ubao wa Kwanza",
    tabMembers: "Wanachama",
    tabSavings: "Michango",
    tabLoans: "Mikopo na Akiba",
    tabChamaAi: "akili bandia (AI)",
    tabBylaws: "Sheria na Katiba",
    savingsLabel: "Michango ya Akiba",
    savingsDesc: "Hazina ya akiba iliyohakikiwa",
    loansLabel: "Mikopo Nje",
    loansDesc: "Rasilimali za mikopo zenye faida",
    floatLabel: "Fedha Zilizopo",
    floatDesc: "Mzunguko wa fedha benki/M-Pesa",
    fainiLabel: "Adhabu na Faini",
    fainiDesc: "Milolongo ya faini za kuchelewa",
    utilLabel: "Matumizi ya Mtaji",
    utilDesc: "Kiwango cha mikopo dhidi ya akiba",
    memberTable: "Orodha ya Wanachama na Hali zao",
    quickActions: "Hatua za Papo Hapo",
    recentActivity: "Miamala ya Hivi Karibuni",
    finesWarning: "Mwanachama ana faini ya mwezi kwa kukosa mzunguko!",
    sendNudge: "Tuma Kikumbusho",
    nudgeSent: "Kikumbusho kimetumwa vyema",
    addMemberTitle: "Sajili Mwanachama Mpya",
    memberNamePlaceholder: "Mfano: Mary Atieno",
    memberPhonePlaceholder: "Mfano: 0712345678",
    selectRole: "Chagua Cheo cha Bodi",
    enrollBtn: "Sajili Mwanachama",
    kycVerification: "Uthibitisho wa KYC Daraja Umekubaliwa",
    totalMembersCount: "Idadi ya Wapiga Kura",
    ledgerHistory: "Historia ya Daftari",
    ledgerDesc: "Kumbukumbu rasmi za michango ya kila mwezi iliyoidhinishwa",
    manualEntryTitle: "Ingiza Transaction kwa Mkono",
    manualEntryDesc: "Andika michango ya pesa taslimu au uhamisho wa benki",
    bookSavingsBtn: "Hifadhi Mchango Mpya",
    mpesaSandboxTitle: "Sandbox ya M-Pesa",
    mpesaSandboxDesc: "Jaribu miamala ya API ya C2B na usuluhishi wa majina",
    triggerMpesaBtn: "Anzisha Muamala wa M-Pesa",
    fuzzyReconcileTitle: "Msururu wa Usuluhishi Fuzzy",
    fuzzyReconcileDesc: "Miamala ya C2B iliyo na majina au nambari zisizolingana moja kwa moja",
    resolveMatchBtn: "Tatua Muunganisho",
    creditLedgerTitle: "Daftari Kuu la Mikopo",
    creditLedgerDesc: "Kumbukumbu za mikopo ya sasa na ya zamani yenye viwango vya riba maalumu",
    disbursedDate: "IMEKABIDHIWA",
    repaymentMaturity: "MAREJESHO LAZIMA",
    repayInstallmentBtn: "Lipa Sehemu ya Mkopo",
    creditFacilityTitle: "Ombi la Mkopo wa Chama",
    creditMultiplierDesc: "Mikopo inazingatia sheria kali ya mara tatu ya akiba ya mwanachama",
    maxEligibilityLabel: "Upeo wa kukopa (Muzidisho wa 3x):",
    projectedInterestLabel: "Riba Jumla ya Kulipwa:",
    maturityOwedLabel: "Jumla ya Rejesho:",
    disburseApprovedBtn: "Toa Mkopo Ulioidhinishwa",
    estimatorTitle: "Kikokotoo cha Mikopo",
    estimatorSubtitle: " somea makadirio ya malipo na ratiba kabla ya kuomba mkopo",
    theoreticalPrincipalLabel: "Kiasi cha Mkopo (KES)",
    monthlyRepayLabel: "Mrejesho wa Kila Mwezi:",
    amortizationTitle: "Mpangilio wa Marejesho",
    applySimBtn: "Weka Makadirio Kwenye Fomu",
    appliedMsg: "Vigezo vimewekwa kwenye fomu!",
    resetCalcBtn: "Safisha Kujaza",
    resetBtn: "Anza upya Mifumo yote",
    bylawsConstitutionTitle: "Katiba na Sheria za Kikundi",
    bylawsSubtitle: "Miongozo na vifungu vya katiba vinavyoamua michango, mikopo na faini za kikundi.",
    clauseLabel: "Kifungu",
    amendBtn: "Marekebisho ya Kifungu",
    saveClauseBtn: "Hifadhi Marekebisho",
    shengChatTab: "Mazungumzo ya Sheng",
    arbitratorTab: "Mwamuzi",
    growthTab: "Ukuaji wa AI",
    chatInputPlaceholder: "Uliza chochote katika Sheng, Kiswahili au Kiingereza...",
    loanBookTitle: "Kitabu cha Mikopo",
    loanBookDesc: "Kumbukumbu za mikopo ya sasa na ya zamani ya chama",
    applyLoanTitle: "Omba Mkopo Mpya",
    applyLoanDesc: "Weka kiasi na utume rasmi kwa bodi ya chama",
    disburseLoanBtn: "Toa Mkopo Ulioidhinishwa"
  },
  sheng: {
    appName: "Weka",
    appSubtitle: "Mulam wa Chama",
    assistantHeader: "Mweka Ganji Otopilot",
    tagline: "Ledger ya otopilot, credit engine yenye rieng fiti, na mwamuzi mjanja kweli kuweka rada ya ganji wazi.",
    talkToAi: "Piga story na AI ya Chama",
    tabDashboard: "Rada Kuu",
    tabMembers: "Wasee",
    tabSavings: "Michango ya Ganji",
    tabLoans: "Kapital & Mkopo",
    tabChamaAi: "Chama AI",
    tabBylaws: "Sheria za Base",
    savingsLabel: "Michango (Savings pool)",
    savingsDesc: "Ganji imehakikishwa fiti",
    loansLabel: "Mikopo iko Nje",
    loansDesc: "Ganji inayozunguka sokoni",
    floatLabel: "Float ya Chapchap",
    floatDesc: "Ganji idle kwa bank au M-PESA",
    fainiLabel: "Adhabu na Faini",
    fainiDesc: "Faini za kupitisha dedla",
    utilLabel: "Matumizi ya Chapa",
    utilDesc: "Ratio ya mikopo dhidi ya michango",
    memberTable: "List ya Wasee na Rada zao",
    quickActions: "Tuma Nudges Chapchap",
    recentActivity: "Kumbukumbu za Ganji",
    finesWarning: "Msee amepitisha dedla ana faini ya kupigwa faini!",
    sendNudge: "Tuma Nudge/Kumbusha",
    nudgeSent: "Nudge imefika chapchap",
    addMemberTitle: "Enroll Msee Mpya kwa Chama",
    memberNamePlaceholder: "Ataitwa nani: e.g. Mary Atieno",
    memberPhonePlaceholder: "Nambari ya msee: e.g. 0712345678",
    selectRole: "Peana Job kwa Chama",
    enrollBtn: "Sajili Msee",
    kycVerification: "KYC kutoka Daraja iko rada safi",
    totalMembersCount: "Idadi ya wanachama wote",
    ledgerHistory: "Audit ya Ganji",
    ledgerDesc: "Audit fiti ya mwanzo hadi sasa ya kila round ya mchango",
    manualEntryTitle: "Book Transaction na Mkono",
    manualEntryDesc: "Weka michango ya cash au transfer ya bank",
    bookSavingsBtn: "Hifadhi Akiba Sasa",
    mpesaSandboxTitle: "Sandbox ya M-PESA webhook",
    mpesaSandboxDesc: "Test fuzzy matching ya majina na muamala wa sandbox",
    triggerMpesaBtn: "Simulate event ya M-Pesa",
    fuzzyReconcileTitle: "Msururu wa Reconcile Fuzzy",
    fuzzyReconcileDesc: "M-PESA transaction zenye majina haziko fiti au phone divergent",
    resolveMatchBtn: "Tatua na Unganisha",
    creditLedgerTitle: "Daftari Kuu ya Deni",
    creditLedgerDesc: "Kumbuka madeni yote yanayotakiwa kulipwa sasa na riba zake",
    disbursedDate: "IMEPEANWA",
    repaymentMaturity: "DEDLA YA KULIPA",
    repayInstallmentBtn: "Lipa Deni Sasa",
    creditFacilityTitle: "Saka Mkopo Wetu",
    creditMultiplierDesc: "Mkopo ni siri ya 3x ya akiba yako yote uliyoweka",
    maxEligibilityLabel: "Upeo wa limit (Mara 3 ya akiba):",
    projectedInterestLabel: "Riba yote utalipa:",
    maturityOwedLabel: "Jumla utakayorejesha:",
    disburseApprovedBtn: "Toa Mkopo weka Ganji",
    estimatorTitle: "Kikokotoo chenye Spark",
    estimatorSubtitle: "Piga mahesabu yote ya marejesho kabla ya apply",
    theoreticalPrincipalLabel: " theoretical Ganji (KES)",
    monthlyRepayLabel: "Mrejesho wa mwezi:",
    amortizationTitle: "Instalments za Kila Mwezi",
    applySimBtn: "Weka Hesabu Kwenye Fomu",
    appliedMsg: "Rada safi, hesabu iko kwenye fomu sasa!",
    resetCalcBtn: "Suka Upya Simulator",
    resetBtn: "Reset Chama kuanza upya",
    bylawsConstitutionTitle: "Sheria Muhimu za Base",
    bylawsSubtitle: "Vifungu na sheria za dhati zinazogovern kupandisha akiba, mikopo, na faini za kuchelewa.",
    clauseLabel: "Klosi",
    amendBtn: "Marekebisho ya Klosi",
    saveClauseBtn: "Hifadhi Klosi",
    shengChatTab: "Sheng Chat",
    arbitratorTab: "Mulam",
    growthTab: "Growth AI",
    chatInputPlaceholder: "Uliza swali yoyote kuhusu chapaa...",
    loanBookTitle: "Daftari ya Deni",
    loanBookDesc: "Madeni yote wasee wanatakiwa kulipa chapchap",
    applyLoanTitle: "Saka Mkopo Mpya",
    applyLoanDesc: "Weka kiasi ya ganji unadai na utume rieng",
    disburseLoanBtn: "Peana Mkopo Sasa"
  },
  yoruba: {
    appName: "Weka",
    appSubtitle: "Agbẹjọro Agbajo",
    assistantHeader: "Aṣoju Iṣura Egbe Alase",
    tagline: "Iwe ifipamọ adase, ẹrọ kirẹditi gidi, ati alagbawi AI ti yoo rii daju pe ṣiṣalaye eto inawo rọrun.",
    talkToAi: "Sọrọ pẹlu AI ti Egbe",
    tabDashboard: "Oju-iwe Inawo",
    tabMembers: "Awọn Ọmọ Ẹgbẹ",
    tabSavings: "Ajo / Idogo",
    tabLoans: "Gbigbe Kirẹditi",
    tabChamaAi: "Chama AI Oracle",
    tabBylaws: "Bylaws",
    savingsLabel: "Idogo (Michango Pool)",
    savingsDesc: "Gbogbo Owo Idogo ti a fọwọsi",
    loansLabel: "Awọn Awin Jade (Gbese)",
    loansDesc: "Gbogbo Owo awin ti o wa ni ita",
    floatLabel: "Iwọn Owo to Wa",
    floatDesc: "Idalẹnu owo ni banki tabi M-Pesa",
    fainiLabel: "Ijiya Ijẹrin t’olubajẹ",
    fainiDesc: "Awọn ijiya ti n ṣiṣẹ lọwọlọwọ",
    utilLabel: "Lilo Owo Pool",
    utilDesc: "Iwọn owo awin si idogo",
    memberTable: "Atokọ Ọmọ Ẹgbẹ & Iduro Wọn",
    quickActions: "Gbogbo Awọn Igbesẹ Iyara",
    recentActivity: "Atokọ Awọn Iṣowo T’ẹnu lọwọ",
    finesWarning: "Ọmọ ẹgbẹ yii ni ijiya owo fun sisun idogo!",
    sendNudge: "Tẹ Alaye leti",
    nudgeSent: "A ti firanṣẹ leti ni aṣeyọri",
    addMemberTitle: "Forukọsilẹ Ọmọ Ẹgbẹ Tuntun",
    memberNamePlaceholder: "Apẹẹrẹ: Mary Atieno",
    memberPhonePlaceholder: "Apẹẹrẹ: 0712345678",
    selectRole: "Fi Ipo Bodi Kan Lẹhin",
    enrollBtn: "Forukọsilẹ Bayi",
    kycVerification: "Daraja C2B KYC Ifọwọsi Agbára",
    totalMembersCount: "Apapọ Awọn Oludibo",
    ledgerHistory: "Atokọ Awọn Iṣowo Gbogbo",
    ledgerDesc: "Itan awọn idogo oṣooṣu ti a ṣayẹwo ati fọwọsi",
    manualEntryTitle: "Gbigbe Iforukọsilẹ pẹlu Ọwọ",
    manualEntryDesc: "Forukọsilẹ idogo fun owo t’olubajẹ tabi banki",
    bookSavingsBtn: "Fi Owo Idogo pamọ",
    mpesaSandboxTitle: "Sandbox M-Pesa",
    mpesaSandboxDesc: "Ṣe idanwo awọn iṣẹ API C2B ati atunyẹwo orukọ",
    triggerMpesaBtn: "Bẹrẹ Idanwo M-Pesa",
    fuzzyReconcileTitle: "Msururu atunyẹwo orukọ ati fo",
    fuzzyReconcileDesc: "Miamala C2B t’olubajẹ pẹlu orukọ tabi nọmba ti ko baramu",
    resolveMatchBtn: "Yanju orukọ",
    creditLedgerTitle: "Atokọ Awọn Kirẹditi Gbogbo",
    creditLedgerDesc: "Itan awọn awin ti o wa lọwọ ati ti a ti sanpada",
    disbursedDate: "DISBURSED",
    repaymentMaturity: "MATURITY DUE",
    repayInstallmentBtn: "San Diẹ ninu Awin",
    creditFacilityTitle: "Ibora Awọn Awin Ẹgbẹ",
    creditMultiplierDesc: "Koodu awin ni ibamu pẹlu ofin multiplier 3x lori idogo rẹ",
    maxEligibilityLabel: "Iwọn awin ti o pọju (3x lori Idogo):",
    projectedInterestLabel: "Apapọ Elemọto ti yoo san:",
    maturityOwedLabel: "Apapọ Iyipada ti a yoo pada owo rẹ:",
    disburseApprovedBtn: "Fi Owo Awin Yi Jade",
    estimatorTitle: "Olùṣirò Awin Pataki",
    estimatorSubtitle: "Wo iṣeto reaches and parameters rẹ ṣaaju ki o to beere awin",
    theoreticalPrincipalLabel: "Kiyesi Owo Awin (KES)",
    monthlyRepayLabel: "Mrejesho lẹyin oṣu kọọkan:",
    amortizationTitle: "Iṣeto San-gangan",
    applySimBtn: "Waye Simulation si Fọọmu",
    appliedMsg: "A ti rù si fọọmu ni aṣeyọri!",
    resetCalcBtn: "Nu Olùṣirò nu",
    resetBtn: "Tun gbogbo nkan bẹrẹ",
    bylawsConstitutionTitle: "Ofin Iwe-Ofin Gbogbo",
    bylawsSubtitle: "Awọn ofin ti o wa fun sisanwo idogo ati gbigba faini ati awin.",
    clauseLabel: "Ofin",
    amendBtn: "Tun ofin ṣe",
    saveClauseBtn: "Fipamọ Ofin Yi",
    shengChatTab: "Ifọrọwanilẹnuwo",
    arbitratorTab: "Agbẹjọro",
    growthTab: "Idagbasoke AI",
    chatInputPlaceholder: "Beere ohunkohun nipa owo...",
    loanBookTitle: "Atokọ Awọn Gbigbe",
    loanBookDesc: "Atokọ awọn awin ti o wa ni ita lọwọlọwọ",
    applyLoanTitle: "Beere fun Awin",
    applyLoanDesc: "Fi koodu owo gbigba rẹ ranṣẹ fun ifọwọsi",
    disburseLoanBtn: "Fi Owo Awin Jade"
  },
  amharic: {
    appName: "Weka",
    appSubtitle: "የእቁብ ዳኛ (Arbitrator)",
    assistantHeader: "ራሱን የቻለ የሂሳብ ሀላፊ AI",
    tagline: "ሙሉ በሙሉ ራሱን የቻለ የእቁብ መዝገብ፡ የብድር አስተዳደርና የደንብ ዳኝነት የሚሰጥ ድንቅ አርቴፊሻል ኢንተለጀንስ።",
    talkToAi: "ከእቁብ AI ጋር ይወያዩ",
    tabDashboard: "ዳሽቦርድ",
    tabMembers: "አባላት",
    tabSavings: "እቁብ መዋጮ",
    tabLoans: "የብድር አገልግሎት",
    tabChamaAi: "እቁብ AI ረዳት",
    tabBylaws: "የእቁብ ደንቦች",
    savingsLabel: "ጠቅላላ የእቁብ መዋጮ",
    savingsDesc: "የተረጋገጠ የእቁብ መዋጮ ክምችት",
    loansLabel: "በእጅ ያለ ብድር (Loans)",
    loansDesc: "ገባሪ የብድር ሀብቶች",
    floatLabel: "አሁን ያለ ቀሪ ገንዘብ (Float)",
    floatDesc: "በባንክ ወይም በእጅ ያለ ቀሪ ፈሰስ",
    fainiLabel: "ያልተከፈለ ቅጣትና እዳ",
    fainiDesc: "ወቅታዊ የደንብ መተላለፍ ቅጣቶች",
    utilLabel: "የብድር ስርጭት መቶኛ",
    utilDesc: "ክምችቱን ጥቅም ላይ የማዋል መጠን",
    memberTable: "የእቁብ አባላት ስም ዝርዝርና ደረጃ",
    quickActions: "ፈጣን መልእክት ማስተላለፊያ",
    recentActivity: "የቅርብ ጊዜ መዝገቦች",
    finesWarning: "ይህ አባል የእቁብ መዋጮ ቀን በማሳለፉ ምክንያት ቅጣት አለበት!",
    sendNudge: "ቀስቃሽ ማስታወሻ ላክ",
    nudgeSent: "ቀስቃሽ መልእክት በተሳካ ሁኔታ ተልኳል",
    addMemberTitle: "አዲስ የእቁብ አባል ይመዝግቡ",
    memberNamePlaceholder: "ምሳሌ፦ ማርያም አቲየኖ",
    memberPhonePlaceholder: "ምሳሌ፦ 0712345678",
    selectRole: "የእቁብ አመራር ሚና ይመድቡ",
    enrollBtn: "አባሉን መዝግብ",
    kycVerification: "የKYC ማንነት ማረጋገጫ በተሳካ ሁኔታ ጸድቋል",
    totalMembersCount: "አጠቃላይ ድምፅ ሰጪዎች",
    ledgerHistory: "የመዋጮዎች መዝገብ ታሪክ",
    ledgerDesc: "እስካሁን የተደረጉ እና የተረጋገጡ የመዋጮ ታሪኮች ዝርዝር ኦዲት",
    manualEntryTitle: "በእጅ መዝገብ ማስፈሪያ",
    manualEntryDesc: "በባንክ ወይም በእጅ የገባን ተቀማጭ እዚህ ይመዝግቡ",
    bookSavingsBtn: "መዋጮውን መዝግብ",
    mpesaSandboxTitle: "M-Pesa የሙከራ ሳጥን",
    mpesaSandboxDesc: "እውነተኛ ፈጣን የC2B API የሙከራ ክፍያ እና የስም ማዛመድ ሙከራ",
    triggerMpesaBtn: "ክፍያውን አስጀምር (Simulate)",
    fuzzyReconcileTitle: "ተለዋዋጭ የስም ስምምነት ወረፋ",
    fuzzyReconcileDesc: "በከፊል የስም ወይም የስልክ መለያየት ያለባቸው ክፍያዎችን መልሰው ያዛምዱ",
    resolveMatchBtn: "ማንነቱን አዛምድ",
    creditLedgerTitle: "ዋና የብድር መዝገብ ታሪክ",
    creditLedgerDesc: "በእቁብ አባላት የተወሰዱ ንቁ እና ያለፉ የብድር ታሪኮች",
    disbursedDate: "የተሰጠበት ቀን",
    repaymentMaturity: "የማለቂያ ቀን እዳ",
    repayInstallmentBtn: "ብድር መልስ",
    creditFacilityTitle: "አዲስ የብድር ጥያቄ",
    creditMultiplierDesc: "ብድር የሚፈቀደው የአባሉ መዋጮ የ3 እጥፍ ጣራ ህግን መሰረት አድርጎ ብቻ ነው",
    maxEligibilityLabel: "ከፍተኛው የብድር ፈቃድ ጣራ (የ3 እጥፍ ህግ)፦",
    projectedInterestLabel: "አጠቃላይ በብድሩ ላይ የሚከፈል ወለድ፦",
    maturityOwedLabel: "ጠቅላላ ተመላሽ የሚደረግ ሂሳብ፦",
    disburseApprovedBtn: "ብድሩን ፍቀድና ክፈል",
    estimatorTitle: "የብድር ክፍያ መመጠኛና ማስያ",
    estimatorSubtitle: "ብድሩን ከመውሰድዎ በፊት ወርሃዊ ክፍያን እዚህ ይገምግሙ",
    theoreticalPrincipalLabel: "የብድር መጠን (KES)",
    monthlyRepayLabel: "ወርሃዊ ተመላሽ ሂሳብ፦",
    amortizationTitle: "የወርሃዊ ክፍያዎች ስርጭት",
    applySimBtn: "ይህን መረጃ ወደ ብድር ፎርም አስገባ",
    appliedMsg: "መረጃው በተሳካ ሁኔታ ወደ ፎርሙ ተላልፏል!",
    resetCalcBtn: "ካርድ አጽዳ",
    resetBtn: "ስርዓቱን ወደ መጀመሪያ መልስ (Reset)",
    bylawsConstitutionTitle: "የእቁብ ደንቦችና መመሪያዎች",
    bylawsSubtitle: "መዋጮዎችን፡ የብድር ወለድን እና ቅጣቶችን የሚደነግጉ የጋራ መመሪያዎች።",
    clauseLabel: "አንቀጽ",
    amendBtn: "አንቀጹን አሻሽል",
    saveClauseBtn: "አንቀጹን አጽና",
    shengChatTab: "የእቁብ ውይይት",
    arbitratorTab: "ዳኛ (Arbitrator)",
    growthTab: "የእድገት AI",
    chatInputPlaceholder: "አጠቃላይ በእቁቡ ዙሪያ የሚፈልጉትን እዚህ ይጠይቁ...",
    loanBookTitle: "የብድር መዝገብ ታሪክ",
    loanBookDesc: "በአባላት እጅ ላይ ያሉ ገባሪ ብድሮች ዝርዝር",
    applyLoanTitle: "አዲስ የብድር ጥያቄ",
    applyLoanDesc: "የመረጡትን የብድር መጠን ለኦዲትና ፍቃድ ያቅርቡ",
    disburseLoanBtn: "ብድሩን ፍቀድና ክፈል"
  },
  panAfrican: {
    appName: "Weka",
    appSubtitle: "Mwamuzi / Agbẹjọro / Equb Arbitrator",
    assistantHeader: "Treasurer Mwekahazina AI Oracle",
    tagline: "Selam & Ẹ n lẹ o! An autonomous ledger merging Habesha Equb, Naija Ajo, East African Chama Swahili, and Nairobi street Sheng with real-time AI arbitrator.",
    talkToAi: "Piga Story na Chama AI (እቁብ Oracle)",
    tabDashboard: "Ubao / Rada safi",
    tabMembers: "Wanachama / Wasee / Egbe",
    tabSavings: "Akiba / Idogo / እቁብ",
    tabLoans: "Kapital / Gbese (Loans)",
    tabChamaAi: "Chama AI Advice",
    tabBylaws: "Bylaws / Katiba",
    savingsLabel: "Michango (Savings / እቁብ)",
    savingsDesc: "Verified savings pool 🔒",
    loansLabel: "Mikopo Out (Gbese Pool)",
    loansDesc: "Active interest assets under orbit",
    floatLabel: "Float (Ganji Kibindoni)",
    floatDesc: "Idle capital in bank/M-Pesa/Birr",
    fainiLabel: "Late Faini (የደንብ ቅጣት)",
    fainiDesc: "Late flags active - Gbese hazard!",
    utilLabel: "Capital Orbit Rate",
    utilDesc: "Active loans to accumulated pool ratio",
    memberTable: "Chama Roster, Standing & Egbe status",
    quickActions: "Tuma Nudges Chapchap (Naija/Habesha style)",
    recentActivity: "Miamala / Feeds of Ajo & Equb",
    finesWarning: "Msee or Egbe partner is overdue! Active flat penalties for missing month's cycle!",
    sendNudge: "Ping Msee (Tuma Nudge)",
    nudgeSent: "Rada safi: Nudge successfully dispatched to partner!",
    addMemberTitle: "Enroll New Partner (Sajili Oga/Gobez)",
    memberNamePlaceholder: "Ataitwa nani / Oruga name: e.g. Mary Atieno",
    memberPhonePlaceholder: "Phonenumber ya msee / Phone count: e.g. 0712345678",
    selectRole: "peana Chama Role / Egbe Post",
    enrollBtn: "Enroll Partner (Sajili Oga)",
    kycVerification: "Daraja C2B KYC Validation Rada Safi 🔥",
    totalMembersCount: "Total voters in Egbe roster",
    ledgerHistory: "Audit History of Equb / Ajo",
    ledgerDesc: "Audit logs of all validated monthly contribution activities (Michango / እቁብ)",
    manualEntryTitle: "Manual Entry (Book na Mkono)",
    manualEntryDesc: "Book savings for cash deposits, bank transfers or physical handovers",
    bookSavingsBtn: "Book Savings (Weka Akiba/እቁብ)",
    mpesaSandboxTitle: "Daraja C2B API Sandbox Event",
    mpesaSandboxDesc: "Test fuzzy matching of names (Mary A Atieno / ATIENO) & real-time webhook",
    triggerMpesaBtn: "Trigger M-Pesa Simulated Callback",
    fuzzyReconcileTitle: "Fuzzy Reconciliation (የስም ማዛመድ ወረፋ)",
    fuzzyReconcileDesc: "Safaricom API callbacks whose registered names or phones do not align exactly with Ajo database register",
    resolveMatchBtn: "Resolve Match (ማንነቱን አዛምድ)",
    creditLedgerTitle: "Core Credit Ledger (የእዳ ዝርዝር)",
    creditLedgerDesc: "Outstanding active loans & archived books with flat monthly interest rules",
    disbursedDate: "DISBURSED (እቁብ ወጣ)",
    repaymentMaturity: "MATURITY DEDLA",
    repayInstallmentBtn: "Lipa instalments / Gbese",
    creditFacilityTitle: "Credit Facility (Omba Kapital / 3x Rule)",
    creditMultiplierDesc: "Model credit limits under the strict 3x savings multiplier rule (እቁብ / Chama code)",
    maxEligibilityLabel: "Max eligibility (3x capital cap):",
    projectedInterestLabel: "Projected Interest (Faida):",
    maturityOwedLabel: "Repayment Due (Gbese sum):",
    disburseApprovedBtn: "Disburse Approved Capital (እቁብ ክፈል)",
    estimatorTitle: "Interactive Estimator (Kikokotoo Spark)",
    estimatorSubtitle: "Model repayments & see amortization runs before applying",
    theoreticalPrincipalLabel: "Theoretical Principal (KES / Birr / Naira)",
    monthlyRepayLabel: "Monthly Repay Estimate:",
    amortizationTitle: "Monthly Amortization Schedule (የክፍያ ስርጭት)",
    applySimBtn: "Apply Simulation parameters to application form",
    appliedMsg: "Applied! parameters are ready in form context",
    resetCalcBtn: "Clear Estimator (Suka Upya)",
    resetBtn: "Reset Chama State (Kurudisha Mifumo)",
    bylawsConstitutionTitle: "Constitution & Katiba Bylaws",
    bylawsSubtitle: "Active registered regulatory clauses (Vifungu) ruling contributions, loan multipliers, and faini.",
    clauseLabel: "Clause (አንቀጽ)",
    amendBtn: "Amend Clause (Marekebisho)",
    saveClauseBtn: "Save Clause (አጽና)",
    shengChatTab: "Sheng / Ajo Chat",
    arbitratorTab: "Arbitrator / Agbẹjọro",
    growthTab: "Growth / Portfolio AI",
    chatInputPlaceholder: "Ask any question / Uliza chochote katika Sheng, Swahili, Amharic or Yoruba...",
    loanBookTitle: "Credit & Gbese Directory",
    loanBookDesc: "Audit logs of outstanding active loan books with flat interest rules",
    applyLoanTitle: "Request New Credit Line (Omba Kapital)",
    applyLoanDesc: "Submit simulation parameters to the chama core ledger context",
    disburseLoanBtn: "Disburse Approved Capital (እቁብ ክፈል)"
  }
};
