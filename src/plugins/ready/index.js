
function example(name, deps) {
 
  var done = false; 
  var lastLightCmd = "";

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

 
  deps.rov.on('rovsys', function(s){
    if (! done) {
      console.log('###############################################################');
      console.log('The ROV is ready!.');
      setLight('12.5');
      done = true;
    } 
  });

  var checkId = setInterval(
     function() {
      if (! deps.rov.notSafeToControl()) {
        clearInterval(checkId);
      }
      else { 
        deps.rov.requestCapabilities();
      }
    },
    200);
}
module.exports = example;
