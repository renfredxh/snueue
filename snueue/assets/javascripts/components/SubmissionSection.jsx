const ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

import SubmissionActions from '../actions/SubmissionActions.js';
import SubmissionStore from '../stores/SubmissionStore.js';

import MediaPlayer from './MediaPlayer.jsx';
import { FlashMessage, SpinningLoader } from './utils.jsx';
import { decodeHTML } from './utils.jsx';

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
    let mediaQueue = queued.map((submission, index) => {
      return (
        <div key={submission.id}>
          <QueuedSubmission submission={submission} index={index} />
        </div>
      );
    });
    return (
      <div className="media-list">
        <MediaPlayer
          submission={ready}
          user={this.props.user}
        />
        {mediaQueue}
      </div>
    );
  }
}

class QueuedSubmission extends React.Component {
  render() {
    return (
      <div className="queued-media-item">
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
      <div className="media-title">
        <a className="permalink" href={this.props.submission.permalink} target="_blank">
          {index}{title}
        </a>
      </div>
    );
  }
}

export default Alt.addons.connectToStores(SubmissionSection);
