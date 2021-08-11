// eslint-disable-next-line
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

// import { Route, BrowserRouter as Router } from "react-router-dom";

const rootElement = document.getElementById("root");

/* const routing = (
  <Router>
    <div>
      <Route exact path="/" component={App} />
    </div>
  </Router>
); */
ReactDOM.render(<App/>, rootElement);

serviceWorker.register()

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
//serviceWorker.unregister();


