import type {
  ComplianceFramework,
  ControlHealth,
  CurrencyCode,
  CurrencyMeta,
  ExchangeRates,
  ForecastInsight,
  ForecastPoint,
  Integration,
  MapMarker,
  NavItem,
  PageMeta,
  RecommendedControl,
  RiskContributor,
  RiskScenario,
  RiskScoreSummary,
  TimeFilter,
  UserProfile,
  Vulnerability,
  WhatIfLever,
} from '../types'

/* ------------------------------------------------------------------ */
/* Currency                                                            */
/* ------------------------------------------------------------------ */

export const currencyBase: CurrencyCode = 'INR'

const inrCurrency: CurrencyMeta = {
  code: 'INR',
  name: 'Indian Rupee',
  symbol: '₹',
  locale: 'en-IN',
  units: 'indian',
}

export const currencies: CurrencyMeta[] = [
  inrCurrency,
  { code: 'USD', name: 'US Dollar', symbol: '$', locale: 'en-US', units: 'international' },
  { code: 'EUR', name: 'Euro', symbol: '€', locale: 'de-DE', units: 'international' },
  { code: 'GBP', name: 'British Pound', symbol: '£', locale: 'en-GB', units: 'international' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', locale: 'en-AE', units: 'international' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', locale: 'en-SG', units: 'international' },
]

export const defaultCurrency: CurrencyMeta = inrCurrency

/**
 * Indicative offline rates — units of currency per 1 INR.
 * Used before the live rate request resolves and whenever it fails.
 */
export const fallbackRates: ExchangeRates = {
  INR: 1,
  USD: 0.0118,
  EUR: 0.0109,
  GBP: 0.0093,
  AED: 0.0433,
  SGD: 0.0159,
}

/** Free, keyless FX endpoint — rates are expressed per 1 INR. */
export const exchangeRateEndpoint = 'https://open.er-api.com/v6/latest/INR'

/* ------------------------------------------------------------------ */
/* Navigation                                                          */
/* ------------------------------------------------------------------ */

export const navItems: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', to: '/dashboard' },
  { key: 'risk-register', label: 'Risk Register', to: '/risk-register', badge: 24 },
  { key: 'vulnerabilities', label: 'Vulnerabilities', to: '/vulnerabilities', badge: 137 },
  { key: 'what-if', label: 'What-If Scenarios', to: '/what-if' },
  { key: 'optimizer', label: 'Investment Optimizer', to: '/optimizer' },
  { key: 'compliance', label: 'Compliance', to: '/compliance' },
  { key: 'integrations', label: 'Integrations', to: '/integrations' },
]

export const pageMeta: Record<string, PageMeta> = {
  dashboard: {
    title: 'Dashboard',
    subtitle: 'Enterprise cyber risk posture — live quantification',
  },
  'risk-register': {
    title: 'Risk Register',
    subtitle: 'Quantified loss scenarios across the estate',
  },
  vulnerabilities: {
    title: 'Vulnerabilities',
    subtitle: 'CVEs ranked by financial contribution',
  },
  'what-if': {
    title: 'What-If Scenarios',
    subtitle: 'Model the financial impact of control changes',
  },
  optimizer: {
    title: 'Investment Optimizer',
    subtitle: 'Where to spend the next rupee of defence budget',
  },
  compliance: {
    title: 'Compliance',
    subtitle: 'Control coverage against global frameworks',
  },
  integrations: {
    title: 'Integrations',
    subtitle: 'Connected data sources feeding the model',
  },
}

export const userProfile: UserProfile = {
  name: 'Ananya Rao',
  role: 'CISO · Meridian Financial',
  initials: 'AR',
}

/* ------------------------------------------------------------------ */
/* Enterprise risk score                                                */
/* ------------------------------------------------------------------ */

