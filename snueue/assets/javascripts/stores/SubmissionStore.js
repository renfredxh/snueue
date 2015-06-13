import alt from '../alt.js';
import SubmissionActions from '../actions/SubmissionActions.js';
import SubmissionFetcher from '../utils/SubmissionFetcher.js';

class SubmissionStore {
  constructor() {
    this.bindActions(SubmissionActions);
    this.submissions = [];
    this.history = [];
    this.flash = '';
    this.loading = false;
  }
  onFetchSubmissions() {
    this.loading = true;
  }
  onUpdateSubmissions(newSubmissions) {
    this.loading = false;
    // If no submissions were found on an inital search, display a
    // flash response.
    if (newSubmissions.length === 0) {
      this.flash = `No content found for ${this.source}`;
    }
    this.submissions = newSubmissions;
  }
  onUpdateSource(params) {
    [this.source, this.sorting] = [params.source, params.sorting];
    this.submissions = [];
  }
  onSkip() {
    this.history.push(this.submissions[0]);
    this.submissions = this.submissions.slice(1);
    // When there are only a few submissions left, fetch more
    if (this.submissions.length <= 5) {
      // Included the ids of all the currently queued and watched submissions
      // to be excluded from the fetch.
      let excluded = this.submissions.concat(this.history);
      excluded = excluded.map(sub => sub.id);
      let params = {
        source: this.source,
        sorting: this.sorting,
        excluded: excluded
      };
      SubmissionFetcher.fetch(params)
        .then((data) => {
          this.submissions = this.submissions.concat(data.submissions);
        });
    }
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
