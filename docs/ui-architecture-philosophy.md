This document is intended to give a developer background on why we have made some of the techncial decsisions that we have.

## Its Web Based ##
Goals: 
* ACE
* Easy for developers to hack

Benefits that we enjoy:
* Users can run all of the primary use cases of the ROV without needing to install any software.  It just works.
* Technology is one of the most widely understood in the world: HTML, CSS and Javascript
* Rich library of pre-built functionality and modules.
* Massively large device reach. The web runs everywhere.

## Its Modular ##
Goals: 
* Easy for developers to hack
* Minimize testing

Benefits that we enjoy:
* Easier to GROK the code as a developer sees the functionality start and stop with well defined interfaces
* Safer to hack as side-effects from hacking are limited to the module that was hacked
* Faster to test, we only have to test the module(s) that were changed
* Easier to make large scale changes, we can roll them out one module at a time

## It only runs on the latest browsers ##
Goals:
* Capable system that can harnest the full power of the topside hardware
* Minimize support costs

Benefits that we enjoy:
* Resonable computational capability with any other platform that might be used
* We avoid the whole legacy browser issue

