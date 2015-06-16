import React from 'react';
import { RouteHandler } from 'react-router';

import SubmissionActions from '../actions/SubmissionActions.js';

import SubmissionSection from './SubmissionSection.jsx';
import SearchBar from './SearchBar.jsx';
import Login from './Login.jsx';
import UserMenu from './UserMenu.jsx';

class App extends React.Component {
  constructor(props) {
    super(props);
    let user = Snueue.user;
    this.state = { user };
  }

  render() {
    let oauth;
    let content = null;
    if (this.state.user !== null) oauth = <UserMenu user={this.state.user}/>;
    else oauth = <Login />;
    return (
      <div id="queue" className="queue">
        <div className="source-bar-container">
          <div className="source-bar">
            <SearchBar />
            <div className="user-button">
              {oauth}
            </div>
          </div>
        </div>
        <RouteHandler user={this.state.user} />
      </div>
    );
  }
}

export default App;
