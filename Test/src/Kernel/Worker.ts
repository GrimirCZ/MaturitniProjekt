import WebAssemblyInstantiatedSource = WebAssembly.WebAssemblyInstantiatedSource;
import { instantiate } from "../asyncify"
import { _getStr } from "../helpers";

const ctx: Worker = self as any;
let wasmModule: WebAssemblyInstantiatedSource;


let videoBufferPtr: number;
let videoWidth: number;
let videoHeight: number;

/**
 * Whether the application is currently in a yielded state or not
 */
let yielded: boolean = false;
let isRunning: boolean = false;

let timers = new Map<number, number>()

let pressedKeys = new Set<string>();
let mouseIsOver: boolean = false;
let mouseX: number = 0;
let mouseY: number = 0;
let pressedMouseButtons = new Set<number>();

/**
 * Whether to use OffscreenCanvas for text rendering or canvas in master thread
 */
const LOCAL_TEXT_RENDERING_ENABLED = self["OffscreenCanvas"] !== undefined

let textRenderingJobs = new Map()
/**
 * How long is text render job going to be retained
 */
const DEFAULT_TEXT_RENDER_TTL = 250

/**
 * Class representing syscall information
 */
class SysCall {
    public instruction: number;
    public arg1: number;
    public arg2: number;
    public arg3: number;
    public arg4: number;
    public arg5: number;
    public arg6: number;

    constructor(mem: Uint32Array) {
        this.instruction = mem[0]

        this.arg1 = mem[1]
        this.arg2 = mem[2]
        this.arg3 = mem[3]
        this.arg4 = mem[4]
        this.arg5 = mem[5]
        this.arg6 = mem[6]
    }
}


/**
 * Render text in OffscreenCanvas
 *
 * @remark
 * Use only if LOCAL_TEXT_RENDERING_ENABLED is true
 */
const render_text = (text: string, font: string, width: number, height: number) => {
    const canvas = new OffscreenCanvas(width, height)

    const ctx = canvas.getContext("2d")

    if(ctx === null) {
        return
    }

    // clear whole canvas out
    ctx.beginPath();
    ctx.rect(0, 0, width, height);
    ctx.fillStyle = "#00000000";
    ctx.fill();

    ctx.fillStyle = "black";
    ctx.textBaseline = "top"
    ctx.font = font

    ctx.fillText(text, 0, 15)

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

    return imageData.data
}

/**
 * Class representing an exception thrown when execution of the application is to be stopped
 */
class Stop {
}

/**
 * Class representing a exceptions from invoking the fatal syscall
 */
class Fatal {
    constructor(public msg: string) {
    }
}

/**
 * Job status codes
 */
const DOES_NOT_EXIST = 0,
    PENDING = 1,
    COMPLETE = 2,
    ERROR = 3;

let lastJobId = 0;

const getNextTextRenderingJobId = () => lastJobId++;

/**
 * Instruction codes
 *
 * @type {number}
 */
const CHECK_FEATURE = 0x00,
    FATAL = 0x01,
    YIELD_CONTROL = 0x02,
    LOG = 0x03,

    SET_DEFAULT_VIDEO_BUFFER = 0x10,
    SHOW_VIDEO_FRAME = 0x11,

    TIMER = 0x40,

    REQUEST_TEXT_RENDER = 0x50,
    QUERY_TEXT_RENDER = 0x51,

    GET_MOUSE_POSITION = 0x60,
    GET_MOUSE_BUTTON_STATE = 0x61,
    GET_KEYBOARD_KEY_STATE = 0x62;

/**
 * Function used for communication between WebAssembly and the kernel
 * @returns {number}
 */
