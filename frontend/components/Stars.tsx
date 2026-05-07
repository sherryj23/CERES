'use client'
import { useEffect, useRef } from 'react'

export default function Stars() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const container = ref.current
    for (let i = 0; i < 130; i++) {
      const star = document.createElement('div')
      const sz = Math.random() * 1.8 + 0.4
      star.style.cssText = `
        position:absolute;
        width:${sz}px;height:${sz}px;
        top:${Math.random() * 100}%;
        left:${Math.random() * 100}%;
        background:white;border-radius:50%;
        --d:${2 + Math.random() * 5}s;
        --o:${0.2 + Math.random() * 0.7};
        --dl:${Math.random() * 5}s;
        animation:twinkle var(--d) ease-in-out infinite var(--dl);
        opacity:0;
      `
      container.appendChild(star)
    }
  }, [])

  return (
    <>
      <div ref={ref} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }} />
      <div style={{
        position: 'absolute', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0,
        width: 500, height: 300,
        background: 'radial-gradient(ellipse, rgba(110,35,200,0.28) 0%, transparent 70%)',
        top: -100, left: -80,
        animation: 'nd 22s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0,
        width: 320, height: 320,
        background: 'radial-gradient(ellipse, rgba(55,15,160,0.22) 0%, transparent 70%)',
        bottom: -60, right: -40,
        animation: 'nd2 28s ease-in-out infinite',
      }} />
      <style>{`
        @keyframes nd { 0%,100%{transform:translate(0,0)} 50%{transform:translate(40px,25px)} }
        @keyframes nd2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-25px,-18px)} }
      `}</style>
    </>
  )
}
