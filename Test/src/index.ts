import SingleWorkerKernel from "./SingleWorker/Kernel";

let kernel: SingleWorkerKernel;
let wasm: ArrayBuffer;

(async function() {
    kernel = new SingleWorkerKernel()

    wasm = await fetch("wasm/optimized.wasm").then(res => res.arrayBuffer())

    kernel.mount("sim")
    kernel.showControls()

    await kernel.init(wasm)
})()


