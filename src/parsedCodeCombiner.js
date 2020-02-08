function getDefinitionCountsBySlashCount(data) {
  const counts = data.reduce()
}

function combineData(data) {
  //Sort data by depth (number of "/" characters)
  const dataByDepth = data.sort((a, b) => {
    //Key value pairs
    const [aKey] = a;
    const [bKey] = b;

    const aCount = (aKey.match(/\//g)||[]).length;
    const bCount = (bKey.match(/\//g)||[]).length;

    return aCount - bCount;
  });

  // getDefinitionCountsBySlashCount(dataByDepth);

  const combinedData = dataByDepth.reduce((combinedData, [key, value]) => {
    // console.log(`Combining Key ${key}`);
    const splitKey = key.split("/");
    const foundData = combinedData.find(([dataKey]) => {
      const splitDataKey = dataKey.split("/");
      return splitKey.length === splitDataKey.length + 1 && splitKey.slice(0, splitKey.length - 1).every((val, index) => val === splitDataKey[index]);
    });
    if(foundData) {
      const [ foundKey, foundValue ] = foundData;
      // console.log(`Found Key ${foundKey}`);
      return [
        ...combinedData.filter(([dataKey]) => dataKey !== foundKey),
        [foundKey, {
          ...foundValue,
          [`/${splitKey[splitKey.length - 1]}`]: value,
        }],
      ];
    }
    return [
      ...combinedData,
      [key, value],
    ];
  }, []);

  return combinedData;
}

function parse(data) {
  return combineData(Object.entries(data))
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }));
}


module.exports = { parse, combineData };