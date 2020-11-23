import Bowman from '../characters/Bowman';
import Daemon from '../characters/Daemon';
import Magician from '../characters/Magician';
import Swordsman from '../characters/Swordsman';
import Undead from '../characters/Undead';
import Vampire from '../characters/Vampire';
import { generateTeam } from './generators';
import PositionedCharacter from './PositionedCharacter';

export default class Team {
  constructor() {
    this.allowedTypesPlayer = [Bowman, Swordsman, Magician];
    this.allowedTypesNpc = [Daemon, Undead, Vampire];
    this.maxLevel = 1;
    this.characterCount = 2;
    this.player = [];
    this.npc = [];
    this.boardSize = 8;
  }

  getRndNumber(numbers) {
    this.numbers = numbers;
    const index = Math.floor(Math.random() * this.numbers.length);
    return this.numbers[index];
  }

  generateTeamPlayer(maxLvl = this.maxLevel, charCount = this.characterCount) {
    const generatedTeamArr = generateTeam(
      this.allowedTypesPlayer,
      maxLvl,
      charCount,
    ); //  массив рандомных персонажей игорька

    const startPositionsPlayer = []; //  массив допустимых начальных позиций персонажей
    for (let i = 0; i < this.boardSize ** 2; i += 1) {
      if (!(i % this.boardSize) || !((i - 1) % this.boardSize)) {
        startPositionsPlayer.push(i);
      }
    }

    const generatedPositionsPlayer = []; //  массив рандомных начальных позиций персонажей
    while (generatedPositionsPlayer.length < (charCount + this.player.length)) {
      const randomPos = this.getRndNumber(startPositionsPlayer);
      if (!generatedPositionsPlayer.includes(randomPos)) {
        generatedPositionsPlayer.push(randomPos);
      }
    }

    //  для смены уровня
    if (this.player.length) {
      this.player.slice().map((player) => player.character).forEach(
        (character) => generatedTeamArr.push(character),
      );
      this.player = [];
    }
    generatedTeamArr.forEach((character, index) => {
      const position = generatedPositionsPlayer[index];
      this.player.push(new PositionedCharacter(character, position));
    });
  }

  generateTeamNpc(maxLvl = this.maxLevel, charCount = this.characterCount) {
    const generatedTeamArr = generateTeam(
      this.allowedTypesNpc,
      maxLvl,
      charCount,
    ); //  массив рандомных персонажей нпц

    const startPositionsNpc = []; //  массив допустимых начальных позиций персонажей
    for (let i = 0; i < this.boardSize ** 2; i += 1) {
      if (!((i + 1) % this.boardSize) || !((i + 2) % this.boardSize)) {
        startPositionsNpc.push(i);
      }
    }

    const generatedPositionsNpc = []; //  массив рандомных начальных позиций персонажей
    while (generatedPositionsNpc.length < charCount) {
      const randomPos = this.getRndNumber(startPositionsNpc);
      if (!generatedPositionsNpc.includes(randomPos)) {
        generatedPositionsNpc.push(randomPos);
      }
    }

    generatedTeamArr.forEach((character, index) => {
      const position = generatedPositionsNpc[index];
      this.npc.push(new PositionedCharacter(character, position));
    });
  }

  //  простое создание команд
  generateGameSet() {
    this.generateTeamPlayer();
    this.generateTeamNpc();
  }

  //  восстановление команд из загруженного state
  reloadGameSet(loadedTeamPlayer = [], loadedTeamNpc = []) {
    if (!loadedTeamPlayer && !loadedTeamNpc) return null;
    this.player = [];
    this.npc = [];
    const loadedPlayer = loadedTeamPlayer;
    const loadedNpc = loadedTeamNpc;
    loadedPlayer.forEach((player) => {
      const reloadedCharacters = [
        ...this.allowedTypesPlayer,
        ...this.allowedTypesNpc,
      ].map((Type) => new Type());

      const reloadedPlayer = reloadedCharacters.find(
        (character) => character.type === player.character.type,
      );

      reloadedPlayer.level = player.character.level;
      reloadedPlayer.health = player.character.health;
      reloadedPlayer.attack = player.character.attack;
      reloadedPlayer.defence = player.character.defence;
      this.player.push(new PositionedCharacter(reloadedPlayer, player.position));
    });

    loadedNpc.forEach((npc) => {
      const reloadedCharacters = [
        ...this.allowedTypesPlayer,
        ...this.allowedTypesNpc,
      ].map((Type) => new Type());
      const reloadedNpc = reloadedCharacters.find(
        (character) => character.type === npc.character.type,
      );

      reloadedNpc.level = npc.character.level;
      reloadedNpc.health = npc.character.health;
      reloadedNpc.attack = npc.character.attack;
      reloadedNpc.defence = npc.character.defence;
      this.npc.push(new PositionedCharacter(reloadedNpc, npc.position));
    });

    return true;
  }
}
