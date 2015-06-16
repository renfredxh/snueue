import alt from '../alt.js';

class SubmissionActions {
  constructor() {
    this.generateActions(
      'loadingSubmissions', 'updateSubmissions', 'submissionsLoadingFailure',
      'appendSubmissions', 'skip', 'previous', 'closeFlash'
    );
  }

  updateSource(source, sorting) {
    this.dispatch({ source, sorting });
  }
}

export default alt.createActions(SubmissionActions);
