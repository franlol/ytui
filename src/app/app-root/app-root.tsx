import type { KeyEvent } from "@opentui/core"
import { useKeyboard, useTerminalDimensions } from "@opentui/react"
import { type MutableRefObject, useCallback, useEffect, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { Track } from "../../types/app.types"
import { parseCommandInput } from "../../features/commands/command-parser/command-parser"
import { libraryActions } from "../../features/library/library.slice"
import { saveLibraryThunk } from "../../features/library/library.thunks"
import { runPlayNextInQueueThunk, runPlayPreviousInQueueThunk, runPlayTrackThunk, runSeekPlaybackThunk, runSyncPlaybackProgressThunk, runTogglePauseResumeThunk } from "../../features/playback/playback.thunks"
import { queueActions } from "../../features/queue/queue.slice"
import { searchActions } from "../../features/search/search.slice"
import { runSearchThunk } from "../../features/search/search.thunks"
import { settingsActions } from "../../features/settings/settings.slice"
import { logsActions } from "../../features/logs/logs.slice"
import { uiActions } from "../../features/ui/ui.slice"
import { RootLayout } from "../../layouts/root-layout/root-layout"
import type { ThemeDefinition } from "../../registries/themes/theme.registry.types"
import type { AppDispatch, RootState } from "../../state/store/store.types"
import type { AppRootProps } from "./app-root.types"
import { buildCategoryItems, SETTINGS_CATEGORIES } from "../../components/settings-panel/settings-panel.helpers"
import { saveConfigThunk } from "../../features/settings/settings.thunks"

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
  const pendingTrackRef = useRef<Track | null>(null)
  const libraryKeyPendingRef = useRef<string | null>(null)

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
      dispatch(queueActions.setPlayingIndex(state.queue.selectedIndex))
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

      if (state.ui.playlistPickerOpen) {
        const pickable = state.library.playlists.filter((p) => p.id !== "history")
        if (key.name === "j" || key.name === "down") {
          dispatch(uiActions.movePlaylistPickerDown(pickable.length))
          return
        }
        if (key.name === "k" || key.name === "up") {
          dispatch(uiActions.movePlaylistPickerUp())
          return
        }
        if (key.name === "return") {
          const target = pickable[state.ui.playlistPickerSelectedIndex]
          const track = pendingTrackRef.current
          if (target && track) {
            dispatch(libraryActions.addTrackToPlaylist({ playlistId: target.id, track }))
            dispatch(saveLibraryThunk())
            setStatusWithTimeout(`OK: saved to "${target.name}"`, "ok")
          }
          pendingTrackRef.current = null
          dispatch(uiActions.closePlaylistPicker())
          return
        }
        if (key.name === "escape") {
          pendingTrackRef.current = null
          dispatch(uiActions.closePlaylistPicker())
        }
        return
      }

      if (state.ui.mode === "settings") {
        if (handleSettingsKey(key, state, dispatch, props)) {
          return
        }
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
        if (key.shift) {
          dispatch(uiActions.cycleModeBack())
        } else {
          dispatch(uiActions.cycleMode())
        }
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

        if (key.ctrl && key.name === "s") {
          const track = state.search.results[state.search.selectedIndex]
          if (track) {
            pendingTrackRef.current = track
            dispatch(uiActions.openPlaylistPicker(0))
          }
          return
        }

        if (key.sequence && isPrintable(key.sequence)) {
          dispatch(searchActions.setQuery(`${state.search.query}${key.sequence}`))
        }
        return
      }

      if (state.ui.mode === "library") {
        handleLibraryKey(key, state, dispatch, setStatusWithTimeout, playTrackFromState, libraryKeyPendingRef, (track) => {
          pendingTrackRef.current = track
          dispatch(uiActions.openPlaylistPicker(0))
        })
        return
      }

      if (state.ui.mode === "logs") {
        handleLogsKey(key, dispatch)
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

        if (key.name === "return" || (key.ctrl && key.name === "p")) {
          playTrackFromState()
          return
        }

        if (key.ctrl && key.name === "s") {
          const track = state.queue.tracks[state.queue.selectedIndex]
          if (track) {
            pendingTrackRef.current = track
            dispatch(uiActions.openPlaylistPicker(0))
          }
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
          return
        }

        if (key.sequence === "]") {
          dispatch(runPlayNextInQueueThunk())
          return
        }

        if (key.sequence === "[") {
          dispatch(runPlayPreviousInQueueThunk())
          return
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

function handleLibraryKey(
  key: KeyEvent,
  state: RootState,
  dispatch: AppDispatch,
  setStatus: (message: string, level?: "ok" | "err" | "info") => void,
  playTrackFromState: () => void,
  pendingRef: MutableRefObject<string | null>,
  openPickerForTrack: (track: Track) => void,
): void {
  // Two-key sequences (dd to remove track)
  if (pendingRef.current) {
    const pending = pendingRef.current
    pendingRef.current = null

    if (pending === "d" && key.name === "d" && state.library.focus === "tracks") {
      const playlist = state.library.playlists[state.library.selectedPlaylistIndex]
      const track = playlist?.tracks[state.library.selectedTrackIndex]
      if (track && playlist) {
        dispatch(libraryActions.removeTrackFromPlaylist({ playlistId: playlist.id, trackId: track.id }))
        dispatch(saveLibraryThunk())
        setStatus("OK: removed", "ok")
      }
      return
    }
    // Unrecognized second key — fall through to handle normally
  }

  if (key.name === "h" || key.name === "left") {
    dispatch(libraryActions.setFocus("playlists"))
    return
  }
  if (key.name === "l" || key.name === "right") {
    dispatch(libraryActions.setFocus("tracks"))
    return
  }
  if (key.name === "j" || key.name === "down") {
    if (state.library.focus === "playlists") {
      dispatch(libraryActions.movePlaylistDown())
    } else {
      dispatch(libraryActions.moveTrackDown())
    }
    return
  }
  if (key.name === "k" || key.name === "up") {
    if (state.library.focus === "playlists") {
      dispatch(libraryActions.movePlaylistUp())
    } else {
      dispatch(libraryActions.moveTrackUp())
    }
    return
  }
  if (key.name === "return") {
    if (state.library.focus === "playlists") {
      dispatch(libraryActions.setFocus("tracks"))
    } else {
      const playlist = state.library.playlists[state.library.selectedPlaylistIndex]
      const track = playlist?.tracks[state.library.selectedTrackIndex]
      if (track) dispatch(runPlayTrackThunk(track))
    }
    return
  }
  if (key.ctrl && key.name === "p") {
    const playlist = state.library.playlists[state.library.selectedPlaylistIndex]
    const track = playlist?.tracks[state.library.selectedTrackIndex]
    if (track) dispatch(runPlayTrackThunk(track))
    return
  }
  if (key.ctrl && key.name === "a") {
    const playlist = state.library.playlists[state.library.selectedPlaylistIndex]
    const track = playlist?.tracks[state.library.selectedTrackIndex]
    if (track) {
      dispatch(queueActions.enqueueTrack(track))
      setStatus("OK: added to queue", "ok")
    }
    return
  }
  if (key.ctrl && key.name === "s") {
    const playlist = state.library.playlists[state.library.selectedPlaylistIndex]
    const track = playlist?.tracks[state.library.selectedTrackIndex]
    if (track) {
      openPickerForTrack(track)
    }
    return
  }
  if (key.name === "d" && state.library.focus === "tracks") {
    pendingRef.current = "d"
  }
}

function handleLogsKey(key: KeyEvent, dispatch: AppDispatch): void {
  if (key.name === "j" || key.name === "down") {
    dispatch(logsActions.scrollDown())
    return
  }
  if (key.name === "k" || key.name === "up") {
    dispatch(logsActions.scrollUp())
    return
  }
  if (key.ctrl && key.name === "d") {
    dispatch(logsActions.scrollPageDown(10))
    return
  }
  if (key.ctrl && key.name === "u") {
    dispatch(logsActions.scrollPageUp(10))
    return
  }
  if (key.name === "g" && key.shift) {
    dispatch(logsActions.jumpToBottom())
  }
}

function handleSettingsKey(key: KeyEvent, state: RootState, dispatch: AppDispatch, props: AppRootProps): boolean {
  const categoryId = SETTINGS_CATEGORIES[state.ui.settingsCategoryIndex]?.id ?? "appearance"
  const descriptors = buildCategoryItems(
    categoryId,
    state,
    {
      themeRegistry: props.themeRegistry,
      progressStyleRegistry: props.progressStyleRegistry,
      visualizerStyleRegistry: props.visualizerStyleRegistry,
    },
    dispatch,
  )
  const itemCount = descriptors.length
  const categoryCount = SETTINGS_CATEGORIES.length

  if (key.name === "h" || key.name === "[" || key.sequence === "[") {
    dispatch(uiActions.moveSettingsCategoryPrev(categoryCount))
    return true
  }
  if (key.name === "l" || key.name === "]" || key.sequence === "]") {
    dispatch(uiActions.moveSettingsCategoryNext(categoryCount))
    return true
  }
  if (key.name === "j" || key.name === "down") {
    dispatch(uiActions.moveSettingsItemDown(itemCount))
    return true
  }
  if (key.name === "k" || key.name === "up") {
    dispatch(uiActions.moveSettingsItemUp())
    return true
  }
  if (key.name === "right") {
    if (descriptors[state.ui.settingsItemIndex]?.onChange) {
      descriptors[state.ui.settingsItemIndex].onChange!(dispatch, 1)
      dispatch(saveConfigThunk())
    }
    return true
  }
  if (key.name === "left") {
    if (descriptors[state.ui.settingsItemIndex]?.onChange) {
      descriptors[state.ui.settingsItemIndex].onChange!(dispatch, -1)
      dispatch(saveConfigThunk())
    }
    return true
  }

  return false
}

function isPrintable(sequence: string): boolean {
  if (!sequence || sequence.length !== 1) {
    return false
  }
  const code = sequence.charCodeAt(0)
  return code >= 32 && code <= 126
}
