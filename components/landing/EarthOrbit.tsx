'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type * as THREE from 'three'

/* ─── Pure Three.js 3D Earth ─────────────────────────────────────────────── */
async function buildEarth(canvas: HTMLCanvasElement, onReady: () => void) {
  const THREE = await import('three')

  const W = canvas.clientWidth  || 400
  const H = canvas.clientHeight || 400

  /* Renderer */
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(W, H)
  renderer.setClearColor(0x000000, 0)

  /* Scene + Camera */
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100)
  camera.position.z = 2.4

  /* Lights */
  const sun = new THREE.DirectionalLight(0xffffff, 1.8)
  sun.position.set(5, 3, 5)
  scene.add(sun)
  scene.add(new THREE.AmbientLight(0x223344, 0.5))

  const loader = new THREE.TextureLoader()
  const loadTex = (url: string): Promise<THREE.Texture> =>
    new Promise((res, rej) => loader.load(url, res, undefined, rej))

  /* Load locally-served textures */
  const [dayMap, cloudsMap] = await Promise.all([
    loadTex('/earth_day.png'),
    loadTex('/earth_clouds.png'),
  ]).catch(() => [null, null])

  /* ── Earth sphere ── */
  const earthGeo = new THREE.SphereGeometry(1, 64, 64)
  const earthMat = new THREE.MeshPhongMaterial({
    map:       dayMap   || undefined,
    specular:  new THREE.Color(0x3399bb),
    shininess: 15,
  })
  const earth = new THREE.Mesh(earthGeo, earthMat)
  scene.add(earth)

  /* ── Clouds layer ── */
  const cloudGeo = new THREE.SphereGeometry(1.01, 64, 64)
  const cloudMat = new THREE.MeshPhongMaterial({
    map:         cloudsMap || undefined,
    transparent: true,
    opacity:     0.28,
    depthWrite:  false,
  })
  const clouds = new THREE.Mesh(cloudGeo, cloudMat)
  scene.add(clouds)

  /* ── Atmosphere glow (additive blending rim) ── */
  const atmGeo = new THREE.SphereGeometry(1.08, 64, 64)
  const atmMat = new THREE.MeshPhongMaterial({
    color:       0x7ddfaa,
    transparent: true,
    opacity:     0.08,
    side:        THREE.BackSide,
    depthWrite:  false,
    blending:    THREE.AdditiveBlending,
  })
  scene.add(new THREE.Mesh(atmGeo, atmMat))

  /* ── Stars background ── */
  const starVerts: number[] = []
  for (let i = 0; i < 800; i++) {
    starVerts.push(
      (Math.random() - 0.5) * 80,
      (Math.random() - 0.5) * 80,
      (Math.random() - 0.5) * 80,
    )
  }
  const starGeo = new THREE.BufferGeometry()
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starVerts, 3))
  const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.12 }))
  scene.add(stars)

  onReady()

  /* ── Mouse drag ── */
  let isDragging = false
  let prevX = 0, prevY = 0
  let rotX = 0, rotY = 0
  let velX = 0, velY = 0

  const onDown = (e: MouseEvent | TouchEvent) => {
    isDragging = true
    const pt = 'touches' in e ? e.touches[0] : e
    prevX = pt.clientX; prevY = pt.clientY
    velX = velY = 0
  }
  const onMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging) return
    const pt = 'touches' in e ? e.touches[0] : e
    const dx = pt.clientX - prevX
    const dy = pt.clientY - prevY
    velX = dx * 0.008; velY = dy * 0.006
    rotY += velX; rotX += velY
    prevX = pt.clientX; prevY = pt.clientY
  }
  const onUp = () => { isDragging = false }

  canvas.addEventListener('mousedown',  onDown)
  canvas.addEventListener('mousemove',  onMove)
  canvas.addEventListener('mouseup',    onUp)
  canvas.addEventListener('mouseleave', onUp)
  canvas.addEventListener('touchstart', onDown, { passive: true })
  canvas.addEventListener('touchmove',  onMove, { passive: true })
  canvas.addEventListener('touchend',   onUp)

  /* ── Animation loop ── */
  let frameId = 0
  const tick = () => {
    frameId = requestAnimationFrame(tick)

    if (!isDragging) {
      velX *= 0.96
      velY *= 0.96
      rotY += 0.002 + velX
      rotX += velY
    }

    earth.rotation.y  = rotY
    earth.rotation.x  = rotX
    clouds.rotation.y = rotY + 0.0005
    clouds.rotation.x = rotX

    renderer.render(scene, camera)
  }
  tick()

  /* Handle resize */
  const onResize = () => {
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
  }
  window.addEventListener('resize', onResize)

  /* Cleanup */
  return () => {
    cancelAnimationFrame(frameId)
    window.removeEventListener('resize', onResize)
    canvas.removeEventListener('mousedown',  onDown)
    canvas.removeEventListener('mousemove',  onMove)
    canvas.removeEventListener('mouseup',    onUp)
    canvas.removeEventListener('mouseleave', onUp)
    canvas.removeEventListener('touchstart', onDown)
    canvas.removeEventListener('touchmove',  onMove)
    canvas.removeEventListener('touchend',   onUp)
    renderer.dispose()
  }
}

