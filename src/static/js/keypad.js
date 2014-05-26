var KEYS = {};
var KeyPad = function () {
  var kp = this;
  var processKeys = true;
  function isFunction(functionToCheck) {
    var getType = {};
    return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
  }
  $(window).keydown(function (evt) {
    var info = KEYS[evt.keyCode];
    if (!info || !processKeys)
      return;
    evt.preventDefault();
    if (isFunction(info.keydown)) {
      info.keydown();
    }
  });
  $(window).keyup(function (evt) {
    var info = KEYS[evt.keyCode];
    if (!info || !processKeys)
      return;
    evt.preventDefault();
    if (isFunction(info.keyup)) {
      info.keyup();
    }
  });
  kp.bindKeys = function () {
    processKeys = true;
  };
  kp.unbindKeys = function () {
    processKeys = false;
  };
  return kp;
};
var keyboardHandler = new KeyPad();