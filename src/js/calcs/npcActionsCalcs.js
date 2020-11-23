import { calculateAttack, calculateCellRadius } from './calcs';

export function createActionsArrays(playerTeamArr, npcTeamArr) {
  // создаем внутренние массивы позиций игорьков и неписей с учетом доступности атаки и перемещения
  const npcAttackableArr = [];
  const npcMovingArr = [];
  npcTeamArr.forEach((npc) => {
    playerTeamArr.forEach((player) => {
      const isAttackable = calculateAttack(
        npc.character.type,
        player.position,
        npc.position,
      );
      const movingDistance = calculateCellRadius(npc.position, player.position);
      if (isAttackable) {
        npcAttackableArr.push([npc.position, player.position]);
      }
      if (!isAttackable) {
        npcMovingArr.push([npc.position, player.position, movingDistance]);
      }
    });
  });

  return [npcAttackableArr, npcMovingArr];
}

export function sortByAttack(npcAttackableArr, npcTeamArr) {
  // ищем сильнейших нпц
  const npcAttackableArrSorted = npcAttackableArr.sort(
    (a, b) => (
      npcTeamArr.find((npc) => npc.position === b[0]).character.attack
    ) - (
      npcTeamArr.find((npc) => npc.position === a[0]).character.attack
    ),
  );
  const npcFilteredByAttackArr = npcAttackableArr.filter(
    (item) => (
      npcTeamArr.find((npc) => npc.position === item[0]).character.attack
    ) === (
      npcTeamArr.find((npc) => npc.position === npcAttackableArrSorted[0][0]).character.attack
    ),
  );

  return npcFilteredByAttackArr;
}

export function sortByTargets(npcFilteredByAttackArr, playerTeamArr) {
  // ищем ближайшие цели
  const npcFilteredByAttackSortedArr = npcFilteredByAttackArr.sort(
    (a, b) => calculateCellRadius(a[0], a[1]) - calculateCellRadius(b[0], b[1]),
  );
  const npcClosestRadiusArr = calculateCellRadius(
    npcFilteredByAttackSortedArr[0][0], npcFilteredByAttackSortedArr[0][1],
  );

  // сильнейшие нпц с ближайшими целями
  const npcTargetClosestArr = npcFilteredByAttackSortedArr.filter(
    (item) => calculateCellRadius(item[0], item[1]) === npcClosestRadiusArr,
  );

  // сильнейшие нпц с ближайшими сильнейшими целями
  const npcTargetClosestSortedArr = npcTargetClosestArr.sort(
    (a, b) => (
      (
        playerTeamArr.find((player) => player.position === b[1]).character.attack
      ) - (
        playerTeamArr.find((player) => player.position === a[1]).character.attack
      )
    ),
  );

  const npcTargetClosestStrongestArr = npcTargetClosestSortedArr.filter(
    (item) => (
      // eslint-disable-next-line max-len
      playerTeamArr.find((player) => player.position === npcTargetClosestSortedArr[0][1]).character.attack
    ) === (
      playerTeamArr.find((player) => player.position === item[1]).character.attack
    ),
  );

  // сильнейшие нпц с ближайшими сильнейшими целями с мин здоровьем
  const npcTargetClosestStrongestSortedArr = npcTargetClosestStrongestArr.sort(
    (a, b) => (
      (
        playerTeamArr.find((player) => player.position === a[1]).character.health
      ) - (
        playerTeamArr.find((player) => player.position === b[1]).character.health
      )
    ),
  );

  const npcTargetClosestStrongestMinHealthArr = npcTargetClosestStrongestSortedArr.filter(
    (item) => (
      // eslint-disable-next-line max-len
      playerTeamArr.find((player) => player.position === npcTargetClosestStrongestSortedArr[0][1]).character.health
    ) === (
      playerTeamArr.find((player) => player.position === item[1]).character.health
    ),
  );

  return npcTargetClosestStrongestMinHealthArr;
}

export function sortByDistance(npcMovingArr, npcTeamArr) {
  // выбираем ближайших npc к игорьку
  const npcMovingArrSortDistArr = npcMovingArr.sort((a, b) => a[2] - b[2]);
  const npcMovingArrMinDistArr = npcMovingArrSortDistArr.filter(
    (item) => npcMovingArrSortDistArr[0][2] === item[2],
  );

  // выбираем ближайших npc к игроку с макс. дальностью атаки
  const npcMovingArrSortRadiusArr = npcMovingArrMinDistArr.sort(
    (a, b) => (
      (
        npcTeamArr.find((npc) => npc.position === a[0]).character.attack
      ) - (
        npcTeamArr.find((npc) => npc.position === b[0]).character.attack
      )
    ),
  );
  const npcMovingArrMaxRadiusArr = npcMovingArrSortRadiusArr.filter(
    (item) => (
      npcTeamArr.find((npc) => npc.position === npcMovingArrSortRadiusArr[0][0]).character.attack
    ) === (
      npcTeamArr.find((npc) => npc.position === item[0]).character.attack
    ),
  );

  return npcMovingArrMaxRadiusArr;
}

export function calcMovingCells(npcMovingArrMaxRadiusArr) {
  // нужно определить в каком направлении шагать
  // принимаем шаг на 1 клетку в сторону соперника
  const npcMoveArr = [];
  npcMovingArrMaxRadiusArr.forEach((item) => {
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
      if (radiusRow > 0) newPosition -= 1; // влево
      if (radiusRow < 0) newPosition += 1; // вправо
      if (radiusCol > 0) newPosition -= 8; //  вверх
      if (radiusCol < 0) newPosition += 8; // вниз
      npcMoveArr.push([item[0], newPosition]);
    }
  });

  return npcMoveArr;
}
