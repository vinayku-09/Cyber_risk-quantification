export type AccentColor = 'green' | 'blue' | 'amber' | 'red'

export type NavKey =
  | 'dashboard'
  | 'risk-register'
  | 'vulnerabilities'
  | 'what-if'
  | 'optimizer'
  | 'compliance'
  | 'integrations'

export type Severity = 'critical' | 'high' | 'medium' | 'low'

export type ControlStatus = 'strong' | 'partial' | 'weak' | 'missing'

export interface NavItem {
  key: NavKey
  label: string
  to: string
  badge?: number
}

export interface UserProfile {
  name: string
  role: string
  initials: string
}

export interface RiskScoreSummary {
  score: number
  delta: number
  bandLabel: string
  financialExposure: number
  expectedAnnualLoss: number
  valueAtRisk95: number
  controls: ControlHealth[]
}

export interface ControlHealth {
  name: string
  status: ControlStatus
  coverage: number
  detail: string
}

export interface ForecastPoint {
  date: string
  actual: number | null
  predicted: number | null
  lower: number
  upper: number
  confidence: number
}

export interface ForecastInsight {
  headline: string
  body: string
  accent: AccentColor
}

export interface RiskContributor {
  id: string
  asset: string
  businessUnit: string
  securityScore: number
  exposure: number
  threat: AccentColor
  threatLabel: string
  pendingFixes: number
}

export interface MapMarker {
  id: string
  label: string
  lon: number
  lat: number
  severity: Severity
  value: number
  events: number
}

export interface TimeFilter {
  key: string
  label: string
}

export interface PageMeta {
  title: string
  subtitle: string
}

/* ---------------- Risk register ---------------- */

export type Likelihood = 'rare' | 'unlikely' | 'possible' | 'likely' | 'almost-certain'
export type RiskStatus = 'open' | 'mitigating' | 'accepted' | 'closed'

export interface RiskScenario {
  id: string
  scenario: string
  asset: string
  threatActor: string
  likelihood: Likelihood
  likelihoodPct: number
  singleLoss: number
  eal: number
  status: RiskStatus
  owner: string
  lastReview: string
}

/* ---------------- Vulnerabilities ---------------- */

export interface Vulnerability {
  id: string
  cve: string
  title: string
  asset: string
  cvss: number
  epss: number
  kev: boolean
  patchAvailable: boolean
  contribution: number
  discovered: string
}

/* ---------------- What-if ---------------- */

export interface WhatIfLever {
  id: string
  label: string
  description: string
  ealFactor: number
  varFactor: number
  cost: number
}

/* ---------------- Investment optimizer ---------------- */

export interface RecommendedControl {
  id: string
  name: string
  category: string
  tier: 'Essential' | 'Advanced' | 'Transformational'
  cost: number
  riskReduction: number
  implementationWeeks: number
  owners: number
}

/* ---------------- Compliance ---------------- */

export interface ComplianceDomain {
  name: string
  coverage: number
  passed: number
  failed: number
}

export interface ComplianceFramework {
  id: string
  name: string
  shortName: string
  regulator: string
  controls: number
  passed: number
  failed: number
  coverage: number
  lastAudit: string
  domains: ComplianceDomain[]
}

/* ---------------- Integrations ---------------- */

export type IntegrationStatus = 'connected' | 'syncing' | 'degraded' | 'disconnected'

export interface Integration {
  id: string
  name: string
  category: string
  description: string
  status: IntegrationStatus
  records: number
  lastSync: string
  coverage: number
}
