export type SearchResultItem = {
  id: string
  title: string
  author: string
  durationSec: number
  durationLabel: string
}

export interface SearchService {
  search(query: string, limit: number): Promise<SearchResultItem[]>
}
