import React from 'react'

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number
}

function Svg({ size = 16, children, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  )
}

/* ---- Brand ---- */

export const MedusaMark: React.FC<IconProps> = ({ size = 28, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false" {...rest}>
    <rect width="32" height="32" rx="8" fill="#101514" />
    <rect x="0.5" y="0.5" width="31" height="31" rx="7.5" stroke="rgba(255,255,255,0.09)" fill="none" />
    <path d="M8 22V11l5 6 3-4 3 4 5-6v11" stroke="#34b98a" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
)

/* ---- Interface ---- */

export const IconBolt: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M13 3 5 13.5h5.5L11 21l8-10.5h-5.5L13 3Z" />
  </Svg>
)

export const IconBook: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5v14A2.5 2.5 0 0 0 6.5 22H20v-5" />
  </Svg>
)

export const IconWallet: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M19 9V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H3" />
    <path d="M16.5 13h.01" />
  </Svg>
)

export const IconTerminal: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <rect x="3" y="4.5" width="18" height="15" rx="2" />
    <path d="m7 9.5 3 3-3 3M12.5 15.5H17" />
  </Svg>
)

export const IconCopy: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <rect x="9" y="9" width="12" height="12" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </Svg>
)

export const IconCheck: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="m4 12.5 5 5L20 6.5" />
  </Svg>
)

export const IconExternal: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M14 4h6v6M20 4 11 13" />
    <path d="M20 14.5V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h4.5" />
  </Svg>
)

export const IconArrowRight: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M4 12h16M14 6l6 6-6 6" />
  </Svg>
)

export const IconArrowDown: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M12 4v16M6 14l6 6 6-6" />
  </Svg>
)

export const IconChevronDown: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="m6 9 6 6 6-6" />
  </Svg>
)

export const IconX: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Svg>
)

export const IconRefresh: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M21 12a9 9 0 1 1-2.64-6.36" />
    <path d="M21 3v6h-6" />
  </Svg>
)

export const IconAlert: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M12 4 2.8 20h18.4L12 4Z" />
    <path d="M12 10.5V14M12 17h.01" />
  </Svg>
)

export const IconPulse: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M3 12h4l2.5-7.5 4.5 15L16.5 12H21" />
  </Svg>
)

export const IconLock: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </Svg>
)

/* ---- Domain ---- */

export const IconVault: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="2.5" />
    <path d="M12 3.5V7M12 17v3.5M3.5 12H7M17 12h3.5" />
  </Svg>
)

export const IconScan: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2" />
    <circle cx="12" cy="12" r="3" />
  </Svg>
)

export const IconFileDiff: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M14.5 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7.5L14.5 3Z" />
    <path d="M14.5 3v4.5H19" />
    <path d="M9 12.5h3M15 17h-3M13.5 18.5v-3" />
  </Svg>
)

export const IconShieldCheck: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M12 3l7 2.8v5.4c0 4.4-2.9 8.3-7 9.8-4.1-1.5-7-5.4-7-9.8V5.8L12 3Z" />
    <path d="m9 12 2.2 2.2L15.5 9.5" />
  </Svg>
)

export const IconLinkChain: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M9.5 14.5 14.5 9.5" />
    <path d="m11.5 7.5 1.7-1.7a3.54 3.54 0 0 1 5 5L16.5 12.5" />
    <path d="m12.5 16.5-1.7 1.7a3.54 3.54 0 0 1-5-5L7.5 11.5" />
  </Svg>
)

export const IconCoins: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5v9" />
    <path d="M14.6 9.4c-.5-.8-1.5-1.3-2.6-1.3-1.5 0-2.7.9-2.7 2s1.2 1.7 2.7 1.9c1.5.2 2.7.8 2.7 1.9s-1.2 2-2.7 2c-1.1 0-2.1-.5-2.6-1.3" />
  </Svg>
)

export const IconGlobe: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3a13.5 13.5 0 0 1 0 18M12 3a13.5 13.5 0 0 0 0 18" />
  </Svg>
)

export const IconLedger: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M4 5.5h16M4 12h16M4 18.5h10" />
    <path d="m17.5 17 1.8 1.8 3-3.3" transform="translate(-1.5 -0.5)" />
  </Svg>
)

export const IconClock: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </Svg>
)
