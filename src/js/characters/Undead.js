import Character from '../team_generation/Character';

export default class Undead extends Character {
  constructor(level) {
    super(level);
    this.attack = 40;
    this.defence = 10;
    this.type = 'undead';
  }
}
