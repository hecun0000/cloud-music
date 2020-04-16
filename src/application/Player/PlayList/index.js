import React, { useRef, useState, useCallback } from 'react';
import { connect } from "react-redux";
import { PlayListWrapper, ScrollWrapper, ListHeader, ListContent } from './style';
import { changeShowPlayList, changePlayMode, changePlayList, changeCurrentIndex, deleteSong, changeSequecePlayList, changeCurrentSong, changePlayingState } from '../store/actionCreators';
import { CSSTransition } from 'react-transition-group';
import { prefixStyle, getName } from '../../../api/utils';
import { playMode } from '../../../api/config';
import Scroll from '../../../baseUI/scroll'
import Confirm from './../../../baseUI/confirm/index';

function PlayList(props) {
  const { showPlayList, mode, currentSong, playList, currentIndex } = props;
  const { togglePlayListDispatch, changeCurrentIndexDispatch } = props;
  const playListRef = useRef();
  const listWrapperRef = useRef();
  const transform = prefixStyle("transform");
  const [isShow, setIsShow] = useState(false)

  const onEnterCB = useCallback(() => {
    // 让列表显示
    setIsShow(true);
    // 最开始是隐藏在下面
    listWrapperRef.current.style[transform] = `translate3d(0, 100%, 0)`;
  }, [transform]);

  const onEnteringCB = useCallback(() => {
    // 让列表展现
    listWrapperRef.current.style["transition"] = "all 0.3s";
    listWrapperRef.current.style[transform] = `translate3d(0, 0, 0)`;
  }, [transform]);

  const onExitingCB = useCallback(() => {
    listWrapperRef.current.style["transition"] = "all 0.3s";
    listWrapperRef.current.style[transform] = `translate3d(0px, 100%, 0px)`;
  }, [transform]);

  const onExitedCB = useCallback(() => {
    setIsShow(false);
    listWrapperRef.current.style[transform] = `translate3d(0px, 100%, 0px)`;
  }, [transform]);

  const getCurrentIcon = (item) => {
    // 是不是当前正在播放的歌曲
    const current = currentSong.id === item.id;
    const className = current ? 'icon-play' : '';
    const content = current ? '&#xe6e3;' : '';
    return (
      <i className={`current iconfont ${className}`} dangerouslySetInnerHTML={{ __html: content }}></i>
    )
  };
  const getPlayMode = () => {
    let content, text;
    if (mode === playMode.sequence) {
      content = "&#xe625;";
      text = "顺序播放";
    } else if (mode === playMode.loop) {
      content = "&#xe653;";
      text = "单曲循环";
    } else {
      content = "&#xe61b;";
      text = "随机播放";
    }
    return (
      <div>
        <i className="iconfont" onClick={(e) => changeMode(e)} dangerouslySetInnerHTML={{ __html: content }}></i>
        <span className="text" onClick={(e) => changeMode(e)}>{text}</span>
      </div>
    )
  };
  const changeMode = (e) => {
    let newMode = (mode + 1) % 3;
    // 具体逻辑比较复杂 后面来实现
  };


  const handleChangeCurrentIndex = (index) => {
    if (currentIndex === index) return;
    changeCurrentIndexDispatch(index);
  }

  const { deleteSongDispatch } = props;
  const handleDeleteSong = (e, song) => {
    e.stopPropagation();
    deleteSongDispatch(song);
  };

  const confirmRef = useRef()

  const handleShowClear = () => {
    confirmRef.current.show();
  }

  const { clearDispatch } = props;
  const handleConfirmClear = () => {
    clearDispatch();
  }

  return (
    <CSSTransition
      in={showPlayList}
      timeout={300}
      classNames="list-fade"
      onEnter={onEnterCB}
      onEntering={onEnteringCB}
      onExiting={onExitingCB}
      onExited={onExitedCB}
    >
      <PlayListWrapper
        ref={playListRef}
        style={isShow === true ? { display: "block" } : { display: "none" }}
        onClick={() => togglePlayListDispatch(false)}
      >
        <div className="list_wrapper" ref={listWrapperRef} onClick={e => e.stopPropagation()}>
          <ListHeader>
            <h1 className="title">
              {getPlayMode()}
              <span className="iconfont clear" onClick={handleShowClear}>&#xe63d;</span>
            </h1>
          </ListHeader>
          <ScrollWrapper>
            <Scroll>
              <ListContent>
                {
                  playList.map((item, index) => {
                    return (
                      <li className="item" key={item.id} onClick={() => handleChangeCurrentIndex(index)}>
                        {getCurrentIcon(item)}
                        <span className="text">{item.name} - {getName(item.ar)}</span>
                        <span className="like">
                          <i className="iconfont">&#xe601;</i>
                        </span>
                        <span className="delete" onClick={(e) => handleDeleteSong(e, item)}>
                          <i className="iconfont">&#xe63d;</i>
                        </span>
                      </li>
                    )
                  })
                }
              </ListContent>
            </Scroll>
          </ScrollWrapper>
        </div>
        <Confirm
          ref={confirmRef}
          text={"是否删除全部？"}
          cancelBtnText={"取消"}
          confirmBtnText={"确定"}
          handleConfirm={handleConfirmClear}
        />
      </PlayListWrapper>
    </CSSTransition>
  )
}

// 映射 Redux 全局的 state 到组件的 props 上
const mapStateToProps = (state) => ({
  currentIndex: state.getIn(['player', 'currentIndex']),
  currentSong: state.getIn(['player', 'currentSong']),
  playList: state.getIn(['player', 'playList']),// 播放列表
  sequencePlayList: state.getIn(['player', 'sequencePlayList']),// 顺序排列时的播放列表
  showPlayList: state.getIn(['player', 'showPlayList']),
  mode: state.getIn(['player', 'mode'])
});
// 映射 dispatch 到 props 上
const mapDispatchToProps = (dispatch) => {
  return {
    togglePlayListDispatch(data) {
      dispatch(changeShowPlayList(data));
    },
    // 修改当前歌曲在列表中的 index，也就是切歌
    changeCurrentIndexDispatch(data) {
      dispatch(changeCurrentIndex(data));
    },
    // 修改当前的播放模式
    changeModeDispatch(data) {
      dispatch(changePlayMode(data));
    },
    // 修改当前的歌曲列表
    changePlayListDispatch(data) {
      dispatch(changePlayList(data));
    },
    deleteSongDispatch(data) {
      dispatch(deleteSong(data));
    },
    clearDispatch() {
      // 1. 清空两个列表
      dispatch(changePlayList([]));
      dispatch(changeSequecePlayList([]));
      // 2. 初始 currentIndex
      dispatch(changeCurrentIndex(-1));
      // 3. 关闭 PlayList 的显示
      dispatch(changeShowPlayList(false));
      // 4. 将当前歌曲置空
      dispatch(changeCurrentSong({}));
      // 5. 重置播放状态
      dispatch(changePlayingState(false));
    }
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(PlayList));