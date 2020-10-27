/**
 * Generates random characters
 *
 * @param allowedTypes iterable of classes
 * @param maxLevel max character level
 * @returns Character type children (ex. Magician, Bowman, etc)
 */
export function* characterGenerator(allowedTypes, maxLevel) {
  // TODO: write logic here
  const randomIndex = Math.floor(Math.random() * allowedTypes.length);
  const randomLevel = Math.ceil(Math.random() * maxLevel);
  const RandomCharacter = allowedTypes[randomIndex];
  const newRandomCharacter = new RandomCharacter(randomLevel);
  if (randomLevel > 1) {
    console.log('characterGenerator_randomLevel: ', randomLevel);
    let count = 0;
    for (let i = 0; i < randomLevel - 1; i += 1) {
      newRandomCharacter.levelUp();
      count += 1;
    }
    console.log(`characterGenerator_levelUp() x ${count} times `);
    newRandomCharacter.level = randomLevel;
  }
  yield newRandomCharacter;
}

export function generateTeam(allowedTypes, maxLevel, characterCount) {
  // TODO: write logic here
  const generatedTeamArr = [];
  for (let i = 0; i < characterCount; i += 1) {
    const generator = characterGenerator(allowedTypes, maxLevel);
    generatedTeamArr.push(generator.next().value);
  }
  return generatedTeamArr;
}
