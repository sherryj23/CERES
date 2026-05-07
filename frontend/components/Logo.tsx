'use client'

export default function Logo() {
  return (
    <div style={{
      width: 48, height: 48, borderRadius: '50%',
      border: '1.5px solid rgba(150,70,255,0.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', flexShrink: 0,
    }}>
      <div style={{
        position: 'absolute', inset: -6, borderRadius: '50%',
        border: '1px solid rgba(150,70,255,0.18)',
      }} />
      <div style={{
        width: 26, height: 26, borderRadius: '50%',
        background: 'linear-gradient(135deg, #5010c0, #9050ef)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: 10, color: 'white',
      }}>C</div>
      <div style={{
        width: 8, height: 8, borderRadius: '50%',
        background: '#a060ff', boxShadow: '0 0 8px #a060ff',
        position: 'absolute',
        animation: 'orbit 4s linear infinite',
      }} />
      <style>{`@keyframes orbit{from{transform:rotate(0deg) translateX(34px) rotate(0deg)}to{transform:rotate(360deg) translateX(34px) rotate(-360deg)}}`}</style>
    </div>
  )
}
