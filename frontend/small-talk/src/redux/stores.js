import { createStore, combineReducers, applyMiddleware, compose } from "redux";
import ReduxThunk from "redux-thunk";
import userReducer from "./reducers/userReducer";
import dataReducer from "./reducers/dataReducer";
import uiReducer from "./reducers/uiReducer";

const initialState = {};
//const middleWare = [ thunk ];
const reducers = combineReducers({
  user: userReducer,
  data: dataReducer,
  UI: uiReducer
});

// this is for dev testing and using redux dev tools
/* const store = createStore(
  reducers,
  initialState,
  compose(
    applyMiddleware(...middleWare),
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
  )
); */

const store =createStore(
  reducers,
  applyMiddleware(ReduxThunk)
)

export default store;
