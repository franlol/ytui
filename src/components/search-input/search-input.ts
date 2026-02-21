import { Box, Text } from "@opentui/core"
import type { SearchInputProps } from "./search-input.types"

export function SearchInput(props: SearchInputProps) {
  return Box(
    {
      height: 3,
      borderStyle: "single",
      borderColor: props.theme.border,
      title: "Search",
      backgroundColor: props.theme.panel,
      padding: 1,
    },
    Text({
      content: `[ ${props.query} ]`,
      fg: props.theme.text,
    }),
  )
}
