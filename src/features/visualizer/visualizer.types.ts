export type VisualizerState = {
  bars: number[]
  running: boolean
  unavailable: boolean
  error: string | null
  sessionId: string | null
}
