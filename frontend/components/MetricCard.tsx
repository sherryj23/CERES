'use client'

interface MetricCardProps {
  label: string
  value: string
  sub: string
  badge: string
  badgeClass: string
  tooltip?: string
}

export default function MetricCard({ label, value, sub, badge, badgeClass }: MetricCardProps) {
  return (
    <div className="metric-card">
      <div style={{ fontSize: 8, color: 'rgba(150,70,255,0.65)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 20, fontWeight: 700, color: 'white', transition: 'all 0.4s' }}>
        {value}
      </div>
      <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.28)', marginTop: 3, letterSpacing: 1 }}>
        {sub}
      </div>
      <span className={`badge ${badgeClass}`}>{badge}</span>
    </div>
  )
}
