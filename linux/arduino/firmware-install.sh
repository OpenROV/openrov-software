#!/bin/sh
DIR="`dirname \"$0\"`"

echo unpacking $1
TMPDIR=`$DIR/firmware-unpack.sh $1` 
echo unpacked $1 into folder $TMPDIR

echo compilling in $TMPDIR
BUILD=$DIR/firmware-build.sh $TMPDIR
echo compilled in $TMPDIR

echo uploading firmware from $TMPDIR
UPLOAD=$DIR/firmware-upload.sh $TMPDIR
echo uploded firmware
