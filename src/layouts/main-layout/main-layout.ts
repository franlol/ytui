import { Box } from "@opentui/core"
import { CavaPanel } from "../../components/cava-panel/cava-panel"
import { NowPlaying } from "../../components/now-playing/now-playing"
import { QueueList } from "../../components/queue-list/queue-list"
import { ResultsList } from "../../components/results-list/results-list"
import { SearchInput } from "../../components/search-input/search-input"
import { Sidebar } from "../../components/sidebar/sidebar"
import type { MainLayoutProps } from "./main-layout.types"

export function MainLayout(props: MainLayoutProps) {
  const isSearch = props.state.ui.mode === "search"
  const contentWidth = Math.max(24, props.width - (props.state.ui.sidebarCollapsed ? 8 : 30))
  const topbarRows = 1
  const statuslineRows = 1
  const outerPaddingRows = 2
  const gapRows = isSearch ? 3 : 2
  const searchRows = isSearch ? 4 : 0
  const nowPlayingRows = 5
  const cavaRows = Math.max(3, props.state.settings.cavaHeight + 2)
  const fixedRows = topbarRows + statuslineRows + outerPaddingRows + gapRows + searchRows + nowPlayingRows + cavaRows
  const listHeightRows = Math.max(0, props.height - fixedRows)
  const showListPanel = listHeightRows >= 3

  return Box(
    {
      width: "100%",
      flexGrow: 1,
      flexDirection: "row",
      gap: 1,
      padding: 1,
    },
    Sidebar({
      collapsed: props.state.ui.sidebarCollapsed,
      mode: props.state.ui.mode,
      theme: props.theme,
    }),
    Box(
      {
        flexGrow: 1,
        flexDirection: "column",
        gap: 1,
      },
      ...(isSearch
        ? [
            SearchInput({
              query: props.state.search.query,
              theme: props.theme,
            }),
          ]
        : []),
      ...(showListPanel
        ? [
            isSearch
              ? ResultsList({
                  totalCount: props.state.search.results.length,
                  heightRows: listHeightRows,
                  theme: props.theme,
                  selectRenderable: props.resultsSelect,
                })
              : QueueList({
                  totalCount: props.state.queue.tracks.length,
                  heightRows: listHeightRows,
                  theme: props.theme,
                  selectRenderable: props.queueSelect,
                }),
          ]
        : []),
      NowPlaying({
        track: props.state.playback.nowPlaying,
        elapsedSec: props.state.playback.elapsedSec,
        durationSec: props.state.playback.durationSec,
        progressStyleId: props.state.settings.progressStyleId,
        progressRegistry: props.progressStyleRegistry,
        theme: props.theme,
        width: contentWidth,
      }),
      CavaPanel({
        phase: props.state.visualizer.phase,
        width: Math.max(16, props.width - (props.state.ui.sidebarCollapsed ? 8 : 30)),
        lines: props.state.settings.cavaHeight,
        theme: props.theme,
      }),
    ),
  )
}