export const controlHealth: ControlHealth[] = [
  { name: 'MFA', status: 'strong', coverage: 98, detail: '98% of identities enforced' },
  { name: 'Patching', status: 'partial', coverage: 71, detail: 'SLA breached on 42 hosts' },
  { name: 'EDR', status: 'strong', coverage: 94, detail: '1,412 of 1,502 endpoints' },
  { name: 'Firewall', status: 'strong', coverage: 99, detail: 'Perimeter + east-west' },
  { name: 'Encryption', status: 'partial', coverage: 63, detail: 'Legacy DBs unencrypted' },
  { name: 'Backup', status: 'weak', coverage: 48, detail: '2 restore tests failed' },
]

export const riskScore: RiskScoreSummary = {
  score: 68,
  delta: -4.2,
  bandLabel: 'High',
  financialExposure: 4_820_000_000,
  expectedAnnualLoss: 128_400_000,
  valueAtRisk95: 310_000_000,
  controls: controlHealth,
}

/* ------------------------------------------------------------------ */
/* AI risk forecast                                                    */
/* ------------------------------------------------------------------ */

const forecastMonths = [
  'Oct 25',
  'Nov 25',
  'Dec 25',
  'Jan 26',
  'Feb 26',
  'Mar 26',
  'Apr 26',
  'May 26',
  'Jun 26',
  'Jul 26',
  'Aug 26',
  'Sep 26',
]

const actualSeries: Array<number | null> = [74, 72, 73, 70, 71, 67, 69, 66, 64, null, null, null]
const predictedSeries: Array<number | null> = [null, null, null, null, null, 68, 66, 65, 63, 61, 58, 56]
const confidenceByIndex = [42, 44, 47, 50, 54, 58, 62, 67, 72, 78, 84, 88]

export const forecastSeries: ForecastPoint[] = forecastMonths.map((date, index) => {
  const predicted = predictedSeries[index] ?? null
  const actual = actualSeries[index] ?? null
  const band = predicted ?? actual ?? 0
  const spread = (100 - band) * 0.42 + 3

  return {
    date,
    actual,
    predicted,
    lower: Math.max(0, band - spread),
    upper: Math.min(100, band + spread),
    confidence: confidenceByIndex[index] ?? 0,
  }
})

export const forecastInsight: ForecastInsight = {
  headline: 'AI Insight',
  accent: 'blue',
  body:
    'Residual risk is projected to fall from 64 to 56 over 90 days at the current remediation velocity. ' +
    'Closing the encryption backlog on the 3 legacy databases alone removes ₹18.2 Cr from expected annual loss, ' +
    'while the 42 MFA-adjacent endpoints past patch SLA are the single largest driver of the March–April uptick. ' +
    'Confidence on the 6-month horizon is 84%.',
}

/* ------------------------------------------------------------------ */
/* Top risk contributors                                               */
/* ------------------------------------------------------------------ */

export const riskContributors: RiskContributor[] = [
  {
    id: 'RC-01',
    asset: 'Core Banking — DC-1',
    businessUnit: 'Retail Banking',
    securityScore: 42,
    exposure: 1_240_000_000,
    threat: 'red',
    threatLabel: 'Ransomware',
    pendingFixes: 38,
  },
  {
    id: 'RC-02',
    asset: 'Payment Switch',
    businessUnit: 'Payments',
    securityScore: 55,
    exposure: 860_000_000,
    threat: 'red',
    threatLabel: 'Zero-Day',
    pendingFixes: 12,
  },
  {
    id: 'RC-03',
    asset: 'Customer Data Lake',
    businessUnit: 'Data & Analytics',
    securityScore: 61,
    exposure: 640_000_000,
    threat: 'amber',
    threatLabel: 'Data Exfil',
    pendingFixes: 27,
  },
  {
    id: 'RC-04',
    asset: 'Trading Platform',
    businessUnit: 'Capital Markets',
    securityScore: 74,
    exposure: 480_000_000,
    threat: 'amber',
    threatLabel: 'Credential Stuffing',
    pendingFixes: 9,
  },
  {
    id: 'RC-05',
    asset: 'Branch VPN Fabric',
    businessUnit: 'Infrastructure',
    securityScore: 81,
    exposure: 295_000_000,
    threat: 'blue',
    threatLabel: 'Phishing',
    pendingFixes: 6,
  },
  {
    id: 'RC-06',
    asset: 'HR & Payroll Cloud',
    businessUnit: 'People Ops',
    securityScore: 88,
    exposure: 120_000_000,
    threat: 'blue',
    threatLabel: 'Insider',
    pendingFixes: 3,
  },
]

