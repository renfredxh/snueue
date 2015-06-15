/**
 * Escape HTML entities (eg. "&lt;") from text.
 */
export function decodeHTML(encodedText) {
  // Escape text using a well known jQuery trick
  return $('<textarea/>').html(encodedText).text();
}

export class SpinningLoader extends React.Component {
  render() {
    return (
      <div className="loader"></div>
    );
  }
}

export class Dropdown extends React.Component {
  constructor(props) {
    super(props);
    this.state = {open: false};
  }

  toggleDropdown(event) {
    this.setState({open: !this.state.open});
  }

  render() {
    let contentNodes, dropdown = [null, null];
    if (this.state.open) {
      contentNodes = this.props.contents.map((item, index) => {
        return (
          <a key={item.text} href={item.href}>{item.text}</a>
        );
      });
      dropdown = (
        <div className="dropdown-content">
          {contentNodes}
        </div>
      );
    }
    return (
      <div className = "snueue-dropdown">
        <div onClick={this.toggleDropdown.bind(this)} className={"button "+this.props.classes}
                style={this.props.style}>
          {this.props.text} <i className="fa fa-caret-down"></i>
          {dropdown}
        </div>
      </div>
    );
  }
}

export class FlashMessage extends React.Component {
  render() {
    return (
      <p className="flash-message">
        {this.props.message}
        <i className="fa fa-close" onClick={this.props.onClose}></i>
      </p>
    );
  }
}
