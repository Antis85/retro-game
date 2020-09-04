import Team from './Team';
import GamePlay from './GamePlay';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    // this.gameTeam = {};
    this.selectedPlayer = undefined;
  }

  init() {
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
    this.gamePlay.drawUi('prairie');
    this.gameTeam = new Team();
    this.gameTeam.generateGameSet();
    console.log('this.gameTeam.gameSet: ', this.gameTeam.gameSet);
    console.log('this.gameTeam.player: ', this.gameTeam.player);
    console.log('this.gameTeam.npc: ', this.gameTeam.npc);
    this.gamePlay.redrawPositions(this.gameTeam.gameSet);
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
  }

  onCellClick(index) {
    // TODO: react to click
    // console.log('onCellClick', index);
    // console.log('onCellClick_this: ', this);
    // console.log('onCellClick_this.gamePlay.cells[index].firstChild.className: ', this.gamePlay.cells[index].firstChild.className);
    // console.log('onCellClick_this.gamePlay.boardEl: ', this.gamePlay.boardEl);
    /*['bowman', 'swordsman', 'magician'].forEach((type) =>{ });*/
    // клик на npc
    if (!this.selectedPlayer && this.gameTeam.npc.find((npc) => npc.position === index)) {
      // console.log('non-Playable type');
      GamePlay.showError('Необходимо выбрать персонаж игрока!');
    } else if (this.gameTeam.npc.find((npc) => npc.position === index)) {
      //  temp attack plug alert:
      GamePlay.showMessage('Игорек атакует, если цель в радиусе');
    }
    //  клик на персонаже игорька
    if (this.gameTeam.player.find((player) => player.position === index)) {
      // console.log('isPlayable type');
      // console.log('this.gamePlay.cells[index]: ', this.gamePlay.cells[index]);
      this.gameTeam.player.forEach((player) => this.gamePlay.deselectCell(player.position));
      this.gamePlay.selectCell(index);
      this.selectedPlayer = this.gameTeam.player.find((player) => player.position === index);
      // console.log('onCellClick_this.selectedPlayer: ', this.selectedPlayer);
    }
    //  перемещение персонажа игорька(пока без радиуса) ****************************************
    if (this.selectedPlayer && this.gameTeam.gameSet.every((item) => item.position !== index)) {
      this.selectedPlayer.position = index;
      // console.log('moved to cell №', this.selectedPlayer.position);
      this.gamePlay.redrawPositions(this.gameTeam.gameSet);
      this.selectedPlayer = undefined;
      this.gamePlay.cells.forEach((cell, cellNumber) => this.gamePlay.deselectCell(cellNumber));
      //  this.currentTurn = 1;
    }// ****************************************************************************************

    //  сброс выделения персонажа игорька при клике на пустое поле(не нужно, т.к. должно быть перемещение)
    /*if (this.gameTeam.gameSet.every((character) => character.position !== index)) {
      this.gameTeam.player.forEach((player) => this.gamePlay.deselectCell(player.position));
    }*/
  }

  onCellEnter(index) {
    // TODO: react to mouse enter
    //  эмодзи-статус персонажа
    if (this.gamePlay.cells[index].children.length) {
      // console.log('this.gameTeam.player: ', this.gameTeam.gameSet);
      const { character } = this.gameTeam.gameSet.find((item) => item.position === index);
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

    if (this.selectedPlayer && this.gameTeam.npc.some((npc) => npc.position === index)) {
      this.gamePlay.cells.forEach((cell, cellNumber) => {
        if (!cell.children.length) {
          this.gamePlay.deselectCell(cellNumber);
        }
      });
      this.gamePlay.selectCell(index, 'red');
      this.gamePlay.setCursor('crosshair');
    }
    //  зеленый кружок
    if (this.selectedPlayer && this.gameTeam.gameSet.every((item) => item.position !== index)) {
      this.gamePlay.cells.forEach((cell, cellNumber) => {
        if (!cell.children.length) {
          this.gamePlay.deselectCell(cellNumber);
        }
      });
      this.gamePlay.selectCell(index, 'green');
    }
    // console.log('onCellEnter_this.selectedPlayer: ', this.selectedPlayer);
  }

  onCellLeave(index) {
    // TODO: react to mouse leave
    // console.log('onCellLeave', index);
    this.gamePlay.hideCellTooltip(index);
    if (this.selectedPlayer && this.gameTeam.npc.some((npc) => npc.position === index)) {
      this.gamePlay.deselectCell(index);
    }
  }
}
