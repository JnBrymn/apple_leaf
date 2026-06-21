// @ts-nocheck
import type { GameRuntime } from './runtime'

export function runInitCalls(g: GameRuntime) {
      g.applyScreenLabels();
      g.releaseStuckUI();
      g.updateCarrierUI();
}
