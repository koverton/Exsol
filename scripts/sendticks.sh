#!/bin/bash
cd `dirname $0`

sdkperf_java.sh -cip=localhost -ptl=topic/string -mn=100 -pal=`pwd`/tick.json -mr=1

