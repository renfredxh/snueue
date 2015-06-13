import App from './components/App.jsx';
import * as fullscreen from './fullscreen.js';
import PlayerActions from './actions/PlayerActions.js';

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
