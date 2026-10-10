'use client'

import type { HTMLAttributes } from 'react'

/** Standalone tools do not depend on Studio authentication or activity storage. */
export function useToolJourney(_toolId: string, _ready = true): HTMLAttributes<HTMLDivElement> {
  return {}
}
