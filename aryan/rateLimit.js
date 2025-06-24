global.rateLimits = new Map();

function checkRateLimit(userId, commandName) {
  const now = Date.now();
  const userRateLimits = global.rateLimits.get(userId) || new Map();
  const lastExecution = userRateLimits.get(commandName) || 0;
  const cooldown = 3000;

  if (now - lastExecution < cooldown) {
    return false;
  }

  userRateLimits.set(commandName, now);
  global.rateLimits.set(userId, userRateLimits);
  return true;
}

module.exports = { checkRateLimit };
