/** @jsx React.DOM */
var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

var Queue = React.createClass({
  getInitialState: function() {
    var user = Snueue.user;
    return {user: user, submissions: [], history: [], flash: null};
  },
  fetch: function(submissions, params) {
    if (this.state.submissions.length === 0) {
      Snueue.showMainLoader();
    }
    $.get("/submissions", params, $.proxy(function(data) {
      history.pushState(params, '', data.source);
      // If no submissions were found on an inital search, display a
      // flash response.
      if (this.state.submissions.length + data.submissions.length === 0)
        this.setState({flash: "No content found for " + this.props.source});
      // Prepend passed in submissions to ones recieved from
      // the sever.
      var newSubmissions = submissions.concat(data.submissions);
      this.setState({submissions: newSubmissions});
    }, this)).always(function() {
      Snueue.hideMainLoader();
    });
  },
  login: function() {
    window.location.replace('/authorize/reddit')
  },
  handleSkip: function() {
    var newHistory = this.state.history;
    newHistory.push(this.state.submissions[0])
    var newSubmissions = this.state.submissions.slice(1);
    this.setState({submissions: newSubmissions, history: newHistory});
    // When there are only a few submissions left, fetch more
    if (newSubmissions.length <= 5) {
      // Included the ids of all the currently queued and watched videos
      // to be excluded from the fetch.
      var excluded = newSubmissions.concat(newHistory);
      excluded = excluded.map(function(sub) { return sub.id });
      this.fetch(newSubmissions, {
        source: this.props.source,
        sorting: this.props.sorting,
        excluded: excluded
      });
    }
  },
  handlePrevious: function() {
    // Get up to the last element from history and place it back
    // in the submission queue.
    var newSubmissions = this.state.submissions;
    newSubmissions.unshift(this.state.history.slice(-1)[0])
    // Remove the last item from the history.
    var newHistory = this.state.history.slice(0,-1);
    this.setState({submissions: newSubmissions, history: newHistory});
  },
  handleSearch: function(source, sorting) {
    this.setState({submissions: [], flash: null});
    this.setProps({source: source, sorting: sorting}, function() {
      this.fetch([], {
        source: this.props.source,
        sorting: this.props.sorting,
        excluded: []
      })
    });
  },
  handlePopstate: function(e) {
    // When the back button is pressed, load the previous search if there was one.
    if (e.state === null) {
      window.location = '/';
    } else {
      this.handleSearch(e.state.source, e.state.sorting);
    }
  },
  handleFlashClose: function() {
    this.setState({flash: null});
  },
  componentDidMount: function() {
    window.addEventListener('popstate', this.handlePopstate)
  },
  render: function() {
    var flash, content, oauth;
    flash = null;
    content = null;
    if (this.state.submissions.length > 0)
      content = <MediaList submissions={this.state.submissions} user={this.state.user}
                           onSkip={this.handleSkip} onPrevious={this.handlePrevious}/>
    if (this.state.flash !== null)
      flash = <FlashMessage key={this.state.flash} message={this.state.flash} onClose={this.handleFlashClose} />
    if (this.state.user !== null)
      oauth = <UserMenu user={this.state.user}/>
    else
      oauth = <Login onLogin={this.login}/>
    return (
      <div id="queue" className="queue">
        <div className="source-bar">
          <div className="row">
            <Search onSearch={this.handleSearch} />
            {oauth}
          </div>
        </div>
        <ReactCSSTransitionGroup transitionName="flash">
          {flash}
        </ReactCSSTransitionGroup>
        {content}
      </div>
    );
  }
});

var FlashMessage = React.createClass({
  render: function() {
    return (
      <div className="row">
        <div className="small-12 columns">
          <p className="flash-message">
            {this.props.message}
            <i className="fa fa-close" onClick={this.props.onClose}></i>
          </p>
        </div>
      </div>
    )
  }
});

var Dropdown = React.createClass({
  getInitialState: function() {
    return {open: false};
  },
  toggleDropdown: function(event) {
    this.setState({open: !this.state.open});
  },
  render: function() {
    var contentNodes = null;
    var dropdown = null
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
      )
    }
    return (
      <div className = "snueue-dropdown">
        <button onClick={this.toggleDropdown} className={"button "+this.props.classes}
                style={this.props.style}>
          {this.props.text} <i className="fa fa-caret-down"></i>
          {dropdown}
        </button>
      </div>
    )
  }
});

