'use client'

import { useEffect } from 'react'

export default function UnicornBackground() {
  useEffect(() => {
    const existing = document.getElementById('unicorn-studio-script')
    if (existing) {
      // Script already loaded — just init if available
      const u = (window as Window & { UnicornStudio?: { isInitialized: boolean; init: () => void } }).UnicornStudio
      if (u?.init) u.init()
      return
    }

    const script = document.createElement('script')
    script.id = 'unicorn-studio-script'
    script.src = 'https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.0.5/dist/unicornStudio.umd.js'
    script.onload = () => {
      const u = (window as Window & { UnicornStudio?: { isInitialized: boolean; init: () => void } }).UnicornStudio
      if (u?.init) u.init()
    }
    ;(document.head || document.body).appendChild(script)
  }, [])

  return (
    <div className="hidden md:block fixed inset-0 -z-10 overflow-hidden">
      <div
        data-us-project="zc6zz1De8Rb9CruaUOoH"
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      />
    </div>
  )
}
