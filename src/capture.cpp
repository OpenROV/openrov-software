/* 
 * Created for OpenROV:  www.openrov.com
 * Author:  Bran Sorem (www.bransorem.com)
 * Date: 03/19/12
 * 
 * Description:
 * This program takes a folder (with trailing /) as an argument to determine where to store images.
 * Then, it enters an infinite loop, until it receives 'exit' as input, where the input is a file
 * name including extension (i.e.: 03.15.39.106.jpg).  Then it captures an image and saves it with
 * the given file name in the given location.
 *
 * License
 * This work is licensed under the Creative Commons Attribution-ShareAlike 3.0 Unported License. 
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/3.0/ or send a 
 * letter to Creative Commons, 444 Castro Street, Suite 900, Mountain View, California, 94041, USA.
 */

#include "cv.h"
#include "highgui.h"
#include <iostream>

using namespace cv;

int main(int argc, char* argv[]){
  
  // Initialize with folder to save to as argument
  // ./capture 01-01-12/
  string file = "";
  if (argc > 1) file = argv[1];
  else return -1;

  VideoCapture cap(0);

  if (!cap.isOpened()) return -1;

  // respond with success
  std::cout << file << std::endl;

  std::string input;
  Mat frame;
  // run until input -> 'exit'
  for (;;){
    std::cin >> input;  // file name (including extension)

    if (input == "exit") break;

    cap >> frame;
    string output = file + input;
    imwrite(output, frame);
    std::cout << input;  // respond with file name, signifies save finished (causes emitter to respond)
  }

  return 0;
}
