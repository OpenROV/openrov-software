exports.mixin = function (source, destination) {
  if (typeof source == 'object') {
    for (var prop in source) {
      if (typeof source[prop] == 'object' && source[prop] instanceof Array) {
        if (destination[prop] === undefined) {
          destination[prop] = [];
        }
        for (var index = 0; index < source[prop].length; index += 1) {
          if (typeof source[prop][index] == 'object') {
            if (destination[prop][index] === undefined) {
              destination[prop][index] = {};
            }
            destination[prop].push(mixin(source[prop][index], destination[prop][index]));
          } else {
            destination[prop].push(source[prop][index]);
          }
        }
      } else if (typeof source[prop] == 'object') {
        if (destination[prop] === undefined) {
          destination[prop] = {};
        }
        mixin(source[prop], destination[prop]);
      } else {
        destination[prop] = source[prop];
      }
    }
  }
  return destination;
};