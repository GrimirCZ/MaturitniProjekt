#!/bin/env bash

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

rm Parser/grammar.js
yarn run compile

mkdir TestResults
rm -rf TestResults/*

succ=0
total=0

for file in Target/*
do 
    # clear file hash database
    hash -r

    ((total+=1))

    yarn run nearley-test -i "$(cat $file)" $1 -s main Parser/grammar.js >> TestResults/$(basename $file).result 2>error 

    retVal=$?
    if [[ $retVal -eq 0 ]] 
    then
        echo -e "${GREEN}✓ Test $file succesful${NC}"
        ((succ+=1))
    else
        echo -e "${RED}✗ Test $file failed${NC}"    
        cat error > TestResults/$(basename $file).error
    fi
done

suc_rate=$(echo "($succ * 100) / $total" | bc)
echo "${succ}/${total} tests succesful (${suc_rate}%)"

rm error