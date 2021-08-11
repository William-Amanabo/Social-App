import {
  SET_SCREAM,
  SET_SCREAMS,
  LOADING_DATA,
  LIKE_SCREAM,
  UNLIKE_SCREAM,
  DELETE_SCREAM,
  LOADING_UI,
  SET_ERRORS,
  CLEAR_ERRORS,
  POST_SCREAM,
  STOP_LOADING_UI,
  SUBMIT_COMMENT,
} from "../types";
import axios from "axios";


//Get all Screams
export const getScreams = () => (dispatch) => {
  dispatch({ type: LOADING_DATA });
  axios
    .get("/screams")
    .then((res) => {
      console.log("%c [from getScreams]", "color:orange", res);
      if (res.data.length !== 0) {
        dispatch({
          type: SET_SCREAMS,
          payload: res.data,
        });
      } else {
        console.log("%c [dummy code executed ]", "color:yellow");
        dispatch({
          type: SET_SCREAMS,
          payload: [
            {
              userHandle: "user",
              body:
                "this is a dummy scream used for debug purposes, code should be removed in production",
              createdAt: "2020-03-20T15:03:11.656Z",
              likeCount: 5,
              commentCount: 2,
              screamId: "2345678909876",
            },
          ],
        });
      }
    })
    .catch((err) => {
      console.trace("[error from getScreams]", err);
      dispatch({
        type: SET_SCREAMS,
        payLoad: [],
      });
    });
};

export const getScream = (screamId, component) => (dispatch) => {
  dispatch({ type: LOADING_UI });
  axios
    .get(`/scream/${screamId}`)
    .then((res) => {
      console.log('%c [getting comment data]','font-size:20px;color:yellow',res)
      if (res.data) {
        dispatch({
          type: SET_SCREAM,
          payload: res.data,
        });
        dispatch({ type: STOP_LOADING_UI });
        component.setState({ loading: false, comments: res.data.comments });
      } else {
        res.data = {
          userHandle: "user",
          body:
            "this is a dummy scream used for debug purposes, code should be removed in production",
          createdAt: "2020-03-20T15:03:11.656Z",
          likeCount: 5,
          commentCount: 2,
          screamId: "2345678909876",
          comments: [
            {
              userHandle: "user",
              screamId: "2345678909876",
              body: "nice to meet you mate!",
              createdAt: "2020-03-20T15:03:11.656Z",
            },
            {
              userHandle: "jade",
              screamId: "2345678909876",
              body: "Hello!",
              createdAt: "2020-03-20T15:03:11.656Z",
            },
          ],
        };
        console.log("%c [dummy code runs]", "color:pink", res.data);
        dispatch({
          type: SET_SCREAM,
          payload: res.data,
        });
        dispatch({ type: STOP_LOADING_UI });
        console.log("%c [Data from getScream]", "color:pink", res.data);
        component.setState({ loading: false, comments: res.data.comments });
      }
    })
    .catch((err) =>
      console.log("%c [Error from getScream]", "color:pink", err)
    );
};

//Post Scream
export const postScream = (newScream,component) => (dispatch) => {
  dispatch({ type: LOADING_UI });
  component.setState({loading:true})
  axios
    .post("/scream", newScream)
    .then((res) => {
      console.log('%c [response from post scream]','font-size:20px;color:orange',res)
      dispatch({
        type: POST_SCREAM,
        payload: res.data,
      });
      dispatch(clearErrors());
      component.setState({body:'',open:false, errors: {}});
    })
    .catch((err) => {
      dispatch({
        type: SET_ERRORS,
        payload: err.response.data,
      });
      component.setState({errors:err.response.data,loading:false})
    });
};

//Like a Scream
export const likeScream = (screamId) => (dispatch) => {
  axios
    .get(`/screams/${screamId}/like`)
    .then((res) => {
      dispatch({
        type: LIKE_SCREAM,
        payload: res.data,
      });
    })
    .catch((err) => console.log);
};

//Unlike a Scream

export const unlikeScream = (screamId) => (dispatch) => {
  axios
    .get(`/screams/${screamId}/unlike`)
    .then((res) => {
      dispatch({
        type: UNLIKE_SCREAM,
        payload: res.data,
      });
    })
    .catch((err) => console.log);
};

//Submit comment
export const submitComment = (screamId, commentData,) => (dispatch) => {
  axios
    .post(`/scream/${screamId}/comment`, commentData)
    .then((res) => {
      dispatch({
        type: SUBMIT_COMMENT,
        payload: res.data,
      });
      dispatch(clearErrors());
    })
    .catch((err) => {
      dispatch({
        type: SET_ERRORS,
        payLoad: err.response.data,
      });
    });
};

export const deleteScream = (screamId) => (dispatch) => {
  axios
    .delete(`/scream/${screamId}`)
    .then(() => {
      console.log('[DeleteScream .then runs]')
      dispatch({ type: DELETE_SCREAM, payLoad: screamId })
      
    })
    .catch((err) => console.log);
};

export const getUserData = (userHandle) => (dispatch) => {
  dispatch({ type: LOADING_DATA });
  axios
    .get(`/user/${userHandle}`)
    .then((res) => {
      dispatch({
        type: SET_SCREAMS,
        payload: res.data.screams,
      });
    })
    .catch(() => {
      dispatch({
        type: SET_ERRORS,
        payload: null,
      });
    });
};

export const clearErrors = () => (dispatch) => {
  dispatch({ type: CLEAR_ERRORS });
};
