import MediaPlayer from './MediaPlayer.jsx';
import { decodeHTML } from './utils.jsx';

class MediaSection extends React.Component {
  render() {
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
          onSkip={this.props.onSkip}
          onPrevious={this.props.onPrevious}
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

export default MediaSection;
