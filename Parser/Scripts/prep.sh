#!/bin/env bash

echo -e "@preprocessor typescript\n" > production
cat Grammar/grammar.ne | sed  --expression='s/const moo = require("moo");/import moo from "moo";/g' >> production

yarn run nearleyc production -o Parser/grammar.ts

rm production