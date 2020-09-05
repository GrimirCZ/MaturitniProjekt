/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./node_modules/ts-loader/index.js!./src/SingleWorker/Worker.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/ts-loader/index.js!./src/SingleWorker/Worker.ts":
/*!*************************************************************!*\
  !*** ./node_modules/ts-loader!./src/Kernel/Worker.ts ***!
  \*************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {\n    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }\n    return new (P || (P = Promise))(function (resolve, reject) {\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\n        function rejected(value) { try { step(generator[\"throw\"](value)); } catch (e) { reject(e); } }\n        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\n    });\n};\nObject.defineProperty(exports, \"__esModule\", { value: true });\nconst asyncify_1 = __webpack_require__(/*! ../asyncify */ \"./src/asyncify.ts\");\nconst helpers_1 = __webpack_require__(/*! ../helpers */ \"./src/helpers.ts\");\nconst ctx = self;\nlet wasmModule;\nlet videoBufferPtr;\nlet videoWidth;\nlet videoHeight;\n/**\n * Whether the application is currently in a yielded state or not\n */\nlet yielded = false;\nlet isRunning = false;\nlet timers = new Map();\nlet pressedKeys = new Set();\nlet mouseIsOver = false;\nlet mouseX = 0;\nlet mouseY = 0;\nlet pressedMouseButtons = new Set();\n/**\n * Whether to use OffscreenCanvas for text rendering or canvas in master thread\n */\nconst LOCAL_TEXT_RENDERING_ENABLED = self[\"OffscreenCanvas\"] !== undefined;\nlet textRenderingJobs = new Map();\n/**\n * How long is text render job going to be retained\n */\nconst DEFAULT_TEXT_RENDER_TTL = 250;\n/**\n * Class representing syscall information\n */\nclass SysCall {\n    constructor(mem) {\n        this.instruction = mem[0];\n        this.arg1 = mem[1];\n        this.arg2 = mem[2];\n        this.arg3 = mem[3];\n        this.arg4 = mem[4];\n        this.arg5 = mem[5];\n        this.arg6 = mem[6];\n    }\n}\n/**\n * Render text in OffscreenCanvas\n *\n * @remark\n * Use only if LOCAL_TEXT_RENDERING_ENABLED is true\n */\nconst render_text = (text, font, width, height) => {\n    const canvas = new OffscreenCanvas(width, height);\n    const ctx = canvas.getContext(\"2d\");\n    if (ctx === null) {\n        return;\n    }\n    // clear whole canvas out\n    ctx.beginPath();\n    ctx.rect(0, 0, width, height);\n    ctx.fillStyle = \"#00000000\";\n    ctx.fill();\n    ctx.fillStyle = \"black\";\n    ctx.textBaseline = \"top\";\n    ctx.font = font;\n    ctx.fillText(text, 0, 15);\n    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);\n    return imageData.data;\n};\n/**\n * Class representing an exception thrown when execution of the application is to be stopped\n */\nclass Stop {\n}\n/**\n * Class representing a exceptions from invoking the fatal syscall\n */\nclass Fatal {\n    constructor(msg) {\n        this.msg = msg;\n    }\n}\n/**\n * Job status codes\n */\nconst DOES_NOT_EXIST = 0, PENDING = 1, COMPLETE = 2, ERROR = 3;\nlet lastJobId = 0;\nconst getNextTextRenderingJobId = () => lastJobId++;\n/**\n * Instruction codes\n *\n * @type {number}\n */\nconst CHECK_FEATURE = 0x00, FATAL = 0x01, YIELD_CONTROL = 0x02, LOG = 0x03, SET_DEFAULT_VIDEO_BUFFER = 0x10, SHOW_VIDEO_FRAME = 0x11, TIMER = 0x40, REQUEST_TEXT_RENDER = 0x50, QUERY_TEXT_RENDER = 0x51, GET_MOUSE_POSITION = 0x60, GET_MOUSE_BUTTON_STATE = 0x61, GET_KEYBOARD_KEY_STATE = 0x62;\n/**\n * Function used for communication between WebAssembly and the kernel\n * @returns {number}\n */\nconst call = () => __awaiter(void 0, void 0, void 0, function* () {\n    // @ts-ignore\n    const mem = new Uint32Array(wasmModule.instance.exports.memory.buffer);\n    const sysCall = new SysCall(mem);\n    switch (sysCall.instruction) {\n        case CHECK_FEATURE:\n            console.log(sysCall);\n            break;\n        case FATAL: {\n            let msg = helpers_1._getStr(mem.buffer, sysCall.arg1);\n            throw new Fatal(`FATAL: ${msg}`);\n        }\n        case YIELD_CONTROL:\n            yielded = true;\n            yield new Promise((resolve => {\n                setTimeout(resolve);\n            }));\n            yielded = false;\n            // if application requested stop (arg1 === 1) or stop button was pressed then stop\n            if (sysCall.arg1 === 1 || !isRunning) {\n                throw new Stop();\n            }\n            break;\n        case LOG: {\n            let msg = helpers_1._getStr(mem.buffer, sysCall.arg1);\n            console.log(msg);\n            break;\n        }\n        case SET_DEFAULT_VIDEO_BUFFER:\n            videoBufferPtr = sysCall.arg1;\n            videoWidth = sysCall.arg2;\n            videoHeight = sysCall.arg3;\n            ctx.postMessage({\n                eventType: \"CONF_VIDEO_OUTPUT\",\n                eventData: {\n                    width: videoWidth,\n                    height: videoHeight\n                }\n            });\n            break;\n        case SHOW_VIDEO_FRAME:\n            let _mem = new Uint8ClampedArray(mem.buffer);\n            let videoMemoryStart = videoBufferPtr;\n            let videoMemoryEnd = videoBufferPtr + (videoWidth * videoHeight * 4);\n            ctx.postMessage({\n                eventType: \"RENDER\",\n                eventData: _mem.slice(videoMemoryStart, videoMemoryEnd)\n            });\n            break;\n        case REQUEST_TEXT_RENDER: {\n            const newId = getNextTextRenderingJobId();\n            const text = helpers_1._getStr(mem.buffer, sysCall.arg1);\n            const font = helpers_1._getStr(mem.buffer, sysCall.arg2);\n            const width = sysCall.arg3;\n            const height = sysCall.arg4;\n            if (LOCAL_TEXT_RENDERING_ENABLED) {\n                textRenderingJobs.set(newId, {\n                    data: render_text(text, font, width, height),\n                    ttl: DEFAULT_TEXT_RENDER_TTL,\n                    lastAccessTime: (new Date()).getTime()\n                });\n            }\n            else {\n                ctx.postMessage({\n                    eventType: \"RENDER_TEXT\",\n                    eventData: {\n                        id: newId,\n                        text,\n                        font,\n                        width,\n                        height\n                    }\n                });\n                textRenderingJobs.set(newId, null);\n            }\n            return newId;\n        }\n        case QUERY_TEXT_RENDER: {\n            const id = sysCall.arg1;\n            const dstPtr = sysCall.arg2;\n            if (!textRenderingJobs.has(id))\n                return DOES_NOT_EXIST;\n            const job = textRenderingJobs.get(id);\n            if (job === null)\n                return PENDING;\n            let _mem = new Uint8Array(mem.buffer);\n            for (let i = 0; i < job.data.length; i++) {\n                _mem[dstPtr + i] = job.data[i];\n            }\n            job.lastAccessTime = (new Date()).getTime();\n            return COMPLETE;\n        }\n        case TIMER:\n            const oldTime = timers.get(sysCall.arg1);\n            if (oldTime !== undefined) {\n                let newTime = (new Date()).getTime();\n                timers.set(sysCall.arg1, newTime);\n                return newTime - oldTime;\n            }\n            else {\n                timers.set(sysCall.arg1, (new Date()).getTime());\n                return 0; // if not set already, return zero\n            }\n        case GET_MOUSE_POSITION:\n            mem[1] = mouseX;\n            mem[2] = mouseY;\n            return mouseIsOver ? 1 : 0;\n        case GET_KEYBOARD_KEY_STATE:\n            let key = helpers_1._getStr(mem.buffer, sysCall.arg1);\n            return pressedKeys.has(key) ? 1 : 0;\n        case GET_MOUSE_BUTTON_STATE:\n            return pressedMouseButtons.has(sysCall.arg1) ? 1 : 0;\n        default:\n            // unknown system call, do memory dump and syscall dump\n            console.log(\"unknown call\");\n            console.log(sysCall);\n            console.log(mem);\n            break;\n    }\n    return 0;\n});\nconst imports = {\n    env: {\n        abort() {\n            throw new Error(\"ABORTED\");\n        },\n        seed() {\n            return Math.random();\n        }\n    },\n    sys: {\n        call\n    }\n};\n/**\n * Function for calling the main webassembly function\n */\nconst Loop = () => {\n    isRunning = true;\n    // @ts-ignore\n    wasmModule.instance.exports.loop().catch(e => {\n        if (!(e instanceof Stop)) {\n            console.error(e);\n            // throw e\n        }\n    });\n};\nconst Step = () => {\n    try {\n        // @ts-ignore\n        wasmModule.instance.exports.step();\n    }\n    catch (e) {\n        // if the exceptions is Stop, stop but do not rethrow\n        if (!(e instanceof Stop)) {\n            throw e;\n        }\n    }\n};\nconst Init = (wasm) => __awaiter(void 0, void 0, void 0, function* () {\n    // wasmModule = await WebAssembly.instantiate(wasm, imports);\n    wasmModule = yield asyncify_1.instantiate(wasm, imports);\n    try {\n        // @ts-ignore\n        wasmModule.instance.exports.setup();\n    }\n    catch (e) {\n        console.log(e);\n        console.log(wasmModule.instance.exports);\n        // @ts-ignore\n        console.log(wasmModule.instance.memory);\n    }\n});\nconst emitDone = (eventType) => ctx.postMessage({\n    eventType: \"DONE\",\n    eventData: eventType\n});\n// Respond to message from parent thread\nctx.onmessage = (ev) => __awaiter(void 0, void 0, void 0, function* () {\n    const { eventType, eventData } = ev.data;\n    switch (eventType) {\n        case \"INIT\":\n            yield Init(eventData.wasm);\n            emitDone(\"INIT\");\n            break;\n        case \"LOOP\":\n            // only execute if not yielded\n            if (yielded)\n                return;\n            timers.clear(); // clear all timers on start/unpause\n            Loop();\n            break;\n        case \"STOP\":\n            isRunning = false;\n            break;\n        case \"STEP\":\n            Step();\n            break;\n        case \"TEXT_RENDER_COMPLETE\":\n            textRenderingJobs.set(eventData.id, {\n                data: eventData.data,\n                ttl: DEFAULT_TEXT_RENDER_TTL,\n                lastAccessTime: (new Date()).getTime()\n            });\n            break;\n        case \"KEY_UP\":\n            pressedKeys.delete(eventData.key);\n            break;\n        case \"KEY_DOWN\":\n            pressedKeys.add(eventData.key);\n            break;\n        case \"MOUSE_ENTER\":\n            mouseIsOver = true;\n            break;\n        case \"MOUSE_LEAVE\":\n            mouseIsOver = false;\n            break;\n        case \"MOUSE_UP\":\n            pressedMouseButtons.delete(eventData.button);\n            break;\n        case \"MOUSE_DOWN\":\n            pressedMouseButtons.add(eventData.button);\n            break;\n        case \"MOUSE_MOVE\":\n            mouseX = eventData.x;\n            mouseY = eventData.y;\n            break;\n        default:\n            console.log(\"Unknown eventType\");\n            break;\n    }\n});\n\n\n//# sourceURL=webpack:///./src/Kernel/Worker.ts?./node_modules/ts-loader");