/* ------------------------------------------------------------------ */
/* Global threat map                                                  */
/* ------------------------------------------------------------------ */

export const mapMarkers: MapMarker[] = [
  { id: 'M-1', label: 'Singapore DC', lon: 103.82, lat: 1.35, severity: 'critical', value: 1_240_000_000, events: 42 },
  { id: 'M-2', label: 'Mumbai DC-1', lon: 72.88, lat: 19.08, severity: 'critical', value: 860_000_000, events: 38 },
  { id: 'M-3', label: 'Frankfurt', lon: 8.68, lat: 50.11, severity: 'high', value: 480_000_000, events: 21 },
  { id: 'M-4', label: 'Virginia', lon: -77.5, lat: 38.5, severity: 'high', value: 640_000_000, events: 27 },
  { id: 'M-5', label: 'São Paulo', lon: -46.63, lat: -23.55, severity: 'medium', value: 295_000_000, events: 14 },
  { id: 'M-6', label: 'Sydney', lon: 151.21, lat: -33.87, severity: 'medium', value: 120_000_000, events: 9 },
  { id: 'M-7', label: 'Dubai', lon: 55.27, lat: 25.2, severity: 'medium', value: 210_000_000, events: 11 },
  { id: 'M-8', label: 'Toronto', lon: -79.38, lat: 43.65, severity: 'low', value: 86_000_000, events: 4 },
  { id: 'M-9', label: 'Johannesburg', lon: 28.05, lat: -26.2, severity: 'low', value: 64_000_000, events: 3 },
  { id: 'M-10', label: 'Tokyo', lon: 139.69, lat: 35.68, severity: 'low', value: 52_000_000, events: 2 },
]

export const timeFilters: TimeFilter[] = [
  { key: 'ALL', label: 'ALL' },
  { key: '1D', label: '1D' },
  { key: '1W', label: '1W' },
  { key: '1M', label: '1M' },
  { key: '3M', label: '3M' },
]

export const mapTotals: Record<string, { events: number; value: number }> = {
  ALL: { events: 171, value: 4_045_000_000 },
  '1D': { events: 14, value: 1_240_000_000 },
  '1W': { events: 48, value: 2_105_000_000 },
  '1M': { events: 96, value: 3_180_000_000 },
  '3M': { events: 171, value: 4_045_000_000 },
}

export const riskBands: Array<{ min: number; max: number; label: string; color: string }> = [
  { min: 0, max: 20, label: 'Minimal', color: '#34D399' },
  { min: 20, max: 40, label: 'Guarded', color: '#7BD88F' },
  { min: 40, max: 60, label: 'Elevated', color: '#F5B942' },
  { min: 60, max: 80, label: 'High', color: '#F0913C' },
  { min: 80, max: 100, label: 'Severe', color: '#F0616D' },
]

/* ================================================================== */
/* Risk register                                                       */
/* ================================================================== */

