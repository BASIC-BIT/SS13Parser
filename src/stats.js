const parseListAsMap = (list) => list &&
  list.reduce((acc, cur) => ({ ...acc, ...cur }), {});

const parseListOrMap = (list) => {
  if (!list) {
    return list;
  }

  const isEveryItemAnObject = list.every((obj) => typeof obj === 'object');

  if (isEveryItemAnObject) {
    return parseListAsMap(list);
  } else {
    return list;
  }
};

const getDefFromId = (gameData, id) => {
  const obj = Object.entries(gameData)
    .find(([objDef, data]) => data && data.id === id);

  return obj && obj[1];
};

const getRecipeDto = (gameData, recipe) => {
  if (!recipe) {
    return undefined;
  }

  if (Array.isArray(recipe)) {
    return recipe
      .map(id => {
        const def = getDefFromId(gameData, id);

        return {
          [id]: {
            name: def.name,
          }
        };
      })
      .filter(obj => obj)
      .reduce((acc, cur) => ({ ...acc, ...cur }));
  }

  return Object.entries(recipe)
    .map(([id, amount]) => {
      const def = getDefFromId(gameData, id);

      return def && def.name && {
        [id]: {
          name: def.name,
          amount,
        }
      };
    })
    .filter(obj => obj)
    .reduce((acc, cur) => ({ ...acc, ...cur }));
};

function getChemReagentsFromObjectDef(gameData, objDef, data) {
  const reagentsMap = parseListAsMap(data.required_reagents);
  const catalystData = parseListOrMap(data.catalysts);
  const inhibitorData = parseListOrMap(data.inhibitors);
  const recipe = getRecipeDto(gameData, reagentsMap);
  const catalysts = catalystData && getRecipeDto(gameData, catalystData);
  const inhibitors = inhibitorData && getRecipeDto(gameData, inhibitorData);
  const blacklistContainers = data.blacklist_containers;
  const requiredContainer = data.required;
  const resultId = data.result && data.result !== 'null' && data.result; //gross
  const resultDefinition = resultId && getDefFromId(gameData, resultId);
  const resultNotLiquid = resultId === 'null';
  const resultAmount = data.result_amount;
  const reactionName = objDef.substring(objDef.lastIndexOf('/') + 1);
  return {
    [objDef]: {
      reactionName,
      recipe,
      ...(resultId && !resultNotLiquid && { resultDefinition }),
      ...(resultNotLiquid && { resultNotLiquid }),
      ...(catalysts && { catalysts }),
      ...(inhibitors && { inhibitors }),
      ...(requiredContainer && { requiredContainer }),
      ...(blacklistContainers && { blacklistContainers }),
      ...(resultAmount && { resultAmount }),
    }
  }
}

function getChemRecipes(gameData) {
  return Object.entries(gameData)
    .filter(([objName, { required_reagents }]) => required_reagents)
    .map(([name, data]) => getChemReagentsFromObjectDef(gameData, name, data))
    .reduce((acc, cur) => ({ ...acc, ...cur }), {});
}

module.exports = { getChemRecipes };