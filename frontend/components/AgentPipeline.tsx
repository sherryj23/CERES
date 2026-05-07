'use client'

interface Agent {
  name: string
  desc: string
  icon: string
  iconBg: string
  status: 'idle' | 'active' | 'done'
  progress: number
  detail: string
}

interface AgentPipelineProps {
  agents: Agent[]
  onAgentClick: (detail: string) => void
}

export default function AgentPipeline({ agents, onAgentClick }: AgentPipelineProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {agents.map((agent, i) => (
        <div
          key={i}
          className={`agent-row${agent.status === 'active' ? ' running' : agent.status === 'done' ? ' done' : ''}`}
          onClick={() => agent.status !== 'idle' && onAgentClick(agent.detail)}
        >
          <div style={{
            width: 30, height: 30, borderRadius: 7,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, flexShrink: 0,
            background: agent.iconBg,
            border: `1px solid ${agent.iconBg.replace('0.1', '0.2')}`,
          }}>
            {agent.icon}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'white', letterSpacing: 1, textTransform: 'uppercase' }}>
              {agent.name}
            </div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.28)', marginTop: 2 }}>
              {agent.desc}
            </div>
            <div className="pbar">
              <div className="pfill" style={{ width: `${agent.progress}%` }} />
            </div>
          </div>
          <div className={`astat astat-${agent.status === 'active' ? 'active' : agent.status === 'done' ? 'done' : 'idle'}`} />
        </div>
      ))}
    </div>
  )
}
