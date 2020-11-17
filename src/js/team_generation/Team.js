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
    this.loadedlayer = [];
    this.loadedNpc = [];
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
    while (generatedPositionsNpc.length < this.characterCount) {
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
    this.loadedPlayer = loadedTeamPlayer;
    this.loadedNpc = loadedTeamNpc;
    this.loadedPlayer.forEach((player) => {
      const LoadedPlayerType = this.allowedTypesPlayer.find(
        (allowedClass) => allowedClass.name.toLowerCase() === player.character.type,
      );

      const reloadedPlayerType = new LoadedPlayerType();
      reloadedPlayerType.level = player.character.level;
      reloadedPlayerType.health = player.character.health;
      reloadedPlayerType.attack = player.character.attack;
      reloadedPlayerType.defence = player.character.defence;

      this.player.push(new PositionedCharacter(reloadedPlayerType, player.position));
    });

    this.loadedNpc.forEach((npc) => {
      const LoadedNpcType = this.allowedTypesNpc.find(
        (allowedClass) => allowedClass.name.toLowerCase() === npc.character.type,
      );

      const reloadedNpcType = new LoadedNpcType();
      reloadedNpcType.level = npc.character.level;
      reloadedNpcType.health = npc.character.health;
      reloadedNpcType.attack = npc.character.attack;
      reloadedNpcType.defence = npc.character.defence;
      this.npc.push(new PositionedCharacter(reloadedNpcType, npc.position));
    });

    return true;
  }
}
