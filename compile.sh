#!/usr/bin/env bash

cd Asc/
yarn run asbuild:optimized &

cd ../Test/
exec yarn run build:dev
