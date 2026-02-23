'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

export interface HexagonBackgroundProps {
  className?: string
  children?: React.ReactNode
  hexagonSize?: number
  hexagonMargin?: number
  glowColor?: string
  borderColor?: string
}

export function HexagonBackground({
  className,
  children,
  hexagonSize = 60,
  hexagonMargin = 2,
  glowColor = 'rgba(16, 185, 129, 0.6)', // emerald-500
  borderColor = 'rgba(63, 63, 70, 0.5)',
}: HexagonBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [grid, setGrid] = useState({ rows: 0, cols: 0, scale: 1 })

  // Imperative refs — no React state in the hot path
  const hexElemsRef = useRef<Map<string, HTMLDivElement>>(new Map())
  const hexCentersRef = useRef<Array<{ key: string; x: number; y: number }>>([])
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const rafRef = useRef<number | undefined>(undefined)

  const hexWidth = hexagonSize
  const hexHeight = hexagonSize * 1.15
  const rowSpacing = hexagonSize * 0.86

  const updateGrid = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    const { width, height } = container.getBoundingClientRect()
    const scale = Math.max(1, Math.min(width, height) / 800)
    const scaledSize = hexagonSize * scale

    const cols = Math.ceil(width / scaledSize) + 2
    const rows = Math.ceil(height / (scaledSize * 0.86)) + 2

    setGrid({ rows, cols, scale })
  }, [hexagonSize])

  useEffect(() => {
    updateGrid()
    const container = containerRef.current
    if (!container) return

    const ro = new ResizeObserver(updateGrid)
    ro.observe(container)
    return () => ro.disconnect()
  }, [updateGrid])

  // After each grid rebuild, read all hexagon centers from the DOM once.
  // Ref callbacks fire during commit (before effects), so hexElemsRef is
  // fully populated by the time this effect runs.
  useEffect(() => {
    if (grid.rows === 0) return
    const centers: Array<{ key: string; x: number; y: number }> = []
    hexElemsRef.current.forEach((el, key) => {
      const rect = el.getBoundingClientRect()
      centers.push({ key, x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })
    })
    hexCentersRef.current = centers
  }, [grid])

  // Track mouse on window (not the hidden layer) + animate proximity glow
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousemove', handleMouseMove)

    const PROX_SQ = 80 * 80

    const tick = () => {
      const { x: mx, y: my } = mouseRef.current
      for (const { key, x, y } of hexCentersRef.current) {
        const dx = x - mx
        const dy = y - my
        const el = hexElemsRef.current.get(key)
        if (el) el.dataset.active = dx * dx + dy * dy < PROX_SQ ? 'true' : 'false'
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const scaledHexWidth = hexWidth * grid.scale
  const scaledHexHeight = hexHeight * grid.scale
  const scaledRowSpacing = rowSpacing * grid.scale
  const scaledMargin = hexagonMargin * grid.scale

  const hexagonStyle = useMemo(
    () => ({
      width: scaledHexWidth,
      height: scaledHexHeight,
      marginLeft: scaledMargin,
      '--glow-color': glowColor,
      '--border-color': borderColor,
      '--margin': `${scaledMargin}px`,
    }),
    [scaledHexWidth, scaledHexHeight, scaledMargin, glowColor, borderColor],
  )

  return (
    <div
      ref={containerRef}
      className={cn('fixed inset-0 overflow-hidden bg-zinc-950', className)}
    >
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: grid.rows }).map((_, rowIndex) => {
          const isOddRow = rowIndex % 2 === 1
          const marginLeft = isOddRow ? -(scaledHexWidth / 2) + scaledMargin : scaledMargin

          return (
            <div
              key={rowIndex}
              className="flex"
              style={{
                marginTop: rowIndex === 0 ? -scaledHexHeight * 0.25 : -scaledRowSpacing * 0.16,
                marginLeft: marginLeft - scaledHexWidth * 0.1,
              }}
            >
              {Array.from({ length: grid.cols }).map((_, colIndex) => {
                const key = `${rowIndex}-${colIndex}`
                return (
                  <div
                    key={key}
                    ref={(el) => {
                      if (el) hexElemsRef.current.set(key, el)
                      else hexElemsRef.current.delete(key)
                    }}
                    data-active="false"
                    className={cn(
                      'relative shrink-0 transition-all duration-700',
                      '[clip-path:polygon(50%_0%,100%_25%,100%_75%,50%_100%,0%_75%,0%_25%)]',
                      // Border layer
                      'before:absolute before:inset-0 before:bg-[var(--border-color)]',
                      'before:transition-all before:duration-700',
                      // Inner fill
                      'after:absolute after:inset-[var(--margin)] after:bg-zinc-950',
                      'after:[clip-path:polygon(50%_0%,100%_25%,100%_75%,50%_100%,0%_75%,0%_25%)]',
                      'after:transition-all after:duration-300',
                      // Proximity active state (set via data-active by JS)
                      'data-[active=true]:before:bg-[var(--glow-color)] data-[active=true]:before:duration-0',
                      'data-[active=true]:after:bg-zinc-900 data-[active=true]:after:duration-0',
                      'data-[active=true]:before:shadow-[0_0_20px_var(--glow-color)]',
                    )}
                    style={hexagonStyle as React.CSSProperties}
                  />
                )
              })}
            </div>
          )
        })}
      </div>

      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(ellipse at 30% 20%, rgba(16,185,129,0.15) 0%, transparent 50%),
                       radial-gradient(ellipse at 70% 80%, rgba(16,185,129,0.1) 0%, transparent 50%)`,
        }}
      />

      {/* Vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 0%, transparent 40%, rgba(10,10,10,0.8) 100%)',
        }}
      />

      {children && <div className="relative z-10 h-full w-full">{children}</div>}
    </div>
  )
}
