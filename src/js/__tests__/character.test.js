import Character from '../team_generation/Character';
import Bowman from '../characters/Bowman';
import Swordsman from '../characters/Swordsman';
import Magician from '../characters/Magician';
import Vampire from '../characters/Vampire';
import Undead from '../characters/Undead';
import Daemon from '../characters/Daemon';

test('Should throw error', () => {
  expect(() => {
    const recieved = new Character(1);
    return recieved;
  }).toThrow();
});

test('Should create Bowman', () => {
  const result = new Bowman(1);
  expect(result).toEqual({
    level: 1,
    attack: 25,
    defence: 25,
    health: 100,
    type: 'bowman',
  });
});

test('Should create Swordsman', () => {
  const result = new Swordsman(1);
  expect(result).toEqual({
    level: 1,
    attack: 40,
    defence: 10,
    health: 100,
    type: 'swordsman',
  });
});

test('Should create Magician', () => {
  const result = new Magician(1);
  expect(result).toEqual({
    level: 1,
    attack: 10,
    defence: 40,
    health: 100,
    type: 'magician',
  });
});

test('Should create Vampire', () => {
  const result = new Vampire(1);
  expect(result).toEqual({
    level: 1,
    attack: 25,
    defence: 25,
    health: 100,
    type: 'vampire',
  });
});

test('Should create Undead', () => {
  const result = new Undead(1);
  expect(result).toEqual({
    level: 1,
    attack: 40,
    defence: 10,
    health: 100,
    type: 'undead',
  });
});

test('Should create Daemon', () => {
  const result = new Daemon(1);
  expect(result).toEqual({
    level: 1,
    attack: 10,
    defence: 40,
    health: 100,
    type: 'daemon',
  });
});
