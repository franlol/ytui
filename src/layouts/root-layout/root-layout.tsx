import { HelpModal } from "../../components/help-modal/help-modal"
import { PlaylistPicker } from "../../components/playlist-picker/playlist-picker"
import { ThemePicker } from "../../components/theme-picker/theme-picker"
import { Statusline } from "../../components/statusline/statusline"
import { Topbar } from "../../components/topbar/topbar"
import { MainLayout } from "../main-layout/main-layout"
import { SettingsLayout } from "../settings-layout/settings-layout"
import { ZenLayout } from "../zen-layout/zen-layout"
import type { RootLayoutProps } from "./root-layout.types"

function renderContent(props: RootLayoutProps) {
  const { state, width, height, themeRegistry, progressStyleRegistry, visualizerStyleRegistry } = props
  const theme = themeRegistry.getTokens(state.settings.themeId)

  if (state.ui.mode === "zen") {
    return (
      <ZenLayout
        state={state}
        width={width}
        height={height}
        theme={theme}
        visualizerStyleRegistry={visualizerStyleRegistry}
      />
    )
  }

  if (state.ui.mode === "settings") {
    return (
      <SettingsLayout
        state={state}
        width={width}
        height={height}
        themeRegistry={themeRegistry}
        progressStyleRegistry={progressStyleRegistry}
        visualizerStyleRegistry={visualizerStyleRegistry}
      />
    )
  }

  return (
    <MainLayout
      state={state}
      width={width}
      height={height}
      theme={theme}
      progressStyleRegistry={progressStyleRegistry}
      visualizerStyleRegistry={visualizerStyleRegistry}
      onSeekPlayback={props.onSeekPlayback}
    />
  )
}

export function RootLayout(props: RootLayoutProps) {
  const theme = props.themeRegistry.getTokens(props.state.settings.themeId)

  return (
    <box id="screen" width="100%" height="100%" backgroundColor={theme.bg} flexDirection="column">
      <Topbar theme={theme} />
      {renderContent(props)}
      <Statusline
        mode={props.state.ui.mode}
        commandActive={props.state.ui.commandActive}
        commandBuffer={props.state.ui.commandBuffer}
        statusMessage={props.state.ui.statusMessage}
        statusLevel={props.state.ui.statusLevel}
        queueLength={props.state.queue.tracks.length}
        volume={props.state.playback.volume}
        sidebarCollapsed={props.state.ui.sidebarCollapsed}
        width={props.width}
        theme={theme}
      />
      {props.state.ui.helpOpen ? <HelpModal screenWidth={props.width} screenHeight={props.height} theme={theme} /> : null}
      {props.state.ui.themePickerOpen ? (
        <ThemePicker
          themes={props.themeRegistry.list()}
          selectedIndex={props.state.ui.themePickerSelectedIndex}
          theme={theme}
          screenWidth={props.width}
          screenHeight={props.height}
        />
      ) : null}
      {props.state.ui.playlistPickerOpen ? (
        <PlaylistPicker
          playlists={props.state.library.playlists.filter((p) => p.id !== "history")}
          selectedIndex={props.state.ui.playlistPickerSelectedIndex}
          theme={theme}
          screenWidth={props.width}
          screenHeight={props.height}
        />
      ) : null}
    </box>
  )
}
