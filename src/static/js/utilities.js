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

// used to dynamically load plugin assets
function urlOfJsFile ( jsfile ) {
  var scriptElements = document.getElementsByTagName('script');
  var i, element, myfile;
  for( i = 0; element = scriptElements[i]; i++ ) {
    myfile = element.src;
    if( myfile.indexOf( jsfile ) >= 0 ) {
      var myurl = myfile.substring( 0, myfile.indexOf( jsfile ) );
    }
  }
  return myurl;
}

function namespace(namespaceString) {
  var parts = namespaceString.split('.'),
    parent = window,
    currentPart = '';

  for(var i = 0, length = parts.length; i < length; i++) {
    currentPart = parts[i];
    parent[currentPart] = parent[currentPart] || {};
    parent = parent[currentPart];
  }

  return parent;
}