module.exports = function wait(delayInMilliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, delayInMilliseconds);
  });
};
