import Team from './team_generation/Team';
import GamePlay from './GamePlay';
import GameState from './GameState';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    // this.gameState = new GameState();
    // this.gameTeam = {};
    this.selectedPlayer = undefined;
    this.targetNpc = undefined;
    this.currentTurn = 'player';
    // this.currentTurn = 'npc';
    this.highscore = 0;
    this.scores = 0;
    this.isLocked = false;
    this.level = 1;
    this.levelTheme = 'prairie';
  }

  init() {
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
    this.gamePlay.drawUi(this.levelTheme);
    this.gameTeam = new Team();
    this.gameTeam.generateGameSet();
    // console.log('this.gameTeam.gameSet: ', this.gameTeam.gameSet);
    // console.log('this.gameTeam.player: ', this.gameTeam.player);
    // console.log('this.gameTeam.npc: ', this.gameTeam.npc);
    // this.gamePlay.redrawPositions(this.gameTeam.gameSet);
    this.gamePlay.redrawPositions([...this.gameTeam.player, ...this.gameTeam.npc]);
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addNewGameListener(this.onNewGameClick.bind(this));
    this.gamePlay.addSaveGameListener(this.onSaveGameClick.bind(this));
    this.gamePlay.addLoadGameListener(this.onLoadGameClick.bind(this));
    this.npcActions();
    // console.log('init()_createStateObj: ', this.createStateObj());
  }

  onNewGameClick() {
  //  const isNewGame = confirm('Начать новую игру?');
  //  if (!isNewGame) return null;
    console.log('onNewGameClick()');
    this.scores = 0;
    this.isLocked = false;
    this.level = 1;
    this.levelTheme = 'prairie';
    this.gameTeam = null;
    this.currentTurn = 'player';
    this.selectedPlayer = undefined;
    this.targetNpc = undefined;
    this.init();
    // console.log('onNewGameClick()_this.createStateObj(): ', this.createStateObj());
  }

  onSaveGameClick() {
    console.log('onSaveGameClick()');
    this.stateService.save(this.createStateObj());
    // console.log('onSaveGameClick()_this.createStateObj(): ', this.createStateObj());
    console.log('onSaveGameClick()_checkload: ', this.stateService.load());
  }

  onLoadGameClick() {
    // const isLoadGame = confirm('Загрузить игру?');
    // if (!isLoadGame) return null;
    try {
      const stateObj = this.stateService.load();
      console.log('onLoadGameClick(): ', stateObj);
      if (stateObj) {
        this.highscore = stateObj.highscore;
        this.scores = stateObj.scores;
        this.isLocked = stateObj.isLocked;
        this.level = stateObj.level;
        this.levelTheme = stateObj.levelTheme;
        this.gameTeam = stateObj.gameTeam;
        this.gameTeam.player = stateObj.gameTeam.player;
        this.gameTeam.npc = stateObj.gameTeam.npc;
        this.currentTurn = stateObj.currentTurn;
        this.gamePlay.drawUi(this.levelTheme);
        this.gamePlay.redrawPositions([...this.gameTeam.player, ...this.gameTeam.npc]);
      }
    } catch (e) {
      console.log(e);
      GamePlay.showMessage('Ошибка при загрузке игры!');
    }
    // console.log('onLoadGameClick()_this.gameTeam: ', this.gameTeam);
  }

  async onCellClick(index) {
    // console.log('onCellClick()_showGameState:', this.createStateObj());
    // TODO: react to click
    if (this.isLocked) return null;
    this.targetNpc = this.gameTeam.npc.find((npc) => npc.position === index);
    // console.log('this.selectedPlayer:', this.selectedPlayer);
    // console.log('this.targetNpc: ', this.targetNpc);
    // клик на npc
    if (!this.selectedPlayer && this.targetNpc) {
      // console.log('non-Playable type');
      GamePlay.showError('Необходимо выбрать персонаж игрока!');
    } else if (this.targetNpc && this.isAttackable) {
      //  АТАКА игорька ************************************************************************
      this.isLocked = true;
      // console.log('this.isAttackable', this.isAttackable);
      // console.log('this.selectedPlayer', this.selectedPlayer, ' attack:', this.selectedPlayer.character.attack);
      // console.log('this.targetNpc', this.targetNpc, ' defence:', this.targetNpc.character.defence);      
      // console.log('this.selectedPlayer', this.selectedPlayer, ' attack:', this.selectedPlayer.character.attack);
      // console.log('this.targetNpc', this.targetNpc, ' defence:', this.targetNpc.character.defence);
      // console.log('damage1:', this.selectedPlayer.character.attack - this.targetNpc.character.defence, ' damage2:', this.selectedPlayer.character.attack * 0.1);
      const damage = Math.max(this.selectedPlayer.character.attack - this.targetNpc.character.defence,
        this.selectedPlayer.character.attack * 1);//  для ускорения сделал 1, поменять на 0.1 в итоге
        //  вызов showDamage из GamePlay
      this.selectedPlayer = undefined;
      this.gamePlay.cells.forEach((cell, cellNumber) => this.gamePlay.deselectCell(cellNumber));
      await this.gamePlay.showDamage(index, damage);
      this.targetNpc.character.health -= damage;
      if (this.targetNpc.character.health <= 0) {
        // console.log('this.targetNpc_R.I.P.: ', this.targetNpc.position);
        // console.log('this.gameTeam.npc: ', this.gameTeam.npc);
        // console.log('this.gameTeam.npc.filter(): ', this.gameTeam.npc.filter((npc) => npc.position !== this.targetNpc.position));
        // this.gameTeam.gameSet = this.gameTeam.gameSet.filter((npc) => npc.position !== this.targetNpc.position);
        this.gameTeam.npc = this.gameTeam.npc.filter((npc) => npc.position !== this.targetNpc.position);        
      }
      // console.log('this.gameTeam.npc: ', this.gameTeam.npc);
      // console.log('this.gameTeam.npc.length', this.gameTeam.npc.length);
      // console.log('this.gameTeam.gameSet: ', this.gameTeam.gameSet);
      // this.gamePlay.redrawPositions(this.gameTeam.gameSet);
      this.currentTurn = 'npc';
      setTimeout(() => {
        this.npcActions();
      }, 1500);
      // this.npcActions();
    }// ****************************************************************************************
    //  клик на персонаже игорька
    if (this.gameTeam.player.find((player) => player.position === index)) {
      this.gameTeam.player.forEach((player) => this.gamePlay.deselectCell(player.position));
      this.gamePlay.selectCell(index);
      this.selectedPlayer = this.gameTeam.player.find((player) => player.position === index);
      // console.log('onCellClick_this.selectedPlayer: ', this.selectedPlayer);
    }
    //  перемещение персонажа игорька **********************************************************
    if (this.selectedPlayer && this.isMoveable && [...this.gameTeam.player, ...this.gameTeam.npc].every((item) => item.position !== index)) {
      this.isLocked = true;
      //  проверка радиуса
      // console.log('this.isMoveable', this.isMoveable);
      this.selectedPlayer.position = index;
      // console.log('moved to cell №', this.selectedPlayer.position);
      this.selectedPlayer = undefined;
      this.gamePlay.cells.forEach((cell, cellNumber) => this.gamePlay.deselectCell(cellNumber));
      this.currentTurn = 'npc';
      setTimeout(() => {
        this.npcActions();
      }, 1500);
      // this.npcActions();
    }
    console.log('onCellClick()_this.currentTurn: ', this.currentTurn);
    // this.gamePlay.redrawPositions(this.gameTeam.gameSet);
    this.gamePlay.redrawPositions([...this.gameTeam.player, ...this.gameTeam.npc]);
    if (!this.gameTeam.npc.length && this.level <= 4) {
      console.log('***!!!PLAYER WIN!!!***');
      // this.gameTeam.player.forEach((item) => console.log(item.character));
      this.gameTeam.player.forEach((item) => { this.scores += item.character.health; });
      console.log('this.scores:', this.scores);
      // this.gameTeam.player.forEach((item) => item.character.levelUp());
      // this.gamePlay.redrawPositions(this.gameTeam.player);
      console.log('lvlup_this.gameTeam.player_before_nextLevel():', this.gameTeam.player);
      console.log('this.gameTeam.npc_before_nextLevel(): ', this.gameTeam.npc);
      // this.gameTeam.player.forEach((item) => console.log(item.character));
      GamePlay.showMessage('***!!!PLAYER WIN!!!LevelUp!!!NextLevel!!!***');
      this.isLocked = true;
      this.nextLevel();
      console.log('this.gameTeam.player_after_nextLevel(): ', this.gameTeam.player);
      console.log('this.gameTeam.npc_after_nextLevel(): ', this.gameTeam.npc);
    }
  }

  nextLevel() {
    console.log('nextLevel()_this.level:', this.level);
    this.level += 1;
    console.log('nextLevel()_this.level++:', this.level);
    switch (this.level) {
      case 2:
        console.log('nextLevel()_generate new team lvl2');
        this.gameTeam.player.forEach((player) => player.character.levelUp());
        // console.log('nextLevel()_team_lvl2:', this.gameTeam.player, this.gameTeam.npc);
        this.levelTheme = 'desert';
        this.gamePlay.drawUi(this.levelTheme);
        this.gameTeam.generateTeamPlayer(1, 1);
        this.gameTeam.generateTeamNpc(2, this.gameTeam.player.length);
        break;
      case 3:
        console.log('nextLevel()_generate new team lvl3');
        this.gameTeam.player.forEach((player) => player.character.levelUp());
        // console.log('nextLevel()_team_lvl3:', this.gameTeam.player, this.gameTeam.npc);
        this.levelTheme = 'arctic';
        this.gamePlay.drawUi(this.levelTheme);
        this.gameTeam.generateTeamPlayer(2, 2);
        this.gameTeam.generateTeamNpc(3, this.gameTeam.player.length);
        // console.log('in_nextLevel()_npc_after_generation:', this.gameTeam.npc);
        break;
      case 4:
        console.log('nextLevel()_generate new team lvl4');
        this.gameTeam.player.forEach((player) => player.character.levelUp());
        // console.log('nextLevel()_team_lvl4:', this.gameTeam.player, this.gameTeam.npc);
        this.levelTheme = 'mountain';
        this.gamePlay.drawUi(this.levelTheme);
        this.gameTeam.generateTeamPlayer(3, 2);
        this.gameTeam.generateTeamNpc(4, this.gameTeam.player.length);
        // console.log('in_nextLevel()_npc_after_generation:', this.gameTeam.npc);
        break;
      default:
        // this.isLocked = true;
        console.log('this.scores:', this.scores);
        GamePlay.showMessage(`!!!YOU ARE THE WINNER OF <<RETRO GAME>> with ${this.scores} scores!!!`);
        break;
    }
    console.log('nextLevel()_team_afterlvlup:', this.gameTeam.player, this.gameTeam.npc);
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
      // console.log('this.gameTeam.player: ', this.gameTeam.gameSet);
      const { character } = [...this.gameTeam.player, ...this.gameTeam.npc].find((item) => item.position === index);
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
    if (this.selectedPlayer && [...this.gameTeam.player, ...this.gameTeam.npc].every((item) => item.position !== index)
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
    const radiusCol=Math.abs(Math.floor(сurrentCellIndex/8) - Math.floor(targetCellIndex/8));
    const radiusRow=Math.abs(сurrentCellIndex%8 - targetCellIndex%8);
    return Math.max(radiusCol, radiusRow);  
  }

  async npcActions() {
    // console.log('npcActions()_this.selectedPlayer: ',this.selectedPlayer);
    if (this.currentTurn !== 'npc') {
      // console.log('npcActions()_this.currentTurn !== npc?', ' this.currentTurn:', this.currentTurn);
      return null;
    }
    // console.log('npcActions()_start, this.currentTurn === npc?', ' this.currentTurn:', this.currentTurn);

    //  1)проверяем есть ли еще в команде живые неписи(надо ли?)
    //  2)выбираем непись и проверяем, можно ли атаковать
    //  3)если нельзя атаковать, то ходим на 1кл влево(в сторону игрока) (ходит рандомный непись?)
    //  4)переход хода к игроку
    //  . . .
    //выбираем нпц, у которых есть доступные цели
const npcAttackableArr = [];
const npcMovingArr = [];

this.gameTeam.npc.forEach((npc) => {
  this.gameTeam.player.forEach((player)=>{
    // console.log('\nnpc.character.type:', npc.character.type, ' npc.position:', npc.position);    
    // console.log('player.character.type:', player.character.type, ' player.position:', player.position);    
    const isAttackable = this.calculateAttack(npc.character.type,player.position, npc.position);
    const movingDistance = this.calculateCellRadius(npc.position, player.position);
    // console.log('this.calculateAttack:', isAttackable);    
     if (isAttackable) {
      npcAttackableArr.push([npc.position,player.position]);  
    }
    if (!isAttackable) {
      npcMovingArr.push([npc.position,player.position,movingDistance]);
    }
  });
  // console.log('\nnpcAttackableArr_in:', npcAttackableArr);
  // console.log('\n npcMovingArr_in:', npcMovingArr);
});
// console.log('\n npcAttackableArr_out:', 'length', npcAttackableArr.length,npcAttackableArr);
// console.log('\n npcMovingArr_out:\n[pos/pos/dist]', npcMovingArr);
//npcAttackableArr.sort( (a, b) => b.character.attack - a.character.attack );
// console.log('\nnpcAttackableArr_sort1:', npcAttackableArr);
// console.log('\nЭтот нпц щас атакует:', npcAttackableArr[0]);
//npcAttackableArr.sort( (a, b) => a.character.attack - b.character.attack );
// console.log('\nnpcAttackableArr_sort2:', npcAttackableArr);

//сортируем архив поз. нпц с поз. своих целей по силе атаки нпц - т.к. атака и радиус обратно зависимы, раньше начнут атаковать слабые дальнобои и потом по мере приближения врагов - более сильные нпц

    if (npcAttackableArr.length) {
  const npcAttackableArrSorted = npcAttackableArr.sort((a, b) => {  
  // console.log(this.gameTeam.npc.find(npc=>npc.position===b[0]).character.attack+'<>'+this.gameTeam.npc.find(npc=>npc.position===a[0]).character.attack);  
  return ((this.gameTeam.npc.find(npc=>npc.position===b[0]).character.attack) - (this.gameTeam.npc.find(npc=>npc.position===a[0]).character.attack));
  });

// console.log('\nnpcAttackableArr_sort:', npcAttackableArrSorted);
// const npcBestAttack = this.gameTeam.npc.find(npc=>npc.position === npcAttackableArrSorted[0][0]).character.attack;
// console.log('\nnpcBestAttack:', npcBestAttack);
const npcFilteredByAttack = npcAttackableArr.filter(//???почему npcAttackableArr а не npcAttackableArrSorted???
  item=>this.gameTeam.npc.find(npc=>npc.position===item[0]).character.attack
     === this.gameTeam.npc.find(npc=>npc.position === npcAttackableArrSorted[0][0]).character.attack);
//  console.log('\nnpcFilteredByAttack:', npcFilteredByAttack);

//далее для нпц с самой сильной атакой выбираем ближайшую цель, целей может быть несколько, н-р: кругом враги, тогда выбираем сильнейшую/далее цель с мин здоровьем/далее рандом

// ищем ближайшие цели
// npcFilteredByAttack.forEach(item=>{
//   console.log(this.gameTeam.npc.find(npc=>npc.position===item[0]),'[pos/pos/radius]', item, this.calculateCellRadius(item[0], item[1]));
// });//это для наглядности

const npcFilteredByAttackSorted = npcFilteredByAttack.sort((a, b) =>  
  this.calculateCellRadius(a[0],a[1])-this.calculateCellRadius(b[0],b[1]));
// console.log('\nnpcFilteredByAttackSorted:', npcFilteredByAttackSorted);
const npcClosestRadius = this.calculateCellRadius(npcFilteredByAttackSorted[0][0], npcFilteredByAttackSorted[0][1]);
// console.log('\nnpcClosestRadius:', npcClosestRadius);
//npcFilteredByAttackSorted.forEach(item=>{
  // console.log(this.calculateCellRadius(item[0], item[1]) === npcClosestRadius);
// });

// сильнейшие нпц с ближайшими целями
const npcTargetClosest = npcFilteredByAttackSorted.filter(item=>this.calculateCellRadius(item[0], item[1]) === npcClosestRadius);
// console.log('\nnpcTargetClosest:', npcTargetClosest);

// сильнейшие нпц с ближайшими сильнейшими целями
  const npcTargetClosestSorted = npcTargetClosest.sort((a, b) =>((this.gameTeam.player.find(player=>player.position===b[1]).character.attack) - (this.gameTeam.player.find(player=>player.position===a[1]).character.attack))); 
// console.log('\nnpcTargetClosestSorted:', npcTargetClosestSorted);
const npcTargetClosestStrongest = npcTargetClosestSorted.filter(item=>(this.gameTeam.player.find(player=>player.position===npcTargetClosestSorted[0][1]).character.attack
) === (this.gameTeam.player.find(player=>player.position===item[1]).character.attack
));
// console.log('\nnpcTargetClosestStrongest:', npcTargetClosestStrongest);

// сильнейшие нпц с ближайшими сильнейшими целями с мин здоровьем 
//  если длина npcTargetClosestStrongest > 1, то выберем с меньшим здоровьем
const npcTargetClosestStrongestSorted = npcTargetClosestStrongest.sort((a, b) =>((this.gameTeam.player.find(player=>player.position===a[1]).character.health) - (this.gameTeam.player.find(player=>player.position===b[1]).character.health))); 
// console.log('\nnpcTargetClosestStrongestSorted:', npcTargetClosestStrongestSorted);
const npcTargetClosestStrongestMinHealth = npcTargetClosestStrongestSorted.filter(item=>(this.gameTeam.player.find(player=>player.position===npcTargetClosestStrongestSorted[0][1]).character.health
) === (this.gameTeam.player.find(player=>player.position===item[1]).character.health
));
// console.log('\nnpcTargetClosestStrongestMinHealth:', npcTargetClosestStrongestMinHealth);

//несколько сильнейших нпц с ближайшими сильнейшими целями с мин здоровьем - тогда рандом
//const npcTargetClosestStrongestMinHealth1 = [[7,14],[7,6]];// Health"1" для проверки работы
let targetCellIndex = npcTargetClosestStrongestMinHealth[0][1];// Health"1" для проверки работы
let npcCellIndex = npcTargetClosestStrongestMinHealth[0][0];// Health"1" для проверки работы
  if (npcTargetClosestStrongestMinHealth.length > 1) {// Health"1" для проверки работы
  const rndIndex = Math.floor(Math.random() * npcTargetClosestStrongestMinHealth.length);// Health1 для проверки работы
  // console.log('\nrndIndex:', rndIndex);
  targetCellIndex = npcTargetClosestStrongestMinHealth[rndIndex][1];// Health1 для проверки работы
  npcCellIndex = npcTargetClosestStrongestMinHealth[rndIndex][0];// Health1 для проверки работы
  // console.log('\ntargetCellIndex:', targetCellIndex);
  // console.log('\nnpcCellIndex:', npcCellIndex);
}
console.log('\nnpcActions()_targetCellIndex:', targetCellIndex);
console.log('\nnpcActions()_npcCellIndex:', npcCellIndex);

const targetPlayer = this.gameTeam.player.find((player) => player.position === targetCellIndex);
const attackerNpc = this.gameTeam.npc.find((npc) => npc.position === npcCellIndex);
const damage = Math.max(attackerNpc.character.attack - targetPlayer.character.defence,
attackerNpc.character.attack * 1);//  для ускорения сделал 1, поменять на 0.1 в итоге

//  вызов showDamage из GamePlay
await this.gamePlay.showDamage(targetCellIndex, damage);

// console.log('\nattackerNpc:', attackerNpc);
// console.log('\ntargetPlayer:', targetPlayer);
// console.log('\ntargetPlayer.character.health:', targetPlayer.character.health);

targetPlayer.character.health -= damage;
// console.log('\ndamage:', damage);
console.log('\ntargetPlayer.character.health:', targetPlayer.character.health);
// console.log('\ndamage:', damage);
if (targetPlayer.character.health <= 0) {
  // console.log('this.targetNpc_R.I.P.: ', this.targetNpc.position);
  // console.log('this.gameTeam.npc: ', this.gameTeam.npc);
  // console.log('this.gameTeam.npc.filter(): ', this.gameTeam.npc.filter((npc) => npc.position !== this.targetNpc.position));
  // this.gameTeam.gameSet = this.gameTeam.gameSet.filter((player) => player.position !== targetPlayer.position);
  this.gameTeam.player = this.gameTeam.player.filter((player) => player.position !== targetPlayer.position);
}
// console.log('this.gameTeam.gameSet:', this.gameTeam.gameSet);
// console.log('this.gameTeam.player:', this.gameTeam.player);
// this.gamePlay.redrawPositions(this.gameTeam.gameSet);
}
//*
//*
//*
//*
//*
//или перемещение npc 
if(npcMovingArr.length&&!npcAttackableArr.length){
// console.log('\n npcMovingArr:\n[pos/pos/dist]\n', npcMovingArr);
// выбираем ближайших npc к игроку
const npcMovingArrSortDist = npcMovingArr.sort((a, b) =>  
  a[2]-b[2]);
// console.log('\n npcMovingArrSortDist:\n[pos/pos/dist]\n', npcMovingArrSortDist);  
const npcMovingArrMinDist = npcMovingArrSortDist.filter(item=>npcMovingArrSortDist[0][2] === item[2]);
// console.log('\n npcMovingArrMinDist:\n[pos/pos/dist]\n', npcMovingArrMinDist);
// выбираем ближайших npc к игроку с макс. дальностью атаки
const npcMovingArrSortRadius = npcMovingArrMinDist.sort(
  (a, b) =>(
    (this.gameTeam.npc.find(npc=>npc.position===a[0]).character.attack) - (this.gameTeam.npc.find(npc=>npc.position===b[0]).character.attack)
    )
  ); 
// console.log('\n npcMovingArrSortRadius:\n[pos/pos/dist]\n', npcMovingArrSortRadius);
const npcMovingArrMaxRadius = npcMovingArrSortRadius.filter(
  item=>(this.gameTeam.npc.find(npc=>npc.position===npcMovingArrSortRadius[0][0]).character.attack
) === (this.gameTeam.npc.find(npc=>npc.position===item[0]).character.attack
)
);
// console.log('\n npcMovingArrMaxRadius:\n[pos/pos/dist]\n', npcMovingArrMaxRadius);

const npcMoveArr = [];
npcMovingArrMaxRadius.forEach(item=>{
const radiusCol = (Math.floor(item[0]/8) - Math.floor(item[1]/8));// радиус в клетках по вертикали(количество строк между персами)
const radiusRow = (item[0]%8 - item[1]%8);// радиус в клетках по горизонтали(количество столбцов между персами)
let newPosition=item[0];
if(!radiusCol&&radiusRow>0){
  //тогда position=+1/-1 если radiusRow<0/>0
//влево
npcMoveArr.push([item[0],item[0]-1]);
}   
if(!radiusCol&&radiusRow<0){
  //тогда position=+1/-1 если radiusRow<0/>0
//вправо
npcMoveArr.push([item[0],item[0]+1]);
}   
if(radiusCol>0&&!radiusRow){
//тогда position=+8/-8 если radiusCol>0/<0
//вверх  
npcMoveArr.push([item[0],item[0]-8]);
} 
if(radiusCol<0&&!radiusRow){
//тогда position=+8/-8 если radiusCol>0/<0
//вниз 
npcMoveArr.push([item[0],item[0]+8]); 
} 
if(radiusCol&&radiusRow){
//ходим по диагонали
//тогда position=+1/-1 если radiusRow<0/>0 и position=+8/-8 если radiusCol>0/<0
//или position=+1/-1 если radiusRow<0/>0 для альт хода
//или position=+8/-8 если radiusCol>0/<0 для альт хода
if(radiusRow>0)newPosition=newPosition-1;//влево
if(radiusRow<0)newPosition=newPosition+1;//вправо
if(radiusCol>0)newPosition=newPosition-8;//вверх  
if(radiusCol<0)newPosition=newPosition+8;//вниз
npcMoveArr.push([item[0],newPosition]); 
} 
//блок ниже для понимания и наглядности
// let signLeftRight = '';
// let signUpDown = '';
// if (radiusCol<0){
// signUpDown = 'вниз';
// } else signUpDown = 'вверх';
// if (radiusRow<0){
// signLeftRight = 'вправо';
// } else signLeftRight = 'влево'; 
// console.log('\n radiusCol ^v:',radiusCol, 'radiusRow <>',radiusRow,' @ ',item[0],'-',item[1],signLeftRight,signUpDown,'=',newPosition);
});// скобки npcMovingArrMaxRadius.forEach
// нужно определить в каком направлении шагать
// принимаем шаг на 1 клетку в сторону соперника
// нужно проверить не занята ли ячейка для хода персом своей команды
// если ближайших к игроку с макс. дальностью атаки несколько, то рандом?
  // console.log('\nnpcMoveArr',npcMoveArr);
const npcMoveableArr = npcMoveArr.filter(
    item=>!(this.gameTeam.npc.find(        
      npc=>npc.position===item[1]))
      );      
// console.log('npcMoveableArr',npcMoveableArr);

if(npcMoveableArr.length){
let npcMovable = npcMoveableArr[0];
  if (npcMoveableArr.length > 1) {
  const rndIndex = Math.floor(Math.random() * npcMoveableArr.length);   
  npcMovable = npcMoveableArr[rndIndex];  
}
console.log('\nnpcActions()_npcMovable:', npcMovable);
this.gameTeam.npc.find((npc) => npc.position === npcMovable[0]).position = npcMovable[1];
const npcNewPosition = this.gameTeam.npc.find((npc) => npc.position === npcMovable[1])
console.log('\nnpcActions()_npcNewPosition:', npcNewPosition);
} 
}
if(!npcAttackableArr.length&&!npcMovingArr.length) console.warn('NPC не имеет доступных действий!');
// this.gamePlay.redrawPositions(this.gameTeam.gameSet);
this.gamePlay.redrawPositions([...this.gameTeam.player,...this.gameTeam.npc]);
this.currentTurn = 'player'; //  после хода npc
this.isLocked = false;
console.log('npcActions()end: ', ' this.currentTurn:', this.currentTurn);

if (!this.gameTeam.player.length) {//д.б. или отдельно или в npcActions
  console.log('***!!!YOU LOST!!!***');
  GamePlay.showMessage('***!!!NPC WIN!!!TRY AGAIN!!!***');
}
}//скобка npcActions


createStateObj() {   
  const currentTurn = this.currentTurn;  
  const scores = this.scores;
  const isLocked = this.isLocked;
  const level = this.level;
  const levelTheme = this.levelTheme;
  const gameTeam = {...this.gameTeam};
  // const playerTeam = this.gameTeam.player;  
  // const npcTeam = this.gameTeam.npc;
  if(this.highscore < this.scores) {
    this.highscore = this.scores;
        
  }
  const highscore = this.highscore;  
  const gameStateObj = GameState.from({    
    highscore,
    scores,
    isLocked,    
    level,
    levelTheme,
    gameTeam,
    currentTurn,    
   });

   return gameStateObj;
  }

}// скобка GameController
