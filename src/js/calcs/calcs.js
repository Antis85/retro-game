export function calculateMove(charType, playerCellIndex, moveCellIndex) {
  let radiusMove = 0;
  const radiusCol = Math.abs(Math.floor(playerCellIndex / 8) - Math.floor(moveCellIndex / 8));
  const radiusRow = Math.abs((playerCellIndex % 8) - (moveCellIndex % 8));

  switch (charType) {
    case 'magician':
    case 'daemon':
      radiusMove = 1;
      break;
    case 'bowman':
    case 'vampire':
      radiusMove = 2;
      break;
    case 'swordsman':
    case 'undead':
      radiusMove = 4;
      break;
    default:
      break;
  }

  return Math.max(radiusCol, radiusRow) <= radiusMove;
}

export function calculateAttack(charType, playerCellIndex, targetCellIndex) {
  let radiusAttack = 0;
  const radiusCol = Math.abs(Math.floor(playerCellIndex / 8) - Math.floor(targetCellIndex / 8));
  const radiusRow = Math.abs((playerCellIndex % 8) - (targetCellIndex % 8));

  switch (charType) {
    case 'magician':
    case 'daemon':
      radiusAttack = 4;
      break;
    case 'bowman':
    case 'vampire':
      radiusAttack = 2;
      break;
    case 'swordsman':
    case 'undead':
      radiusAttack = 1;
      break;
    default:
      break;
  }

  return (Math.max(radiusCol, radiusRow) <= radiusAttack);
}

export function calculateCellRadius(сurrentCellIndex, targetCellIndex) {
  const radiusCol = Math.abs(Math.floor(сurrentCellIndex / 8) - Math.floor(targetCellIndex / 8));
  const radiusRow = Math.abs((сurrentCellIndex % 8) - (targetCellIndex % 8));
  const cellRadius = Math.max(radiusCol, radiusRow);
  return cellRadius;
}
