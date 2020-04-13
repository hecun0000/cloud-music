import React from 'react';
import Slider from '../../components/slider'
import RecommendList from '../../components/list'


function Recommend(props) {
  //mock 数据
  const bannerList = [1, 2, 3, 4].map((item, index) => {
    return { imageUrl: "http://p1.music.126.net/ZYLJ2oZn74yUz5x8NBGkVA==/109951164331219056.jpg?i=" + index }
  });

  return (
    <div>
      <Slider bannerList={bannerList}/>
      <RecommendList />
    </div>
  )
}

export default React.memo(Recommend);