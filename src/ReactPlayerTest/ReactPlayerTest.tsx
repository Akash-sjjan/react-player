import * as React from "react";
import { findDOMNode } from "react-dom";
import ReactPlayer from "react-player";
import screenfull from "screenfull";
import cn from "clsx";

import Duration from "./Duration";
import CustomProgressBar from "./CustomProgressBar";

import "./ReactPlayerTest.scss";
import { fullscreen, mute, pause, play, playCenterBtn, record, vidSetting, volumeIcon } from "../assets";
import Slider from "@material-ui/core/Slider";
import { createStyles, withStyles, Theme } from "@material-ui/core/styles";
import CircularProgress from "@material-ui/core/CircularProgress";

//---//

declare global {
  interface Document {
    mozCancelFullScreen?: () => Promise<void>;
    msExitFullscreen?: () => Promise<void>;
    webkitExitFullscreen?: () => Promise<void>;
    mozFullScreenElement?: Element;
    msFullscreenElement?: Element;
    webkitFullscreenElement?: Element;
  }

  interface HTMLElement {
    msRequestFullscreen?: () => Promise<void>;
    mozRequestFullscreen?: () => Promise<void>;
    webkitRequestFullscreen?: () => Promise<void>;
  }
}

const version = "2.9.0";

const Style = {
  SECTION: "border p-4",
  BUTTON_GROUP: "flex gap-2",
  BUTTON:
    "inline-block px-4 py-2.5 bg-blue-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out disabled:opacity-75",
};

const styles = (theme: Theme) =>
  createStyles({
    MSlider: {
      position: "absolute",
      bottom: 0,
      "&.MuiSlider-root": {
        padding: 0,
        color: "#ff0000",
      },
      "& .MuiSlider-rail": {
        backgroundColor: "transparent",
      },
      "& .MuiSlider-track": {
        height: "0.2em",
      },
    },
    MSliderLoaded: {
      position: "absolute",
      bottom: 0,
      "&.MuiSlider-root": {
        padding: 0,
        color: "#a8a8a8",
      },
      "& .MuiSlider-rail": {
        backgroundColor: "#525252",
      },
      "& .MuiSlider-thumb": {
        width: "0px",
      },
      "& .MuiSlider-track": {
        height: "0.2em",
      },
    },
    sliderInput: {
      position: "absolute",
      bottom: 0,
      cursor: "pointer",
      backgroundColor: "transparent",
    },
    playbackRateBtn: {
      backgroundColor: "transparent",
      border: "0px",
      // borderBottom: "1px solid #000000",
      paddingTop: "0.5em",
      paddingBottom: "0.5em",
      color: "#fff",
      fontFamily: "Inter",
      fontWeight: 600,
      fontSize: "0.8em",
      lineHeight: "1em",
    },
  });
//---//

export interface ReactPlayerTestProps {
  urll: string;
  classes?: any;
}

export interface ReactPlayerTestState {
  url?: string;
  pip: boolean;
  playing: boolean;
  controls: boolean;
  light: boolean;
  volume: number;
  muted: boolean;
  played: number;
  loaded: number;
  duration: number;
  playbackRate: number;
  loop: boolean;
  seeking: boolean;
  settingActive: boolean;
  buffering: boolean;
  fullScreenn: boolean;
}

const DEFAULT_STATE: ReactPlayerTestState = {
  url: undefined,
  pip: false,
  playing: true,
  controls: false,
  light: false,
  volume: 1,
  muted: false,
  played: 0,
  loaded: 0,
  duration: 0,
  playbackRate: 1.0,
  loop: false,
  seeking: false,
  settingActive: false,
  buffering: false,
  fullScreenn: false,
};

export class ReactPlayerTest extends React.Component<ReactPlayerTestProps, ReactPlayerTestState> {
  urlInput: HTMLInputElement | null = null;
  player: ReactPlayer | null = null;
  rrf: any;
  state = DEFAULT_STATE;

