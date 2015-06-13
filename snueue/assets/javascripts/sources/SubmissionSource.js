import SubmissionActions from '../actions/SubmissionActions.js';

const SubmissionSource = {
  fetchSubmissions: {
    remote(state) {
      let { source, sorting } = state;
      let excluded = [];
      return axios.get('/submissions', {
        params: { source, sorting, excluded }
      });
    },
    loading: SubmissionActions.loadingSubmissions,
    success: SubmissionActions.updateSubmissions,
    error: SubmissionActions.submissionsLoadingFailure,
    shouldFetch(state) {
      return true;
    }
  }
};

export default SubmissionSource;
