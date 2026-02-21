export type VisualizerFrameListener = (bars: number[]) => void

export type VisualizerErrorListener = (error: string) => void

export type VisualizerSession = {
  id: string
  source: string
}

export interface VisualizerService {
  start(session: VisualizerSession, onFrame: VisualizerFrameListener, onError: VisualizerErrorListener): Promise<void>
  stop(): Promise<void>
}
