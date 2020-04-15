import { combineReducers } from 'redux-immutable';
import recommendReducer from '../application/Recommend/store/reducer'
import singersReducer from '../application/Singers/store/reducer'
import { reducer as RankReducer} from '../application/Rank/store'
import { reducer as AlbumReducer} from '../application/Album/store'


export default combineReducers ({
  recommend: recommendReducer,
  singers: singersReducer,
  rank: RankReducer,
  album: AlbumReducer
// 之后开发具体功能模块的时候添加 reducer
});
