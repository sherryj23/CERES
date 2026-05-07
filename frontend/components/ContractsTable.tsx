'use client'

interface Contract {
  contract: string
  type: string
  strike: number
  market_premium: number
  theoretical_price: number
  mispricing: number
  overpriced: boolean
  greeks?: { delta: number; gamma: number; theta: number; vega: number }
}

interface ContractsTableProps {
  contracts: Contract[]
  selectedIndex: number | null
  onSelect: (index: number) => void
}

export default function ContractsTable({ contracts, selectedIndex, onSelect }: ContractsTableProps) {
  if (!contracts.length) {
    return (
      <div style={{ textAlign: 'center', padding: '20px 0', fontSize: 11, color: 'rgba(255,255,255,0.25)', letterSpacing: 2 }}>
        NO DATA — RUN ANALYSIS
      </div>
    )
  }

  return (
    <table className="ceres-table">
      <thead>
        <tr>
          <th>Strike</th>
          <th>Type</th>
          <th>Market</th>
          <th>Theoretical</th>
          <th>Mispricing</th>
          <th>Delta</th>
        </tr>
      </thead>
      <tbody>
        {contracts.map((c, i) => (
          <tr key={i} className={selectedIndex === i ? 'selected' : ''} onClick={() => onSelect(i)}>
            <td><span className="strike-val">${c.strike}</span></td>
            <td><span className={c.type === 'call' ? 'badge-call' : 'badge-put'}>{c.type.toUpperCase()}</span></td>
            <td>${c.market_premium.toFixed(2)}</td>
            <td>${c.theoretical_price.toFixed(2)}</td>
            <td>
              <span className={c.mispricing < 0 ? 'mp-under' : 'mp-over'}>
                {c.mispricing > 0 ? '+' : ''}${c.mispricing.toFixed(2)}
              </span>
            </td>
            <td style={{ color: 'rgba(255,255,255,0.5)' }}>
              {c.greeks?.delta?.toFixed(2) ?? '—'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
