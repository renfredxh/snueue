import App from './components/App.jsx';
import * as fullscreen from './fullscreen.js';

window.Snueue = {
  sourceFromURL: null,
  user: null,
  showMainLoader() {
    $('.initial-content').hide();
    $('.container').append('<div class="loader main-loader"></div>');
    $('.loader').hide();
    // Set a delay before showing to prevent rapid flashing on cached
    // requests.
    window.setTimeout(() => {
      $('.loader').show();
    }, 100);
  },
  hideMainLoader() {
    $('.main-loader').remove();
  }
};

$(document).ready(() => {
  React.render(
    <App />,
    document.getElementById('main')
  );
});
