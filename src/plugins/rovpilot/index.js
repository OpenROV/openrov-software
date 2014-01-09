function rovpilot(name, deps) {
    console.log("This is where rovpilot code would execute in the node process.");
    
    deps.io.sockets.on('connection', function (socket) {
        socket.on('escs_poweron', function(){
            deps.rov.send('escp(1)');
            console.log('escp(1) sent');
        });
        socket.on('escs_poweroff', function(){
            deps.rov.send('escp(0)');
            console.log('escp(0) sent');
        });  
        socket.on('holdHeading_toggle', function(){
            deps.rov.send('holdHeading_toggle()');
            console.log('holdHeading_toggle() sent');
        });
        socket.on('holdDepth_toggle', function(){
            deps.rov.send('holdDepth_toggle()');
            console.log('holdDepth_toggle() sent');
        });            
    });       
};

module.exports = rovpilot;
//escp