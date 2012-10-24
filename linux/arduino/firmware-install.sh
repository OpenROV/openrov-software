#!/bin/sh
DIR="`dirname \"$0\"`"

TMPDIR=`$DIR/firmware-unpack.sh $1` 
$DIR/firmware-build.sh $TMPDIR
$DIR/firmware-upload.sh $TMPDIR
