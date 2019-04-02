function flatMapReducer(acc, cur) {
  return [...(acc || []), ...cur];
}

function getObjectKeyValue(object, key) {
  return object.children.find(child => child.rule === 'keyValuePair' && child.children[0].value === key);
}

function getListValueForKey(object, key, { ignoreValue = false } = {}) {
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
    [listValue.children[0].value]: listValue.children[1].value,
  }))
  .reduce((acc, cur) => ({ ...acc, ...cur }), {});
}

function getChemReagentsFromObjectDef(object) {
  const reagentsList = getListValueForKey(object, 'required_reagents');
  const catalystsList = getListValueForKey(object, 'catalysts');
  const inhibitorsList = getListValueForKey(object, 'inhibitors', { ignoreValue: true });
  const objectName = getObjectKeyValue(object, 'name').children[1].value;
  return {
    [objectName]: {
      recipe: reagentsList,
      ...(catalystsList && { catalysts: catalystsList }),
      ...(inhibitorsList && { inhibitors: inhibitorsList }),
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