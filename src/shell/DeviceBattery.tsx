import { Headphones, Watch, Mouse, Keyboard, Speaker, Smartphone, Bluetooth } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useWidgetData } from '../components/useWidgetData'
import { provider } from '../data/providerFactory'
import type { DeviceKind } from '../data/types'
import styles from './DeviceBattery.module.css'

const ICONS: Record<DeviceKind, LucideIcon> = {
  earbuds: Headphones,
  headphones: Headphones,
  watch: Watch,
  mouse: Mouse,
  keyboard: Keyboard,
  speaker: Speaker,
  phone: Smartphone,
}

function level(pct: number): 'low' | 'mid' | 'high' {
  if (pct <= 20) return 'low'
  if (pct <= 50) return 'mid'
  return 'high'
}

const SIZE = 30
const STROKE = 2.25
const R = (SIZE - STROKE) / 2
const CIRC = 2 * Math.PI * R

export function DeviceBattery() {
  const { data } = useWidgetData(provider.getDevices)
  const devices = (data ?? []).filter((d) => d.connected)
  if (devices.length === 0) return null

  return (
    <div className={styles.tray} role="list" aria-label="Bluetooth device battery">
      {devices.map((d) => {
        const Icon = ICONS[d.kind] ?? Bluetooth
        const lvl = level(d.batteryPct)
        const offset = CIRC * (1 - d.batteryPct / 100)
        return (
          <div
            key={d.id}
            className={styles.badge}
            role="listitem"
            tabIndex={0}
            aria-label={`${d.name}: ${d.batteryPct}% battery`}
          >
            <span className={styles.ring} data-level={lvl}>
              <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden="true">
                <circle className={styles.track} cx={SIZE / 2} cy={SIZE / 2} r={R} strokeWidth={STROKE} fill="none" />
                <circle
                  className={styles.arc}
                  cx={SIZE / 2}
                  cy={SIZE / 2}
                  r={R}
                  strokeWidth={STROKE}
                  fill="none"
                  strokeDasharray={CIRC}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
                />
              </svg>
              <span className={styles.icon} aria-hidden="true">
                <Icon size={13} strokeWidth={2} />
              </span>
            </span>
            <span className={styles.pct} data-level={lvl} data-testid="tray-battery">
              {d.batteryPct}%
            </span>
            <span className={styles.tip} role="tooltip">
              {d.name}
            </span>
          </div>
        )
      })}
    </div>
  )
}
