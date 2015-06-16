import React from 'react/addons';
import Router from 'react-router';

import routes from './routes';
import * as fullscreen from './fullscreen.js';
import PlayerActions from './actions/PlayerActions.js';

// Bind React to the global space to enable the react dev tools chrome plugin.
window.React = React;

window.Snueue = {
  user: null,
};

/**
 * This global callback is called by the YouTube Player API
 * when it has finished loading async.
 */
window.onYouTubeIframeAPIReady = () => {
  PlayerActions.youTubeAPIReady();
};

$(document).ready(() => {
  Router.run(routes, Router.HistoryLocation, (Root) => {
    React.render(<Root />, document.getElementById('main'));
  });
});
