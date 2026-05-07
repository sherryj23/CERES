'use client'

interface Opportunity {
  contract: string
  signal: string
  amount: string
  note: string
}

interface ParsedOutput {
  summary?: string
  key_metrics?: {
    iv_signal?: string
    sentiment?: string
    mispricing_count?: string
  }
  top_opportunities?: Opportunity[]
  risk_level?: string
  disclaimer?: string
}

export default function AgentOutput({ text }: { text: string }) {
  let parsed: ParsedOutput | null = null

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) parsed = JSON.parse(jsonMatch[0])
  } catch {}

  if (!parsed) {
    return <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', lineHeight: 1.9 }}>{text}</span>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {parsed.summary && (
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', lineHeight: 1.8 }}>{parsed.summary}</p>
      )}

      {parsed.key_metrics && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6 }}>
          {Object.entries(parsed.key_metrics).map(([k, v]) => (
            <div key={k} style={{ background: 'rgba(150,70,255,0.06)', border: '1px solid rgba(150,70,255,0.12)', borderRadius: 6, padding: '6px 10px' }}>
              <div style={{ fontSize: 7, color: 'rgba(150,70,255,0.6)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 3 }}>{k.replace(/_/g,' ')}</div>
              <div style={{ fontSize: 10, color: 'white' }}>{v}</div>
            </div>
          ))}
        </div>
      )}

      {parsed.top_opportunities && parsed.top_opportunities.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: 7, color: 'rgba(150,70,255,0.6)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 2 }}>Top Opportunities</div>
          {parsed.top_opportunities.map((o, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(150,70,255,0.08)', borderRadius: 6 }}>
              <span style={{ fontFamily: "'Orbitron', monospace", fontSize: 11, fontWeight: 700, color: 'white', minWidth: 80 }}>{o.contract}</span>
              <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 3, background: o.signal === 'UNDERPRICED' ? 'rgba(150,70,255,0.12)' : 'rgba(220,80,80,0.1)', color: o.signal === 'UNDERPRICED' ? '#c080ff' : '#e08080', border: `1px solid ${o.signal === 'UNDERPRICED' ? 'rgba(150,70,255,0.2)' : 'rgba(220,80,80,0.2)'}` }}>{o.signal}</span>
              <span style={{ fontFamily: "'Orbitron', monospace", fontSize: 11, fontWeight: 700, color: o.signal === 'UNDERPRICED' ? '#9060ef' : '#e06060' }}>{o.amount}</span>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', flex: 1 }}>{o.note}</span>
            </div>
          ))}
        </div>
      )}

      {parsed.risk_level && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 7, color: 'rgba(150,70,255,0.6)', letterSpacing: 3, textTransform: 'uppercase' }}>Risk Level</span>
          <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 3, background: parsed.risk_level === 'HIGH' ? 'rgba(220,80,80,0.1)' : parsed.risk_level === 'MEDIUM' ? 'rgba(200,150,60,0.1)' : 'rgba(150,70,255,0.1)', color: parsed.risk_level === 'HIGH' ? '#e08080' : parsed.risk_level === 'MEDIUM' ? '#ffb828' : '#c080ff', border: `1px solid ${parsed.risk_level === 'HIGH' ? 'rgba(220,80,80,0.2)' : parsed.risk_level === 'MEDIUM' ? 'rgba(200,150,60,0.2)' : 'rgba(150,70,255,0.2)'}` }}>{parsed.risk_level}</span>
        </div>
      )}

      {parsed.disclaimer && (
        <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', lineHeight: 1.6, borderTop: '1px solid rgba(150,70,255,0.08)', paddingTop: 8 }}>{parsed.disclaimer}</p>
      )}
    </div>
  )
}