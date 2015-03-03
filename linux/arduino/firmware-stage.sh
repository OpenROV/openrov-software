#!/bin/sh

PROGNAME=$(basename $0)

error_exit ()
{

#	----------------------------------------------------------------
#	Function for exit due to fatal program error
#		Accepts 1 argument:
#			string containing descriptive error message
#	----------------------------------------------------------------


	echo "${PROGNAME}: ${1:-"Unknown Error"}" 1>&2
	exit 1
}

BUILDDIR=`mktemp -d`
ZIP=zip
PWD=`pwd`
ARDUINOFILE=$1

echo staging: build dir is $BUILDDIR 1>&2
cd $BUILDDIR || error_exit "Unable to change directory"
/usr/local/bin/ino init  1>&2  || error_exit "Failed to initialize the Arduino project directory. Aborting"
rm src/*.ino || error_exit "Cleaning excess project files failed. Aborting"

cd $BUILDDIR/src || error_exit "Unable to change to src folder"

cp /opt/openrov/arduino/OpenROV/* $BUILDDIR/src || error_exit "Copying files from the github src folder to the temp folder failed.  Aborting"
echo staged src in to build folder 1>&2 

echo --------------------- 1>&2
echo staging plugins 1>&2
SEARCHPATH=/opt/openrov/cockpit/


echo "#ifndef __PLUGINSCONFIG_H_" > $BUILDDIR/src/PluginConfig.h
echo "#define __PLUGINSCONFIG_H_" >> $BUILDDIR/src/PluginConfig.h

for OUTPUT in $(find $SEARCHPATH -type f -name 'ArduinoPlugin_*.h')
do

        PLUGIN_NAME=$(echo $OUTPUT | sed 's#.*ArduinoPlugin_\(.*\).h#\1#')
        PLUGIN_PATH=$(echo $OUTPUT | sed 's#\(.*\)/.*#\1#')

	mkdir $BUILDDIR/src/$PLUGIN_NAME || error_exit "Could not create plugin directory in source dir"

	cp -r $PLUGIN_PATH/* $BUILDDIR/src/$PLUGIN_NAME/ || error_exit "Could not copy plugin source code"

	echo "#include \"$PLUGIN_NAME/ArduinoPlugin_${PLUGIN_NAME}.h\"" >> $BUILDDIR/src/PluginConfig.h

	echo copied plugin \'$PLUGIN_NAME\' to $BUILDDIR/src/$PLUGIN_NAME 1>&2
done

echo "#endif" >> $BUILDDIR/src/PluginConfig.h


EXTENSION=`echo $extension | awk '{print tolower($0)}'`

echo $BUILDDIR

exit 0
