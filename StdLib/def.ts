// @ts-nocheck


/**
 * Type representing a host communication register number
 */
export type RegNum = u32
export namespace REG {
    /**
     * Register holding syscall instruction
     */
    export const INSTR: RegNum = 0;

    export const ARG1: RegNum = 1;
    export const ARG2: RegNum = 2;
    export const ARG3: RegNum = 3;
    export const ARG4: RegNum = 4;
    export const ARG5: RegNum = 5;
    export const ARG6: RegNum = 6;
}

/**
 * Type representing a system call code
 */
export type SysCall = u32
export namespace SYS_CALL {
    export const CHECK_FEATURE: SysCall = 0x00;
    export const FATAL: SysCall = 0x01;
    export const YIELD_CONTROL: SysCall = 0x02;
    export const LOG: SysCall = 0x03;

    export const SET_DEFAULT_VIDEO_BUFFER: SysCall = 0x10;
    export const SHOW_VIDEO_FRAME = 0x11;

    export const TIMER = 0x40

    export const REQUEST_TEXT_RENDER = 0x50;
    export const QUERY_TEXT_RENDER = 0x51;

    export const GET_MOUSE_POSITION = 0x60;
    export const GET_MOUSE_BUTTON_STATE = 0x61;
    export const GET_KEYBOARD_KEY_STATE = 0x62;
}

/**
 * Type representing a feature for Check Feature system call
 */
export type Feature = u32
export namespace FEATURES {
    export const IS_PRESENT: Feature = 0
}

/**
 * Type representing control codes for Yield Control syscall
 */
export type YieldControlCode = u32
export namespace YIELD_CONTROL_CODES {
    export const RESUME: YieldControlCode = 0
    export const STOP: YieldControlCode = 1
}

/**
 * Type representing status of scheduled job
 */
export type JobStatus = u32
export namespace JOB_STATUSES {
    export const DOES_NOT_EXIST: JobStatus = 0
    export const PENDING: JobStatus = 1
    export const COMPLETE: JobStatus = 2
    export const ERROR: JobStatus = 3
}


/**
 * Type representing status of a key or a button
 */
export type KeyState = u32
export namespace KeyStates {
    export const Released: KeyState = 0
    export const Pressed: KeyState = 1
}

/**
 * Type representing a mouse button number
 */
export type MouseButtonNumber = u32
export namespace MouseButtons {
    export const Left: MouseButtonNumber = 0
    export const Wheel: MouseButtonNumber = 1
    export const Right: MouseButtonNumber = 2
    export const Back: MouseButtonNumber = 3
    export const Forward: MouseButtonNumber = 4
}

/**
 * Type representing a keyboard key
 */
export type KeyboardKey = string
export namespace KeyboardKeys {
    export const Spacebar: KeyboardKey = " "
    export const Ctrl: KeyboardKey = "Control"
    export const Alt: KeyboardKey = "Alt"
    export const AltGr: KeyboardKey = "AltGraph"

    export const F1: KeyboardKey = "F1"
    export const F2: KeyboardKey = "F2"
    export const F3: KeyboardKey = "F3"
    export const F4: KeyboardKey = "F4"
    export const F5: KeyboardKey = "F5"
    export const F6: KeyboardKey = "F6"
    export const F7: KeyboardKey = "F7"
    export const F8: KeyboardKey = "F8"
    export const F9: KeyboardKey = "F9"
    export const F10: KeyboardKey = "F10"
    export const F11: KeyboardKey = "F11"
    export const F12: KeyboardKey = "F12"
}
