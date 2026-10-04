import { lazy, Suspense, type ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'

const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const RiskRegisterPage = lazy(() => import('./pages/RiskRegisterPage'))
const VulnerabilitiesPage = lazy(() => import('./pages/VulnerabilitiesPage'))
const WhatIfPage = lazy(() => import('./pages/WhatIfPage'))
const OptimizerPage = lazy(() => import('./pages/OptimizerPage'))
const CompliancePage = lazy(() => import('./pages/CompliancePage'))
const IntegrationsPage = lazy(() => import('./pages/IntegrationsPage'))

function PageFallback() {
  return (
    <div className="grid grid-cols-12 gap-3.5">
      {Array.from({ length: 8 }, (_, index) => (
        <div
          key={index}
          className="card-surface col-span-12 h-28 animate-pulse md:col-span-6 xl:col-span-3"
          style={{ animationDelay: `${index * 60}ms` }}
        />
      ))}
    </div>
  )
}

function Routed({ children }: { children: ReactNode }) {
  return <Suspense fallback={<PageFallback />}>{children}</Suspense>
}

export function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routed>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/risk-register" element={<RiskRegisterPage />} />
            <Route path="/vulnerabilities" element={<VulnerabilitiesPage />} />
            <Route path="/what-if" element={<WhatIfPage />} />
            <Route path="/optimizer" element={<OptimizerPage />} />
            <Route path="/compliance" element={<CompliancePage />} />
            <Route path="/integrations" element={<IntegrationsPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Routed>
      </AppLayout>
    </BrowserRouter>
  )
}