/* ─── Component ──────────────────────────────────────────────────────────── */
export default function EarthOrbit() {
  const canvasRef   = useRef<HTMLCanvasElement>(null)
  const [isOpen,    setIsOpen]   = useState(false)
  const [isLoaded,  setIsLoaded] = useState(false)

  useEffect(() => {
    if (!canvasRef.current) return
    let cleanup: (() => void) | undefined

    buildEarth(canvasRef.current, () => setIsLoaded(true)).then(fn => { cleanup = fn })

    return () => { cleanup?.() }
  }, [])

  return (
    <div className="relative flex items-center justify-center" style={{ width: 420, height: 420 }}>

      {/* Orbit rings */}
      <div className="orbit-ring absolute" style={{ width: 320, height: 320, animationDuration: '20s' }} />
      <div className="orbit-ring absolute" style={{ width: 380, height: 380, animationDuration: '35s', animationDirection: 'reverse', borderColor: 'rgba(125,223,170,0.08)' }} />
      <div className="orbit-ring absolute" style={{ width: 420, height: 420, animationDuration: '50s', borderStyle: 'dashed', borderColor: 'rgba(202,255,51,0.06)' }} />

      {/* Orbiting dots */}
      <div className="absolute" style={{ width: 320, height: 320, animation: 'earthSpin 20s linear infinite' }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-lime shadow-lime" />
      </div>
      <div className="absolute" style={{ width: 380, height: 380, animation: 'earthSpin 35s linear infinite reverse' }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-mint" />
      </div>

      {/* Atmosphere glow backdrop */}
      <div className="absolute w-52 h-52 rounded-full bg-lime/10 blur-[60px] pointer-events-none" />

      {/* 3D Earth canvas – clickable */}
      <button
        onClick={() => setIsOpen(true)}
        className="absolute flex items-center justify-center group/globe outline-none focus:ring-2 focus:ring-lime/50 rounded-full"
        style={{ width: 220, height: 220, background: 'none', border: 'none', cursor: isLoaded ? 'pointer' : 'default' }}
        aria-label="Explore NASA 3D Earth"
      >
        {/* Loading skeleton */}
        {!isLoaded && (
          <div className="absolute inset-0 rounded-full bg-bg2 border border-border animate-pulse flex items-center justify-center">
            <span className="text-3xl animate-spin" style={{ animationDuration: '3s' }}>🌍</span>
          </div>
        )}

        <canvas
          ref={canvasRef}
          style={{
            width: 220, height: 220,
            borderRadius: '50%',
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.8s ease',
            cursor: 'grab',
          }}
        />

        {/* Hover badge */}
        {isLoaded && (
          <span
            className="absolute pointer-events-none scale-0 group-hover/globe:scale-100 transition-transform duration-200 origin-bottom"
            style={{ bottom: -22 }}
          >
            <span className="flex items-center gap-1 bg-black/80 backdrop-blur border border-lime/30 text-lime text-[10px] font-medium px-2.5 py-1 rounded-full shadow-lime whitespace-nowrap">
              🌍 Explore in 3D
            </span>
          </span>
        )}
      </button>

      {/* Floating stat cards */}
      <FloatingCard style={{ top: '10%', right: '0%' }}   delay={0}   icon="🌡️" label="+1.2°C" sub="Global warming" />
      <FloatingCard style={{ bottom: '15%', left: '0%' }} delay={0.5} icon="🏭" label="37 Gt"  sub="Annual CO₂" />
      <FloatingCard style={{ top: '50%', right: '-5%' }}  delay={1}   icon="🌿" label="5.5 kg" sub="Daily target" />

      {/* ── NASA 3D Earth Modal ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="earth-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8"
            style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)' }}
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              key="earth-modal"
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1,   y: 0  }}
              exit={{ opacity: 0,   scale: 0.9, y: 30  }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="relative w-full flex flex-col overflow-hidden"
              style={{
                maxWidth: 900,
                height: '82vh',
                background: 'linear-gradient(160deg, #0E1A12 0%, #060C08 100%)',
                border: '1px solid rgba(125,223,170,0.15)',
                borderRadius: 28,
                boxShadow: '0 0 80px rgba(202,255,51,0.08), 0 40px 100px rgba(0,0,0,0.8)',
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
                   style={{ borderBottom: '1px solid rgba(125,223,170,0.1)', background: 'rgba(255,255,255,0.02)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl"
                       style={{ background: 'rgba(202,255,51,0.1)', border: '1px solid rgba(202,255,51,0.2)' }}>
                    🌍
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sand text-base leading-tight">NASA 3D Earth Model</h3>
                    <p className="text-muted text-[11px] mt-0.5">Interactive · Drag to rotate · Scroll to zoom</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* NASA badge */}
                  <span className="hidden sm:flex items-center gap-1.5 text-[10px] text-muted border border-border px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse" />
                    NASA Solar System Exploration
                  </span>
                  {/* Close */}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(125,223,170,0.1)' }}
                    aria-label="Close"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* iframe */}
              <div className="flex-1 relative overflow-hidden" style={{ background: '#000' }}>
                <iframe
                  src="https://solarsystem.nasa.gov/gltf_embed/2393/"
                  title="NASA 3D Earth"
                  className="w-full h-full"
                  style={{ border: 'none' }}
                  allow="fullscreen; autoplay; xr-spatial-tracking"
                  allowFullScreen
                />
                {/* Corner decoration */}
                <div className="absolute top-3 right-3 pointer-events-none">
                  <div className="flex gap-1.5">
                    {['bg-lime/40','bg-mint/40','bg-blue/40'].map(c => (
                      <div key={c} className={`w-2 h-2 rounded-full ${c} animate-pulse`}
                           style={{ animationDelay: c === 'bg-lime/40' ? '0s' : c === 'bg-mint/40' ? '0.5s' : '1s' }} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-3 flex-shrink-0 flex items-center justify-between"
                   style={{ borderTop: '1px solid rgba(125,223,170,0.07)', background: 'rgba(255,255,255,0.015)' }}>
                <div className="flex items-center gap-4 text-[11px] text-muted">
                  <span className="flex items-center gap-1.5">
                    <kbd className="px-1.5 py-0.5 rounded text-[9px] border border-border bg-card font-mono">drag</kbd>
                    Rotate
                  </span>
                  <span className="flex items-center gap-1.5">
                    <kbd className="px-1.5 py-0.5 rounded text-[9px] border border-border bg-card font-mono">scroll</kbd>
                    Zoom
                  </span>
                  <span className="flex items-center gap-1.5">
                    <kbd className="px-1.5 py-0.5 rounded text-[9px] border border-border bg-card font-mono">click+drag</kbd>
                    Pan
                  </span>
                </div>
                <a
                  href="https://solarsystem.nasa.gov/planets/earth/overview/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-lime/60 hover:text-lime transition-colors"
                >
                  NASA.gov ↗
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─── FloatingCard ─────────────────────────────────────────────────────────── */
function FloatingCard({ style, delay, icon, label, sub }: {
  style: React.CSSProperties
  delay: number
  icon: string
  label: string
  sub: string
}) {
  return (
    <div
      className="absolute glass-card px-3 py-2 text-center min-w-[90px] animate-float"
      style={{ ...style, animationDelay: `${delay}s` }}
    >
      <div className="text-lg">{icon}</div>
      <div className="font-display font-bold text-lime text-sm">{label}</div>
      <div className="text-muted text-[10px]">{sub}</div>
    </div>
  )
}
