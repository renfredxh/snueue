import React from 'react';

class Login extends React.Component {
  handleLogin(e) {
    if (typeof e !== 'undefined') e.preventDefault();
    window.location.replace('/authorize/reddit');
  }

  render() {
    return (
      <form id="login-form" className="login-form" onSubmit={this.handleLogin.bind(this)} ref="form">
        <button type="submit" className="button login-button"><i className="fa fa-reddit"></i> Login</button>
      </form>
    );
  }
}

export default Login;