var UserMenu = React.createClass({
  render: function() {
    // Dynamically set the font-size of the username based on string length
    var username = this.props.user.substring(0, 24);
    var buttonHeight = 3;
    var fontHeight = Math.min(11.20 / username.length, 1);
    var paddingHeight = (buttonHeight - fontHeight) / 2;
    // Add some extra padding to compensate for a minor difference in rendering height
    // between this and the other buttons.
    paddingHeight += fontHeight < 1 ? 0.054 : 0;
    var dropdownStyle = {
      fontSize: fontHeight + "rem",
      padding: paddingHeight + "rem 0"
    }
    dropdownContent = [
      {text: "Logout", href: "/logout"},
      {text: "Login", href: "/logout"}
    ]
    return (
      <div role="button" className="small-12 large-2 columns end">
        <Dropdown text={username} contents={dropdownContent} classes="navy-button" style={dropdownStyle} />
      </div>
    )
  }
});

var Login = React.createClass({
  handleSubmit: function(e) {
    if (typeof e !== 'undefined')
      e.preventDefault();
      this.props.onLogin();
  },
  render: function() {
    return (
      <form id="login-form" className="login-form" onSubmit={this.handleSubmit} ref="form">
        <div role="button" className="small-12 large-2 columns end">
          <button type="submit" className="button login-button"><i className="fa fa-reddit"></i> Login</button>
        </div>
      </form>
    )
  }
});

var Search = React.createClass({
  handleSubmit: function(e) {
    if (typeof e !== 'undefined')
      e.preventDefault();
    var source = this.refs.source.getDOMNode().value.trim();
    var sorting = this.refs.select.refs.sorting.getDOMNode().value.trim();
    this.props.onSearch(source, sorting);
    return;
  },
  componentDidMount: function() {
    if (Snueue.sourceFromURL !== null) {
      this.refs.source.getDOMNode().value = Snueue.sourceFromURL;
      this.handleSubmit();
    }
  },
  render: function() {
    return (
      <form id="source-form" className="search-form" onSubmit={this.handleSubmit} ref="form">
        <div className="small-12 large-8 columns">
          <div className="row collapse">
            <div className="small-10 columns">
              {/* name="q" is there so that the field can be saved as a search engine. */}
              <input className="search-bar" name="q" type="text" placeholder="/r/music" ref="source"/>
            </div>
            <div className="small-2 columns">
              <SearchSortingSelect ref="select" />
            </div>
          </div>
        </div>
        <div role="button" className="small-12 large-2 columns end">
          <button type="submit" className="button submit-button"><i className="fa fa-arrow-right"></i></button>
        </div>
      </form>
    );
  }
});

var SearchSortingSelect = React.createClass({
  render: function() {
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
    )
  }
});

var MediaList = React.createClass({
  render: function() {
    var queued = this.props.submissions.slice(1);
    var ready = this.props.submissions[0];
    var mediaNodes = queued.map(function(submission, index) {
      return (
        <div key={submission.id}>
          <QueuedMediaItem submission={submission} index={index} />
        </div>
      );
    });
    return (
      <div className="mediaList">
        <MediaItem submission={ready} user={this.props.user}
                   onSkip={this.props.onSkip} onPrevious={this.props.onPrevious}/>
        {mediaNodes}
      </div>
    );
  }
});

var QueuedMediaItem = React.createClass({
  render: function() {
    return (
      <div className="queued-media-item row">
        <div className="small-12 columns end">
          <MediaTitle submission={this.props.submission} index={this.props.index + 1} />
        </div>
      </div>
    );
  }
});

var MediaItem = React.createClass({
  getInitialState: function() {
    return {playerStatus: 'unstarted'};
  },
  handleItemStateChange: function(newPlayerState) {
    this.setState({playerStatus: newPlayerState});
    if (this.state.playerStatus === 'ended')
      this.props.onSkip();
  },
  render: function() {
    var submission = this.props.submission;
    var mediaPlayer = <MediaPlayer onPlayerStateChange={this.handleItemStateChange}
      type={submission.type} url={submission.url} mediaId={submission.media_id} playerStatus={this.state.playerStatus} />;
    return (
      <div id="media-item">
        <MediaController submission={submission} user={this.props.user} status={this.state.playerStatus}
          onConrollerStateChange={this.handleItemStateChange} onPrevious={this.props.onPrevious} onSkip={this.props.onSkip} />
        <div className="media-item row">
          <div className="small-12 columns">
            <MediaTitle submission={submission} index={0} />
            {mediaPlayer}
          </div>
        </div>
      </div>
    );
  }
});

