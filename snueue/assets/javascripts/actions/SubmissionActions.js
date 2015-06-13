import alt from '../alt.js';
import SubmissionFetcher from '../utils/SubmissionFetcher.js';

class SubmissionActions {
  constructor() {
    this.generateActions('updateSubmissions', 'skip', 'previous', 'closeFlash');
  }
  updateSource(source, sorting) {
    history.pushState({}, '', source);
    this.dispatch({ source, sorting });
    this.actions.fetchSubmissions({
      source, sorting, excluded: []
    });
  }
  fetchSubmissions(params) {
    this.dispatch();
    SubmissionFetcher.fetch(params)
      .then((data) => {
        this.actions.updateSubmissions(data.submissions);
      });
  }
}

export default alt.createActions(SubmissionActions);
