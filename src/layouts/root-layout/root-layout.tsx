import { HelpModal } from "../../components/help-modal/help-modal"
import { Statusline } from "../../components/statusline/statusline"
import { Topbar } from "../../components/topbar/topbar"
import { MainLayout } from "../main-layout/main-layout"
import { ZenLayout } from "../zen-layout/zen-layout"
import type { RootLayoutProps } from "./root-layout.types"

export function RootLayout(props: RootLayoutProps) {
  const theme = props.themeRegistry.getTokens(props.state.settings.themeId)

  return (
    <box id="screen" width="100%" height="100%" backgroundColor={theme.bg} flexDirection="column">
      <Topbar theme={theme} />
      {props.state.ui.mode === "zen" ? (
        <ZenLayout state={props.state} width={props.width} height={props.height} theme={theme} />
      ) : (
        <MainLayout
          state={props.state}
          width={props.width}
          height={props.height}
          theme={theme}
          progressStyleRegistry={props.progressStyleRegistry}
        />
      )}
      <Statusline
        mode={props.state.ui.mode}
        commandActive={props.state.ui.commandActive}
        commandBuffer={props.state.ui.commandBuffer}
        statusMessage={props.state.ui.statusMessage}
        queueLength={props.state.queue.tracks.length}
        volume={props.state.playback.volume}
        sidebarCollapsed={props.state.ui.sidebarCollapsed}
        width={props.width}
        theme={theme}
      />
      {props.state.ui.helpOpen ? <HelpModal width={props.width} theme={theme} /> : null}
    </box>
  )
}
