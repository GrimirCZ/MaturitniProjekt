let wasmModule;
let resumeTimeout;

let videoBufferPtr;
let videoWidth;
let videoHeight;

let timers = new Map()

/**
 * Whether to use OffscreenCanvas for text rendering or canvas in master thread
 */
const LOCAL_TEXT_RENDERING_ENABLED = self["OffscreenCanvas"] !== undefined

let textRenderingJobs = new Map()
/**
 * How long is text render job going to be retained
 */
const DEFAULT_TEXT_RENDER_TTL = 2500

/**
 * AssemblyScript loader constants
 */
const SIZE_OFFSET = -4;
const CHUNKSIZE = 1024;




class Yield {
    /**
     * @param shouldResume - Whether to resume execution after completing all event handlers
     */
    constructor(shouldResume) {
        this.shouldResume = shouldResume
    }
}

/**
 * Class representing a exceptions from invoking the fatal syscall
 */
class Fatal {
    constructor(msg) {
        this.msg = msg
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

const getNextTextRenderingJobId = () => lastJobId++

/**
 * Render text in OffscreenCanvas
 */
const render_text = (text, font, width, height) => {
    const canvas = new OffscreenCanvas(width, height)

    const ctx = canvas.getContext("2d")

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
 * Class representing syscall information
 */
class SysCall {
    constructor(mem) {
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
    QUERY_TEXT_RENDER = 0x51;

let echo8bit = (n, nbits) => console.log((n >> nbits) && 0xff)

/**
 * Function used for communication between WebAssembly and the kernel
 * @returns {number}
 */
const call = () => {
    const mem = new Uint32Array(wasmModule.instance.exports.memory.buffer);

    const sysCall = new SysCall(mem);

    switch (sysCall.instruction) {
        case CHECK_FEATURE:
            console.log(sysCall)

            break;

        case FATAL: {
            let msg = _getStr(mem.buffer, sysCall.arg1)

            throw new Fatal(`FATAL: ${msg}`)
        }
            break;


        case YIELD_CONTROL:
            // if arg1 == 0 then resume execution
            throw new Yield(sysCall.arg1 === 0);

        case LOG: {
            let msg = _getStr(mem.buffer, sysCall.arg1)

            console.log(msg)
        }
            break

        case SET_DEFAULT_VIDEO_BUFFER:
            videoBufferPtr = sysCall.arg1;
            videoWidth = sysCall.arg2;
            videoHeight = sysCall.arg3;

            postMessage({
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

            postMessage({
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

            if (LOCAL_TEXT_RENDERING_ENABLED) {
                textRenderingJobs.set(newId, {
                    data: render_text(text, font, width, height),
                    ttl: DEFAULT_TEXT_RENDER_TTL,
                    lastAccessTime: (new Date()).getTime()
                })
            } else {
                postMessage({
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

            if (!textRenderingJobs.has(id))
                return DOES_NOT_EXIST

            const job = textRenderingJobs.get(id)

            if (job === null)
                return PENDING

            let _mem = new Uint8Array(mem.buffer)
            for (let i = 0; i < job.data.length; i++) {
                _mem[dstPtr + i] = job.data[i]
            }

            job.lastAccessTime = (new Date()).getTime()

            return COMPLETE
        }

        case TIMER:
            if (timers.has(sysCall.arg1)) {
                let newTime = (new Date()).getTime()
                let oldTime = timers.get(sysCall.arg1)

                timers.set(sysCall.arg1, newTime)

                return newTime - oldTime

            } else {
                timers.set(sysCall.arg1, (new Date()).getTime())

                return 0 // if not set already, return zero
            }
            break;

        default:
            console.log("unknown call")
            console.log(sysCall)
            console.log(mem)
            break;
    }
    return 0;
}

/**
 * Function for calling the main webassembly function
 */
const Loop = () => {
    try {
        wasmModule.instance.exports.loop();

    } catch (e) {
        // if the exceptions is Yield,
        // schedule execution after all event handlers have run
        if (e instanceof Yield) {
            if (e.shouldResume) {
                resumeTimeout = setTimeout(() => {
                    resumeTimeout = null
                    Loop()
                })
            }
        } else {
            throw e
        }
    }
}

const Step = () => {
    try {
        wasmModule.instance.exports.step()
    } catch (e) {
        // if the exceptions is Yield, stop but do not rethrow
        if (!(e instanceof Yield)) {
            throw e
        }
    }
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

const Init = async (wasm) => {
    wasmModule = await WebAssembly.instantiate(wasm, imports);

    wasmModule.instance.exports.setup()
}

const emitDone = (eventType) =>
    postMessage({
        eventType: "DONE",
        eventData: eventType
    })

/**
 * Handle communication between main thread and worker thread
 */
onmessage = async (event) => {
    const {eventType, eventData} = event.data;


    switch (eventType) {
        case "INIT":
            await Init(eventData.wasm);
            emitDone("INIT")
            break;

        case "LOOP":
            // only execute if not started or not resuming (if resuming then typeof(resumeTimeout) === "number")
            if (typeof resumeTimeout === "number")
                return;

            timers.clear() // clear all timers on start/unpause
            Loop();
            break;

        case "STOP":
            clearTimeout(resumeTimeout) // got here via yield_control, do not resume execution
            resumeTimeout = null
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

        default:
            console.log("Unknown eventType")
            break;
    }

}
