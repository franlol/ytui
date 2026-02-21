export type ProgressStyleDefinition = {
  id: string
  label: string
  description: string
  render: (ratio: number, width: number) => string
}
