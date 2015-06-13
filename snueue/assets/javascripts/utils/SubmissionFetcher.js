class SubmissionFetcher {
  static fetch(params) {
    return $.get('/submissions', params);
  }
}

export default SubmissionFetcher;
