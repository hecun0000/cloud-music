import React, { useRef, useState, useEffect } from "react";
import { connect } from "react-redux";
import {
  changePlayingState,
  changeShowPlayList,
  changeCurrentIndex,
  changeCurrentSong,
  changePlayList,
  changePlayMode,
  changeFullScreen
} from "./store/actionCreators";
import MiniPlayer from './miniPlayer';
import NormalPlayer from './normalPlayer';
import { getSongUrl, isEmptyObject, shuffle, findIndex } from "../../api/utils";
import { playMode } from '../../api/config';
import { getLyricRequest } from '../../api/request';
import Toast from "./../../baseUI/Toast/index";
import PlayList from "./PlayList";
import Lyric from './../../api/lyric-parser';

function Player(props) {
  //目前播放时间
  const [currentTime, setCurrentTime] = useState(0);
  //歌曲总时长
  const [duration, setDuration] = useState(0);
  //歌曲播放进度
  let percent = isNaN(currentTime / duration) ? 0 : currentTime / duration;

  const [preSong, setPreSong] = useState({});
  const [modeText, setModeText] = useState("");
  const songReady = useRef(true);


  const audioRef = useRef();
  const toastRef = useRef();

  const {
    playing,
    currentSong: immutableCurrentSong,
    currentIndex,
    playList: immutablePlayList,
    mode,//播放模式
    sequencePlayList: immutableSequencePlayList,//顺序列表
    fullScreen
  } = props;

  const {
    togglePlayingDispatch,
    changeCurrentIndexDispatch,
    changeCurrentDispatch,
    changePlayListDispatch,//改变playList
    changeModeDispatch,//改变mode
    toggleFullScreenDispatch,
    togglePlayListDispatch: togglePlayList
  } = props;

  const playList = immutablePlayList.toJS();
  const sequencePlayList = immutableSequencePlayList.toJS();
  const currentSong = immutableCurrentSong.toJS();


  useEffect(() => {
    if (
      !playList.length ||
      currentIndex === -1 ||
      !playList[currentIndex] ||
      playList[currentIndex].id === preSong.id ||
      !songReady.current// 标志位为 false
    )
      return;
      songReady.current = false;
      let current = playList[currentIndex];
      changeCurrentDispatch(current);
      setPreSong(current);
      setPlayingLyric("");
      audioRef.current.src = getSongUrl(current.id);
      audioRef.current.autoplay = true;
      // audioRef.current.playbackRate = speed;
      togglePlayingDispatch(true);
      getLyric(current.id);
      setCurrentTime(0);
      setDuration((current.dt / 1000) | 0);
      // eslint-disable-next-line
  }, [playList, currentIndex]);

  useEffect(() => {
    playing ? audioRef.current.play() : audioRef.current.pause();
  }, [playing]);

  const clickPlaying = (e, state) => {
    e.stopPropagation();
    togglePlayingDispatch(state);
    if (currentLyric.current) {
      currentLyric.current.togglePlay(currentTime * 1000);
    }
  };

  const updateTime = e => {
    setCurrentTime(e.target.currentTime);
  };

  const onProgressChange = curPercent => {
    const newTime = curPercent * duration;
    setCurrentTime(newTime);
    audioRef.current.currentTime = newTime;
    if (!playing) {
      togglePlayingDispatch(true);
    }
    if (currentLyric.current) {
      currentLyric.current.seek(newTime * 1000);
    }
  };
  //一首歌循环
  const handleLoop = () => {
    audioRef.current.currentTime = 0;
    changePlayingState(true);
    audioRef.current.play();
    if (currentLyric.current) {
      currentLyric.current.seek(0);
    }
  };

  const handlePrev = () => {
    //播放列表只有一首歌时单曲循环
    if (playList.length === 1) {
      handleLoop();
      return;
    }
    let index = currentIndex - 1;
    if (index < 0) index = playList.length - 1;
    if (!playing) togglePlayingDispatch(true);
    changeCurrentIndexDispatch(index);
  };

  const changeMode = () => {
    let newMode = (mode + 1) % 3;
    if (newMode === 0) {
      //顺序模式
      changePlayListDispatch(sequencePlayList);
      let index = findIndex(currentSong, sequencePlayList);
      changeCurrentIndexDispatch(index);
      setModeText("顺序循环");
    } else if (newMode === 1) {
      //单曲循环
      changePlayListDispatch(sequencePlayList);
      setModeText("单曲循环");
    } else if (newMode === 2) {
      //随机播放
      let newList = shuffle(sequencePlayList);
      let index = findIndex(currentSong, newList);
      changePlayListDispatch(newList);
      changeCurrentIndexDispatch(index);
      setModeText("随机播放");
    }
    changeModeDispatch(newMode);
    toastRef.current.show();
  };

  const handleNext = () => {
    //播放列表只有一首歌时单曲循环
    if (playList.length === 1) {
      handleLoop();
      return;
    }
    let index = currentIndex + 1;
    if (index === playList.length) index = 0;
    if (!playing) togglePlayingDispatch(true);
    changeCurrentIndexDispatch(index);
  };

  const handleEnd = () => {
    if (mode === playMode.loop) {
      handleLoop();
    } else {
      handleNext();
    }
  };

  const handleError = () => {
    songReady.current = true;
    alert("播放出错");
  };


  // 歌词部分
  const currentLyric = useRef();
  const currentLineNum = useRef(0);
  const [currentPlayingLyric, setPlayingLyric] = useState("");

  const getLyric = id => {
    let lyric = "";
    if (currentLyric.current) {
      currentLyric.current.stop();
    }
    // 避免songReady恒为false的情况
    setTimeout(() => {
      songReady.current = true;
    }, 3000);
    getLyricRequest(id)
      .then(data => {
        console.log(data)
        lyric = data.lrc.lyric;
        if (!lyric) {
          currentLyric.current = null;
          return;
        }
        currentLyric.current = new Lyric(lyric, handleLyric);
        currentLyric.current.play();
        currentLineNum.current = 0;
        currentLyric.current.seek(0);

      })
      .catch(() => {
        currentLyric.current = "";
        songReady.current = true;
        audioRef.current.play();
      });
  };

  const handleLyric = ({ lineNum, txt }) => {
    if (!currentLyric.current) return;
    currentLineNum.current = lineNum;
    setPlayingLyric(txt);
  };
  useEffect(() => {
    if (!fullScreen) return;
    if (currentLyric.current && currentLyric.current.lines.length) {
      handleLyric({
        lineNum: currentLineNum.current,
        txt: currentLyric.current.lines[currentLineNum.current].txt
      });
    }
  }, [fullScreen]);


  return (
    <div>
      {isEmptyObject(currentSong) ? null : (
        <MiniPlayer
          song={currentSong}
          fullScreen={fullScreen}
          playing={playing}
          toggleFullScreen={toggleFullScreenDispatch}
          clickPlaying={clickPlaying}
          percent={percent}
          togglePlayList={togglePlayList}
        />
      )
      }
      {isEmptyObject(currentSong) ? null : (
        <NormalPlayer
          song={currentSong}
          fullScreen={fullScreen}
          playing={playing}
          mode={mode}
          changeMode={changeMode}
          duration={duration}
          currentTime={currentTime}
          percent={percent}
          toggleFullScreen={toggleFullScreenDispatch}
          clickPlaying={clickPlaying}
          onProgressChange={onProgressChange}
          handlePrev={handlePrev}
          handleNext={handleNext}
          togglePlayList={togglePlayList}
          currentLyric={currentLyric.current}
          currentPlayingLyric={currentPlayingLyric}
          currentLineNum={currentLineNum.current}
        />
      )
      }
      <audio
        ref={audioRef}
        onTimeUpdate={updateTime}
        onEnded={handleEnd}
        onError={handleError}
      ></audio>
      <PlayList clearPreSong={setPreSong.bind(null, {})} />
      <Toast text={modeText} ref={toastRef}></Toast>
    </div>
  )
}

