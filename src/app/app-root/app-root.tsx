import type { KeyEvent } from "@opentui/core"
import { useKeyboard, useTerminalDimensions } from "@opentui/react"
import { useCallback, useEffect, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { parseCommandInput } from "../../features/commands/command-parser/command-parser"
import { runPlayTrackThunk, runSeekPlaybackThunk, runSyncPlaybackProgressThunk, runTogglePauseResumeThunk } from "../../features/playback/playback.thunks"
import { queueActions } from "../../features/queue/queue.slice"
import { searchActions } from "../../features/search/search.slice"
import { runSearchThunk } from "../../features/search/search.thunks"
import { settingsActions } from "../../features/settings/settings.slice"
import { uiActions } from "../../features/ui/ui.slice"
import { RootLayout } from "../../layouts/root-layout/root-layout"
import type { ThemeDefinition } from "../../registries/themes/theme.registry.types"
import type { AppDispatch, RootState } from "../../state/store/store.types"
import type { AppRootProps } from "./app-root.types"

function handleThemePickerKey(
  key: KeyEvent,
  themes: ThemeDefinition[],
  selectedIndex: number,
  previousId: string,
  dispatch: AppDispatch,
): void {
  if (key.name === "j" || key.name === "down") {
    const nextIndex = Math.min(selectedIndex + 1, themes.length - 1)
    dispatch(uiActions.moveThemePickerDown(themes.length))
    const next = themes[nextIndex]
    if (next) dispatch(settingsActions.setTheme(next.id))
    return
  }
  if (key.name === "k" || key.name === "up") {
    const nextIndex = Math.max(0, selectedIndex - 1)
    dispatch(uiActions.moveThemePickerUp())
    const next = themes[nextIndex]
    if (next) dispatch(settingsActions.setTheme(next.id))
    return
  }
  if (key.name === "escape") {
    dispatch(settingsActions.setTheme(previousId))
    dispatch(uiActions.closeThemePicker())
    return
  }
  if (key.name === "return") {
    dispatch(uiActions.closeThemePicker())
  }
}

export function AppRoot(props: AppRootProps) {
  const dispatch = useDispatch<AppDispatch>()
  const state = useSelector((root: RootState) => root)
  const dimensions = useTerminalDimensions()
  const statusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const keySeqRef = useRef<{ count: string; pending: string | null }>({ count: "", pending: null })

  useEffect(() => {
    const frameTimer = setInterval(() => {
      dispatch(runSyncPlaybackProgressThunk())
    }, 750)

    return () => {
      clearInterval(frameTimer)
    }
  }, [dispatch])

  useEffect(() => {
    return () => {
      if (statusTimerRef.current) {
        clearTimeout(statusTimerRef.current)
        statusTimerRef.current = null
      }
    }
  }, [])

  const setStatusWithTimeout = useCallback(
    (message: string, level: "ok" | "err" | "info" = "info") => {
      if (statusTimerRef.current) {
        clearTimeout(statusTimerRef.current)
      }

      dispatch(uiActions.setStatus({ message, level }))
      statusTimerRef.current = setTimeout(() => {
        dispatch(uiActions.clearStatus())
      }, props.store.getState().settings.statusTimeoutMs)
    },
    [dispatch, props.store],
  )

  const executeCommand = useCallback(
    (input: string) => {
      const parsed = parseCommandInput(input)
      if (!parsed) {
        return
      }

      const command = props.commandRegistry.resolve(parsed.name)
      if (!command) {
        setStatusWithTimeout(`ERR: unknown command :${parsed.name}`, "err")
        return
      }

      command.execute(parsed.args, {
        dispatch: props.store.dispatch,
        getState: props.store.getState,
        themeRegistry: props.themeRegistry,
        progressStyleRegistry: props.progressStyleRegistry,
        visualizerStyleRegistry: props.visualizerStyleRegistry,
        requestQuit: props.requestQuit,
      })
    },
    [props.commandRegistry, props.progressStyleRegistry, props.requestQuit, props.store, props.themeRegistry, setStatusWithTimeout],
  )

  const playTrackFromState = useCallback(() => {
    if (state.ui.mode === "search") {
      const track = state.search.results[state.search.selectedIndex]
      if (track) {
        dispatch(runPlayTrackThunk(track))
      }
      return
    }

    const track = state.queue.tracks[state.queue.selectedIndex]
    if (track) {
      dispatch(runPlayTrackThunk(track))
      return
    }

    dispatch(uiActions.setStatus({ message: "INFO: queue is empty", level: "info" }))
  }, [dispatch, state.queue.selectedIndex, state.queue.tracks, state.search.results, state.search.selectedIndex, state.ui.mode])

  const seekPlayback = useCallback(
    (targetSec: number) => {
      dispatch(runSeekPlaybackThunk({ targetSec }))
    },
    [dispatch],
  )

  function consumeCount(fallback: number): number {
    const n = parseInt(keySeqRef.current.count, 10)
    keySeqRef.current.count = ""
    return Number.isNaN(n) || n < 1 ? fallback : n
  }

  function resetKeySeq() {
    keySeqRef.current = { count: "", pending: null }
  }

  useKeyboard(
    (key) => {
      if (state.ui.helpOpen) {
        if (key.name === "escape" || key.name === "q" || key.name === "return") {
          dispatch(uiActions.setHelpOpen(false))
        }
        return
      }

      if (state.ui.themePickerOpen) {
        handleThemePickerKey(
          key,
          props.themeRegistry.list(),
          state.ui.themePickerSelectedIndex,
          state.ui.themePickerPreviousId,
          dispatch,
        )
        return
      }

      if (state.ui.commandActive) {
        if (key.name === "escape") {
          dispatch(uiActions.setCommandActive(false))
          dispatch(uiActions.setCommandBuffer(""))
          return
        }

        if (key.name === "return") {
          executeCommand(state.ui.commandBuffer)
          dispatch(uiActions.setCommandBuffer(""))
          dispatch(uiActions.setCommandActive(false))
          return
        }

        if (key.name === "backspace") {
          dispatch(uiActions.setCommandBuffer(state.ui.commandBuffer.slice(0, -1)))
          return
        }

        if (key.sequence && isPrintable(key.sequence)) {
          dispatch(uiActions.setCommandBuffer(`${state.ui.commandBuffer}${key.sequence}`))
        }
        return
      }

      if (key.name === "tab") {
        dispatch(uiActions.cycleMode())
        return
      }

      if (key.name === "escape") {
        dispatch(uiActions.setMode("normal"))
        return
      }

      if (key.name === "space") {
        if (state.ui.mode === "search") {
          dispatch(searchActions.setQuery(`${state.search.query} `))
          return
        }
        dispatch(runTogglePauseResumeThunk())
        return
      }

      if (key.name === "colon" || key.sequence === ":") {
        dispatch(uiActions.clearStatus())
        dispatch(uiActions.setCommandActive(true))
        dispatch(uiActions.setCommandBuffer(""))
        return
      }

      if (state.ui.mode === "search") {
        if (key.name === "return") {
          if (!state.search.isLoading) {
            dispatch(runSearchThunk())
          }
          return
        }

        if (key.ctrl && key.name === "p") {
          playTrackFromState()
          return
        }

        if (state.search.isLoading) {
          return
        }

        if (key.name === "backspace") {
          dispatch(searchActions.setQuery(state.search.query.slice(0, -1)))
          return
        }

        if (key.name === "j" || key.name === "down") {
          dispatch(searchActions.moveSelectionDown())
          return
        }

        if (key.name === "k" || key.name === "up") {
          dispatch(searchActions.moveSelectionUp())
          return
        }

        if (key.ctrl && key.name === "a") {
          const track = state.search.results[state.search.selectedIndex]
          if (track) {
            dispatch(queueActions.enqueueTrack(track))
            setStatusWithTimeout("OK: added to queue", "ok")
          }
          return
        }

        if (key.sequence && isPrintable(key.sequence)) {
          dispatch(searchActions.setQuery(`${state.search.query}${key.sequence}`))
        }
        return
      }

      if (state.ui.mode === "normal") {
        if (keySeqRef.current.pending) {
          const pending = keySeqRef.current.pending
          keySeqRef.current.pending = null

          if (pending === "g" && key.name === "g" && !key.shift) {
            const target = consumeCount(1) - 1
            dispatch(queueActions.setSelectedIndex(target))
            return
          }
          if (pending === "d" && key.name === "d") {
            const count = consumeCount(1)
            if (state.queue.tracks.length > 0) {
              dispatch(queueActions.removeTrackRange({ index: state.queue.selectedIndex, count }))
              setStatusWithTimeout(count === 1 ? "OK: removed" : `OK: removed ${count}`, "ok")
            }
            return
          }
          resetKeySeq()
        }

        if (key.sequence && /^[1-9]$/.test(key.sequence)) {
          keySeqRef.current.count += key.sequence
          return
        }
        if (key.sequence === "0" && keySeqRef.current.count.length > 0) {
          keySeqRef.current.count += "0"
          return
        }

        if (key.name === "g" && !key.shift) {
          keySeqRef.current.pending = "g"
          return
        }

        if (key.name === "g" && key.shift) {
          const count = consumeCount(0)
          const index = count > 0 ? count - 1 : Math.max(0, state.queue.tracks.length - 1)
          dispatch(queueActions.setSelectedIndex(index))
          return
        }

        if (key.name === "d") {
          keySeqRef.current.pending = "d"
          return
        }

        if (key.name === "return") {
          playTrackFromState()
          return
        }

        if (key.name === "j" || key.name === "down") {
          resetKeySeq()
          dispatch(queueActions.moveSelectionDown())
          return
        }

        if (key.name === "k" || key.name === "up") {
          resetKeySeq()
          dispatch(queueActions.moveSelectionUp())
        }
      }
    },
    { release: false },
  )

  return (
    <RootLayout
      state={state}
      width={dimensions.width}
      height={dimensions.height}
      themeRegistry={props.themeRegistry}
      progressStyleRegistry={props.progressStyleRegistry}
      visualizerStyleRegistry={props.visualizerStyleRegistry}
      onSeekPlayback={seekPlayback}
    />
  )
}

function isPrintable(sequence: string): boolean {
  if (!sequence || sequence.length !== 1) {
    return false
  }
  const code = sequence.charCodeAt(0)
  return code >= 32 && code <= 126
}