export const riskScenarios: RiskScenario[] = [
  { id: 'RS-101', scenario: 'Ransomware encrypts core ledger', asset: 'Core Banking — DC-1', threatActor: 'Extortion crew', likelihood: 'likely', likelihoodPct: 62, singleLoss: 1_240_000_000, eal: 768_800_000, status: 'open', owner: 'Head of IT Risk', lastReview: '12 Sep 2026' },
  { id: 'RS-102', scenario: 'Zero-day on payment switch', asset: 'Payment Switch', threatActor: 'State actor', likelihood: 'possible', likelihoodPct: 34, singleLoss: 860_000_000, eal: 292_400_000, status: 'mitigating', owner: 'Payments Sec Lead', lastReview: '04 Sep 2026' },
  { id: 'RS-103', scenario: 'Bulk PII exfiltration via data lake', asset: 'Customer Data Lake', threatActor: 'Insider', likelihood: 'possible', likelihoodPct: 28, singleLoss: 640_000_000, eal: 179_200_000, status: 'open', owner: 'Data Protection Officer', lastReview: '28 Aug 2026' },
  { id: 'RS-104', scenario: 'DDoS takedown of trading platform', asset: 'Trading Platform', threatActor: 'Hacktivist', likelihood: 'likely', likelihoodPct: 55, singleLoss: 210_000_000, eal: 115_500_000, status: 'mitigating', owner: 'Capital Markets CISO', lastReview: '19 Aug 2026' },
  { id: 'RS-105', scenario: 'Credential stuffing on retail portal', asset: 'Retail Internet Banking', threatActor: 'Crimeware', likelihood: 'almost-certain', likelihoodPct: 78, singleLoss: 96_000_000, eal: 74_880_000, status: 'open', owner: 'IAM Lead', lastReview: '30 Aug 2026' },
  { id: 'RS-106', scenario: 'Ransomware on branch VPN fabric', asset: 'Branch VPN Fabric', threatActor: 'Extortion crew', likelihood: 'unlikely', likelihoodPct: 21, singleLoss: 295_000_000, eal: 61_950_000, status: 'accepted', owner: 'Infra Manager', lastReview: '11 Jul 2026' },
  { id: 'RS-107', scenario: 'Third-party breach via cloud processor', asset: 'HR & Payroll Cloud', threatActor: 'Supply chain', likelihood: 'possible', likelihoodPct: 31, singleLoss: 120_000_000, eal: 37_200_000, status: 'mitigating', owner: 'Vendor Risk', lastReview: '22 Sep 2026' },
  { id: 'RS-108', scenario: 'SABM through unreconciled SWIFT flow', asset: 'Payments Switch SWIFT', threatActor: 'Organised crime', likelihood: 'unlikely', likelihoodPct: 14, singleLoss: 180_000_000, eal: 25_200_000, status: 'closed', owner: 'Payments Sec Lead', lastReview: '02 Jun 2026' },
  { id: 'RS-109', scenario: 'Lateral movement into trading enclave', asset: 'Trading Platform', threatActor: 'State actor', likelihood: 'rare', likelihoodPct: 8, singleLoss: 640_000_000, eal: 51_200_000, status: 'open', owner: 'Capital Markets CISO', lastReview: '05 Sep 2026' },
  { id: 'RS-110', scenario: 'Ransomware on backup estate', asset: 'Backup Infrastructure', threatActor: 'Extortion crew', likelihood: 'unlikely', likelihoodPct: 19, singleLoss: 900_000_000, eal: 171_000_000, status: 'open', owner: 'Head of IT Risk', lastReview: '24 Aug 2026' },
]

export const riskStatusFilters = ['all', 'open', 'mitigating', 'accepted', 'closed'] as const

/* ================================================================== */
/* Vulnerabilities                                                     */
/* ================================================================== */

