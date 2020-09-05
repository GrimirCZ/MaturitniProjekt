#!/bin/env bash

yarn run compile

echo $(pwd)


truncate -s 0 unparse.txt

for i in {1..20}
do 
     yarn run nearley-unparse -s main -d 200 Parser/grammar.js -o unparse.txt.temp
     echo "" >> unparse.txt
     cat unparse.txt.temp >> unparse.txt
     echo "" >> unparse.txt
done

rm unparse.txt.temp