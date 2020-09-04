import Bowman from './Bowman';
import Daemon from './Daemon';
import Magician from './Magician';
import Swordsman from './Swordsman';
import Undead from './Undead';
import Vampire from './Vampire';
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
    this.gameSet = [];
  }

  getRndNumber(numbers) {
    this.numbers = numbers;
    const index = Math.floor(Math.random() * this.numbers.length);
    return this.numbers[index];
  }

  generateTeamPlayer() {
    const generatedTeamArr = generateTeam(
      this.allowedTypesPlayer,
      this.maxLevel,
      this.characterCount
    ); //  массив рандомных персонажей

    const startPositionsPlayer = []; //  массив допустимых начальных позиций персонажей
    const boardSize = 8; //  надо брать из this.gamePlay.boardSize!!!
    for (let i = 0; i < boardSize ** 2; i += 1) {
      if (!(i % boardSize) || !((i - 1) % boardSize)) {
        startPositionsPlayer.push(i);
      }
    }

    const generatedPositionsPlayer = []; //  массив рандомных начальных позиций персонажей
    while (generatedPositionsPlayer.length < this.characterCount) {
      const randomPos = this.getRndNumber(startPositionsPlayer);
      if (!generatedPositionsPlayer.includes(randomPos)) {
        generatedPositionsPlayer.push(randomPos);
      }
    }

    generatedTeamArr.forEach((character, index) => {
      const position = generatedPositionsPlayer[index];
      this.player.push(new PositionedCharacter(character, position));
    });
  }

  generateTeamNpc() {
    const generatedTeamArr = generateTeam(
      this.allowedTypesNpc,
      this.maxLevel,
      this.characterCount
    ); //  массив рандомных персонажей

    const startPositionsNpc = []; //  массив допустимых начальных позиций персонажей
    const boardSize = 8; //  надо брать из this.gamePlay.boardSize!!!
    for (let i = 0; i < boardSize ** 2; i += 1) {
      if (!((i + 1) % boardSize) || !((i + 2) % boardSize)) {
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

  generateGameSet() {
    this.generateTeamPlayer();
    this.generateTeamNpc();
    this.gameSet = this.player.concat(this.npc);
  }
}
