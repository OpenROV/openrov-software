/*
 * Description:
 * This program takes a folder (with trailing /) as an argument to determine where to store images.
 * Then, it enters an infinite loop, until it receives 'exit' as input, where the input is a file
 * name including extension (i.e.: 03.15.39.106.jpg).  Then it captures an image and saves it with
 * the given file name in the given location.
 */

#include "cv.h"
#include "highgui.h"
#include <iostream>

using namespace cv;

int main(int argc, char* argv[]){

  // Initialize with folder to save to as argument
  // ./capture 01-01-12/
  string directory = ""; //expecting a full (non-relative) path
  if (argc > 1) directory = argv[1];
  else return -1;

  VideoCapture cap(0);

  cap.set(CV_CAP_PROP_FRAME_WIDTH, 640);
  cap.set(CV_CAP_PROP_FRAME_HEIGHT, 480);

  if (!cap.isOpened()) return -1;

  // respond with success
  std::cout << directory << std::endl;

  std::string fileName;
  Mat frame;

  // run until input -> 'exit'
  for (;;){
    std::cin >> fileName;  // full path to file to write to (including extension)

    if (fileName == "exit") break;

    cap >> frame;
    string output = fileName;
    imwrite(output, frame);

    std::cout << fileName;  // respond with file name, signifies save finished (causes emitter to respond)
  }

  return 0;
}

