---
title: FyzX Simulation Kernel Design Reference
author: Vít Falta
---

Kernel is a layer between the executing WebAssembly code and outer environment.

- Kernel is responsible for:
    - communication between a host and the WebAssembly environment
    - bootstrapping and maintenance of the WebAssembly environment
    - exporting the [The Call function](#the-call-function) to the WebAssembly environment
    - providing all [required system calls](#system-calls)

# Requirements

## The Call function

*The Call function* is present in the *sys* namespace of the import object.

*The Call function* serves as the communication API between [the Standard Library](/STD/) and the [execution kernel](#title).

*The Call function* takes arguments in the form of [host communication registers](/Simulation/environment.html#host-communication-registers).

*The Call function* returns a 4-byte word with the value according to the invoked [system call](#system-calls).

## System Calls

This is a list of system calls, that every execution kernel **must** implement to be compatible with *FyzX WebAssembly binaries*.

### Check Feature

| Register | Description    |
| -------- | -------------- |
|     1    | Feature number |
|     2    | Version number |

Check whether given version of a feature, is implemented by the execution kernel. 


### Fatal

| Register | Description    |
| -------- | -------------- |
|     1    | Message        |
|     2    | Status code    |

Immediately aborts execution of the simulation environment.
Host, is informed about the abortion with the *Message*, and the *Status code*.
