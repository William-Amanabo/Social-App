import {SET_USER,SET_ERRORS, CLEAR_ERRORS, LOADING_UI, SET_UNAUTHENTICATED, LOADING_USER, MARK_NOTIFICATIONS_READ,SET_NOTIFICATION} from '../types'
import axios from 'axios'

import {requestPermission, deleteToken} from '../../firebaseInit';

export const loginUser = (userData, history, component) =>(dispatch) =>{
    
    dispatch({type: LOADING_UI});
    axios.post('/login', userData)
        .then(res =>{
            //console.log(".then is being dispatched",res)
            setAuthorization(res.data.token)
            dispatch(getUserData())
            dispatch({type:CLEAR_ERRORS});
            history.push('/')
        })
        .catch(err=>{
            //console.error({"error message is being dispatched":err.response.data})
            
            dispatch({
                type: SET_ERRORS,
                payload: err.response.data
            })
            console.log({"assigning errors":err.response.data})
            component.setState({errors:err.response.data, loading:false})
        
        })
        
}

export const signupUser = (newUserData, history, component) =>(dispatch) =>{
    dispatch({type: LOADING_UI});
    axios.post('/signup', newUserData)
        .then(res =>{
            setAuthorization(res.data.token)
            dispatch(getUserData())
            dispatch({type:CLEAR_ERRORS});
            history.push('/')
        })
        .catch(err=>{
            console.log(err)
            dispatch({
                type: SET_ERRORS,
                payload: err.response.data
            })
            component.setState({errors:err.response.data,loading:false})
        })
}

export const logoutUser = () => (dispatch) =>{
    localStorage.removeItem('FBIdToken');
    delete axios.defaults.headers.common['Authorization']
    dispatch({type: SET_UNAUTHENTICATED})
    deleteToken()
}

export const getUserData = () =>(dispatch)=>{
    dispatch({type:LOADING_USER})
    //console.log('[getUserData runs]')
    axios.get('/user')
    .then(res =>{
        dispatch({
            type:SET_USER,
            payload: res.data
        })

    })
    .catch(err =>{
        console.log({"getUserData error":err})
    })
}

export const setNotification = () => (dispatch) =>{
    axios.get('/user')
    .then(res =>{
        dispatch({
            type:SET_NOTIFICATION,
            payload: res.data
        })

    })
    .catch(err =>{
        console.log({"getUserData error":err})
    })
}

export const uploadImage = (formData) => (dispatch) =>{
    dispatch({type: LOADING_USER})
    axios.post('/user/image', formData)
    .then(() =>{
        dispatch(getUserData())
    })
    .catch(err =>{console.log('[this is error from uploadImage]',err)
    /* dispatch({
        type:SET_ERRORS,

    }) */
})
}

export const  editUserDetails =(userDetails) =>(dispatch) =>{
    dispatch({type:LOADING_USER});
    axios.post('/user', userDetails)
    .then(() =>{
        dispatch(getUserData())
    })
    .catch(err=>console.log)
}

export  const  markNotificationsRead = (notificationsIds) => dispatch =>{
    axios.post('/notifications', notificationsIds)
    .then(res =>{
        dispatch({
            type: MARK_NOTIFICATIONS_READ,
        })
    })
    .catch(err=>console.log)
}

const setAuthorization = (token) =>{
    const FBIdToken = `Bearer ${token}`
    // console.log('[authorization token]', FBIdToken) //[DEBUGGING]
    localStorage.setItem('FBIdToken', `Bearer ${token}`)
    axios.defaults.headers.common['Authorization'] = FBIdToken

    /* navigator.serviceWorker.controller.postMessage({
        type:"token"
    }) */

    requestPermission();

}