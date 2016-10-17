
#OpenROV Software

"[OpenROV](http://openrov.com/) is a DIY telerobotics community centered around underwater exploration & adventure."

There are many projects that make up the software suites used in the OpenROV products which include the ROV (remote operated vehicles), the control system, and cloud services.

###On the ROV###
- [openrov-rov-suite](https://github.com/OpenROV/openrov-rov-suite) : Ties together the various projects in to a single distributable package.
- [openrov-cockpit](https://github.com/OpenROV/openrov-cockpit) : For piloting and ROV control
- [openrov-dashboard](https://github.com/OpenROV/openrov-dashboard) : For managing the services on the ROV
- [openrov-image-customization](https://github.com/OpenROV/openrov-image-customization) : The customizations made to the Debian image to turn it in to an ROV image
- [openrov-proxy](https://github.com/OpenROV/openrov-proxy) : A service that lets the ROV tunnel its internet connections through the connected browser
- [openrov-software-arduino](https://github.com/OpenROV/openrov-software-arduino) : The firmware for the cape and controller board used in the ROV

###Tools###
- [omap-image-builder](https://github.com/OpenROV-forks/omap-image-builder) : For generating SD card images for the ROV for BeagleBone boards
- [openrov-grunt-init-plugin](https://github.com/OpenROV/openrov-grunt-init-plugin) : For creating scaffolding to quick start development of a plugin for the openrov-cockpit.

##Related Non-Software repos##
- [openrov-hardware](https://github.com/OpenROV/openrov-hardware)
- [openrov-electronics](https://github.com/OpenROV/electronics)

##Getting latest software

If your looking for the latest stable software bundle for the ROV, it is listed on the ROV product page.
- [2.x series Mini Observation Class ROV product page](http://www.openrov.com/products/2-7.html#downloads)

If your looking for the latest development image, please refer to the [openrov-image readme.md](https://github.com/OpenROV/openrov-image/blob/master/README.md)

##Reporting issues

All **software** issues, regardless should be reported to [this repositories issue list](https://github.com/OpenROV/openrov-software/issues).

##Roadmap

* For the overal releases for the ROV software: [OpenROVSuite Roadmap](https://github.com/OpenROV/openrov-software/issues/570)

##How to Contribute##

Contributions require that you sign a [CLA](https://www.clahub.com/agreements/OpenROV/openrov-software) before the project can accept your pull requests.

For details on how to contribute please review the [Contibuting guide](https://github.com/OpenROV/openrov-rov-suite/blob/master/CONTRIBUTING.md)

License
-------

There are multiple licenses involved. Please refer to the individual projects for details.

Our intent is to provide dual licensed software that is free and hackable for non-commerical use and an option for those that do want to use it as part of a commercial offering.

Our documentation, hardware and electronics are licensed with Creative Commons licenses.

Please contact us with an issue on our [forums](https://forum.openrov.com) if you need clarification about the licenses. You can send a Private Message to @badevguru via the forum if you have questions about other licensing options.
