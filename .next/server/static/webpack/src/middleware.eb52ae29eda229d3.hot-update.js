"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
self["webpackHotUpdate_N_E"]("src/middleware",{

/***/ "(middleware)/./src/middleware.ts":
/*!***************************!*\
  !*** ./src/middleware.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   config: () => (/* binding */ config),\n/* harmony export */   middleware: () => (/* binding */ middleware)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(middleware)/./node_modules/next/dist/esm/api/server.js\");\n\nasync function middleware(request) {\n    // 🔓 DUMMY MODE: All auth disabled for local development\n    // Redirect root to dashboard\n    if (request.nextUrl.pathname === \"/\") {\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.redirect(new URL(\"/dashboard\", request.url));\n    }\n    // Allow all routes through\n    return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.next({\n        request\n    });\n}\nconst config = {\n    matcher: [\n        \"/((?!_next/static|_next/image|favicon.ico|.*\\\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)\"\n    ]\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKG1pZGRsZXdhcmUpLy4vc3JjL21pZGRsZXdhcmUudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQTZEO0FBRXRELGVBQWVDLFdBQVdDLE9BQW9CO0lBQ25ELHlEQUF5RDtJQUN6RCw2QkFBNkI7SUFDN0IsSUFBSUEsUUFBUUMsT0FBTyxDQUFDQyxRQUFRLEtBQUssS0FBSztRQUNwQyxPQUFPSixxREFBWUEsQ0FBQ0ssUUFBUSxDQUFDLElBQUlDLElBQUksY0FBY0osUUFBUUssR0FBRztJQUNoRTtJQUVBLDJCQUEyQjtJQUMzQixPQUFPUCxxREFBWUEsQ0FBQ1EsSUFBSSxDQUFDO1FBQUVOO0lBQVE7QUFDckM7QUFFTyxNQUFNTyxTQUFTO0lBQ3BCQyxTQUFTO1FBQUM7S0FBb0Y7QUFDaEcsRUFBRSIsInNvdXJjZXMiOlsid2VicGFjazovL19OX0UvLi9zcmMvbWlkZGxld2FyZS50cz9kMTk5Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5leHRSZXNwb25zZSwgdHlwZSBOZXh0UmVxdWVzdCB9IGZyb20gXCJuZXh0L3NlcnZlclwiO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbWlkZGxld2FyZShyZXF1ZXN0OiBOZXh0UmVxdWVzdCkge1xuICAvLyDwn5STIERVTU1ZIE1PREU6IEFsbCBhdXRoIGRpc2FibGVkIGZvciBsb2NhbCBkZXZlbG9wbWVudFxuICAvLyBSZWRpcmVjdCByb290IHRvIGRhc2hib2FyZFxuICBpZiAocmVxdWVzdC5uZXh0VXJsLnBhdGhuYW1lID09PSBcIi9cIikge1xuICAgIHJldHVybiBOZXh0UmVzcG9uc2UucmVkaXJlY3QobmV3IFVSTChcIi9kYXNoYm9hcmRcIiwgcmVxdWVzdC51cmwpKTtcbiAgfVxuXG4gIC8vIEFsbG93IGFsbCByb3V0ZXMgdGhyb3VnaFxuICByZXR1cm4gTmV4dFJlc3BvbnNlLm5leHQoeyByZXF1ZXN0IH0pO1xufVxuXG5leHBvcnQgY29uc3QgY29uZmlnID0ge1xuICBtYXRjaGVyOiBbXCIvKCg/IV9uZXh0L3N0YXRpY3xfbmV4dC9pbWFnZXxmYXZpY29uLmljb3wuKlxcXFwuKD86c3ZnfHBuZ3xqcGd8anBlZ3xnaWZ8d2VicCkkKS4qKVwiXSxcbn07XG4iXSwibmFtZXMiOlsiTmV4dFJlc3BvbnNlIiwibWlkZGxld2FyZSIsInJlcXVlc3QiLCJuZXh0VXJsIiwicGF0aG5hbWUiLCJyZWRpcmVjdCIsIlVSTCIsInVybCIsIm5leHQiLCJjb25maWciLCJtYXRjaGVyIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(middleware)/./src/middleware.ts\n");

/***/ })

});