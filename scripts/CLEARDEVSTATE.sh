#!/bin/bash

pushd ~/Library/Containers/com.microsoft.Excel/Data/Library/Caches
rm -rf *
popd
pwd
pushd ~/Library/Containers/com.microsoft.Excel/Data/Library/Application\ Support/Microsoft/Office/16.0/Wef
rm -rf *
popd