export const vulnerabilities: Vulnerability[] = [
  { id: 'V-01', cve: 'CVE-2026-2147', title: 'Remote code exec in payment middleware', asset: 'Payment Switch', cvss: 9.8, epss: 0.87, kev: true, patchAvailable: false, contribution: 182_000_000, discovered: '02 Sep 2026' },
  { id: 'V-02', cve: 'CVE-2026-1180', title: 'Auth bypass on core banking host', asset: 'Core Banking — DC-1', cvss: 9.4, epss: 0.72, kev: true, patchAvailable: true, contribution: 146_000_000, discovered: '26 Aug 2026' },
  { id: 'V-03', cve: 'CVE-2025-9042', title: 'Unauthenticated RCE in VPN concentrator', asset: 'Branch VPN Fabric', cvss: 9.1, epss: 0.64, kev: true, patchAvailable: true, contribution: 121_000_000, discovered: '14 Aug 2026' },
  { id: 'V-04', cve: 'CVE-2026-3311', title: 'SQLi in customer data lake console', asset: 'Customer Data Lake', cvss: 8.6, epss: 0.41, kev: false, patchAvailable: true, contribution: 98_000_000, discovered: '19 Sep 2026' },
  { id: 'V-05', cve: 'CVE-2025-7712', title: 'Privilege escalation in container runtime', asset: 'Trading Platform', cvss: 8.2, epss: 0.35, kev: false, patchAvailable: true, contribution: 74_000_000, discovered: '05 Jul 2026' },
  { id: 'V-06', cve: 'CVE-2026-2205', title: 'Stored XSS in retail banking portal', asset: 'Retail Internet Banking', cvss: 7.4, epss: 0.22, kev: false, patchAvailable: true, contribution: 52_000_000, discovered: '11 Sep 2026' },
  { id: 'V-07', cve: 'CVE-2024-6688', title: 'Weak TLS cipher suite in legacy gateway', asset: 'Branch VPN Fabric', cvss: 7.1, epss: 0.14, kev: false, patchAvailable: true, contribution: 38_000_000, discovered: '22 Apr 2026' },
  { id: 'V-08', cve: 'CVE-2026-4090', title: 'Path traversal in HR document export', asset: 'HR & Payroll Cloud', cvss: 6.8, epss: 0.09, kev: false, patchAvailable: true, contribution: 24_000_000, discovered: '28 Sep 2026' },
  { id: 'V-09', cve: 'CVE-2025-3321', title: 'Missing MFA enforcement on admin console', asset: 'Customer Data Lake', cvss: 6.5, epss: 0.07, kev: false, patchAvailable: true, contribution: 16_000_000, discovered: '13 Aug 2026' },
  { id: 'V-10', cve: 'CVE-2026-5502', title: 'Information disclosure in API gateway', asset: 'Payment Switch', cvss: 5.3, epss: 0.03, kev: false, patchAvailable: true, contribution: 9_000_000, discovered: '01 Sep 2026' },
]

/* ================================================================== */
/* What-if levers                                                      */
/* ================================================================== */

export const whatIfLevers: WhatIfLever[] = [
  { id: 'W-1', label: 'Enforce full-disk encryption', description: 'AES-256 across 3 legacy databases and file shares', ealFactor: 0.22, varFactor: 0.28, cost: 9_500_000 },
  { id: 'W-2', label: 'Extend EDR to 100% coverage', description: '90 remaining endpoints and 3 hypervisor hosts', ealFactor: 0.18, varFactor: 0.24, cost: 14_200_000 },
  { id: 'W-3', label: 'Patch SLA under 14 days', description: 'Clears the 42 hosts breaching the 30-day policy', ealFactor: 0.16, varFactor: 0.19, cost: 6_800_000 },
  { id: 'W-4', label: 'Immutable air-gapped backups', description: 'Fixes 2 failed restore tests on the backup estate', ealFactor: 0.21, varFactor: 0.26, cost: 18_400_000 },
  { id: 'W-5', label: 'Zero-trust branch segmentation', description: 'Removes flat VLAN access to the VPN fabric', ealFactor: 0.12, varFactor: 0.15, cost: 22_000_000 },
  { id: 'W-6', label: 'Phishing-resistant MFA for admins', description: 'FIDO2 keys for 640 privileged accounts', ealFactor: 0.09, varFactor: 0.11, cost: 4_600_000 },
]

/* ================================================================== */
/* Investment optimizer                                                */
/* ================================================================== */

