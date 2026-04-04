import { t as __commonJSMin } from "../../_runtime.mjs";
import { a as require_equal, i as require_ajv, n as require_dist$1, o as require_fast_uri, r as require_formats } from "./ajv-compiler+[...].mjs";
//#region ../../node_modules/.bun/rfdc@1.4.1/node_modules/rfdc/index.js
var require_rfdc = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = rfdc;
	function copyBuffer(cur) {
		if (cur instanceof Buffer) return Buffer.from(cur);
		return new cur.constructor(cur.buffer.slice(), cur.byteOffset, cur.length);
	}
	function rfdc(opts) {
		opts = opts || {};
		if (opts.circles) return rfdcCircles(opts);
		const constructorHandlers = /* @__PURE__ */ new Map();
		constructorHandlers.set(Date, (o) => new Date(o));
		constructorHandlers.set(Map, (o, fn) => new Map(cloneArray(Array.from(o), fn)));
		constructorHandlers.set(Set, (o, fn) => new Set(cloneArray(Array.from(o), fn)));
		if (opts.constructorHandlers) for (const handler of opts.constructorHandlers) constructorHandlers.set(handler[0], handler[1]);
		let handler = null;
		return opts.proto ? cloneProto : clone;
		function cloneArray(a, fn) {
			const keys = Object.keys(a);
			const a2 = new Array(keys.length);
			for (let i = 0; i < keys.length; i++) {
				const k = keys[i];
				const cur = a[k];
				if (typeof cur !== "object" || cur === null) a2[k] = cur;
				else if (cur.constructor !== Object && (handler = constructorHandlers.get(cur.constructor))) a2[k] = handler(cur, fn);
				else if (ArrayBuffer.isView(cur)) a2[k] = copyBuffer(cur);
				else a2[k] = fn(cur);
			}
			return a2;
		}
		function clone(o) {
			if (typeof o !== "object" || o === null) return o;
			if (Array.isArray(o)) return cloneArray(o, clone);
			if (o.constructor !== Object && (handler = constructorHandlers.get(o.constructor))) return handler(o, clone);
			const o2 = {};
			for (const k in o) {
				if (Object.hasOwnProperty.call(o, k) === false) continue;
				const cur = o[k];
				if (typeof cur !== "object" || cur === null) o2[k] = cur;
				else if (cur.constructor !== Object && (handler = constructorHandlers.get(cur.constructor))) o2[k] = handler(cur, clone);
				else if (ArrayBuffer.isView(cur)) o2[k] = copyBuffer(cur);
				else o2[k] = clone(cur);
			}
			return o2;
		}
		function cloneProto(o) {
			if (typeof o !== "object" || o === null) return o;
			if (Array.isArray(o)) return cloneArray(o, cloneProto);
			if (o.constructor !== Object && (handler = constructorHandlers.get(o.constructor))) return handler(o, cloneProto);
			const o2 = {};
			for (const k in o) {
				const cur = o[k];
				if (typeof cur !== "object" || cur === null) o2[k] = cur;
				else if (cur.constructor !== Object && (handler = constructorHandlers.get(cur.constructor))) o2[k] = handler(cur, cloneProto);
				else if (ArrayBuffer.isView(cur)) o2[k] = copyBuffer(cur);
				else o2[k] = cloneProto(cur);
			}
			return o2;
		}
	}
	function rfdcCircles(opts) {
		const refs = [];
		const refsNew = [];
		const constructorHandlers = /* @__PURE__ */ new Map();
		constructorHandlers.set(Date, (o) => new Date(o));
		constructorHandlers.set(Map, (o, fn) => new Map(cloneArray(Array.from(o), fn)));
		constructorHandlers.set(Set, (o, fn) => new Set(cloneArray(Array.from(o), fn)));
		if (opts.constructorHandlers) for (const handler of opts.constructorHandlers) constructorHandlers.set(handler[0], handler[1]);
		let handler = null;
		return opts.proto ? cloneProto : clone;
		function cloneArray(a, fn) {
			const keys = Object.keys(a);
			const a2 = new Array(keys.length);
			for (let i = 0; i < keys.length; i++) {
				const k = keys[i];
				const cur = a[k];
				if (typeof cur !== "object" || cur === null) a2[k] = cur;
				else if (cur.constructor !== Object && (handler = constructorHandlers.get(cur.constructor))) a2[k] = handler(cur, fn);
				else if (ArrayBuffer.isView(cur)) a2[k] = copyBuffer(cur);
				else {
					const index = refs.indexOf(cur);
					if (index !== -1) a2[k] = refsNew[index];
					else a2[k] = fn(cur);
				}
			}
			return a2;
		}
		function clone(o) {
			if (typeof o !== "object" || o === null) return o;
			if (Array.isArray(o)) return cloneArray(o, clone);
			if (o.constructor !== Object && (handler = constructorHandlers.get(o.constructor))) return handler(o, clone);
			const o2 = {};
			refs.push(o);
			refsNew.push(o2);
			for (const k in o) {
				if (Object.hasOwnProperty.call(o, k) === false) continue;
				const cur = o[k];
				if (typeof cur !== "object" || cur === null) o2[k] = cur;
				else if (cur.constructor !== Object && (handler = constructorHandlers.get(cur.constructor))) o2[k] = handler(cur, clone);
				else if (ArrayBuffer.isView(cur)) o2[k] = copyBuffer(cur);
				else {
					const i = refs.indexOf(cur);
					if (i !== -1) o2[k] = refsNew[i];
					else o2[k] = clone(cur);
				}
			}
			refs.pop();
			refsNew.pop();
			return o2;
		}
		function cloneProto(o) {
			if (typeof o !== "object" || o === null) return o;
			if (Array.isArray(o)) return cloneArray(o, cloneProto);
			if (o.constructor !== Object && (handler = constructorHandlers.get(o.constructor))) return handler(o, cloneProto);
			const o2 = {};
			refs.push(o);
			refsNew.push(o2);
			for (const k in o) {
				const cur = o[k];
				if (typeof cur !== "object" || cur === null) o2[k] = cur;
				else if (cur.constructor !== Object && (handler = constructorHandlers.get(cur.constructor))) o2[k] = handler(cur, cloneProto);
				else if (ArrayBuffer.isView(cur)) o2[k] = copyBuffer(cur);
				else {
					const i = refs.indexOf(cur);
					if (i !== -1) o2[k] = refsNew[i];
					else o2[k] = cloneProto(cur);
				}
			}
			refs.pop();
			refsNew.pop();
			return o2;
		}
	}
}));
//#endregion
//#region ../../node_modules/.bun/fast-json-stringify@6.3.0/node_modules/fast-json-stringify/lib/serializer.js
var require_serializer = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const STR_ESCAPE = /[\u0000-\u001f\u0022\u005c\ud800-\udfff]/;
	module.exports = class Serializer {
		constructor(options) {
			switch (options && options.rounding) {
				case "floor":
					this.parseInteger = Math.floor;
					break;
				case "ceil":
					this.parseInteger = Math.ceil;
					break;
				case "round":
					this.parseInteger = Math.round;
					break;
				default:
					this.parseInteger = Math.trunc;
					break;
			}
			this._options = options;
		}
		asInteger(i) {
			if (Number.isInteger(i)) return "" + i;
			else if (typeof i === "bigint") return i.toString();
			const integer = this.parseInteger(i);
			if (integer === Infinity || integer === -Infinity || integer !== integer) throw new Error(`The value "${i}" cannot be converted to an integer.`);
			return "" + integer;
		}
		asNumber(i) {
			const num = Number(i);
			if (num !== num) throw new Error(`The value "${i}" cannot be converted to a number.`);
			else if (num === Infinity || num === -Infinity) return "null";
			else return "" + num;
		}
		asBoolean(bool) {
			return bool && "true" || "false";
		}
		asDateTime(date) {
			if (date === null) return "\"\"";
			if (date instanceof Date) return "\"" + date.toISOString() + "\"";
			if (typeof date === "string") return "\"" + date + "\"";
			throw new Error(`The value "${date}" cannot be converted to a date-time.`);
		}
		asDate(date) {
			if (date === null) return "\"\"";
			if (date instanceof Date) return "\"" + (/* @__PURE__ */ new Date(date.getTime() - date.getTimezoneOffset() * 6e4)).toISOString().slice(0, 10) + "\"";
			if (typeof date === "string") return "\"" + date + "\"";
			throw new Error(`The value "${date}" cannot be converted to a date.`);
		}
		asTime(date) {
			if (date === null) return "\"\"";
			if (date instanceof Date) return "\"" + (/* @__PURE__ */ new Date(date.getTime() - date.getTimezoneOffset() * 6e4)).toISOString().slice(11, 19) + "\"";
			if (typeof date === "string") return "\"" + date + "\"";
			throw new Error(`The value "${date}" cannot be converted to a time.`);
		}
		asString(str) {
			const len = str.length;
			if (len === 0) return "\"\"";
			else if (len < 42) {
				let result = "";
				let last = -1;
				let point = 255;
				for (let i = 0; i < len; i++) {
					point = str.charCodeAt(i);
					if (point === 34 || point === 92) {
						last === -1 && (last = 0);
						result += str.slice(last, i) + "\\";
						last = i;
					} else if (point < 32 || point >= 55296 && point <= 57343) return JSON.stringify(str);
				}
				return last === -1 && "\"" + str + "\"" || "\"" + result + str.slice(last) + "\"";
			} else if (len < 5e3 && STR_ESCAPE.test(str) === false) return "\"" + str + "\"";
			else return JSON.stringify(str);
		}
		asUnsafeString(str) {
			return "\"" + str + "\"";
		}
		getState() {
			return this._options;
		}
		static restoreFromState(state) {
			return new Serializer(state);
		}
	};
}));
//#endregion
//#region ../../node_modules/.bun/dequal@2.0.3/node_modules/dequal/dist/index.js
var require_dist = /* @__PURE__ */ __commonJSMin(((exports) => {
	var has = Object.prototype.hasOwnProperty;
	function find(iter, tar, key) {
		for (key of iter.keys()) if (dequal(key, tar)) return key;
	}
	function dequal(foo, bar) {
		var ctor, len, tmp;
		if (foo === bar) return true;
		if (foo && bar && (ctor = foo.constructor) === bar.constructor) {
			if (ctor === Date) return foo.getTime() === bar.getTime();
			if (ctor === RegExp) return foo.toString() === bar.toString();
			if (ctor === Array) {
				if ((len = foo.length) === bar.length) while (len-- && dequal(foo[len], bar[len]));
				return len === -1;
			}
			if (ctor === Set) {
				if (foo.size !== bar.size) return false;
				for (len of foo) {
					tmp = len;
					if (tmp && typeof tmp === "object") {
						tmp = find(bar, tmp);
						if (!tmp) return false;
					}
					if (!bar.has(tmp)) return false;
				}
				return true;
			}
			if (ctor === Map) {
				if (foo.size !== bar.size) return false;
				for (len of foo) {
					tmp = len[0];
					if (tmp && typeof tmp === "object") {
						tmp = find(bar, tmp);
						if (!tmp) return false;
					}
					if (!dequal(len[1], bar.get(tmp))) return false;
				}
				return true;
			}
			if (ctor === ArrayBuffer) {
				foo = new Uint8Array(foo);
				bar = new Uint8Array(bar);
			} else if (ctor === DataView) {
				if ((len = foo.byteLength) === bar.byteLength) while (len-- && foo.getInt8(len) === bar.getInt8(len));
				return len === -1;
			}
			if (ArrayBuffer.isView(foo)) {
				if ((len = foo.byteLength) === bar.byteLength) while (len-- && foo[len] === bar[len]);
				return len === -1;
			}
			if (!ctor || typeof foo === "object") {
				len = 0;
				for (ctor in foo) {
					if (has.call(foo, ctor) && ++len && !has.call(bar, ctor)) return false;
					if (!(ctor in bar) || !dequal(foo[ctor], bar[ctor])) return false;
				}
				return Object.keys(bar).length === len;
			}
		}
		return foo !== foo && bar !== bar;
	}
	exports.dequal = dequal;
}));
//#endregion
//#region ../../node_modules/.bun/json-schema-ref-resolver@3.0.0/node_modules/json-schema-ref-resolver/index.js
var require_json_schema_ref_resolver = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { dequal: deepEqual } = require_dist();
	const jsonSchemaRefSymbol = Symbol.for("json-schema-ref");
	var RefResolver = class {
		#schemas;
		#derefSchemas;
		#insertRefSymbol;
		#allowEqualDuplicates;
		#cloneSchemaWithoutRefs;
		constructor(opts = {}) {
			this.#schemas = {};
			this.#derefSchemas = {};
			this.#insertRefSymbol = opts.insertRefSymbol ?? false;
			this.#allowEqualDuplicates = opts.allowEqualDuplicates ?? true;
			this.#cloneSchemaWithoutRefs = opts.cloneSchemaWithoutRefs ?? false;
		}
		addSchema(schema, rootSchemaId, isRootSchema = true) {
			if (isRootSchema) if (schema.$id !== void 0 && schema.$id.charAt(0) !== "#") rootSchemaId = schema.$id;
			else this.#insertSchemaBySchemaId(schema, rootSchemaId);
			const schemaId = schema.$id;
			if (schemaId !== void 0 && typeof schemaId === "string") if (schemaId.charAt(0) === "#") this.#insertSchemaByAnchor(schema, rootSchemaId, schemaId);
			else {
				this.#insertSchemaBySchemaId(schema, schemaId);
				rootSchemaId = schemaId;
			}
			const ref = schema.$ref;
			if (ref !== void 0 && typeof ref === "string") {
				const { refSchemaId, refJsonPointer } = this.#parseSchemaRef(ref, rootSchemaId);
				this.#schemas[rootSchemaId].refs.push({
					schemaId: refSchemaId,
					jsonPointer: refJsonPointer
				});
			}
			for (const key in schema) if (typeof schema[key] === "object" && schema[key] !== null) this.addSchema(schema[key], rootSchemaId, false);
		}
		getSchema(schemaId, jsonPointer = "#") {
			const schema = this.#schemas[schemaId];
			if (schema === void 0) throw new Error(`Cannot resolve ref "${schemaId}${jsonPointer}". Schema with id "${schemaId}" is not found.`);
			if (schema.anchors[jsonPointer] !== void 0) return schema.anchors[jsonPointer];
			return getDataByJSONPointer(schema.schema, jsonPointer);
		}
		hasSchema(schemaId) {
			return this.#schemas[schemaId] !== void 0;
		}
		getSchemaRefs(schemaId) {
			const schema = this.#schemas[schemaId];
			if (schema === void 0) throw new Error(`Schema with id "${schemaId}" is not found.`);
			return schema.refs;
		}
		getSchemaDependencies(schemaId, dependencies = {}) {
			const schema = this.#schemas[schemaId];
			for (const ref of schema.refs) {
				const dependencySchemaId = ref.schemaId;
				if (dependencySchemaId === schemaId || dependencies[dependencySchemaId] !== void 0) continue;
				dependencies[dependencySchemaId] = this.getSchema(dependencySchemaId);
				this.getSchemaDependencies(dependencySchemaId, dependencies);
			}
			return dependencies;
		}
		derefSchema(schemaId) {
			if (this.#derefSchemas[schemaId] !== void 0) return;
			const schema = this.#schemas[schemaId];
			if (schema === void 0) throw new Error(`Schema with id "${schemaId}" is not found.`);
			if (!this.#cloneSchemaWithoutRefs && schema.refs.length === 0) this.#derefSchemas[schemaId] = {
				schema: schema.schema,
				anchors: schema.anchors
			};
			const refs = [];
			this.#addDerefSchema(schema.schema, schemaId, true, refs);
			const dependencies = this.getSchemaDependencies(schemaId);
			for (const schemaId in dependencies) {
				const schema = dependencies[schemaId];
				this.#addDerefSchema(schema, schemaId, true, refs);
			}
			for (const ref of refs) {
				const { refSchemaId, refJsonPointer } = this.#parseSchemaRef(ref.ref, ref.sourceSchemaId);
				const targetSchema = this.getDerefSchema(refSchemaId, refJsonPointer);
				if (targetSchema === null) throw new Error(`Cannot resolve ref "${ref.ref}". Ref "${refJsonPointer}" is not found in schema "${refSchemaId}".`);
				ref.targetSchema = targetSchema;
				ref.targetSchemaId = refSchemaId;
			}
			for (const ref of refs) this.#resolveRef(ref, refs);
		}
		getDerefSchema(schemaId, jsonPointer = "#") {
			let derefSchema = this.#derefSchemas[schemaId];
			if (derefSchema === void 0) {
				this.derefSchema(schemaId);
				derefSchema = this.#derefSchemas[schemaId];
			}
			if (derefSchema.anchors[jsonPointer] !== void 0) return derefSchema.anchors[jsonPointer];
			return getDataByJSONPointer(derefSchema.schema, jsonPointer);
		}
		#parseSchemaRef(ref, schemaId) {
			const sharpIndex = ref.indexOf("#");
			if (sharpIndex === -1) return {
				refSchemaId: ref,
				refJsonPointer: "#"
			};
			if (sharpIndex === 0) return {
				refSchemaId: schemaId,
				refJsonPointer: ref
			};
			return {
				refSchemaId: ref.slice(0, sharpIndex),
				refJsonPointer: ref.slice(sharpIndex)
			};
		}
		#addDerefSchema(schema, rootSchemaId, isRootSchema, refs = []) {
			const derefSchema = Array.isArray(schema) ? [...schema] : { ...schema };
			if (isRootSchema) if (schema.$id !== void 0 && schema.$id.charAt(0) !== "#") rootSchemaId = schema.$id;
			else this.#insertDerefSchemaBySchemaId(derefSchema, rootSchemaId);
			const schemaId = derefSchema.$id;
			if (schemaId !== void 0 && typeof schemaId === "string") if (schemaId.charAt(0) === "#") this.#insertDerefSchemaByAnchor(derefSchema, rootSchemaId, schemaId);
			else {
				this.#insertDerefSchemaBySchemaId(derefSchema, schemaId);
				rootSchemaId = schemaId;
			}
			if (derefSchema.$ref !== void 0) refs.push({
				ref: derefSchema.$ref,
				sourceSchemaId: rootSchemaId,
				sourceSchema: derefSchema
			});
			for (const key in derefSchema) {
				const value = derefSchema[key];
				if (typeof value === "object" && value !== null) derefSchema[key] = this.#addDerefSchema(value, rootSchemaId, false, refs);
			}
			return derefSchema;
		}
		#resolveRef(ref, refs) {
			const { sourceSchema, targetSchema } = ref;
			if (!sourceSchema.$ref) return;
			if (this.#insertRefSymbol) sourceSchema[jsonSchemaRefSymbol] = sourceSchema.$ref;
			delete sourceSchema.$ref;
			if (targetSchema.$ref) {
				const targetSchemaRef = refs.find((ref) => ref.sourceSchema === targetSchema);
				this.#resolveRef(targetSchemaRef, refs);
			}
			for (const key in targetSchema) {
				if (key === "$id") continue;
				if (sourceSchema[key] !== void 0) {
					if (deepEqual(sourceSchema[key], targetSchema[key])) continue;
					throw new Error(`Cannot resolve ref "${ref.ref}". Property "${key}" already exists in schema "${ref.sourceSchemaId}".`);
				}
				sourceSchema[key] = targetSchema[key];
			}
			ref.isResolved = true;
		}
		#insertSchemaBySchemaId(schema, schemaId) {
			const foundSchema = this.#schemas[schemaId];
			if (foundSchema !== void 0) {
				if (this.#allowEqualDuplicates && deepEqual(schema, foundSchema.schema)) return;
				throw new Error(`There is already another schema with id "${schemaId}".`);
			}
			this.#schemas[schemaId] = {
				schema,
				anchors: {},
				refs: []
			};
		}
		#insertSchemaByAnchor(schema, schemaId, anchor) {
			const { anchors } = this.#schemas[schemaId];
			if (anchors[anchor] !== void 0) throw new Error(`There is already another anchor "${anchor}" in schema "${schemaId}".`);
			anchors[anchor] = schema;
		}
		#insertDerefSchemaBySchemaId(schema, schemaId) {
			if (this.#derefSchemas[schemaId] !== void 0) return;
			this.#derefSchemas[schemaId] = {
				schema,
				anchors: {}
			};
		}
		#insertDerefSchemaByAnchor(schema, schemaId, anchor) {
			const { anchors } = this.#derefSchemas[schemaId];
			anchors[anchor] = schema;
		}
	};
	function getDataByJSONPointer(data, jsonPointer) {
		const parts = jsonPointer.split("/");
		let current = data;
		for (const part of parts) {
			if (part === "" || part === "#") continue;
			if (typeof current !== "object" || current === null) return null;
			current = current[part];
		}
		return current ?? null;
	}
	module.exports = { RefResolver };
}));
//#endregion
//#region ../../node_modules/.bun/fast-json-stringify@6.3.0/node_modules/fast-json-stringify/lib/validator.js
var require_validator = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const Ajv = require_ajv();
	const fastUri = require_fast_uri();
	const ajvFormats = require_dist$1();
	const clone = require_rfdc()({ proto: true });
	module.exports = class Validator {
		constructor(ajvOptions) {
			this.ajv = new Ajv({
				...ajvOptions,
				strictSchema: false,
				validateSchema: false,
				allowUnionTypes: true,
				uriResolver: fastUri
			});
			ajvFormats(this.ajv);
			this.ajv.addKeyword({
				keyword: "fjs_type",
				type: "object",
				errors: false,
				validate: (_type, data) => {
					return data && typeof data.toJSON === "function";
				}
			});
			this._ajvSchemas = {};
			this._ajvOptions = ajvOptions || {};
		}
		addSchema(schema, schemaName) {
			let schemaKey = schema.$id || schemaName;
			if (schema.$id !== void 0 && schema.$id[0] === "#") schemaKey = schemaName + schema.$id;
			if (this.ajv.refs[schemaKey] === void 0 && this.ajv.schemas[schemaKey] === void 0) {
				const ajvSchema = clone(schema);
				this.convertSchemaToAjvFormat(ajvSchema);
				this.ajv.addSchema(ajvSchema, schemaKey);
				this._ajvSchemas[schemaKey] = schema;
			}
		}
		validate(schemaRef, data) {
			return this.ajv.validate(schemaRef, data);
		}
		convertSchemaToAjvFormat(schema) {
			if (schema === null) return;
			if (schema.type === "string") {
				schema.fjs_type = "string";
				schema.type = ["string", "object"];
			} else if (Array.isArray(schema.type) && schema.type.includes("string") && !schema.type.includes("object")) {
				schema.fjs_type = "string";
				schema.type.push("object");
			}
			for (const property in schema) if (typeof schema[property] === "object") this.convertSchemaToAjvFormat(schema[property]);
		}
		getState() {
			return {
				ajvOptions: this._ajvOptions,
				ajvSchemas: this._ajvSchemas
			};
		}
		static restoreFromState(state) {
			const validator = new Validator(state.ajvOptions);
			for (const [id, ajvSchema] of Object.entries(state.ajvSchemas)) validator.ajv.addSchema(ajvSchema, id);
			return validator;
		}
	};
}));
//#endregion
//#region ../../node_modules/.bun/fast-json-stringify@6.3.0/node_modules/fast-json-stringify/lib/location.js
var require_location = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = class Location {
		constructor(schema, schemaId, jsonPointer = "#") {
			this.schema = schema;
			this.schemaId = schemaId;
			this.jsonPointer = jsonPointer;
		}
		getPropertyLocation(propertyName) {
			return new Location(this.schema[propertyName], this.schemaId, this.jsonPointer + "/" + propertyName);
		}
		getSchemaRef() {
			return this.schemaId + this.jsonPointer;
		}
	};
}));
//#endregion
//#region ../../node_modules/.bun/fast-json-stringify@6.3.0/node_modules/fast-json-stringify/lib/schema-validator.js
var require_schema_validator = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = validate10;
	module.exports.default = validate10;
	const schema11 = {
		"$schema": "http://json-schema.org/draft-07/schema#",
		"$id": "http://json-schema.org/draft-07/schema#",
		"title": "Core schema meta-schema",
		"definitions": {
			"schemaArray": {
				"type": "array",
				"minItems": 1,
				"items": { "$ref": "#" }
			},
			"nonNegativeInteger": {
				"type": "integer",
				"minimum": 0
			},
			"nonNegativeIntegerDefault0": { "allOf": [{ "$ref": "#/definitions/nonNegativeInteger" }, { "default": 0 }] },
			"simpleTypes": { "enum": [
				"array",
				"boolean",
				"integer",
				"null",
				"number",
				"object",
				"string"
			] },
			"stringArray": {
				"type": "array",
				"items": { "type": "string" },
				"uniqueItems": true,
				"default": []
			}
		},
		"type": ["object", "boolean"],
		"properties": {
			"$id": {
				"type": "string",
				"format": "uri-reference"
			},
			"$schema": {
				"type": "string",
				"format": "uri"
			},
			"$ref": {
				"type": "string",
				"format": "uri-reference"
			},
			"$comment": { "type": "string" },
			"title": { "type": "string" },
			"description": { "type": "string" },
			"default": true,
			"readOnly": {
				"type": "boolean",
				"default": false
			},
			"examples": {
				"type": "array",
				"items": true
			},
			"multipleOf": {
				"type": "number",
				"exclusiveMinimum": 0
			},
			"maximum": { "type": "number" },
			"exclusiveMaximum": { "type": "number" },
			"minimum": { "type": "number" },
			"exclusiveMinimum": { "type": "number" },
			"maxLength": { "$ref": "#/definitions/nonNegativeInteger" },
			"minLength": { "$ref": "#/definitions/nonNegativeIntegerDefault0" },
			"pattern": {
				"type": "string",
				"format": "regex"
			},
			"additionalItems": { "$ref": "#" },
			"items": {
				"anyOf": [{ "$ref": "#" }, { "$ref": "#/definitions/schemaArray" }],
				"default": true
			},
			"maxItems": { "$ref": "#/definitions/nonNegativeInteger" },
			"minItems": { "$ref": "#/definitions/nonNegativeIntegerDefault0" },
			"uniqueItems": {
				"type": "boolean",
				"default": false
			},
			"contains": { "$ref": "#" },
			"maxProperties": { "$ref": "#/definitions/nonNegativeInteger" },
			"minProperties": { "$ref": "#/definitions/nonNegativeIntegerDefault0" },
			"required": { "$ref": "#/definitions/stringArray" },
			"additionalProperties": { "$ref": "#" },
			"definitions": {
				"type": "object",
				"additionalProperties": { "$ref": "#" },
				"default": {}
			},
			"properties": {
				"type": "object",
				"additionalProperties": { "$ref": "#" },
				"default": {}
			},
			"patternProperties": {
				"type": "object",
				"additionalProperties": { "$ref": "#" },
				"propertyNames": { "format": "regex" },
				"default": {}
			},
			"dependencies": {
				"type": "object",
				"additionalProperties": { "anyOf": [{ "$ref": "#" }, { "$ref": "#/definitions/stringArray" }] }
			},
			"propertyNames": { "$ref": "#" },
			"const": true,
			"enum": {
				"type": "array",
				"items": true,
				"minItems": 1,
				"uniqueItems": true
			},
			"type": { "anyOf": [{ "$ref": "#/definitions/simpleTypes" }, {
				"type": "array",
				"items": { "$ref": "#/definitions/simpleTypes" },
				"minItems": 1,
				"uniqueItems": true
			}] },
			"format": { "type": "string" },
			"contentMediaType": { "type": "string" },
			"contentEncoding": { "type": "string" },
			"if": { "$ref": "#" },
			"then": { "$ref": "#" },
			"else": { "$ref": "#" },
			"allOf": { "$ref": "#/definitions/schemaArray" },
			"anyOf": { "$ref": "#/definitions/schemaArray" },
			"oneOf": { "$ref": "#/definitions/schemaArray" },
			"not": { "$ref": "#" }
		},
		"default": true
	};
	const schema20 = { "enum": [
		"array",
		"boolean",
		"integer",
		"null",
		"number",
		"object",
		"string"
	] };
	const formats0 = /^(?:[a-z][a-z0-9+\-.]*:)?(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'"()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?(?:\?(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i;
	const formats2 = require_formats().fullFormats.uri;
	const formats6 = require_formats().fullFormats.regex;
	function validate11(data, { instancePath = "", parentData, parentDataProperty, rootData = data } = {}) {
		let vErrors = null;
		let errors = 0;
		const _errs1 = errors;
		if (!(typeof data == "number" && !(data % 1) && !isNaN(data) && isFinite(data))) {
			validate11.errors = [{
				instancePath,
				schemaPath: "#/definitions/nonNegativeInteger/type",
				keyword: "type",
				params: { type: "integer" },
				message: "must be integer"
			}];
			return false;
		}
		if (errors === _errs1) {
			if (typeof data == "number" && isFinite(data)) {
				if (data < 0 || isNaN(data)) {
					validate11.errors = [{
						instancePath,
						schemaPath: "#/definitions/nonNegativeInteger/minimum",
						keyword: "minimum",
						params: {
							comparison: ">=",
							limit: 0
						},
						message: "must be >= 0"
					}];
					return false;
				}
			}
		}
		validate11.errors = vErrors;
		return errors === 0;
	}
	const root1 = { validate: validate10 };
	function validate13(data, { instancePath = "", parentData, parentDataProperty, rootData = data } = {}) {
		let vErrors = null;
		let errors = 0;
		if (errors === 0) if (Array.isArray(data)) if (data.length < 1) {
			validate13.errors = [{
				instancePath,
				schemaPath: "#/minItems",
				keyword: "minItems",
				params: { limit: 1 },
				message: "must NOT have fewer than 1 items"
			}];
			return false;
		} else {
			const len0 = data.length;
			for (let i0 = 0; i0 < len0; i0++) {
				const _errs1 = errors;
				if (!root1.validate(data[i0], {
					instancePath: instancePath + "/" + i0,
					parentData: data,
					parentDataProperty: i0,
					rootData
				})) {
					vErrors = vErrors === null ? root1.validate.errors : vErrors.concat(root1.validate.errors);
					errors = vErrors.length;
				}
				if (!(_errs1 === errors)) break;
			}
		}
		else {
			validate13.errors = [{
				instancePath,
				schemaPath: "#/type",
				keyword: "type",
				params: { type: "array" },
				message: "must be array"
			}];
			return false;
		}
		validate13.errors = vErrors;
		return errors === 0;
	}
	const func0 = require_equal().default;
	function validate10(data, { instancePath = "", parentData, parentDataProperty, rootData = data } = {}) {
		let vErrors = null;
		let errors = 0;
		if (!(data && typeof data == "object" && !Array.isArray(data)) && typeof data !== "boolean") {
			validate10.errors = [{
				instancePath,
				schemaPath: "#/type",
				keyword: "type",
				params: { type: schema11.type },
				message: "must be object,boolean"
			}];
			return false;
		}
		if (errors === 0) {
			if (data && typeof data == "object" && !Array.isArray(data)) {
				if (data.$id !== void 0) {
					let data0 = data.$id;
					const _errs1 = errors;
					if (errors === _errs1) {
						if (errors === _errs1) if (typeof data0 === "string") {
							if (!formats0.test(data0)) {
								validate10.errors = [{
									instancePath: instancePath + "/$id",
									schemaPath: "#/properties/%24id/format",
									keyword: "format",
									params: { format: "uri-reference" },
									message: "must match format \"uri-reference\""
								}];
								return false;
							}
						} else {
							validate10.errors = [{
								instancePath: instancePath + "/$id",
								schemaPath: "#/properties/%24id/type",
								keyword: "type",
								params: { type: "string" },
								message: "must be string"
							}];
							return false;
						}
					}
					var valid0 = _errs1 === errors;
				} else var valid0 = true;
				if (valid0) {
					if (data.$schema !== void 0) {
						let data1 = data.$schema;
						const _errs3 = errors;
						if (errors === _errs3) {
							if (errors === _errs3) if (typeof data1 === "string") {
								if (!formats2(data1)) {
									validate10.errors = [{
										instancePath: instancePath + "/$schema",
										schemaPath: "#/properties/%24schema/format",
										keyword: "format",
										params: { format: "uri" },
										message: "must match format \"uri\""
									}];
									return false;
								}
							} else {
								validate10.errors = [{
									instancePath: instancePath + "/$schema",
									schemaPath: "#/properties/%24schema/type",
									keyword: "type",
									params: { type: "string" },
									message: "must be string"
								}];
								return false;
							}
						}
						var valid0 = _errs3 === errors;
					} else var valid0 = true;
					if (valid0) {
						if (data.$ref !== void 0) {
							let data2 = data.$ref;
							const _errs5 = errors;
							if (errors === _errs5) {
								if (errors === _errs5) if (typeof data2 === "string") {
									if (!formats0.test(data2)) {
										validate10.errors = [{
											instancePath: instancePath + "/$ref",
											schemaPath: "#/properties/%24ref/format",
											keyword: "format",
											params: { format: "uri-reference" },
											message: "must match format \"uri-reference\""
										}];
										return false;
									}
								} else {
									validate10.errors = [{
										instancePath: instancePath + "/$ref",
										schemaPath: "#/properties/%24ref/type",
										keyword: "type",
										params: { type: "string" },
										message: "must be string"
									}];
									return false;
								}
							}
							var valid0 = _errs5 === errors;
						} else var valid0 = true;
						if (valid0) {
							if (data.$comment !== void 0) {
								const _errs7 = errors;
								if (typeof data.$comment !== "string") {
									validate10.errors = [{
										instancePath: instancePath + "/$comment",
										schemaPath: "#/properties/%24comment/type",
										keyword: "type",
										params: { type: "string" },
										message: "must be string"
									}];
									return false;
								}
								var valid0 = _errs7 === errors;
							} else var valid0 = true;
							if (valid0) {
								if (data.title !== void 0) {
									const _errs9 = errors;
									if (typeof data.title !== "string") {
										validate10.errors = [{
											instancePath: instancePath + "/title",
											schemaPath: "#/properties/title/type",
											keyword: "type",
											params: { type: "string" },
											message: "must be string"
										}];
										return false;
									}
									var valid0 = _errs9 === errors;
								} else var valid0 = true;
								if (valid0) {
									if (data.description !== void 0) {
										const _errs11 = errors;
										if (typeof data.description !== "string") {
											validate10.errors = [{
												instancePath: instancePath + "/description",
												schemaPath: "#/properties/description/type",
												keyword: "type",
												params: { type: "string" },
												message: "must be string"
											}];
											return false;
										}
										var valid0 = _errs11 === errors;
									} else var valid0 = true;
									if (valid0) {
										if (data.readOnly !== void 0) {
											const _errs13 = errors;
											if (typeof data.readOnly !== "boolean") {
												validate10.errors = [{
													instancePath: instancePath + "/readOnly",
													schemaPath: "#/properties/readOnly/type",
													keyword: "type",
													params: { type: "boolean" },
													message: "must be boolean"
												}];
												return false;
											}
											var valid0 = _errs13 === errors;
										} else var valid0 = true;
										if (valid0) {
											if (data.examples !== void 0) {
												const _errs15 = errors;
												if (errors === _errs15) {
													if (!Array.isArray(data.examples)) {
														validate10.errors = [{
															instancePath: instancePath + "/examples",
															schemaPath: "#/properties/examples/type",
															keyword: "type",
															params: { type: "array" },
															message: "must be array"
														}];
														return false;
													}
												}
												var valid0 = _errs15 === errors;
											} else var valid0 = true;
											if (valid0) {
												if (data.multipleOf !== void 0) {
													let data8 = data.multipleOf;
													const _errs17 = errors;
													if (errors === _errs17) if (typeof data8 == "number" && isFinite(data8)) {
														if (data8 <= 0 || isNaN(data8)) {
															validate10.errors = [{
																instancePath: instancePath + "/multipleOf",
																schemaPath: "#/properties/multipleOf/exclusiveMinimum",
																keyword: "exclusiveMinimum",
																params: {
																	comparison: ">",
																	limit: 0
																},
																message: "must be > 0"
															}];
															return false;
														}
													} else {
														validate10.errors = [{
															instancePath: instancePath + "/multipleOf",
															schemaPath: "#/properties/multipleOf/type",
															keyword: "type",
															params: { type: "number" },
															message: "must be number"
														}];
														return false;
													}
													var valid0 = _errs17 === errors;
												} else var valid0 = true;
												if (valid0) {
													if (data.maximum !== void 0) {
														let data9 = data.maximum;
														const _errs19 = errors;
														if (!(typeof data9 == "number" && isFinite(data9))) {
															validate10.errors = [{
																instancePath: instancePath + "/maximum",
																schemaPath: "#/properties/maximum/type",
																keyword: "type",
																params: { type: "number" },
																message: "must be number"
															}];
															return false;
														}
														var valid0 = _errs19 === errors;
													} else var valid0 = true;
													if (valid0) {
														if (data.exclusiveMaximum !== void 0) {
															let data10 = data.exclusiveMaximum;
															const _errs21 = errors;
															if (!(typeof data10 == "number" && isFinite(data10))) {
																validate10.errors = [{
																	instancePath: instancePath + "/exclusiveMaximum",
																	schemaPath: "#/properties/exclusiveMaximum/type",
																	keyword: "type",
																	params: { type: "number" },
																	message: "must be number"
																}];
																return false;
															}
															var valid0 = _errs21 === errors;
														} else var valid0 = true;
														if (valid0) {
															if (data.minimum !== void 0) {
																let data11 = data.minimum;
																const _errs23 = errors;
																if (!(typeof data11 == "number" && isFinite(data11))) {
																	validate10.errors = [{
																		instancePath: instancePath + "/minimum",
																		schemaPath: "#/properties/minimum/type",
																		keyword: "type",
																		params: { type: "number" },
																		message: "must be number"
																	}];
																	return false;
																}
																var valid0 = _errs23 === errors;
															} else var valid0 = true;
															if (valid0) {
																if (data.exclusiveMinimum !== void 0) {
																	let data12 = data.exclusiveMinimum;
																	const _errs25 = errors;
																	if (!(typeof data12 == "number" && isFinite(data12))) {
																		validate10.errors = [{
																			instancePath: instancePath + "/exclusiveMinimum",
																			schemaPath: "#/properties/exclusiveMinimum/type",
																			keyword: "type",
																			params: { type: "number" },
																			message: "must be number"
																		}];
																		return false;
																	}
																	var valid0 = _errs25 === errors;
																} else var valid0 = true;
																if (valid0) {
																	if (data.maxLength !== void 0) {
																		let data13 = data.maxLength;
																		const _errs27 = errors;
																		const _errs28 = errors;
																		if (!(typeof data13 == "number" && !(data13 % 1) && !isNaN(data13) && isFinite(data13))) {
																			validate10.errors = [{
																				instancePath: instancePath + "/maxLength",
																				schemaPath: "#/definitions/nonNegativeInteger/type",
																				keyword: "type",
																				params: { type: "integer" },
																				message: "must be integer"
																			}];
																			return false;
																		}
																		if (errors === _errs28) {
																			if (typeof data13 == "number" && isFinite(data13)) {
																				if (data13 < 0 || isNaN(data13)) {
																					validate10.errors = [{
																						instancePath: instancePath + "/maxLength",
																						schemaPath: "#/definitions/nonNegativeInteger/minimum",
																						keyword: "minimum",
																						params: {
																							comparison: ">=",
																							limit: 0
																						},
																						message: "must be >= 0"
																					}];
																					return false;
																				}
																			}
																		}
																		var valid0 = _errs27 === errors;
																	} else var valid0 = true;
																	if (valid0) {
																		if (data.minLength !== void 0) {
																			const _errs30 = errors;
																			if (!validate11(data.minLength, {
																				instancePath: instancePath + "/minLength",
																				parentData: data,
																				parentDataProperty: "minLength",
																				rootData
																			})) {
																				vErrors = vErrors === null ? validate11.errors : vErrors.concat(validate11.errors);
																				errors = vErrors.length;
																			}
																			var valid0 = _errs30 === errors;
																		} else var valid0 = true;
																		if (valid0) {
																			if (data.pattern !== void 0) {
																				let data15 = data.pattern;
																				const _errs31 = errors;
																				if (errors === _errs31) {
																					if (errors === _errs31) if (typeof data15 === "string") {
																						if (!formats6(data15)) {
																							validate10.errors = [{
																								instancePath: instancePath + "/pattern",
																								schemaPath: "#/properties/pattern/format",
																								keyword: "format",
																								params: { format: "regex" },
																								message: "must match format \"regex\""
																							}];
																							return false;
																						}
																					} else {
																						validate10.errors = [{
																							instancePath: instancePath + "/pattern",
																							schemaPath: "#/properties/pattern/type",
																							keyword: "type",
																							params: { type: "string" },
																							message: "must be string"
																						}];
																						return false;
																					}
																				}
																				var valid0 = _errs31 === errors;
																			} else var valid0 = true;
																			if (valid0) {
																				if (data.additionalItems !== void 0) {
																					const _errs33 = errors;
																					if (!validate10(data.additionalItems, {
																						instancePath: instancePath + "/additionalItems",
																						parentData: data,
																						parentDataProperty: "additionalItems",
																						rootData
																					})) {
																						vErrors = vErrors === null ? validate10.errors : vErrors.concat(validate10.errors);
																						errors = vErrors.length;
																					}
																					var valid0 = _errs33 === errors;
																				} else var valid0 = true;
																				if (valid0) {
																					if (data.items !== void 0) {
																						let data17 = data.items;
																						const _errs34 = errors;
																						const _errs35 = errors;
																						let valid2 = false;
																						const _errs36 = errors;
																						if (!validate10(data17, {
																							instancePath: instancePath + "/items",
																							parentData: data,
																							parentDataProperty: "items",
																							rootData
																						})) {
																							vErrors = vErrors === null ? validate10.errors : vErrors.concat(validate10.errors);
																							errors = vErrors.length;
																						}
																						var _valid0 = _errs36 === errors;
																						valid2 = valid2 || _valid0;
																						if (!valid2) {
																							const _errs37 = errors;
																							if (!validate13(data17, {
																								instancePath: instancePath + "/items",
																								parentData: data,
																								parentDataProperty: "items",
																								rootData
																							})) {
																								vErrors = vErrors === null ? validate13.errors : vErrors.concat(validate13.errors);
																								errors = vErrors.length;
																							}
																							var _valid0 = _errs37 === errors;
																							valid2 = valid2 || _valid0;
																						}
																						if (!valid2) {
																							const err0 = {
																								instancePath: instancePath + "/items",
																								schemaPath: "#/properties/items/anyOf",
																								keyword: "anyOf",
																								params: {},
																								message: "must match a schema in anyOf"
																							};
																							if (vErrors === null) vErrors = [err0];
																							else vErrors.push(err0);
																							errors++;
																							validate10.errors = vErrors;
																							return false;
																						} else {
																							errors = _errs35;
																							if (vErrors !== null) if (_errs35) vErrors.length = _errs35;
																							else vErrors = null;
																						}
																						var valid0 = _errs34 === errors;
																					} else var valid0 = true;
																					if (valid0) {
																						if (data.maxItems !== void 0) {
																							let data18 = data.maxItems;
																							const _errs38 = errors;
																							const _errs39 = errors;
																							if (!(typeof data18 == "number" && !(data18 % 1) && !isNaN(data18) && isFinite(data18))) {
																								validate10.errors = [{
																									instancePath: instancePath + "/maxItems",
																									schemaPath: "#/definitions/nonNegativeInteger/type",
																									keyword: "type",
																									params: { type: "integer" },
																									message: "must be integer"
																								}];
																								return false;
																							}
																							if (errors === _errs39) {
																								if (typeof data18 == "number" && isFinite(data18)) {
																									if (data18 < 0 || isNaN(data18)) {
																										validate10.errors = [{
																											instancePath: instancePath + "/maxItems",
																											schemaPath: "#/definitions/nonNegativeInteger/minimum",
																											keyword: "minimum",
																											params: {
																												comparison: ">=",
																												limit: 0
																											},
																											message: "must be >= 0"
																										}];
																										return false;
																									}
																								}
																							}
																							var valid0 = _errs38 === errors;
																						} else var valid0 = true;
																						if (valid0) {
																							if (data.minItems !== void 0) {
																								const _errs41 = errors;
																								if (!validate11(data.minItems, {
																									instancePath: instancePath + "/minItems",
																									parentData: data,
																									parentDataProperty: "minItems",
																									rootData
																								})) {
																									vErrors = vErrors === null ? validate11.errors : vErrors.concat(validate11.errors);
																									errors = vErrors.length;
																								}
																								var valid0 = _errs41 === errors;
																							} else var valid0 = true;
																							if (valid0) {
																								if (data.uniqueItems !== void 0) {
																									const _errs42 = errors;
																									if (typeof data.uniqueItems !== "boolean") {
																										validate10.errors = [{
																											instancePath: instancePath + "/uniqueItems",
																											schemaPath: "#/properties/uniqueItems/type",
																											keyword: "type",
																											params: { type: "boolean" },
																											message: "must be boolean"
																										}];
																										return false;
																									}
																									var valid0 = _errs42 === errors;
																								} else var valid0 = true;
																								if (valid0) {
																									if (data.contains !== void 0) {
																										const _errs44 = errors;
																										if (!validate10(data.contains, {
																											instancePath: instancePath + "/contains",
																											parentData: data,
																											parentDataProperty: "contains",
																											rootData
																										})) {
																											vErrors = vErrors === null ? validate10.errors : vErrors.concat(validate10.errors);
																											errors = vErrors.length;
																										}
																										var valid0 = _errs44 === errors;
																									} else var valid0 = true;
																									if (valid0) {
																										if (data.maxProperties !== void 0) {
																											let data22 = data.maxProperties;
																											const _errs45 = errors;
																											const _errs46 = errors;
																											if (!(typeof data22 == "number" && !(data22 % 1) && !isNaN(data22) && isFinite(data22))) {
																												validate10.errors = [{
																													instancePath: instancePath + "/maxProperties",
																													schemaPath: "#/definitions/nonNegativeInteger/type",
																													keyword: "type",
																													params: { type: "integer" },
																													message: "must be integer"
																												}];
																												return false;
																											}
																											if (errors === _errs46) {
																												if (typeof data22 == "number" && isFinite(data22)) {
																													if (data22 < 0 || isNaN(data22)) {
																														validate10.errors = [{
																															instancePath: instancePath + "/maxProperties",
																															schemaPath: "#/definitions/nonNegativeInteger/minimum",
																															keyword: "minimum",
																															params: {
																																comparison: ">=",
																																limit: 0
																															},
																															message: "must be >= 0"
																														}];
																														return false;
																													}
																												}
																											}
																											var valid0 = _errs45 === errors;
																										} else var valid0 = true;
																										if (valid0) {
																											if (data.minProperties !== void 0) {
																												const _errs48 = errors;
																												if (!validate11(data.minProperties, {
																													instancePath: instancePath + "/minProperties",
																													parentData: data,
																													parentDataProperty: "minProperties",
																													rootData
																												})) {
																													vErrors = vErrors === null ? validate11.errors : vErrors.concat(validate11.errors);
																													errors = vErrors.length;
																												}
																												var valid0 = _errs48 === errors;
																											} else var valid0 = true;
																											if (valid0) {
																												if (data.required !== void 0) {
																													let data24 = data.required;
																													const _errs49 = errors;
																													if (errors === errors) if (Array.isArray(data24)) {
																														var valid6 = true;
																														const len0 = data24.length;
																														for (let i0 = 0; i0 < len0; i0++) {
																															const _errs52 = errors;
																															if (typeof data24[i0] !== "string") {
																																validate10.errors = [{
																																	instancePath: instancePath + "/required/" + i0,
																																	schemaPath: "#/definitions/stringArray/items/type",
																																	keyword: "type",
																																	params: { type: "string" },
																																	message: "must be string"
																																}];
																																return false;
																															}
																															var valid6 = _errs52 === errors;
																															if (!valid6) break;
																														}
																														if (valid6) {
																															let i1 = data24.length;
																															let j0;
																															if (i1 > 1) {
																																const indices0 = {};
																																for (; i1--;) {
																																	let item0 = data24[i1];
																																	if (typeof item0 !== "string") continue;
																																	if (typeof indices0[item0] == "number") {
																																		j0 = indices0[item0];
																																		validate10.errors = [{
																																			instancePath: instancePath + "/required",
																																			schemaPath: "#/definitions/stringArray/uniqueItems",
																																			keyword: "uniqueItems",
																																			params: {
																																				i: i1,
																																				j: j0
																																			},
																																			message: "must NOT have duplicate items (items ## " + j0 + " and " + i1 + " are identical)"
																																		}];
																																		return false;
																																	}
																																	indices0[item0] = i1;
																																}
																															}
																														}
																													} else {
																														validate10.errors = [{
																															instancePath: instancePath + "/required",
																															schemaPath: "#/definitions/stringArray/type",
																															keyword: "type",
																															params: { type: "array" },
																															message: "must be array"
																														}];
																														return false;
																													}
																													var valid0 = _errs49 === errors;
																												} else var valid0 = true;
																												if (valid0) {
																													if (data.additionalProperties !== void 0) {
																														const _errs54 = errors;
																														if (!validate10(data.additionalProperties, {
																															instancePath: instancePath + "/additionalProperties",
																															parentData: data,
																															parentDataProperty: "additionalProperties",
																															rootData
																														})) {
																															vErrors = vErrors === null ? validate10.errors : vErrors.concat(validate10.errors);
																															errors = vErrors.length;
																														}
																														var valid0 = _errs54 === errors;
																													} else var valid0 = true;
																													if (valid0) {
																														if (data.definitions !== void 0) {
																															let data27 = data.definitions;
																															const _errs55 = errors;
																															if (errors === _errs55) if (data27 && typeof data27 == "object" && !Array.isArray(data27)) for (const key0 in data27) {
																																const _errs58 = errors;
																																if (!validate10(data27[key0], {
																																	instancePath: instancePath + "/definitions/" + key0.replace(/~/g, "~0").replace(/\//g, "~1"),
																																	parentData: data27,
																																	parentDataProperty: key0,
																																	rootData
																																})) {
																																	vErrors = vErrors === null ? validate10.errors : vErrors.concat(validate10.errors);
																																	errors = vErrors.length;
																																}
																																if (!(_errs58 === errors)) break;
																															}
																															else {
																																validate10.errors = [{
																																	instancePath: instancePath + "/definitions",
																																	schemaPath: "#/properties/definitions/type",
																																	keyword: "type",
																																	params: { type: "object" },
																																	message: "must be object"
																																}];
																																return false;
																															}
																															var valid0 = _errs55 === errors;
																														} else var valid0 = true;
																														if (valid0) {
																															if (data.properties !== void 0) {
																																let data29 = data.properties;
																																const _errs59 = errors;
																																if (errors === _errs59) if (data29 && typeof data29 == "object" && !Array.isArray(data29)) for (const key1 in data29) {
																																	const _errs62 = errors;
																																	if (!validate10(data29[key1], {
																																		instancePath: instancePath + "/properties/" + key1.replace(/~/g, "~0").replace(/\//g, "~1"),
																																		parentData: data29,
																																		parentDataProperty: key1,
																																		rootData
																																	})) {
																																		vErrors = vErrors === null ? validate10.errors : vErrors.concat(validate10.errors);
																																		errors = vErrors.length;
																																	}
																																	if (!(_errs62 === errors)) break;
																																}
																																else {
																																	validate10.errors = [{
																																		instancePath: instancePath + "/properties",
																																		schemaPath: "#/properties/properties/type",
																																		keyword: "type",
																																		params: { type: "object" },
																																		message: "must be object"
																																	}];
																																	return false;
																																}
																																var valid0 = _errs59 === errors;
																															} else var valid0 = true;
																															if (valid0) {
																																if (data.patternProperties !== void 0) {
																																	let data31 = data.patternProperties;
																																	const _errs63 = errors;
																																	if (errors === _errs63) if (data31 && typeof data31 == "object" && !Array.isArray(data31)) {
																																		for (const key2 in data31) {
																																			const _errs65 = errors;
																																			if (errors === _errs65) {
																																				if (typeof key2 === "string") {
																																					if (!formats6(key2)) {
																																						const err1 = {
																																							instancePath: instancePath + "/patternProperties",
																																							schemaPath: "#/properties/patternProperties/propertyNames/format",
																																							keyword: "format",
																																							params: { format: "regex" },
																																							message: "must match format \"regex\"",
																																							propertyName: key2
																																						};
																																						if (vErrors === null) vErrors = [err1];
																																						else vErrors.push(err1);
																																						errors++;
																																					}
																																				}
																																			}
																																			var valid10 = _errs65 === errors;
																																			if (!valid10) {
																																				const err2 = {
																																					instancePath: instancePath + "/patternProperties",
																																					schemaPath: "#/properties/patternProperties/propertyNames",
																																					keyword: "propertyNames",
																																					params: { propertyName: key2 },
																																					message: "property name must be valid"
																																				};
																																				if (vErrors === null) vErrors = [err2];
																																				else vErrors.push(err2);
																																				errors++;
																																				validate10.errors = vErrors;
																																				return false;
																																			}
																																		}
																																		if (valid10) for (const key3 in data31) {
																																			const _errs67 = errors;
																																			if (!validate10(data31[key3], {
																																				instancePath: instancePath + "/patternProperties/" + key3.replace(/~/g, "~0").replace(/\//g, "~1"),
																																				parentData: data31,
																																				parentDataProperty: key3,
																																				rootData
																																			})) {
																																				vErrors = vErrors === null ? validate10.errors : vErrors.concat(validate10.errors);
																																				errors = vErrors.length;
																																			}
																																			if (!(_errs67 === errors)) break;
																																		}
																																	} else {
																																		validate10.errors = [{
																																			instancePath: instancePath + "/patternProperties",
																																			schemaPath: "#/properties/patternProperties/type",
																																			keyword: "type",
																																			params: { type: "object" },
																																			message: "must be object"
																																		}];
																																		return false;
																																	}
																																	var valid0 = _errs63 === errors;
																																} else var valid0 = true;
																																if (valid0) {
																																	if (data.dependencies !== void 0) {
																																		let data33 = data.dependencies;
																																		const _errs68 = errors;
																																		if (errors === _errs68) if (data33 && typeof data33 == "object" && !Array.isArray(data33)) for (const key4 in data33) {
																																			let data34 = data33[key4];
																																			const _errs71 = errors;
																																			const _errs72 = errors;
																																			let valid13 = false;
																																			const _errs73 = errors;
																																			if (!validate10(data34, {
																																				instancePath: instancePath + "/dependencies/" + key4.replace(/~/g, "~0").replace(/\//g, "~1"),
																																				parentData: data33,
																																				parentDataProperty: key4,
																																				rootData
																																			})) {
																																				vErrors = vErrors === null ? validate10.errors : vErrors.concat(validate10.errors);
																																				errors = vErrors.length;
																																			}
																																			var _valid1 = _errs73 === errors;
																																			valid13 = valid13 || _valid1;
																																			if (!valid13) {
																																				const _errs74 = errors;
																																				if (errors === errors) if (Array.isArray(data34)) {
																																					var valid15 = true;
																																					const len1 = data34.length;
																																					for (let i2 = 0; i2 < len1; i2++) {
																																						const _errs77 = errors;
																																						if (typeof data34[i2] !== "string") {
																																							const err3 = {
																																								instancePath: instancePath + "/dependencies/" + key4.replace(/~/g, "~0").replace(/\//g, "~1") + "/" + i2,
																																								schemaPath: "#/definitions/stringArray/items/type",
																																								keyword: "type",
																																								params: { type: "string" },
																																								message: "must be string"
																																							};
																																							if (vErrors === null) vErrors = [err3];
																																							else vErrors.push(err3);
																																							errors++;
																																						}
																																						var valid15 = _errs77 === errors;
																																						if (!valid15) break;
																																					}
																																					if (valid15) {
																																						let i3 = data34.length;
																																						let j1;
																																						if (i3 > 1) {
																																							const indices1 = {};
																																							for (; i3--;) {
																																								let item1 = data34[i3];
																																								if (typeof item1 !== "string") continue;
																																								if (typeof indices1[item1] == "number") {
																																									j1 = indices1[item1];
																																									const err4 = {
																																										instancePath: instancePath + "/dependencies/" + key4.replace(/~/g, "~0").replace(/\//g, "~1"),
																																										schemaPath: "#/definitions/stringArray/uniqueItems",
																																										keyword: "uniqueItems",
																																										params: {
																																											i: i3,
																																											j: j1
																																										},
																																										message: "must NOT have duplicate items (items ## " + j1 + " and " + i3 + " are identical)"
																																									};
																																									if (vErrors === null) vErrors = [err4];
																																									else vErrors.push(err4);
																																									errors++;
																																									break;
																																								}
																																								indices1[item1] = i3;
																																							}
																																						}
																																					}
																																				} else {
																																					const err5 = {
																																						instancePath: instancePath + "/dependencies/" + key4.replace(/~/g, "~0").replace(/\//g, "~1"),
																																						schemaPath: "#/definitions/stringArray/type",
																																						keyword: "type",
																																						params: { type: "array" },
																																						message: "must be array"
																																					};
																																					if (vErrors === null) vErrors = [err5];
																																					else vErrors.push(err5);
																																					errors++;
																																				}
																																				var _valid1 = _errs74 === errors;
																																				valid13 = valid13 || _valid1;
																																			}
																																			if (!valid13) {
																																				const err6 = {
																																					instancePath: instancePath + "/dependencies/" + key4.replace(/~/g, "~0").replace(/\//g, "~1"),
																																					schemaPath: "#/properties/dependencies/additionalProperties/anyOf",
																																					keyword: "anyOf",
																																					params: {},
																																					message: "must match a schema in anyOf"
																																				};
																																				if (vErrors === null) vErrors = [err6];
																																				else vErrors.push(err6);
																																				errors++;
																																				validate10.errors = vErrors;
																																				return false;
																																			} else {
																																				errors = _errs72;
																																				if (vErrors !== null) if (_errs72) vErrors.length = _errs72;
																																				else vErrors = null;
																																			}
																																			if (!(_errs71 === errors)) break;
																																		}
																																		else {
																																			validate10.errors = [{
																																				instancePath: instancePath + "/dependencies",
																																				schemaPath: "#/properties/dependencies/type",
																																				keyword: "type",
																																				params: { type: "object" },
																																				message: "must be object"
																																			}];
																																			return false;
																																		}
																																		var valid0 = _errs68 === errors;
																																	} else var valid0 = true;
																																	if (valid0) {
																																		if (data.propertyNames !== void 0) {
																																			const _errs79 = errors;
																																			if (!validate10(data.propertyNames, {
																																				instancePath: instancePath + "/propertyNames",
																																				parentData: data,
																																				parentDataProperty: "propertyNames",
																																				rootData
																																			})) {
																																				vErrors = vErrors === null ? validate10.errors : vErrors.concat(validate10.errors);
																																				errors = vErrors.length;
																																			}
																																			var valid0 = _errs79 === errors;
																																		} else var valid0 = true;
																																		if (valid0) {
																																			if (data.enum !== void 0) {
																																				let data37 = data.enum;
																																				const _errs80 = errors;
																																				if (errors === _errs80) if (Array.isArray(data37)) if (data37.length < 1) {
																																					validate10.errors = [{
																																						instancePath: instancePath + "/enum",
																																						schemaPath: "#/properties/enum/minItems",
																																						keyword: "minItems",
																																						params: { limit: 1 },
																																						message: "must NOT have fewer than 1 items"
																																					}];
																																					return false;
																																				} else {
																																					let i4 = data37.length;
																																					let j2;
																																					if (i4 > 1) {
																																						outer0: for (; i4--;) for (j2 = i4; j2--;) if (func0(data37[i4], data37[j2])) {
																																							validate10.errors = [{
																																								instancePath: instancePath + "/enum",
																																								schemaPath: "#/properties/enum/uniqueItems",
																																								keyword: "uniqueItems",
																																								params: {
																																									i: i4,
																																									j: j2
																																								},
																																								message: "must NOT have duplicate items (items ## " + j2 + " and " + i4 + " are identical)"
																																							}];
																																							return false;
																																						}
																																					}
																																				}
																																				else {
																																					validate10.errors = [{
																																						instancePath: instancePath + "/enum",
																																						schemaPath: "#/properties/enum/type",
																																						keyword: "type",
																																						params: { type: "array" },
																																						message: "must be array"
																																					}];
																																					return false;
																																				}
																																				var valid0 = _errs80 === errors;
																																			} else var valid0 = true;
																																			if (valid0) {
																																				if (data.type !== void 0) {
																																					let data38 = data.type;
																																					const _errs82 = errors;
																																					const _errs83 = errors;
																																					let valid18 = false;
																																					const _errs84 = errors;
																																					if (!(data38 === "array" || data38 === "boolean" || data38 === "integer" || data38 === "null" || data38 === "number" || data38 === "object" || data38 === "string")) {
																																						const err7 = {
																																							instancePath: instancePath + "/type",
																																							schemaPath: "#/definitions/simpleTypes/enum",
																																							keyword: "enum",
																																							params: { allowedValues: schema20.enum },
																																							message: "must be equal to one of the allowed values"
																																						};
																																						if (vErrors === null) vErrors = [err7];
																																						else vErrors.push(err7);
																																						errors++;
																																					}
																																					var _valid2 = _errs84 === errors;
																																					valid18 = valid18 || _valid2;
																																					if (!valid18) {
																																						const _errs86 = errors;
																																						if (errors === _errs86) if (Array.isArray(data38)) if (data38.length < 1) {
																																							const err8 = {
																																								instancePath: instancePath + "/type",
																																								schemaPath: "#/properties/type/anyOf/1/minItems",
																																								keyword: "minItems",
																																								params: { limit: 1 },
																																								message: "must NOT have fewer than 1 items"
																																							};
																																							if (vErrors === null) vErrors = [err8];
																																							else vErrors.push(err8);
																																							errors++;
																																						} else {
																																							var valid20 = true;
																																							const len2 = data38.length;
																																							for (let i5 = 0; i5 < len2; i5++) {
																																								let data39 = data38[i5];
																																								const _errs88 = errors;
																																								if (!(data39 === "array" || data39 === "boolean" || data39 === "integer" || data39 === "null" || data39 === "number" || data39 === "object" || data39 === "string")) {
																																									const err9 = {
																																										instancePath: instancePath + "/type/" + i5,
																																										schemaPath: "#/definitions/simpleTypes/enum",
																																										keyword: "enum",
																																										params: { allowedValues: schema20.enum },
																																										message: "must be equal to one of the allowed values"
																																									};
																																									if (vErrors === null) vErrors = [err9];
																																									else vErrors.push(err9);
																																									errors++;
																																								}
																																								var valid20 = _errs88 === errors;
																																								if (!valid20) break;
																																							}
																																							if (valid20) {
																																								let i6 = data38.length;
																																								let j3;
																																								if (i6 > 1) {
																																									outer1: for (; i6--;) for (j3 = i6; j3--;) if (func0(data38[i6], data38[j3])) {
																																										const err10 = {
																																											instancePath: instancePath + "/type",
																																											schemaPath: "#/properties/type/anyOf/1/uniqueItems",
																																											keyword: "uniqueItems",
																																											params: {
																																												i: i6,
																																												j: j3
																																											},
																																											message: "must NOT have duplicate items (items ## " + j3 + " and " + i6 + " are identical)"
																																										};
																																										if (vErrors === null) vErrors = [err10];
																																										else vErrors.push(err10);
																																										errors++;
																																										break outer1;
																																									}
																																								}
																																							}
																																						}
																																						else {
																																							const err11 = {
																																								instancePath: instancePath + "/type",
																																								schemaPath: "#/properties/type/anyOf/1/type",
																																								keyword: "type",
																																								params: { type: "array" },
																																								message: "must be array"
																																							};
																																							if (vErrors === null) vErrors = [err11];
																																							else vErrors.push(err11);
																																							errors++;
																																						}
																																						var _valid2 = _errs86 === errors;
																																						valid18 = valid18 || _valid2;
																																					}
																																					if (!valid18) {
																																						const err12 = {
																																							instancePath: instancePath + "/type",
																																							schemaPath: "#/properties/type/anyOf",
																																							keyword: "anyOf",
																																							params: {},
																																							message: "must match a schema in anyOf"
																																						};
																																						if (vErrors === null) vErrors = [err12];
																																						else vErrors.push(err12);
																																						errors++;
																																						validate10.errors = vErrors;
																																						return false;
																																					} else {
																																						errors = _errs83;
																																						if (vErrors !== null) if (_errs83) vErrors.length = _errs83;
																																						else vErrors = null;
																																					}
																																					var valid0 = _errs82 === errors;
																																				} else var valid0 = true;
																																				if (valid0) {
																																					if (data.format !== void 0) {
																																						const _errs90 = errors;
																																						if (typeof data.format !== "string") {
																																							validate10.errors = [{
																																								instancePath: instancePath + "/format",
																																								schemaPath: "#/properties/format/type",
																																								keyword: "type",
																																								params: { type: "string" },
																																								message: "must be string"
																																							}];
																																							return false;
																																						}
																																						var valid0 = _errs90 === errors;
																																					} else var valid0 = true;
																																					if (valid0) {
																																						if (data.contentMediaType !== void 0) {
																																							const _errs92 = errors;
																																							if (typeof data.contentMediaType !== "string") {
																																								validate10.errors = [{
																																									instancePath: instancePath + "/contentMediaType",
																																									schemaPath: "#/properties/contentMediaType/type",
																																									keyword: "type",
																																									params: { type: "string" },
																																									message: "must be string"
																																								}];
																																								return false;
																																							}
																																							var valid0 = _errs92 === errors;
																																						} else var valid0 = true;
																																						if (valid0) {
																																							if (data.contentEncoding !== void 0) {
																																								const _errs94 = errors;
																																								if (typeof data.contentEncoding !== "string") {
																																									validate10.errors = [{
																																										instancePath: instancePath + "/contentEncoding",
																																										schemaPath: "#/properties/contentEncoding/type",
																																										keyword: "type",
																																										params: { type: "string" },
																																										message: "must be string"
																																									}];
																																									return false;
																																								}
																																								var valid0 = _errs94 === errors;
																																							} else var valid0 = true;
																																							if (valid0) {
																																								if (data.if !== void 0) {
																																									const _errs96 = errors;
																																									if (!validate10(data.if, {
																																										instancePath: instancePath + "/if",
																																										parentData: data,
																																										parentDataProperty: "if",
																																										rootData
																																									})) {
																																										vErrors = vErrors === null ? validate10.errors : vErrors.concat(validate10.errors);
																																										errors = vErrors.length;
																																									}
																																									var valid0 = _errs96 === errors;
																																								} else var valid0 = true;
																																								if (valid0) {
																																									if (data.then !== void 0) {
																																										const _errs97 = errors;
																																										if (!validate10(data.then, {
																																											instancePath: instancePath + "/then",
																																											parentData: data,
																																											parentDataProperty: "then",
																																											rootData
																																										})) {
																																											vErrors = vErrors === null ? validate10.errors : vErrors.concat(validate10.errors);
																																											errors = vErrors.length;
																																										}
																																										var valid0 = _errs97 === errors;
																																									} else var valid0 = true;
																																									if (valid0) {
																																										if (data.else !== void 0) {
																																											const _errs98 = errors;
																																											if (!validate10(data.else, {
																																												instancePath: instancePath + "/else",
																																												parentData: data,
																																												parentDataProperty: "else",
																																												rootData
																																											})) {
																																												vErrors = vErrors === null ? validate10.errors : vErrors.concat(validate10.errors);
																																												errors = vErrors.length;
																																											}
																																											var valid0 = _errs98 === errors;
																																										} else var valid0 = true;
																																										if (valid0) {
																																											if (data.allOf !== void 0) {
																																												const _errs99 = errors;
																																												if (!validate13(data.allOf, {
																																													instancePath: instancePath + "/allOf",
																																													parentData: data,
																																													parentDataProperty: "allOf",
																																													rootData
																																												})) {
																																													vErrors = vErrors === null ? validate13.errors : vErrors.concat(validate13.errors);
																																													errors = vErrors.length;
																																												}
																																												var valid0 = _errs99 === errors;
																																											} else var valid0 = true;
																																											if (valid0) {
																																												if (data.anyOf !== void 0) {
																																													const _errs100 = errors;
																																													if (!validate13(data.anyOf, {
																																														instancePath: instancePath + "/anyOf",
																																														parentData: data,
																																														parentDataProperty: "anyOf",
																																														rootData
																																													})) {
																																														vErrors = vErrors === null ? validate13.errors : vErrors.concat(validate13.errors);
																																														errors = vErrors.length;
																																													}
																																													var valid0 = _errs100 === errors;
																																												} else var valid0 = true;
																																												if (valid0) {
																																													if (data.oneOf !== void 0) {
																																														const _errs101 = errors;
																																														if (!validate13(data.oneOf, {
																																															instancePath: instancePath + "/oneOf",
																																															parentData: data,
																																															parentDataProperty: "oneOf",
																																															rootData
																																														})) {
																																															vErrors = vErrors === null ? validate13.errors : vErrors.concat(validate13.errors);
																																															errors = vErrors.length;
																																														}
																																														var valid0 = _errs101 === errors;
																																													} else var valid0 = true;
																																													if (valid0) if (data.not !== void 0) {
																																														const _errs102 = errors;
																																														if (!validate10(data.not, {
																																															instancePath: instancePath + "/not",
																																															parentData: data,
																																															parentDataProperty: "not",
																																															rootData
																																														})) {
																																															vErrors = vErrors === null ? validate10.errors : vErrors.concat(validate10.errors);
																																															errors = vErrors.length;
																																														}
																																														var valid0 = _errs102 === errors;
																																													} else var valid0 = true;
																																												}
																																											}
																																										}
																																									}
																																								}
																																							}
																																						}
																																					}
																																				}
																																			}
																																		}
																																	}
																																}
																															}
																														}
																													}
																												}
																											}
																										}
																									}
																								}
																							}
																						}
																					}
																				}
																			}
																		}
																	}
																}
															}
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
		validate10.errors = vErrors;
		return errors === 0;
	}
}));
//#endregion
//#region ../../node_modules/.bun/@fastify+merge-json-schemas@0.2.1/node_modules/@fastify/merge-json-schemas/lib/errors.js
var require_errors = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var MergeError = class extends Error {
		constructor(keyword, schemas) {
			super();
			this.name = "JsonSchemaMergeError";
			this.code = "JSON_SCHEMA_MERGE_ERROR";
			this.message = `Failed to merge "${keyword}" keyword schemas.`;
			this.schemas = schemas;
		}
	};
	var ResolverNotFoundError = class extends Error {
		constructor(keyword, schemas) {
			super();
			this.name = "JsonSchemaMergeError";
			this.code = "JSON_SCHEMA_MERGE_ERROR";
			this.message = `Resolver for "${keyword}" keyword not found.`;
			this.schemas = schemas;
		}
	};
	var InvalidOnConflictOptionError = class extends Error {
		constructor(onConflict) {
			super();
			this.name = "JsonSchemaMergeError";
			this.code = "JSON_SCHEMA_MERGE_ERROR";
			this.message = `Invalid "onConflict" option: "${onConflict}".`;
		}
	};
	module.exports = {
		MergeError,
		ResolverNotFoundError,
		InvalidOnConflictOptionError
	};
}));
//#endregion
//#region ../../node_modules/.bun/@fastify+merge-json-schemas@0.2.1/node_modules/@fastify/merge-json-schemas/lib/resolvers.js
var require_resolvers = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { dequal: deepEqual } = require_dist();
	const { MergeError } = require_errors();
	function _arraysIntersection(arrays) {
		let intersection = arrays[0];
		for (let i = 1; i < arrays.length; i++) intersection = intersection.filter((value) => arrays[i].includes(value));
		return intersection;
	}
	function arraysIntersection(keyword, values, mergedSchema) {
		const intersection = _arraysIntersection(values);
		if (intersection.length === 0) throw new MergeError(keyword, values);
		mergedSchema[keyword] = intersection;
	}
	function hybridArraysIntersection(keyword, values, mergedSchema) {
		for (let i = 0; i < values.length; i++) if (!Array.isArray(values[i])) values[i] = [values[i]];
		const intersection = _arraysIntersection(values);
		if (intersection.length === 0) throw new MergeError(keyword, values);
		if (intersection.length === 1) mergedSchema[keyword] = intersection[0];
		else mergedSchema[keyword] = intersection;
	}
	function arraysUnion(keyword, values, mergedSchema) {
		const union = [];
		for (const array of values) for (const value of array) if (!union.includes(value)) union.push(value);
		mergedSchema[keyword] = union;
	}
	function minNumber(keyword, values, mergedSchema) {
		mergedSchema[keyword] = Math.min(...values);
	}
	function maxNumber(keyword, values, mergedSchema) {
		mergedSchema[keyword] = Math.max(...values);
	}
	function commonMultiple(keyword, values, mergedSchema) {
		const gcd = (a, b) => !b ? a : gcd(b, a % b);
		const lcm = (a, b) => a * b / gcd(a, b);
		let scale = 1;
		for (const value of values) while (value * scale % 1 !== 0) scale *= 10;
		let multiple = values[0] * scale;
		for (const value of values) multiple = lcm(multiple, value * scale);
		mergedSchema[keyword] = multiple / scale;
	}
	function allEqual(keyword, values, mergedSchema) {
		const firstValue = values[0];
		for (let i = 1; i < values.length; i++) if (!deepEqual(values[i], firstValue)) throw new MergeError(keyword, values);
		mergedSchema[keyword] = firstValue;
	}
	function skip() {}
	function booleanAnd(keyword, values, mergedSchema) {
		for (const value of values) if (value === false) {
			mergedSchema[keyword] = false;
			return;
		}
		mergedSchema[keyword] = true;
	}
	function booleanOr(keyword, values, mergedSchema) {
		for (const value of values) if (value === true) {
			mergedSchema[keyword] = true;
			return;
		}
		mergedSchema[keyword] = false;
	}
	module.exports = {
		arraysIntersection,
		hybridArraysIntersection,
		arraysUnion,
		minNumber,
		maxNumber,
		commonMultiple,
		allEqual,
		booleanAnd,
		booleanOr,
		skip
	};
}));
//#endregion
//#region ../../node_modules/.bun/@fastify+merge-json-schemas@0.2.1/node_modules/@fastify/merge-json-schemas/index.js
var require_merge_json_schemas = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { dequal: deepEqual } = require_dist();
	const resolvers = require_resolvers();
	const errors = require_errors();
	const keywordsResolvers = {
		$id: resolvers.skip,
		type: resolvers.hybridArraysIntersection,
		enum: resolvers.arraysIntersection,
		minLength: resolvers.maxNumber,
		maxLength: resolvers.minNumber,
		minimum: resolvers.maxNumber,
		maximum: resolvers.minNumber,
		multipleOf: resolvers.commonMultiple,
		exclusiveMinimum: resolvers.maxNumber,
		exclusiveMaximum: resolvers.minNumber,
		minItems: resolvers.maxNumber,
		maxItems: resolvers.minNumber,
		maxProperties: resolvers.minNumber,
		minProperties: resolvers.maxNumber,
		const: resolvers.allEqual,
		default: resolvers.allEqual,
		format: resolvers.allEqual,
		required: resolvers.arraysUnion,
		properties: mergeProperties,
		patternProperties: mergeObjects,
		additionalProperties: mergeSchemasResolver,
		items: mergeItems,
		additionalItems: mergeAdditionalItems,
		definitions: mergeObjects,
		$defs: mergeObjects,
		nullable: resolvers.booleanAnd,
		oneOf: mergeOneOf,
		anyOf: mergeOneOf,
		allOf: resolvers.arraysUnion,
		not: mergeSchemasResolver,
		if: mergeIfThenElseSchemas,
		then: resolvers.skip,
		else: resolvers.skip,
		dependencies: mergeDependencies,
		dependentRequired: mergeDependencies,
		dependentSchemas: mergeObjects,
		propertyNames: mergeSchemasResolver,
		uniqueItems: resolvers.booleanOr,
		contains: mergeSchemasResolver
	};
	function mergeSchemasResolver(keyword, values, mergedSchema, _schemas, options) {
		mergedSchema[keyword] = _mergeSchemas(values, options);
	}
	function cartesianProduct(arrays) {
		let result = [[]];
		for (const array of arrays) {
			const temp = [];
			for (const x of result) for (const y of array) temp.push([...x, y]);
			result = temp;
		}
		return result;
	}
	function mergeOneOf(keyword, values, mergedSchema, _schemas, options) {
		if (values.length === 1) {
			mergedSchema[keyword] = values[0];
			return;
		}
		const product = cartesianProduct(values);
		const mergedOneOf = [];
		for (const combination of product) try {
			const mergedSchema = _mergeSchemas(combination, options);
			if (mergedSchema !== void 0) mergedOneOf.push(mergedSchema);
		} catch (error) {
			if (error instanceof errors.MergeError) continue;
			throw error;
		}
		mergedSchema[keyword] = mergedOneOf;
	}
	function getSchemaForItem(schema, index) {
		const { items, additionalItems } = schema;
		if (Array.isArray(items)) {
			if (index < items.length) return items[index];
			return additionalItems;
		}
		if (items !== void 0) return items;
		return additionalItems;
	}
	function mergeItems(keyword, values, mergedSchema, schemas, options) {
		let maxArrayItemsLength = 0;
		for (const itemsSchema of values) if (Array.isArray(itemsSchema)) maxArrayItemsLength = Math.max(maxArrayItemsLength, itemsSchema.length);
		if (maxArrayItemsLength === 0) {
			mergedSchema[keyword] = _mergeSchemas(values, options);
			return;
		}
		const mergedItemsSchemas = [];
		for (let i = 0; i < maxArrayItemsLength; i++) {
			const indexItemSchemas = [];
			for (const schema of schemas) {
				const itemSchema = getSchemaForItem(schema, i);
				if (itemSchema !== void 0) indexItemSchemas.push(itemSchema);
			}
			mergedItemsSchemas[i] = _mergeSchemas(indexItemSchemas, options);
		}
		mergedSchema[keyword] = mergedItemsSchemas;
	}
	function mergeAdditionalItems(keyword, values, mergedSchema, schemas, options) {
		let hasArrayItems = false;
		for (const schema of schemas) if (Array.isArray(schema.items)) {
			hasArrayItems = true;
			break;
		}
		if (!hasArrayItems) {
			mergedSchema[keyword] = _mergeSchemas(values, options);
			return;
		}
		const mergedAdditionalItemsSchemas = [];
		for (const schema of schemas) {
			let additionalItemsSchema = schema.additionalItems;
			if (additionalItemsSchema === void 0 && !Array.isArray(schema.items)) additionalItemsSchema = schema.items;
			if (additionalItemsSchema !== void 0) mergedAdditionalItemsSchemas.push(additionalItemsSchema);
		}
		mergedSchema[keyword] = _mergeSchemas(mergedAdditionalItemsSchemas, options);
	}
	function getSchemaForProperty(schema, propertyName) {
		const { properties, patternProperties, additionalProperties } = schema;
		if (properties?.[propertyName] !== void 0) return properties[propertyName];
		for (const pattern of Object.keys(patternProperties ?? {})) if (new RegExp(pattern).test(propertyName)) return patternProperties[pattern];
		return additionalProperties;
	}
	function mergeProperties(keyword, _values, mergedSchema, schemas, options) {
		const foundProperties = {};
		for (const currentSchema of schemas) {
			const properties = currentSchema.properties ?? {};
			for (const propertyName of Object.keys(properties)) {
				if (foundProperties[propertyName] !== void 0) continue;
				foundProperties[propertyName] = [properties[propertyName]];
				for (const anotherSchema of schemas) {
					if (currentSchema === anotherSchema) continue;
					const propertySchema = getSchemaForProperty(anotherSchema, propertyName);
					if (propertySchema !== void 0) foundProperties[propertyName].push(propertySchema);
				}
			}
		}
		const mergedProperties = {};
		for (const property of Object.keys(foundProperties)) {
			const propertySchemas = foundProperties[property];
			mergedProperties[property] = _mergeSchemas(propertySchemas, options);
		}
		mergedSchema[keyword] = mergedProperties;
	}
	function mergeObjects(keyword, values, mergedSchema, _schemas, options) {
		const objectsProperties = {};
		for (const properties of values) for (const propertyName of Object.keys(properties)) {
			if (objectsProperties[propertyName] === void 0) objectsProperties[propertyName] = [];
			objectsProperties[propertyName].push(properties[propertyName]);
		}
		const mergedProperties = {};
		for (const propertyName of Object.keys(objectsProperties)) {
			const propertySchemas = objectsProperties[propertyName];
			mergedProperties[propertyName] = _mergeSchemas(propertySchemas, options);
		}
		mergedSchema[keyword] = mergedProperties;
	}
	function mergeIfThenElseSchemas(_keyword, _values, mergedSchema, schemas, options) {
		for (let i = 0; i < schemas.length; i++) {
			const subSchema = {
				if: schemas[i].if,
				then: schemas[i].then,
				else: schemas[i].else
			};
			if (subSchema.if === void 0) continue;
			if (mergedSchema.if === void 0) {
				mergedSchema.if = subSchema.if;
				if (subSchema.then !== void 0) mergedSchema.then = subSchema.then;
				if (subSchema.else !== void 0) mergedSchema.else = subSchema.else;
				continue;
			}
			if (mergedSchema.then !== void 0) mergedSchema.then = _mergeSchemas([mergedSchema.then, subSchema], options);
			if (mergedSchema.else !== void 0) mergedSchema.else = _mergeSchemas([mergedSchema.else, subSchema], options);
		}
	}
	function mergeDependencies(keyword, values, mergedSchema) {
		const mergedDependencies = {};
		for (const dependencies of values) for (const propertyName of Object.keys(dependencies)) {
			if (mergedDependencies[propertyName] === void 0) mergedDependencies[propertyName] = [];
			const mergedPropertyDependencies = mergedDependencies[propertyName];
			for (const propertyDependency of dependencies[propertyName]) if (!mergedPropertyDependencies.includes(propertyDependency)) mergedPropertyDependencies.push(propertyDependency);
		}
		mergedSchema[keyword] = mergedDependencies;
	}
	function _mergeSchemas(schemas, options) {
		if (schemas.length === 0) return {};
		if (schemas.length === 1) return schemas[0];
		const mergedSchema = {};
		const keywords = {};
		let allSchemasAreTrue = true;
		for (const schema of schemas) {
			if (schema === false) return false;
			if (schema === true) continue;
			allSchemasAreTrue = false;
			for (const keyword of Object.keys(schema)) {
				if (keywords[keyword] === void 0) keywords[keyword] = [];
				keywords[keyword].push(schema[keyword]);
			}
		}
		if (allSchemasAreTrue) return true;
		for (const keyword of Object.keys(keywords)) {
			const keywordValues = keywords[keyword];
			(options.resolvers[keyword] ?? options.defaultResolver)(keyword, keywordValues, mergedSchema, schemas, options);
		}
		return mergedSchema;
	}
	function defaultResolver(keyword, values, mergedSchema, _schemas, options) {
		const onConflict = options.onConflict ?? "throw";
		if (values.length === 1 || onConflict === "first") {
			mergedSchema[keyword] = values[0];
			return;
		}
		let allValuesEqual = true;
		for (let i = 1; i < values.length; i++) if (!deepEqual(values[i], values[0])) {
			allValuesEqual = false;
			break;
		}
		if (allValuesEqual) {
			mergedSchema[keyword] = values[0];
			return;
		}
		if (onConflict === "throw") throw new errors.ResolverNotFoundError(keyword, values);
		if (onConflict === "skip") return;
		throw new errors.InvalidOnConflictOptionError(onConflict);
	}
	function mergeSchemas(schemas, options = {}) {
		if (options.defaultResolver === void 0) options.defaultResolver = defaultResolver;
		options.resolvers = {
			...keywordsResolvers,
			...options.resolvers
		};
		return _mergeSchemas(schemas, options);
	}
	module.exports = {
		mergeSchemas,
		keywordsResolvers,
		defaultResolver,
		...errors
	};
}));
//#endregion
//#region ../../node_modules/.bun/fast-json-stringify@6.3.0/node_modules/fast-json-stringify/lib/merge-schemas.js
var require_merge_schemas = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { mergeSchemas: _mergeSchemas } = require_merge_json_schemas();
	function mergeSchemas(schemas) {
		return _mergeSchemas(schemas, { onConflict: "skip" });
	}
	module.exports = mergeSchemas;
}));
//#endregion
//#region ../../node_modules/.bun/fast-json-stringify@6.3.0/node_modules/fast-json-stringify/lib/standalone.js
var require_standalone$1 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	function buildStandaloneCode(contextFunc, context, serializer, validator) {
		let ajvDependencyCode = "";
		if (context.validatorSchemasIds.size > 0) {
			ajvDependencyCode += "const Validator = require('fast-json-stringify/lib/validator')\n";
			ajvDependencyCode += `const validatorState = ${JSON.stringify(validator.getState())}\n`;
			ajvDependencyCode += "const validator = Validator.restoreFromState(validatorState)\n";
		} else ajvDependencyCode += "const validator = null\n";
		const { schema, ...serializerState } = serializer.getState();
		return `
  'use strict'

  const Serializer = require('fast-json-stringify/lib/serializer')
  const serializerState = ${JSON.stringify(serializerState)}
  const serializer = Serializer.restoreFromState(serializerState)

  ${ajvDependencyCode}

  module.exports = ${contextFunc.toString()}(validator, serializer)`;
	}
	module.exports = buildStandaloneCode;
	module.exports.dependencies = {
		Serializer: require_serializer(),
		Validator: require_validator()
	};
}));
//#endregion
//#region ../../node_modules/.bun/fast-json-stringify@6.3.0/node_modules/fast-json-stringify/index.js
var require_fast_json_stringify = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { RefResolver } = require_json_schema_ref_resolver();
	const Serializer = require_serializer();
	const Validator = require_validator();
	const Location = require_location();
	const validate = require_schema_validator();
	const mergeSchemas = require_merge_schemas();
	const SINGLE_TICK = /'/g;
	let largeArraySize = 2e4;
	let largeArrayMechanism = "default";
	const serializerFns = `
const {
  asString,
  asNumber,
  asBoolean,
  asDateTime,
  asDate,
  asTime,
  asUnsafeString
} = serializer

const asInteger = serializer.asInteger.bind(serializer)

`;
	const validRoundingMethods = new Set([
		"floor",
		"ceil",
		"round",
		"trunc"
	]);
	const validLargeArrayMechanisms = new Set(["default", "json-stringify"]);
	let schemaIdCounter = 0;
	function isValidSchema(schema, name) {
		if (!validate(schema)) {
			if (name) name = `"${name}" `;
			else name = "";
			const first = validate.errors[0];
			const err = /* @__PURE__ */ new Error(`${name}schema is invalid: data${first.instancePath} ${first.message}`);
			err.errors = isValidSchema.errors;
			throw err;
		}
	}
	function resolveRef(context, location) {
		const ref = location.schema.$ref;
		let hashIndex = ref.indexOf("#");
		if (hashIndex === -1) hashIndex = ref.length;
		const schemaId = ref.slice(0, hashIndex) || location.schemaId;
		const jsonPointer = ref.slice(hashIndex) || "#";
		const schema = context.refResolver.getSchema(schemaId, jsonPointer);
		if (schema === null) throw new Error(`Cannot find reference "${ref}"`);
		const newLocation = new Location(schema, schemaId, jsonPointer);
		if (schema.$ref !== void 0) return resolveRef(context, newLocation);
		return newLocation;
	}
	function getMergedLocation(context, mergedSchemaId) {
		return new Location(context.refResolver.getSchema(mergedSchemaId, "#"), mergedSchemaId, "#");
	}
	function getSchemaId(schema, rootSchemaId) {
		if (schema.$id && schema.$id.charAt(0) !== "#") return schema.$id;
		return rootSchemaId;
	}
	function getSafeSchemaRef(context, location) {
		let schemaRef = location.getSchemaRef() || "";
		if (schemaRef.startsWith(context.rootSchemaId)) schemaRef = schemaRef.replace(context.rootSchemaId, "") || "#";
		return schemaRef;
	}
	function build(schema, options) {
		isValidSchema(schema);
		options = options || {};
		const context = {
			functions: [],
			functionsCounter: 0,
			functionsNamesBySchema: /* @__PURE__ */ new Map(),
			options,
			refResolver: new RefResolver(),
			rootSchemaId: schema.$id || `__fjs_root_${schemaIdCounter++}`,
			validatorSchemasIds: /* @__PURE__ */ new Set(),
			mergedSchemasIds: /* @__PURE__ */ new Map(),
			recursiveSchemas: /* @__PURE__ */ new Set(),
			recursivePaths: /* @__PURE__ */ new Set(),
			buildingSet: /* @__PURE__ */ new Set(),
			uid: 0
		};
		const schemaId = getSchemaId(schema, context.rootSchemaId);
		if (!context.refResolver.hasSchema(schemaId)) context.refResolver.addSchema(schema, context.rootSchemaId);
		if (options.schema) for (const key in options.schema) {
			const schema = options.schema[key];
			const schemaId = getSchemaId(schema, key);
			if (!context.refResolver.hasSchema(schemaId)) {
				isValidSchema(schema, key);
				context.refResolver.addSchema(schema, key);
			}
		}
		if (options.rounding) {
			if (!validRoundingMethods.has(options.rounding)) throw new Error(`Unsupported integer rounding method ${options.rounding}`);
		}
		if (options.largeArrayMechanism) if (validLargeArrayMechanisms.has(options.largeArrayMechanism)) largeArrayMechanism = options.largeArrayMechanism;
		else throw new Error(`Unsupported large array mechanism ${options.largeArrayMechanism}`);
		if (options.largeArraySize) {
			const largeArraySizeType = typeof options.largeArraySize;
			let parsedNumber;
			if (largeArraySizeType === "string" && Number.isFinite(parsedNumber = Number.parseInt(options.largeArraySize, 10))) largeArraySize = parsedNumber;
			else if (largeArraySizeType === "number" && Number.isInteger(options.largeArraySize)) largeArraySize = options.largeArraySize;
			else if (largeArraySizeType === "bigint") largeArraySize = Number(options.largeArraySize);
			else throw new Error(`Unsupported large array size. Expected integer-like, got ${typeof options.largeArraySize} with value ${options.largeArraySize}`);
		}
		const location = new Location(schema, context.rootSchemaId);
		detectRecursiveSchemas(context, location);
		const code = buildValue(context, location, "input");
		let contextFunctionCode = `
    ${serializerFns}
    const JSON_STR_BEGIN_OBJECT = '{'
    const JSON_STR_END_OBJECT = '}'
    const JSON_STR_BEGIN_ARRAY = '['
    const JSON_STR_END_ARRAY = ']'
    const JSON_STR_COMMA = ','
    const JSON_STR_COLONS = ':'
    const JSON_STR_QUOTE = '"'
    const JSON_STR_EMPTY_OBJECT = JSON_STR_BEGIN_OBJECT + JSON_STR_END_OBJECT
    const JSON_STR_EMPTY_ARRAY = JSON_STR_BEGIN_ARRAY + JSON_STR_END_ARRAY
    const JSON_STR_EMPTY_STRING = JSON_STR_QUOTE + JSON_STR_QUOTE
    const JSON_STR_NULL = 'null'
  `;
		if (code === "json += anonymous0(input)") contextFunctionCode += `
    ${context.functions.join("\n")}
    const main = anonymous0
    return main
    `;
		else contextFunctionCode += `
    function main (input) {
      let json = ''
      ${code}
      return json
    }
    ${context.functions.join("\n")}
    return main
    `;
		const serializer = new Serializer(options);
		const validator = new Validator(options.ajv);
		for (const schemaId of context.validatorSchemasIds) {
			const schema = context.refResolver.getSchema(schemaId);
			validator.addSchema(schema, schemaId);
			const dependencies = context.refResolver.getSchemaDependencies(schemaId);
			for (const [schemaId, schema] of Object.entries(dependencies)) validator.addSchema(schema, schemaId);
		}
		if (options.debugMode) options.mode = "debug";
		if (options.mode === "debug") return {
			validator,
			serializer,
			code: `validator\nserializer\n${contextFunctionCode}`,
			ajv: validator.ajv
		};
		const contextFunc = new Function("validator", "serializer", contextFunctionCode);
		if (options.mode === "standalone") return require_standalone$1()(contextFunc, context, serializer, validator);
		return contextFunc(validator, serializer);
	}
	const objectKeywords = [
		"properties",
		"required",
		"additionalProperties",
		"patternProperties",
		"maxProperties",
		"minProperties",
		"dependencies"
	];
	const arrayKeywords = [
		"items",
		"additionalItems",
		"maxItems",
		"minItems",
		"uniqueItems",
		"contains"
	];
	const stringKeywords = [
		"maxLength",
		"minLength",
		"pattern"
	];
	const numberKeywords = [
		"multipleOf",
		"maximum",
		"exclusiveMaximum",
		"minimum",
		"exclusiveMinimum"
	];
	/**
	* Infer type based on keyword in order to generate optimized code
	* https://datatracker.ietf.org/doc/html/draft-handrews-json-schema-validation-01#section-6
	*/
	function inferTypeByKeyword(schema) {
		for (const keyword of objectKeywords) if (keyword in schema) return "object";
		for (const keyword of arrayKeywords) if (keyword in schema) return "array";
		for (const keyword of stringKeywords) if (keyword in schema) return "string";
		for (const keyword of numberKeywords) if (keyword in schema) return "number";
		return schema.type;
	}
	function buildExtraObjectPropertiesSerializer(context, location, addComma, objVar) {
		const schema = location.schema;
		const propertiesKeys = Object.keys(schema.properties || {});
		let code = `
    for (const key of Object.keys(${objVar})) {
      if (
        ${propertiesKeys.length > 0 ? propertiesKeys.map((k) => `key === ${JSON.stringify(k)}`).join(" || ") + " ||" : ""}
        ${objVar}[key] === undefined ||
        typeof ${objVar}[key] === 'function' ||
        typeof ${objVar}[key] === 'symbol'
      ) continue
      const value = ${objVar}[key]
  `;
		const patternPropertiesLocation = location.getPropertyLocation("patternProperties");
		const patternPropertiesSchema = patternPropertiesLocation.schema;
		if (patternPropertiesSchema !== void 0) for (const propertyKey in patternPropertiesSchema) {
			const propertyLocation = patternPropertiesLocation.getPropertyLocation(propertyKey);
			code += `
        if (/${propertyKey.replace(/\\*\//g, "\\/")}/.test(key)) {
          ${addComma}
          json += asString(key) + JSON_STR_COLONS
          ${buildValue(context, propertyLocation, "value")}
          continue
        }
      `;
		}
		const additionalPropertiesSchema = location.getPropertyLocation("additionalProperties").schema;
		if (additionalPropertiesSchema !== void 0) if (additionalPropertiesSchema === true) code += `
        ${addComma}
        json += asString(key) + JSON_STR_COLONS + JSON.stringify(value)
      `;
		else {
			const propertyLocation = location.getPropertyLocation("additionalProperties");
			code += `
        ${addComma}
        json += asString(key) + JSON_STR_COLONS
        ${buildValue(context, propertyLocation, "value")}
      `;
		}
		code += `
    }
  `;
		return code;
	}
	function buildInnerObject(context, location, objVar) {
		const schema = location.schema;
		const propertiesLocation = location.getPropertyLocation("properties");
		const requiredProperties = schema.required || [];
		const propertiesKeys = Object.keys(schema.properties || {}).sort((key1, key2) => {
			const required1 = requiredProperties.includes(key1);
			return required1 === requiredProperties.includes(key2) ? 0 : required1 ? -1 : 1;
		});
		let code = "";
		for (const key of requiredProperties) if (!propertiesKeys.includes(key)) {
			const sanitizedKey = JSON.stringify(key);
			code += `if (${objVar}[${sanitizedKey}] === undefined) throw new Error('${sanitizedKey.replace(/'/g, "\\'")} is required!')\n`;
		}
		code += "json += JSON_STR_BEGIN_OBJECT\n";
		const localUid = context.uid++;
		let addComma = "";
		if (requiredProperties.length > 0) {
			for (let i = 0; i < propertiesKeys.length; i++) {
				const key = propertiesKeys[i];
				const propertyLocation = propertiesLocation.getPropertyLocation(key);
				let resolvedLocation = propertyLocation;
				if (propertyLocation.schema.$ref) resolvedLocation = resolveRef(context, propertyLocation);
				const sanitizedKey = JSON.stringify(key);
				const value = `value_${key.replace(/[^a-zA-Z0-9]/g, "_")}_${context.uid++}`;
				const defaultValue = resolvedLocation.schema.default;
				const isRequired = requiredProperties.includes(key);
				const currentAddComma = i === 0 ? "" : "json += JSON_STR_COMMA";
				code += `
      const ${value} = ${objVar}[${sanitizedKey}]
      if (${value} !== undefined) {
        ${currentAddComma}
        json += ${JSON.stringify(sanitizedKey + ":")}
        ${buildValue(context, resolvedLocation, `${value}`)}
      }`;
				if (defaultValue !== void 0) code += ` else {
        ${currentAddComma}
        json += ${JSON.stringify(sanitizedKey + ":" + JSON.stringify(defaultValue))}
      }
      `;
				else if (isRequired) code += ` else {
        throw new Error('${sanitizedKey.replace(/'/g, "\\'")} is required!')
      }
      `;
				else code += "\n";
			}
			addComma = "json += JSON_STR_COMMA";
		} else {
			if (propertiesKeys.length > 1 || schema.patternProperties || schema.additionalProperties !== void 0 && schema.additionalProperties !== false) {
				code += `let addComma_${localUid} = false\n`;
				addComma = `!addComma_${localUid} && (addComma_${localUid} = true) || (json += JSON_STR_COMMA)`;
			}
			for (const key of propertiesKeys) {
				let propertyLocation = propertiesLocation.getPropertyLocation(key);
				if (propertyLocation.schema.$ref) propertyLocation = resolveRef(context, propertyLocation);
				const sanitizedKey = JSON.stringify(key);
				const value = `value_${key.replace(/[^a-zA-Z0-9]/g, "_")}_${context.uid++}`;
				const defaultValue = propertyLocation.schema.default;
				const isRequired = requiredProperties.includes(key);
				code += `
          const ${value} = ${objVar}[${sanitizedKey}]
          if (${value} !== undefined) {
            ${addComma}
            json += ${JSON.stringify(sanitizedKey + ":")}
            ${buildValue(context, propertyLocation, `${value}`)}
          }`;
				if (defaultValue !== void 0) code += ` else {
            ${addComma}
            json += ${JSON.stringify(sanitizedKey + ":" + JSON.stringify(defaultValue))}
          }
          `;
				else if (isRequired) code += ` else {
            throw new Error('${sanitizedKey.replace(/'/g, "\\'")} is required!')
          }
          `;
				else code += "\n";
			}
		}
		if (schema.patternProperties || schema.additionalProperties) code += buildExtraObjectPropertiesSerializer(context, location, addComma, objVar);
		code += `
    json += JSON_STR_END_OBJECT
  `;
		return code;
	}
	function mergeLocations(context, mergedSchemaId, mergedLocations) {
		for (let i = 0, mergedLocationsLength = mergedLocations.length; i < mergedLocationsLength; i++) {
			const location = mergedLocations[i];
			if (location.schema.$ref) mergedLocations[i] = resolveRef(context, location);
		}
		const mergedSchemas = [];
		for (const location of mergedLocations) {
			const schema = cloneOriginSchema(context, location.schema, location.schemaId);
			delete schema.$id;
			mergedSchemas.push(schema);
		}
		const mergedSchema = mergeSchemas(mergedSchemas);
		const mergedLocation = new Location(mergedSchema, mergedSchemaId);
		context.refResolver.addSchema(mergedSchema, mergedSchemaId);
		return mergedLocation;
	}
	function cloneOriginSchema(context, schema, schemaId) {
		const clonedSchema = Array.isArray(schema) ? [] : {};
		if (schema.$id !== void 0 && schema.$id.charAt(0) !== "#") schemaId = schema.$id;
		const mergedSchemaRef = context.mergedSchemasIds.get(schema);
		if (mergedSchemaRef) context.mergedSchemasIds.set(clonedSchema, mergedSchemaRef);
		for (const key in schema) {
			let value = schema[key];
			if (key === "$ref" && typeof value === "string" && value.charAt(0) === "#") value = schemaId + value;
			if (typeof value === "object" && value !== null) value = cloneOriginSchema(context, value, schemaId);
			clonedSchema[key] = value;
		}
		return clonedSchema;
	}
	function toJSON(variableName) {
		return `(${variableName} && typeof ${variableName}.toJSON === 'function')
    ? ${variableName}.toJSON()
    : ${variableName}
  `;
	}
	function buildObject(context, location, input) {
		const schema = location.schema;
		if (context.functionsNamesBySchema.has(schema)) return `json += ${context.functionsNamesBySchema.get(schema)}(${input})`;
		const nullable = schema.nullable === true;
		const fullPath = `${location.schemaId || ""}#${location.jsonPointer || ""}`;
		if (context.recursivePaths.has(fullPath) || context.buildingSet.has(schema)) {
			const functionName = generateFuncName(context);
			context.functionsNamesBySchema.set(schema, functionName);
			const functionCode = `
      // ${getSafeSchemaRef(context, location)}
      function ${functionName} (input) {
        const obj = ${toJSON("input")}
        if (obj === null) return ${nullable ? "JSON_STR_NULL" : "JSON_STR_EMPTY_OBJECT"}
        let json = ''

        ${buildInnerObject(context, location, "obj")}
        return json
      }
    `;
			context.functions.push(functionCode);
			return `json += ${functionName}(${input})`;
		}
		context.buildingSet.add(schema);
		const objVar = `obj_${context.uid++}`;
		const code = `
    const ${objVar} = ${toJSON(input)}
    if (${objVar} === null) {
      json += ${nullable ? "JSON_STR_NULL" : "JSON_STR_EMPTY_OBJECT"}
    } else {
      ${buildInnerObject(context, location, objVar)}
    }
  `;
		context.buildingSet.delete(schema);
		return code;
	}
	function buildArray(context, location, input) {
		const schema = location.schema;
		let itemsLocation = location.getPropertyLocation("items");
		itemsLocation.schema = itemsLocation.schema || {};
		if (itemsLocation.schema.$ref) itemsLocation = resolveRef(context, itemsLocation);
		const itemsSchema = itemsLocation.schema;
		if (context.functionsNamesBySchema.has(schema)) return `json += ${context.functionsNamesBySchema.get(schema)}(${input})`;
		const nullable = schema.nullable === true;
		const fullPath = `${location.schemaId || ""}#${location.jsonPointer || ""}`;
		if (context.recursivePaths.has(fullPath) || context.buildingSet.has(schema)) {
			const functionName = generateFuncName(context);
			context.functionsNamesBySchema.set(schema, functionName);
			const schemaRef = getSafeSchemaRef(context, location);
			let functionCode = `
    function ${functionName} (obj) {
      // ${schemaRef}
      let json = ''
  `;
			functionCode += `
    if (obj === null) return ${nullable ? "JSON_STR_NULL" : "JSON_STR_EMPTY_ARRAY"}
    if (!Array.isArray(obj)) {
      throw new TypeError(\`The value of '${schemaRef}' does not match schema definition.\`)
    }
    const arrayLength = obj.length
  `;
			if (!schema.additionalItems && Array.isArray(itemsSchema)) functionCode += `
      if (arrayLength > ${itemsSchema.length}) {
        throw new Error(\`Item at ${itemsSchema.length} does not match schema definition.\`)
      }
    `;
			if (largeArrayMechanism === "json-stringify") functionCode += `if (arrayLength >= ${largeArraySize}) return JSON.stringify(obj)\n`;
			functionCode += `
    json += JSON_STR_BEGIN_ARRAY
  `;
			if (Array.isArray(itemsSchema)) {
				for (let i = 0, itemsSchemaLength = itemsSchema.length; i < itemsSchemaLength; i++) {
					let item = itemsSchema[i];
					let itemLocation = itemsLocation.getPropertyLocation(i);
					if (itemLocation.schema.$ref) {
						itemLocation = resolveRef(context, itemLocation);
						item = itemLocation.schema;
					}
					const value = `value_${i}`;
					functionCode += `const ${value} = obj[${i}]`;
					const tmpRes = buildValue(context, itemLocation, value);
					functionCode += `
        if (${i} < arrayLength) {
          if (${buildArrayTypeCondition(item.type, value)}) {
            if (${i}) {
              json += JSON_STR_COMMA
            }
            ${tmpRes}
          } else {
            throw new Error(\`Item at ${i} does not match schema definition.\`)
          }
        }
        `;
				}
				if (schema.additionalItems) functionCode += `
        for (let i = ${itemsSchema.length}; i < arrayLength; i++) {
          if (i) {
            json += JSON_STR_COMMA
          }
          json += JSON.stringify(obj[i])
        }`;
			} else {
				const code = buildValue(context, itemsLocation, "value");
				functionCode += `
      if (arrayLength > 0) {
        const value = obj[0]
        ${code}
        for (let i = 1; i < arrayLength; i++) {
          json += JSON_STR_COMMA
          const value = obj[i]
          ${code}
        }
      }`;
			}
			functionCode += `
      return json + JSON_STR_END_ARRAY
    }`;
			context.functions.push(functionCode);
			return `json += ${functionName}(${input})`;
		}
		context.buildingSet.add(schema);
		const safeSchemaRef = getSafeSchemaRef(context, location);
		const objVar = `obj_${context.uid++}`;
		let inlinedCode = `
    const ${objVar} = ${input}
    if (${objVar} === null) {
      json += ${nullable ? "JSON_STR_NULL" : "JSON_STR_EMPTY_ARRAY"}
    } else if (!Array.isArray(${objVar})) {
      throw new TypeError(\`The value of '${safeSchemaRef}' does not match schema definition.\`)
    } else {
      const arrayLength_${objVar} = ${objVar}.length
  `;
		if (!schema.additionalItems && Array.isArray(itemsSchema)) inlinedCode += `
      if (arrayLength_${objVar} > ${itemsSchema.length}) {
        throw new Error(\`Item at ${itemsSchema.length} does not match schema definition.\`)
      }
    `;
		if (largeArrayMechanism === "json-stringify") inlinedCode += `if (arrayLength_${objVar} >= ${largeArraySize}) json += JSON.stringify(${objVar})\n else {`;
		inlinedCode += `
    json += JSON_STR_BEGIN_ARRAY
  `;
		if (Array.isArray(itemsSchema)) {
			const localUid = context.uid++;
			inlinedCode += `let addComma_${localUid} = false\n`;
			for (let i = 0, itemsSchemaLength = itemsSchema.length; i < itemsSchemaLength; i++) {
				let item = itemsSchema[i];
				let itemLocation = itemsLocation.getPropertyLocation(i);
				if (itemLocation.schema.$ref) {
					itemLocation = resolveRef(context, itemLocation);
					item = itemLocation.schema;
				}
				const value = `value_${i}_${context.uid++}`;
				inlinedCode += `const ${value} = ${objVar}[${i}]`;
				const tmpRes = buildValue(context, itemLocation, value);
				inlinedCode += `
        if (${i} < arrayLength_${objVar}) {
          if (${buildArrayTypeCondition(item.type, value)}) {
            !addComma_${localUid} && (addComma_${localUid} = true) || (json += JSON_STR_COMMA)
            ${tmpRes}
          } else {
            throw new Error(\`Item at ${i} does not match schema definition.\`)
          }
        }
        `;
			}
			if (schema.additionalItems) inlinedCode += `
        for (let i = ${itemsSchema.length}; i < arrayLength_${objVar}; i++) {
          !addComma_${localUid} && (addComma_${localUid} = true) || (json += JSON_STR_COMMA)
          json += JSON.stringify(${objVar}[i])
        }`;
		} else {
			const code = buildValue(context, itemsLocation, "value");
			inlinedCode += `
      if (arrayLength_${objVar} > 0) {
        const value = ${objVar}[0]
        ${code}
        for (let i = 1; i < arrayLength_${objVar}; i++) {
          json += JSON_STR_COMMA
          const value = ${objVar}[i]
          ${code}
        }
      }`;
		}
		inlinedCode += `
    json += JSON_STR_END_ARRAY
  `;
		if (largeArrayMechanism === "json-stringify") inlinedCode += "}";
		inlinedCode += "}";
		context.buildingSet.delete(schema);
		return inlinedCode;
	}
	function buildArrayTypeCondition(type, accessor) {
		let condition;
		switch (type) {
			case "null":
				condition = `${accessor} === null`;
				break;
			case "string":
				condition = `typeof ${accessor} === 'string' ||
      ${accessor} === null ||
      ${accessor} instanceof Date ||
      ${accessor} instanceof RegExp ||
      (
        typeof ${accessor} === "object" &&
        typeof ${accessor}.toString === "function" &&
        ${accessor}.toString !== Object.prototype.toString
      )`;
				break;
			case "integer":
				condition = `Number.isInteger(${accessor})`;
				break;
			case "number":
				condition = `Number.isFinite(${accessor})`;
				break;
			case "boolean":
				condition = `typeof ${accessor} === 'boolean'`;
				break;
			case "object":
				condition = `${accessor} && typeof ${accessor} === 'object' && ${accessor}.constructor === Object`;
				break;
			case "array":
				condition = `Array.isArray(${accessor})`;
				break;
			default: if (Array.isArray(type)) condition = `(${type.map((subType) => {
				return buildArrayTypeCondition(subType, accessor);
			}).join(" || ")})`;
		}
		return condition;
	}
	function generateFuncName(context) {
		return "anonymous" + context.functionsCounter++;
	}
	function buildMultiTypeSerializer(context, location, input) {
		const types = location.schema.type.sort((t1) => t1 === "null" ? -1 : 1);
		let code = "";
		types.forEach((type, index) => {
			location.schema = {
				...location.schema,
				type
			};
			const nestedResult = buildSingleTypeSerializer(context, location, input);
			const statement = index === 0 ? "if" : "else if";
			switch (type) {
				case "null":
					code += `
          ${statement} (${input} === null) {
            ${nestedResult}
          }
          `;
					break;
				case "string":
					code += `
          ${statement}(
            typeof ${input} === "string" ||
            ${input} === null ||
            ${input} instanceof Date ||
            ${input} instanceof RegExp ||
            (
              typeof ${input} === "object" &&
              typeof ${input}.toString === "function" &&
              ${input}.toString !== Object.prototype.toString
            )
          ) {
            ${nestedResult}
          }
        `;
					break;
				case "array":
					code += `
          ${statement}(Array.isArray(${input})) {
            ${nestedResult}
          }
        `;
					break;
				case "integer":
					code += `
          ${statement}(Number.isInteger(${input}) || ${input} === null) {
            ${nestedResult}
          }
        `;
					break;
				default:
					code += `
          ${statement}(typeof ${input} === "${type}" || ${input} === null) {
            ${nestedResult}
          }
        `;
					break;
			}
		});
		code += `
    else throw new TypeError(\`The value of '${getSafeSchemaRef(context, location)}' does not match schema definition.\`)
  `;
		return code;
	}
	function buildSingleTypeSerializer(context, location, input) {
		const schema = location.schema;
		switch (schema.type) {
			case "null": return "json += JSON_STR_NULL";
			case "string": if (schema.format === "date-time") return `json += asDateTime(${input})`;
			else if (schema.format === "date") return `json += asDate(${input})`;
			else if (schema.format === "time") return `json += asTime(${input})`;
			else if (schema.format === "unsafe") return `json += asUnsafeString(${input})`;
			else return `
        if (typeof ${input} !== 'string') {
          if (${input} === null) {
            json += JSON_STR_EMPTY_STRING
          } else if (${input} instanceof Date) {
            json += JSON_STR_QUOTE + ${input}.toISOString() + JSON_STR_QUOTE
          } else if (${input} instanceof RegExp) {
            json += asString(${input}.source)
          } else {
            json += asString(${input}.toString())
          }
        } else {
          json += asString(${input})
        }
        `;
			case "integer": return `json += asInteger(${input})`;
			case "number": return `json += asNumber(${input})`;
			case "boolean": return `json += asBoolean(${input})`;
			case "object": return buildObject(context, location, input);
			case "array": return buildArray(context, location, input);
			case void 0: return `json += JSON.stringify(${input})`;
			default: throw new Error(`${schema.type} unsupported`);
		}
	}
	function detectRecursiveSchemas(context, location) {
		const pathStack = /* @__PURE__ */ new Set();
		function traverse(location) {
			const schema = location.schema;
			if (typeof schema !== "object" || schema === null) return;
			const fullPath = `${location.schemaId || ""}#${location.jsonPointer || ""}`;
			if (pathStack.has(fullPath)) {
				let inCycle = false;
				for (const p of pathStack) {
					if (p === fullPath) inCycle = true;
					if (inCycle) context.recursivePaths.add(p);
				}
				context.recursivePaths.add(fullPath);
				return;
			}
			pathStack.add(fullPath);
			if (schema.$ref) try {
				traverse(resolveRef(context, location));
			} catch (err) {}
			if (schema.properties) {
				const propertiesLocation = location.getPropertyLocation("properties");
				for (const key in schema.properties) traverse(propertiesLocation.getPropertyLocation(key));
			}
			if (schema.additionalProperties && typeof schema.additionalProperties === "object") traverse(location.getPropertyLocation("additionalProperties"));
			if (schema.patternProperties) {
				const patternPropertiesLocation = location.getPropertyLocation("patternProperties");
				for (const key in schema.patternProperties) traverse(patternPropertiesLocation.getPropertyLocation(key));
			}
			if (schema.items) {
				const itemsLocation = location.getPropertyLocation("items");
				if (Array.isArray(schema.items)) for (let i = 0; i < schema.items.length; i++) traverse(itemsLocation.getPropertyLocation(i));
				else traverse(itemsLocation);
			}
			if (schema.additionalItems && typeof schema.additionalItems === "object") traverse(location.getPropertyLocation("additionalItems"));
			if (schema.oneOf) {
				const oneOfLocation = location.getPropertyLocation("oneOf");
				for (let i = 0; i < schema.oneOf.length; i++) traverse(oneOfLocation.getPropertyLocation(i));
			}
			if (schema.anyOf) {
				const anyOfLocation = location.getPropertyLocation("anyOf");
				for (let i = 0; i < schema.anyOf.length; i++) traverse(anyOfLocation.getPropertyLocation(i));
			}
			if (schema.allOf) {
				const allOfLocation = location.getPropertyLocation("allOf");
				for (let i = 0; i < schema.allOf.length; i++) traverse(allOfLocation.getPropertyLocation(i));
			}
			if (schema.then) traverse(location.getPropertyLocation("then"));
			if (schema.else) traverse(location.getPropertyLocation("else"));
			pathStack.delete(fullPath);
		}
		traverse(location);
	}
	function buildConstSerializer(location, input) {
		const schema = location.schema;
		const type = schema.type;
		const hasNullType = Array.isArray(type) && type.includes("null");
		let code = "";
		if (hasNullType) code += `
      if (${input} === null) {
        json += JSON_STR_NULL
      } else {
    `;
		code += `json += '${JSON.stringify(schema.const).replace(SINGLE_TICK, "\\'")}'`;
		if (hasNullType) code += `
      }
    `;
		return code;
	}
	function buildAllOf(context, location, input) {
		const schema = location.schema;
		let mergedSchemaId = context.mergedSchemasIds.get(schema);
		if (mergedSchemaId) return buildValue(context, getMergedLocation(context, mergedSchemaId), input);
		mergedSchemaId = `__fjs_merged_${schemaIdCounter++}`;
		context.mergedSchemasIds.set(schema, mergedSchemaId);
		const { allOf, ...schemaWithoutAllOf } = location.schema;
		const locations = [new Location(schemaWithoutAllOf, location.schemaId, location.jsonPointer)];
		const allOfsLocation = location.getPropertyLocation("allOf");
		for (let i = 0, allOfLength = allOf.length; i < allOfLength; i++) locations.push(allOfsLocation.getPropertyLocation(i));
		return buildValue(context, mergeLocations(context, mergedSchemaId, locations), input);
	}
	function buildOneOf(context, location, input) {
		context.validatorSchemasIds.add(location.schemaId);
		const type = location.schema.anyOf ? "anyOf" : "oneOf";
		const { [type]: oneOfs, ...schemaWithoutAnyOf } = location.schema;
		const locationWithoutOneOf = new Location(schemaWithoutAnyOf, location.schemaId, location.jsonPointer);
		const oneOfsLocation = location.getPropertyLocation(type);
		let code = "";
		for (let index = 0, oneOfsLength = oneOfs.length; index < oneOfsLength; index++) {
			const optionLocation = oneOfsLocation.getPropertyLocation(index);
			const optionSchema = optionLocation.schema;
			let mergedSchemaId = context.mergedSchemasIds.get(optionSchema);
			let mergedLocation = null;
			if (mergedSchemaId) mergedLocation = getMergedLocation(context, mergedSchemaId);
			else {
				mergedSchemaId = `__fjs_merged_${schemaIdCounter++}`;
				context.mergedSchemasIds.set(optionSchema, mergedSchemaId);
				mergedLocation = mergeLocations(context, mergedSchemaId, [locationWithoutOneOf, optionLocation]);
			}
			const nestedResult = buildValue(context, mergedLocation, input);
			const schemaRef = optionLocation.getSchemaRef();
			code += `
      ${index === 0 ? "if" : "else if"}(validator.validate("${schemaRef}", ${input})) {
        ${nestedResult}
      }
    `;
		}
		code += `
    else throw new TypeError(\`The value of '${getSafeSchemaRef(context, location)}' does not match schema definition.\`)
  `;
		return code;
	}
	function buildIfThenElse(context, location, input) {
		context.validatorSchemasIds.add(location.schemaId);
		const { if: ifSchema, then: thenSchema, else: elseSchema, ...schemaWithoutIfThenElse } = location.schema;
		const rootLocation = new Location(schemaWithoutIfThenElse, location.schemaId, location.jsonPointer);
		const ifSchemaRef = location.getPropertyLocation("if").getSchemaRef();
		const thenLocation = location.getPropertyLocation("then");
		let thenMergedSchemaId = context.mergedSchemasIds.get(thenSchema);
		let thenMergedLocation = null;
		if (thenMergedSchemaId) thenMergedLocation = getMergedLocation(context, thenMergedSchemaId);
		else {
			thenMergedSchemaId = `__fjs_merged_${schemaIdCounter++}`;
			context.mergedSchemasIds.set(thenSchema, thenMergedSchemaId);
			thenMergedLocation = mergeLocations(context, thenMergedSchemaId, [rootLocation, thenLocation]);
		}
		if (!elseSchema) return `
      if (validator.validate("${ifSchemaRef}", ${input})) {
        ${buildValue(context, thenMergedLocation, input)}
      } else {
        ${buildValue(context, rootLocation, input)}
      }
    `;
		const elseLocation = location.getPropertyLocation("else");
		let elseMergedSchemaId = context.mergedSchemasIds.get(elseSchema);
		let elseMergedLocation = null;
		if (elseMergedSchemaId) elseMergedLocation = getMergedLocation(context, elseMergedSchemaId);
		else {
			elseMergedSchemaId = `__fjs_merged_${schemaIdCounter++}`;
			context.mergedSchemasIds.set(elseSchema, elseMergedSchemaId);
			elseMergedLocation = mergeLocations(context, elseMergedSchemaId, [rootLocation, elseLocation]);
		}
		return `
    if (validator.validate("${ifSchemaRef}", ${input})) {
      ${buildValue(context, thenMergedLocation, input)}
    } else {
      ${buildValue(context, elseMergedLocation, input)}
    }
  `;
	}
	function buildValue(context, location, input) {
		let schema = location.schema;
		if (typeof schema === "boolean") return `json += JSON.stringify(${input})`;
		if (schema.$ref) {
			location = resolveRef(context, location);
			schema = location.schema;
		}
		if (schema.allOf) return buildAllOf(context, location, input);
		if (schema.anyOf || schema.oneOf) return buildOneOf(context, location, input);
		if (schema.if && schema.then) return buildIfThenElse(context, location, input);
		if (schema.type === void 0) {
			const inferredType = inferTypeByKeyword(schema);
			if (inferredType) schema.type = inferredType;
		}
		let code = "";
		const type = schema.type;
		const nullable = schema.nullable === true;
		if (nullable) code += `
      if (${input} === null) {
        json += JSON_STR_NULL
      } else {
    `;
		if (schema.const !== void 0) code += buildConstSerializer(location, input);
		else if (Array.isArray(type)) code += buildMultiTypeSerializer(context, location, input);
		else code += buildSingleTypeSerializer(context, location, input);
		if (nullable) code += `
      }
    `;
		return code;
	}
	module.exports = build;
	module.exports.default = build;
	module.exports.build = build;
	module.exports.validLargeArrayMechanisms = validLargeArrayMechanisms;
	module.exports.restore = function({ code, validator, serializer }) {
		return Function.apply(null, [
			"validator",
			"serializer",
			code
		]).apply(null, [validator, serializer]);
	};
}));
//#endregion
//#region ../../node_modules/.bun/@fastify+fast-json-stringify-compiler@5.0.3/node_modules/@fastify/fast-json-stringify-compiler/standalone.js
var require_standalone = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const fastJsonStringify = require_fast_json_stringify();
	function SerializerSelector() {
		return function buildSerializerFactory(externalSchemas, serializerOpts) {
			const fjsOpts = Object.assign({}, serializerOpts, { schema: externalSchemas });
			return responseSchemaCompiler.bind(null, fjsOpts);
		};
	}
	function responseSchemaCompiler(fjsOpts, { schema }) {
		if (fjsOpts.schema && schema.$id && fjsOpts.schema[schema.$id]) {
			fjsOpts.schema = { ...fjsOpts.schema };
			delete fjsOpts.schema[schema.$id];
		}
		return fastJsonStringify(schema, fjsOpts);
	}
	function StandaloneSerializer(options = { readMode: true }) {
		if (options.readMode === true && typeof options.restoreFunction !== "function") throw new Error("You must provide a function for the restoreFunction-option when readMode ON");
		if (options.readMode !== true && typeof options.storeFunction !== "function") throw new Error("You must provide a function for the storeFunction-option when readMode OFF");
		if (options.readMode === true) return function wrapper() {
			return function(opts) {
				return options.restoreFunction(opts);
			};
		};
		const factory = SerializerSelector();
		return function wrapper(externalSchemas, serializerOpts = {}) {
			serializerOpts.mode = "standalone";
			const compiler = factory(externalSchemas, serializerOpts);
			return function(opts) {
				const serializeFuncCode = compiler(opts);
				options.storeFunction(opts, serializeFuncCode);
				return new Function(serializeFuncCode);
			};
		};
	}
	module.exports.SerializerSelector = SerializerSelector;
	module.exports.StandaloneSerializer = StandaloneSerializer;
	module.exports.default = StandaloneSerializer;
}));
//#endregion
//#region ../../node_modules/.bun/@fastify+fast-json-stringify-compiler@5.0.3/node_modules/@fastify/fast-json-stringify-compiler/index.js
var require_fast_json_stringify_compiler = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { SerializerSelector, StandaloneSerializer } = require_standalone();
	module.exports = SerializerSelector;
	module.exports.default = SerializerSelector;
	module.exports.SerializerSelector = SerializerSelector;
	module.exports.StandaloneSerializer = StandaloneSerializer;
}));
//#endregion
export { require_serializer as n, require_rfdc as r, require_fast_json_stringify_compiler as t };
