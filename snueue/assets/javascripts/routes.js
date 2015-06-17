import React from 'react';
import { Router, Route, DefaultRoute } from 'react-router';

import App from './components/App.jsx';
import Index from './components/Index.jsx';
import SubmissionSection from './components/SubmissionSection.jsx';

const routes = (
  <Route handler={App}>
    <DefaultRoute handler={Index}/>
    <Route name="subreddit" path="/r/:subreddit" handler={SubmissionSection} />
    <Route name="test" path="/s/:name" handler={SubmissionSection} />
  </Route>
);

export default routes;