export const recommendedControls: RecommendedControl[] = [
  { id: 'C-01', name: 'Immutable air-gapped backups', category: 'Resilience', tier: 'Essential', cost: 18_400_000, riskReduction: 34_200_000, implementationWeeks: 6, owners: 4 },
  { id: 'C-02', name: 'Full-disk encryption estate-wide', category: 'Data protection', tier: 'Essential', cost: 9_500_000, riskReduction: 28_300_000, implementationWeeks: 4, owners: 3 },
  { id: 'C-03', name: 'EDR coverage completion', category: 'Endpoint', tier: 'Essential', cost: 14_200_000, riskReduction: 25_600_000, implementationWeeks: 5, owners: 5 },
  { id: 'C-04', name: 'Patch SLA automation', category: 'Vuln management', tier: 'Essential', cost: 6_800_000, riskReduction: 19_400_000, implementationWeeks: 3, owners: 2 },
  { id: 'C-05', name: 'Phishing-resistant MFA rollout', category: 'Identity', tier: 'Advanced', cost: 4_600_000, riskReduction: 11_800_000, implementationWeeks: 3, owners: 4 },
  { id: 'C-06', name: 'Zero-trust branch segmentation', category: 'Network', tier: 'Advanced', cost: 22_000_000, riskReduction: 24_900_000, implementationWeeks: 12, owners: 7 },
  { id: 'C-07', name: 'Payment switch WAF + DDoS scrubbing', category: 'Network', tier: 'Advanced', cost: 16_500_000, riskReduction: 21_400_000, implementationWeeks: 8, owners: 3 },
  { id: 'C-08', name: 'Data lake tokenisation', category: 'Data protection', tier: 'Transformational', cost: 31_000_000, riskReduction: 26_700_000, implementationWeeks: 16, owners: 6 },
  { id: 'C-09', name: 'SOAR automated containment', category: 'Detection & response', tier: 'Transformational', cost: 27_500_000, riskReduction: 23_100_000, implementationWeeks: 14, owners: 5 },
  { id: 'C-10', name: 'Continuous attack surface scanning', category: 'Vuln management', tier: 'Advanced', cost: 8_900_000, riskReduction: 14_700_000, implementationWeeks: 2, owners: 2 },
]

export const optimizerBudget = { min: 20_000_000, max: 120_000_000, step: 1_000_000, initial: 60_000_000 }

/* ================================================================== */
/* Compliance frameworks                                               */
/* ================================================================== */

