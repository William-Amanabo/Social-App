import { SET_USER, SET_AUTHENTICATED, SET_UNAUTHENTICATED, LOADING_USER, LIKE_SCREAM, UNLIKE_SCREAM, MARK_NOTIFICATIONS_READ, SET_NOTIFICATION } from "../types";

const initialState = {
  authenticated: false,
  loading: false,
  credentials: {},
  likes: [],
  notifications: []
};

export default function(state = initialState, action) {
  switch (action.type) {
    case SET_AUTHENTICATED:
      return {
        ...state,
        authenticated: true
      };
    case SET_UNAUTHENTICATED:
      return initialState;
    case SET_USER :
      /* console.log('[user is being set]',{
        authenticated: true,
        loading:false,
        data:action.payload
    }) //[DEBUGGING] */
    
        return{
            authenticated: true,
            loading:false,
            ...action.payload
        };
      case LOADING_USER :
        return{
          ...state,
          loading: true
        }

      case LIKE_SCREAM:
        //console.log("userreducer like_scream runs")
        return{
          ...state,
          likes:[
            ...state.likes,
            {
              userHandle:state.credentials.handle,
              screamId: action.payload.screamId
            }
          ]
        }

      case UNLIKE_SCREAM :
        return{
          ...state,
          likes:state.likes.filter(like => like.screamId !== action.payload.screamId)
        }
      case MARK_NOTIFICATIONS_READ:
        state.notification.forEach(not => not.read =true);
        return {
          ...state
        }
      case SET_NOTIFICATION :
        return{
          ...state,
          notifications: action.payload.notifications
        }
    default:
    return state;
  }
}
