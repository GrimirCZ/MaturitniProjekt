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
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/worker-loader/dist/cjs.js?name=[name].js!./src/SingleWorker/Worker.ts":
/*!********************************************************************************************!*\
  !*** ./node_modules/worker-loader/dist/cjs.js?name=[name].js!./src/SingleWorker/Worker.ts ***!
  \********************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("module.exports = function() {\n  return new Worker(__webpack_require__.p + \"Worker.js\");\n};\n\n//# sourceURL=webpack:///./src/SingleWorker/Worker.ts?./node_modules/worker-loader/dist/cjs.js?name=%5Bname%5D.js");

/***/ }),

/***/ "./src/SingleWorker/Kernel.ts":
/*!************************************!*\
  !*** ./src/SingleWorker/Kernel.ts ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\n// @ts-ignore\nconst Worker = __webpack_require__(/*! worker-loader?name=[name].js!./Worker */ \"./node_modules/worker-loader/dist/cjs.js?name=[name].js!./src/SingleWorker/Worker.ts\");\nconst helpers_1 = __webpack_require__(/*! ../helpers */ \"./src/helpers.ts\");\nclass SingleWorkerKernel {\n    constructor() {\n        this.on_done_message_handler = helpers_1.nofunc;\n        this.prepImgData = (imgBuf) => {\n            this.video_img_data = new ImageData(imgBuf, this.video_output_width, this.video_output_height);\n        };\n        this.render = () => {\n            requestAnimationFrame(this.render); // schedule next repaint\n            if (!this.video_output_ctx || !this.video_img_data) {\n                return;\n            }\n            this.video_output_ctx.putImageData(this.video_img_data, 0, 0);\n        };\n        this.confVideoOutput = ({ width, height }) => {\n            this.video_output_height = height;\n            this.video_output_width = width;\n            this.video_output_canvas.height = height;\n            this.video_output_canvas.width = width;\n        };\n        this.handleTextRenderJob = ({ id, text, font, width, height }) => {\n            const canvas = document.createElement(\"canvas\");\n            canvas.width = width;\n            canvas.height = height;\n            const ctx = canvas.getContext(\"2d\");\n            // clear whole canvas out\n            ctx.beginPath();\n            ctx.rect(0, 0, width, height);\n            ctx.fillStyle = \"#00000000\";\n            ctx.fill();\n            ctx.fillStyle = \"black\";\n            ctx.textBaseline = \"top\";\n            ctx.font = font;\n            ctx.fillText(text, 0, 15);\n            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);\n            this.send(\"TEXT_RENDER_COMPLETE\", {\n                id,\n                data: imageData.data\n            });\n        };\n        // I used lambda to catch class context\n        this.onMessage = ({ data }) => {\n            if (data.eventType === \"DONE\")\n                this.on_done_message_handler(data);\n            else if (data.eventType === \"RENDER\")\n                this.prepImgData(data.eventData);\n            else if (data.eventType === \"CONF_VIDEO_OUTPUT\")\n                this.confVideoOutput(data.eventData);\n            else if (data.eventType === \"RENDER_TEXT\")\n                this.handleTextRenderJob(data.eventData);\n            else\n                console.log(data);\n        };\n        this.waitOnMessage = (typeToWaitOn) => {\n            return new Promise(((resolve, reject) => {\n                this.on_done_message_handler = ({ eventData }) => {\n                    if (eventData === typeToWaitOn)\n                        resolve();\n                };\n            }));\n        };\n        this.makeMouseUpDownEventHandler = (eventType) => (evt) => this.send(eventType, {\n            button: evt.button,\n        });\n        this.makeMouseEnterLeaveEventHandler = (eventType) => (evt) => this.send(eventType);\n        // TODO: add debouncing for mouse move event\n        this.makeMouseMoveEventHandler = (eventType) => (evt) => {\n            const boundingRect = evt.target.getBoundingClientRect();\n            this.send(eventType, {\n                x: Math.trunc(evt.clientX - boundingRect.left),\n                y: Math.trunc(evt.clientY - boundingRect.top),\n            });\n        };\n        this.makeKeyboardEventHandler = (eventType) => (evt) => this.send(eventType, {\n            key: evt.key,\n        });\n        this.worker = new Worker();\n        this.worker.onmessage = this.onMessage;\n        this.video_frame_time_threshold = 1000 / 24; // 24fps threshold\n        requestAnimationFrame(this.render);\n    }\n    send(message, data = {}) {\n        this.worker.postMessage({\n            eventType: message,\n            eventData: data\n        });\n    }\n    showCanvas() {\n        this.video_output_canvas = document.createElement(\"canvas\");\n        this.video_output_canvas.tabIndex = 1;\n        this.video_output_canvas.addEventListener(\"keydown\", this.makeKeyboardEventHandler(\"KEY_DOWN\"));\n        this.video_output_canvas.addEventListener(\"keyup\", this.makeKeyboardEventHandler(\"KEY_UP\"));\n        this.video_output_canvas.addEventListener(\"mousedown\", this.makeMouseUpDownEventHandler(\"MOUSE_DOWN\"));\n        this.video_output_canvas.addEventListener(\"mouseup\", this.makeMouseUpDownEventHandler(\"MOUSE_UP\"));\n        this.video_output_canvas.addEventListener(\"mouseenter\", this.makeMouseEnterLeaveEventHandler(\"MOUSE_ENTER\"));\n        this.video_output_canvas.addEventListener(\"mouseleave\", this.makeMouseEnterLeaveEventHandler(\"MOUSE_LEAVE\"));\n        this.video_output_canvas.addEventListener(\"mousemove\", this.makeMouseMoveEventHandler(\"MOUSE_MOVE\"));\n        this.video_output_ctx = this.video_output_canvas.getContext(\"2d\");\n        this.root_el.appendChild(this.video_output_canvas);\n    }\n    showControls() {\n        if (this.root_el === undefined) {\n            throw new Error(\"Root element not defined\\n\\tPlease run mount($id) first\");\n        }\n        const stopBut = document.createElement(\"button\");\n        const startBut = document.createElement(\"button\");\n        const stepBut = document.createElement(\"button\");\n        stopBut.onclick = () => this.stop();\n        stopBut.innerText = \"Stop\";\n        startBut.onclick = () => this.loop();\n        startBut.innerText = \"Start\";\n        stepBut.onclick = () => this.step();\n        stepBut.innerText = \"Step\";\n        this.root_el.appendChild(startBut);\n        this.root_el.appendChild(stopBut);\n        this.root_el.appendChild(stepBut);\n    }\n    mount(id) {\n        const target = document.getElementById(id);\n        if (target === null) {\n            throw new Error(`\\nKernel Mount error: \\n\\tElement #${id} does not exist.`);\n        }\n        this.root_el = target;\n    }\n    init(wasm) {\n        this.showCanvas();\n        this.send(\"INIT\", {\n            wasm\n        });\n        return this.waitOnMessage(\"INIT\");\n    }\n    loop() {\n        this.send(\"LOOP\");\n    }\n    stop() {\n        this.send(\"STOP\");\n    }\n    step() {\n        this.send(\"STEP\");\n    }\n}\nexports.default = SingleWorkerKernel;\n\n\n//# sourceURL=webpack:///./src/SingleWorker/Kernel.ts?");