  load = (url?: string) => {
    this.setState({
      url,
      played: 0,
      loaded: 0,
      pip: false,
    });
  };

  handlePlayPause = () => {
    this.setState({ playing: !this.state.playing });
  };

  handleStop = () => {
    this.setState({ ...DEFAULT_STATE });
  };

  handleToggleControls = () => {
    const url = this.state.url;
    this.setState(
      {
        controls: !this.state.controls,
        url: undefined,
      },
      () => this.load(url)
    );
  };

  handleToggleLight = () => {
    this.setState({ light: !this.state.light });
  };

  handleToggleLoop = () => {
    this.setState({ loop: !this.state.loop });
  };

  handleVolumeChange = (e: React.SyntheticEvent<HTMLInputElement>) => {
    this.setState({ volume: parseFloat(e.currentTarget.value) });
  };

  handleToggleMuted = () => {
    this.setState({ muted: !this.state.muted });
  };

  handleSetPlaybackRate = (e: React.SyntheticEvent<HTMLButtonElement>) => {
    this.setState({ playbackRate: parseFloat(e.currentTarget.value) });
  };

  handleOnPlaybackRateChange = (speed: string) => {
    this.setState({ playbackRate: parseFloat(speed) });
  };

  handleTogglePIP = () => {
    this.setState({ pip: !this.state.pip });
  };

  handlePlay = () => {
    console.log("onPlay");
    this.setState({ playing: true });
  };

  handleEnablePIP = () => {
    console.log("onEnablePIP");
    this.setState({ pip: true });
  };

  handleDisablePIP = () => {
    console.log("onDisablePIP");
    this.setState({ pip: false });
  };

  handlePause = () => {
    console.log("onPause");
    this.setState({ playing: false });
  };

  handleSeekMouseDown = (e: React.SyntheticEvent<HTMLInputElement>) => {
    this.setState({ seeking: true });
  };

  handleSeekChange = (e: React.SyntheticEvent<HTMLInputElement>) => {
    this.setState({ played: parseFloat(e.currentTarget.value) });
  };

  handleSeekMouseUp = (e: React.SyntheticEvent<HTMLInputElement>) => {
    this.setState({ seeking: false });
    if (this.player) {
      this.player.seekTo(parseFloat(e.currentTarget.value));
    }
  };

  handleProgress = (progress: {
    played: number;
    playedSeconds: number;
    loaded: number;
    loadedSeconds: number;
  }) => {
    // console.log("onProgress", progress);

    // We only want to update time slider if we are not currently seeking
    if (!this.state.seeking) {
      const { played, loaded = 0 } = progress;
      this.setState({ played, loaded });
    }
  };

  handleEnded = () => {
    console.log("onEnded");
    this.setState({ playing: this.state.loop });
  };

  handleDuration = (duration: number) => {
    console.log("onDuration", duration);
    this.setState({ duration });
  };

