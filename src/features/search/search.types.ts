import type { Track } from "../../types/app.types"

export type SearchState = {
  query: string
  results: Track[]
  selectedIndex: number
  isLoading: boolean
  error: string | null
}
