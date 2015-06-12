import MediaPlayer from './MediaPlayer.jsx';

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
    let index = '';
    if (this.props.index > 0) {
      index = '' + this.props.index + '. ';
    }
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

export default MediaSection;
