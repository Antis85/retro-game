import Bowman from '../characters/Bowman';
import Swordsman from '../characters/Swordsman';
import Magician from '../characters/Magician';
import Vampire from '../characters/Vampire';
import Undead from '../characters/Undead';
import Daemon from '../characters/Daemon';
import GamePlay from '../GamePlay';
import GameController from '../GameController';
import GameStateService from '../GameStateService';
import { calculateMove, calculateAttack } from '../calcs/calcs';

const gamePlay = new GamePlay();
gamePlay.container = document.createElement('div');
gamePlay.bindToDOM(gamePlay.container);
const stateService = new GameStateService(localStorage);
const gameCtrl = new GameController(gamePlay, stateService);
gameCtrl.init();

const player = [{
  character: {
    level: 1,
    attack: 40,
    defence: 10,
    health: 100,
    type: 'swordsman',
  },
  position: 0,
},
{
  character: {
    level: 1,
    attack: 25,
    defence: 25,
    health: 100,
    type: 'bowman',
  },
  position: 8,
},
];

const npc = [{
  character: {
    level: 1,
    attack: 40,
    defence: 10,
    health: 100,
    type: 'undead',
  },
  position: 1,
},
{
  character: {
    level: 1,
    attack: 40,
    defence: 10,
    health: 100,
    type: 'undead',
  },
  position: 63,
},
];

gameCtrl.gameTeam.reloadGameSet(player, npc);
gameCtrl.gamePlay.redrawPositions([...gameCtrl.gameTeam.player, ...gameCtrl.gameTeam.npc]);
gameCtrl.isLocked = false;

gameCtrl.onCellClick(0);
const selectedIndex = 0;
test('When player selected, cursor should be <pointer> style, cell should not be selected', () => {
  const enteredIndex = 8;
  gameCtrl.onCellEnter(enteredIndex);
  expect(gamePlay.boardEl.style.cursor).toBe('pointer');
  const selected = gamePlay.cells[enteredIndex].classList.contains('selected');
  expect(selected).toBeFalsy();
});

test('When player moving, cursor should be <pointer> style, cell should be selected green', () => {
  const enteredIndex = 9;
  gameCtrl.onCellEnter(enteredIndex);
  expect(gamePlay.boardEl.style.cursor).toBe('pointer');
  const selected = gamePlay.cells[enteredIndex].classList.contains('selected-green');
  expect(selected).toBeTruthy();
  const isMovable = calculateMove('swordsman', selectedIndex, enteredIndex);
  expect(isMovable).toBeTruthy();
});

test('When player moving, cursor should be <pointer> style, cell should be selected green', () => {
  const enteredIndex = 18;
  gameCtrl.onCellEnter(enteredIndex);
  expect(gamePlay.boardEl.style.cursor).toBe('pointer');
  const selected = gamePlay.cells[enteredIndex].classList.contains('selected-green');
  expect(selected).toBeTruthy();
  const isMovable = calculateMove('swordsman', selectedIndex, enteredIndex);
  expect(isMovable).toBeTruthy();
});

test('When player moving, cursor should be <pointer> style, cell should be selected green', () => {
  const enteredIndex = 27;
  gameCtrl.onCellEnter(enteredIndex);
  expect(gamePlay.boardEl.style.cursor).toBe('pointer');
  const selected = gamePlay.cells[enteredIndex].classList.contains('selected-green');
  expect(selected).toBeTruthy();
  const isMovable = calculateMove('swordsman', selectedIndex, enteredIndex);
  expect(isMovable).toBeTruthy();
});

test('When player moving, cursor should be <pointer> style, cell should be selected green', () => {
  const enteredIndex = 36;
  gameCtrl.onCellEnter(enteredIndex);
  expect(gamePlay.boardEl.style.cursor).toBe('pointer');
  const selected = gamePlay.cells[enteredIndex].classList.contains('selected-green');
  expect(selected).toBeTruthy();
  const isMovable = calculateMove('swordsman', selectedIndex, enteredIndex);
  expect(isMovable).toBeTruthy();
});