// 映射Redux全局的state到组件的props上
const mapStateToProps = state => ({
  fullScreen: state.getIn(["player", "fullScreen"]),
  playing: state.getIn(["player", "playing"]),
  currentSong: state.getIn(["player", "currentSong"]),
  showPlayList: state.getIn(["player", "showPlayList"]),
  mode: state.getIn(["player", "mode"]),
  currentIndex: state.getIn(["player", "currentIndex"]),
  playList: state.getIn(["player", "playList"]),
  sequencePlayList: state.getIn(["player", "sequencePlayList"])
});

// 映射dispatch到props上
const mapDispatchToProps = dispatch => {
  return {
    togglePlayingDispatch(data) {
      dispatch(changePlayingState(data));
    },
    toggleFullScreenDispatch(data) {
      dispatch(changeFullScreen(data));
    },
    togglePlayListDispatch(data) {
      dispatch(changeShowPlayList(data));
    },
    changeCurrentIndexDispatch(index) {
      dispatch(changeCurrentIndex(index));
    },
    changeCurrentDispatch(data) {
      dispatch(changeCurrentSong(data));
    },
    changeModeDispatch(data) {
      dispatch(changePlayMode(data));
    },
    changePlayListDispatch(data) {
      dispatch(changePlayList(data));
    }
  };
};

// 将ui组件包装成容器组件
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(React.memo(Player));