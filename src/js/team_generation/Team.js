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
    // this.gameSet = [...this.player, ...this.npc]; // так еще хуже!
    // this.gameSet = [];
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
    ); //  массив рандомных персонажей

    const startPositionsPlayer = []; //  массив допустимых начальных позиций персонажей
    for (let i = 0; i < this.boardSize ** 2; i += 1) {
      if (!(i % this.boardSize) || !((i - 1) % this.boardSize)) {
        startPositionsPlayer.push(i);
      }
    }

    // ниже не нужно, надо добавить сущ. персов и заново генерить позиции
    // startPositionsPlayer.filter((position) => !(this.player.find((player) => player.position === position))); 

    const generatedPositionsPlayer = []; //  массив рандомных начальных позиций персонажей
    while (generatedPositionsPlayer.length < (charCount + this.player.length)) {
      const randomPos = this.getRndNumber(startPositionsPlayer);
      if (!generatedPositionsPlayer.includes(randomPos)) {
        generatedPositionsPlayer.push(randomPos);
      }
    }

    // const existTeamArr = [];
    if (this.player.length) {
      this.player.slice().map((player) => player.character).forEach((character) => generatedTeamArr.push(character));
      this.player = [];
      // generatedTeamArr.concat(existTeamArr);
      // console.log('Team()_existTeamArr: ', existTeamArr);
      // console.log('Team()_generatedTeamArr_concat: ', generatedTeamArr);
      // console.log('Team()_generatedTeamArr.concat(existTeamArr): ', generatedTeamArr.concat(existTeamArr));
    }
    console.log('Team()_generatedTeamArr_finish: ', generatedTeamArr);
    generatedTeamArr.forEach((character, index) => {
      const position = generatedPositionsPlayer[index];
      this.player.push(new PositionedCharacter(character, position));
    });
  }

  generateTeamNpc(maxLvl = this.maxLevel, charCount = this.characterCount) {
    const generatedTeamArr = generateTeam(
      this.allowedTypesNpc,
      maxLvl,
      1, //  1 - для отладки смены уровней
      //  charCount,
    ); //  массив рандомных персонажей

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

  generateGameSet() {
    this.generateTeamPlayer();
    this.generateTeamNpc();
    // console.log('after_start_gen_this.npc', this.npc);
    // console.log('after_start_gen_this.player', this.player);
  }
}
