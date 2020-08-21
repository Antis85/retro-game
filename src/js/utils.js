export function calcTileType(index, boardSize) {
  // TODO: write logic here
  if (!index) {
    //  switch лучше
    return 'top-left';
  }
  if (index === boardSize - 1) {
    return 'top-right';
  }
  if (index < boardSize) { //  ОСТАВИТЬ!!!
    return 'top';
  }
  if (index === boardSize * (boardSize - 1)) {
    return 'bottom-left';
  }
  if (!(index % boardSize)) { //  ОСТАВИТЬ!!!
    return 'left';
  }
  if (index === boardSize ** 2 - 1) {
    return 'bottom-right';
  }
  if (!((index + 1) % boardSize)) { //  ОСТАВИТЬ!!!
    return 'right';
  }
  if (index > boardSize * (boardSize - 1)) { //  ОСТАВИТЬ!!!
    return 'bottom';
  }
  return 'center';
  /* switch (index) {
    //  4 сравнения здесь не прокатят, они только в ИФах!!!
    case 0:
      return 'top-left';
    case boardSize - 1:
      return 'top-right';
    case boardSize * (boardSize - 1):
      return 'bottom-left';
    case boardSize ** 2 - 1:
      return 'bottom-right';
    default:
      return 'center';
  } */
}

export function calcHealthLevel(health) {
  if (health < 15) {
    return 'critical';
  }

  if (health < 50) {
    return 'normal';
  }

  return 'high';
}
