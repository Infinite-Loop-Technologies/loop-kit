import { t as __commonJSMin } from "../_runtime.mjs";
import { t as require_fast_decode_uri_component } from "./fast-decode-uri-component.mjs";
//#region ../../node_modules/.bun/fast-querystring@1.1.2/node_modules/fast-querystring/lib/parse.js
var require_parse = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const fastDecode = require_fast_decode_uri_component();
	const plusRegex = /\+/g;
	const Empty = function() {};
	Empty.prototype = Object.create(null);
	/**
	* @callback parse
	* @param {string} input
	*/
	function parse(input) {
		const result = new Empty();
		if (typeof input !== "string") return result;
		let inputLength = input.length;
		let key = "";
		let value = "";
		let startingIndex = -1;
		let equalityIndex = -1;
		let shouldDecodeKey = false;
		let shouldDecodeValue = false;
		let keyHasPlus = false;
		let valueHasPlus = false;
		let hasBothKeyValuePair = false;
		let c = 0;
		for (let i = 0; i < inputLength + 1; i++) {
			c = i !== inputLength ? input.charCodeAt(i) : 38;
			if (c === 38) {
				hasBothKeyValuePair = equalityIndex > startingIndex;
				if (!hasBothKeyValuePair) equalityIndex = i;
				key = input.slice(startingIndex + 1, equalityIndex);
				if (hasBothKeyValuePair || key.length > 0) {
					if (keyHasPlus) key = key.replace(plusRegex, " ");
					if (shouldDecodeKey) key = fastDecode(key) || key;
					if (hasBothKeyValuePair) {
						value = input.slice(equalityIndex + 1, i);
						if (valueHasPlus) value = value.replace(plusRegex, " ");
						if (shouldDecodeValue) value = fastDecode(value) || value;
					}
					const currentValue = result[key];
					if (currentValue === void 0) result[key] = value;
					else if (currentValue.pop) currentValue.push(value);
					else result[key] = [currentValue, value];
				}
				value = "";
				startingIndex = i;
				equalityIndex = i;
				shouldDecodeKey = false;
				shouldDecodeValue = false;
				keyHasPlus = false;
				valueHasPlus = false;
			} else if (c === 61) if (equalityIndex <= startingIndex) equalityIndex = i;
			else shouldDecodeValue = true;
			else if (c === 43) if (equalityIndex > startingIndex) valueHasPlus = true;
			else keyHasPlus = true;
			else if (c === 37) if (equalityIndex > startingIndex) shouldDecodeValue = true;
			else shouldDecodeKey = true;
		}
		return result;
	}
	module.exports = parse;
}));
//#endregion
//#region ../../node_modules/.bun/fast-querystring@1.1.2/node_modules/fast-querystring/lib/internals/querystring.js
var require_querystring = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const hexTable = Array.from({ length: 256 }, (_, i) => "%" + ((i < 16 ? "0" : "") + i.toString(16)).toUpperCase());
	const noEscape = new Int8Array([
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		1,
		0,
		0,
		0,
		0,
		0,
		1,
		1,
		1,
		1,
		0,
		0,
		1,
		1,
		0,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		0,
		0,
		0,
		0,
		1,
		0,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		1,
		0,
		0,
		0,
		1,
		0
	]);
	/**
	* @param {string} str
	* @returns {string}
	*/
	function encodeString(str) {
		const len = str.length;
		if (len === 0) return "";
		let out = "";
		let lastPos = 0;
		let i = 0;
		outer: for (; i < len; i++) {
			let c = str.charCodeAt(i);
			while (c < 128) {
				if (noEscape[c] !== 1) {
					if (lastPos < i) out += str.slice(lastPos, i);
					lastPos = i + 1;
					out += hexTable[c];
				}
				if (++i === len) break outer;
				c = str.charCodeAt(i);
			}
			if (lastPos < i) out += str.slice(lastPos, i);
			if (c < 2048) {
				lastPos = i + 1;
				out += hexTable[192 | c >> 6] + hexTable[128 | c & 63];
				continue;
			}
			if (c < 55296 || c >= 57344) {
				lastPos = i + 1;
				out += hexTable[224 | c >> 12] + hexTable[128 | c >> 6 & 63] + hexTable[128 | c & 63];
				continue;
			}
			++i;
			if (i >= len) throw new Error("URI malformed");
			const c2 = str.charCodeAt(i) & 1023;
			lastPos = i + 1;
			c = 65536 + ((c & 1023) << 10 | c2);
			out += hexTable[240 | c >> 18] + hexTable[128 | c >> 12 & 63] + hexTable[128 | c >> 6 & 63] + hexTable[128 | c & 63];
		}
		if (lastPos === 0) return str;
		if (lastPos < len) return out + str.slice(lastPos);
		return out;
	}
	module.exports = { encodeString };
}));
//#endregion
//#region ../../node_modules/.bun/fast-querystring@1.1.2/node_modules/fast-querystring/lib/stringify.js
var require_stringify = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { encodeString } = require_querystring();
	function getAsPrimitive(value) {
		const type = typeof value;
		if (type === "string") return encodeString(value);
		else if (type === "bigint") return value.toString();
		else if (type === "boolean") return value ? "true" : "false";
		else if (type === "number" && Number.isFinite(value)) return value < 1e21 ? "" + value : encodeString("" + value);
		return "";
	}
	/**
	* @param {Record<string, string | number | boolean
	* | ReadonlyArray<string | number | boolean> | null>} input
	* @returns {string}
	*/
	function stringify(input) {
		let result = "";
		if (input === null || typeof input !== "object") return result;
		const separator = "&";
		const keys = Object.keys(input);
		const keyLength = keys.length;
		let valueLength = 0;
		for (let i = 0; i < keyLength; i++) {
			const key = keys[i];
			const value = input[key];
			const encodedKey = encodeString(key) + "=";
			if (i) result += separator;
			if (Array.isArray(value)) {
				valueLength = value.length;
				for (let j = 0; j < valueLength; j++) {
					if (j) result += separator;
					result += encodedKey;
					result += getAsPrimitive(value[j]);
				}
			} else {
				result += encodedKey;
				result += getAsPrimitive(value);
			}
		}
		return result;
	}
	module.exports = stringify;
}));
//#endregion
//#region ../../node_modules/.bun/fast-querystring@1.1.2/node_modules/fast-querystring/lib/index.js
var require_lib = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const parse = require_parse();
	const stringify = require_stringify();
	const fastQuerystring = {
		parse,
		stringify
	};
	/**
	* Enable TS and JS support
	*
	* - `const qs = require('fast-querystring')`
	* - `import qs from 'fast-querystring'`
	*/
	module.exports = fastQuerystring;
	module.exports.default = fastQuerystring;
	module.exports.parse = parse;
	module.exports.stringify = stringify;
}));
//#endregion
export { require_lib as t };
