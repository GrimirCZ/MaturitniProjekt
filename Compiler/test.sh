#!/bin/env bash

yarn run compile

for file in Target/*
do 
yarn run nearley-test -i "$(cat $file)" -s main Parser/grammar.js
done