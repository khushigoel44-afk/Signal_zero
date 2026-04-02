const calculateETA = (distanceKm, speedKmh) => {
  if (!speedKmh || speedKmh <= 0) {
    return Number.POSITIVE_INFINITY;
  }
  return Math.round((distanceKm / speedKmh) * 60);
};

const detectStatus = (speedHistory = []) => {
  if (!speedHistory.length) return "STOPPED";
  const avgSpeed = speedHistory.reduce((acc, s) => acc + s, 0) / speedHistory.length;
  const latest = speedHistory[speedHistory.length - 1];

  if (avgSpeed < 2 && latest < 2) return "STOPPED";
  if (latest < avgSpeed * 0.4) return "DELAYED";
  return "MOVING";
};

module.exports = { calculateETA, detectStatus };
