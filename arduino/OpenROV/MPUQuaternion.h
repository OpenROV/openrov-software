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

#ifndef MPUQUATERNION_H_
#define MPUQUATERNION_H_

#include <math.h>
#include "MPUVector3.h"

#define QUAT_W		0										// scalar offset
#define QUAT_X		1										// x offset
#define QUAT_Y		2										// y offset
#define QUAT_Z		3										// z offset

typedef float MPUQuaternion[4]; 

void MPUQuaternionNormalize(MPUQuaternion q);
void MPUQuaternionQuaternionToEuler(const MPUQuaternion q, MPUVector3 v);
void MPUQuaternionEulerToQuaternion(const MPUVector3 v, MPUQuaternion q);
void MPUQuaternionConjugate(const MPUQuaternion s, MPUQuaternion d);
void MPUQuaternionMultiply(const MPUQuaternion qa, const MPUQuaternion qb, MPUQuaternion qd);

inline float MPUQuaternionNorm(MPUQuaternion q)
{
  return sqrt(q[QUAT_W] * q[QUAT_W] + q[QUAT_X] * q[QUAT_X] +  
    q[QUAT_Y] * q[QUAT_Y] + q[QUAT_Z] * q[QUAT_Z]);
}


#endif /* MPUQUATERNION_H_ */