test('When player moving over max radius, cursor should be <not-allowed> style, cell should be not selected', () => {
  const enteredIndex = 5;
  gameCtrl.onCellEnter(enteredIndex);
  expect(gamePlay.boardEl.style.cursor).toBe('not-allowed');
  const selected = gamePlay.cells[enteredIndex].classList.contains('selected');
  expect(selected).toBeFalsy();
  const isMovable = calculateMove('swordsman', selectedIndex, enteredIndex);
  expect(isMovable).toBeFalsy();
});
test('When player moving over max radius, cursor should be <not-allowed> style, cell should be not selected', () => {
  const enteredIndex = 40;
  gameCtrl.onCellEnter(enteredIndex);
  expect(gamePlay.boardEl.style.cursor).toBe('not-allowed');
  const selected = gamePlay.cells[enteredIndex].classList.contains('selected');
  expect(selected).toBeFalsy();
  const isMovable = calculateMove('swordsman', selectedIndex, enteredIndex);
  expect(isMovable).toBeFalsy();
});
test('When player moving over max radius, cursor should be <not-allowed> style, cell should be not selected', () => {
  const enteredIndex = 45;
  gameCtrl.onCellEnter(enteredIndex);
  expect(gamePlay.boardEl.style.cursor).toBe('not-allowed');
  const selected = gamePlay.cells[enteredIndex].classList.contains('selected');
  expect(selected).toBeFalsy();
  const isMovable = calculateMove('swordsman', selectedIndex, enteredIndex);
  expect(isMovable).toBeFalsy();
});

test('When player aiming target outside max radius, cursor should be <not-allowed> style, cell should be not selected', () => {
  const enteredIndex = 63;
  gameCtrl.onCellEnter(enteredIndex);
  expect(gamePlay.boardEl.style.cursor).toBe('not-allowed');
  const selected = gamePlay.cells[enteredIndex].classList.contains('selected');
  expect(selected).toBeFalsy();
  const isAttackable = calculateAttack('swordsman', selectedIndex, enteredIndex);
  expect(isAttackable).toBeFalsy();
});

test('When player aiming target inside max radius, cursor should be <crosshair> style, cell should be selected red', () => {
  const enteredIndex = 1;
  gameCtrl.onCellEnter(enteredIndex);
  expect(gamePlay.boardEl.style.cursor).toBe('crosshair');
  const selected = gamePlay.cells[enteredIndex].classList.contains('selected-red');
  expect(selected).toBeTruthy();
  const isAttackable = calculateAttack('swordsman', selectedIndex, enteredIndex);
  expect(isAttackable).toBeTruthy();
});

test('Tagged template', () => {
  const character = new Bowman(1);
  const recieved = `${'\u{1F396}'}${character.level}${'\u{2694}'}${character.attack}${'\u{1F6E1}'}${character.defence}${'\u{2764}'}${character.health}`;
  const expected = '🎖1⚔25🛡25❤100';
  expect(recieved).toBe(expected);
});

test('Tagged template', () => {
  const character = new Swordsman(1);
  const recieved = `${'\u{1F396}'}${character.level}${'\u{2694}'}${character.attack}${'\u{1F6E1}'}${character.defence}${'\u{2764}'}${character.health}`;
  const expected = '🎖1⚔40🛡10❤100';
  expect(recieved).toBe(expected);
});

test('Tagged template', () => {
  const character = new Magician(1);
  const recieved = `${'\u{1F396}'}${character.level}${'\u{2694}'}${character.attack}${'\u{1F6E1}'}${character.defence}${'\u{2764}'}${character.health}`;
  const expected = '🎖1⚔10🛡40❤100';
  expect(recieved).toBe(expected);
});

test('Tagged template', () => {
  const character = new Vampire(1);
  const recieved = `${'\u{1F396}'}${character.level}${'\u{2694}'}${character.attack}${'\u{1F6E1}'}${character.defence}${'\u{2764}'}${character.health}`;
  const expected = '🎖1⚔25🛡25❤100';
  expect(recieved).toBe(expected);
});

test('Tagged template', () => {
  const character = new Undead(1);
  const recieved = `${'\u{1F396}'}${character.level}${'\u{2694}'}${character.attack}${'\u{1F6E1}'}${character.defence}${'\u{2764}'}${character.health}`;
  const expected = '🎖1⚔40🛡10❤100';
  expect(recieved).toBe(expected);
});

test('Tagged template', () => {
  const character = new Daemon(1);
  const recieved = `${'\u{1F396}'}${character.level}${'\u{2694}'}${character.attack}${'\u{1F6E1}'}${character.defence}${'\u{2764}'}${character.health}`;
  const expected = '🎖1⚔10🛡40❤100';
  expect(recieved).toBe(expected);
});
