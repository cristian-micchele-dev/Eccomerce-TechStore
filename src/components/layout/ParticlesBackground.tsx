"use client"

import { useEffect, useState } from "react"
import Particles, { initParticlesEngine } from "@tsparticles/react"
import { loadSlim } from "@tsparticles/slim"

export function ParticlesBackground() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine)
    }).then(() => setReady(true))
  }, [])

  if (!ready) return null

  return (
    <Particles
      id="tsparticles"
      options={{
        fullScreen: { enable: true, zIndex: 0 },
        background: { color: { value: "transparent" } },
        fpsLimit: 60,
        particles: {
          color: { value: "#ef4444" },
          links: {
            color: "#ef4444",
            distance: 140,
            enable: true,
            opacity: 0.18,
            width: 1,
          },
          move: {
            enable: true,
            speed: 0.45,
            direction: "none",
            random: true,
            straight: false,
            outModes: { default: "bounce" },
          },
          number: {
            density: { enable: true, width: 1000 },
            value: 65,
          },
          opacity: { value: 0.45 },
          size: { value: { min: 1.5, max: 3 } },
          shape: { type: "circle" },
        },
        detectRetina: true,
      }}
    />
  )
}
