const ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

import { MediaList } from './queue.jsx';
import SearchBar from './searchBar.jsx';
import Login from './login.jsx';
import UserMenu from './userMenu.jsx';
import { FlashMessage } from './utils.jsx';

class App extends React.Component {
  constructor(props) {
    super(props);
    let user = Snueue.user;
    this.state = {user: user, submissions: [], history: [], flash: null};
  }
  fetch(submissions, params) {
    if (this.state.submissions.length === 0) {
      Snueue.showMainLoader();
    }
    $.get("/submissions", params, $.proxy((data) => {
      history.pushState(params, '', data.source);
      // If no submissions were found on an inital search, display a
      // flash response.
      if (this.state.submissions.length + data.submissions.length === 0) {
        this.setState({flash: "No content found for " + this.state.source});
      }
      // Prepend passed in submissions to ones recieved from
      // the sever.
      let newSubmissions = submissions.concat(data.submissions);
      this.setState({submissions: newSubmissions});
    }, this)).always(() => {
      Snueue.hideMainLoader();
    });
  }
  login() {
    window.location.replace('/authorize/reddit');
  }
  handleSkip() {
    let newHistory = this.state.history;
    newHistory.push(this.state.submissions[0]);
    let newSubmissions = this.state.submissions.slice(1);
    this.setState({submissions: newSubmissions, history: newHistory});
    // When there are only a few submissions left, fetch more
    if (newSubmissions.length <= 5) {
      // Included the ids of all the currently queued and watched videos
      // to be excluded from the fetch.
      let excluded = newSubmissions.concat(newHistory);
      excluded = excluded.map(sub => sub.id);
      this.fetch(newSubmissions, {
        source: this.state.source,
        sorting: this.state.sorting,
        excluded: excluded
      });
    }
  }
  handlePrevious() {
    // Get up to the last element from history and place it back
    // in the submission queue.
    let newSubmissions = this.state.submissions;
    newSubmissions.unshift(this.state.history.slice(-1)[0]);
    // Remove the last item from the history.
    let newHistory = this.state.history.slice(0,-1);
    this.setState({submissions: newSubmissions, history: newHistory});
  }
  handleSearch(source, sorting) {
    this.setState({submissions: [], flash: null});
    // Default to showing /r/music
    if (!source) {
      source = "/r/music";
      // It's ok to mutate the value field of this input just to serve as
      // an example.
      $('#search-bar').val(source);
    }
    this.setState({source: source, sorting: sorting}, () => {
      this.fetch([], {
        source: this.state.source,
        sorting: this.state.sorting,
        excluded: []
      });
    });
  }
  handlePopstate(e) {
    // When the back button is pressed, load the previous search if there was one.
    if (e.state === null) {
      window.location = '/';
    } else {
      this.handleSearch(e.state.source, e.state.sorting);
    }
  }
  handleFlashClose() {
    this.setState({flash: null});
  }
  componentDidMount() {
    window.addEventListener('popstate', this.handlePopstate);
  }
  render() {
    let oauth;
    let flash, content = [null, null];
    if (this.state.submissions.length > 0)
      content = <MediaList submissions={this.state.submissions} user={this.state.user}
                           onSkip={this.handleSkip.bind(this)} onPrevious={this.handlePrevious.bind(this)}/>;
    if (this.state.flash !== null)
      flash = <FlashMessage key={this.state.flash} message={this.state.flash} onClose={this.handleFlashClose.bind(this)} />;
    if (this.state.user !== null)
      oauth = <UserMenu user={this.state.user}/>;
    else
      oauth = <Login onLogin={this.login.bind(this)}/>;
    return (
      <div id="queue" className="queue">
        <div className="source-bar-container">
          <div className="source-bar">
            <SearchBar onSearch={this.handleSearch.bind(this)} />
            <div className="user-button">
              {oauth}
            </div>
          </div>
        </div>
        <ReactCSSTransitionGroup transitionName="flash">
          {flash}
        </ReactCSSTransitionGroup>
        {content}
      </div>
    );
  }
}

export default App;
