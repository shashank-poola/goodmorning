import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'

interface Props {
  icon: IconSvgElement
  size?: number
  className?: string
  strokeWidth?: number
}

export function Icon({ icon, size = 20, className, strokeWidth = 1.75 }: Props) {
  return <HugeiconsIcon icon={icon} size={size} className={className} strokeWidth={strokeWidth} />
}
