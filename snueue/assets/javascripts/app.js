import App from './components/App.jsx';
import * as fullscreen from './fullscreen.js';

window.Snueue = {
  sourceFromURL: null,
  user: null,
};

$(document).ready(() => {
  React.render(
    <App />,
    document.getElementById('main')
  );
});
