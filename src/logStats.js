function isLoginLog(log) {
  return log && log.logType === 'ACCESS' && log.content && log.content.type === 'login';
}

function isLogoutLog(log) {
  return log && log.logType === 'ACCESS' && log.content && log.content.type === 'logout';
}

function isStartupLog(log) {
  return log && log.startup;
}

function getLogTimestamp(log) {
  return log.timestamp.timestamp;
}

function getLoginTimeData(logData) {
  const loginTimes = logData
    .filter(isLoginLog)
    .map(getLogTimestamp)
    .map(ts => ({ login: true, ts }));
  const logoutTimes = logData
    .filter(isLogoutLog)
    .map(getLogTimestamp)
    .map(ts => ({ logout: true, ts }));
  const startup = logData
    .filter(isStartupLog)
    .map(getLogTimestamp)
    .map(ts => ({ startup: true, ts }));

  const combinedTimes = [
    ...loginTimes,
    ...logoutTimes,
    ...startup,
  ].sort((a, b) => a.ts - b.ts);

  const reducedTimes = combinedTimes.reduce(({ data, count }, { startup, login, logout, ts }) => {
    const playerDelta = (login ? 1 : 0) - (logout ? 1 : 0);
    const newCount = startup ? 0 : (count + playerDelta);

    return {
      data: {
        ...data,
        [ts]: newCount,
      },
      count: newCount,
    };
  }, { data: {}, count: 0 });

  console.log(reducedTimes.data);

  return reducedTimes.data;
}

module.exports = { getLoginTimeData };