  handleClickFullscreen = async () => {
    // screenfull.request(findDOMNode(this.player) as Element);
    await this.setState({ fullScreenn: !this.state.fullScreenn });
    console.log("onFullScreen", this.state.fullScreenn);
    var elem = this.rrf;
    if (this.state.fullScreenn) {
      console.log("onFullScreen");
      if (elem.requestFullscreen) {
        console.log("elem.enterFullscreen onExitFullScreen");
        elem.requestFullscreen();
      } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
      }
    } else {
      console.log("onExitFullScreen");
      if (document.exitFullscreen) {
        console.log("elem.exitFullscreen onExitFullScreen");
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  };

  renderLoadButton = (url: string, label: string) => {
    return (
      <button onClick={() => this.load(url)} type="button" className={Style.BUTTON}>
        {label}
      </button>
    );
  };

  ref = (player: ReactPlayer) => {
    this.player = player;
  };

  render() {
    const {
      url,
      playing,
      controls,
      light,
      volume,
      muted,
      loop,
      played,
      loaded,
      duration,
      playbackRate,
      pip,
    } = this.state;
    const SEPARATOR = " · ";
    const urll = this.props.urll;
    const { classes } = this.props;
    return (
      <>
        <div>
          {/* <div className="font-bold w-full text-center mb-4">ReactPlayer Demo</div> */}
          <div className="flex w-full justify-center">
            <div className="aspect-video h-60 bg-gray-100">
              {ReactPlayer.canPlay(urll) ? (
                <div
                  className="VideoContainerC"
                  id="temp"
                  ref={(ref: any) => {
                    this.rrf = ref;

                    // if (elem.requestFullscreen) {
                    //   elem.requestFullscreen();
                    // } else if (elem.mozRequestFullScreen) {
                    //   elem.mozRequestFullScreen();
                    // } else if (elem.webkitRequestFullscreen) {
                    //   elem.webkitRequestFullscreen();
                    // } else if (elem.msRequestFullscreen) {
                    //   elem.msRequestFullscreen();
                    // }
                  }}
                >
                  <div className="Video">
                    <ReactPlayer
                      //   style={{ ...this.props.styles }}
                      ref={this.ref}
                      className="react-player"
                      width="100%"
                      height="100%"
                      url={urll}
                      pip={pip}
                      playing={playing}
                      controls={controls}
                      light={light}
                      loop={loop}
                      playbackRate={playbackRate}
                      volume={volume}
                      muted={muted}
                      onReady={async () => {
                        console.log("onReady");
                        await this.setState({ buffering: false });
                        console.log(this.state.buffering);
                      }}
                      onStart={() => console.log("onStart")}
                      onPlay={this.handlePlay}
                      onEnablePIP={this.handleEnablePIP}
                      onDisablePIP={this.handleDisablePIP}
                      onPause={this.handlePause}
                      onBuffer={async () => {
                        console.log("onBuffer");
                        await this.setState({ buffering: true });
                        console.log(this.state.buffering);
                      }}
                      onPlaybackRateChange={this.handleOnPlaybackRateChange}
                      onSeek={(e) => console.log("onSeek", e)}
                      onEnded={this.handleEnded}
                      onError={(e) => console.log("onError", e)}
                      onProgress={this.handleProgress}
                      onDuration={this.handleDuration}
                    />
                    <div className="videoControls">
                      <div className="videoSliderC">
                        {this.state.buffering === true ? (
                          <CircularProgress style={{ color: "#fff" }} size="5rem" />
                        ) : (
                          <button className="videoCenterBtn" onClick={this.handlePlayPause}>
                            {this.state.playing === false ? (
                              <img src={playCenterBtn} alt="" className="videoCenterBtnImg" />
                            ) : null}
                          </button>
                        )}
                      </div>
                      <div className="videoBottomControllsC">
                        <div style={{ width: "100%" }}>
                          {/* <Slider
                        min={0}
                        max={0.999999}
                        // step="any"
                        aria-labelledby="continuous-slider"
                        value={played}
                        onChange={this.handleSeekChange}
                        // onMouseDown={this.handleSeekMouseDown}
                        // onMouseUp={this.handleSeekMouseUp}
                      /> */}
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center",
                              marginLeft: "1em",
                              marginRight: "1em",
                              // backgroundColor: "green",
                              position: "relative",
                              marginBottom: "0.7em",
                            }}
                          >
                            {/* <CustomProgressBar value={played} /> */}
                            <Slider
                              value={loaded}
                              //   onChange={handleChange}
                              aria-labelledby="continuous-slider"
                              min={0}
                              max={0.999999}
                              className={classes.MSliderLoaded}
                            />
                            <Slider
                              value={played}
                              //   onChange={handleChange}
                              aria-labelledby="continuous-slider"
                              min={0}
                              max={0.999999}
                              className={classes.MSlider}
                            />
                            <input
                              type="range"
                              min={0}
                              max={0.999999}
                              step="any"
                              value={played}
                              onMouseDown={this.handleSeekMouseDown}
                              onChange={this.handleSeekChange}
                              onMouseUp={this.handleSeekMouseUp}
                              style={{ width: "100%", margin: "0px" }}
                              className={classes.sliderInput}
                            />
                          </div>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            width: "100%",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <div className="videoControlsLeft">
                            <button className="videoControlsPlayBtn" onClick={this.handlePlayPause}>
                              {this.state.playing === false ? (
                                <img src={play} alt="" style={{ width: "1.7vw" }} />
                              ) : (
                                <img src={pause} alt="" style={{ width: "1vw" }} />
                              )}
                            </button>

                            <button className="videoControlsVolumeBtn" onClick={this.handleToggleMuted}>
                              {this.state.muted === false ? (
                                <img src={volumeIcon} alt="" style={{ width: "1.3vw" }} />
                              ) : (
                                <img src={mute} alt="" style={{ width: "1.3vw" }} />
                              )}
                            </button>

                            <p
                              style={{
                                color: "#a0a0a0",
                                fontFamily: "Inter",
                                fontWeight: 400,
                                fontSize: "0.7vw",
                              }}
                            >
                              <Duration seconds={duration * played} /> / <Duration seconds={duration} />
                            </p>
                            <img src={record} alt="" style={{ width: "1.1vw", marginLeft: "0.9vw" }} />
                            <p
                              style={{
                                color: "#ffffff",
                                fontFamily: "Inter",
                                fontWeight: 400,
                                fontSize: "0.7vw",
                                marginLeft: "0.5vw",
                              }}
                            >
                              Record
                            </p>
                          </div>
                          <div className="videoControlsRight">
                            <div style={{ position: "relative" }}>
                              {this.state.settingActive && (
                                <div
                                  style={{
                                    position: "absolute",
                                    top: -115,
                                    left: -23,
                                    backgroundColor: "rgba(0,0,0,0.5)",
                                    width: "5em",
                                    display: "flex",
                                    flexDirection: "column",
                                    border: "1px solid #000000",
                                  }}
                                >
                                  <button
                                    onClick={this.handleSetPlaybackRate}
                                    value={0.5}
                                    className={classes.playbackRateBtn}
                                    style={
                                      this.state.playbackRate === 0.5
                                        ? {
                                            backgroundColor: "rgba(0,0,0,0.7)",
                                            fontFamily: "Inter",
                                          }
                                        : {}
                                    }
                                  >
                                    0.5x
                                  </button>
                                  <button
                                    onClick={this.handleSetPlaybackRate}
                                    value={1}
                                    className={classes.playbackRateBtn}
                                    style={
                                      this.state.playbackRate === 1
                                        ? {
                                            backgroundColor: "rgba(0,0,0,0.7)",
                                            fontFamily: "Inter",
                                          }
                                        : {}
                                    }
                                  >
                                    1x
                                  </button>
                                  <button
                                    onClick={this.handleSetPlaybackRate}
                                    value={1.5}
                                    className={classes.playbackRateBtn}
                                    style={
                                      this.state.playbackRate === 1.5
                                        ? {
                                            backgroundColor: "rgba(0,0,0,0.7)",
                                            fontFamily: "Inter",
                                          }
                                        : {}
                                    }
                                  >
                                    1.5x
                                  </button>
                                  <button
                                    onClick={this.handleSetPlaybackRate}
                                    value={2}
                                    className={classes.playbackRateBtn}
                                    style={
                                      this.state.playbackRate === 2
                                        ? {
                                            backgroundColor: "rgba(0,0,0,0.7)",
                                            fontFamily: "Inter",
                                          }
                                        : {}
                                    }
                                  >
                                    2x
                                  </button>
                                </div>
                              )}

                              <button
                                className="videoControlsSettingBtn"
                                onClick={async () => {
                                  await this.setState({ settingActive: !this.state.settingActive });
                                  console.log(this.state.settingActive);
                                }}
                              >
                                <img src={vidSetting} alt="" className="videoControlsSettingImg" />
                              </button>
                            </div>

                            <button
                              onClick={this.handleClickFullscreen}
                              disabled={!playing}
                              className="videoControlsFullscreenBtn"
                            >
                              <img src={fullscreen} alt="" className="videoControlsFullscreenImg" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
        {/* 
        <section className={Style.SECTION}>
          <table>
            <tbody>
              <tr>
                <th>Controls</th>
                <td className={Style.BUTTON_GROUP}>
                  <button
                    onClick={this.handleStop}
                    disabled={url === undefined}
                    type="button"
                    className={Style.BUTTON}
                  >
                    Stop
                  </button>
                  <button onClick={this.handlePlayPause} type="button" className={Style.BUTTON}>
                    {playing ? "Pause" : "Play"}
                  </button>
                  <button
                    onClick={this.handleClickFullscreen}
                    disabled={!playing || url === undefined}
                    type="button"
                    className={Style.BUTTON}
                  >
                    Fullscreen
                  </button>
                  {light && (
                    <button
                      onClick={() => {
                        if (this.player) {
                          this.player.showPreview();
                        }
                      }}
                      type="button"
                      className={Style.BUTTON}
                    >
                      Show preview
                    </button>
                  )}
                  {url && ReactPlayer.canEnablePIP(url) && (
                    <button onClick={this.handleTogglePIP} type="button" className={Style.BUTTON}>
                      {pip ? "Disable PiP" : "Enable PiP"}
                    </button>
                  )}
                </td>
              </tr>
              <tr>
                <th>Speed</th>
                <td className={Style.BUTTON_GROUP}>
                  <button
                    onClick={this.handleSetPlaybackRate}
                    value={1}
                    className={cn(Style.BUTTON, {
                      "bg-blue-800": playbackRate === 1,
                    })}
                  >
                    1x
                  </button>
                  <button
                    onClick={this.handleSetPlaybackRate}
                    value={1.5}
                    className={cn(Style.BUTTON, {
                      "bg-blue-800": playbackRate === 1.5,
                    })}
                  >
                    1.5x
                  </button>
                  <button
                    onClick={this.handleSetPlaybackRate}
                    value={2}
                    className={cn(Style.BUTTON, {
                      "bg-blue-800": playbackRate === 2,
                    })}
                  >
                    2x
                  </button>
                </td>
              </tr>
              <tr>
                <th>Seek</th>
                <td>
                  <input
                    type="range"
                    min={0}
                    max={0.999999}
                    step="any"
                    value={played}
                    onMouseDown={this.handleSeekMouseDown}
                    onChange={this.handleSeekChange}
                    onMouseUp={this.handleSeekMouseUp}
                  />
                </td>
              </tr>
              <tr>
                <th>Volume</th>
                <td>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step="any"
                    value={volume}
                    onChange={this.handleVolumeChange}
                  />
                </td>
              </tr>
              <tr>
                <th>
                  <label htmlFor="controls">Controls</label>
                </th>
                <td>
                  <input
                    id="controls"
                    type="checkbox"
                    checked={controls}
                    onChange={this.handleToggleControls}
                  />
                  <em>&nbsp; Requires player reload</em>
                </td>
              </tr>
              <tr>
                <th>
                  <label htmlFor="muted">Muted</label>
                </th>
                <td>
                  <input id="muted" type="checkbox" checked={muted} onChange={this.handleToggleMuted} />
                </td>
              </tr>
              <tr>
                <th>
                  <label htmlFor="loop">Loop</label>
                </th>
                <td>
                  <input id="loop" type="checkbox" checked={loop} onChange={this.handleToggleLoop} />
                </td>
              </tr>
              <tr>
                <th>
                  <label htmlFor="light">Light mode</label>
                </th>
                <td>
                  <input id="light" type="checkbox" checked={light} onChange={this.handleToggleLight} />
                </td>
              </tr>
              <tr>
                <th>Played</th>
                <td>
                  <CustomProgressBar value={played} />
                </td>
              </tr>
              <tr>
                <th>Loaded</th>
                <td>
                  <CustomProgressBar value={loaded} />
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className={Style.SECTION}>
          <table>
            <thead>
              <tr>
                <th colSpan={2}>Samples</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>YouTube</th>
                <td className={Style.BUTTON_GROUP}>
                  {this.renderLoadButton("https://www.youtube.com/watch?v=oUFJJNQGwhk", "Test A")}
                  {this.renderLoadButton("https://www.youtube.com/watch?v=jNgP6d9HraI", "Test B")}
                  {this.renderLoadButton(
                    "https://www.youtube.com/playlist?list=PLogRWNZ498ETeQNYrOlqikEML3bKJcdcx",
                    "Playlist"
                  )}
                </td>
              </tr>
              <tr>
                <th>SoundCloud</th>
                <td className={Style.BUTTON_GROUP}>
                  {this.renderLoadButton("https://soundcloud.com/miami-nights-1984/accelerated", "Test A")}
                  {this.renderLoadButton("https://soundcloud.com/tycho/tycho-awake", "Test B")}
                  {this.renderLoadButton("https://soundcloud.com/yunghog/sets/doperaptraxxx", "Playlist")}
                </td>
              </tr>
              <tr>
                <th>Facebook</th>
                <td className={Style.BUTTON_GROUP}>
                  {this.renderLoadButton(
                    "https://www.facebook.com/facebook/videos/10153231379946729/",
                    "Test A"
                  )}
                  {this.renderLoadButton(
                    "https://www.facebook.com/FacebookDevelopers/videos/10152454700553553/",
                    "Test B"
                  )}
                </td>
              </tr>
              <tr>
                <th>Vimeo</th>
                <td className={Style.BUTTON_GROUP}>
                  {this.renderLoadButton("https://vimeo.com/90509568", "Test A")}
                  {this.renderLoadButton("https://vimeo.com/169599296", "Test B")}
                </td>
              </tr>
              <tr>
                <th>Twitch</th>
                <td className={Style.BUTTON_GROUP}>
                  {this.renderLoadButton("https://www.twitch.tv/videos/106400740", "Test A")}
                  {this.renderLoadButton("https://www.twitch.tv/videos/12783852", "Test B")}
                  {this.renderLoadButton("https://www.twitch.tv/kronovi", "Test C")}
                </td>
              </tr>
              <tr>
                <th>Streamable</th>
                <td className={Style.BUTTON_GROUP}>
                  {this.renderLoadButton("https://streamable.com/moo", "Test A")}
                  {this.renderLoadButton("https://streamable.com/ifjh", "Test B")}
                </td>
              </tr>
              <tr>
                <th>Wistia</th>
                <td className={Style.BUTTON_GROUP}>
                  {this.renderLoadButton("https://home.wistia.com/medias/e4a27b971d", "Test A")}
                  {this.renderLoadButton("https://home.wistia.com/medias/29b0fbf547", "Test B")}
                  {this.renderLoadButton("https://home.wistia.com/medias/bq6epni33s", "Test C")}
                </td>
              </tr>
              <tr>
                <th>DailyMotion</th>
                <td className={Style.BUTTON_GROUP}>
                  {this.renderLoadButton("https://www.dailymotion.com/video/x5e9eog", "Test A")}
                  {this.renderLoadButton("https://www.dailymotion.com/video/x61xx3z", "Test B")}
                </td>
              </tr>
              <tr>
                <th>Mixcloud</th>
                <td className={Style.BUTTON_GROUP}>
                  {this.renderLoadButton("https://www.mixcloud.com/mixcloud/meet-the-curators/", "Test A")}
                  {this.renderLoadButton(
                    "https://www.mixcloud.com/mixcloud/mixcloud-curates-4-mary-anne-hobbs-in-conversation-with-dan-deacon/",
                    "Test B"
                  )}
                </td>
              </tr>
              <tr>
                <th>Vidyard</th>
                <td className={Style.BUTTON_GROUP}>
                  {this.renderLoadButton("https://video.vidyard.com/watch/YBvcF2BEfvKdowmfrRwk57", "Test A")}
                  {this.renderLoadButton("https://video.vidyard.com/watch/BLXgYCDGfwU62vdMWybNVJ", "Test B")}
                </td>
              </tr>
              <tr>
                <th>Kaltura</th>
                <td className={Style.BUTTON_GROUP}>
                  {this.renderLoadButton(
                    "https://cdnapisec.kaltura.com/p/2507381/sp/250738100/embedIframeJs/uiconf_id/44372392/partner_id/2507381?iframeembed=true&playerId=kaltura_player_1605622074&entry_id=1_jz404fbl",
                    "Test A"
                  )}
                  {this.renderLoadButton(
                    "https://cdnapisec.kaltura.com/p/2507381/sp/250738100/embedIframeJs/uiconf_id/44372392/partner_id/2507381?iframeembed=true&playerId=kaltura_player_1605622336&entry_id=1_i1jmzcn3",
                    "Test B"
                  )}
                </td>
              </tr>
              <tr>
                <th>Files</th>
                <td className={Style.BUTTON_GROUP}>
                  {this.renderLoadButton(
                    "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4",
                    "mp4"
                  )}
                  {this.renderLoadButton(
                    "https://test-videos.co.uk/vids/bigbuckbunny/webm/vp8/360/Big_Buck_Bunny_360_10s_1MB.webm",
                    "webm"
                  )}
                  {this.renderLoadButton(
                    "https://filesamples.com/samples/video/ogv/sample_640x360.ogv",
                    "ogv"
                  )}
                  {this.renderLoadButton(
                    "https://storage.googleapis.com/media-session/elephants-dream/the-wires.mp3",
                    "mp3"
                  )}
                  <br />
                  {this.renderLoadButton(
                    "https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8",
                    "HLS (m3u8)"
                  )}
                  {this.renderLoadButton(
                    "http://dash.edgesuite.net/envivio/EnvivioDash3/manifest.mpd",
                    "DASH (mpd)"
                  )}
                </td>
              </tr>
              <tr>
                <th>Custom URL</th>
                <td className={Style.BUTTON_GROUP}>
                  <input
                    ref={(input) => {
                      this.urlInput = input;
                    }}
                    type="text"
                    placeholder="Enter URL"
                    className="border px-4 py-2 rounded w-80"
                  />
                  <button
                    onClick={() => {
                      if (this.urlInput) {
                        this.setState({ url: this.urlInput.value });
                      }
                    }}
                    type="button"
                    className={Style.BUTTON}
                  >
                    Load
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className={Style.SECTION}>
          <table>
            <thead>
              <tr>
                <th colSpan={2}>State</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>url</th>
                <td className="w-80">{url}</td>
              </tr>
              <tr>
                <th>playing</th>
                <td>{playing ? "true" : "false"}</td>
              </tr>
              <tr>
                <th>volume</th>
                <td>{volume.toFixed(3)}</td>
              </tr>
              <tr>
                <th>speed</th>
                <td>{playbackRate}</td>
              </tr>
              <tr>
                <th>played</th>
                <td>{played.toFixed(3)}</td>
              </tr>
              <tr>
                <th>loaded</th>
                <td>{loaded.toFixed(3)}</td>
              </tr>
              <tr>
                <th>duration</th>
                <td>
                  <Duration seconds={duration} />
                </td>
              </tr>
              <tr>
                <th>elapsed</th>
                <td>
                  <Duration seconds={duration * played} />
                </td>
              </tr>
              <tr>
                <th>remaining</th>
                <td>
                  <Duration seconds={duration * (1 - played)} />
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <footer className="footer">
          Version <strong>{version}</strong>
          {SEPARATOR}
          <a href="https://github.com/CookPete/react-player">GitHub</a>
          {SEPARATOR}
          <a href="https://www.npmjs.com/package/react-player">npm</a>
        </footer> */}
      </>
    );
  }
}

export default withStyles(styles, { withTheme: true })(ReactPlayerTest);
