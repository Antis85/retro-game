// import GameStateService from './GameStateService';

export default class GameState {
  static from(object) {
    // TODO: create object
    if (object) {
      // console.log('GameState_return_object_done:', object);
      console.log('GameState_object:', /*Object.entries*/(object));
      console.log('GameState_object_highscore:', object.highscore);
      return object;
    }
    console.log('GameState_return_object_fail');
    return null;
  }
}
