// @ts-ignore
import Worker = require("worker-loader?name=[name].js!./Worker");
import { nofunc } from "../helpers";

class SingleWorkerKernel {
    private worker: Worker;
    private on_done_message_handler: (data: { eventData: string }) => void = nofunc

    private root_el: HTMLElement | undefined;

    private video_output_canvas: HTMLCanvasElement | undefined;
    private video_output_ctx: CanvasRenderingContext2D | undefined;
    private video_output_width: number | undefined;
    private video_output_height: number | undefined;
    private video_img_data: ImageData | undefined;

    private video_frame_time_threshold: number;

    private send(message: string, data: object = {}) {
        this.worker.postMessage({
            eventType: message,
            eventData: data
        })
    }

    private prepImgData = (imgBuf: Uint8ClampedArray) => {
        this.video_img_data = new ImageData(imgBuf, this.video_output_width!, this.video_output_height);
    }

    private render = () => { // render to canvas on browser repaint
        requestAnimationFrame(this.render) // schedule next repaint
        if(!this.video_output_ctx || !this.video_img_data) {
            return
        }

        this.video_output_ctx.putImageData(this.video_img_data, 0, 0)
    }

    private confVideoOutput = ({width, height}: { width: number, height: number }) => {
        this.video_output_height = height;
        this.video_output_width = width;

        this.video_output_canvas!.height = height;
        this.video_output_canvas!.width = width;
    }

    private handleTextRenderJob = ({id, text, font, width, height}: { id: number, text: string, font: string, width: number, height: number }) => {
        const canvas = document.createElement("canvas")

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext("2d")!

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

        this.send("TEXT_RENDER_COMPLETE", {
            id,
            data: imageData.data
        })
    }

    // I used lambda to catch class context
    private onMessage = ({data}: MessageEvent) => {
        if(data.eventType === "DONE")
            this.on_done_message_handler(data)
        else if(data.eventType === "RENDER")
            this.prepImgData(data.eventData)
        else if(data.eventType === "CONF_VIDEO_OUTPUT")
            this.confVideoOutput(data.eventData)
        else if(data.eventType === "RENDER_TEXT")
            this.handleTextRenderJob(data.eventData)
        else
            console.log(data)
    }

    private waitOnMessage = (typeToWaitOn: string) => {
        return new Promise(((resolve, reject) => {
            this.on_done_message_handler = ({eventData}) => {
                if(eventData === typeToWaitOn)
                    resolve()
            }
        }))
    }

    private showCanvas() {

        this.video_output_canvas = document.createElement("canvas")
        this.video_output_canvas.tabIndex = 1

        this.video_output_canvas.addEventListener("keydown", this.makeKeyboardEventHandler("KEY_DOWN"))
        this.video_output_canvas.addEventListener("keyup", this.makeKeyboardEventHandler("KEY_UP"))

        this.video_output_canvas.addEventListener("mousedown", this.makeMouseUpDownEventHandler("MOUSE_DOWN"))
        this.video_output_canvas.addEventListener("mouseup", this.makeMouseUpDownEventHandler("MOUSE_UP"))

        this.video_output_canvas.addEventListener("mouseenter", this.makeMouseEnterLeaveEventHandler("MOUSE_ENTER"))
        this.video_output_canvas.addEventListener("mouseleave", this.makeMouseEnterLeaveEventHandler("MOUSE_LEAVE"))

        this.video_output_canvas.addEventListener("mousemove", this.makeMouseMoveEventHandler("MOUSE_MOVE"))

        this.video_output_ctx = this.video_output_canvas.getContext("2d")!

        this.root_el!.appendChild(this.video_output_canvas)
    }


    makeMouseUpDownEventHandler = (eventType: string) => (evt: MouseEvent) => this.send(eventType, {
        button: evt.button,
    });
    makeMouseEnterLeaveEventHandler = (eventType: string) => (evt: MouseEvent) => this.send(eventType);
    // TODO: add debouncing for mouse move event
    makeMouseMoveEventHandler = (eventType: string) => (evt: MouseEvent) => {
        const boundingRect = (evt.target as HTMLCanvasElement).getBoundingClientRect();

        this.send(eventType, {
            x: Math.trunc(evt.clientX - boundingRect.left),
            y: Math.trunc(evt.clientY - boundingRect.top),
        });
    }
    makeKeyboardEventHandler = (eventType: string) => (evt: KeyboardEvent) => this.send(eventType, {
        key: evt.key,
    });

    constructor() {
        this.worker = new Worker()

        this.worker.onmessage = this.onMessage
        this.video_frame_time_threshold = 1000 / 24 // 24fps threshold

        requestAnimationFrame(this.render)
    }

    public showControls() {
        if(this.root_el === undefined) {
            throw new Error("Root element not defined\n\tPlease run mount($id) first")
        }

        const stopBut = document.createElement("button")
        const startBut = document.createElement("button")
        const stepBut = document.createElement("button")

        stopBut.onclick = () => this.stop()
        stopBut.innerText = "Stop"

        startBut.onclick = () => this.loop()
        startBut.innerText = "Start"

        stepBut.onclick = () => this.step()
        stepBut.innerText = "Step"

        this.root_el.appendChild(startBut)
        this.root_el.appendChild(stopBut)
        this.root_el.appendChild(stepBut)
    }

    mount(id: string) {
        const target = document.getElementById(id);

        if(target === null) {
            throw new Error(`\nKernel Mount error: \n\tElement #${id} does not exist.`)
        }

        this.root_el = target
    }

    init(wasm: ArrayBuffer) {
        this.showCanvas()

        this.send("INIT", {
            wasm
        })

        return this.waitOnMessage("INIT")
    }

    loop() {
        this.send("LOOP")
    }

    stop() {
        this.send("STOP")
    }

    step() {
        this.send("STEP")
    }

}

export default SingleWorkerKernel;

