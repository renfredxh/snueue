import SubmissionActions from '../actions/SubmissionActions.js';

const SubmissionSource = {
  fetchSubmissions: {
    remote(state) {
      let { source, sorting } = state;
      return axios.get('/submissions', {
        params: { source, sorting }
      });
    },
    loading: SubmissionActions.loadingSubmissions,
    success: SubmissionActions.updateSubmissions,
    error: SubmissionActions.submissionsLoadingFailure,
  },
  refetchSubmissions: {
    remote(state) {
      let { source, sorting } = state;
      // Included the ids of all the currently queued and watched submissions
      // to be excluded from the fetch.
      let excluded = state.submissions.concat(state.history);
      excluded = excluded.map(sub => sub.id);
      return axios.get('/submissions', {
        params: { source, sorting, 'excluded[]': excluded }
      });
    },
    success: SubmissionActions.appendSubmissions,
  }
};

export default SubmissionSource;
