/*
 * This is heavily based on the JS from https://github.com/bjnortier/autopilot
 * by Benjamin Nortier.
 *
 * Original License:
 *
 * Copyright (c) 2010 Benjamin Nortier
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 *
 */
(function (window, undefined) {
  'use strict';
  var AH, skyColor = '#33f', earthColor = '#992', frontCameraFovY = 70, majorWidth = 100, minorWidth = 60, zeroWidth = 200, zeroGap = 20, radialLimit = 60, tickRadius = 10, radialRadius = 178, speedIndicatorHeight = 250, speedIndicatorWidth = 60, zeroPadding = 100, speedAltOpacity = 0.2, pixelsPer10Kmph = 50, minorTicksPer10Kmph = 5, speedWarningWidth = 10, yellowBoundarySpeed = 100, redBoundarySpeed = 130, altIndicatorHeight = 250, altIndicatorWidth = 50, majorTickWidth = 10, minorTickWidth = 5, pixelsPer100Ft = 50, minorTicksPer100Ft = 5;
  AH = function AriticialHorizon(cockpit) {
    console.log('Loading Artificial Horizon plugin.');
    // Instance variables
  };


  window.Cockpit.plugins.push(AH);
}(window, undefined));