import React from 'react';

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

  login() {
    window.location.replace('/authorize/reddit');
  }

  handlePopstate(e) {
    // When the back button is pressed, load the previous search if there was one.
    if (e.state === null) {
      window.location = '/';
    } else {
      this.handleSearch(e.state.source, e.state.sorting);
    }
  }

  componentDidMount() {
    window.addEventListener('popstate', this.handlePopstate);
  }

  render() {
    let oauth;
    let content = null;
    if (this.state.user !== null) oauth = <UserMenu user={this.state.user}/>;
    else oauth = <Login onLogin={this.login.bind(this)}/>;
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
        <SubmissionSection user={this.state.user}/>
      </div>
    );
  }
}

export default App;
