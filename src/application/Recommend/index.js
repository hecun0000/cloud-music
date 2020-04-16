import React, { useEffect } from 'react';
import Slider from '../../components/slider'
import RecommendList from '../../components/list'
import Scroll from '../../baseUI/scroll'
import { Content } from './style'
import { connect } from "react-redux";
import * as actionTypes from './store/actionCreators';
import { forceCheck } from 'react-lazyload';
import Loading from '../../baseUI/loading/index';
import { renderRoutes } from 'react-router-config'


function Recommend(props) {
  // 获取 store 中 的 state
  const { bannerList, recommendList, enterLoading, songsCount } = props
  // 接口函数
  const { getBannerDataDispatch, getRecommendListDataDispatch } = props

  // 空数组是模拟react的componentDidMount这个生命周期的功能
  useEffect(() => {
    // 如果页面有数据，则不发请求
    //immutable 数据结构中长度属性 size
    if (!bannerList.size){
      getBannerDataDispatch ();
    }
    if (!recommendList.size){
      getRecommendListDataDispatch ();
    }
  }, [])

  const bannerListJS = bannerList ? bannerList.toJS() : [];
  const recommendListJS = recommendList ? recommendList.toJS() : [];

  return (
    <Content play={songsCount}>
      <Scroll className="list" onScroll={forceCheck}>
        <div>
          <Slider bannerList={bannerListJS} />
          <RecommendList recommendList={recommendListJS} />
        </div>
      </Scroll>
      { enterLoading ? <Loading/>: null}
      { renderRoutes(props.route.routes) }
    </Content>
  )
}

// 将store 中的值映射到 state 中
const mapStateToProps = state => ({
  // 不要在这里将数据 toJS
  // 不然每次 diff 比对 props 的时候都是不一样的引用，还是导致不必要的重渲染，属于滥用 immutable
  bannerList: state.getIn(['recommend', 'bannerList']),
  recommendList: state.getIn(['recommend', 'recommendList']),
  enterLoading: state.getIn(['recommend', 'enterLoading']),
  songsCount: state.getIn (['player', 'playList']).size
})

const mapDispatchToProps = (dispatch) => {
  return {
    getBannerDataDispatch() {
      dispatch(actionTypes.getBannerList());
    },
    getRecommendListDataDispatch() {
      dispatch(actionTypes.getRecommendList());
    },
  }
};
export default connect(mapStateToProps, mapDispatchToProps)(React.memo(Recommend));