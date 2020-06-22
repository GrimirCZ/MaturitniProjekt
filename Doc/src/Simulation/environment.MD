---
title: FyzX Simulation Environment Reference
author: Vít Falta
---

This document describes all the requirements for a WebAssembly binary to be successfully executed by the FyzX Simulation System.

# Requirements

## Host communication registers

*Host communication registers* are represented by the first 16 4-byte words in the binaries address space.

*Host communication registers* are used to control [The Call function](/Kernel/design.html#the-call-function) and to communicate other information to [the execution kernel](/Kernel/design.html).

| Reg number | Purpose              |
| ---------- | -------------------- |
|      0     | Instruction register |
|    1..6    |  Argument registers  |

### Instruction Register

Contains the System Call to be executed. 

### Argument registers

*Argument registers* contain arguments for the invoked System Call.
