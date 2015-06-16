import React from 'react';
import { RouteHandler } from 'react-router';

import Header from './Header.jsx';

class App extends React.Component {
  constructor(props) {
    super(props);
    let user = Snueue.user;
    this.state = { user };
  }

  render() {
    return (
      <div id="app">
        <Header user={this.state.user} />
        <RouteHandler user={this.state.user} />
      </div>
    );
  }
}

export default App;
