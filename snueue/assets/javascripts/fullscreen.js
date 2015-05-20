$(function() {
  $('#fullscreen-button').click(function() {
    var currentMediaItem = $('#current-media-item .media-item');
    currentMediaItem.addClass('fullscreen');
    var elem = currentMediaItem[0];
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    }
  })
  $(document).on('webkitfullscreenchange mozfullscreenchange fullscreenchange', function(e) {
    if (!(document.fullscreen || document.mozFullScreen || document.webkitIsFullScreen)) {
      var currentMediaItem = $('#current-media-item .media-item');
      currentMediaItem.removeClass('fullscreen');
    }
  });
});
