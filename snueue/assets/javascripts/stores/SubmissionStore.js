import alt from '../alt.js';
import SubmissionActions from '../actions/SubmissionActions.js';

class SubmissionStore {
  constructor() {
    this.bindActions(SubmissionActions);
    this.submissions = [];
  }

  onUpdateSubmissions(submissions) {
    this.submissions = submissions;
  }
}

export default alt.createStore(SubmissionStore, 'SubmissionStore');