const call = async () => {
    // @ts-ignore
    const mem = new Uint32Array(wasmModule.instance.exports.memory.buffer);

    const sysCall = new SysCall(mem);

    switch(sysCall.instruction) {
        case CHECK_FEATURE:
            console.log(sysCall)

            break;

        case FATAL: {
            let msg = _getStr(mem.buffer, sysCall.arg1)

            throw new Fatal(`FATAL: ${msg}`)
        }


        case YIELD_CONTROL:
            yielded = true;

            await new Promise((resolve => {
                setTimeout(resolve)
            }))

            yielded = false;

            // if application requested stop (arg1 === 1) or stop button was pressed then stop
            if(sysCall.arg1 === 1 || !isRunning) {
                throw new Stop()
            }

            break

        case LOG: {
            let msg = _getStr(mem.buffer, sysCall.arg1)

            console.log(msg)

            break;
        }

        case SET_DEFAULT_VIDEO_BUFFER:
            videoBufferPtr = sysCall.arg1;
            videoWidth = sysCall.arg2;
            videoHeight = sysCall.arg3;

            ctx.postMessage({
                eventType: "CONF_VIDEO_OUTPUT",
                eventData: {
                    width: videoWidth,
                    height: videoHeight
                }
            })

            break;

        case SHOW_VIDEO_FRAME:
            let _mem = new Uint8ClampedArray(mem.buffer)

            let videoMemoryStart = videoBufferPtr;
            let videoMemoryEnd = videoBufferPtr + (videoWidth * videoHeight * 4)

            ctx.postMessage({
                eventType: "RENDER",
                eventData: _mem.slice(videoMemoryStart, videoMemoryEnd)
            })
            break

        case REQUEST_TEXT_RENDER: {
            const newId = getNextTextRenderingJobId()

            const text = _getStr(mem.buffer, sysCall.arg1)
            const font = _getStr(mem.buffer, sysCall.arg2)
            const width = sysCall.arg3
            const height = sysCall.arg4

            if(LOCAL_TEXT_RENDERING_ENABLED) {
                textRenderingJobs.set(newId, {
                    data: render_text(text, font, width, height),
                    ttl: DEFAULT_TEXT_RENDER_TTL,
                    lastAccessTime: (new Date()).getTime()
                })
            } else {
                ctx.postMessage({
                    eventType: "RENDER_TEXT",
                    eventData: {
                        id: newId,
                        text,
                        font,
                        width,
                        height
                    }
                })

                textRenderingJobs.set(newId, null)
            }

            return newId
        }

        case QUERY_TEXT_RENDER: {
            const id = sysCall.arg1
            const dstPtr = sysCall.arg2

            if(!textRenderingJobs.has(id))
                return DOES_NOT_EXIST

            const job = textRenderingJobs.get(id)

            if(job === null)
                return PENDING

            let _mem = new Uint8Array(mem.buffer)
            for(let i = 0; i < job.data.length; i++) {
                _mem[dstPtr + i] = job.data[i]
            }

            job.lastAccessTime = (new Date()).getTime()

            return COMPLETE
        }

        case TIMER:
            const oldTime = timers.get(sysCall.arg1)
            if(oldTime !== undefined) {
                let newTime = (new Date()).getTime()

                timers.set(sysCall.arg1, newTime)

                return newTime - oldTime

            } else {
                timers.set(sysCall.arg1, (new Date()).getTime())

                return 0 // if not set already, return zero
            }

        case GET_MOUSE_POSITION:
            mem[1] = mouseX;
            mem[2] = mouseY;

            return mouseIsOver ? 1 : 0

        case GET_KEYBOARD_KEY_STATE:
            let key = _getStr(mem.buffer, sysCall.arg1)

            return pressedKeys.has(key) ? 1 : 0

        case GET_MOUSE_BUTTON_STATE:
            return pressedMouseButtons.has(sysCall.arg1) ? 1 : 0

        default:
            // unknown system call, do memory dump and syscall dump
            console.log("unknown call")
            console.log(sysCall)
            console.log(mem)
            break;
    }
    return 0;
}

const imports = {
    env: {
        abort() {
            throw new Error("ABORTED");
        },
        seed() {
            return Math.random()
        }
    },
    sys: {
        call
    }
}

/**
 * Function for calling the main webassembly function
 */
const Loop = () => {
    isRunning = true;
    // @ts-ignore
    wasmModule.instance.exports.loop().catch(e => {
        if(!(e instanceof Stop)) {
            console.error(e)
            // throw e
        }
    });
}

const Step = () => {
    try {
        // @ts-ignore
        wasmModule.instance.exports.step()
    } catch(e) {
        // if the exceptions is Stop, stop but do not rethrow
        if(!(e instanceof Stop)) {
            throw e
        }
    }
}

const Init = async (wasm: ArrayBuffer) => {
    // wasmModule = await WebAssembly.instantiate(wasm, imports);
    wasmModule = await instantiate(wasm, imports);

    try {
        // @ts-ignore
        wasmModule.instance.exports.setup()
    } catch(e) {
        console.log(e)
        console.log(wasmModule.instance.exports)
        // @ts-ignore
        console.log(wasmModule.instance.memory)
    }
}

const emitDone = (eventType: string) =>
    ctx.postMessage({
        eventType: "DONE",
        eventData: eventType
    })

// Respond to message from parent thread
ctx.onmessage = async (ev) => {
    const {eventType, eventData} = ev.data;

    switch(eventType) {
        case "INIT":
            await Init(eventData.wasm);
            emitDone("INIT")
            break;

        case "LOOP":
            // only execute if not yielded
            if(yielded)
                return;

            timers.clear() // clear all timers on start/unpause
            Loop();
            break;

        case "STOP":
            isRunning = false;
            break;

        case "STEP":
            Step()
            break;

        case "TEXT_RENDER_COMPLETE":
            textRenderingJobs.set(eventData.id, {
                data: eventData.data,
                ttl: DEFAULT_TEXT_RENDER_TTL,
                lastAccessTime: (new Date()).getTime()
            })
            break;

        case "KEY_UP":
            pressedKeys.delete(eventData.key)
            break;
        case "KEY_DOWN":
            pressedKeys.add(eventData.key)
            break;

        case "MOUSE_ENTER":
            mouseIsOver = true;
            break;
        case "MOUSE_LEAVE":
            mouseIsOver = false;
            break

        case "MOUSE_UP":
            pressedMouseButtons.delete(eventData.button)
            break;
        case "MOUSE_DOWN":
            pressedMouseButtons.add(eventData.button)
            break

        case "MOUSE_MOVE":
            mouseX = eventData.x;
            mouseY = eventData.y;
            break

        default:
            console.log("Unknown eventType")
            break;
    }
};

