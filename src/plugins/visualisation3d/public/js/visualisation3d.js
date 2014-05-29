(function (window, $, undefined) {
  'use strict';
  var Visualisation3d;
  Visualisation3d = function Example(cockpit) {
    console.log('Loading visualisation3d plugin in the browser.');
    // Instance variables
    this.cockpit = cockpit;
    // Add required UI elements
    $('#navtoolbar').prepend('<div id="example" class="label label-success">[example]</div>');
    $('#video-container').prepend('<canvas class="hud" id="renderCanvas"></canvas>');

    var canvas = document.getElementById("renderCanvas");
    console.log("1");
    var engine = new BABYLON.Engine(canvas, true);
    console.log("2");
    console.log(engine);
    var scene = new BABYLON.Scene(engine);

    this.rotation_x = .3;
    this.rotation_y = 0;
    this.rotation_z = 0;

    self = this;

    this.cockpit.socket.on('navdata', function (data) {
      if (!jQuery.isEmptyObject(data)) {
        self.rotation_x = data.roll;
        self.rotation_y = data.pitch;
        self.rotation_z = data.yaw;
      }
    });

    self.runScript(scene, canvas);

    engine.runRenderLoop(function () {
      scene.render();
    });

  };

  Visualisation3d.prototype.runScript =  function runScript(scene, canvas) {
    // Create a rotating camera
    var camera = new BABYLON.ArcRotateCamera("Camera", 0, Math.PI / 2, 12, BABYLON.Vector3.Zero(), scene);

    // Attach it to handle user inputs (keyboard, mouse, touch)
    camera.attachControl(canvas, false);

    // Add a light
    var light = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 1, 0), scene);

    // Create a builtin shape
    var knot = BABYLON.Mesh.CreateBox("mesh", 4, scene);

    knot.scaling.z = 2;

    // Define a simple material
    var material = new BABYLON.StandardMaterial("std", scene);
    material.diffuseColor = new BABYLON.Color3(0.5, 0, 0.5);

    knot.material = material;

    scene.clearColor = new BABYLON.Color4(0,0,0,0.0000000000000001);
    var self = this;
    scene.registerBeforeRender(function(){
        knot.rotation.x = self.rotation_x;
        knot.rotation.y = self.rotation_y;
        knot.rotation.z = self.rotation_z;
    })
  };

  //uncomment the line below to enable the plugin!
  //window.Cockpit.plugins.push(Visualisation3d);
}(window, jQuery));
