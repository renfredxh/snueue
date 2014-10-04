/** @jsx React.DOM */
var Queue = React.createClass({
  getInitialState: function() {
    return {submissions: [], history: []};
  },
  handleSkip: function() {
    var newHistory = this.state.history;
    newHistory.push(this.state.submissions[0])
    var newSubmissions = this.state.submissions.slice(1);
    this.setState({submissions: newSubmissions, history: newHistory});
  },
  handlePrevious: function() {
    // Get up to the last elemt from history and place it back
    // in the submission queue.
    var newSubmissions = this.state.submissions;
    newSubmissions.unshift(this.state.history.slice(-1)[0])
    // Remove the last item from the history.
    var newHistory = this.state.history.slice(0,-1);
    this.setState({submissions: newSubmissions, history: newHistory});
  },
  handleFetch: function(data) {
    this.setState(data);
  },
  render: function() {
    var content;
    if (this.state.submissions.length > 0)
      content = <MediaList submissions={this.state.submissions} onSkip={this.handleSkip} onPrevious={this.handlePrevious}/>
    else
      content = null
    return (
      <div className="queue">
        <div className="row">
          <Search onFetch={this.handleFetch} />
        </div>
        {content}
      </div>
    );
  }
});

var Search = React.createClass({
  handleSubmit: function(e) {
    if (typeof e !== 'undefined')
      e.preventDefault();
    var source = this.refs.source.getDOMNode().value.trim();
    var sorting = this.refs.sorting.getDOMNode().value.trim();
    $.post("/submissions", {
      source: source,
      sorting: sorting
    }, $.proxy(function(data) {
      this.props.onFetch(data);
    }, this));
    return;
  },
  componentDidMount: function() {
    if (snueue.sourceFromURL !== undefined) {
      this.refs.source.getDOMNode().value = snueue.sourceFromURL;
      this.handleSubmit();
    }
  },
  render: function() {
    return (
      <form id="source-form" className="search-form" onSubmit={this.handleSubmit} ref="form">
        <div className="small-12 large-10 large-offset-1 columns">
          <div className="row collapse">
            <div className="small-10 columns">
              <input className="search-bar" type="text" placeholder="/r/music" ref="source"/>
            </div>
            <div className="small-2 columns">
              <select className="results-sorting-select" ref="sorting">
                <option value="hot">Hot</option>
                <option value="top">Top</option>
                <option value="new">New</option>
              </select>
            </div>
          </div>
        </div>
        <div role="button" className="small-12 large-1 columns end">
          <button type="submit" className="button"><i className="fa fa-arrow-right"></i></button>
        </div>
      </form>
    );
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
        <MediaItem submission={ready} onSkip={this.props.onSkip} onPrevious={this.props.onPrevious}/>
        {mediaNodes}
      </div>
    );
  }
});

var QueuedMediaItem = React.createClass({
  render: function() {
    return (
      <div className="media-item queued-media-item row">
        <div className="small-10 large-offset-1 columns end">
          <MediaTitle submission={this.props.submission} />
        </div>
      </div>
    );
  }
});

var MediaItem = React.createClass({
  handleStateChange: function(state) {
    if (state === 'ended')
      this.props.onSkip();
  },
  render: function() {
    var submission = this.props.submission;
    var player = <MediaPlayer onStateChange={this.handleStateChange} type={submission.type} url={submission.url} mediaId={submission.media_id} />;
    return (
      <div className="media-item row">
        <div className="small-10 large-offset-1 columns">
          <MediaTitle submission={submission} />
          {player}
        </div>
        <div className="small-1 columns end">
          <div className="button secondary">
            <i className="fa fa-play"></i>
          </div>
          <div className="button secondary" onClick={this.props.onPrevious}>
            <i className="fa fa-backward"></i>
          </div>
          <div className="button secondary" onClick={this.props.onSkip}>
            <i className="fa fa-forward"></i>
          </div>
        </div>
      </div>
    );
  }
});

var MediaTitle = React.createClass({
  render: function() {
    return (
      <div className="media-title">
        <a className="permalink" href={this.props.submission.permalink} target="_blank">
          {this.props.submission.title}
        </a>
      </div>
    )
  }
});

var MediaPlayer = React.createClass({
  initializePlayer: function() {
    settings = {
      autohide: 1,
      showinfo: 0,
      rel: 0,
      color: "white",
      modestbranding: 1
    }
    player = new YT.Player('player', {
      height: '315',
      width: '420',
      videoId: this.props.mediaId,
      playerVars: settings,
      events: {
        'onReady': function(e) {
          e.target.playVideo();
        },
        'onStateChange': this.stateChange
      }
    });
  },
  stateChange: function(e) {
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
    this.props.onStateChange(state);
  },
  componentDidMount: function() {
    this.initializePlayer();
  },
  componentDidUpdate: function() {
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

function onYouTubeIframeAPIReady() {
  React.renderComponent(
    <Queue />,
    document.getElementById('main')
  );
}
