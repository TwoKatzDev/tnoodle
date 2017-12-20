import React, { Component } from 'react';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { Route, Redirect } from 'react-router';
import createHistory from 'history/createBrowserHistory';
import { ConnectedRouter, routerReducer, routerMiddleware } from 'react-router-redux';

import * as reducers from 'reducers';
import * as WcaApi from 'WcaApi';
import Home from 'Home';
import ManageCompetition from 'ManageCompetition';

export const BASE_PATH = process.env.PUBLIC_URL;

const history = createHistory({
  basename: BASE_PATH,
});

const middleware = routerMiddleware(history);

const store = createStore(
  combineReducers({
    ...reducers,
    router: routerReducer,
  }),
  composeWithDevTools(applyMiddleware(middleware, thunk)),
);

const wrapWithTitle = function(Tag, propsToTitle) {
  return class extends Component {
    componentWillMount() {
      document.title = propsToTitle(this.props);
    }

    render() {
      return <Tag {...this.props} />;
    }
  };
};

export class NavigationAwareComponent extends Component {
  componentWillMount() {
    this.unblock = history.block(() => this.props.willNavigateAway());
    window.addEventListener('beforeunload', this.beforeunload.bind(this));
  }

  beforeunload(e) {
    let message = this.props.willNavigateAway();
    if(message) {
      e.returnValue = message;
    }
  }

  componentWillUnmount() {
    this.unblock();
    window.removeEventListener('beforeunload', this.beforeunload);
  }

  render() {
    return null;
  }
}

export const App = function() {
  return (
    <Provider store={store}>
      { /* ConnectedRouter will use the store from Provider automatically */ }
      <ConnectedRouter history={history}>
        <div>
          <Route exact path="/" component={wrapWithTitle(Home, () => 'TNoodle')} />
          <Route path="/oauth/wca" render={() => <Redirect to={WcaApi.getPreLoginPath()} />} />
          <Route path="/competitions/:competitionId" component={wrapWithTitle(ManageCompetition, props => `${props.match.params.competitionId} | TNoodle`)} />
        </div>
      </ConnectedRouter>
    </Provider>
  );
};