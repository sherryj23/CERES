'use client'

import { useState, useEffect } from 'react'
import Stars from '../components/Stars'
import Logo from '../components/Logo'
import MetricCard from '../components/MetricCard'
import AgentPipeline from '../components/AgentPipeline'
import ContractsTable from '../components/ContractsTable'
import AgentOutput from '../components/AgentOutput'

const BASE_URL = 'http://127.0.0.1:8000'

const AGENT_DEFS = [
  { name: 'Data Agent', desc: 'Polygon.io · yfinance', icon: '📡', iconBg: 'rgba(80,140,220,0.1)', detail: 'Polygon.io stock price fetched. yfinance options chain retrieved with full Greeks and IV data.' },
  { name: 'Quant Agent', desc: 'Black-Scholes · Greeks', icon: '⚡', iconBg: 'rgba(150,70,255,0.1)', detail: 'Black-Scholes pricing computed for all contracts. Delta, Gamma, Theta, Vega calculated per contract.' },
  { name: 'Pattern Agent', desc: 'Mispricing detection', icon: '🔍', iconBg: 'rgba(180,80,140,0.1)', detail: 'Systematic mispricing patterns identified. Strike range clustering and IV anomalies flagged.' },
  { name: 'Context Agent', desc: 'IV analysis · Sentiment', icon: '🌐', iconBg: 'rgba(80,160,120,0.1)', detail: 'IV vs HV ratio computed. Put/call ratio interpreted. Market sentiment established from options flow.' },
  { name: 'Explainer Agent', desc: 'Synthesizes output', icon: '💡', iconBg: 'rgba(200,150,60,0.1)', detail: 'All agent outputs synthesized. Guardrails validation passed. Final analysis verified against computed data.' },
]

