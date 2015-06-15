import React from 'react/addons';

import App from './components/App.jsx';
import * as fullscreen from './fullscreen.js';
import PlayerActions from './actions/PlayerActions.js';

// Bind React to the global space to enable the react dev tools chrome plugin.
window.React = React;

window.Snueue = {
  sourceFromURL: null,
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
  React.render(
    <App />,
    document.getElementById('main')
  );
});
