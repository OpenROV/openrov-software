//This is the support file for the /views/index.ejs
$(function () {
  if (window.io == undefined) {
    console.warn && console.warn("! detected no socket found !");
    var mysocket = function () {
    };
    mysocket.prototype.emit = function (x) {
      console.log(x);
    };
    mysocket.prototype.emit = function (x, y) {
      console.log(x);
      console.log(y);
    };
    simevents = {};
    mysocket.prototype.on = function (x, y) {
      console.log('registering ' + x);
      if (simevents[x] == undefined) {
        simevents[x] = [];
      }
      simevents[x].push(y);
    };
    var io = new mysocket();
    var socket = new mysocket();
    CONFIG = {};
    CONFIG.sample_freq = 20;
  } else {
    var socket = window.io.connect();
  }
  /* ------------------------------------------
       diagnostic
       */
  //var options = {};
  //$('#show-diagnostic').click(function () {
  //  $('#diagnostic').show('fold');
  //  cockpit.sendUpdateEnabled = false;
  //  Mousetrap.bind('esc', hideDiagnostic);
  //});
  //$('#diagnostic .back-button').click(function () {
  //  hideDiagnostic();
  //});
  //function hideDiagnostic() {
  //  $('#diagnostic').hide('fold');
  //  cockpit.sendUpdateEnabled = true;
  //  Mousetrap.unbind('esc');
  //}
  $('#zero_depth').click(function () {
    socket.emit('depth_zero');
  });
  $('#callibrate_compass').click(function () {
    socket.emit('compass_callibrate');
  });
  //plugin hooks
  var cockpit = new Cockpit(socket);
  $('#keyboardInstructions').append('<p><i>\\</i> to toggle heads up display</p>');
  cockpit.emit('inputController.register', {
    name: 'main.toggleHeadsUpDisplay',
    description: 'Toggle the heads-up-display on/off',
    defaults: { keyboard: '\\' },
    down: function () {
      $('.hud').toggleClass('hidden');
    }
  });
  window.cockpit = cockpit;
});
//We have a contract for centralizing all keyboad instructions. This code
//wires that content to where we display it in a popover.
$('#keyboardpopover').hover(function () {
  $('#keyboardpopover').attr('data-content', $('#keyboardInstructions').html());
});
$('[rel=\'popover\']').popover();
