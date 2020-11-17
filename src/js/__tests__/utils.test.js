import { calcTileType } from '../ui/utils';

test('Function should return top-left', () => {
  const tileType = calcTileType(0, 8);
  expect(tileType).toBe('top-left');
});

test('Function should return top', () => {
  const tileType = calcTileType(1, 8);
  expect(tileType).toBe('top');
});

test('Function should return top', () => {
  const tileType = calcTileType(6, 8);
  expect(tileType).toBe('top');
});

test('Function should return top-right', () => {
  const tileType = calcTileType(7, 8);
  expect(tileType).toBe('top-right');
});

test('Function should return left', () => {
  const tileType = calcTileType(8, 8);
  expect(tileType).toBe('left');
});

test('Function should return center', () => {
  const tileType = calcTileType(9, 8);
  expect(tileType).toBe('center');
});

test('Function should return center', () => {
  const tileType = calcTileType(14, 8);
  expect(tileType).toBe('center');
});

test('Function should return right', () => {
  const tileType = calcTileType(15, 8);
  expect(tileType).toBe('right');
});

test('Function should return left', () => {
  const tileType = calcTileType(48, 8);
  expect(tileType).toBe('left');
});

test('Function should return center', () => {
  const tileType = calcTileType(49, 8);
  expect(tileType).toBe('center');
});

test('Function should return center', () => {
  const tileType = calcTileType(54, 8);
  expect(tileType).toBe('center');
});

test('Function should return right', () => {
  const tileType = calcTileType(55, 8);
  expect(tileType).toBe('right');
});

test('Function should return bottom-left', () => {
  const tileType = calcTileType(56, 8);
  expect(tileType).toBe('bottom-left');
});

test('Function should return bottom', () => {
  const tileType = calcTileType(57, 8);
  expect(tileType).toBe('bottom');
});

test('Function should return bottom', () => {
  const tileType = calcTileType(62, 8);
  expect(tileType).toBe('bottom');
});

test('Function should return bottom-right', () => {
  const tileType = calcTileType(63, 8);
  expect(tileType).toBe('bottom-right');
});
