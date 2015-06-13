import alt from '../alt.js';
import PlayerActions from '../actions/PlayerActions.js';
import SubmissionActions from '../actions/SubmissionActions.js';
import SubmissionStore from '../stores/SubmissionStore.js';

const PLAYER_SETTINGS = {
  autohide: 1,
  showinfo: 0,
  rel: 0,
  color: "white",
  modestbranding: 1
};

class PlayerStore {
  constructor() {
    this.bindActions(PlayerActions);
    this.bindActions(SubmissionActions);
    this.bindListeners({
      initializePlayer: [
        SubmissionActions.updateSubmissions, PlayerActions.youTubeAPIReady,
        SubmissionActions.skip, SubmissionActions.previous
      ]
    });
    this.youTubeAPIReady = false;
    this.playerState = 'unstarted';
    this.player = null;
  }

  /**
   * Create a new embedded YouTube player for the current submission
   * using the YouTube Player API.
   */
  initializePlayer() {
    this.waitFor(SubmissionStore);
    let submissions = SubmissionStore.getState().submissions;
    if (submissions.length === 0) return;
    let component = this;
    if (!YT.loaded) return;
    this.playerState = 'unstarted';
    // Clear the previous player
    $('#player').replaceWith('<div id="player"></div>');
    this.player = new YT.Player('player', {
      videoId: submissions[0].media_id,
      playerVars: PLAYER_SETTINGS,
      events: {
        'onReady': e => PlayerActions.updatePlayerState('playing'),
        'onStateChange': PlayerActions.embeddedPlayerStateChange,
        'onError': PlayerActions.playerError
      }
    });
  }

  onEmbeddedPlayerStateChange(state) {
    this.playerState = state;
  }

  onUpdatePlayerState(newPlayerState) {
    if (this.playerState !== newPlayerState) {
      if (newPlayerState === 'playing') this.player.playVideo();
      else if (newPlayerState === 'paused') this.player.pauseVideo();
    }
    this.playerState = newPlayerState;
  }

  onPlayerError() {
    // If the player encounters an error such as the video being deleted,
    // end it and skip to the next one.
    this.playerState = 'ended';
  }
}

export default alt.createStore(PlayerStore, 'PlayerStore');
