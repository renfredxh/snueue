import React from 'react';

class Login extends React.Component {
  handleSubmit(e) {
    if (typeof e !== 'undefined') e.preventDefault();
    this.props.onLogin();
  }

  render() {
    return (
      <form id="login-form" className="login-form" onSubmit={this.handleSubmit.bind(this)} ref="form">
        <button type="submit" className="button login-button"><i className="fa fa-reddit"></i> Login</button>
      </form>
    );
  }
}

export default Login;
