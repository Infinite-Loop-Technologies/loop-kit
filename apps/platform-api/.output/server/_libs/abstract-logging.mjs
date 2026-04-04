import { t as __commonJSMin } from "../_runtime.mjs";
//#region ../../node_modules/.bun/abstract-logging@2.0.1/node_modules/abstract-logging/index.js
var require_abstract_logging = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	function noop() {}
	const proto = {
		fatal: noop,
		error: noop,
		warn: noop,
		info: noop,
		debug: noop,
		trace: noop
	};
	Object.defineProperty(module, "exports", { get() {
		return Object.create(proto);
	} });
}));
//#endregion
export { require_abstract_logging as t };
