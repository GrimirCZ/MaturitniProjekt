import { loop as _loop, setup as _setup } from "./main";
import { log, timer, yield_control } from "../../StdLib/sys";

export function setup(): void {
    gc.auto = false

    _setup()
}

export function loop(): void {
    while(_loop(f64(timer(0)) / 1000)) { // pass in elapsed time for modulation
        gc.collect()
        yield_control()
    }
}

export function step(): void {
    _loop(1)

    gc.collect()
}
