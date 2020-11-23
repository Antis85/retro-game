import Team from './teamGeneration/Team';
import GamePlay from './GamePlay';
import GameState from './GameState';
import themes from './ui/themes';
import { calculateMove, calculateAttack } from './calcs/calcs';
import {
  createActionsArrays, sortByAttack, sortByTargets, sortByDistance, calcMovingCells,
} from './calcs/npcActionsCalcs';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.gameTeam = undefined;
    this.selectedPlayer = undefined;
    this.targetNpc = undefined;
    this.currentTurn = 'player';
    this.highscore = 0;
    this.scores = 0;
    this.isLocked = false;
    this.level = 1;
    this.levelTheme = themes.prairie;
    this.resumeGame = true;
  }

  init() {
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
    if (this.resumeGame && this.stateService.load()) this.onLoadGameClick();
    if (!this.stateService.load()) {
      this.gameTeam = new Team();
      this.gameTeam.generateGameSet();
    }
    this.gamePlay.drawUi(this.levelTheme);
    this.gamePlay.redrawPositions([...this.gameTeam.player, ...this.gameTeam.npc]);
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addNewGameListener(this.onNewGameClick.bind(this));
    this.gamePlay.addSaveGameListener(this.onSaveGameClick.bind(this));
    this.gamePlay.addLoadGameListener(this.onLoadGameClick.bind(this));
    this.npcActions();
  }

  onNewGameClick() {
    this.resumeGame = false;
    this.scores = 0;
    this.isLocked = false;
    this.level = 1;
    this.levelTheme = themes.prairie;
    this.currentTurn = 'player';
    this.selectedPlayer = undefined;
    this.targetNpc = undefined;
    this.gameTeam = new Team();
    this.gameTeam.generateGameSet();
    this.init();
  }

  onSaveGameClick() {
    this.stateService.save(this.createStateObj());
  }

  onLoadGameClick() {
    try {
      const stateObj = this.stateService.load();
      if (stateObj) {
        this.highscore = stateObj.highscore;
        this.scores = stateObj.scores;
        this.isLocked = stateObj.isLocked;
        this.level = stateObj.level;
        this.levelTheme = stateObj.levelTheme;
        this.currentTurn = stateObj.currentTurn;
        this.gameTeam = new Team();
        this.gameTeam.reloadGameSet(stateObj.playerTeam, stateObj.npcTeam);
        this.resumeGame = false;
        this.init();
      }
    } catch (e) {
      console.log(e);
      GamePlay.showMessage('Ошибка при загрузке игры!');
    }
  }

  async onCellClick(index) {
    // TODO: react to click
    if (this.isLocked) return null;
    this.targetNpc = this.gameTeam.npc.find((npc) => npc.position === index);

    // клик на npc
    if (!this.selectedPlayer && this.targetNpc) {
      GamePlay.showError('Необходимо выбрать персонаж игрока!');
    } else if (this.targetNpc && this.isAttackable) {
      //  АТАКА игорька
      this.isLocked = true;
      const damage = Math.max(
        this.selectedPlayer.character.attack - this.targetNpc.character.defence,
        this.selectedPlayer.character.attack * 1,
      );//  для ускорения сделал 1, было 0.1

      //  вызов showDamage из GamePlay
      this.selectedPlayer = undefined;
      this.gamePlay.cells.forEach((cell, cellNumber) => this.gamePlay.deselectCell(cellNumber));
      await this.gamePlay.showDamage(index, damage);
      this.targetNpc.character.health -= damage;

      // смерть нпц
      if (this.targetNpc.character.health <= 0) {
        this.gameTeam.npc = this.gameTeam.npc.filter(
          (npc) => npc.position !== this.targetNpc.position,
        );
      }

      // переход хода после хода игорька к нпц
      this.currentTurn = 'npc';
      setTimeout(() => {
        this.npcActions();
      }, 200);
    }

    //  клик на персонаже игорька
    if (this.gameTeam.player.find((player) => player.position === index)) {
      this.gameTeam.player.forEach((player) => this.gamePlay.deselectCell(player.position));
      this.gamePlay.selectCell(index);
      this.selectedPlayer = this.gameTeam.player.find((player) => player.position === index);
    }

    //  перемещение персонажа игорька
    //  проверка радиуса и возможности хода
    const isBusyCell = this.gamePlay.cells[index].children.length;
    if (this.selectedPlayer && this.isMoveable && !isBusyCell) {
      // заморозка поля
      this.isLocked = true;
      // ход и переход хода от игорька к нпц
      this.selectedPlayer.position = index;
      this.selectedPlayer = undefined;
      this.gamePlay.cells.forEach((cell, cellNumber) => this.gamePlay.deselectCell(cellNumber));
      this.currentTurn = 'npc';
      setTimeout(() => {
        this.npcActions();
      }, 200);
    }

    // отрисовка хода или атаки
    this.gamePlay.redrawPositions([...this.gameTeam.player, ...this.gameTeam.npc]);

    // победа игорька в раунде и смена уровня
    if (!this.gameTeam.npc.length && this.level <= 4) {
      this.gameTeam.player.forEach((item) => { this.scores += item.character.health; });
      GamePlay.showMessage('!!!PLAYER WIN!!!LEVELUP!!!NEXTLEVEL!!!');
      this.isLocked = true;
      this.nextLevel();
    }

    return true;
  }

  //  смена уровня и левелап
  nextLevel() {
    this.level += 1;
    switch (this.level) {
      case 2:
        this.gameTeam.player.forEach((player) => player.character.levelUp());
        this.levelTheme = themes.desert;
        this.gamePlay.drawUi(this.levelTheme);
        this.gameTeam.generateTeamPlayer(1, 1);
        this.gameTeam.generateTeamNpc(2, this.gameTeam.player.length);
        break;
      case 3:
        this.gameTeam.player.forEach((player) => player.character.levelUp());
        this.levelTheme = themes.arctic;
        this.gamePlay.drawUi(this.levelTheme);
        this.gameTeam.generateTeamPlayer(2, 2);
        this.gameTeam.generateTeamNpc(3, this.gameTeam.player.length);
        break;
      case 4:
        this.gameTeam.player.forEach((player) => player.character.levelUp());
        this.levelTheme = themes.mountain;
        this.gamePlay.drawUi(this.levelTheme);
        this.gameTeam.generateTeamPlayer(3, 2);
        this.gameTeam.generateTeamNpc(4, this.gameTeam.player.length);
        break;
      default:
        GamePlay.showMessage(`!!!YOU ARE THE WINNER OF <<RETRO GAME>> WHITH ${this.scores} SCORES!!!`);
        break;
    }
    this.gamePlay.redrawPositions([...this.gameTeam.player, ...this.gameTeam.npc]);
    this.isLocked = false;
    this.currentTurn = 'player';
    if (this.level > 4) this.isLocked = true;
  }

  onCellEnter(index) {
    // TODO: react to mouse enter
    const isBusyCell = this.gamePlay.cells[index].children.length;
    const isNpcCell = this.gameTeam.npc.some((npc) => npc.position === index);

    if (this.selectedPlayer) {
      this.isMoveable = calculateMove(this.selectedPlayer.character.type,
        this.selectedPlayer.position,
        index);
      this.isAttackable = calculateAttack(this.selectedPlayer.character.type,
        this.selectedPlayer.position,
        index);
    }

    //  эмодзи-статус персонажа
    if (isBusyCell) {
      const { character } = [
        ...this.gameTeam.player,
        ...this.gameTeam.npc,
      ].find((item) => item.position === index);
      const message = `${'\u{1F396}'} ${character.level} ${'\u{2694}'} ${
        character.attack
      } ${'\u{1F6E1}'} ${character.defence} ${'\u{2764}'} ${character.health}`;
      this.gamePlay.showCellTooltip(message, index);
    }

    //  курсоры при выбранном персонаже и наведении на противника/клетки
    if (!isNpcCell) this.gamePlay.setCursor('pointer');

    if (!this.selectedPlayer && isNpcCell) this.gamePlay.setCursor('not-allowed');

    if (this.selectedPlayer && isNpcCell) {
      this.gamePlay.selectCell(index, 'red');
      this.gamePlay.setCursor('crosshair');
      if (this.isAttackable) return null;
      this.gamePlay.setCursor('not-allowed');
      this.gamePlay.deselectCell(index);
    }

    //  зеленый кружок
    if (this.selectedPlayer && !isBusyCell) {
      this.gamePlay.selectCell(index, 'green');
      if (this.isMoveable) return null;
      this.gamePlay.setCursor('not-allowed');
      this.gamePlay.deselectCell(index);
    }

    return true;
  }

  onCellLeave(index) {
    // TODO: react to mouse leave
    this.gamePlay.hideCellTooltip(index);

    if (this.selectedPlayer && this.gameTeam.npc.some((npc) => npc.position === index)) {
      this.gamePlay.deselectCell(index);
    }

    this.gamePlay.cells.forEach((cell, cellNumber) => {
      if (!cell.children.length) {
        this.gamePlay.deselectCell(cellNumber);
      }
    });
  }

  async npcActions() {
    if (this.currentTurn !== 'npc') return null;
    //  выбираем нпц, у которых есть доступные цели или перемещения
    const npcActionsArr = createActionsArrays(this.gameTeam.player, this.gameTeam.npc);
    const npcAttackableArr = npcActionsArr[0];
    const npcMovingArr = npcActionsArr[1];

    // атака нпц
    if (npcAttackableArr.length) {
    //  сортируем архив поз. нпц с поз. своих целей по силе атаки нпц
    // - т.к. атака и радиус обратно зависимы, раньше начнут атаковать слабые дальнобои
    // и потом по мере приближения врагов - более сильные нпц
      const sortedByAttackArr = sortByAttack(npcAttackableArr, this.gameTeam.npc);

      //  далее для нпц с самой сильной атакой выбираем ближайшую цель,
      //  целей может быть несколько, н-р: кругом враги,
      //  тогда выбираем сильнейшую, далее цель с мин здоровьем, далее рандом

      // сильнейшие нпц с ближайшими сильнейшими целями с мин здоровьем
      const sortedByTargets = sortByTargets(sortedByAttackArr, this.gameTeam.player);

      //  несколько сильнейших нпц с ближайшими сильнейшими целями с мин здоровьем - тогда рандом
      let targetCellIndex = sortedByTargets[0][1];
      let npcCellIndex = sortedByTargets[0][0];
      if (sortedByTargets.length > 1) {
        const rndIndex = Math.floor(Math.random() * sortedByTargets.length);
        // eslint-disable-next-line prefer-destructuring
        targetCellIndex = sortedByTargets[rndIndex][1];
        // eslint-disable-next-line prefer-destructuring
        npcCellIndex = sortedByTargets[rndIndex][0];
      }

      //  реализация атаки нпц
      const targetPlayer = this.gameTeam.player.find(
        (player) => player.position === targetCellIndex,
      );
      const attackerNpc = this.gameTeam.npc.find((npc) => npc.position === npcCellIndex);
      const damage = Math.max(attackerNpc.character.attack - targetPlayer.character.defence,
        attackerNpc.character.attack * 1);//  для ускорения сделал 1, было 0.1
      //  вызов showDamage из GamePlay
      await this.gamePlay.showDamage(targetCellIndex, damage);
      targetPlayer.character.health -= damage;

      //  смерть перса игорька
      if (targetPlayer.character.health <= 0) {
        this.gameTeam.player = this.gameTeam.player.filter(
          (player) => player.position !== targetPlayer.position,
        );
      }
    }

    // перемещение npc
    if (npcMovingArr.length && !npcAttackableArr.length) {
      // выбираем ближайших npc к игроку с макс. дальностью атаки
      const sortedByDistance = sortByDistance(npcMovingArr, this.gameTeam.npc);

      // нужно определить в каком направлении шагать
      // принимаем шаг на 1 клетку в сторону соперника
      const calcMovingCellsArr = calcMovingCells(sortedByDistance);

      // нужно проверить не занята ли ячейка для хода персом своей команды
      const npcMoveableArr = calcMovingCellsArr.filter(
        (item) => !(this.gameTeam.npc.find((npc) => npc.position === item[1])),
      );

      // если ближайших к игроку с макс. дальностью атаки несколько, то рандом
      let npcMovable = npcMoveableArr[0];
      if (npcMoveableArr.length > 1) {
        const rndIndex = Math.floor(Math.random() * npcMoveableArr.length);
        npcMovable = npcMoveableArr[rndIndex];
      }

      //  перемещение нпц
      // eslint-disable-next-line prefer-destructuring
      this.gameTeam.npc.find((npc) => npc.position === npcMovable[0]).position = npcMovable[1];
      this.gameTeam.npc.find((npc) => npc.position === npcMovable[1]);
    }

    if (!npcAttackableArr.length && !npcMovingArr.length) console.warn('NPC не имеет доступных действий!');

    this.gamePlay.redrawPositions([...this.gameTeam.player, ...this.gameTeam.npc]);
    this.currentTurn = 'player'; //  переход хода после хода npc
    this.isLocked = false; // разлочиваем действия игорька

    // если персонажей игорька не осталось, засчитывае поражение
    if (!this.gameTeam.player.length) {
      GamePlay.showMessage('!!!JAVASCRIPT WIN, TRY AGAIN!!!');
    }

    return true;
  }// скобка npcActions

  createStateObj() {
    const {
      currentTurn, scores, isLocked, level, levelTheme,
    } = this;
    const playerTeam = this.gameTeam.player;
    const npcTeam = this.gameTeam.npc;

    if (this.highscore < this.scores) {
      this.highscore = this.scores;
    }

    const { highscore } = this;
    const gameStateObj = GameState.from({
      highscore,
      scores,
      isLocked,
      level,
      levelTheme,
      playerTeam,
      npcTeam,
      currentTurn,
    });

    return gameStateObj;
  }
}// скобка GameController
