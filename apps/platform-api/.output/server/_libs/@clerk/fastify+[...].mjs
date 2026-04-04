import { i as __toESM, t as __commonJSMin } from "../../_runtime.mjs";
import { a as constants, c as LEGACY_DEV_INSTANCE_SUFFIXES, i as AuthStatus, l as LOCAL_ENV_SUFFIXES, n as stripTrailingSlashes, o as getAuthObjectForAcceptedToken, r as createClerkClient, s as parsePublishableKey, t as clerkFrontendApiProxy, u as STAGING_ENV_SUFFIXES } from "../clerk__backend+clerk__shared.mjs";
import { Readable } from "stream";
//#region ../../node_modules/.bun/@clerk+fastify@3.1.6+8de7fc5233a3459c/node_modules/@clerk/fastify/dist/chunk-RY4T2JMQ.mjs
var fastifyRequestToRequest = (req) => {
	const headers = new Headers(Object.keys(req.headers).reduce((acc, key) => {
		const value = req.headers[key];
		if (!value) return acc;
		if (typeof value === "string") acc.set(key, value);
		else acc.set(key, value.join(","));
		return acc;
	}, new Headers()));
	const dummyOriginReqUrl = new URL(req.url || "", `${req.protocol}://clerk-dummy`);
	return new Request(dummyOriginReqUrl, {
		method: req.method,
		headers
	});
};
var requestToProxyRequest = (req) => {
	const headers = new Headers();
	Object.entries(req.headers).forEach(([key, value]) => {
		if (value) headers.set(key, Array.isArray(value) ? value.join(", ") : value);
	});
	const forwardedProto = req.headers["x-forwarded-proto"];
	const protocol = ((Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto) || "").split(",")[0].trim() === "https" || req.protocol === "https" ? "https" : "http";
	const forwardedHost = req.headers["x-forwarded-host"];
	const host = ((Array.isArray(forwardedHost) ? forwardedHost[0] : forwardedHost) || "").split(",")[0].trim() || req.hostname || "localhost";
	const url = new URL(req.url || "", `${protocol}://${host}`);
	const hasBody = [
		"POST",
		"PUT",
		"PATCH"
	].includes(req.method);
	return new Request(url.toString(), {
		method: req.method,
		headers,
		body: hasBody ? Readable.toWeb(req.raw) : void 0,
		duplex: hasBody ? "half" : void 0
	});
};
//#endregion
//#region ../../node_modules/.bun/fastify-plugin@5.1.0/node_modules/fastify-plugin/lib/getPluginName.js
var require_getPluginName = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const fpStackTracePattern = /at\s(?:.*\.)?plugin\s.*\n\s*(.*)/;
	const fileNamePattern = /(\w*(\.\w*)*)\..*/;
	module.exports = function getPluginName(fn) {
		if (fn.name.length > 0) return fn.name;
		const stackTraceLimit = Error.stackTraceLimit;
		Error.stackTraceLimit = 10;
		try {
			throw new Error("anonymous function");
		} catch (e) {
			Error.stackTraceLimit = stackTraceLimit;
			return extractPluginName(e.stack);
		}
	};
	function extractPluginName(stack) {
		const m = stack.match(fpStackTracePattern);
		return m ? m[1].split(/[/\\]/).slice(-1)[0].match(fileNamePattern)[1] : "anonymous";
	}
	module.exports.extractPluginName = extractPluginName;
}));
//#endregion
//#region ../../node_modules/.bun/fastify-plugin@5.1.0/node_modules/fastify-plugin/lib/toCamelCase.js
var require_toCamelCase = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = function toCamelCase(name) {
		if (name[0] === "@") name = name.slice(1).replace("/", "-");
		return name.replace(/-(.)/g, function(match, g1) {
			return g1.toUpperCase();
		});
	};
}));
//#endregion
//#region ../../node_modules/.bun/@clerk+shared@4.4.0+bf16f8eded5e12ee/node_modules/@clerk/shared/dist/runtime/apiUrlFromPublishableKey.mjs
var import_plugin = /* @__PURE__ */ __toESM((/* @__PURE__ */ __commonJSMin(((exports, module) => {
	const getPluginName = require_getPluginName();
	const toCamelCase = require_toCamelCase();
	let count = 0;
	function plugin(fn, options = {}) {
		let autoName = false;
		if (fn.default !== void 0) fn = fn.default;
		if (typeof fn !== "function") throw new TypeError(`fastify-plugin expects a function, instead got a '${typeof fn}'`);
		if (typeof options === "string") options = { fastify: options };
		if (typeof options !== "object" || Array.isArray(options) || options === null) throw new TypeError("The options object should be an object");
		if (options.fastify !== void 0 && typeof options.fastify !== "string") throw new TypeError(`fastify-plugin expects a version string, instead got '${typeof options.fastify}'`);
		if (!options.name) {
			autoName = true;
			options.name = getPluginName(fn) + "-auto-" + count++;
		}
		fn[Symbol.for("skip-override")] = options.encapsulate !== true;
		fn[Symbol.for("fastify.display-name")] = options.name;
		fn[Symbol.for("plugin-meta")] = options;
		if (!fn.default) fn.default = fn;
		const camelCase = toCamelCase(options.name);
		if (!autoName && !fn[camelCase]) fn[camelCase] = fn;
		return fn;
	}
	module.exports = plugin;
	module.exports.default = plugin;
	module.exports.fastifyPlugin = plugin;
})))(), 1);
/**
* Get the correct API url based on the publishable key.
*
* @param publishableKey - The publishable key to parse.
* @returns One of Clerk's API URLs.
*/
const apiUrlFromPublishableKey = (publishableKey) => {
	const frontendApi = parsePublishableKey(publishableKey)?.frontendApi;
	if (frontendApi?.startsWith("clerk.") && LEGACY_DEV_INSTANCE_SUFFIXES.some((suffix) => frontendApi?.endsWith(suffix))) return "https://api.clerk.com";
	if (LOCAL_ENV_SUFFIXES.some((suffix) => frontendApi?.endsWith(suffix))) return "https://api.lclclerk.com";
	if (STAGING_ENV_SUFFIXES.some((suffix) => frontendApi?.endsWith(suffix))) return "https://api.clerkstage.dev";
	return "https://api.clerk.com";
};
//#endregion
//#region ../../node_modules/.bun/@clerk+fastify@3.1.6+8de7fc5233a3459c/node_modules/@clerk/fastify/dist/index.mjs
var ALLOWED_HOOKS = ["onRequest", "preHandler"];
var API_VERSION = process.env.CLERK_API_VERSION || "v1";
var SECRET_KEY = process.env.CLERK_SECRET_KEY || "";
var MACHINE_SECRET_KEY = process.env.CLERK_MACHINE_SECRET_KEY || "";
var PUBLISHABLE_KEY = process.env.CLERK_PUBLISHABLE_KEY || "";
var API_URL = process.env.CLERK_API_URL || apiUrlFromPublishableKey(PUBLISHABLE_KEY);
var JWT_KEY = process.env.CLERK_JWT_KEY || "";
var SDK_METADATA = {
	name: "@clerk/fastify",
	version: "3.1.6",
	environment: "production"
};
var { Cookies, Headers: Headers$1 } = constants;
var clerkClient = createClerkClient({
	secretKey: SECRET_KEY,
	machineSecretKey: MACHINE_SECRET_KEY,
	apiUrl: API_URL,
	apiVersion: API_VERSION,
	jwtKey: JWT_KEY,
	userAgent: `@clerk/fastify@3.1.6`,
	sdkMetadata: SDK_METADATA
});
var withClerkMiddleware = (options) => {
	const frontendApiProxy = options.frontendApiProxy;
	const proxyPath = stripTrailingSlashes(frontendApiProxy?.path ?? "/__clerk") || "/__clerk";
	return async (fastifyRequest, reply) => {
		const publishableKey = options.publishableKey || PUBLISHABLE_KEY;
		const secretKey = options.secretKey || SECRET_KEY;
		let resolvedProxyUrl = options.proxyUrl;
		if (frontendApiProxy) {
			const requestUrl = new URL(fastifyRequest.url, `${fastifyRequest.protocol}://${fastifyRequest.hostname || "localhost"}`);
			if (typeof frontendApiProxy.enabled === "function" ? frontendApiProxy.enabled(requestUrl) : frontendApiProxy.enabled) {
				if (requestUrl.pathname === proxyPath || requestUrl.pathname.startsWith(proxyPath + "/")) {
					const proxyResponse = await clerkFrontendApiProxy(requestToProxyRequest(fastifyRequest), {
						proxyPath,
						publishableKey,
						secretKey
					});
					reply.code(proxyResponse.status);
					proxyResponse.headers.forEach((value, key) => {
						reply.header(key, value);
					});
					if (proxyResponse.body) {
						const reader = proxyResponse.body.getReader();
						const stream = new Readable({ async read() {
							try {
								const { done, value } = await reader.read();
								if (done) this.push(null);
								else this.push(Buffer.from(value));
							} catch (error) {
								this.destroy(error instanceof Error ? error : new Error(String(error)));
							}
						} });
						return reply.send(stream);
					}
					return reply.send();
				}
				if (!resolvedProxyUrl) resolvedProxyUrl = proxyPath;
			}
		}
		const req = fastifyRequestToRequest(fastifyRequest);
		const requestState = await clerkClient.authenticateRequest(req, {
			...options,
			secretKey,
			publishableKey,
			proxyUrl: resolvedProxyUrl,
			acceptsToken: "any"
		});
		requestState.headers.forEach((value, key) => reply.header(key, value));
		if (requestState.headers.get(Headers$1.Location)) return reply.code(307).send();
		else if (requestState.status === AuthStatus.Handshake) throw new Error("Clerk: handshake status without redirect");
		fastifyRequest.auth = requestState.toAuth();
	};
};
var plugin = (instance, opts, done) => {
	instance.decorateRequest("auth", null);
	const hookName = opts.hookName || "preHandler";
	if (!ALLOWED_HOOKS.includes(hookName)) throw new Error(`Unsupported hookName: ${hookName}`);
	instance.addHook(hookName, withClerkMiddleware(opts));
	done();
};
var clerkPlugin = (0, import_plugin.default)(plugin, {
	name: "@clerk/fastify",
	fastify: "5.x"
});
var createErrorMessage = (msg) => {
	return `\u{1F512} Clerk: ${msg.trim()}

For more info, check out the docs: https://clerk.com/docs,
or come say hi in our discord server: https://clerk.com/discord
`;
};
var pluginRegistrationRequired = createErrorMessage(`The "clerkPlugin" should be registered before using the "getAuth".
Example:

import { clerkPlugin } from '@clerk/fastify';

const server: FastifyInstance = Fastify({ logger: true });
server.register(clerkPlugin);
`);
var getAuth = ((req, options) => {
	const authReq = req;
	if (!authReq.auth) throw new Error(pluginRegistrationRequired);
	return getAuthObjectForAcceptedToken({
		authObject: authReq.auth,
		acceptsToken: options?.acceptsToken
	});
});
//#endregion
export { clerkPlugin as n, getAuth as r, clerkClient as t };
