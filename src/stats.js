function flatMapReducer(acc, cur) {
  return [...(acc || []), ...cur];
}

function getObjectKeyValue(object, key) {
  return object.children.find(child => child.rule === 'keyValuePair' && child.children[0].value === key);
}

function getListValueForKey(object, key, {
  ignoreValue = false,
  shouldParseInt = false,
  filterZero = false,
} = {}) {
  const list = getObjectKeyValue(object, key);

  if (!(list && list.children && list.children[1] && list.children[1].children)) {
    return undefined;
  }
  if (ignoreValue) {
    return list.children[1].children
    .map(listValue => listValue.children[0].value);
  }

  return list.children[1].children
  .map(listValue => ({
    [listValue.children[0].value]: shouldParseInt ? parseInt(listValue.children[1].value) : listValue.children[1].value,
  }))
  .filter(listValue => !filterZero || Object.values(listValue)[0] !== 0)
  .reduce((acc, cur) => ({ ...acc, ...cur }), {});
}

function getChemReagentsFromObjectDef(object) {
  const reagentsList = getListValueForKey(object, 'required_reagents', { shouldParseInt: true, filterZero: true });
  const catalystsList = getListValueForKey(object, 'catalysts', { shouldParseInt: true });
  const inhibitorsList = getListValueForKey(object, 'inhibitors', { ignoreValue: true });
  const requiredContainer = getObjectKeyValue(object, 'required');
  const result = getObjectKeyValue(object, 'result');
  const isResultNull = result && result.children[1].value === 'null';
  const objectName = getObjectKeyValue(object, 'name').children[1].value;
  return {
    [objectName]: {
      recipe: reagentsList,
      ...(isResultNull && { resultNotLiquid: true }),
      ...(catalystsList && { catalysts: catalystsList }),
      ...(inhibitorsList && { inhibitors: inhibitorsList }),
      ...(requiredContainer && { requiredContainer: requiredContainer.children[1].value }),
      result_amount: parseInt(getObjectKeyValue(object, 'result_amount').children[1].value),
    }
  }
}

function getChemRecipes(ast) {
  return ast
  .filter(fileContents => fileContents)
  .map(({ children }) => children)
  .reduce(flatMapReducer)
  .filter(({ rule }) => rule === 'objectDef')
  .filter(({ children }) =>
    children.find(child => child.rule === 'keyValuePair' && child.children[0].value === 'required_reagents'))
  .map(obj => getChemReagentsFromObjectDef(obj))
  .reduce((acc, cur) => ({ ...acc, ...cur }), {});

}

module.exports = { getChemRecipes };