export const complianceFrameworks: ComplianceFramework[] = [
  {
    id: 'iso-27001',
    name: 'ISO/IEC 27001:2022',
    shortName: 'ISO 27001',
    regulator: 'International',
    controls: 93,
    passed: 81,
    failed: 12,
    coverage: 87,
    lastAudit: '18 Aug 2026',
    domains: [
      { name: 'Organisational', coverage: 94, passed: 16, failed: 1 },
      { name: 'People', coverage: 100, passed: 8, failed: 0 },
      { name: 'Physical', coverage: 88, passed: 7, failed: 1 },
      { name: 'Technological', coverage: 78, passed: 39, failed: 11 },
      { name: 'Organisational (crypto)', coverage: 72, passed: 11, failed: 0 },
    ],
  },
  {
    id: 'nist-csf',
    name: 'NIST Cybersecurity Framework 2.0',
    shortName: 'NIST CSF',
    regulator: 'US Federal',
    controls: 106,
    passed: 88,
    failed: 18,
    coverage: 83,
    lastAudit: '02 Sep 2026',
    domains: [
      { name: 'Govern', coverage: 90, passed: 18, failed: 2 },
      { name: 'Identify', coverage: 86, passed: 24, failed: 4 },
      { name: 'Protect', coverage: 79, passed: 30, failed: 8 },
      { name: 'Detect', coverage: 88, passed: 15, failed: 2 },
      { name: 'Respond & Recover', coverage: 76, passed: 13, failed: 4 },
    ],
  },
  {
    id: 'cis-v8',
    name: 'CIS Critical Security Controls v8',
    shortName: 'CIS v8',
    regulator: 'Consortium',
    controls: 171,
    passed: 129,
    failed: 42,
    coverage: 75,
    lastAudit: '29 Jul 2026',
    domains: [
      { name: 'Control 1 — Inventory', coverage: 92, passed: 10, failed: 1 },
      { name: 'Control 2 — Access', coverage: 74, passed: 7, failed: 4 },
      { name: 'Control 3 — Protection', coverage: 68, passed: 12, failed: 7 },
      { name: 'Control 4 — Detection', coverage: 81, passed: 8, failed: 2 },
      { name: 'Controls 5-6 — Response', coverage: 64, passed: 7, failed: 4 },
      { name: 'Control 7-8 — Recovery', coverage: 70, passed: 5, failed: 3 },
      { name: 'Controls 9-17 — Hardening', coverage: 66, passed: 47, failed: 22 },
    ],
  },
  {
    id: 'rbi-csf',
    name: 'RBI Cyber Security Framework',
    shortName: 'RBI CSF',
    regulator: 'RBI',
    controls: 118,
    passed: 103,
    failed: 15,
    coverage: 87,
    lastAudit: '09 Sep 2026',
    domains: [
      { name: 'Governance', coverage: 96, passed: 24, failed: 1 },
      { name: 'Asset Management', coverage: 88, passed: 21, failed: 3 },
      { name: 'Access Control', coverage: 84, passed: 25, failed: 5 },
      { name: 'Cyber Security Operations', coverage: 81, passed: 20, failed: 4 },
      { name: 'Third Party Risk', coverage: 79, passed: 13, failed: 2 },
    ],
  },
  {
    id: 'sebi-cscrf',
    name: 'SEBI CSCRF for Cyber Security',
    shortName: 'SEBI CSCRF',
    regulator: 'SEBI',
    controls: 64,
    passed: 47,
    failed: 17,
    coverage: 73,
    lastAudit: '15 Jul 2026',
    domains: [
      { name: 'Governance & Policy', coverage: 88, passed: 14, failed: 2 },
      { name: 'Asset Inventory', coverage: 75, passed: 11, failed: 4 },
      { name: 'Access & Identity', coverage: 69, passed: 10, failed: 5 },
      { name: 'Monitoring & Response', coverage: 72, passed: 12, failed: 5 },
      { name: 'Third Party', coverage: 66, passed: 7, failed: 4 },
    ],
  },
]

/* ================================================================== */
/* Integrations                                                        */
/* ================================================================== */

export const integrations: Integration[] = [
  { id: 'i-01', name: 'Nessus', category: 'Scanner', description: 'Vulnerability scanning across 1,502 hosts and 4 cloud accounts', status: 'connected', records: 1_502, lastSync: '4 min ago', coverage: 96 },
  { id: 'i-02', name: 'Splunk Enterprise', category: 'SIEM', description: 'Log ingestion and correlation for the security data lake', status: 'connected', records: 48_210_000, lastSync: 'Live', coverage: 100 },
  { id: 'i-03', name: 'CrowdStrike Falcon', category: 'EDR', description: 'Endpoint telemetry and process-level detection', status: 'connected', records: 1_412, lastSync: 'Live', coverage: 94 },
  { id: 'i-04', name: 'Okta', category: 'IAM', description: 'Identity posture, MFA state and privilege assignments', status: 'syncing', records: 8_940, lastSync: '2 min ago', coverage: 91 },
  { id: 'i-05', name: 'Prisma Cloud', category: 'CSPM', description: 'Cloud misconfiguration and compliance drift detection', status: 'degraded', records: 214, lastSync: '3 h ago', coverage: 68 },
  { id: 'i-06', name: 'ServiceNow CMDB', category: 'CMDB', description: 'Asset ownership, business criticality and dependency graph', status: 'connected', records: 3_876, lastSync: '18 min ago', coverage: 88 },
  { id: 'i-07', name: 'Mandiant Advantage', category: 'Threat Intel', description: 'Indicators, actor attribution and active campaign feeds', status: 'connected', records: 142_800, lastSync: 'Live', coverage: 100 },
  { id: 'i-08', name: 'Legacy Vuln Scanner', category: 'Scanner', description: 'Retired appliance retained for historical baseline only', status: 'disconnected', records: 0, lastSync: '12 d ago', coverage: 0 },
]
