function msToTime(s) {
  function addZ(n) {
    return (n < 10 ? '0' : '') + n;
  }
  var ms = s % 1000;
  s = (s - ms) / 1000;
  var secs = s % 60;
  s = (s - secs) / 60;
  var mins = s % 60;
  var hrs = (s - mins) / 60;
  return addZ(hrs) + ':' + addZ(mins) + ':' + addZ(secs);  // + '.' + ms;
}