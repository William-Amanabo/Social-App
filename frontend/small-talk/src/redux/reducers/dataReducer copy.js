import {SET_SCREAMS, LOADING_DATA, LIKE_SCREAM, UNLIKE_SCREAM, DELETE_SCREAM, POST_SCREAM, SET_SCREAM,SUBMIT_COMMENT }  from '../types';

const initialState = {
    screams:[],
    scream:{},
    loading: false
};

export default function(state=initialState, action){
    switch(action.type){
        case LOADING_DATA:
            return {
                ...state,
                loading:true
            }
        case SET_SCREAMS:
            console.log("%c from SET_SCREAMS : action.payload",'font-size:20px;color:orange',action.payload)
            return {
                ...state,
                screams : action.payload,
                loading:false
            }
        case SET_SCREAM:
            return {
                ...state,
                //scream :action.payload  COME BACK !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                scream:action.payload
            }
        case LIKE_SCREAM:
        case UNLIKE_SCREAM:
            let index = state.screams.findIndex((scream)=>scream.screamId === action.payload.screamId);
            state.screams[index] =action.payload;
            if (state.scream.screamId===action.payload.screamId){
                state.scream = action.payload
            }
            return{
                ...state
            }
        case DELETE_SCREAM :
            index = state.screams.findIndex(scream =>scream.screamId === action.payload)
            console.log("[state before delete]",state.screams)
            state.screams.splice(index,1);
            //action.AllScreamsState.splice(index,1);
            action.AllScreamsState.setState({AllScreamsState:state.screams})
            console.log("[state after delete]",state.screams)
            return {
                ...state
            }
        case POST_SCREAM :
            console.log("%c new screams from POST_SCREAM ",'font-size:20px;color:orange',[action.payload,...state.screams])
            return {
                ...state,
                screams:[
                    action.payload,
                    ...state.screams
                ]
            }
        case SUBMIT_COMMENT:
            return{
                ...state,
                scream:{
                    ...state.scream,
                    comments:[action.payload,...state.scream.comments]
                }
            }

        default:
             return state;
    }
}