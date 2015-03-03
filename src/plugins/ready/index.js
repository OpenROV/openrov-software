function readyAyeReady(name, deps) {
  var done = false;
  var lastLightCmd = "";

  //rovsys comes up when arduino starts
  deps.rov.on('rovsys', function(s){
    if (! done) {
      console.log('The ROV is ready!.');
      setLight('12.5');
      done = true;
    }
  });

  // send the light command initially and then cylcle through the lights
  var setLight = function(light) {
      var cmd = 'ligt(' + light + ')';
      deps.rov.send(cmd);
      var chk = setInterval(function() {
       if (lastLightCmd != cmd) {
         deps.rov.send(cmd);
       }
       else {
         clearInterval(chk);
         setTimeout(function() { deps.rov.send('ligt(24.5)')}, 500);
         setTimeout(function() { deps.rov.send('ligt(40.5)')}, 1000);
         setTimeout(function() { deps.rov.send('ligt(24.5)')}, 1500);
         setTimeout(function() { deps.rov.send('ligt(12.5)')}, 2000);
         setTimeout(function() { deps.rov.send('ligt(0)')}, 2500);
         setTimeout(function() { deps.rov.send('ligt(50)')}, 3500);
         setTimeout(function() { deps.rov.send('ligt(0)')}, 4000);
         setTimeout(function() { deps.rov.send('ligt(50)')}, 4500);
         setTimeout(function() { deps.rov.send('ligt(0)')}, 5000);
        }}, 400);
  }


  deps.rov.on('command', function(command) {
   lastLightCmd = command;
  });

}
module.exports = readyAyeReady ;