/***/ }),

/***/ "./src/asyncify.ts":
/*!*************************!*\
  !*** ./src/asyncify.ts ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n/**\n * Copyright 2019 Google Inc. All Rights Reserved.\n *\n * Licensed under the Apache License, Version 2.0 (the \"License\");\n * you may not use this file except in compliance with the License.\n * You may obtain a copy of the License at\n *\n *     http://www.apache.org/licenses/LICENSE-2.0\n *\n * Unless required by applicable law or agreed to in writing, software\n * distributed under the License is distributed on an \"AS IS\" BASIS,\n * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n * See the License for the specific language governing permissions and\n * limitations under the License.\n *\n * Changes:\n * - changed the DATA_ADDR from 16 to 256\n * - changed the DATA_END from 1024 to 2048\n * - all changes were made to comply with the used memory layout\n */\nvar __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {\n    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }\n    return new (P || (P = Promise))(function (resolve, reject) {\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\n        function rejected(value) { try { step(generator[\"throw\"](value)); } catch (e) { reject(e); } }\n        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\n    });\n};\nObject.defineProperty(exports, \"__esModule\", { value: true });\nexports.instantiateStreaming = exports.instantiate = exports.Instance = void 0;\n// @ts-nocheck\n// Put `__asyncify_data` somewhere at the start.\n// This address is pretty hand-wavy and we might want to make it configurable in future.\n// See https://github.com/WebAssembly/binaryen/blob/6371cf63687c3f638b599e086ca668c04a26cbbb/src/passes/Asyncify.cpp#L106-L113\n// for structure details.\nconst DATA_ADDR = 256;\n// Place actual data right after the descriptor (which is 2 * sizeof(i32) = 8 bytes).\nconst DATA_START = DATA_ADDR + 8;\n// End data at 1024 bytes. This is where the unused area by Clang ends and real stack / data begins.\n// Because this might differ between languages and parameters passed to wasm-ld, ideally we would\n// use `__stack_pointer` here, but, sadly, it's not exposed via exports yet.\nconst DATA_END = 2048;\nconst WRAPPED_EXPORTS = new WeakMap();\nfunction isPromise(obj) {\n    return (!!obj &&\n        (typeof obj === 'object' || typeof obj === 'function') &&\n        typeof obj.then === 'function');\n}\nfunction proxyGet(obj, transform) {\n    return new Proxy(obj, {\n        get: (obj, name) => transform(obj[name])\n    });\n}\nclass Asyncify {\n    constructor() {\n        this.state = { type: 'Loading' };\n        this.exports = null;\n    }\n    assertNoneState() {\n        if (this.state.type !== 'None') {\n            throw new Error(`Invalid async state ${this.state.type}`);\n        }\n    }\n    wrapImportFn(fn) {\n        return (...args) => {\n            if (this.state.type === 'Rewinding') {\n                let { value } = this.state;\n                this.state = { type: 'None' };\n                this.exports.asyncify_stop_rewind();\n                return value;\n            }\n            this.assertNoneState();\n            let value = fn(...args);\n            if (!isPromise(value)) {\n                return value;\n            }\n            this.exports.asyncify_start_unwind(DATA_ADDR);\n            this.state = {\n                type: 'Unwinding',\n                promise: value\n            };\n        };\n    }\n    wrapModuleImports(module) {\n        return proxyGet(module, value => {\n            if (typeof value === 'function') {\n                return this.wrapImportFn(value);\n            }\n            return value;\n        });\n    }\n    wrapImports(imports) {\n        if (imports === undefined)\n            return;\n        return proxyGet(imports, moduleImports => this.wrapModuleImports(moduleImports));\n    }\n    wrapExportFn(fn) {\n        let newExport = WRAPPED_EXPORTS.get(fn);\n        if (newExport !== undefined) {\n            return newExport;\n        }\n        newExport = (...args) => __awaiter(this, void 0, void 0, function* () {\n            this.assertNoneState();\n            let result = fn(...args);\n            while (this.state.type === 'Unwinding') {\n                let { promise } = this.state;\n                this.state = { type: 'None' };\n                this.exports.asyncify_stop_unwind();\n                let value = yield promise;\n                this.assertNoneState();\n                this.exports.asyncify_start_rewind(DATA_ADDR);\n                this.state = {\n                    type: 'Rewinding',\n                    value\n                };\n                result = fn();\n            }\n            this.assertNoneState();\n            return result;\n        });\n        WRAPPED_EXPORTS.set(fn, newExport);\n        return newExport;\n    }\n    wrapExports(exports) {\n        let newExports = Object.create(null);\n        for (let exportName in exports) {\n            let value = exports[exportName];\n            if (typeof value === 'function' && !exportName.startsWith('asyncify_')) {\n                value = this.wrapExportFn(value);\n            }\n            Object.defineProperty(newExports, exportName, {\n                enumerable: true,\n                value\n            });\n        }\n        WRAPPED_EXPORTS.set(exports, newExports);\n        return newExports;\n    }\n    init(instance, imports) {\n        const { exports } = instance;\n        const memory = exports.memory || (imports.env && imports.env.memory);\n        new Int32Array(memory.buffer, DATA_ADDR).set([DATA_START, DATA_END]);\n        this.state = { type: 'None' };\n        this.exports = this.wrapExports(exports);\n        Object.setPrototypeOf(instance, Instance.prototype);\n    }\n}\nclass Instance extends WebAssembly.Instance {\n    constructor(module, imports) {\n        let state = new Asyncify();\n        super(module, state.wrapImports(imports));\n        state.init(this, imports);\n    }\n    get exports() {\n        return WRAPPED_EXPORTS.get(super.exports);\n    }\n}\nexports.Instance = Instance;\nObject.defineProperty(Instance.prototype, 'exports', { enumerable: true });\nfunction instantiate(source, imports) {\n    return __awaiter(this, void 0, void 0, function* () {\n        let state = new Asyncify();\n        let result = yield WebAssembly.instantiate(source, state.wrapImports(imports));\n        state.init(result instanceof WebAssembly.Instance ? result : result.instance, imports);\n        return result;\n    });\n}\nexports.instantiate = instantiate;\nfunction instantiateStreaming(source, imports) {\n    return __awaiter(this, void 0, void 0, function* () {\n        let state = new Asyncify();\n        let result = yield WebAssembly.instantiateStreaming(source, state.wrapImports(imports));\n        state.init(result.instance, imports);\n        return result;\n    });\n}\nexports.instantiateStreaming = instantiateStreaming;\n\n\n//# sourceURL=webpack:///./src/asyncify.ts?");

/***/ }),

/***/ "./src/helpers.ts":
/*!************************!*\
  !*** ./src/helpers.ts ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nexports._getStr = exports.nofunc = void 0;\nexports.nofunc = () => {\n};\n/**\n * AssemblyScript loader constants\n */\nconst SIZE_OFFSET = -4;\nconst CHUNKSIZE = 1024;\n/**\n * Get string out of WebAssembly memory\n *\n * @remark\n * Copied from AssemblyScript loader project\n *\n * @param buffer - Buffer where string is stored\n * @param ptr - Pointer to the string\n */\nfunction _getStr(buffer, ptr) {\n    const U32 = new Uint32Array(buffer);\n    const U16 = new Uint16Array(buffer);\n    let length = U32[(ptr + SIZE_OFFSET) >>> 2] >>> 1;\n    let offset = ptr >>> 1;\n    if (length <= CHUNKSIZE) { // @ts-ignore\n        return String.fromCharCode.apply(String, U16.subarray(offset, offset + length));\n    }\n    const parts = [];\n    do {\n        const last = U16[offset + CHUNKSIZE - 1];\n        const size = last >= 0xD800 && last < 0xDC00 ? CHUNKSIZE - 1 : CHUNKSIZE;\n        // @ts-ignore\n        parts.push(String.fromCharCode.apply(String, U16.subarray(offset, offset += size)));\n        length -= size;\n    } while (length > CHUNKSIZE);\n    // @ts-ignore\n    return parts.join(\"\") + String.fromCharCode.apply(String, U16.subarray(offset, offset + length));\n}\nexports._getStr = _getStr;\n\n\n//# sourceURL=webpack:///./src/helpers.ts?");

/***/ })

/******/ });
