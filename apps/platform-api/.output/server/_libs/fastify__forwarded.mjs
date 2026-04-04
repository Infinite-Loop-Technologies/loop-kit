import { t as __commonJSMin } from "../_runtime.mjs";
//#region ../../node_modules/.bun/@fastify+forwarded@3.0.1/node_modules/@fastify/forwarded/index.js
/**
* forwarded
* Copyright(c) 2014-2017 Douglas Christopher Wilson
* MIT Licensed
*/
var require_forwarded = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* Get all addresses in the request used in the `X-Forwarded-For` header.
	*/
	function forwarded(req) {
		if (!req) throw new TypeError("argument req is required");
		const header = req.headers["x-forwarded-for"];
		const socketAddr = req.socket.remoteAddress;
		if (!header || typeof header !== "string") return [socketAddr];
		else if (header.indexOf(",") === -1) {
			const remote = header.trim();
			return remote.length ? [socketAddr, remote] : [socketAddr];
		} else return parse(header, socketAddr);
	}
	function parse(header, socketAddr) {
		const result = [socketAddr];
		let end = header.length;
		let start = end;
		let char;
		let i;
		for (i = end - 1; i >= 0; --i) {
			char = header[i];
			if (char === " ") start === end && (start = end = i);
			else if (char === ",") {
				start !== end && result.push(header.slice(start, end));
				start = end = i;
			} else start = i;
		}
		start !== end && result.push(header.substring(start, end));
		return result;
	}
	module.exports = forwarded;
	module.exports.default = forwarded;
	module.exports.forwarded = forwarded;
}));
//#endregion
export { require_forwarded as t };
