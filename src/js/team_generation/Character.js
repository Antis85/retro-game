export default class Character {
  constructor(level, type = 'generic') {
    this.level = level;
    this.attack = 0;
    this.defence = 0;
    this.health = 100;
    this.type = type;
    // TODO: throw error if user use "new Character()"
    if (new.target.name === 'Character') {
      throw new Error('new Character depricated');
    }
  }

  levelUp() {
    if (this.level >= 4) /* return null */;
    this.level += 1;
    this.attack = Math.round(Math.max(this.attack, ((this.attack * (90 + 65 * this.health / 100)) / 100)));
    this.defence = Math.round(Math.max(this.defence, ((this.defence * (90 + 65 * this.health / 100)) / 100)));
    this.health = Math.round(Math.min(this.health + 80, 100));
  }
}