var MediaController = React.createClass({
  inverseStatus: function() {
    return this.props.status === 'playing' ? 'paused' : 'playing';
  },
  handleStatusToggle: function() {
    this.props.onConrollerStateChange(this.inverseStatus());
  },
  componentDidMount: function() {
    $('.media-controller').fixedsticky();
  },
  render: function() {
    var controls = null;
    var redditControls = null;
    var toggleButtonClasses = React.addons.classSet({
      'fa': true,
      'fa-pause': (this.inverseStatus() === 'paused'),
      'fa-play': (this.inverseStatus() === 'playing')
    });
    // We have to set this upfront in order to apply styles to the control componenets
    // below, because components are immuatble. So you can't just count them up after
    // creating them and dynamically assign controlCount.
    var controlCount = 3;
    if (this.props.user !== null) {
      controlCount = 5;
    }
    var buttonMargin = 2;
    var buttonStyle = {
      width: (100/controlCount + buttonMargin/controlCount) - buttonMargin + "%"
    }
    controls = [
      <div className="button primary" onClick={this.props.onPrevious} style={buttonStyle}>
        <i className="fa fa-backward"></i>
      </div>,
      <div className="button primary" onClick={this.handleStatusToggle} style={buttonStyle}>
        <i className={toggleButtonClasses}></i>
      </div>,
      <div className="button primary" onClick={this.props.onSkip} style={buttonStyle}>
        <i className="fa fa-forward"></i>
      </div>
    ]
    if (this.props.user !== null) {
      redditControls = <RedditAPIController submission={this.props.submission} buttonStyle={buttonStyle} />
    }
    return (
      <div id="media-controller" className="media-controller sticky">
        <div className="row">
          <div className="small-12 columns end">
            {redditControls}
            {controls}
          </div>
        </div>
      </div>
    );
  }
});

var RedditAPIController = React.createClass({
  handleUpvote: function () {
    this.submitVote(1);
  },
  handleDownvote: function () {
    this.submitVote(-1);
  },
  submitVote: function(direction) {
    $.ajax({
      url: "/user/vote",
      type: 'PUT',
      data: {submission: this.props.submission.id, direction: direction},
      success: function(data) {
        console.log("Voted")
      }
    });
  },
  render: function() {
    var buttonStyle = this.props.buttonStyle;
    return (
      <span id="reddit-media-controller">
        <div className="button primary" onClick={this.handleUpvote} style={buttonStyle}>
          <i className="fa fa-arrow-up"></i>
        </div>
        <div className="button primary" onClick={this.handleDownvote} style={buttonStyle}>
          <i className="fa fa-arrow-down"></i>
        </div>
      </span>
    )
  }
})

var MediaTitle = React.createClass({
  render: function() {
    var index = '';
    if (this.props.index > 0) {
      index = '' + this.props.index + '. '
    }
    // Decode escaped HTML entities from submission title
    var decodedTitle = $('<textarea/>').html(this.props.submission.title).text();
    return (
      <div className="media-title">
        <a className="permalink" href={this.props.submission.permalink} target="_blank">
          {index}{decodedTitle}
        </a>
      </div>
    )
  }
});

var MediaPlayer = React.createClass({
  initializePlayer: function() {
    var component = this;
    var settings = {
      autohide: 1,
      showinfo: 0,
      rel: 0,
      color: "white",
      modestbranding: 1
    }
    Snueue.player = new YT.Player('player', {
      height: '315',
      width: '420',
      videoId: this.props.mediaId,
      playerVars: settings,
      events: {
        'onReady': function(e) {
          Snueue.player.playVideo();
        },
        'onStateChange': this.playerStateChange,
        'onError': this.playerError
      }
    });
  },
  playerStateChange: function(e) {
    var state;
    switch(e.data) {
      case YT.PlayerState.PLAYING:
        state = 'playing';
        break;
      case YT.PlayerState.PAUSED:
        state = 'paused'
        break;
      case YT.PlayerState.ENDED:
        state = 'ended';
        break;
      case YT.PlayerState.BUFFERING:
        state = 'buffering'
      default:
        state = 'unstarted'
    }
    this.props.onPlayerStateChange(state);
  },
  playerError: function(e) {
    // If the player encounters an error such as the video being deleted,
    // end it and skip to the next one.
    this.props.onPlayerStateChange('ended')
  },
  toggleStatus: function(nextStatus) {
    if (nextStatus === 'playing') {
      Snueue.player.playVideo();
    } else if (nextStatus === 'paused') {
      Snueue.player.pauseVideo();
    }
  },
  shouldComponentUpdate: function(nextProps, nextState) {
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
  },
  componentDidMount: function() {
    this.initializePlayer();
  },
  componentDidUpdate: function() {
    // Clear out previous player and update.
    $('#player').replaceWith("<div id=\"player\"></div>");
    this.initializePlayer();
  },
  render: function() {
    return (
      <div className="media-player row">
        <div className="small-12 columns">
          <div className="flex-video">
            <div id="player"></div>
          </div>
        </div>
      </div>
    );
  }
});

function renderQueue() {
  React.render(
    <Queue />,
    document.getElementById('main')
  );
}
function onYouTubeIframeAPIReady() {
  renderQueue();
}

setTimeout(function() {
  if ($('#queue').length === 0) {
    renderQueue();
  }
}, 500);
