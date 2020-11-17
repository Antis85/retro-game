import Team from './team_generation/Team';
import GamePlay from './GamePlay';
import GameState from './GameState';
import themes from './ui/themes';

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
      }, 1500);
    }

    //  клик на персонаже игорька
    if (this.gameTeam.player.find((player) => player.position === index)) {
      this.gameTeam.player.forEach((player) => this.gamePlay.deselectCell(player.position));
      this.gamePlay.selectCell(index);
      this.selectedPlayer = this.gameTeam.player.find((player) => player.position === index);
    }

    //  перемещение персонажа игорька
    //  проверка радиуса и возможности хода
    if (this.selectedPlayer && this.isMoveable && [
      ...this.gameTeam.player,
      ...this.gameTeam.npc,
    ].every((item) => item.position !== index)) {
      // заморозка поля
      this.isLocked = true;
      // ход и переход хода от игорька к нпц
      this.selectedPlayer.position = index;
      this.selectedPlayer = undefined;
      this.gamePlay.cells.forEach((cell, cellNumber) => this.gamePlay.deselectCell(cellNumber));
      this.currentTurn = 'npc';
      setTimeout(() => {
        this.npcActions();
      }, 1500);
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
    if (this.selectedPlayer) {
      this.isMoveable = this.calculateMove(this.selectedPlayer.character.type,
        this.selectedPlayer.position,
        index);
      this.isAttackable = this.calculateAttack(this.selectedPlayer.character.type,
        this.selectedPlayer.position,
        index);
    }

    //  эмодзи-статус персонажа
    if (this.gamePlay.cells[index].children.length) {
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
    if (this.gameTeam.npc.every((npc) => npc.position !== index)) {
      this.gamePlay.setCursor('pointer');
      this.gamePlay.cells.forEach((cell, cellNumber) => {
        if (!cell.children.length) {
          this.gamePlay.deselectCell(cellNumber);
        }
      });
    }

    if (!this.selectedPlayer && this.gameTeam.npc.some((npc) => npc.position === index)) {
      this.gamePlay.setCursor('not-allowed');
    }

    if (this.selectedPlayer && this.gameTeam.npc.some((npc) => npc.position === index)
    ) {
      this.gamePlay.cells.forEach((cell, cellNumber) => {
        if (!cell.children.length) {
          this.gamePlay.deselectCell(cellNumber);
        }
      });
      this.gamePlay.selectCell(index, 'red');
      this.gamePlay.setCursor('crosshair');
      if (!this.isAttackable) {
        this.gamePlay.setCursor('not-allowed');
        this.gamePlay.deselectCell(index);
      }
    }

    //  зеленый кружок
    if (this.selectedPlayer && [
      ...this.gameTeam.player,
      ...this.gameTeam.npc,
    ].every((item) => item.position !== index)
    ) {
      this.gamePlay.cells.forEach((cell, cellNumber) => {
        if (!cell.children.length) {
          this.gamePlay.deselectCell(cellNumber);
        }
      });
      this.gamePlay.selectCell(index, 'green');
      if (!this.isMoveable) {
        this.gamePlay.setCursor('not-allowed');
        this.gamePlay.deselectCell(index);
      }
    }
  }

  onCellLeave(index) {
    // TODO: react to mouse leave
    this.gamePlay.hideCellTooltip(index);
    if (this.selectedPlayer && this.gameTeam.npc.some((npc) => npc.position === index)) {
      this.gamePlay.deselectCell(index);
    }
  }

  calculateMove(charType, playerCellIndex, moveCellIndex) {
    this.radiusMove = 0;
    const radiusCol = Math.abs(Math.floor(playerCellIndex / 8) - Math.floor(moveCellIndex / 8));
    const radiusRow = Math.abs((playerCellIndex % 8) - (moveCellIndex % 8));

    switch (charType) {
      case 'magician':
      case 'daemon':
        this.radiusMove = 1;
        break;
      case 'bowman':
      case 'vampire':
        this.radiusMove = 2;
        break;
      case 'swordsman':
      case 'undead':
        this.radiusMove = 4;
        break;
      default:
        break;
    }

    return Math.max(radiusCol, radiusRow) <= this.radiusMove;
  }

  calculateAttack(charType, playerCellIndex, targetCellIndex) {
    this.radiusAttack = 0;
    const radiusCol = Math.abs(Math.floor(playerCellIndex / 8) - Math.floor(targetCellIndex / 8));
    const radiusRow = Math.abs((playerCellIndex % 8) - (targetCellIndex % 8));

    switch (charType) {
      case 'magician':
      case 'daemon':
        this.radiusAttack = 4;
        break;
      case 'bowman':
      case 'vampire':
        this.radiusAttack = 2;
        break;
      case 'swordsman':
      case 'undead':
        this.radiusAttack = 1;
        break;
      default:
        break;
    }

    return (Math.max(radiusCol, radiusRow) <= this.radiusAttack);
  }

  calculateCellRadius(сurrentCellIndex, targetCellIndex) {
    const radiusCol = Math.abs(Math.floor(сurrentCellIndex / 8) - Math.floor(targetCellIndex / 8));
    const radiusRow = Math.abs((сurrentCellIndex % 8) - (targetCellIndex % 8));
    this.cellRadius = Math.max(radiusCol, radiusRow);
    return this.cellRadius;
  }

  async npcActions() {
    if (this.currentTurn !== 'npc') return null;
    //  выбираем нпц, у которых есть доступные цели
    const npcAttackableArr = [];
    const npcMovingArr = [];

    this.gameTeam.npc.forEach((npc) => {
      this.gameTeam.player.forEach((player) => {
        const isAttackable = this.calculateAttack(
          npc.character.type,
          player.position,
          npc.position,
        );
        const movingDistance = this.calculateCellRadius(npc.position, player.position);
        if (isAttackable) {
          npcAttackableArr.push([npc.position, player.position]);
        }
        if (!isAttackable) {
          npcMovingArr.push([npc.position, player.position, movingDistance]);
        }
      });
    });

    //  сортируем архив поз. нпц с поз. своих целей по силе атаки нпц
    // - т.к. атака и радиус обратно зависимы, раньше начнут атаковать слабые дальнобои
    // и потом по мере приближения врагов - более сильные нпц

    if (npcAttackableArr.length) {
      const npcAttackableArrSorted = npcAttackableArr.sort(
        (a, b) => (
          this.gameTeam.npc.find((npc) => npc.position === b[0]).character.attack
        ) - (
          this.gameTeam.npc.find((npc) => npc.position === a[0]).character.attack
        ),
      );
      const npcFilteredByAttack = npcAttackableArr.filter(
        (item) => (
          this.gameTeam.npc.find((npc) => npc.position === item[0]).character.attack
        ) === (
          // eslint-disable-next-line max-len
          this.gameTeam.npc.find((npc) => npc.position === npcAttackableArrSorted[0][0]).character.attack
        ),
      );

      //  далее для нпц с самой сильной атакой выбираем ближайшую цель,
      //  целей может быть несколько, н-р: кругом враги,
      //  тогда выбираем сильнейшую/далее цель с мин здоровьем/далее рандом

      // ищем ближайшие цели
      const npcFilteredByAttackSorted = npcFilteredByAttack.sort(
        (a, b) => this.calculateCellRadius(a[0], a[1]) - this.calculateCellRadius(b[0], b[1]),
      );
      const npcClosestRadius = this.calculateCellRadius(
        npcFilteredByAttackSorted[0][0], npcFilteredByAttackSorted[0][1],
      );

      // сильнейшие нпц с ближайшими целями
      const npcTargetClosest = npcFilteredByAttackSorted.filter(
        (item) => this.calculateCellRadius(item[0], item[1]) === npcClosestRadius,
      );

      // сильнейшие нпц с ближайшими сильнейшими целями
      const npcTargetClosestSorted = npcTargetClosest.sort(
        (a, b) => (
          (
            this.gameTeam.player.find((player) => player.position === b[1]).character.attack
          ) - (
            this.gameTeam.player.find((player) => player.position === a[1]).character.attack
          )
        ),
      );
      const npcTargetClosestStrongest = npcTargetClosestSorted.filter(
        (item) => (
          // eslint-disable-next-line max-len
          this.gameTeam.player.find((player) => player.position === npcTargetClosestSorted[0][1]).character.attack
        ) === (
          this.gameTeam.player.find((player) => player.position === item[1]).character.attack
        ),
      );

      // сильнейшие нпц с ближайшими сильнейшими целями с мин здоровьем
      //  если длина npcTargetClosestStrongest > 1, то выберем с меньшим здоровьем
      const npcTargetClosestStrongestSorted = npcTargetClosestStrongest.sort(
        (a, b) => (
          (
            this.gameTeam.player.find((player) => player.position === a[1]).character.health
          ) - (
            this.gameTeam.player.find((player) => player.position === b[1]).character.health
          )
        ),
      );
      const npcTargetClosestStrongestMinHealth = npcTargetClosestStrongestSorted.filter(
        (item) => (
          // eslint-disable-next-line max-len
          this.gameTeam.player.find((player) => player.position === npcTargetClosestStrongestSorted[0][1]).character.health
        ) === (
          this.gameTeam.player.find((player) => player.position === item[1]).character.health
        ),
      );

      //  несколько сильнейших нпц с ближайшими сильнейшими целями с мин здоровьем - тогда рандом
      let targetCellIndex = npcTargetClosestStrongestMinHealth[0][1];
      let npcCellIndex = npcTargetClosestStrongestMinHealth[0][0];
      if (npcTargetClosestStrongestMinHealth.length > 1) {
        const rndIndex = Math.floor(Math.random() * npcTargetClosestStrongestMinHealth.length);
        // eslint-disable-next-line prefer-destructuring
        targetCellIndex = npcTargetClosestStrongestMinHealth[rndIndex][1];
        // eslint-disable-next-line prefer-destructuring
        npcCellIndex = npcTargetClosestStrongestMinHealth[rndIndex][0];
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
      // выбираем ближайших npc к игорьку
      const npcMovingArrSortDist = npcMovingArr.sort((a, b) => a[2] - b[2]);
      const npcMovingArrMinDist = npcMovingArrSortDist.filter(
        (item) => npcMovingArrSortDist[0][2] === item[2],
      );

      // выбираем ближайших npc к игроку с макс. дальностью атаки
      const npcMovingArrSortRadius = npcMovingArrMinDist.sort(
        (a, b) => (
          (
            this.gameTeam.npc.find((npc) => npc.position === a[0]).character.attack
          ) - (
            this.gameTeam.npc.find((npc) => npc.position === b[0]).character.attack
          )
        ),
      );
      const npcMovingArrMaxRadius = npcMovingArrSortRadius.filter(
        (item) => (
          // eslint-disable-next-line max-len
          this.gameTeam.npc.find((npc) => npc.position === npcMovingArrSortRadius[0][0]).character.attack
        ) === (
          this.gameTeam.npc.find((npc) => npc.position === item[0]).character.attack
        ),
      );

      // нужно определить в каком направлении шагать
      // принимаем шаг на 1 клетку в сторону соперника
      const npcMoveArr = [];
      npcMovingArrMaxRadius.forEach((item) => {
        // радиус в клетках по вертикали(количество строк между персами)
        const radiusCol = (Math.floor(item[0] / 8) - Math.floor(item[1] / 8));

        // радиус в клетках по горизонтали(количество столбцов между персами)
        const radiusRow = ((item[0] % 8) - (item[1] % 8));
        let newPosition = item[0];
        if (!radiusCol && radiusRow > 0) {
          //  тогда position=+1/-1 если radiusRow<0/>0
          //  влево
          npcMoveArr.push([item[0], item[0] - 1]);
        }
        if (!radiusCol && radiusRow < 0) {
          //  тогда position=+1/-1 если radiusRow<0/>0
          //  вправо
          npcMoveArr.push([item[0], item[0] + 1]);
        }
        if (radiusCol > 0 && !radiusRow) {
          //  тогда position=+8/-8 если radiusCol>0/<0
          //  вверх
          npcMoveArr.push([item[0], item[0] - 8]);
        }
        if (radiusCol < 0 && !radiusRow) {
          //  тогда position=+8/-8 если radiusCol>0/<0
          //  вниз
          npcMoveArr.push([item[0], item[0] + 8]);
        }
        if (radiusCol && radiusRow) {
          //  ходим по диагонали
          //  тогда position=+1/-1 если radiusRow<0/>0 и position=+8/-8 если radiusCol>0/<0
          //  или position=+1/-1 если radiusRow<0/>0 для альт хода
          //  или position=+8/-8 если radiusCol>0/<0 для альт хода
          if (radiusRow > 0) newPosition -= 1; //  влево
          if (radiusRow < 0) newPosition += 1; //  вправо
          if (radiusCol > 0) newPosition -= 8; // вверх
          if (radiusCol < 0) newPosition += 8; //  вниз
          npcMoveArr.push([item[0], newPosition]);
        }
      });// скобки npcMovingArrMaxRadius.forEach

      // нужно проверить не занята ли ячейка для хода персом своей команды
      const npcMoveableArr = npcMoveArr.filter(
        (item) => !(this.gameTeam.npc.find((npc) => npc.position === item[1])),
      );

      // если ближайших к игроку с макс. дальностью атаки несколько, то рандом
      if (npcMoveableArr.length) {
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
