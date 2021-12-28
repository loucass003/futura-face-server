/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/context-brige/ipc.ts":
/*!**********************************!*\
  !*** ./src/context-brige/ipc.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"ipcRenderer\": () => (/* binding */ ipcRenderer)\n/* harmony export */ });\n/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! electron */ \"electron\");\n/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(electron__WEBPACK_IMPORTED_MODULE_0__);\n\r\nconst ipcRenderer = (electron__WEBPACK_IMPORTED_MODULE_0___default().ipcRenderer);\r\n\r\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvY29udGV4dC1icmlnZS9pcGMudHMuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQ2dDO0FBSWhDLE1BQU0sV0FBVyxHQUFxQyw2REFBb0IsQ0FBQztBQUV0RCIsInNvdXJjZXMiOlsid2VicGFjazovL2Z1dHVyYS1mYWNlLXNlcnZlci8uL3NyYy9jb250ZXh0LWJyaWdlL2lwYy50cz8yZjQyIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEZ1dHVyYUZhY2VUcmFja2VyIH0gZnJvbSBcIi4vRnV0dXJhRmFjZVRyYWNrZXJcIjtcclxuaW1wb3J0IGVsZWN0cm9uIGZyb20gJ2VsZWN0cm9uJztcclxuaW1wb3J0IHsgU3RyaWN0SXBjTWFpbiwgU3RyaWN0SXBjUmVuZGVyZXIgfSBmcm9tIFwidHlwZXNhZmUtaXBjXCI7XHJcbmltcG9ydCB7IElwY0NoYW5uZWxNYXAgfSBmcm9tIFwiLi4vaXBjVHlwZXNcIjtcclxuXHJcbmNvbnN0IGlwY1JlbmRlcmVyOiBTdHJpY3RJcGNSZW5kZXJlcjxJcGNDaGFubmVsTWFwPiA9IGVsZWN0cm9uLmlwY1JlbmRlcmVyO1xyXG5cclxuZXhwb3J0IHtpcGNSZW5kZXJlcn07Il0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./src/context-brige/ipc.ts\n");

/***/ }),

/***/ "./src/preload.ts":
/*!************************!*\
  !*** ./src/preload.ts ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! electron */ \"electron\");\n/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(electron__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _context_brige_ipc__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./context-brige/ipc */ \"./src/context-brige/ipc.ts\");\n\r\n\r\nelectron__WEBPACK_IMPORTED_MODULE_0__.contextBridge.exposeInMainWorld('nativeAPI', {\r\n    send: (channel, payload) => {\r\n        _context_brige_ipc__WEBPACK_IMPORTED_MODULE_1__.ipcRenderer.send(channel, payload);\r\n    },\r\n    on: (channel, func) => {\r\n        _context_brige_ipc__WEBPACK_IMPORTED_MODULE_1__.ipcRenderer.on(channel, (event, data) => {\r\n            func(event, data);\r\n        });\r\n    },\r\n    removeListener: (channel, func) => {\r\n        _context_brige_ipc__WEBPACK_IMPORTED_MODULE_1__.ipcRenderer.off(channel, (event, data) => {\r\n            func(event, data);\r\n        });\r\n    }\r\n});\r\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvcHJlbG9hZC50cy5qcyIsIm1hcHBpbmdzIjoiOzs7O0FBQXlDO0FBQ1U7QUFFbkQscUVBQStCLENBQUMsV0FBVyxFQUFFO0lBQ3pDLElBQUksRUFBRSxDQUFDLE9BQVksRUFBRSxPQUFZLEVBQUUsRUFBRTtRQUNqQyxnRUFBZ0IsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDdkMsQ0FBQztJQUNELEVBQUUsRUFBRSxDQUFDLE9BQVksRUFBRSxJQUFTLEVBQUUsRUFBRTtRQUM1Qiw4REFBYyxDQUFDLE9BQU8sRUFBRSxDQUFDLEtBQVUsRUFBRSxJQUFTLEVBQUUsRUFBRTtZQUM5QyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3RCLENBQUMsQ0FBQztJQUNOLENBQUM7SUFDRCxjQUFjLEVBQUUsQ0FBQyxPQUFZLEVBQUUsSUFBUyxFQUFFLEVBQUU7UUFDeEMsK0RBQWUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxLQUFVLEVBQUUsSUFBUyxFQUFFLEVBQUU7WUFDL0MsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztRQUN0QixDQUFDLENBQUM7SUFDTixDQUFDO0NBQ0osQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL2Z1dHVyYS1mYWNlLXNlcnZlci8uL3NyYy9wcmVsb2FkLnRzPzA1NmEiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgY29udGV4dEJyaWRnZSB9IGZyb20gJ2VsZWN0cm9uJztcclxuaW1wb3J0IHsgaXBjUmVuZGVyZXIsICB9IGZyb20gJy4vY29udGV4dC1icmlnZS9pcGMnXHJcblxyXG5jb250ZXh0QnJpZGdlLmV4cG9zZUluTWFpbldvcmxkKCduYXRpdmVBUEknLCB7XHJcbiAgICBzZW5kOiAoY2hhbm5lbDogYW55LCBwYXlsb2FkOiBhbnkpID0+IHtcclxuICAgICAgICBpcGNSZW5kZXJlci5zZW5kKGNoYW5uZWwsIHBheWxvYWQpO1xyXG4gICAgfSxcclxuICAgIG9uOiAoY2hhbm5lbDogYW55LCBmdW5jOiBhbnkpID0+ICB7XHJcbiAgICAgICAgaXBjUmVuZGVyZXIub24oY2hhbm5lbCwgKGV2ZW50OiBhbnksIGRhdGE6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICBmdW5jKGV2ZW50LCBkYXRhKTtcclxuICAgICAgICB9KVxyXG4gICAgfSxcclxuICAgIHJlbW92ZUxpc3RlbmVyOiAoY2hhbm5lbDogYW55LCBmdW5jOiBhbnkpID0+ICB7XHJcbiAgICAgICAgaXBjUmVuZGVyZXIub2ZmKGNoYW5uZWwsIChldmVudDogYW55LCBkYXRhOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgZnVuYyhldmVudCwgZGF0YSk7XHJcbiAgICAgICAgfSlcclxuICAgIH1cclxufSkiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./src/preload.ts\n");

/***/ }),

/***/ "electron":
/*!***************************!*\
  !*** external "electron" ***!
  \***************************/
/***/ ((module) => {

module.exports = require("electron");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval-source-map devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/preload.ts");
/******/ 	
/******/ })()
;