/***/ }),

/***/ "./src/helpers.ts":
/*!************************!*\
  !*** ./src/helpers.ts ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nexports._getStr = exports.nofunc = void 0;\nexports.nofunc = () => {\n};\n/**\n * AssemblyScript loader constants\n */\nconst SIZE_OFFSET = -4;\nconst CHUNKSIZE = 1024;\n/**\n * Get string out of WebAssembly memory\n *\n * @remark\n * Copied from AssemblyScript loader project\n *\n * @param buffer - Buffer where string is stored\n * @param ptr - Pointer to the string\n */\nfunction _getStr(buffer, ptr) {\n    const U32 = new Uint32Array(buffer);\n    const U16 = new Uint16Array(buffer);\n    let length = U32[(ptr + SIZE_OFFSET) >>> 2] >>> 1;\n    let offset = ptr >>> 1;\n    if (length <= CHUNKSIZE) { // @ts-ignore\n        return String.fromCharCode.apply(String, U16.subarray(offset, offset + length));\n    }\n    const parts = [];\n    do {\n        const last = U16[offset + CHUNKSIZE - 1];\n        const size = last >= 0xD800 && last < 0xDC00 ? CHUNKSIZE - 1 : CHUNKSIZE;\n        // @ts-ignore\n        parts.push(String.fromCharCode.apply(String, U16.subarray(offset, offset += size)));\n        length -= size;\n    } while (length > CHUNKSIZE);\n    // @ts-ignore\n    return parts.join(\"\") + String.fromCharCode.apply(String, U16.subarray(offset, offset + length));\n}\nexports._getStr = _getStr;\n\n\n//# sourceURL=webpack:///./src/helpers.ts?");

/***/ }),

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {\n    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }\n    return new (P || (P = Promise))(function (resolve, reject) {\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\n        function rejected(value) { try { step(generator[\"throw\"](value)); } catch (e) { reject(e); } }\n        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\n    });\n};\nObject.defineProperty(exports, \"__esModule\", { value: true });\nconst Kernel_1 = __webpack_require__(/*! ./SingleWorker/Kernel */ \"./src/SingleWorker/Kernel.ts\");\nlet kernel;\nlet wasm;\n(function () {\n    return __awaiter(this, void 0, void 0, function* () {\n        kernel = new Kernel_1.default();\n        wasm = yield fetch(\"wasm/optimized.wasm\").then(res => res.arrayBuffer());\n        kernel.mount(\"sim\");\n        kernel.showControls();\n        yield kernel.init(wasm);\n    });\n})();\n\n\n//# sourceURL=webpack:///./src/index.ts?");

/***/ })

/******/ });