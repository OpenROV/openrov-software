////////////////////////////////////////////////////////////////////////////
//
//  This file is part of MPU9150Lib
//
//  Copyright (c) 2013 Pansenti, LLC
//
//  Permission is hereby granted, free of charge, to any person obtaining a copy of 
//  this software and associated documentation files (the "Software"), to deal in 
//  the Software without restriction, including without limitation the rights to use, 
//  copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the 
//  Software, and to permit persons to whom the Software is furnished to do so, 
//  subject to the following conditions:
//
//  The above copyright notice and this permission notice shall be included in all 
//  copies or substantial portions of the Software.
//
//  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, 
//  INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A 
//  PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT 
//  HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION 
//  OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE 
//  SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

#ifndef MPUVECTOR3_H_
#define MPUVECTOR3_H_

#include <Arduino.h>
#include <math.h>


#define	DEGREE_TO_RAD		(float)M_PI / 180.0f)
#define	RAD_TO_DEGREE		(180.0f / (float)M_PI)

#define VEC3_X		0										// x offset
#define VEC3_Y		1										// y offset
#define VEC3_Z		2										// z offset

typedef float MPUVector3[3];

void MPUVector3DotProduct(MPUVector3 a, MPUVector3 b, float *d);
void MPUVector3CrossProduct(MPUVector3 a, MPUVector3 b, MPUVector3 d);


#endif /* MPUVECTOR3_H_ */
