function isChildKey(key, parentKey) {
  return key.indexOf(`${parentKey}/`) === 0;
}

function normalizeKey(key) {
  return key.indexOf('/') === 0 ? key : `/${key}`;
}

function getChildPartOfKey(key, parentKey) {
  return key.slice(parentKey.length);
}

function findCombinableData(data) {
  let parentIndex = undefined;

  const foundIndex = data.findIndex(([key, value], index) => {
    const parentSubIndex = data
      .slice(index + 1)
      .findIndex(([otherKey]) => isChildKey(key, otherKey));

    if(parentSubIndex === -1) {
      return false;
    }

    parentIndex = parentSubIndex + index + 1;
    return true;
  });

  if(foundIndex === -1) {
    return [];
  }

  const [foundKey, foundValue] = data[foundIndex];
  const [parentKey, parentValue] = data[parentIndex];

  return [foundIndex, foundKey, foundValue, parentIndex, parentKey, parentValue];
}

function runOneCombine(data, foundIndex, foundKey, foundValue, parentIndex, parentKey, parentValue) {
  // console.log(`Found Key To Combine: ${foundKey}`);
  // console.log(`Found Parent Key To Combine: ${parentKey}`);

  return data.slice(0, foundIndex)
    .concat(data.slice(foundIndex + 1, parentIndex))
    .concat([[parentKey, {
      ...parentValue,
      [getChildPartOfKey(foundKey, parentKey)]: foundValue,
    }]])
    .concat(data.slice(parentIndex + 1));
}

function sortByKeyDepthDescending(a, b) {
  //Key value pairs
  const [aKey] = a;
  const [bKey] = b;

  const aCount = (aKey.match(/\//g)||[]).length;
  const bCount = (bKey.match(/\//g)||[]).length;

  return bCount - aCount;
}

function combineData(data) {
  //Sort data by depth (number of "/" characters)
  let combinedData = data
    .map(([key, value]) => ([normalizeKey(key), value]))
    .sort(sortByKeyDepthDescending);

  let [foundIndex, foundKey, foundValue, parentIndex, parentKey, parentValue] = findCombinableData(combinedData);

  while(foundIndex !== undefined) {
    combinedData = runOneCombine(combinedData, foundIndex, foundKey, foundValue, parentIndex, parentKey, parentValue);

    [foundIndex, foundKey, foundValue, parentIndex, parentKey, parentValue] = findCombinableData(combinedData);
  }

  return combinedData;
}

function parse(data) {
  return combineData(Object.entries(data))
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }));
}

module.exports = { parse };
