import { combineReducers } from 'redux-immutable';
import recommendReducer from '../application/Recommend/store/reducer'
import singersReducer from '../application/Singers/store/reducer'
import { reducer as RankReducer} from '../application/Rank/store'
import { reducer as AlbumReducer} from '../application/Album/store'
import { reducer as singerInfoReducer } from "../application/Singer/store/index";
import { reducer as playerReducer } from "../application/Player/store/index";


export default combineReducers ({
  recommend: recommendReducer,
  singers: singersReducer,
  rank: RankReducer,
  album: AlbumReducer,
  singerInfo: singerInfoReducer,
  player:playerReducer
});
