import React from 'react/addons';

import { Dropdown } from './utils.jsx';

class UserMenu extends React.Component {
  render() {
    // Dynamically set the font-size of the username based on string length
    let username = this.props.user.substring(0, 24);
    let buttonHeight = 3;
    let fontHeight = Math.min(11.20 / username.length, 1);
    let paddingHeight = (buttonHeight - fontHeight) / 2;
    // Add some extra padding to compensate for a minor difference in rendering height
    // between this and the other buttons.
    paddingHeight += fontHeight < 1 ? 0.054 : 0;
    let dropdownStyle = {
      fontSize: fontHeight + "rem",
      padding: paddingHeight + "rem 0"
    };
    let dropdownContent = [
      {text: "Logout", href: "/logout"},
    ];
    return (
      <Dropdown text={username} contents={dropdownContent} classes="navy-button" style={dropdownStyle} />
    );
  }
}

export default UserMenu;
