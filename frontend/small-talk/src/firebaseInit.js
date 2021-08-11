import firebase from "firebase/app";
import "firebase/messaging";
import axios from "axios";
import store from "./redux/stores";
import  {setNotification} from './redux/actions/userActions'

var firebaseConfig = {
  apiKey: "AIzaSyChn9O7MUyLFURGPvBcqd_fp9Ex9Mg5cIk",
  authDomain: "tinyspace-7d773.firebaseapp.com",
  databaseURL: "https://tinyspace-7d773.firebaseio.com",
  projectId: "tinyspace-7d773",
  storageBucket: "tinyspace-7d773.appspot.com",
  messagingSenderId: "1004886902815",
  appId: "1:1004886902815:web:5cd3bc00c6c5bb6f5a2d2a",
  measurementId: "G-K8987MGCDW",
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const FIREBASE_MESSAGING = firebase.messaging();
FIREBASE_MESSAGING.usePublicVapidKey(
  "BISVjK1MjDvt81JMxEKdXXvW5wQ2iaYjlbEqdN9tKEQmeCvok51oVF4BPXprEVnL5NZLxk6pciXFHVsls9G1zVE"
);

const setToken = (value) =>{
    if(value === true){
        localStorage.setItem("TokenSet",'true')
    }else{
        localStorage.setItem("TokenSet",'false');
    }
}

const getToken = () =>{
  //console.trace("checking Tokenset status",localStorage.getItem("TokenSet"))
    return localStorage.getItem("TokenSet");
}

export const requestPermission = () => {
  if (localStorage.getItem("FBIdToken")) {
    if (getToken() === 'false' || getToken() === null) {
      Notification.requestPermission()
        .then(() =>
          FIREBASE_MESSAGING.getToken()
            .then((token) => {
              /* const token1 = localStorage.getItem("FBIdToken")
              axios.defaults.headers.common["Authorization"] = token1; */
                /* axios.post("/pushNotification",{token: JSON.stringify({ token})}) */
                axios.post("/pushNotification",{token})
                .then(() => {
                  console.log("Setting local storage TokenSet to true");
                  setToken(true);
                })
                .catch((err) => {
                  console.log("error sending from axios :(", err);
                });
            })
        )
        .catch((err) => {
          console.log("error getting permission :(", err);
        });
    }
  }
};

export const onMessage = () =>{
    FIREBASE_MESSAGING.onMessage((payload) => {
        console.log("Message received. ", payload);


        navigator.serviceWorker.getRegistration().then(function(reg) {
          reg.showNotification('Hello world!');
        });

        store.dispatch(setNotification());
      });
    
}


export const tokenRefresh = () =>{
    FIREBASE_MESSAGING.onTokenRefresh(() => {
        FIREBASE_MESSAGING.getToken()
        .then((token) => {
            axios.post("/pushNotification",{body: JSON.stringify({ token: token })});
            console.log("token refreshed")
        })
        .catch((err) => {
          console.log("Unable to retrieve refreshed token ", err);
        });
          })
     
}

export const deleteToken = () => {
    // Delete Instance ID token.
    // [START delete_token]
    FIREBASE_MESSAGING.getToken().then((currentToken) => {
        FIREBASE_MESSAGING.deleteToken(currentToken).then(() => {
          console.log('Token deleted.');
          setToken(false);
        }).catch((err) => {
          console.log('Unable to delete token. ', err);
        });
        // [END delete_token]
      }).catch((err) => {
        console.log('Error retrieving Instance ID token. ', err);
      });
}

