// Global application object
if (typeof Snueue === 'undefined')
  Snueue = {}

Snueue.showMainLoader = function() {
  $('.container').append('<div class="loader main-loader"></div>');
  $('.loader').hide();
  // Set a delay before showing to prevent rapid flashing on cached
  // requests.
  window.setTimeout(function() {
    $('.loader').show();
  }, 100)
}

Snueue.hideMainLoader = function() {
  $('.main-loader').remove();
}
