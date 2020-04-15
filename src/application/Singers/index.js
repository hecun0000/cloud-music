import React, { memo, useState, useEffect } from 'react';
import Horizen from '../../baseUI/horizen-item';
import Scroll from '../../baseUI/scroll';
import { categoryTypes, alphaTypes } from '../../api/config';
import { NavContainer, List, ListItem, ListContainer } from './style'
import { connect } from 'react-redux'
import {
  getSingerList,
  getHotSingerList,
  changeEnterLoading,
  changePageCount,
  refreshMoreSingerList,
  changePullUpLoading,
  changePullDownLoading,
  refreshMoreHotSingerList,
  changeAlpha,
  changeCategory
} from './store/actionCreators';
import LazyLoad, {forceCheck} from "react-lazyload";

import { renderRoutes } from 'react-router-config'



function Singers(props) {

  const { category, alpha, singerList, enterLoading, pullUpLoading, pullDownLoading, pageCount } = props;

  const { changeCategoryDispatch, changeAlphaDispatch, getHotSingerDispatch, updateDispatch, pullDownRefreshDispatch, pullUpRefreshDispatch } = props;


  useEffect(() => {
    if(!singerList.length && !category && !alpha) {
      getHotSingerDispatch();
    }
  }, [])

  const handleUpdateCatetory = val => {
    changeCategoryDispatch(val)
    updateDispatch(val, alpha);
  }

  const handleUpdateAlpha = val => {
    changeAlphaDispatch(val)
    updateDispatch(category, val);
  }

  const enterDetail = (id)  => {
    props.history.push (`/singers/${id}`);
  };

  // 渲染函数，返回歌手列表
  const renderSingerList = () => {
    const list = singerList ? singerList.toJS() : [];
    return (
      <List>
        {
          list.map((item, index) => {
            return (
              <ListItem key={item.accountId + "" + index} onClick={()=>enterDetail(item.id)}>
                <div className="img_wrapper">
                  <LazyLoad  placeholder={<img width="100%" height="100%" src={require ('./singer.png')} alt="music"/>}>
                    <img src={`${item.picUrl}?param=300x300`} width="100%" height="100%" alt="music" />
                  </LazyLoad>
                </div>
                <span className="name">{item.name}</span>
              </ListItem>
            )
          })
        }
      </List>
    )
  };

  const handlePullUp = () => {
    pullUpRefreshDispatch(category, alpha, category === '', pageCount);
  };

  const handlePullDown = () => {
    pullDownRefreshDispatch(category, alpha);
  };


  return (
    <div>
      <NavContainer>
        <Horizen list={categoryTypes} title={"分类 (默认热门):"} handleClick={handleUpdateCatetory} oldVal={category}></Horizen>
        <Horizen list={alphaTypes} title={"首字母:"} handleClick={handleUpdateAlpha} oldVal={alpha}></Horizen>
      </NavContainer>
      <ListContainer>
        <Scroll
          onScroll={forceCheck}
          pullUp={handlePullUp}
          pullDown={handlePullDown}
          pullUpLoading={pullUpLoading}
          pullDownLoading={pullDownLoading}
        >
          {renderSingerList()}
        </Scroll>
      </ListContainer>
      {renderRoutes(props.route.routes)}
    </div>
  )
}


const mapStateToProps = (state) => ({
  singerList: state.getIn(['singers', 'singerList']),
  category: state.getIn(['singers', 'category']),
  alpha: state.getIn(['singers', 'alpha']),
  enterLoading: state.getIn(['singers', 'enterLoading']),     //控制进场Loading
  pullUpLoading: state.getIn(['singers', 'pullUpLoading']),   //控制上拉加载动画
  pullDownLoading: state.getIn(['singers', 'pullDownLoading']), //控制下拉加载动画
  pageCount: state.getIn(['singers', 'pageCount'])            //这里是当前页数，我们即将实现分页功能
})

const mapDispatchToProps = (dispatch) => {
  return {
    getHotSingerDispatch() {
      dispatch(getHotSingerList());
    },
    changeCategoryDispatch(val) {
      dispatch(changeCategory(val));
    },
    changeAlphaDispatch(val) {
      dispatch(changeAlpha(val));
    },
    updateDispatch(category, alpha) {
      dispatch(changePageCount(0));//由于改变了分类，所以pageCount清零
      dispatch(changeEnterLoading(true));//loading，现在实现控制逻辑，效果实现放到下一节，后面的loading同理
      dispatch(getSingerList(category, alpha));
    },
    // 滑到最底部刷新部分的处理
    pullUpRefreshDispatch(category, alpha, hot, count) {
      dispatch(changePullUpLoading(true));
      dispatch(changePageCount(count + 1));
      if (hot) {
        dispatch(refreshMoreHotSingerList());
      } else {
        dispatch(refreshMoreSingerList(category, alpha));
      }
    },
    //顶部下拉刷新
    pullDownRefreshDispatch(category, alpha) {
      dispatch(changePullDownLoading(true));
      dispatch(changePageCount(0));//属于重新获取数据
      if (category === '' && alpha === '') {
        dispatch(getHotSingerList());
      } else {
        dispatch(getSingerList(category, alpha));
      }
    }
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(memo(Singers))