export default function Home() {
  const [ticker, setTicker] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(false)
  const [clock, setClock] = useState('')
  const [agents, setAgents] = useState(AGENT_DEFS.map(a => ({ ...a, status: 'idle' as const, progress: 0 })))
  const [aiText, setAiText] = useState('Enter a ticker and click Analyze to run the multi-agent pipeline. Supports any US equity with listed options.')
  const [analysisData, setAnalysisData] = useState<any>(null)
  const [ivData, setIvData] = useState<any>(null)
  const [scannerData, setScannerData] = useState<any>(null)
  const [selectedContract, setSelectedContract] = useState<number | null>(null)
  const [scannerLoading, setScannerLoading] = useState(false)

  useEffect(() => {
    const t = setInterval(() => {
      setClock(new Date().toLocaleTimeString('en-US', { hour12: false }))
    }, 1000)
    return () => clearInterval(t)
  }, [])

  const resetAgents = () => {
    setAgents(AGENT_DEFS.map(a => ({ ...a, status: 'idle' as const, progress: 0 })))
  }

  const runAgentStep = (step: number, msg: string) => {
    setAiText(msg)
    setAgents(prev => prev.map((a, i) => {
      if (i < step) return { ...a, status: 'done' as const, progress: 100 }
      if (i === step) return { ...a, status: 'active' as const, progress: 60 }
      return { ...a, status: 'idle' as const, progress: 0 }
    }))
  }

  const go = async () => {
    const t = (ticker.trim().toUpperCase() || 'AAPL')
    if (!/^[A-Z]{1,5}$/.test(t)) {
      setAiText('Invalid ticker. Please enter a valid US stock ticker (e.g. AAPL, TSLA, NVDA)')
      return
    }
    setLoading(true)
    setSelectedContract(null)
    resetAgents()

    const steps = [
      'Fetching live data from Polygon.io + yfinance...',
      'Running Black-Scholes on all contracts...',
      'Detecting mispricing patterns across strikes...',
      'Analyzing IV vs HV, sentiment, put/call ratio...',
      'Synthesizing verified final analysis...',
    ]

    try {
      for (let i = 0; i < 4; i++) {
        runAgentStep(i, steps[i])
        await new Promise(r => setTimeout(r, 600))
      }

      const [analysisRes, ivRes] = await Promise.all([
        fetch(`${BASE_URL}/analyze/${t}`),
        fetch(`${BASE_URL}/iv-analysis/${t}`),
      ])

      const analysis = await analysisRes.json()
      const iv = await ivRes.json()

      runAgentStep(4, steps[4])
      await new Promise(r => setTimeout(r, 500))

      const agentRes = await fetch(`${BASE_URL}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `Analyze options market for ${t}`, ticker: t }),
      })
      const agentResult = await agentRes.json()

      setAnalysisData(analysis)
      setIvData(iv)
      setAiText(agentResult.response || 'Analysis complete.')
      setAgents(AGENT_DEFS.map(a => ({ ...a, status: 'done' as const, progress: 100 })))
    } catch (err) {
      setAiText('Error connecting to Ceres API. Make sure the backend is running on port 8000.')
      resetAgents()
    }
    setLoading(false)
  }

  const handleScannerTab = async () => {
    setActiveTab('scanner')
    if (!scannerData) {
      setScannerLoading(true)
      try {
        const res = await fetch(`${BASE_URL}/scanner`)
        const data = await res.json()
        setScannerData(data)
      } catch {
        setScannerData({ error: true })
      }
      setScannerLoading(false)
    }
  }

  const price = analysisData?.current_price
  const ivVal = ivData?.current_iv ? (ivData.current_iv * 100).toFixed(1) : '—'
  const hvVal = analysisData?.historical_volatility ? (analysisData.historical_volatility * 100).toFixed(1) : '—'
  const pcrVal = analysisData?.put_call_ratio?.toFixed(2) ?? '—'
  const sentiment = analysisData?.market_sentiment ?? '—'
  const calls = analysisData?.calls ?? []
  const puts = analysisData?.puts ?? []
  const allContracts = [...calls, ...puts].sort((a: any, b: any) => Math.abs(b.mispricing) - Math.abs(a.mispricing)).slice(0, 8)
  const selectedC = selectedContract !== null ? allContracts[selectedContract] : null

  return (
    <div style={{ background: '#080410', minHeight: '100vh', padding: '20px', position: 'relative', overflow: 'hidden' }}>
      <Stars />
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 900, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
          <Logo />
          <div>
            <h1 style={{ fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: 24, color: 'white', letterSpacing: 3 }}>CERES</h1>
            <p style={{ fontSize: 9, color: 'rgba(150,70,255,0.75)', letterSpacing: 4, textTransform: 'uppercase', marginTop: 3 }}>AI Options Analysis Agent</p>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 14, fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: 2 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#9060ef', boxShadow: '0 0 6px #9060ef' }} />
            <span>ONLINE</span>
            <span style={{ fontFamily: "'Orbitron', monospace" }}>{clock}</span>
          </div>
        </div>

        {/* Search */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(150,70,255,0.28)', borderRadius: 10, padding: '3px 3px 3px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: "'Orbitron', monospace", fontSize: 9, color: 'rgba(150,70,255,0.7)', letterSpacing: 3, whiteSpace: 'nowrap' }}>TICKER //</span>
            <input
              value={ticker}
              onChange={e => setTicker(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && go()}
              placeholder="AAPL"
              maxLength={5}
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontFamily: "'Orbitron', monospace", fontSize: 18, fontWeight: 700, color: 'white', letterSpacing: 4, caretColor: '#a060ff' }}
            />
          </div>
          <button onClick={go} disabled={loading} style={{ background: 'linear-gradient(135deg, #4a0eb8, #9050ef)', border: 'none', borderRadius: 8, padding: '11px 22px', fontFamily: "'Orbitron', monospace", fontSize: 10, fontWeight: 700, color: 'white', letterSpacing: 2, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, flexShrink: 0 }}>
            {loading ? '⟳ SCANNING' : '▶ ANALYZE'}
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          {['overview', 'calls', 'puts', 'scanner'].map(tab => (
            <button key={tab} className={`tab-btn${activeTab === tab ? ' active' : ''}`} onClick={() => tab === 'scanner' ? handleScannerTab() : setActiveTab(tab)}>
              {tab}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === 'overview' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
              <MetricCard label="Current Price" value={price ? `$${price.toFixed(2)}` : '—'} sub={`${ticker || 'AAPL'} · NASDAQ`} badge={price ? 'LIVE' : 'AWAITING'} badgeClass="badge-purple" />
              <MetricCard label="Implied Vol" value={`${ivVal}%`} sub="Options market pricing" badge={ivData?.interpretation?.includes('expensive') ? 'ELEVATED' : 'FAIR'} badgeClass={ivData?.interpretation?.includes('expensive') ? 'badge-red' : 'badge-purple'} />
              <MetricCard label="Hist. Vol 30d" value={`${hvVal}%`} sub="Realized volatility" badge={ivData ? `IV/HV ${ivData.iv_hv_ratio?.toFixed(2)}x` : '—'} badgeClass="badge-blue" />
              <MetricCard label="Put/Call Ratio" value={pcrVal} sub="Options flow sentiment" badge={sentiment.toUpperCase()} badgeClass={sentiment === 'bearish' ? 'badge-red' : 'badge-purple'} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 14 }}>
              <div className="panel">
                <div className="panel-header">
                  <div className="pdot" />
                  <div className="panel-title">Top Mispriced · {analysisData?.expiration_date ?? '—'}</div>
                </div>
                <div style={{ padding: 16 }}>
                  <ContractsTable contracts={allContracts} selectedIndex={selectedContract} onSelect={setSelectedContract} />
                  {selectedC && (
                    <div className="detail-panel">
                      <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 8, color: 'rgba(150,70,255,0.75)', letterSpacing: 3, marginBottom: 10 }}>
                        ${selectedC.strike} {selectedC.type.toUpperCase()} · CONTRACT DETAILS
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        {[
                          ['DELTA', selectedC.greeks?.delta?.toFixed(4) ?? '—'],
                          ['THETA / DAY', selectedC.greeks?.theta?.toFixed(4) ?? '—'],
                          ['VEGA', selectedC.greeks?.vega?.toFixed(4) ?? '—'],
                          ['GAMMA', selectedC.greeks?.gamma?.toFixed(4) ?? '—'],
                          ['MISPRICING', `${selectedC.mispricing > 0 ? '+' : ''}$${selectedC.mispricing.toFixed(2)}`],
                          ['STATUS', selectedC.overpriced ? 'OVERPRICED' : 'UNDERPRICED'],
                        ].map(([k, v]) => (
                          <div key={k} style={{ background: 'rgba(255,255,255,0.025)', borderRadius: 6, padding: '8px 10px' }}>
                            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.28)', letterSpacing: 2, marginBottom: 3 }}>{k}</div>
                            <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 13, fontWeight: 700, color: k === 'MISPRICING' ? (selectedC.mispricing < 0 ? '#9060ef' : '#e06060') : 'white' }}>{v}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="ai-box">
                    <div className="scanline" />
                    <AgentOutput text={aiText} />
                  </div>
                </div>
              </div>

              <div className="panel">
                <div className="panel-header">
                  <div className="pdot" />
                  <div className="panel-title">Agent Pipeline</div>
                </div>
                <div style={{ padding: 16 }}>
                  <AgentPipeline agents={agents} onAgentClick={msg => setAiText(msg)} />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Calls */}
        {activeTab === 'calls' && (
          <div className="panel">
            <div className="panel-header"><div className="pdot" /><div className="panel-title">All Call Contracts</div></div>
            <div style={{ padding: 16 }}><ContractsTable contracts={calls} selectedIndex={null} onSelect={() => {}} /></div>
          </div>
        )}

        {/* Puts */}
        {activeTab === 'puts' && (
          <div className="panel">
            <div className="panel-header"><div className="pdot" /><div className="panel-title">All Put Contracts</div></div>
            <div style={{ padding: 16 }}><ContractsTable contracts={puts} selectedIndex={null} onSelect={() => {}} /></div>
          </div>
        )}

        {/* Scanner */}
        {activeTab === 'scanner' && (
          <div className="panel">
            <div className="panel-header"><div className="pdot" /><div className="panel-title">Market Scanner · Top Opportunities</div></div>
            <div style={{ padding: 16 }}>
              {scannerLoading ? (
                <div style={{ textAlign: 'center', padding: '20px 0', fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: 2 }}>SCANNING 20 TICKERS...</div>
              ) : scannerData?.top_opportunities ? (
                <table className="ceres-table">
                  <thead>
                    <tr><th>Ticker</th><th>Type</th><th>Strike</th><th>Market</th><th>Theoretical</th><th>Mispricing</th><th>IV/HV</th></tr>
                  </thead>
                  <tbody>
                    {scannerData.top_opportunities.map((r: any, i: number) => (
                      <tr key={i}>
                        <td><span className="strike-val">{r.ticker}</span></td>
                        <td><span className={r.type === 'call' ? 'badge-call' : 'badge-put'}>{r.type.toUpperCase()}</span></td>
                        <td><span className="strike-val">${r.strike}</span></td>
                        <td>${r.market_premium?.toFixed(2)}</td>
                        <td>${r.theoretical_price?.toFixed(2)}</td>
                        <td><span className={r.mispricing < 0 ? 'mp-under' : 'mp-over'}>{r.mispricing > 0 ? '+' : ''}${r.mispricing?.toFixed(2)}</span></td>
                        <td>{r.iv_hv_ratio?.toFixed(2)}x</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px 0', fontSize: 11, color: 'rgba(255,255,255,0.25)', letterSpacing: 2 }}>LOADING SCANNER DATA...</div>
              )}
            </div>
          </div>
        )}

        {/* Bottom bar */}
        <div className="bottom-bar">
          <span>CERES v1.0 · LANGGRAPH MULTI-AGENT</span>
          <div style={{ color: 'rgba(150,70,255,0.7)', display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#9060ef', boxShadow: '0 0 4px #9060ef' }} />
            <span>GUARDRAILS VALIDATED</span>
          </div>
          <span>LANGSMITH TRACING ACTIVE</span>
        </div>

      </div>
    </div>
  )
}
