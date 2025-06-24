global.listeners = [];

function addListener(condition, action) {
  global.listeners.push({ condition, action });
}

module.exports = { addListener };
