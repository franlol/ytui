import type { SearchInputProps } from "./search-input.types"

export function SearchInput(props: SearchInputProps) {
  return (
    <box height={3} borderStyle="single" borderColor={props.theme.border} title="Search" backgroundColor={props.theme.panel} padding={1}>
      <text content={`[ ${props.query} ]`} fg={props.theme.text} />
    </box>
  )
}
