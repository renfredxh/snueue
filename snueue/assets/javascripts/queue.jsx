const ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

class Queue extends React.Component {
  constructor(props) {
    super(props);
    let user = Snueue.user;
    this.state = {user: user, submissions: [], history: [], flash: null};
  }
  fetch(submissions, params) {
    if (this.state.submissions.length === 0) {
      Snueue.showMainLoader();
    }
    $.get("/submissions", params, $.proxy(function(data) {
      history.pushState(params, '', data.source);
      // If no submissions were found on an inital search, display a
      // flash response.
      if (this.state.submissions.length + data.submissions.length === 0)
        this.setState({flash: "No content found for " + this.state.source});
      // Prepend passed in submissions to ones recieved from
      // the sever.
      let newSubmissions = submissions.concat(data.submissions);
      this.setState({submissions: newSubmissions});
    }, this)).always(function() {
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
      excluded = excluded.map(function(sub) { return sub.id; });
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
    if (source === '') {
      source = "/r/music";
      // It's ok to mutate the value field of this input just to serve as
      // an example.
      $('#search-bar').val(source);
    }
    this.setState({source: source, sorting: sorting}, function() {
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
            <Search onSearch={this.handleSearch.bind(this)} />
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

class FlashMessage extends React.Component {
  render() {
    return (
      <p className="flash-message">
        {this.props.message}
        <i className="fa fa-close" onClick={this.props.onClose}></i>
      </p>
    );
  }
}

class Dropdown extends React.Component {
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
      contentNodes = this.props.contents.map(function(item, index) {
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
      {text: "Login", href: "/logout"}
    ];
    return (
      <Dropdown text={username} contents={dropdownContent} classes="navy-button" style={dropdownStyle} />
    );
  }
}

class Login extends React.Component {
  handleSubmit(e) {
    if (typeof e !== 'undefined')
      e.preventDefault();
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

class Search extends React.Component {
  handleSubmit(e) {
    if (typeof e !== 'undefined')
      e.preventDefault();
    let source = this.refs.source.getDOMNode().value.trim();
    let sorting = this.refs.select.refs.sorting.getDOMNode().value.trim();
    this.props.onSearch(source, sorting);
    return;
  }
  componentDidMount() {
    if (Snueue.sourceFromURL !== null) {
      this.refs.source.getDOMNode().value = Snueue.sourceFromURL;
      this.handleSubmit();
    }
  }
  render() {
    return (
      <form id="source-form" className="search-form" onSubmit={this.handleSubmit.bind(this)} ref="form">
        {/* name="q" is there so that the field can be saved as a search engine. */}
        <div className="search-bar-container">
          <input id="search-bar" className="search-bar" name="q" type="text" placeholder="/r/music" ref="source"/>
          <SearchSortingSelect ref="select" />
        </div>
        <button type="submit" className="button submit-button"><i className="fa fa-arrow-right"></i></button>
      </form>
    );
  }
}

class SearchSortingSelect extends React.Component {
  render() {
    return (
      <select className="results-sorting-select" ref="sorting">
        <option disabled="disabled">Sort By:</option>
        <option value="hot" defaultValue>Hot</option>
        <option value="new">New</option>
        <optgroup label="Top">
          <option value="hour">Hour</option>
          <option value="day">Day</option>
          <option value="week">Week</option>
          <option value="month">Month</option>
          <option value="year">Year</option>
          <option value="all">All</option>
        </optgroup>
      </select>
    );
  }
}

class MediaList extends React.Component {
  render() {
    let queued = this.props.submissions.slice(1);
    let ready = this.props.submissions[0];
    let mediaNodes = queued.map(function(submission, index) {
      return (
        <div key={submission.id}>
          <QueuedMediaItem submission={submission} index={index} />
        </div>
      );
    });
    return (
      <div className="media-list">
        <MediaItem submission={ready} user={this.props.user}
                   onSkip={this.props.onSkip} onPrevious={this.props.onPrevious}/>
        {mediaNodes}
      </div>
    );
  }
}

class QueuedMediaItem extends React.Component {
  render() {
    return (
      <div className="queued-media-item ">
        <MediaTitle submission={this.props.submission} index={this.props.index + 1} />
      </div>
    );
  }
}

class MediaItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {playerStatus: 'unstarted'};
  }
  handleItemStateChange(newPlayerState) {
    this.setState({playerStatus: newPlayerState});
    if (this.state.playerStatus === 'ended')
      this.props.onSkip();
  }
  render() {
    let submission = this.props.submission;
    let mediaPlayer = <MediaPlayer onPlayerStateChange={this.handleItemStateChange.bind(this)}
      type={submission.type} url={submission.url} mediaId={submission.media_id} playerStatus={this.state.playerStatus} />;
    return (
      <div id="current-media-item">
        <MediaController submission={submission} user={this.props.user} status={this.state.playerStatus}
          onConrollerStateChange={this.handleItemStateChange.bind(this)} onPrevious={this.props.onPrevious} onSkip={this.props.onSkip} />
        <div className="media-item">
          <MediaTitle submission={submission} index={0} />
          {mediaPlayer}
        </div>
      </div>
    );
  }
}

class MediaController extends React.Component {
  inverseStatus() {
    return this.props.status === 'playing' ? 'paused' : 'playing';
  }
  handleStatusToggle() {
    this.props.onConrollerStateChange(this.inverseStatus());
  }
  componentDidMount() {
    $('.media-controller-container').fixedsticky();
  }
  render() {
    let controls, redditControls  = [null, null];
    let toggleButtonClasses = React.addons.classSet({
      'fa': true,
      'fa-pause': (this.inverseStatus() === 'paused'),
      'fa-play': (this.inverseStatus() === 'playing')
    });
    // We have to set this upfront in order to apply styles to the control componenets
    // below, because components are immuatble. So you can't just count them up after
    // creating them and dynamically assign controlCount.
    let controlCount = 3;
    if (this.props.user !== null) {
      controlCount = 5;
    }
    let buttonMargin = 2;
    let buttonStyle = {
      width: (100/controlCount + buttonMargin/controlCount) - buttonMargin + "%"
    };
    controls = [
      <div className="button primary" key="back" onClick={this.props.onPrevious} style={buttonStyle}>
        <i className="fa fa-backward"></i>
      </div>,
      <div className="button primary" key="play-pause" onClick={this.handleStatusToggle.bind(this)} style={buttonStyle}>
        <i className={toggleButtonClasses}></i>
      </div>,
      <div className="button primary" key="skip" onClick={this.props.onSkip} style={buttonStyle}>
        <i className="fa fa-forward"></i>
      </div>
    ];
    if (this.props.user !== null) {
      redditControls = <RedditAPIController submission={this.props.submission} buttonStyle={buttonStyle} />;
    }
    return (
      <div className="media-controller-container">
        <div id="media-controller" className="media-controller">
          {redditControls}
          {controls}
        </div>
      </div>
    );
  }
}

class RedditAPIController extends React.Component {
  handleUpvote() {
    this.submitVote(1);
  }
  handleDownvote() {
    this.submitVote(-1);
  }
  submitVote(direction) {
    $.ajax({
      url: "/user/vote",
      type: 'PUT',
      data: {submission: this.props.submission.id, direction: direction},
      success: function(data) {
        console.log("Voted");
      }
    });
  }
  render() {
    let buttonStyle = this.props.buttonStyle;
    return (
      <span id="reddit-media-controller">
        <div className="button primary" key="upvote" onClick={this.handleUpvote.bind(this)} style={buttonStyle}>
          <i className="fa fa-arrow-up"></i>
        </div>
        <div className="button primary" key="downvote" onClick={this.handleDownvote.bind(this)} style={buttonStyle}>
          <i className="fa fa-arrow-down"></i>
        </div>
      </span>
    );
  }
}

class MediaTitle extends React.Component {
  render() {
    let index = '';
    if (this.props.index > 0) {
      index = '' + this.props.index + '. ';
    }
    // Decode escaped HTML entities from submission title
    let decodedTitle = $('<textarea/>').html(this.props.submission.title).text();
    return (
      <div className="media-title">
        <a className="permalink" href={this.props.submission.permalink} target="_blank">
          {index}{decodedTitle}
        </a>
      </div>
    );
  }
}

class MediaPlayer extends React.Component {
  initializePlayer() {
    let component = this;
    let settings = {
      autohide: 1,
      showinfo: 0,
      rel: 0,
      color: "white",
      modestbranding: 1
    };
    Snueue.player = new YT.Player('player', {
      height: '315',
      width: '420',
      videoId: this.props.mediaId,
      playerVars: settings,
      events: {
        'onReady': function(e) {
          Snueue.player.playVideo();
        },
        'onStateChange': this.playerStateChange.bind(this),
        'onError': this.playerError.bind(this)
      }
    });
  }
  playerStateChange(e) {
    let state;
    switch(e.data) {
      case YT.PlayerState.PLAYING:
        state = 'playing';
        break;
      case YT.PlayerState.PAUSED:
        state = 'paused';
        break;
      case YT.PlayerState.ENDED:
        state = 'ended';
        break;
      case YT.PlayerState.BUFFERING:
        state = 'buffering';
        break;
      default:
        state = 'unstarted';
    }
    this.props.onPlayerStateChange(state);
  }
  playerError(e) {
    // If the player encounters an error such as the video being deleted,
    // end it and skip to the next one.
    this.props.onPlayerStateChange('ended');
  }
  toggleStatus(nextStatus) {
    if (nextStatus === 'playing') {
      Snueue.player.playVideo();
    } else if (nextStatus === 'paused') {
      Snueue.player.pauseVideo();
    }
  }
  shouldComponentUpdate(nextProps, nextState) {
    // If the parent state updates while the current submission is still
    // playing, don't re-render or else the video will restart.
    if (this.props.mediaId === nextProps.mediaId) {
      // If the status has changed, update the player accordingly
      if (this.props.playerStatus !== nextProps.playerStatus) {
        this.toggleStatus(nextProps.playerStatus);
      }
      return false;
    }
    return true;
  }
  componentDidMount() {
    this.initializePlayer();
  }
  componentDidUpdate() {
    // Clear out previous player and update.
    $('#player').replaceWith("<div id=\"player\"></div>");
    this.initializePlayer();
  }
  render() {
    return (
      <div className="media-player">
        <div id="player"></div>
      </div>
    );
  }
}

export function renderQueue() {
  React.render(
    <Queue />,
    document.getElementById('main')
  );
}
