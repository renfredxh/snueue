import alt from '../alt.js';

class SubmissionActions {
  updateSubmissions(submissions) {
    this.dispatch(submissions);
  }
}

export default alt.createActions(SubmissionActions);
