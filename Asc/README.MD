# Assembly Script Compiler

This folder currently contains the simulation program in the assembly folder

## How to use
1. install all dependencies
    ```
    yarn install
    ```
2. compile the assembly script program
    ```
    yarn run asbuild:optimized
    ```
3. copy *optimized.wasm* to the *dist/wasm* directory in the *Test* directory
    ```
    cp build/optimized.wasm ../Test/dist/wasm/optimized.wasm
    ```
