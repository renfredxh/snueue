import React from 'react';

import Search from './Search.jsx';
import Login from './Login.jsx';
import UserMenu from './UserMenu.jsx';

class Header extends React.Component {
  render() {
    let oauth;
    if (this.props.user !== null) oauth = <UserMenu user={this.props.user}/>;
    else oauth = <Login />;
    return (
      <header className="header-container">
        <div className="header-controls">
          <Search />
          <div className="user-button">
            {oauth}
          </div>
        </div>
      </header>
    );
  }
}

export default Header;
