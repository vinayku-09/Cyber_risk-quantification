import { EnterpriseRiskScoreCard } from '../components/dashboard/EnterpriseRiskScoreCard'
import { ForecastCard } from '../components/dashboard/ForecastCard'
import { RiskContributorsCard } from '../components/dashboard/RiskContributorsCard'
import { ThreatMapCard } from '../components/dashboard/ThreatMapCard'

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-12 gap-3.5">
      <div className="col-span-12 xl:col-span-5">
        <EnterpriseRiskScoreCard />
      </div>
      <div className="col-span-12 xl:col-span-7">
        <ForecastCard />
      </div>
      <div className="col-span-12 xl:col-span-7">
        <RiskContributorsCard />
      </div>
      <div className="col-span-12 xl:col-span-5">
        <ThreatMapCard />
      </div>
    </div>
  )
}
