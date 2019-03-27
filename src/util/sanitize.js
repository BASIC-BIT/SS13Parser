const mergeObject = [(acc, [key, value]) => ({ ...acc, [key]: value }), {}];

const stripRecursive = (thing, rejectKeys) => {
  if(typeof thing === 'object' && Array.isArray(thing)) {
    return thing.map((subThing) => stripRecursive(subThing, rejectKeys));
  }

  if(typeof thing === 'object' && thing) {
    return Object.entries(thing)
    .filter(([key]) => !rejectKeys.includes(key))
    .map(([key, value]) => [key, stripRecursive(value, rejectKeys)])
    .reduce(...mergeObject);
  }

  return thing;
};

module.exports = stripRecursive;