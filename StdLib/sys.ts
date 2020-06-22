// @ts-nocheck

import {
    SYS_CALL,
    Feature,
    REG,
    RegNum,
    YieldControlCode,
    YIELD_CONTROL_CODES,
    JobStatus,
    KeyState,
    KeyboardKey
} from "./def";

/**
 * Invoke host environment to execute action according to host communication registers
 *
 * @ignore
 */
@external("sys", "call")
declare function call(): usize


/**
 * Sets host communication register to value *val*
 *
 * @category Register Manipulation
 *
 * @remark
 * If *reg* is not a valid register number, execution of the program is aborted
 *
 * @param reg - number of register to set
 * @param val - value to set to the register
 *
 * @internal
 * */
@inline
function set_reg(reg: RegNum, val: u32): void {
    assert(reg < 16)

    store<u32>(reg * 4, val);
}


/**
 * Get host communication register
 *
 * @category Register Manipulation
 *
 * @remark
 * If *reg* is not a valid register number, execution of the program is aborted
 *
 * @param reg - number of register
 *
 * @internal
 * */
@inline
function get_reg(reg: RegNum): u32 {
    assert(reg < 16)

    return load<u32>(reg * 4);
}

/**
 * Clears out all host communication registers
 *
 * @category Register Manipulation
 *
 * @internal
 */
@inline
function clr_reg(): void {
    memory.fill(0, 0, 16 * 4)
}

/**
 * Checks if current executing kernel supports given version of feature
 *
 * @category System Calls
 *
 * @param feature - Feature to check
 * @param version - Version of feature
 *
 * @returns *version* if supported, 0 if unsupported
 * */
export function check_feature(feature: Feature, version: u32 = 1): usize {
    clr_reg()

    set_reg(REG.INSTR, SYS_CALL.CHECK_FEATURE);
    set_reg(REG.ARG1, feature);
    set_reg(REG.ARG2, version);

    return call()
}

/**
 * Aborts execution of current program with message *msg*
 *
 * @category System Calls
 *
 * @param msg - String, that is going to be passed to the kernel
 *
 * @returns Never returns
 * */
export function fatal(msg: string): void {
    clr_reg()

    set_reg(REG.INSTR, SYS_CALL.FATAL)
    set_reg(REG.ARG1, changetype<u32>(msg))

    call()
}

/**
 * Releases ownership of current thread to the kernel for background task processing.
 *
 * __!!!BEWARE!!!__ execution of current program is aborted and the stack is reset
 *
 * @param controlCode - controls yield behaviour
 *
 * @category System Calls
 *
 * @returns Never returns
 * */
export function yield_control(controlCode: YieldControlCode = YIELD_CONTROL_CODES.RESUME): void {
    clr_reg()

    set_reg(REG.INSTR, SYS_CALL.YIELD_CONTROL)
    set_reg(REG.ARG1, controlCode)

    call()
}

/**
 * Log message to the environment
 *
 * @param msg - message
 *
 * @category System Calls
 */
export function log(msg: string): void {
    clr_reg()

    set_reg(REG.INSTR, SYS_CALL.LOG)
    set_reg(REG.ARG1, changetype<u32>(msg))

    call()
}

/**
 * Sets default video buffer and configures output size
 *
 * @param ptr - pointer to video buffer
 * @param width - video width
 * @param height - video height
 *
 * @category System Calls
 */
export function set_default_video_buffer(ptr: usize, width: u32, height: u32): usize {
    clr_reg()

    set_reg(REG.INSTR, SYS_CALL.SET_DEFAULT_VIDEO_BUFFER)
    set_reg(REG.ARG1, changetype<u32>(ptr))
    set_reg(REG.ARG2, width)
    set_reg(REG.ARG3, height)

    return call()
}

/**
 * Render video buffer to the screen
 *
 * @category System Calls
 */
export function show_video_frame(): usize {
    clr_reg()

    set_reg(REG.INSTR, SYS_CALL.SHOW_VIDEO_FRAME)

    return call()
}

/**
 * Used to track time between two operations
 *
 * Stores current time and returns difference in milliseconds between current time and last call to _timer_ with this __id__
 *
 * @param id - Timer ID
 *
 * @category System Calls
 *
 * @returns Difference in milliseconds or 0 if timer not set
 */
export function timer(id: u32): usize {
    clr_reg()

    set_reg(REG.INSTR, SYS_CALL.TIMER)

    return call()
}

/**
 * Request rendering of _text_ from the environment styled by the *font style string*, to buffer of _dimensions_
 *
 * @param txt - text
 * @param font_str - font style string, see canvas font field
 * @param width - dimensions
 * @param height - dimension
 *
 * @category System Calls
 *
 * @returns
 * _id_ of the created render job
 */
export function request_text_render(txt: string, font_str: string, width: u32, height: u32): usize {
    clr_reg()

    set_reg(REG.INSTR, SYS_CALL.REQUEST_TEXT_RENDER)
    set_reg(REG.ARG1, changetype<u32>(txt))
    set_reg(REG.ARG2, changetype<u32>(font_str))
    set_reg(REG.ARG3, width)
    set_reg(REG.ARG4, height)

    return call()
}

/**
 * Query status of scheduled text rendering job identified by _id_
 *
 * if JobStatus == Complete then save result to buffer pointed to by _dst_
 *
 * @param id - job id
 * @param dst - pointer to the destination
 *
 * @category System Calls
 *
 * @returns
 * Status of the job identified by _id_
 */
export function query_text_render(id: usize, dst: usize): JobStatus {
    clr_reg()

    set_reg(REG.INSTR, SYS_CALL.QUERY_TEXT_RENDER)
    set_reg(REG.ARG1, changetype<u32>(id))
    set_reg(REG.ARG2, changetype<u32>(dst))

    return <JobStatus>call()
}

/**
 * Class representing a 2D vector
 */
export class Vec2d {
    constructor(public x: i32, public y: i32) {
    }
}

/**
 * Get position of the mouse cursor relative to the top-left corner of the screen.
 *
 * @category System Calls
 *
 * @returns
 * 2D vector with the position of the mouse cursor or null if mouse not above the canvas
 */
export function get_mouse_position(): Vec2d | null {
    clr_reg()

    set_reg(REG.INSTR, SYS_CALL.GET_MOUSE_POSITION)

    return call() != 0 ? new Vec2d(get_reg(REG.ARG1), get_reg(REG.ARG2)) : null;
}


/**
 * Check state of the specified mouse button
 *
 * @param buttonNumber - number of the mouse button
 *
 * @category System Calls
 *
 * @returns
 * State of the mouse button
 */
export function get_mouse_button_state(buttonNumber: u32): KeyState {
    clr_reg()

    set_reg(REG.INSTR, SYS_CALL.GET_MOUSE_BUTTON_STATE)
    set_reg(REG.ARG1, buttonNumber)

    return <KeyState>call()
}


/**
 * Check state of the specified key
 *
 * @param key - name of the key
 *
 * @category System Calls
 *
 * @returns
 * State of the key
 */
export function get_keyboard_key_state(key: KeyboardKey): KeyState {
    clr_reg()

    set_reg(REG.INSTR, SYS_CALL.GET_KEYBOARD_KEY_STATE)
    set_reg(REG.ARG1, changetype<u32>(key))

    return <KeyState>call()
}
