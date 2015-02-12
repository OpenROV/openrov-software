#!/bin/bash
set -e
# from: http://www.tomaz.me/2013/12/02/running-travis-ci-tests-on-arm.html
# Based on a test script from avsm/ocaml repo https://github.com/avsm/ocaml

CHROOT_DIR=/tmp/arm-chroot
MIRROR=http://s3.armhf.com/dist/bone/debian-wheezy-7.5-rootfs-3.14.4.1-bone-armhf.com.tar.xz
VERSION=wheezy
CHROOT_ARCH=armhf

# Debian package dependencies for the host
HOST_DEPENDENCIES="debootstrap qemu qemu-user-static binfmt-support sbuild"

# Debian package dependencies for the chrooted environment
GUEST_DEPENDENCIES="pv"

# Command used to run the tests
TEST_COMMAND="uname -a"

function setup_arm_chroot {
  # Host dependencies
  sudo apt-get update
  sudo apt-get install -qq -y ${HOST_DEPENDENCIES}

  # Create chrooted environment
  sudo mkdir -p ${CHROOT_DIR}
  wget  ${MIRROR}
  sudo tar xf debian-wheezy-7.5-rootfs-3.14.4.1-bone-armhf.com.tar.xz -C ${CHROOT_DIR}

  # Create file with environment variables which will be used inside chrooted
  # environment
  echo "export ARCH=${ARCH}" > envvars.sh
  echo "export TRAVIS_BUILD_DIR=${TRAVIS_BUILD_DIR}" >> envvars.sh
  chmod a+x envvars.sh

  # Install dependencies inside chroot
  wget https://github.com/OpenROV/openrov-image/blob/v2.5.1-rc1/contrib/qemu-arm-static.gz?raw=true


  # Load a known good version of qemu-arm-static
  sudo cp qemu-arm-static.gz?raw=true ${CHROOT_DIR}/usr/bin/qemu-arm-static.gz
  sudo gunzip ${CHROOT_DIR}/usr/bin/qemu-arm-static.gz
  sudo chmod +x ${CHROOT_DIR}/usr/bin/qemu-arm-static
  sudo cp /etc/hosts ${CHROOT_DIR}/etc/
  #  sudo chroot ${CHROOT_DIR} apt-get update
  #  sudo chroot ${CHROOT_DIR} apt-get --allow-unauthenticated install \
  #      -qq -y ${GUEST_DEPENDENCIES}

  # Create build dir and copy travis build files to our chroot environment
  sudo mkdir -p ${CHROOT_DIR}/${TRAVIS_BUILD_DIR}
  sudo rsync -a ${TRAVIS_BUILD_DIR}/ ${CHROOT_DIR}/${TRAVIS_BUILD_DIR}/

  sudo mount -o bind /proc ${CHROOT_DIR}/proc

  # Indicate chroot environment has been set up
  sudo touch ${CHROOT_DIR}/.chroot_is_done

  # Call ourselves again which will cause tests to run
  sudo chroot ${CHROOT_DIR} bash -c "cd ${TRAVIS_BUILD_DIR} && ./.travis-ci.sh"
}

if [ -e "/.chroot_is_done" ]; then
  # We are inside ARM chroot
  echo "Running inside chrooted environment"

  . ./envvars.sh
  env
  echo "Building..."
  echo "Environment: $(uname -a)"
  bash -ex ./payload.sh
else
  if [ "${ARCH}" = "arm" ]; then
    # ARM test run, need to set up chrooted environment first
    #    env
    echo '-----------------------'
    echo "Setting up chrooted ARM environment"
    setup_arm_chroot
  fi
fi

${TEST_COMMAND}
