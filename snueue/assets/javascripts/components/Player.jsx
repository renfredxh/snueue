import React from 'react';
import connectToStores from 'alt/utils/connectToStores';

import PlayerActions from '../actions/PlayerActions.js';
import PlayerStore from '../stores/PlayerStore.js';
import SubmissionActions from '../actions/SubmissionActions.js';

import { decodeHTML } from './utils.jsx';

class Player extends React.Component {
  static getStores(props) {
    return [PlayerStore];
  }

  static getPropsFromStores(props) {
    return PlayerStore.getState();
  }

  constructor(props) {
    super(props);
  }

  render() {
    let submission = this.props.submission;
    let mediaPlayer = <YouTubePlayer mediaId={submission.media_id}/>;
    return (
      <div id="current-submission">
        <PlayerController
          submission={submission}
          user={this.props.user}
          playerState={this.props.playerState}
        />
        <div className="current-submission">
          <PlayerTitle submission={submission} />
          {mediaPlayer}
        </div>
      </div>
    );
  }
}

class PlayerTitle extends React.Component {
  render() {
    let title = decodeHTML(this.props.submission.title);
    return (
      <div className="submission-title">
        <a className="permalink" href={this.props.submission.permalink} target="_blank">
          {title}
        </a>
      </div>
    );
  }
}

class PlayerController extends React.Component {
  inversePlayerState() {
    return this.props.playerState === 'playing' ? 'paused' : 'playing';
  }

  handleStatusToggle() {
    PlayerActions.updatePlayerState(this.inversePlayerState());
  }

  componentDidMount() {
    $('.submission-controller-container').fixedsticky();
  }

  render() {
    let controls, redditControls  = [null, null];
    let toggleButtonClasses = React.addons.classSet({
      'fa': true,
      'fa-pause': (this.inversePlayerState() === 'paused'),
      'fa-play': (this.inversePlayerState() === 'playing')
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
      <div className="button primary" key="back" onClick={SubmissionActions.previous} style={buttonStyle}>
        <i className="fa fa-backward"></i>
      </div>,
      <div className="button primary" key="play-pause" onClick={this.handleStatusToggle.bind(this)} style={buttonStyle}>
        <i className={toggleButtonClasses}></i>
      </div>,
      <div className="button primary" key="skip" onClick={SubmissionActions.skip} style={buttonStyle}>
        <i className="fa fa-forward"></i>
      </div>
    ];
    if (this.props.user) {
      redditControls = <RedditAPIController submission={this.props.submission} buttonStyle={buttonStyle} />;
    }
    return (
      <div className="submission-controller-container">
        <div id="submission-controller" className="submission-controller">
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
      <span id="reddit-submission-controller">
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
  shouldComponentUpdate(nextProps, nextState) {
    // If the parent state updates while the current submission is still
    // playing, don't re-render or else the video will restart.
    if (this.props.mediaId === nextProps.mediaId) {
      return false;
    }
    return true;
  }

  render() {
    return (
      <div className="media-player">
        <div id="player"></div>
      </div>
    );
  }
}

export default connectToStores(Player);
