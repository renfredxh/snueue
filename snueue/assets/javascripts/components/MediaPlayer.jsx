class MediaPlayer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {playerStatus: 'unstarted'};
  }
  handleItemStateChange(newPlayerState) {
    this.setState({playerStatus: newPlayerState});
    if (this.state.playerStatus === 'ended') this.props.onSkip();
  }
  render() {
    let submission = this.props.submission;
    let mediaPlayer = <YouTubePlayer onPlayerStateChange={this.handleItemStateChange.bind(this)}
      type={submission.type} url={submission.url} mediaId={submission.media_id} playerStatus={this.state.playerStatus} />;
    return (
      <div id="current-media-item">
        <MediaController submission={submission} user={this.props.user} status={this.state.playerStatus}
          onConrollerStateChange={this.handleItemStateChange.bind(this)} onPrevious={this.props.onPrevious} onSkip={this.props.onSkip} />
        <div className="media-item">
          <PlayerTitle submission={submission} />
          {mediaPlayer}
        </div>
      </div>
    );
  }
}

class PlayerTitle extends React.Component {
  render() {
    // Decode escaped HTML entities from submission title
    let decodedTitle = $('<textarea/>').html(this.props.submission.title).text();
    return (
      <div className="media-title">
        <a className="permalink" href={this.props.submission.permalink} target="_blank">
          {decodedTitle}
        </a>
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
    if (this.props.user) {
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
    if (this.props.user) {
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
      success: (data) => { console.log("Voted"); }
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

class YouTubePlayer extends React.Component {
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
        'onReady': e => Snueue.player.playVideo(),
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

export default MediaPlayer;
