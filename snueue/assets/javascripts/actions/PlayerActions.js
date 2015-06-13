import alt from '../alt.js';
import SubmissionActions from '../actions/SubmissionActions.js';

class PlayerActions {
  constructor() {
    this.generateActions(
      'updatePlayerState', 'updatePlayerContent', 'youTubeAPIReady'
    );
  }

  embeddedPlayerStateChange(event) {
    let state;
    switch(event.data) {
      case YT.PlayerState.PLAYING:
        state = 'playing';
        break;
      case YT.PlayerState.PAUSED:
        state = 'paused';
        break;
      case YT.PlayerState.ENDED:
        state = 'ended';
        break;
      case YT.PlayerState.BUFFERING:
        state = 'buffering';
        break;
      default:
        state = 'unstarted';
    }
    if (state === 'ended') SubmissionActions.skip();
    this.dispatch(state);
  }

  playerError(event) {
    SubmissionActions.skip();
    this.dispatch();
  }
}

export default alt.createActions(PlayerActions);
