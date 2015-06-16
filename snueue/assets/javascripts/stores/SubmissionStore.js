import alt from '../alt.js';
import SubmissionActions from '../actions/SubmissionActions.js';
import SubmissionSource from '../sources/SubmissionSource.js';

class SubmissionStore {
  constructor() {
    this.bindActions(SubmissionActions);
    this.registerAsync(SubmissionSource);
    this.submissions = [];
    this.history = [];
    this.flash = '';
    this.loading = true;
  }

  onLoadingSubmissions() {
    this.flash = '';
    this.loading = true;
  }

  onUpdateSubmissions(response) {
    this.loading = false;
    let newSubmissions = response.data.submissions;
    // If no submissions were found on an inital search, display a
    // flash response.
    if (newSubmissions.length === 0) {
      this.flash = `No content found for ${this.source}`;
    }
    this.submissions = newSubmissions;
  }

  onAppendSubmissions(response) {
    let newSubmissions = response.data.submissions;
    this.submissions = this.submissions.concat(newSubmissions);
  }

  onSubmissionsLoadingFailure() {
    this.loading = false;
    this.flash = `Error loading ${this.source}`;
  }

  onUpdateSource(params) {
    let { source, sorting } = params;
    this.source = source;
    this.sorting = sorting;
    this.submissions = [];
  }

  onSkip() {
    this.history.push(this.submissions[0]);
    this.submissions = this.submissions.slice(1);
  }

  onPrevious() {
    if (this.history.length === 0) return;
    // Get up to the last element from history and prepend it
    // to the submission queue.
    this.submissions.unshift(this.history.slice(-1)[0]);
    // Remove the last item from the history.
    this.history = this.history.slice(0, -1);
  }

  onCloseFlash() {
    this.flash = '';
  }
}

export default alt.createStore(SubmissionStore, 'SubmissionStore');
