import SingleWorkerKernel from "./Kernel/Kernel";

let kernel: SingleWorkerKernel;
let wasm: ArrayBuffer;

export default async function run_kernel() {
    kernel = new SingleWorkerKernel()

    wasm = await fetch("wasm/optimized.wasm").then(res => res.arrayBuffer())

    kernel.mount("sim")
    kernel.showControls()

    await kernel.init(wasm)
}


