/** @jsx React.DOM */
var Queue = React.createClass({displayName: 'Queue',
  getInitialState: function() {
    return {submissions: []};
  },
  handleSkip: function() {
    var newSubmissions = this.state.submissions.slice(1);
    this.setState({submissions: newSubmissions});
  },
  handleFetch: function(data) {
    console.log(data);
    this.setState(data);
  },
  render: function() {
    var content;
    if (this.state.submissions.length > 0)
      content = MediaList({submissions: this.state.submissions, onSkip: this.handleSkip})
    else
      content = null
    return (
      React.DOM.div({className: "queue"}, 
        React.DOM.div({className: "row"}, 
          Search({onFetch: this.handleFetch})
        ), 
        content
      )
    );
  }
});

var Search = React.createClass({displayName: 'Search',
  handleSubmit: function(e) {
    e.preventDefault();
    var source = this.refs.source.getDOMNode().value.trim();
    var sorting = this.refs.sorting.getDOMNode().value.trim();
    $.post("/search", {source: source, sorting: sorting}, $.proxy(function(data) {
      this.props.onFetch(data);
    }, this));
    return;
  },
  render: function() {
    return (
      React.DOM.form({className: "search-form", onSubmit: this.handleSubmit, ref: "form"}, 
        React.DOM.div({className: "small-12 large-10 large-offset-1 columns"}, 
          React.DOM.div({className: "row collapse"}, 
            React.DOM.div({className: "small-10 columns"}, 
              React.DOM.input({id: "resource", className: "search-bar", type: "text", placeholder: "/r/music", ref: "source"})
            ), 
            React.DOM.div({className: "small-2 columns"}, 
              React.DOM.select({className: "results-sorting-select", ref: "sorting"}, 
                React.DOM.option({value: "hot"}, "Hot"), 
                React.DOM.option({value: "top"}, "Top"), 
                React.DOM.option({value: "new"}, "New")
              )
            )
          )
        ), 
        React.DOM.div({role: "button", className: "small-12 large-1 columns end"}, 
          React.DOM.button({type: "submit", className: "button"}, React.DOM.i({className: "fa fa-arrow-right"}))
        )
      )
    );
  }
});

var MediaList = React.createClass({displayName: 'MediaList',
  render: function() {
    var queued = this.props.submissions.slice(1);
    var ready = this.props.submissions[0];
    var mediaNodes = queued.map(function(submission, index) {
      return (
        React.DOM.div({key: submission.id}, 
          QueuedMediaItem({submission: submission, index: index})
        )
      );
    });
    return (
      React.DOM.div({className: "mediaList"}, 
        MediaItem({submission: ready, onSkip: this.props.onSkip}), 
        mediaNodes
      )
    );
  }
});

var QueuedMediaItem = React.createClass({displayName: 'QueuedMediaItem',
  render: function() {
    return (
      React.DOM.div({className: "media-item queued-media-item row"}, 
        React.DOM.div({className: "small-10 large-offset-1 columns end"}, 
          React.DOM.h4({className: "media-title"}, 
            this.props.submission.title
          )
        )
      )
    );
  }
});

var MediaItem = React.createClass({displayName: 'MediaItem',
  handleStateChange: function(state) {
    if (state === 'ended')
      this.props.onSkip();
  },
  render: function() {
    var submission = this.props.submission;
    var player = MediaPlayer({onStateChange: this.handleStateChange, type: submission.type, url: submission.url, mediaId: submission.media_id});
    return (
      React.DOM.div({className: "media-item row"}, 
        React.DOM.div({className: "small-10 large-offset-1 columns"}, 
          React.DOM.h4({className: "media-title"}, 
            submission.title, " ", React.DOM.i({className: "slide-toggle fa fa-chevron-down right"})
          ), 
          player
        ), 
        React.DOM.div({className: "small-1 columns end"}, 
          React.DOM.div({className: "button secondary"}, 
            React.DOM.i({className: "fa fa-play"})
          ), 
          React.DOM.div({className: "button secondary", onClick: this.props.onSkip}, 
            React.DOM.i({className: "fa fa-forward"})
          )
        )
      )
    );
  }
});

var MediaPlayer = React.createClass({displayName: 'MediaPlayer',
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
    console.log(state)
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
      React.DOM.div({className: "media-player row"}, 
        React.DOM.div({className: "small-12 columns"}, 
          React.DOM.div({className: "flex-video"}, 
            React.DOM.div({id: "player"})
          )
        )
      )
    );
  }
});

function onYouTubeIframeAPIReady() {
  React.renderComponent(
    Queue(null),
    document.getElementById('main')
  );
}
