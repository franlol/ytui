import { useKeyboard, useTerminalDimensions } from "@opentui/react"
import { useCallback, useEffect, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { parseCommandInput } from "../../features/commands/command-parser/command-parser"
import { playbackActions } from "../../features/playback/playback.slice"
import { queueActions } from "../../features/queue/queue.slice"
import { searchActions } from "../../features/search/search.slice"
import { runSearchThunk } from "../../features/search/search.thunks"
import { uiActions } from "../../features/ui/ui.slice"
import { visualizerActions } from "../../features/visualizer/visualizer.slice"
import { RootLayout } from "../../layouts/root-layout/root-layout"
import type { AppDispatch, RootState } from "../../state/store/store.types"
import type { AppRootProps } from "./app-root.types"

export function AppRoot(props: AppRootProps) {
  const dispatch = useDispatch<AppDispatch>()
  const state = useSelector((root: RootState) => root)
  const dimensions = useTerminalDimensions()
  const statusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const frameTimer = setInterval(() => {
      dispatch(playbackActions.tick())
      dispatch(visualizerActions.tickPhase())
    }, 1000)

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
        requestQuit: props.requestQuit,
      })
    },
    [props.commandRegistry, props.progressStyleRegistry, props.requestQuit, props.store, props.themeRegistry, setStatusWithTimeout],
  )

  useKeyboard(
    (key) => {
      if (state.ui.helpOpen) {
        if (key.name === "escape" || key.name === "q" || key.name === "return") {
          dispatch(uiActions.setHelpOpen(false))
        }
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
        dispatch(playbackActions.togglePlaying())
        setStatusWithTimeout(`OK: ${props.store.getState().playback.playing ? "playing" : "paused"}`, "ok")
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
          dispatch(runSearchThunk())
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

        if (key.sequence && isPrintable(key.sequence)) {
          dispatch(searchActions.setQuery(`${state.search.query}${key.sequence}`))
        }
        return
      }

      if (state.ui.mode === "normal") {
        if (key.name === "j" || key.name === "down") {
          dispatch(queueActions.moveSelectionDown())
          return
        }

        if (key.name === "k" || key.name === "up") {
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
