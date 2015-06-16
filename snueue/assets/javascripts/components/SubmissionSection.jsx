import React from 'react/addons';
import connectToStores from 'alt/utils/connectToStores';
import reactMixin from 'react-mixin';
import { State } from 'react-router';

import SubmissionActions from '../actions/SubmissionActions.js';
import SubmissionStore from '../stores/SubmissionStore.js';

import Player from './Player.jsx';
import { FlashMessage, SpinningLoader } from './utils.jsx';
import { decodeHTML } from './utils.jsx';

const ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

class SubmissionSection extends React.Component {
  static getStores(props) {
    return [SubmissionStore];
  }

  static getPropsFromStores(props) {
    return SubmissionStore.getState();
  }

  constructor(props) {
    super(props);
    this.state = SubmissionStore.getState();
  }

  /**
   * Update the current source for submissions to match the url params
   * and fetch new submissions for that source.
   */
  updateSource(props) {
    let source;
    let routes = this.getRoutes();
    let currentRoute = routes[routes.length-1].name;
    switch(currentRoute) {
      case 'subreddit':
        source = `/r/${props.params.subreddit}`;
        break;
      case 'test':
        source = `/s/${props.params.name}`;
        break;
    }
    let sorting = props.query.sorting || 'hot';
    SubmissionActions.updateSource(source, sorting);
    SubmissionStore.fetchSubmissions();
  }

  componentDidMount() {
    this.updateSource(this.props);
  }

  componentWillUpdate(nextProps) {
    if (this.props.params.subreddit !== nextProps.params.subreddit) {
      this.updateSource(nextProps);
    }
  }

  render() {
    if (this.props.flash) return (
      <ReactCSSTransitionGroup transitionName="flash">
        <FlashMessage
          key={this.props.flash}
          message={this.props.flash}
          onClose={SubmissionActions.closeFlash}
        />
      </ReactCSSTransitionGroup>
    );
    if (this.props.loading) return <SpinningLoader />;
    if (this.props.submissions.length === 0) return false;
    // When there are only a few submissions left, fetch more
    if (this.props.submissions.length <= 5) {
      SubmissionStore.refetchSubmissions();
    }
    let queued = this.props.submissions.slice(1);
    let ready = this.props.submissions[0];
    let submissionQueue = queued.map((submission, index) => {
      return (
        <div key={submission.id}>
          <QueuedSubmission submission={submission} index={index} />
        </div>
      );
    });
    return (
      <div className="submission-list">
        <Player
          submission={ready}
          user={this.props.user}
        />
        {submissionQueue}
      </div>
    );
  }
}

class QueuedSubmission extends React.Component {
  render() {
    return (
      <div className="queued-submission">
        <SubmissionTitle
          submission={this.props.submission}
          index={this.props.index + 1}
        />
      </div>
    );
  }
}

class SubmissionTitle extends React.Component {
  render() {
    let index = '' + this.props.index + '. ';
    let title = decodeHTML(this.props.submission.title);
    return (
      <div className="submission-title">
        <a className="permalink" href={this.props.submission.permalink} target="_blank">
          {index}{title}
        </a>
      </div>
    );
  }
}

reactMixin.onClass(SubmissionSection, State);
export default connectToStores(SubmissionSection);
