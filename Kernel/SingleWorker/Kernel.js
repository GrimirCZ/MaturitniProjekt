class SingleWorkerKernel {
    worker;

    _on_done;
    _root_el;

    _video_output_canvas;
    _video_output_ctx;
    _video_output_width;
    _video_output_height;
    _video_img_data;

    _send(type, data = {}) {
        this.worker.postMessage({
            eventType: type,
            eventData: data
        })
    }

    _prep_img_data = (imgBuf) => {
        this._video_img_data = new ImageData(imgBuf, this._video_output_width, this._video_output_height);
    }

    _render = () => { // render to canvas on browser repaint
        requestAnimationFrame(this._render) // schedule next repaint
        if (!this._video_output_ctx || !this._video_img_data) {
            return
        }

        this._video_output_ctx.putImageData(this._video_img_data, 0, 0)
    }

    _confVideoOutput = ({width, height}) => {
        this._video_output_height = height;
        this._video_output_width = width;

        this._video_output_canvas.height = height;
        this._video_output_canvas.width = width;
    }

    _handleTextRenderJob = ({id, text, font, width, height}) => {
        const canvas = document.createElement("canvas")

        canvas.width = width
        canvas.height = height

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

        this._send("TEXT_RENDER_COMPLETE", {
            id,
            data: imageData.data
        })
    }

    _onWorkerMessage = ({data}) => { // used arrow function to keep class context
        if (data.eventType === "DONE")
            this._on_done(data)
        else if (data.eventType === "RENDER")
            this._prep_img_data(data.eventData)
        else if (data.eventType === "CONF_VIDEO_OUTPUT")
            this._confVideoOutput(data.eventData)
        else if (data.eventType === "RENDER_TEXT")
            this._handleTextRenderJob(data.eventData)
        else
            console.log(data)
    }

    _waitOn(event) { // wait for done message of particular event
        return new Promise(((resolve, reject) => {
                this._on_done = ({eventData}) => {
                    if (eventData === event)
                        resolve()
                }
            }
        ))
    }

    _showCanvas() {
        this._video_output_canvas = document.createElement("canvas")

        this._video_output_ctx = this._video_output_canvas.getContext("2d")

        this._root_el.appendChild(this._video_output_canvas)
    }

    constructor(relativeUrl) {
        this.worker = new Worker(`${relativeUrl}Worker.js`);
        this.worker.onmessage = this._onWorkerMessage
        this._video_frame_time_threshold = 1000 / 24 // 24fps threshold

        requestAnimationFrame(this._render)
    }

    mount(id) {
        const target = document.getElementById(id);

        if (target === null) {
            throw new Error(`\nKernel Mount error: \n\tElement #${id} does not exist.`)
        }

        this._root_el = target
    }


    showControls() {
        const stopBut = document.createElement("button")
        const startBut = document.createElement("button")
        const stepBut = document.createElement("button")

        stopBut.onclick = () => this.stop()
        stopBut.innerText = "Stop"

        startBut.onclick = () => this.loop()
        startBut.innerText = "Start"

        stepBut.onclick = () => this.step()
        stepBut.innerText = "Step"

        this._root_el.appendChild(startBut)
        this._root_el.appendChild(stopBut)
        this._root_el.appendChild(stepBut)
    }

    init(wasm) {
        this._showCanvas()

        this._send("INIT", {
            wasm
        })

        return this._waitOn("INIT")
    }

    loop() {
        this._send("LOOP")
    }

    stop() {
        this._send("STOP")
    }

    step() {
        this._send("STEP")
    }
}
