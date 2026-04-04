import { r as __require, t as __commonJSMin } from "../_runtime.mjs";
import { t as require_boot } from "./avvio+fastq+reusify.mjs";
import { t as require_error } from "./fastify__error.mjs";
import { t as require_abstract_logging } from "./abstract-logging.mjs";
import { t as require_redact } from "./pinojs__redact.mjs";
import { t as require_atomic_sleep } from "./atomic-sleep.mjs";
import { n as require_serializer, r as require_rfdc, t as require_fast_json_stringify_compiler } from "./@fastify/fast-json-stringify-compiler+[...].mjs";
import { t as require_proxy_addr } from "./fastify__proxy-addr+ipaddr.js.mjs";
import { s as require_fast_deep_equal, t as require_ajv_compiler } from "./@fastify/ajv-compiler+[...].mjs";
import { I as require_semver } from "./@workflow/core+[...].mjs";
import { t as require_lib } from "./fast-querystring.mjs";
import { t as require_dist$1 } from "./cookie.mjs";
//#region ../../node_modules/.bun/fastify@5.8.4/node_modules/fastify/lib/symbols.js
var require_symbols$1 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = {
		kAvvioBoot: Symbol("fastify.avvioBoot"),
		kChildren: Symbol("fastify.children"),
		kServerBindings: Symbol("fastify.serverBindings"),
		kBodyLimit: Symbol("fastify.bodyLimit"),
		kSupportedHTTPMethods: Symbol("fastify.acceptedHTTPMethods"),
		kRoutePrefix: Symbol("fastify.routePrefix"),
		kLogLevel: Symbol("fastify.logLevel"),
		kLogSerializers: Symbol("fastify.logSerializers"),
		kHooks: Symbol("fastify.hooks"),
		kContentTypeParser: Symbol("fastify.contentTypeParser"),
		kState: Symbol("fastify.state"),
		kOptions: Symbol("fastify.options"),
		kDisableRequestLogging: Symbol("fastify.disableRequestLogging"),
		kPluginNameChain: Symbol("fastify.pluginNameChain"),
		kRouteContext: Symbol("fastify.context"),
		kGenReqId: Symbol("fastify.genReqId"),
		kHttp2ServerSessions: Symbol("fastify.http2ServerSessions"),
		kSchemaController: Symbol("fastify.schemaController"),
		kSchemaHeaders: Symbol("headers-schema"),
		kSchemaParams: Symbol("params-schema"),
		kSchemaQuerystring: Symbol("querystring-schema"),
		kSchemaBody: Symbol("body-schema"),
		kSchemaResponse: Symbol("response-schema"),
		kSchemaErrorFormatter: Symbol("fastify.schemaErrorFormatter"),
		kSchemaVisited: Symbol("fastify.schemas.visited"),
		kRequest: Symbol("fastify.Request"),
		kRequestPayloadStream: Symbol("fastify.RequestPayloadStream"),
		kRequestAcceptVersion: Symbol("fastify.RequestAcceptVersion"),
		kRequestCacheValidateFns: Symbol("fastify.request.cache.validateFns"),
		kRequestOriginalUrl: Symbol("fastify.request.originalUrl"),
		kRequestSignal: Symbol("fastify.request.signal"),
		kHandlerTimeout: Symbol("fastify.handlerTimeout"),
		kTimeoutTimer: Symbol("fastify.request.timeoutTimer"),
		kOnAbort: Symbol("fastify.request.onAbort"),
		kFourOhFour: Symbol("fastify.404"),
		kCanSetNotFoundHandler: Symbol("fastify.canSetNotFoundHandler"),
		kFourOhFourLevelInstance: Symbol("fastify.404LogLevelInstance"),
		kFourOhFourContext: Symbol("fastify.404ContextKey"),
		kDefaultJsonParse: Symbol("fastify.defaultJSONParse"),
		kReply: Symbol("fastify.Reply"),
		kReplySerializer: Symbol("fastify.reply.serializer"),
		kReplyIsError: Symbol("fastify.reply.isError"),
		kReplyHeaders: Symbol("fastify.reply.headers"),
		kReplyTrailers: Symbol("fastify.reply.trailers"),
		kReplyHasStatusCode: Symbol("fastify.reply.hasStatusCode"),
		kReplyHijacked: Symbol("fastify.reply.hijacked"),
		kReplyStartTime: Symbol("fastify.reply.startTime"),
		kReplyNextErrorHandler: Symbol("fastify.reply.nextErrorHandler"),
		kReplyEndTime: Symbol("fastify.reply.endTime"),
		kReplyErrorHandlerCalled: Symbol("fastify.reply.errorHandlerCalled"),
		kReplyIsRunningOnErrorHook: Symbol("fastify.reply.isRunningOnErrorHook"),
		kReplySerializerDefault: Symbol("fastify.replySerializerDefault"),
		kReplyCacheSerializeFns: Symbol("fastify.reply.cache.serializeFns"),
		kTestInternals: Symbol("fastify.testInternals"),
		kErrorHandler: Symbol("fastify.errorHandler"),
		kErrorHandlerAlreadySet: Symbol("fastify.errorHandlerAlreadySet"),
		kChildLoggerFactory: Symbol("fastify.childLoggerFactory"),
		kHasBeenDecorated: Symbol("fastify.hasBeenDecorated"),
		kKeepAliveConnections: Symbol("fastify.keepAliveConnections"),
		kRouteByFastify: Symbol("fastify.routeByFastify")
	};
}));
//#endregion
//#region ../../node_modules/.bun/process-warning@5.0.0/node_modules/process-warning/index.js
var require_process_warning$1 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { format: format$1 } = __require("node:util");
	/**
	* @namespace processWarning
	*/
	/**
	* Represents a warning item with details.
	* @typedef {Function} WarningItem
	* @param {*} [a] Possible message interpolation value.
	* @param {*} [b] Possible message interpolation value.
	* @param {*} [c] Possible message interpolation value.
	* @property {string} name - The name of the warning.
	* @property {string} code - The code associated with the warning.
	* @property {string} message - The warning message.
	* @property {boolean} emitted - Indicates if the warning has been emitted.
	* @property {function} format - Formats the warning message.
	*/
	/**
	* Options for creating a process warning.
	* @typedef {Object} ProcessWarningOptions
	* @property {string} name - The name of the warning.
	* @property {string} code - The code associated with the warning.
	* @property {string} message - The warning message.
	* @property {boolean} [unlimited=false] - If true, allows unlimited emissions of the warning.
	*/
	/**
	* Represents the process warning functionality.
	* @typedef {Object} ProcessWarning
	* @property {function} createWarning - Creates a warning item.
	* @property {function} createDeprecation - Creates a deprecation warning item.
	*/
	/**
	* Creates a deprecation warning item.
	* @function
	* @memberof processWarning
	* @param {ProcessWarningOptions} params - Options for creating the warning.
	* @returns {WarningItem} The created deprecation warning item.
	*/
	function createDeprecation(params) {
		return createWarning({
			...params,
			name: "DeprecationWarning"
		});
	}
	/**
	* Creates a warning item.
	* @function
	* @memberof processWarning
	* @param {ProcessWarningOptions} params - Options for creating the warning.
	* @returns {WarningItem} The created warning item.
	* @throws {Error} Throws an error if name, code, or message is empty, or if opts.unlimited is not a boolean.
	*/
	function createWarning({ name, code, message, unlimited = false } = {}) {
		if (!name) throw new Error("Warning name must not be empty");
		if (!code) throw new Error("Warning code must not be empty");
		if (!message) throw new Error("Warning message must not be empty");
		if (typeof unlimited !== "boolean") throw new Error("Warning opts.unlimited must be a boolean");
		code = code.toUpperCase();
		let warningContainer = { [name]: function(a, b, c) {
			if (warning.emitted === true && warning.unlimited !== true) return;
			warning.emitted = true;
			process.emitWarning(warning.format(a, b, c), warning.name, warning.code);
		} };
		if (unlimited) warningContainer = { [name]: function(a, b, c) {
			warning.emitted = true;
			process.emitWarning(warning.format(a, b, c), warning.name, warning.code);
		} };
		const warning = warningContainer[name];
		warning.emitted = false;
		warning.message = message;
		warning.unlimited = unlimited;
		warning.code = code;
		/**
		* Formats the warning message.
		* @param {*} [a] Possible message interpolation value.
		* @param {*} [b] Possible message interpolation value.
		* @param {*} [c] Possible message interpolation value.
		* @returns {string} The formatted warning message.
		*/
		warning.format = function(a, b, c) {
			let formatted;
			if (a && b && c) formatted = format$1(message, a, b, c);
			else if (a && b) formatted = format$1(message, a, b);
			else if (a) formatted = format$1(message, a);
			else formatted = message;
			return formatted;
		};
		return warning;
	}
	/**
	* Module exports containing the process warning functionality.
	* @namespace
	* @property {function} createWarning - Creates a warning item.
	* @property {function} createDeprecation - Creates a deprecation warning item.
	* @property {ProcessWarning} processWarning - Represents the process warning functionality.
	*/
	const out = {
		createWarning,
		createDeprecation
	};
	module.exports = out;
	module.exports.default = out;
	module.exports.processWarning = out;
}));
//#endregion
//#region ../../node_modules/.bun/fastify@5.8.4/node_modules/fastify/lib/warnings.js
var require_warnings = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { createWarning } = require_process_warning$1();
	module.exports = {
		FSTWRN001: createWarning({
			name: "FastifyWarning",
			code: "FSTWRN001",
			message: "The %s schema for %s: %s is missing. This may indicate the schema is not well specified.",
			unlimited: true
		}),
		FSTWRN003: createWarning({
			name: "FastifyWarning",
			code: "FSTWRN003",
			message: "The %s mixes async and callback styles that may lead to unhandled rejections. Please use only one of them.",
			unlimited: true
		}),
		FSTWRN004: createWarning({
			name: "FastifyWarning",
			code: "FSTWRN004",
			message: "It seems that you are overriding an errorHandler in the same scope, which can lead to subtle bugs.",
			unlimited: true
		}),
		FSTSEC001: createWarning({
			name: "FastifySecurity",
			code: "FSTSEC001",
			message: "You are using /%s/ Content-Type which may be vulnerable to CORS attack. Please make sure your RegExp start with \"^\" or include \";?\" to proper detection of the essence MIME type.",
			unlimited: true
		}),
		FSTDEP022: createWarning({
			name: "FastifyWarning",
			code: "FSTDEP022",
			message: "The router options for %s property access is deprecated. Please use \"options.routerOptions\" instead for accessing router options. The router options will be removed in `fastify@6`.",
			unlimited: true
		})
	};
}));
//#endregion
//#region ../../node_modules/.bun/fastify@5.8.4/node_modules/fastify/lib/errors.js
var require_errors = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const createError = require_error();
	const codes = {
		FST_ERR_NOT_FOUND: createError("FST_ERR_NOT_FOUND", "Not Found", 404),
		FST_ERR_OPTIONS_NOT_OBJ: createError("FST_ERR_OPTIONS_NOT_OBJ", "Options must be an object", 500, TypeError),
		FST_ERR_QSP_NOT_FN: createError("FST_ERR_QSP_NOT_FN", "querystringParser option should be a function, instead got '%s'", 500, TypeError),
		FST_ERR_SCHEMA_CONTROLLER_BUCKET_OPT_NOT_FN: createError("FST_ERR_SCHEMA_CONTROLLER_BUCKET_OPT_NOT_FN", "schemaController.bucket option should be a function, instead got '%s'", 500, TypeError),
		FST_ERR_SCHEMA_ERROR_FORMATTER_NOT_FN: createError("FST_ERR_SCHEMA_ERROR_FORMATTER_NOT_FN", "schemaErrorFormatter option should be a non async function. Instead got '%s'.", 500, TypeError),
		FST_ERR_AJV_CUSTOM_OPTIONS_OPT_NOT_OBJ: createError("FST_ERR_AJV_CUSTOM_OPTIONS_OPT_NOT_OBJ", "ajv.customOptions option should be an object, instead got '%s'", 500, TypeError),
		FST_ERR_AJV_CUSTOM_OPTIONS_OPT_NOT_ARR: createError("FST_ERR_AJV_CUSTOM_OPTIONS_OPT_NOT_ARR", "ajv.plugins option should be an array, instead got '%s'", 500, TypeError),
		FST_ERR_VALIDATION: createError("FST_ERR_VALIDATION", "%s", 400),
		FST_ERR_LISTEN_OPTIONS_INVALID: createError("FST_ERR_LISTEN_OPTIONS_INVALID", "Invalid listen options: '%s'", 500, TypeError),
		FST_ERR_ERROR_HANDLER_NOT_FN: createError("FST_ERR_ERROR_HANDLER_NOT_FN", "Error Handler must be a function", 500, TypeError),
		FST_ERR_ERROR_HANDLER_ALREADY_SET: createError("FST_ERR_ERROR_HANDLER_ALREADY_SET", "Error Handler already set in this scope. Set 'allowErrorHandlerOverride: true' to allow overriding.", 500, TypeError),
		FST_ERR_CTP_ALREADY_PRESENT: createError("FST_ERR_CTP_ALREADY_PRESENT", "Content type parser '%s' already present."),
		FST_ERR_CTP_INVALID_TYPE: createError("FST_ERR_CTP_INVALID_TYPE", "The content type should be a string or a RegExp", 500, TypeError),
		FST_ERR_CTP_EMPTY_TYPE: createError("FST_ERR_CTP_EMPTY_TYPE", "The content type cannot be an empty string", 500, TypeError),
		FST_ERR_CTP_INVALID_HANDLER: createError("FST_ERR_CTP_INVALID_HANDLER", "The content type handler should be a function", 500, TypeError),
		FST_ERR_CTP_INVALID_PARSE_TYPE: createError("FST_ERR_CTP_INVALID_PARSE_TYPE", "The body parser can only parse your data as 'string' or 'buffer', you asked '%s' which is not supported.", 500, TypeError),
		FST_ERR_CTP_BODY_TOO_LARGE: createError("FST_ERR_CTP_BODY_TOO_LARGE", "Request body is too large", 413, RangeError),
		FST_ERR_CTP_INVALID_MEDIA_TYPE: createError("FST_ERR_CTP_INVALID_MEDIA_TYPE", "Unsupported Media Type", 415),
		FST_ERR_CTP_INVALID_CONTENT_LENGTH: createError("FST_ERR_CTP_INVALID_CONTENT_LENGTH", "Request body size did not match Content-Length", 400, RangeError),
		FST_ERR_CTP_EMPTY_JSON_BODY: createError("FST_ERR_CTP_EMPTY_JSON_BODY", "Body cannot be empty when content-type is set to 'application/json'", 400),
		FST_ERR_CTP_INVALID_JSON_BODY: createError("FST_ERR_CTP_INVALID_JSON_BODY", "Body is not valid JSON but content-type is set to 'application/json'", 400),
		FST_ERR_CTP_INSTANCE_ALREADY_STARTED: createError("FST_ERR_CTP_INSTANCE_ALREADY_STARTED", "Cannot call \"%s\" when fastify instance is already started!", 400),
		FST_ERR_DEC_ALREADY_PRESENT: createError("FST_ERR_DEC_ALREADY_PRESENT", "The decorator '%s' has already been added!"),
		FST_ERR_DEC_DEPENDENCY_INVALID_TYPE: createError("FST_ERR_DEC_DEPENDENCY_INVALID_TYPE", "The dependencies of decorator '%s' must be of type Array.", 500, TypeError),
		FST_ERR_DEC_MISSING_DEPENDENCY: createError("FST_ERR_DEC_MISSING_DEPENDENCY", "The decorator is missing dependency '%s'."),
		FST_ERR_DEC_AFTER_START: createError("FST_ERR_DEC_AFTER_START", "The decorator '%s' has been added after start!"),
		FST_ERR_DEC_REFERENCE_TYPE: createError("FST_ERR_DEC_REFERENCE_TYPE", "The decorator '%s' of type '%s' is a reference type. Use the { getter, setter } interface instead."),
		FST_ERR_DEC_UNDECLARED: createError("FST_ERR_DEC_UNDECLARED", "No decorator '%s' has been declared on %s."),
		FST_ERR_HOOK_INVALID_TYPE: createError("FST_ERR_HOOK_INVALID_TYPE", "The hook name must be a string", 500, TypeError),
		FST_ERR_HOOK_INVALID_HANDLER: createError("FST_ERR_HOOK_INVALID_HANDLER", "%s hook should be a function, instead got %s", 500, TypeError),
		FST_ERR_HOOK_INVALID_ASYNC_HANDLER: createError("FST_ERR_HOOK_INVALID_ASYNC_HANDLER", "Async function has too many arguments. Async hooks should not use the 'done' argument.", 500, TypeError),
		FST_ERR_HOOK_NOT_SUPPORTED: createError("FST_ERR_HOOK_NOT_SUPPORTED", "%s hook not supported!", 500, TypeError),
		FST_ERR_MISSING_MIDDLEWARE: createError("FST_ERR_MISSING_MIDDLEWARE", "You must register a plugin for handling middlewares, visit fastify.dev/docs/latest/Reference/Middleware/ for more info.", 500),
		FST_ERR_HOOK_TIMEOUT: createError("FST_ERR_HOOK_TIMEOUT", "A callback for '%s' hook%s timed out. You may have forgotten to call 'done' function or to resolve a Promise"),
		FST_ERR_LOG_INVALID_DESTINATION: createError("FST_ERR_LOG_INVALID_DESTINATION", "Cannot specify both logger.stream and logger.file options"),
		FST_ERR_LOG_INVALID_LOGGER: createError("FST_ERR_LOG_INVALID_LOGGER", "Invalid logger object provided. The logger instance should have these functions(s): '%s'.", 500, TypeError),
		FST_ERR_LOG_INVALID_LOGGER_INSTANCE: createError("FST_ERR_LOG_INVALID_LOGGER_INSTANCE", "loggerInstance only accepts a logger instance.", 500, TypeError),
		FST_ERR_LOG_INVALID_LOGGER_CONFIG: createError("FST_ERR_LOG_INVALID_LOGGER_CONFIG", "logger options only accepts a configuration object.", 500, TypeError),
		FST_ERR_LOG_LOGGER_AND_LOGGER_INSTANCE_PROVIDED: createError("FST_ERR_LOG_LOGGER_AND_LOGGER_INSTANCE_PROVIDED", "You cannot provide both logger and loggerInstance. Please provide only one.", 500, TypeError),
		FST_ERR_REP_INVALID_PAYLOAD_TYPE: createError("FST_ERR_REP_INVALID_PAYLOAD_TYPE", "Attempted to send payload of invalid type '%s'. Expected a string or Buffer.", 500, TypeError),
		FST_ERR_REP_RESPONSE_BODY_CONSUMED: createError("FST_ERR_REP_RESPONSE_BODY_CONSUMED", "Response.body is already consumed."),
		FST_ERR_REP_READABLE_STREAM_LOCKED: createError("FST_ERR_REP_READABLE_STREAM_LOCKED", "ReadableStream was locked. You should call releaseLock() method on reader before sending."),
		FST_ERR_REP_ALREADY_SENT: createError("FST_ERR_REP_ALREADY_SENT", "Reply was already sent, did you forget to \"return reply\" in \"%s\" (%s)?"),
		FST_ERR_REP_SENT_VALUE: createError("FST_ERR_REP_SENT_VALUE", "The only possible value for reply.sent is true.", 500, TypeError),
		FST_ERR_SEND_INSIDE_ONERR: createError("FST_ERR_SEND_INSIDE_ONERR", "You cannot use `send` inside the `onError` hook"),
		FST_ERR_SEND_UNDEFINED_ERR: createError("FST_ERR_SEND_UNDEFINED_ERR", "Undefined error has occurred"),
		FST_ERR_BAD_STATUS_CODE: createError("FST_ERR_BAD_STATUS_CODE", "Called reply with an invalid status code: %s"),
		FST_ERR_BAD_TRAILER_NAME: createError("FST_ERR_BAD_TRAILER_NAME", "Called reply.trailer with an invalid header name: %s"),
		FST_ERR_BAD_TRAILER_VALUE: createError("FST_ERR_BAD_TRAILER_VALUE", "Called reply.trailer('%s', fn) with an invalid type: %s. Expected a function."),
		FST_ERR_FAILED_ERROR_SERIALIZATION: createError("FST_ERR_FAILED_ERROR_SERIALIZATION", "Failed to serialize an error. Error: %s. Original error: %s"),
		FST_ERR_MISSING_SERIALIZATION_FN: createError("FST_ERR_MISSING_SERIALIZATION_FN", "Missing serialization function. Key \"%s\""),
		FST_ERR_MISSING_CONTENTTYPE_SERIALIZATION_FN: createError("FST_ERR_MISSING_CONTENTTYPE_SERIALIZATION_FN", "Missing serialization function. Key \"%s:%s\""),
		FST_ERR_REQ_INVALID_VALIDATION_INVOCATION: createError("FST_ERR_REQ_INVALID_VALIDATION_INVOCATION", "Invalid validation invocation. Missing validation function for HTTP part \"%s\" nor schema provided."),
		FST_ERR_SCH_MISSING_ID: createError("FST_ERR_SCH_MISSING_ID", "Missing schema $id property"),
		FST_ERR_SCH_ALREADY_PRESENT: createError("FST_ERR_SCH_ALREADY_PRESENT", "Schema with id '%s' already declared!"),
		FST_ERR_SCH_CONTENT_MISSING_SCHEMA: createError("FST_ERR_SCH_CONTENT_MISSING_SCHEMA", "Schema is missing for the content type '%s'"),
		FST_ERR_SCH_DUPLICATE: createError("FST_ERR_SCH_DUPLICATE", "Schema with '%s' already present!"),
		FST_ERR_SCH_VALIDATION_BUILD: createError("FST_ERR_SCH_VALIDATION_BUILD", "Failed building the validation schema for %s: %s, due to error %s"),
		FST_ERR_SCH_SERIALIZATION_BUILD: createError("FST_ERR_SCH_SERIALIZATION_BUILD", "Failed building the serialization schema for %s: %s, due to error %s"),
		FST_ERR_SCH_RESPONSE_SCHEMA_NOT_NESTED_2XX: createError("FST_ERR_SCH_RESPONSE_SCHEMA_NOT_NESTED_2XX", "response schemas should be nested under a valid status code, e.g { 2xx: { type: \"object\" } }"),
		FST_ERR_INIT_OPTS_INVALID: createError("FST_ERR_INIT_OPTS_INVALID", "Invalid initialization options: '%s'"),
		FST_ERR_FORCE_CLOSE_CONNECTIONS_IDLE_NOT_AVAILABLE: createError("FST_ERR_FORCE_CLOSE_CONNECTIONS_IDLE_NOT_AVAILABLE", "Cannot set forceCloseConnections to 'idle' as your HTTP server does not support closeIdleConnections method"),
		FST_ERR_DUPLICATED_ROUTE: createError("FST_ERR_DUPLICATED_ROUTE", "Method '%s' already declared for route '%s'"),
		FST_ERR_BAD_URL: createError("FST_ERR_BAD_URL", "'%s' is not a valid url component", 400, URIError),
		FST_ERR_ASYNC_CONSTRAINT: createError("FST_ERR_ASYNC_CONSTRAINT", "Unexpected error from async constraint", 500),
		FST_ERR_INVALID_URL: createError("FST_ERR_INVALID_URL", "URL must be a string. Received '%s'", 400, TypeError),
		FST_ERR_ROUTE_OPTIONS_NOT_OBJ: createError("FST_ERR_ROUTE_OPTIONS_NOT_OBJ", "Options for \"%s:%s\" route must be an object", 500, TypeError),
		FST_ERR_ROUTE_DUPLICATED_HANDLER: createError("FST_ERR_ROUTE_DUPLICATED_HANDLER", "Duplicate handler for \"%s:%s\" route is not allowed!", 500),
		FST_ERR_ROUTE_HANDLER_NOT_FN: createError("FST_ERR_ROUTE_HANDLER_NOT_FN", "Error Handler for %s:%s route, if defined, must be a function", 500, TypeError),
		FST_ERR_ROUTE_MISSING_HANDLER: createError("FST_ERR_ROUTE_MISSING_HANDLER", "Missing handler function for \"%s:%s\" route.", 500),
		FST_ERR_ROUTE_METHOD_INVALID: createError("FST_ERR_ROUTE_METHOD_INVALID", "Provided method is invalid!", 500, TypeError),
		FST_ERR_ROUTE_METHOD_NOT_SUPPORTED: createError("FST_ERR_ROUTE_METHOD_NOT_SUPPORTED", "%s method is not supported.", 500),
		FST_ERR_ROUTE_BODY_VALIDATION_SCHEMA_NOT_SUPPORTED: createError("FST_ERR_ROUTE_BODY_VALIDATION_SCHEMA_NOT_SUPPORTED", "Body validation schema for %s:%s route is not supported!", 500),
		FST_ERR_ROUTE_BODY_LIMIT_OPTION_NOT_INT: createError("FST_ERR_ROUTE_BODY_LIMIT_OPTION_NOT_INT", "'bodyLimit' option must be an integer > 0. Got '%s'", 500, TypeError),
		FST_ERR_HANDLER_TIMEOUT: createError("FST_ERR_HANDLER_TIMEOUT", "Request timed out after %s ms on route '%s'", 503),
		FST_ERR_ROUTE_HANDLER_TIMEOUT_OPTION_NOT_INT: createError("FST_ERR_ROUTE_HANDLER_TIMEOUT_OPTION_NOT_INT", "'handlerTimeout' option must be an integer > 0. Got '%s'", 500, TypeError),
		FST_ERR_ROUTE_REWRITE_NOT_STR: createError("FST_ERR_ROUTE_REWRITE_NOT_STR", "Rewrite url for \"%s\" needs to be of type \"string\" but received \"%s\"", 500, TypeError),
		FST_ERR_REOPENED_CLOSE_SERVER: createError("FST_ERR_REOPENED_CLOSE_SERVER", "Fastify has already been closed and cannot be reopened"),
		FST_ERR_REOPENED_SERVER: createError("FST_ERR_REOPENED_SERVER", "Fastify is already listening"),
		FST_ERR_INSTANCE_ALREADY_LISTENING: createError("FST_ERR_INSTANCE_ALREADY_LISTENING", "Fastify instance is already listening. %s"),
		FST_ERR_PLUGIN_VERSION_MISMATCH: createError("FST_ERR_PLUGIN_VERSION_MISMATCH", "fastify-plugin: %s - expected '%s' fastify version, '%s' is installed"),
		FST_ERR_PLUGIN_NOT_PRESENT_IN_INSTANCE: createError("FST_ERR_PLUGIN_NOT_PRESENT_IN_INSTANCE", "The decorator '%s'%s is not present in %s"),
		FST_ERR_PLUGIN_INVALID_ASYNC_HANDLER: createError("FST_ERR_PLUGIN_INVALID_ASYNC_HANDLER", "The %s plugin being registered mixes async and callback styles. Async plugin should not mix async and callback style.", 500, TypeError),
		FST_ERR_PLUGIN_CALLBACK_NOT_FN: createError("FST_ERR_PLUGIN_CALLBACK_NOT_FN", "fastify-plugin: %s", 500, TypeError),
		FST_ERR_PLUGIN_NOT_VALID: createError("FST_ERR_PLUGIN_NOT_VALID", "fastify-plugin: %s"),
		FST_ERR_ROOT_PLG_BOOTED: createError("FST_ERR_ROOT_PLG_BOOTED", "fastify-plugin: %s"),
		FST_ERR_PARENT_PLUGIN_BOOTED: createError("FST_ERR_PARENT_PLUGIN_BOOTED", "fastify-plugin: %s"),
		FST_ERR_PLUGIN_TIMEOUT: createError("FST_ERR_PLUGIN_TIMEOUT", "fastify-plugin: %s")
	};
	function appendStackTrace(oldErr, newErr) {
		newErr.cause = oldErr;
		return newErr;
	}
	module.exports = codes;
	module.exports.appendStackTrace = appendStackTrace;
	module.exports.AVVIO_ERRORS_MAP = {
		AVV_ERR_CALLBACK_NOT_FN: codes.FST_ERR_PLUGIN_CALLBACK_NOT_FN,
		AVV_ERR_PLUGIN_NOT_VALID: codes.FST_ERR_PLUGIN_NOT_VALID,
		AVV_ERR_ROOT_PLG_BOOTED: codes.FST_ERR_ROOT_PLG_BOOTED,
		AVV_ERR_PARENT_PLG_LOADED: codes.FST_ERR_PARENT_PLUGIN_BOOTED,
		AVV_ERR_READY_TIMEOUT: codes.FST_ERR_PLUGIN_TIMEOUT,
		AVV_ERR_PLUGIN_EXEC_TIMEOUT: codes.FST_ERR_PLUGIN_TIMEOUT
	};
}));
//#endregion
//#region ../../node_modules/.bun/fastify@5.8.4/node_modules/fastify/lib/hooks.js
var require_hooks = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const applicationHooks = [
		"onRoute",
		"onRegister",
		"onReady",
		"onListen",
		"preClose",
		"onClose"
	];
	const lifecycleHooks = [
		"onTimeout",
		"onRequest",
		"preParsing",
		"preValidation",
		"preSerialization",
		"preHandler",
		"onSend",
		"onResponse",
		"onError",
		"onRequestAbort"
	];
	const supportedHooks = lifecycleHooks.concat(applicationHooks);
	const { FST_ERR_HOOK_INVALID_TYPE, FST_ERR_HOOK_INVALID_HANDLER, FST_ERR_SEND_UNDEFINED_ERR, FST_ERR_HOOK_TIMEOUT, FST_ERR_HOOK_NOT_SUPPORTED, AVVIO_ERRORS_MAP, appendStackTrace } = require_errors();
	const { kChildren, kHooks, kRequestPayloadStream } = require_symbols$1();
	function Hooks() {
		this.onRequest = [];
		this.preParsing = [];
		this.preValidation = [];
		this.preSerialization = [];
		this.preHandler = [];
		this.onResponse = [];
		this.onSend = [];
		this.onError = [];
		this.onRoute = [];
		this.onRegister = [];
		this.onReady = [];
		this.onListen = [];
		this.onTimeout = [];
		this.onRequestAbort = [];
		this.preClose = [];
	}
	Hooks.prototype = Object.create(null);
	Hooks.prototype.validate = function(hook, fn) {
		if (typeof hook !== "string") throw new FST_ERR_HOOK_INVALID_TYPE();
		if (Array.isArray(this[hook]) === false) throw new FST_ERR_HOOK_NOT_SUPPORTED(hook);
		if (typeof fn !== "function") throw new FST_ERR_HOOK_INVALID_HANDLER(hook, Object.prototype.toString.call(fn));
	};
	Hooks.prototype.add = function(hook, fn) {
		this.validate(hook, fn);
		this[hook].push(fn);
	};
	function buildHooks(h) {
		const hooks = new Hooks();
		hooks.onRequest = h.onRequest.slice();
		hooks.preParsing = h.preParsing.slice();
		hooks.preValidation = h.preValidation.slice();
		hooks.preSerialization = h.preSerialization.slice();
		hooks.preHandler = h.preHandler.slice();
		hooks.onSend = h.onSend.slice();
		hooks.onResponse = h.onResponse.slice();
		hooks.onError = h.onError.slice();
		hooks.onRoute = h.onRoute.slice();
		hooks.onRegister = h.onRegister.slice();
		hooks.onTimeout = h.onTimeout.slice();
		hooks.onRequestAbort = h.onRequestAbort.slice();
		hooks.onReady = [];
		hooks.onListen = [];
		hooks.preClose = [];
		return hooks;
	}
	function hookRunnerApplication(hookName, boot, server, cb) {
		const hooks = server[kHooks][hookName];
		let i = 0;
		let c = 0;
		next();
		function exit(err) {
			const hookFnName = hooks[i - 1]?.name;
			const hookFnFragment = hookFnName ? ` "${hookFnName}"` : "";
			if (err) {
				if (err.code === "AVV_ERR_READY_TIMEOUT") err = appendStackTrace(err, new FST_ERR_HOOK_TIMEOUT(hookName, hookFnFragment));
				else err = AVVIO_ERRORS_MAP[err.code] != null ? appendStackTrace(err, new AVVIO_ERRORS_MAP[err.code](err.message)) : err;
				cb(err);
				return;
			}
			cb();
		}
		function next(err) {
			if (err) {
				exit(err);
				return;
			}
			if (i === hooks.length && c === server[kChildren].length) {
				if (i === 0 && c === 0) exit();
				else boot(function manageTimeout(err, done) {
					exit(err);
					done(err);
				});
				return;
			}
			if (i === hooks.length && c < server[kChildren].length) {
				const child = server[kChildren][c++];
				hookRunnerApplication(hookName, boot, child, next);
				return;
			}
			boot(wrap(hooks[i++], server));
			next();
		}
		function wrap(fn, server) {
			return function(err, done) {
				if (err) {
					done(err);
					return;
				}
				if (fn.length === 1) {
					try {
						fn.call(server, done);
					} catch (error) {
						done(error);
					}
					return;
				}
				try {
					const ret = fn.call(server);
					if (ret && typeof ret.then === "function") {
						ret.then(done, done);
						return;
					}
				} catch (error) {
					err = error;
				}
				done(err);
			};
		}
	}
	function onListenHookRunner(server) {
		const hooks = server[kHooks].onListen;
		const hooksLen = hooks.length;
		let i = 0;
		let c = 0;
		next();
		function next(err) {
			err && server.log.error(err);
			if (i === hooksLen) {
				while (c < server[kChildren].length) {
					const child = server[kChildren][c++];
					onListenHookRunner(child);
				}
				return;
			}
			wrap(hooks[i++], server, next);
		}
		async function wrap(fn, server, done) {
			if (fn.length === 1) {
				try {
					fn.call(server, done);
				} catch (e) {
					done(e);
				}
				return;
			}
			try {
				const ret = fn.call(server);
				if (ret && typeof ret.then === "function") {
					ret.then(done, done);
					return;
				}
				done();
			} catch (error) {
				done(error);
			}
		}
	}
	function hookRunnerGenerator(iterator) {
		return function hookRunner(functions, request, reply, cb) {
			let i = 0;
			function next(err) {
				if (err || i === functions.length) {
					cb(err, request, reply);
					return;
				}
				let result;
				try {
					result = iterator(functions[i++], request, reply, next);
				} catch (error) {
					cb(error, request, reply);
					return;
				}
				if (result && typeof result.then === "function") result.then(handleResolve, handleReject);
			}
			function handleResolve() {
				next();
			}
			function handleReject(err) {
				if (!err) err = new FST_ERR_SEND_UNDEFINED_ERR();
				cb(err, request, reply);
			}
			next();
		};
	}
	function onResponseHookIterator(fn, request, reply, next) {
		return fn(request, reply, next);
	}
	const onResponseHookRunner = hookRunnerGenerator(onResponseHookIterator);
	const preValidationHookRunner = hookRunnerGenerator(hookIterator);
	const preHandlerHookRunner = hookRunnerGenerator(hookIterator);
	const onTimeoutHookRunner = hookRunnerGenerator(hookIterator);
	const onRequestHookRunner = hookRunnerGenerator(hookIterator);
	function onSendHookRunner(functions, request, reply, payload, cb) {
		let i = 0;
		function next(err, newPayload) {
			if (err) {
				cb(err, request, reply, payload);
				return;
			}
			if (newPayload !== void 0) payload = newPayload;
			if (i === functions.length) {
				cb(null, request, reply, payload);
				return;
			}
			let result;
			try {
				result = functions[i++](request, reply, payload, next);
			} catch (error) {
				cb(error, request, reply);
				return;
			}
			if (result && typeof result.then === "function") result.then(handleResolve, handleReject);
		}
		function handleResolve(newPayload) {
			next(null, newPayload);
		}
		function handleReject(err) {
			if (!err) err = new FST_ERR_SEND_UNDEFINED_ERR();
			cb(err, request, reply, payload);
		}
		next();
	}
	const preSerializationHookRunner = onSendHookRunner;
	function preParsingHookRunner(functions, request, reply, cb) {
		let i = 0;
		function next(err, newPayload) {
			if (reply.sent) return;
			if (newPayload !== void 0) request[kRequestPayloadStream] = newPayload;
			if (err || i === functions.length) {
				cb(err, request, reply);
				return;
			}
			let result;
			try {
				result = functions[i++](request, reply, request[kRequestPayloadStream], next);
			} catch (error) {
				cb(error, request, reply);
				return;
			}
			if (result && typeof result.then === "function") result.then(handleResolve, handleReject);
		}
		function handleResolve(newPayload) {
			next(null, newPayload);
		}
		function handleReject(err) {
			if (!err) err = new FST_ERR_SEND_UNDEFINED_ERR();
			cb(err, request, reply);
		}
		next();
	}
	function onRequestAbortHookRunner(functions, request, cb) {
		let i = 0;
		function next(err) {
			if (err || i === functions.length) {
				cb(err, request);
				return;
			}
			let result;
			try {
				result = functions[i++](request, next);
			} catch (error) {
				cb(error, request);
				return;
			}
			if (result && typeof result.then === "function") result.then(handleResolve, handleReject);
		}
		function handleResolve() {
			next();
		}
		function handleReject(err) {
			if (!err) err = new FST_ERR_SEND_UNDEFINED_ERR();
			cb(err, request);
		}
		next();
	}
	function hookIterator(fn, request, reply, next) {
		if (reply.sent === true) return void 0;
		return fn(request, reply, next);
	}
	module.exports = {
		Hooks,
		buildHooks,
		hookRunnerGenerator,
		preParsingHookRunner,
		onResponseHookRunner,
		onSendHookRunner,
		preSerializationHookRunner,
		onRequestAbortHookRunner,
		hookIterator,
		hookRunnerApplication,
		onListenHookRunner,
		preHandlerHookRunner,
		preValidationHookRunner,
		onRequestHookRunner,
		onTimeoutHookRunner,
		lifecycleHooks,
		supportedHooks
	};
}));
//#endregion
//#region ../../node_modules/.bun/fastify@5.8.4/node_modules/fastify/lib/noop-set.js
var require_noop_set = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = function noopSet() {
		return {
			[Symbol.iterator]: function* () {},
			add() {},
			delete() {},
			has() {
				return true;
			}
		};
	};
}));
//#endregion
//#region ../../node_modules/.bun/fastify@5.8.4/node_modules/fastify/lib/promise.js
var require_promise = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { kTestInternals } = require_symbols$1();
	function withResolvers() {
		let res, rej;
		return {
			promise: new Promise((resolve, reject) => {
				res = resolve;
				rej = reject;
			}),
			resolve: res,
			reject: rej
		};
	}
	module.exports = {
		withResolvers: typeof Promise.withResolvers === "function" ? Promise.withResolvers.bind(Promise) : withResolvers,
		[kTestInternals]: { withResolvers }
	};
}));
//#endregion
//#region ../../node_modules/.bun/fastify@5.8.4/node_modules/fastify/lib/server.js
var require_server = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const http$2 = __require("node:http");
	const https = __require("node:https");
	const http2 = __require("node:http2");
	const dns = __require("node:dns");
	const os$1 = __require("node:os");
	const { kState, kOptions, kServerBindings, kHttp2ServerSessions } = require_symbols$1();
	const { FSTWRN003 } = require_warnings();
	const { onListenHookRunner } = require_hooks();
	const { FST_ERR_REOPENED_CLOSE_SERVER, FST_ERR_REOPENED_SERVER, FST_ERR_LISTEN_OPTIONS_INVALID, FST_ERR_FORCE_CLOSE_CONNECTIONS_IDLE_NOT_AVAILABLE } = require_errors();
	const noopSet = require_noop_set();
	const PonyPromise = require_promise();
	module.exports.createServer = createServer;
	function defaultResolveServerListeningText(address) {
		return `Server listening at ${address}`;
	}
	function createServer(options, httpHandler) {
		const server = getServerInstance(options, httpHandler);
		function listen(listenOptions = {
			port: 0,
			host: "localhost"
		}, cb = void 0) {
			if (typeof cb === "function") {
				if (cb.constructor.name === "AsyncFunction") FSTWRN003("listen method");
				listenOptions.cb = cb;
			}
			if (listenOptions.signal) {
				if (typeof listenOptions.signal.on !== "function" && typeof listenOptions.signal.addEventListener !== "function") throw new FST_ERR_LISTEN_OPTIONS_INVALID("Invalid options.signal");
				this[kState].aborted = listenOptions.signal.aborted;
				if (this[kState].aborted) return this.close();
				else {
					const onAborted = () => {
						this[kState].aborted = true;
						this.close();
					};
					listenOptions.signal.addEventListener("abort", onAborted, { once: true });
				}
			}
			let host;
			if (listenOptions.path == null) host = listenOptions.host ?? "localhost";
			else host = listenOptions.host;
			if (!Object.hasOwn(listenOptions, "host") || listenOptions.host == null) listenOptions.host = host;
			if (host === "localhost") listenOptions.cb = (err, address) => {
				if (err) {
					cb(err, address);
					return;
				}
				multipleBindings.call(this, server, httpHandler, options, listenOptions, () => {
					this[kState].listening = true;
					cb(null, address);
					onListenHookRunner(this);
				});
			};
			else listenOptions.cb = (err, address) => {
				if (err) {
					cb(err, address);
					return;
				}
				this[kState].listening = true;
				cb(null, address);
				onListenHookRunner(this);
			};
			if (cb === void 0) return listenPromise.call(this, server, listenOptions).then((address) => {
				const { promise, resolve } = PonyPromise.withResolvers();
				if (host === "localhost") multipleBindings.call(this, server, httpHandler, options, listenOptions, () => {
					this[kState].listening = true;
					resolve(address);
					onListenHookRunner(this);
				});
				else {
					resolve(address);
					onListenHookRunner(this);
				}
				return promise;
			});
			this.ready(listenCallback.call(this, server, listenOptions));
		}
		const serverHasCloseAllConnections = typeof server.closeAllConnections === "function";
		const serverHasCloseIdleConnections = typeof server.closeIdleConnections === "function";
		const serverHasCloseHttp2Sessions = typeof server.closeHttp2Sessions === "function";
		let forceCloseConnections = options.forceCloseConnections;
		if (forceCloseConnections === "idle" && !serverHasCloseIdleConnections) throw new FST_ERR_FORCE_CLOSE_CONNECTIONS_IDLE_NOT_AVAILABLE();
		else if (typeof forceCloseConnections !== "boolean")
 /* istanbul ignore next: only one branch can be valid in a given Node.js version */
		forceCloseConnections = serverHasCloseIdleConnections ? "idle" : false;
		const keepAliveConnections = !serverHasCloseAllConnections && forceCloseConnections === true ? /* @__PURE__ */ new Set() : noopSet();
		return {
			server,
			listen,
			forceCloseConnections,
			serverHasCloseAllConnections,
			serverHasCloseHttp2Sessions,
			keepAliveConnections
		};
	}
	function multipleBindings(mainServer, httpHandler, serverOpts, listenOptions, onListen) {
		this[kState].listening = false;
		dns.lookup(listenOptions.host, { all: true }, (dnsErr, addresses) => {
			if (dnsErr || this[kState].aborted) {
				onListen();
				return;
			}
			const isMainServerListening = mainServer.listening && serverOpts.serverFactory;
			let binding = 0;
			let bound = 0;
			if (!isMainServerListening) {
				const primaryAddress = mainServer.address();
				for (const adr of addresses) if (adr.address !== primaryAddress.address) {
					binding++;
					const secondaryOpts = Object.assign({}, listenOptions, {
						host: adr.address,
						port: primaryAddress.port,
						cb: (_ignoreErr) => {
							bound++;
							if (!_ignoreErr) this[kServerBindings].push(secondaryServer);
							if (bound === binding) onListen();
						}
					});
					const secondaryServer = getServerInstance(serverOpts, httpHandler);
					const closeSecondary = () => {
						secondaryServer.close(() => {});
						if (typeof secondaryServer.closeAllConnections === "function" && serverOpts.forceCloseConnections === true) secondaryServer.closeAllConnections();
						if (typeof secondaryServer.closeHttp2Sessions === "function") secondaryServer.closeHttp2Sessions();
					};
					secondaryServer.on("upgrade", mainServer.emit.bind(mainServer, "upgrade"));
					mainServer.on("unref", closeSecondary);
					mainServer.on("close", closeSecondary);
					mainServer.on("error", closeSecondary);
					this[kState].listening = false;
					listenCallback.call(this, secondaryServer, secondaryOpts)();
				}
			}
			if (binding === 0) {
				onListen();
				return;
			}
			const originUnref = mainServer.unref;
			mainServer.unref = function() {
				originUnref.call(mainServer);
				mainServer.emit("unref");
			};
		});
	}
	function listenCallback(server, listenOptions) {
		const wrap = (err) => {
			server.removeListener("error", wrap);
			server.removeListener("listening", wrap);
			if (!err) {
				const address = logServerAddress.call(this, server, listenOptions.listenTextResolver || defaultResolveServerListeningText);
				listenOptions.cb(null, address);
			} else {
				this[kState].listening = false;
				listenOptions.cb(err, null);
			}
		};
		return (err) => {
			if (err != null) return listenOptions.cb(err);
			if (this[kState].listening && this[kState].closing) return listenOptions.cb(new FST_ERR_REOPENED_CLOSE_SERVER(), null);
			if (this[kState].listening) return listenOptions.cb(new FST_ERR_REOPENED_SERVER(), null);
			server.once("error", wrap);
			if (!this[kState].closing) {
				server.once("listening", wrap);
				server.listen(listenOptions);
				this[kState].listening = true;
			}
		};
	}
	function listenPromise(server, listenOptions) {
		if (this[kState].listening && this[kState].closing) return Promise.reject(new FST_ERR_REOPENED_CLOSE_SERVER());
		if (this[kState].listening) return Promise.reject(new FST_ERR_REOPENED_SERVER());
		return this.ready().then(() => {
			if (this[kState].aborted) return;
			const { promise, resolve, reject } = PonyPromise.withResolvers();
			const errEventHandler = (err) => {
				cleanup();
				this[kState].listening = false;
				reject(err);
			};
			const listeningEventHandler = () => {
				cleanup();
				this[kState].listening = true;
				resolve(logServerAddress.call(this, server, listenOptions.listenTextResolver || defaultResolveServerListeningText));
			};
			function cleanup() {
				server.removeListener("error", errEventHandler);
				server.removeListener("listening", listeningEventHandler);
			}
			server.once("error", errEventHandler);
			server.once("listening", listeningEventHandler);
			server.listen(listenOptions);
			return promise;
		});
	}
	function getServerInstance(options, httpHandler) {
		if (options.serverFactory) return options.serverFactory(httpHandler, options);
		const httpsOptions = options.https === true ? {} : options.https;
		if (options.http2) {
			const server = typeof httpsOptions === "object" ? http2.createSecureServer(httpsOptions, httpHandler) : http2.createServer(options.http, httpHandler);
			server.on("session", (session) => session.setTimeout(options.http2SessionTimeout, () => {
				session.close();
			}));
			if (options.forceCloseConnections === true) server.closeHttp2Sessions = createCloseHttp2SessionsByHttp2Server(server);
			server.setTimeout(options.connectionTimeout);
			return server;
		}
		const server = httpsOptions ? https.createServer(httpsOptions, httpHandler) : http$2.createServer(options.http, httpHandler);
		server.keepAliveTimeout = options.keepAliveTimeout;
		server.requestTimeout = options.requestTimeout;
		server.setTimeout(options.connectionTimeout);
		if (options.maxRequestsPerSocket > 0) server.maxRequestsPerSocket = options.maxRequestsPerSocket;
		return server;
	}
	/**
	* Inspects the provided `server.address` object and returns a
	* normalized list of IP address strings. Normalization in this
	* case refers to mapping wildcard `0.0.0.0` to the list of IP
	* addresses the wildcard refers to.
	*
	* @see https://nodejs.org/docs/latest/api/net.html#serveraddress
	*
	* @param {object} A server address object as described in the
	* linked docs.
	*
	* @returns {string[]}
	*/
	function getAddresses(address) {
		if (address.address === "0.0.0.0") return Object.values(os$1.networkInterfaces()).flatMap((iface) => {
			return iface.filter((iface) => iface.family === "IPv4");
		}).sort((iface) => {
			/* c8 ignore next 2 */
			return iface.internal ? -1 : 1;
		}).map((iface) => {
			return iface.address;
		});
		return [address.address];
	}
	function logServerAddress(server, listenTextResolver) {
		let addresses;
		if (!(typeof server.address() === "string")) {
			if (server.address().address.indexOf(":") === -1) addresses = getAddresses(server.address()).map((address) => address + ":" + server.address().port);
			else addresses = ["[" + server.address().address + "]:" + server.address().port];
			addresses = addresses.map((address) => "http" + (this[kOptions].https ? "s" : "") + "://" + address);
		} else addresses = [server.address()];
		for (const address of addresses) this.log.info(listenTextResolver(address));
		return addresses[0];
	}
	/**
	* @param {http2.Http2Server} http2Server
	* @returns {() => void}
	*/
	function createCloseHttp2SessionsByHttp2Server(http2Server) {
		/**
		* @type {Set<http2.Http2Session>}
		*/
		http2Server[kHttp2ServerSessions] = /* @__PURE__ */ new Set();
		http2Server.on("session", function(session) {
			session.once("connect", function() {
				http2Server[kHttp2ServerSessions].add(session);
			});
			session.once("close", function() {
				http2Server[kHttp2ServerSessions].delete(session);
			});
			session.once("frameError", function(type, code, streamId) {
				if (streamId === 0) http2Server[kHttp2ServerSessions].delete(session);
			});
			session.once("goaway", function() {
				http2Server[kHttp2ServerSessions].delete(session);
			});
		});
		return function closeHttp2Sessions() {
			if (http2Server[kHttp2ServerSessions].size === 0) return;
			for (const session of http2Server[kHttp2ServerSessions]) session.close();
		};
	}
}));
//#endregion
//#region ../../node_modules/.bun/fastify@5.8.4/node_modules/fastify/lib/content-type.js
var require_content_type = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* keyValuePairsReg is used to split the parameters list into associated
	* key value pairings. The leading `(?:^|;)\s*` anchor ensures the regex
	* only attempts matches at parameter boundaries, preventing quadratic
	* backtracking on malformed input.
	*
	* @see https://httpwg.org/specs/rfc9110.html#parameter
	* @type {RegExp}
	*/
	const keyValuePairsReg = /(?:^|;)\s*([\w!#$%&'*+.^`|~-]+)=([^;]*)/gm;
	/**
	* typeNameReg is used to validate that the first part of the media-type
	* does not use disallowed characters. Types must consist solely of
	* characters that match the specified character class. It must terminate
	* with a matching character.
	*
	* @see https://httpwg.org/specs/rfc9110.html#rule.token.separators
	* @type {RegExp}
	*/
	const typeNameReg = /^[\w!#$%&'*+.^`|~-]+$/;
	/**
	* subtypeNameReg is used to validate that the second part of the media-type
	* does not use disallowed characters. Subtypes must consist solely of
	* characters that match the specified character class, and optionally
	* terminated with any amount of whitespace characters. Without the terminating
	* anchor (`$`), the regular expression will match the leading portion of a
	* string instead of the whole string.
	*
	* @see https://httpwg.org/specs/rfc9110.html#rule.token.separators
	* @type {RegExp}
	*/
	const subtypeNameReg = /^[\w!#$%&'*+.^`|~-]+\s*$/;
	/**
	* ContentType parses and represents the value of the content-type header.
	*
	* @see https://httpwg.org/specs/rfc9110.html#media.type
	* @see https://httpwg.org/specs/rfc9110.html#parameter
	*/
	var ContentType = class {
		#valid = false;
		#empty = true;
		#type = "";
		#subtype = "";
		#parameters = /* @__PURE__ */ new Map();
		#string;
		constructor(headerValue) {
			if (headerValue == null || headerValue === "" || headerValue === "undefined") return;
			let sepIdx = headerValue.indexOf(";");
			if (sepIdx === -1) {
				sepIdx = headerValue.indexOf("/");
				if (sepIdx === -1) return;
				const type = headerValue.slice(0, sepIdx).trimStart().toLowerCase();
				const subtype = headerValue.slice(sepIdx + 1).trimEnd().toLowerCase();
				if (typeNameReg.test(type) === true && subtypeNameReg.test(subtype) === true) {
					this.#valid = true;
					this.#empty = false;
					this.#type = type;
					this.#subtype = subtype;
				}
				return;
			}
			const mediaType = headerValue.slice(0, sepIdx).toLowerCase();
			const paramsList = headerValue.slice(sepIdx + 1).trim();
			sepIdx = mediaType.indexOf("/");
			if (sepIdx === -1) return;
			const type = mediaType.slice(0, sepIdx).trimStart();
			const subtype = mediaType.slice(sepIdx + 1).trimEnd();
			if (typeNameReg.test(type) === false || subtypeNameReg.test(subtype) === false) return;
			this.#type = type;
			this.#subtype = subtype;
			this.#valid = true;
			this.#empty = false;
			let matches = keyValuePairsReg.exec(paramsList);
			while (matches) {
				const key = matches[1];
				const value = matches[2];
				if (value[0] === "\"") {
					if (value.at(-1) !== "\"") {
						this.#parameters.set(key, "invalid quoted string");
						matches = keyValuePairsReg.exec(paramsList);
						continue;
					}
					this.#parameters.set(key, value.slice(1, value.length - 1));
				} else this.#parameters.set(key, value);
				matches = keyValuePairsReg.exec(paramsList);
			}
		}
		get [Symbol.toStringTag]() {
			return "ContentType";
		}
		get isEmpty() {
			return this.#empty;
		}
		get isValid() {
			return this.#valid;
		}
		get mediaType() {
			return `${this.#type}/${this.#subtype}`;
		}
		get type() {
			return this.#type;
		}
		get subtype() {
			return this.#subtype;
		}
		get parameters() {
			return this.#parameters;
		}
		toString() {
			/* c8 ignore next: we don't need to verify the cache */
			if (this.#string) return this.#string;
			const parameters = [];
			for (const [key, value] of this.#parameters.entries()) parameters.push(`${key}="${value}"`);
			const result = [
				this.#type,
				"/",
				this.#subtype
			];
			if (parameters.length > 0) {
				result.push("; ");
				result.push(parameters.join("; "));
			}
			this.#string = result.join("");
			return this.#string;
		}
	};
	module.exports = ContentType;
}));
//#endregion
//#region ../../node_modules/.bun/fastify@5.8.4/node_modules/fastify/lib/error-status.js
var require_error_status = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { kReplyHasStatusCode } = require_symbols$1();
	function setErrorStatusCode(reply, err) {
		if (!reply[kReplyHasStatusCode] || reply.statusCode === 200) {
			const statusCode = err && (err.statusCode || err.status);
			reply.code(statusCode >= 400 ? statusCode : 500);
		}
	}
	module.exports = { setErrorStatusCode };
}));
//#endregion
//#region ../../node_modules/.bun/fastify@5.8.4/node_modules/fastify/lib/wrap-thenable.js
var require_wrap_thenable = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { kReplyIsError, kReplyHijacked } = require_symbols$1();
	const { setErrorStatusCode } = require_error_status();
	const channels = __require("node:diagnostics_channel").tracingChannel("fastify.request.handler");
	function wrapThenable(thenable, reply, store) {
		if (store) store.async = true;
		thenable.then(function(payload) {
			if (reply[kReplyHijacked] === true) return;
			if (store) channels.asyncStart.publish(store);
			try {
				if (payload !== void 0 || reply.sent === false && reply.raw.headersSent === false && reply.request.raw.aborted === false && reply.request.socket && !reply.request.socket.destroyed) try {
					reply.send(payload);
				} catch (err) {
					reply[kReplyIsError] = true;
					reply.send(err);
				}
			} finally {
				if (store) channels.asyncEnd.publish(store);
			}
		}, function(err) {
			if (store) {
				store.error = err;
				setErrorStatusCode(reply, err);
				channels.error.publish(store);
				channels.asyncStart.publish(store);
			}
			try {
				if (reply.sent === true) {
					reply.log.error({ err }, "Promise errored, but reply.sent = true was set");
					return;
				}
				reply[kReplyIsError] = true;
				reply.send(err);
			} catch (err) {
				reply.send(err);
			} finally {
				if (store) channels.asyncEnd.publish(store);
			}
		});
	}
	module.exports = wrapThenable;
}));
//#endregion
//#region ../../node_modules/.bun/fastify@5.8.4/node_modules/fastify/lib/validation.js
var require_validation = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { kSchemaHeaders: headersSchema, kSchemaParams: paramsSchema, kSchemaQuerystring: querystringSchema, kSchemaBody: bodySchema, kSchemaResponse: responseSchema } = require_symbols$1();
	const scChecker = /^[1-5](?:\d{2}|xx)$|^default$/;
	const { FST_ERR_SCH_RESPONSE_SCHEMA_NOT_NESTED_2XX } = require_errors();
	const { FSTWRN001 } = require_warnings();
	function compileSchemasForSerialization(context, compile) {
		if (!context.schema || !context.schema.response) return;
		const { method, url } = context.config || {};
		context[responseSchema] = Object.keys(context.schema.response).reduce(function(acc, statusCode) {
			const schema = context.schema.response[statusCode];
			statusCode = statusCode.toLowerCase();
			if (!scChecker.test(statusCode)) throw new FST_ERR_SCH_RESPONSE_SCHEMA_NOT_NESTED_2XX();
			if (schema.content) {
				const contentTypesSchemas = {};
				for (const mediaName of Object.keys(schema.content)) {
					const contentSchema = schema.content[mediaName].schema;
					contentTypesSchemas[mediaName] = compile({
						schema: contentSchema,
						url,
						method,
						httpStatus: statusCode,
						contentType: mediaName
					});
				}
				acc[statusCode] = contentTypesSchemas;
			} else acc[statusCode] = compile({
				schema,
				url,
				method,
				httpStatus: statusCode
			});
			return acc;
		}, {});
	}
	function compileSchemasForValidation(context, compile, isCustom) {
		const { schema } = context;
		if (!schema) return;
		const { method, url } = context.config || {};
		const headers = schema.headers;
		if (headers && (isCustom || Object.getPrototypeOf(headers) !== Object.prototype)) context[headersSchema] = compile({
			schema: headers,
			method,
			url,
			httpPart: "headers"
		});
		else if (headers) {
			const headersSchemaLowerCase = {};
			Object.keys(headers).forEach((k) => {
				headersSchemaLowerCase[k] = headers[k];
			});
			if (headersSchemaLowerCase.required instanceof Array) headersSchemaLowerCase.required = headersSchemaLowerCase.required.map((h) => h.toLowerCase());
			if (headers.properties) {
				headersSchemaLowerCase.properties = {};
				Object.keys(headers.properties).forEach((k) => {
					headersSchemaLowerCase.properties[k.toLowerCase()] = headers.properties[k];
				});
			}
			context[headersSchema] = compile({
				schema: headersSchemaLowerCase,
				method,
				url,
				httpPart: "headers"
			});
		} else if (Object.hasOwn(schema, "headers")) FSTWRN001("headers", method, url);
		if (schema.body) {
			const contentProperty = schema.body.content;
			if (contentProperty) {
				const contentTypeSchemas = {};
				for (const contentType of Object.keys(contentProperty)) {
					const contentSchema = contentProperty[contentType].schema;
					contentTypeSchemas[contentType] = compile({
						schema: contentSchema,
						method,
						url,
						httpPart: "body",
						contentType
					});
				}
				context[bodySchema] = contentTypeSchemas;
			} else context[bodySchema] = compile({
				schema: schema.body,
				method,
				url,
				httpPart: "body"
			});
		} else if (Object.hasOwn(schema, "body")) FSTWRN001("body", method, url);
		if (schema.querystring) context[querystringSchema] = compile({
			schema: schema.querystring,
			method,
			url,
			httpPart: "querystring"
		});
		else if (Object.hasOwn(schema, "querystring")) FSTWRN001("querystring", method, url);
		if (schema.params) context[paramsSchema] = compile({
			schema: schema.params,
			method,
			url,
			httpPart: "params"
		});
		else if (Object.hasOwn(schema, "params")) FSTWRN001("params", method, url);
	}
	function validateParam(validatorFunction, request, paramName) {
		const isUndefined = request[paramName] === void 0;
		let ret;
		try {
			ret = validatorFunction?.(isUndefined ? null : request[paramName]);
		} catch (err) {
			err.statusCode = 500;
			return err;
		}
		if (ret && typeof ret.then === "function") return ret.then((res) => {
			return answer(res);
		}).catch((err) => {
			return err;
		});
		return answer(ret);
		function answer(ret) {
			if (ret === false) return validatorFunction.errors;
			if (ret && ret.error) return ret.error;
			if (ret && ret.value) request[paramName] = ret.value;
			return false;
		}
	}
	function validate(context, request, execution) {
		const runExecution = execution === void 0;
		if (runExecution || !execution.skipParams) {
			const params = validateParam(context[paramsSchema], request, "params");
			if (params) if (typeof params.then !== "function") return wrapValidationError(params, "params", context.schemaErrorFormatter);
			else return validateAsyncParams(params, context, request);
		}
		if (runExecution || !execution.skipBody) {
			let validatorFunction = null;
			if (typeof context[bodySchema] === "function") validatorFunction = context[bodySchema];
			else if (context[bodySchema]) {
				const contentType = getEssenceMediaType(request.headers["content-type"]);
				const contentSchema = context[bodySchema][contentType];
				if (contentSchema) validatorFunction = contentSchema;
			}
			const body = validateParam(validatorFunction, request, "body");
			if (body) if (typeof body.then !== "function") return wrapValidationError(body, "body", context.schemaErrorFormatter);
			else return validateAsyncBody(body, context, request);
		}
		if (runExecution || !execution.skipQuery) {
			const query = validateParam(context[querystringSchema], request, "query");
			if (query) if (typeof query.then !== "function") return wrapValidationError(query, "querystring", context.schemaErrorFormatter);
			else return validateAsyncQuery(query, context, request);
		}
		const headers = validateParam(context[headersSchema], request, "headers");
		if (headers) if (typeof headers.then !== "function") return wrapValidationError(headers, "headers", context.schemaErrorFormatter);
		else return validateAsyncHeaders(headers, context, request);
		return false;
	}
	function validateAsyncParams(validatePromise, context, request) {
		return validatePromise.then((paramsResult) => {
			if (paramsResult) return wrapValidationError(paramsResult, "params", context.schemaErrorFormatter);
			return validate(context, request, { skipParams: true });
		});
	}
	function validateAsyncBody(validatePromise, context, request) {
		return validatePromise.then((bodyResult) => {
			if (bodyResult) return wrapValidationError(bodyResult, "body", context.schemaErrorFormatter);
			return validate(context, request, {
				skipParams: true,
				skipBody: true
			});
		});
	}
	function validateAsyncQuery(validatePromise, context, request) {
		return validatePromise.then((queryResult) => {
			if (queryResult) return wrapValidationError(queryResult, "querystring", context.schemaErrorFormatter);
			return validate(context, request, {
				skipParams: true,
				skipBody: true,
				skipQuery: true
			});
		});
	}
	function validateAsyncHeaders(validatePromise, context, request) {
		return validatePromise.then((headersResult) => {
			if (headersResult) return wrapValidationError(headersResult, "headers", context.schemaErrorFormatter);
			return false;
		});
	}
	function wrapValidationError(result, dataVar, schemaErrorFormatter) {
		if (result instanceof Error) {
			result.statusCode = result.statusCode || 400;
			result.code = result.code || "FST_ERR_VALIDATION";
			result.validationContext = result.validationContext || dataVar;
			return result;
		}
		const error = schemaErrorFormatter(result, dataVar);
		error.statusCode = error.statusCode || 400;
		error.code = error.code || "FST_ERR_VALIDATION";
		error.validation = result;
		error.validationContext = dataVar;
		return error;
	}
	/**
	* simple function to retrieve the essence media type
	* @param {string} header
	* @returns {string} Mimetype string.
	*/
	function getEssenceMediaType(header) {
		if (!header) return "";
		return header.split(/[ ;]/, 1)[0].trim().toLowerCase();
	}
	module.exports = {
		symbols: {
			bodySchema,
			querystringSchema,
			responseSchema,
			paramsSchema,
			headersSchema
		},
		compileSchemasForValidation,
		compileSchemasForSerialization,
		validate
	};
}));
//#endregion
//#region ../../node_modules/.bun/fastify@5.8.4/node_modules/fastify/lib/handle-request.js
var require_handle_request = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const diagnostics$1 = __require("node:diagnostics_channel");
	const ContentType = require_content_type();
	const wrapThenable = require_wrap_thenable();
	const { validate: validateSchema } = require_validation();
	const { preValidationHookRunner, preHandlerHookRunner } = require_hooks();
	const { FST_ERR_CTP_INVALID_MEDIA_TYPE } = require_errors();
	const { setErrorStatusCode } = require_error_status();
	const { kReplyIsError, kRouteContext, kFourOhFourContext, kSupportedHTTPMethods } = require_symbols$1();
	const channels = diagnostics$1.tracingChannel("fastify.request.handler");
	function handleRequest(err, request, reply) {
		if (reply.sent === true) return;
		if (err != null) {
			reply[kReplyIsError] = true;
			reply.send(err);
			return;
		}
		const method = request.method;
		if (this[kSupportedHTTPMethods].bodyless.has(method)) {
			handler(request, reply);
			return;
		}
		if (this[kSupportedHTTPMethods].bodywith.has(method)) {
			const headers = request.headers;
			const ctHeader = headers["content-type"];
			if (ctHeader === void 0) {
				const contentLength = headers["content-length"];
				if (headers["transfer-encoding"] === void 0 && (contentLength === void 0 || contentLength === "0")) {
					handler(request, reply);
					return;
				}
				request[kRouteContext].contentTypeParser.run("", handler, request, reply);
				return;
			}
			const contentType = new ContentType(ctHeader);
			if (contentType.isValid === false) {
				reply[kReplyIsError] = true;
				reply.status(415).send(new FST_ERR_CTP_INVALID_MEDIA_TYPE());
				return;
			}
			request[kRouteContext].contentTypeParser.run(contentType.toString(), handler, request, reply);
			return;
		}
		handler(request, reply);
	}
	function handler(request, reply) {
		try {
			if (request[kRouteContext].preValidation !== null) preValidationHookRunner(request[kRouteContext].preValidation, request, reply, preValidationCallback);
			else preValidationCallback(null, request, reply);
		} catch (err) {
			preValidationCallback(err, request, reply);
		}
	}
	function preValidationCallback(err, request, reply) {
		if (reply.sent === true) return;
		if (err != null) {
			reply[kReplyIsError] = true;
			reply.send(err);
			return;
		}
		const validationErr = validateSchema(reply[kRouteContext], request);
		if (validationErr && typeof validationErr.then === "function" || false) {
			const cb = validationCompleted.bind(null, request, reply);
			validationErr.then(cb, cb);
		} else validationCompleted(request, reply, validationErr);
	}
	function validationCompleted(request, reply, validationErr) {
		if (validationErr) {
			if (reply[kRouteContext].attachValidation === false) {
				reply.send(validationErr);
				return;
			}
			reply.request.validationError = validationErr;
		}
		if (request[kRouteContext].preHandler !== null) preHandlerHookRunner(request[kRouteContext].preHandler, request, reply, preHandlerCallback);
		else preHandlerCallback(null, request, reply);
	}
	function preHandlerCallback(err, request, reply) {
		if (reply.sent) return;
		const context = request[kRouteContext];
		if (!channels.hasSubscribers || context[kFourOhFourContext] === null) preHandlerCallbackInner(err, request, reply);
		else {
			const store = {
				request,
				reply,
				async: false,
				route: {
					url: context.config.url,
					method: context.config.method
				}
			};
			channels.start.runStores(store, preHandlerCallbackInner, void 0, err, request, reply, store);
		}
	}
	function preHandlerCallbackInner(err, request, reply, store) {
		const context = request[kRouteContext];
		try {
			if (err != null) {
				reply[kReplyIsError] = true;
				if (store) {
					store.error = err;
					setErrorStatusCode(reply, err);
					channels.error.publish(store);
				}
				reply.send(err);
				return;
			}
			let result;
			try {
				result = context.handler(request, reply);
			} catch (err) {
				if (store) {
					store.error = err;
					setErrorStatusCode(reply, err);
					channels.error.publish(store);
				}
				reply[kReplyIsError] = true;
				reply.send(err);
				return;
			}
			if (result !== void 0) if (result !== null && typeof result.then === "function") wrapThenable(result, reply, store);
			else reply.send(result);
		} finally {
			if (store) channels.end.publish(store);
		}
	}
	module.exports = handleRequest;
	module.exports[Symbol.for("internals")] = {
		handler,
		preHandlerCallback
	};
}));
//#endregion
//#region ../../node_modules/.bun/pino-std-serializers@7.1.0/node_modules/pino-std-serializers/lib/err-helpers.js
var require_err_helpers = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const isErrorLike = (err) => {
		return err && typeof err.message === "string";
	};
	/**
	* @param {Error|{ cause?: unknown|(()=>err)}} err
	* @returns {Error|Object|undefined}
	*/
	const getErrorCause = (err) => {
		if (!err) return;
		/** @type {unknown} */
		const cause = err.cause;
		if (typeof cause === "function") {
			const causeResult = err.cause();
			return isErrorLike(causeResult) ? causeResult : void 0;
		} else return isErrorLike(cause) ? cause : void 0;
	};
	/**
	* Internal method that keeps a track of which error we have already added, to avoid circular recursion
	*
	* @private
	* @param {Error} err
	* @param {Set<Error>} seen
	* @returns {string}
	*/
	const _stackWithCauses = (err, seen) => {
		if (!isErrorLike(err)) return "";
		const stack = err.stack || "";
		if (seen.has(err)) return stack + "\ncauses have become circular...";
		const cause = getErrorCause(err);
		if (cause) {
			seen.add(err);
			return stack + "\ncaused by: " + _stackWithCauses(cause, seen);
		} else return stack;
	};
	/**
	* @param {Error} err
	* @returns {string}
	*/
	const stackWithCauses = (err) => _stackWithCauses(err, /* @__PURE__ */ new Set());
	/**
	* Internal method that keeps a track of which error we have already added, to avoid circular recursion
	*
	* @private
	* @param {Error} err
	* @param {Set<Error>} seen
	* @param {boolean} [skip]
	* @returns {string}
	*/
	const _messageWithCauses = (err, seen, skip) => {
		if (!isErrorLike(err)) return "";
		const message = skip ? "" : err.message || "";
		if (seen.has(err)) return message + ": ...";
		const cause = getErrorCause(err);
		if (cause) {
			seen.add(err);
			const skipIfVErrorStyleCause = typeof err.cause === "function";
			return message + (skipIfVErrorStyleCause ? "" : ": ") + _messageWithCauses(cause, seen, skipIfVErrorStyleCause);
		} else return message;
	};
	/**
	* @param {Error} err
	* @returns {string}
	*/
	const messageWithCauses = (err) => _messageWithCauses(err, /* @__PURE__ */ new Set());
	module.exports = {
		isErrorLike,
		getErrorCause,
		stackWithCauses,
		messageWithCauses
	};
}));
//#endregion
//#region ../../node_modules/.bun/pino-std-serializers@7.1.0/node_modules/pino-std-serializers/lib/err-proto.js
var require_err_proto = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const seen = Symbol("circular-ref-tag");
	const rawSymbol = Symbol("pino-raw-err-ref");
	const pinoErrProto = Object.create({}, {
		type: {
			enumerable: true,
			writable: true,
			value: void 0
		},
		message: {
			enumerable: true,
			writable: true,
			value: void 0
		},
		stack: {
			enumerable: true,
			writable: true,
			value: void 0
		},
		aggregateErrors: {
			enumerable: true,
			writable: true,
			value: void 0
		},
		raw: {
			enumerable: false,
			get: function() {
				return this[rawSymbol];
			},
			set: function(val) {
				this[rawSymbol] = val;
			}
		}
	});
	Object.defineProperty(pinoErrProto, rawSymbol, {
		writable: true,
		value: {}
	});
	module.exports = {
		pinoErrProto,
		pinoErrorSymbols: {
			seen,
			rawSymbol
		}
	};
}));
//#endregion
//#region ../../node_modules/.bun/pino-std-serializers@7.1.0/node_modules/pino-std-serializers/lib/err.js
var require_err = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = errSerializer;
	const { messageWithCauses, stackWithCauses, isErrorLike } = require_err_helpers();
	const { pinoErrProto, pinoErrorSymbols } = require_err_proto();
	const { seen } = pinoErrorSymbols;
	const { toString } = Object.prototype;
	function errSerializer(err) {
		if (!isErrorLike(err)) return err;
		err[seen] = void 0;
		const _err = Object.create(pinoErrProto);
		_err.type = toString.call(err.constructor) === "[object Function]" ? err.constructor.name : err.name;
		_err.message = messageWithCauses(err);
		_err.stack = stackWithCauses(err);
		if (Array.isArray(err.errors)) _err.aggregateErrors = err.errors.map((err) => errSerializer(err));
		for (const key in err) if (_err[key] === void 0) {
			const val = err[key];
			if (isErrorLike(val)) {
				if (key !== "cause" && !Object.prototype.hasOwnProperty.call(val, seen)) _err[key] = errSerializer(val);
			} else _err[key] = val;
		}
		delete err[seen];
		_err.raw = err;
		return _err;
	}
}));
//#endregion
//#region ../../node_modules/.bun/pino-std-serializers@7.1.0/node_modules/pino-std-serializers/lib/err-with-cause.js
var require_err_with_cause = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = errWithCauseSerializer;
	const { isErrorLike } = require_err_helpers();
	const { pinoErrProto, pinoErrorSymbols } = require_err_proto();
	const { seen } = pinoErrorSymbols;
	const { toString } = Object.prototype;
	function errWithCauseSerializer(err) {
		if (!isErrorLike(err)) return err;
		err[seen] = void 0;
		const _err = Object.create(pinoErrProto);
		_err.type = toString.call(err.constructor) === "[object Function]" ? err.constructor.name : err.name;
		_err.message = err.message;
		_err.stack = err.stack;
		if (Array.isArray(err.errors)) _err.aggregateErrors = err.errors.map((err) => errWithCauseSerializer(err));
		if (isErrorLike(err.cause) && !Object.prototype.hasOwnProperty.call(err.cause, seen)) _err.cause = errWithCauseSerializer(err.cause);
		for (const key in err) if (_err[key] === void 0) {
			const val = err[key];
			if (isErrorLike(val)) {
				if (!Object.prototype.hasOwnProperty.call(val, seen)) _err[key] = errWithCauseSerializer(val);
			} else _err[key] = val;
		}
		delete err[seen];
		_err.raw = err;
		return _err;
	}
}));
//#endregion
//#region ../../node_modules/.bun/pino-std-serializers@7.1.0/node_modules/pino-std-serializers/lib/req.js
var require_req = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = {
		mapHttpRequest,
		reqSerializer
	};
	const rawSymbol = Symbol("pino-raw-req-ref");
	const pinoReqProto = Object.create({}, {
		id: {
			enumerable: true,
			writable: true,
			value: ""
		},
		method: {
			enumerable: true,
			writable: true,
			value: ""
		},
		url: {
			enumerable: true,
			writable: true,
			value: ""
		},
		query: {
			enumerable: true,
			writable: true,
			value: ""
		},
		params: {
			enumerable: true,
			writable: true,
			value: ""
		},
		headers: {
			enumerable: true,
			writable: true,
			value: {}
		},
		remoteAddress: {
			enumerable: true,
			writable: true,
			value: ""
		},
		remotePort: {
			enumerable: true,
			writable: true,
			value: ""
		},
		raw: {
			enumerable: false,
			get: function() {
				return this[rawSymbol];
			},
			set: function(val) {
				this[rawSymbol] = val;
			}
		}
	});
	Object.defineProperty(pinoReqProto, rawSymbol, {
		writable: true,
		value: {}
	});
	function reqSerializer(req) {
		const connection = req.info || req.socket;
		const _req = Object.create(pinoReqProto);
		_req.id = typeof req.id === "function" ? req.id() : req.id || (req.info ? req.info.id : void 0);
		_req.method = req.method;
		if (req.originalUrl) _req.url = req.originalUrl;
		else {
			const path = req.path;
			_req.url = typeof path === "string" ? path : req.url ? req.url.path || req.url : void 0;
		}
		if (req.query) _req.query = req.query;
		if (req.params) _req.params = req.params;
		_req.headers = req.headers;
		_req.remoteAddress = connection && connection.remoteAddress;
		_req.remotePort = connection && connection.remotePort;
		_req.raw = req.raw || req;
		return _req;
	}
	function mapHttpRequest(req) {
		return { req: reqSerializer(req) };
	}
}));
//#endregion
//#region ../../node_modules/.bun/pino-std-serializers@7.1.0/node_modules/pino-std-serializers/lib/res.js
var require_res = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = {
		mapHttpResponse,
		resSerializer
	};
	const rawSymbol = Symbol("pino-raw-res-ref");
	const pinoResProto = Object.create({}, {
		statusCode: {
			enumerable: true,
			writable: true,
			value: 0
		},
		headers: {
			enumerable: true,
			writable: true,
			value: ""
		},
		raw: {
			enumerable: false,
			get: function() {
				return this[rawSymbol];
			},
			set: function(val) {
				this[rawSymbol] = val;
			}
		}
	});
	Object.defineProperty(pinoResProto, rawSymbol, {
		writable: true,
		value: {}
	});
	function resSerializer(res) {
		const _res = Object.create(pinoResProto);
		_res.statusCode = res.headersSent ? res.statusCode : null;
		_res.headers = res.getHeaders ? res.getHeaders() : res._headers;
		_res.raw = res;
		return _res;
	}
	function mapHttpResponse(res) {
		return { res: resSerializer(res) };
	}
}));
//#endregion
//#region ../../node_modules/.bun/pino-std-serializers@7.1.0/node_modules/pino-std-serializers/index.js
var require_pino_std_serializers = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const errSerializer = require_err();
	const errWithCauseSerializer = require_err_with_cause();
	const reqSerializers = require_req();
	const resSerializers = require_res();
	module.exports = {
		err: errSerializer,
		errWithCause: errWithCauseSerializer,
		mapHttpRequest: reqSerializers.mapHttpRequest,
		mapHttpResponse: resSerializers.mapHttpResponse,
		req: reqSerializers.reqSerializer,
		res: resSerializers.resSerializer,
		wrapErrorSerializer: function wrapErrorSerializer(customSerializer) {
			if (customSerializer === errSerializer) return customSerializer;
			return function wrapErrSerializer(err) {
				return customSerializer(errSerializer(err));
			};
		},
		wrapRequestSerializer: function wrapRequestSerializer(customSerializer) {
			if (customSerializer === reqSerializers.reqSerializer) return customSerializer;
			return function wrappedReqSerializer(req) {
				return customSerializer(reqSerializers.reqSerializer(req));
			};
		},
		wrapResponseSerializer: function wrapResponseSerializer(customSerializer) {
			if (customSerializer === resSerializers.resSerializer) return customSerializer;
			return function wrappedResSerializer(res) {
				return customSerializer(resSerializers.resSerializer(res));
			};
		}
	};
}));
//#endregion
//#region ../../node_modules/.bun/pino@10.3.1/node_modules/pino/lib/caller.js
var require_caller = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	function noOpPrepareStackTrace(_, stack) {
		return stack;
	}
	module.exports = function getCallers() {
		const originalPrepare = Error.prepareStackTrace;
		Error.prepareStackTrace = noOpPrepareStackTrace;
		const stack = (/* @__PURE__ */ new Error()).stack;
		Error.prepareStackTrace = originalPrepare;
		if (!Array.isArray(stack)) return;
		const entries = stack.slice(2);
		const fileNames = [];
		for (const entry of entries) {
			if (!entry) continue;
			fileNames.push(entry.getFileName());
		}
		return fileNames;
	};
}));
//#endregion
//#region ../../node_modules/.bun/pino@10.3.1/node_modules/pino/lib/symbols.js
var require_symbols = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const setLevelSym = Symbol("pino.setLevel");
	const getLevelSym = Symbol("pino.getLevel");
	const levelValSym = Symbol("pino.levelVal");
	const levelCompSym = Symbol("pino.levelComp");
	const useLevelLabelsSym = Symbol("pino.useLevelLabels");
	const useOnlyCustomLevelsSym = Symbol("pino.useOnlyCustomLevels");
	const mixinSym = Symbol("pino.mixin");
	const lsCacheSym = Symbol("pino.lsCache");
	const chindingsSym = Symbol("pino.chindings");
	const asJsonSym = Symbol("pino.asJson");
	const writeSym = Symbol("pino.write");
	const redactFmtSym = Symbol("pino.redactFmt");
	const timeSym = Symbol("pino.time");
	const timeSliceIndexSym = Symbol("pino.timeSliceIndex");
	const streamSym = Symbol("pino.stream");
	const stringifySym = Symbol("pino.stringify");
	const stringifySafeSym = Symbol("pino.stringifySafe");
	const stringifiersSym = Symbol("pino.stringifiers");
	const endSym = Symbol("pino.end");
	const formatOptsSym = Symbol("pino.formatOpts");
	const messageKeySym = Symbol("pino.messageKey");
	const errorKeySym = Symbol("pino.errorKey");
	const nestedKeySym = Symbol("pino.nestedKey");
	const nestedKeyStrSym = Symbol("pino.nestedKeyStr");
	const mixinMergeStrategySym = Symbol("pino.mixinMergeStrategy");
	const msgPrefixSym = Symbol("pino.msgPrefix");
	const wildcardFirstSym = Symbol("pino.wildcardFirst");
	const serializersSym = Symbol.for("pino.serializers");
	const formattersSym = Symbol.for("pino.formatters");
	const hooksSym = Symbol.for("pino.hooks");
	module.exports = {
		setLevelSym,
		getLevelSym,
		levelValSym,
		levelCompSym,
		useLevelLabelsSym,
		mixinSym,
		lsCacheSym,
		chindingsSym,
		asJsonSym,
		writeSym,
		serializersSym,
		redactFmtSym,
		timeSym,
		timeSliceIndexSym,
		streamSym,
		stringifySym,
		stringifySafeSym,
		stringifiersSym,
		endSym,
		formatOptsSym,
		messageKeySym,
		errorKeySym,
		nestedKeySym,
		wildcardFirstSym,
		needsMetadataGsym: Symbol.for("pino.metadata"),
		useOnlyCustomLevelsSym,
		formattersSym,
		hooksSym,
		nestedKeyStrSym,
		mixinMergeStrategySym,
		msgPrefixSym
	};
}));
//#endregion
//#region ../../node_modules/.bun/pino@10.3.1/node_modules/pino/lib/redaction.js
var require_redaction = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const Redact = require_redact();
	const { redactFmtSym, wildcardFirstSym } = require_symbols();
	const rx = /[^.[\]]+|\[([^[\]]*?)\]/g;
	const CENSOR = "[Redacted]";
	const strict = false;
	function redaction(opts, serialize) {
		const { paths, censor, remove } = handle(opts);
		const shape = paths.reduce((o, str) => {
			rx.lastIndex = 0;
			const first = rx.exec(str);
			const next = rx.exec(str);
			let ns = first[1] !== void 0 ? first[1].replace(/^(?:"|'|`)(.*)(?:"|'|`)$/, "$1") : first[0];
			if (ns === "*") ns = wildcardFirstSym;
			if (next === null) {
				o[ns] = null;
				return o;
			}
			if (o[ns] === null) return o;
			const { index } = next;
			const nextPath = `${str.substr(index, str.length - 1)}`;
			o[ns] = o[ns] || [];
			if (ns !== wildcardFirstSym && o[ns].length === 0) o[ns].push(...o[wildcardFirstSym] || []);
			if (ns === wildcardFirstSym) Object.keys(o).forEach(function(k) {
				if (o[k]) o[k].push(nextPath);
			});
			o[ns].push(nextPath);
			return o;
		}, {});
		const result = { [redactFmtSym]: Redact({
			paths,
			censor,
			serialize,
			strict,
			remove
		}) };
		const topCensor = (...args) => {
			return typeof censor === "function" ? serialize(censor(...args)) : serialize(censor);
		};
		return [...Object.keys(shape), ...Object.getOwnPropertySymbols(shape)].reduce((o, k) => {
			if (shape[k] === null) o[k] = (value) => topCensor(value, [k]);
			else {
				const wrappedCensor = typeof censor === "function" ? (value, path) => {
					return censor(value, [k, ...path]);
				} : censor;
				o[k] = Redact({
					paths: shape[k],
					censor: wrappedCensor,
					serialize,
					strict,
					remove
				});
			}
			return o;
		}, result);
	}
	function handle(opts) {
		if (Array.isArray(opts)) {
			opts = {
				paths: opts,
				censor: CENSOR
			};
			return opts;
		}
		let { paths, censor = CENSOR, remove } = opts;
		if (Array.isArray(paths) === false) throw Error("pino – redact must contain an array of strings");
		if (remove === true) censor = void 0;
		return {
			paths,
			censor,
			remove
		};
	}
	module.exports = redaction;
}));
//#endregion
//#region ../../node_modules/.bun/pino@10.3.1/node_modules/pino/lib/time.js
var require_time = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const nullTime = () => "";
	const epochTime = () => `,"time":${Date.now()}`;
	const unixTime = () => `,"time":${Math.round(Date.now() / 1e3)}`;
	const isoTime = () => `,"time":"${new Date(Date.now()).toISOString()}"`;
	const NS_PER_MS = 1000000n;
	const NS_PER_SEC = 1000000000n;
	const startWallTimeNs = BigInt(Date.now()) * NS_PER_MS;
	const startHrTime = process.hrtime.bigint();
	const isoTimeNano = () => {
		const currentTimeNs = startWallTimeNs + (process.hrtime.bigint() - startHrTime);
		const secondsSinceEpoch = currentTimeNs / NS_PER_SEC;
		const nanosWithinSecond = currentTimeNs % NS_PER_SEC;
		const msSinceEpoch = Number(secondsSinceEpoch * 1000n + nanosWithinSecond / 1000000n);
		const date = new Date(msSinceEpoch);
		return `,"time":"${date.getUTCFullYear()}-${(date.getUTCMonth() + 1).toString().padStart(2, "0")}-${date.getUTCDate().toString().padStart(2, "0")}T${date.getUTCHours().toString().padStart(2, "0")}:${date.getUTCMinutes().toString().padStart(2, "0")}:${date.getUTCSeconds().toString().padStart(2, "0")}.${nanosWithinSecond.toString().padStart(9, "0")}Z"`;
	};
	module.exports = {
		nullTime,
		epochTime,
		unixTime,
		isoTime,
		isoTimeNano
	};
}));
//#endregion
//#region ../../node_modules/.bun/quick-format-unescaped@4.0.4/node_modules/quick-format-unescaped/index.js
var require_quick_format_unescaped = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	function tryStringify(o) {
		try {
			return JSON.stringify(o);
		} catch (e) {
			return "\"[Circular]\"";
		}
	}
	module.exports = format;
	function format(f, args, opts) {
		var ss = opts && opts.stringify || tryStringify;
		var offset = 1;
		if (typeof f === "object" && f !== null) {
			var len = args.length + offset;
			if (len === 1) return f;
			var objects = new Array(len);
			objects[0] = ss(f);
			for (var index = 1; index < len; index++) objects[index] = ss(args[index]);
			return objects.join(" ");
		}
		if (typeof f !== "string") return f;
		var argLen = args.length;
		if (argLen === 0) return f;
		var str = "";
		var a = 1 - offset;
		var lastPos = -1;
		var flen = f && f.length || 0;
		for (var i = 0; i < flen;) {
			if (f.charCodeAt(i) === 37 && i + 1 < flen) {
				lastPos = lastPos > -1 ? lastPos : 0;
				switch (f.charCodeAt(i + 1)) {
					case 100:
					case 102:
						if (a >= argLen) break;
						if (args[a] == null) break;
						if (lastPos < i) str += f.slice(lastPos, i);
						str += Number(args[a]);
						lastPos = i + 2;
						i++;
						break;
					case 105:
						if (a >= argLen) break;
						if (args[a] == null) break;
						if (lastPos < i) str += f.slice(lastPos, i);
						str += Math.floor(Number(args[a]));
						lastPos = i + 2;
						i++;
						break;
					case 79:
					case 111:
					case 106:
						if (a >= argLen) break;
						if (args[a] === void 0) break;
						if (lastPos < i) str += f.slice(lastPos, i);
						var type = typeof args[a];
						if (type === "string") {
							str += "'" + args[a] + "'";
							lastPos = i + 2;
							i++;
							break;
						}
						if (type === "function") {
							str += args[a].name || "<anonymous>";
							lastPos = i + 2;
							i++;
							break;
						}
						str += ss(args[a]);
						lastPos = i + 2;
						i++;
						break;
					case 115:
						if (a >= argLen) break;
						if (lastPos < i) str += f.slice(lastPos, i);
						str += String(args[a]);
						lastPos = i + 2;
						i++;
						break;
					case 37:
						if (lastPos < i) str += f.slice(lastPos, i);
						str += "%";
						lastPos = i + 2;
						i++;
						a--;
						break;
				}
				++a;
			}
			++i;
		}
		if (lastPos === -1) return f;
		else if (lastPos < flen) str += f.slice(lastPos);
		return str;
	}
}));
//#endregion
//#region ../../node_modules/.bun/sonic-boom@4.2.1/node_modules/sonic-boom/index.js
var require_sonic_boom = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const fs = __require("fs");
	const EventEmitter$3 = __require("events");
	const inherits = __require("util").inherits;
	const path = __require("path");
	const sleep = require_atomic_sleep();
	const assert$8 = __require("assert");
	const BUSY_WRITE_TIMEOUT = 100;
	const kEmptyBuffer = Buffer.allocUnsafe(0);
	const MAX_WRITE = 16 * 1024;
	const kContentModeBuffer = "buffer";
	const kContentModeUtf8 = "utf8";
	const [major, minor] = (process.versions.node || "0.0").split(".").map(Number);
	const kCopyBuffer = major >= 22 && minor >= 7;
	function openFile(file, sonic) {
		sonic._opening = true;
		sonic._writing = true;
		sonic._asyncDrainScheduled = false;
		function fileOpened(err, fd) {
			if (err) {
				sonic._reopening = false;
				sonic._writing = false;
				sonic._opening = false;
				if (sonic.sync) process.nextTick(() => {
					if (sonic.listenerCount("error") > 0) sonic.emit("error", err);
				});
				else sonic.emit("error", err);
				return;
			}
			const reopening = sonic._reopening;
			sonic.fd = fd;
			sonic.file = file;
			sonic._reopening = false;
			sonic._opening = false;
			sonic._writing = false;
			if (sonic.sync) process.nextTick(() => sonic.emit("ready"));
			else sonic.emit("ready");
			if (sonic.destroyed) return;
			if (!sonic._writing && sonic._len > sonic.minLength || sonic._flushPending) sonic._actualWrite();
			else if (reopening) process.nextTick(() => sonic.emit("drain"));
		}
		const flags = sonic.append ? "a" : "w";
		const mode = sonic.mode;
		if (sonic.sync) try {
			if (sonic.mkdir) fs.mkdirSync(path.dirname(file), { recursive: true });
			fileOpened(null, fs.openSync(file, flags, mode));
		} catch (err) {
			fileOpened(err);
			throw err;
		}
		else if (sonic.mkdir) fs.mkdir(path.dirname(file), { recursive: true }, (err) => {
			if (err) return fileOpened(err);
			fs.open(file, flags, mode, fileOpened);
		});
		else fs.open(file, flags, mode, fileOpened);
	}
	function SonicBoom(opts) {
		if (!(this instanceof SonicBoom)) return new SonicBoom(opts);
		let { fd, dest, minLength, maxLength, maxWrite, periodicFlush, sync, append = true, mkdir, retryEAGAIN, fsync, contentMode, mode } = opts || {};
		fd = fd || dest;
		this._len = 0;
		this.fd = -1;
		this._bufs = [];
		this._lens = [];
		this._writing = false;
		this._ending = false;
		this._reopening = false;
		this._asyncDrainScheduled = false;
		this._flushPending = false;
		this._hwm = Math.max(minLength || 0, 16387);
		this.file = null;
		this.destroyed = false;
		this.minLength = minLength || 0;
		this.maxLength = maxLength || 0;
		this.maxWrite = maxWrite || MAX_WRITE;
		this._periodicFlush = periodicFlush || 0;
		this._periodicFlushTimer = void 0;
		this.sync = sync || false;
		this.writable = true;
		this._fsync = fsync || false;
		this.append = append || false;
		this.mode = mode;
		this.retryEAGAIN = retryEAGAIN || (() => true);
		this.mkdir = mkdir || false;
		let fsWriteSync;
		let fsWrite;
		if (contentMode === kContentModeBuffer) {
			this._writingBuf = kEmptyBuffer;
			this.write = writeBuffer;
			this.flush = flushBuffer;
			this.flushSync = flushBufferSync;
			this._actualWrite = actualWriteBuffer;
			fsWriteSync = () => fs.writeSync(this.fd, this._writingBuf);
			fsWrite = () => fs.write(this.fd, this._writingBuf, this.release);
		} else if (contentMode === void 0 || contentMode === kContentModeUtf8) {
			this._writingBuf = "";
			this.write = write;
			this.flush = flush;
			this.flushSync = flushSync;
			this._actualWrite = actualWrite;
			fsWriteSync = () => {
				if (Buffer.isBuffer(this._writingBuf)) return fs.writeSync(this.fd, this._writingBuf);
				return fs.writeSync(this.fd, this._writingBuf, "utf8");
			};
			fsWrite = () => {
				if (Buffer.isBuffer(this._writingBuf)) return fs.write(this.fd, this._writingBuf, this.release);
				return fs.write(this.fd, this._writingBuf, "utf8", this.release);
			};
		} else throw new Error(`SonicBoom supports "${kContentModeUtf8}" and "${kContentModeBuffer}", but passed ${contentMode}`);
		if (typeof fd === "number") {
			this.fd = fd;
			process.nextTick(() => this.emit("ready"));
		} else if (typeof fd === "string") openFile(fd, this);
		else throw new Error("SonicBoom supports only file descriptors and files");
		if (this.minLength >= this.maxWrite) throw new Error(`minLength should be smaller than maxWrite (${this.maxWrite})`);
		this.release = (err, n) => {
			if (err) {
				if ((err.code === "EAGAIN" || err.code === "EBUSY") && this.retryEAGAIN(err, this._writingBuf.length, this._len - this._writingBuf.length)) if (this.sync) try {
					sleep(BUSY_WRITE_TIMEOUT);
					this.release(void 0, 0);
				} catch (err) {
					this.release(err);
				}
				else setTimeout(fsWrite, BUSY_WRITE_TIMEOUT);
				else {
					this._writing = false;
					this.emit("error", err);
				}
				return;
			}
			this.emit("write", n);
			const releasedBufObj = releaseWritingBuf(this._writingBuf, this._len, n);
			this._len = releasedBufObj.len;
			this._writingBuf = releasedBufObj.writingBuf;
			if (this._writingBuf.length) {
				if (!this.sync) {
					fsWrite();
					return;
				}
				try {
					do {
						const n = fsWriteSync();
						const releasedBufObj = releaseWritingBuf(this._writingBuf, this._len, n);
						this._len = releasedBufObj.len;
						this._writingBuf = releasedBufObj.writingBuf;
					} while (this._writingBuf.length);
				} catch (err) {
					this.release(err);
					return;
				}
			}
			if (this._fsync) fs.fsyncSync(this.fd);
			const len = this._len;
			if (this._reopening) {
				this._writing = false;
				this._reopening = false;
				this.reopen();
			} else if (len > this.minLength) this._actualWrite();
			else if (this._ending) if (len > 0) this._actualWrite();
			else {
				this._writing = false;
				actualClose(this);
			}
			else {
				this._writing = false;
				if (this.sync) {
					if (!this._asyncDrainScheduled) {
						this._asyncDrainScheduled = true;
						process.nextTick(emitDrain, this);
					}
				} else this.emit("drain");
			}
		};
		this.on("newListener", function(name) {
			if (name === "drain") this._asyncDrainScheduled = false;
		});
		if (this._periodicFlush !== 0) {
			this._periodicFlushTimer = setInterval(() => this.flush(null), this._periodicFlush);
			this._periodicFlushTimer.unref();
		}
	}
	/**
	* Release the writingBuf after fs.write n bytes data
	* @param {string | Buffer} writingBuf - currently writing buffer, usually be instance._writingBuf.
	* @param {number} len - currently buffer length, usually be instance._len.
	* @param {number} n - number of bytes fs already written
	* @returns {{writingBuf: string | Buffer, len: number}} released writingBuf and length
	*/
	function releaseWritingBuf(writingBuf, len, n) {
		if (typeof writingBuf === "string") writingBuf = Buffer.from(writingBuf);
		len = Math.max(len - n, 0);
		writingBuf = writingBuf.subarray(n);
		return {
			writingBuf,
			len
		};
	}
	function emitDrain(sonic) {
		if (!(sonic.listenerCount("drain") > 0)) return;
		sonic._asyncDrainScheduled = false;
		sonic.emit("drain");
	}
	inherits(SonicBoom, EventEmitter$3);
	function mergeBuf(bufs, len) {
		if (bufs.length === 0) return kEmptyBuffer;
		if (bufs.length === 1) return bufs[0];
		return Buffer.concat(bufs, len);
	}
	function write(data) {
		if (this.destroyed) throw new Error("SonicBoom destroyed");
		data = "" + data;
		const dataLen = Buffer.byteLength(data);
		const len = this._len + dataLen;
		const bufs = this._bufs;
		if (this.maxLength && len > this.maxLength) {
			this.emit("drop", data);
			return this._len < this._hwm;
		}
		if (bufs.length === 0 || Buffer.byteLength(bufs[bufs.length - 1]) + dataLen > this.maxWrite) bufs.push(data);
		else bufs[bufs.length - 1] += data;
		this._len = len;
		if (!this._writing && this._len >= this.minLength) this._actualWrite();
		return this._len < this._hwm;
	}
	function writeBuffer(data) {
		if (this.destroyed) throw new Error("SonicBoom destroyed");
		const len = this._len + data.length;
		const bufs = this._bufs;
		const lens = this._lens;
		if (this.maxLength && len > this.maxLength) {
			this.emit("drop", data);
			return this._len < this._hwm;
		}
		if (bufs.length === 0 || lens[lens.length - 1] + data.length > this.maxWrite) {
			bufs.push([data]);
			lens.push(data.length);
		} else {
			bufs[bufs.length - 1].push(data);
			lens[lens.length - 1] += data.length;
		}
		this._len = len;
		if (!this._writing && this._len >= this.minLength) this._actualWrite();
		return this._len < this._hwm;
	}
	function callFlushCallbackOnDrain(cb) {
		this._flushPending = true;
		const onDrain = () => {
			if (!this._fsync) try {
				fs.fsync(this.fd, (err) => {
					this._flushPending = false;
					cb(err);
				});
			} catch (err) {
				cb(err);
			}
			else {
				this._flushPending = false;
				cb();
			}
			this.off("error", onError);
		};
		const onError = (err) => {
			this._flushPending = false;
			cb(err);
			this.off("drain", onDrain);
		};
		this.once("drain", onDrain);
		this.once("error", onError);
	}
	function flush(cb) {
		if (cb != null && typeof cb !== "function") throw new Error("flush cb must be a function");
		if (this.destroyed) {
			const error = /* @__PURE__ */ new Error("SonicBoom destroyed");
			if (cb) {
				cb(error);
				return;
			}
			throw error;
		}
		if (this.minLength <= 0) {
			cb?.();
			return;
		}
		if (cb) callFlushCallbackOnDrain.call(this, cb);
		if (this._writing) return;
		if (this._bufs.length === 0) this._bufs.push("");
		this._actualWrite();
	}
	function flushBuffer(cb) {
		if (cb != null && typeof cb !== "function") throw new Error("flush cb must be a function");
		if (this.destroyed) {
			const error = /* @__PURE__ */ new Error("SonicBoom destroyed");
			if (cb) {
				cb(error);
				return;
			}
			throw error;
		}
		if (this.minLength <= 0) {
			cb?.();
			return;
		}
		if (cb) callFlushCallbackOnDrain.call(this, cb);
		if (this._writing) return;
		if (this._bufs.length === 0) {
			this._bufs.push([]);
			this._lens.push(0);
		}
		this._actualWrite();
	}
	SonicBoom.prototype.reopen = function(file) {
		if (this.destroyed) throw new Error("SonicBoom destroyed");
		if (this._opening) {
			this.once("ready", () => {
				this.reopen(file);
			});
			return;
		}
		if (this._ending) return;
		if (!this.file) throw new Error("Unable to reopen a file descriptor, you must pass a file to SonicBoom");
		if (file) this.file = file;
		this._reopening = true;
		if (this._writing) return;
		const fd = this.fd;
		this.once("ready", () => {
			if (fd !== this.fd) fs.close(fd, (err) => {
				if (err) return this.emit("error", err);
			});
		});
		openFile(this.file, this);
	};
	SonicBoom.prototype.end = function() {
		if (this.destroyed) throw new Error("SonicBoom destroyed");
		if (this._opening) {
			this.once("ready", () => {
				this.end();
			});
			return;
		}
		if (this._ending) return;
		this._ending = true;
		if (this._writing) return;
		if (this._len > 0 && this.fd >= 0) this._actualWrite();
		else actualClose(this);
	};
	function flushSync() {
		if (this.destroyed) throw new Error("SonicBoom destroyed");
		if (this.fd < 0) throw new Error("sonic boom is not ready yet");
		if (!this._writing && this._writingBuf.length > 0) {
			this._bufs.unshift(this._writingBuf);
			this._writingBuf = "";
		}
		let buf = "";
		while (this._bufs.length || buf.length) {
			if (buf.length <= 0) buf = this._bufs[0];
			try {
				const n = Buffer.isBuffer(buf) ? fs.writeSync(this.fd, buf) : fs.writeSync(this.fd, buf, "utf8");
				const releasedBufObj = releaseWritingBuf(buf, this._len, n);
				buf = releasedBufObj.writingBuf;
				this._len = releasedBufObj.len;
				if (buf.length <= 0) this._bufs.shift();
			} catch (err) {
				if ((err.code === "EAGAIN" || err.code === "EBUSY") && !this.retryEAGAIN(err, buf.length, this._len - buf.length)) throw err;
				sleep(BUSY_WRITE_TIMEOUT);
			}
		}
		try {
			fs.fsyncSync(this.fd);
		} catch {}
	}
	function flushBufferSync() {
		if (this.destroyed) throw new Error("SonicBoom destroyed");
		if (this.fd < 0) throw new Error("sonic boom is not ready yet");
		if (!this._writing && this._writingBuf.length > 0) {
			this._bufs.unshift([this._writingBuf]);
			this._writingBuf = kEmptyBuffer;
		}
		let buf = kEmptyBuffer;
		while (this._bufs.length || buf.length) {
			if (buf.length <= 0) buf = mergeBuf(this._bufs[0], this._lens[0]);
			try {
				const n = fs.writeSync(this.fd, buf);
				buf = buf.subarray(n);
				this._len = Math.max(this._len - n, 0);
				if (buf.length <= 0) {
					this._bufs.shift();
					this._lens.shift();
				}
			} catch (err) {
				if ((err.code === "EAGAIN" || err.code === "EBUSY") && !this.retryEAGAIN(err, buf.length, this._len - buf.length)) throw err;
				sleep(BUSY_WRITE_TIMEOUT);
			}
		}
	}
	SonicBoom.prototype.destroy = function() {
		if (this.destroyed) return;
		actualClose(this);
	};
	function actualWrite() {
		const release = this.release;
		this._writing = true;
		this._writingBuf = this._writingBuf.length ? this._writingBuf : this._bufs.shift() || "";
		if (this.sync) try {
			release(null, Buffer.isBuffer(this._writingBuf) ? fs.writeSync(this.fd, this._writingBuf) : fs.writeSync(this.fd, this._writingBuf, "utf8"));
		} catch (err) {
			release(err);
		}
		else fs.write(this.fd, this._writingBuf, release);
	}
	function actualWriteBuffer() {
		const release = this.release;
		this._writing = true;
		this._writingBuf = this._writingBuf.length ? this._writingBuf : mergeBuf(this._bufs.shift(), this._lens.shift());
		if (this.sync) try {
			release(null, fs.writeSync(this.fd, this._writingBuf));
		} catch (err) {
			release(err);
		}
		else {
			if (kCopyBuffer) this._writingBuf = Buffer.from(this._writingBuf);
			fs.write(this.fd, this._writingBuf, release);
		}
	}
	function actualClose(sonic) {
		if (sonic.fd === -1) {
			sonic.once("ready", actualClose.bind(null, sonic));
			return;
		}
		if (sonic._periodicFlushTimer !== void 0) clearInterval(sonic._periodicFlushTimer);
		sonic.destroyed = true;
		sonic._bufs = [];
		sonic._lens = [];
		assert$8(typeof sonic.fd === "number", `sonic.fd must be a number, got ${typeof sonic.fd}`);
		try {
			fs.fsync(sonic.fd, closeWrapped);
		} catch {}
		function closeWrapped() {
			if (sonic.fd !== 1 && sonic.fd !== 2) fs.close(sonic.fd, done);
			else done();
		}
		function done(err) {
			if (err) {
				sonic.emit("error", err);
				return;
			}
			if (sonic._ending && !sonic._writing) sonic.emit("finish");
			sonic.emit("close");
		}
	}
	/**
	* These export configurations enable JS and TS developers
	* to consumer SonicBoom in whatever way best suits their needs.
	* Some examples of supported import syntax includes:
	* - `const SonicBoom = require('SonicBoom')`
	* - `const { SonicBoom } = require('SonicBoom')`
	* - `import * as SonicBoom from 'SonicBoom'`
	* - `import { SonicBoom } from 'SonicBoom'`
	* - `import SonicBoom from 'SonicBoom'`
	*/
	SonicBoom.SonicBoom = SonicBoom;
	SonicBoom.default = SonicBoom;
	module.exports = SonicBoom;
}));
//#endregion
//#region ../../node_modules/.bun/on-exit-leak-free@2.1.2/node_modules/on-exit-leak-free/index.js
var require_on_exit_leak_free = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const refs = {
		exit: [],
		beforeExit: []
	};
	const functions = {
		exit: onExit,
		beforeExit: onBeforeExit
	};
	let registry;
	function ensureRegistry() {
		if (registry === void 0) registry = new FinalizationRegistry(clear);
	}
	function install(event) {
		if (refs[event].length > 0) return;
		process.on(event, functions[event]);
	}
	function uninstall(event) {
		if (refs[event].length > 0) return;
		process.removeListener(event, functions[event]);
		if (refs.exit.length === 0 && refs.beforeExit.length === 0) registry = void 0;
	}
	function onExit() {
		callRefs("exit");
	}
	function onBeforeExit() {
		callRefs("beforeExit");
	}
	function callRefs(event) {
		for (const ref of refs[event]) {
			const obj = ref.deref();
			const fn = ref.fn;
			/* istanbul ignore else */
			if (obj !== void 0) fn(obj, event);
		}
		refs[event] = [];
	}
	function clear(ref) {
		for (const event of ["exit", "beforeExit"]) {
			const index = refs[event].indexOf(ref);
			refs[event].splice(index, index + 1);
			uninstall(event);
		}
	}
	function _register(event, obj, fn) {
		if (obj === void 0) throw new Error("the object can't be undefined");
		install(event);
		const ref = new WeakRef(obj);
		ref.fn = fn;
		ensureRegistry();
		registry.register(obj, ref);
		refs[event].push(ref);
	}
	function register(obj, fn) {
		_register("exit", obj, fn);
	}
	function registerBeforeExit(obj, fn) {
		_register("beforeExit", obj, fn);
	}
	function unregister(obj) {
		if (registry === void 0) return;
		registry.unregister(obj);
		for (const event of ["exit", "beforeExit"]) {
			refs[event] = refs[event].filter((ref) => {
				const _obj = ref.deref();
				return _obj && _obj !== obj;
			});
			uninstall(event);
		}
	}
	module.exports = {
		register,
		registerBeforeExit,
		unregister
	};
}));
//#endregion
//#region ../../node_modules/.bun/thread-stream@4.0.0/node_modules/thread-stream/package.json
var require_package = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = {
		"name": "thread-stream",
		"version": "4.0.0",
		"description": "A streaming way to send data to a Node.js Worker Thread",
		"main": "index.js",
		"types": "index.d.ts",
		"engines": { "node": ">=20" },
		"dependencies": { "real-require": "^0.2.0" },
		"devDependencies": {
			"@types/node": "^22.0.0",
			"@yao-pkg/pkg": "^6.0.0",
			"borp": "^0.21.0",
			"desm": "^1.3.0",
			"eslint": "^9.39.1",
			"fastbench": "^1.0.1",
			"husky": "^9.0.6",
			"neostandard": "^0.12.2",
			"pino-elasticsearch": "^8.0.0",
			"sonic-boom": "^4.0.1",
			"ts-node": "^10.8.0",
			"typescript": "~5.7.3"
		},
		"scripts": {
			"build": "tsc --noEmit",
			"lint": "eslint",
			"test": "npm run lint && npm run build && npm run transpile && borp --pattern 'test/*.test.{js,mjs}'",
			"test:ci": "npm run lint && npm run transpile && borp --pattern 'test/*.test.{js,mjs}'",
			"test:yarn": "npm run transpile && borp --pattern 'test/*.test.js'",
			"transpile": "sh ./test/ts/transpile.sh",
			"prepare": "husky install"
		},
		"repository": {
			"type": "git",
			"url": "git+https://github.com/mcollina/thread-stream.git"
		},
		"keywords": [
			"worker",
			"thread",
			"threads",
			"stream"
		],
		"author": "Matteo Collina <hello@matteocollina.com>",
		"license": "MIT",
		"bugs": { "url": "https://github.com/mcollina/thread-stream/issues" },
		"homepage": "https://github.com/mcollina/thread-stream#readme"
	};
}));
//#endregion
//#region ../../node_modules/.bun/thread-stream@4.0.0/node_modules/thread-stream/lib/wait.js
var require_wait = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const WAIT_MS = 1e4;
	function wait(state, index, expected, timeout, done) {
		const max = timeout === Infinity ? Infinity : Date.now() + timeout;
		const check = () => {
			const current = Atomics.load(state, index);
			if (current === expected) {
				done(null, "ok");
				return;
			}
			if (max !== Infinity && Date.now() > max) {
				done(null, "timed-out");
				return;
			}
			const remaining = max === Infinity ? WAIT_MS : Math.min(WAIT_MS, Math.max(1, max - Date.now()));
			const result = Atomics.waitAsync(state, index, current, remaining);
			if (result.async) result.value.then(check);
			else setImmediate(check);
		};
		check();
	}
	function waitDiff(state, index, expected, timeout, done) {
		const max = timeout === Infinity ? Infinity : Date.now() + timeout;
		const check = () => {
			if (Atomics.load(state, index) !== expected) {
				done(null, "ok");
				return;
			}
			if (max !== Infinity && Date.now() > max) {
				done(null, "timed-out");
				return;
			}
			const remaining = max === Infinity ? WAIT_MS : Math.min(WAIT_MS, Math.max(1, max - Date.now()));
			const result = Atomics.waitAsync(state, index, expected, remaining);
			if (result.async) result.value.then(check);
			else setImmediate(check);
		};
		check();
	}
	module.exports = {
		wait,
		waitDiff
	};
}));
//#endregion
//#region ../../node_modules/.bun/thread-stream@4.0.0/node_modules/thread-stream/lib/indexes.js
var require_indexes = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = {
		WRITE_INDEX: 4,
		READ_INDEX: 8
	};
}));
//#endregion
//#region ../../node_modules/.bun/thread-stream@4.0.0/node_modules/thread-stream/index.js
var require_thread_stream = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { version } = require_package();
	const { EventEmitter: EventEmitter$2 } = __require("events");
	const { Worker } = __require("worker_threads");
	const { join: join$1 } = __require("path");
	const { pathToFileURL } = __require("url");
	const { wait } = require_wait();
	const { WRITE_INDEX, READ_INDEX } = require_indexes();
	const buffer = __require("buffer");
	const assert$7 = __require("assert");
	const kImpl = Symbol("kImpl");
	const MAX_STRING = buffer.constants.MAX_STRING_LENGTH;
	var FakeWeakRef = class {
		constructor(value) {
			this._value = value;
		}
		deref() {
			return this._value;
		}
	};
	var FakeFinalizationRegistry = class {
		register() {}
		unregister() {}
	};
	const FinalizationRegistry = process.env.NODE_V8_COVERAGE ? FakeFinalizationRegistry : global.FinalizationRegistry || FakeFinalizationRegistry;
	const WeakRef = process.env.NODE_V8_COVERAGE ? FakeWeakRef : global.WeakRef || FakeWeakRef;
	const registry = new FinalizationRegistry((worker) => {
		if (worker.exited) return;
		worker.terminate();
	});
	function createWorker(stream, opts) {
		const { filename, workerData } = opts;
		const worker = new Worker(("__bundlerPathsOverrides" in globalThis ? globalThis.__bundlerPathsOverrides : {})["thread-stream-worker"] || join$1(__dirname, "lib", "worker.js"), {
			...opts.workerOpts,
			trackUnmanagedFds: false,
			workerData: {
				filename: filename.indexOf("file://") === 0 ? filename : pathToFileURL(filename).href,
				dataBuf: stream[kImpl].dataBuf,
				stateBuf: stream[kImpl].stateBuf,
				workerData: {
					$context: { threadStreamVersion: version },
					...workerData
				}
			}
		});
		worker.stream = new FakeWeakRef(stream);
		worker.on("message", onWorkerMessage);
		worker.on("exit", onWorkerExit);
		registry.register(stream, worker);
		return worker;
	}
	function drain(stream) {
		assert$7(!stream[kImpl].sync);
		if (stream[kImpl].needDrain) {
			stream[kImpl].needDrain = false;
			stream.emit("drain");
		}
	}
	function nextFlush(stream) {
		const writeIndex = Atomics.load(stream[kImpl].state, WRITE_INDEX);
		let leftover = stream[kImpl].data.length - writeIndex;
		if (leftover > 0) {
			if (stream[kImpl].buf.length === 0) {
				stream[kImpl].flushing = false;
				if (stream[kImpl].ending) end(stream);
				else if (stream[kImpl].needDrain) process.nextTick(drain, stream);
				return;
			}
			let toWrite = stream[kImpl].buf.slice(0, leftover);
			let toWriteBytes = Buffer.byteLength(toWrite);
			if (toWriteBytes <= leftover) {
				stream[kImpl].buf = stream[kImpl].buf.slice(leftover);
				write(stream, toWrite, nextFlush.bind(null, stream));
			} else stream.flush(() => {
				if (stream.destroyed) return;
				Atomics.store(stream[kImpl].state, READ_INDEX, 0);
				Atomics.store(stream[kImpl].state, WRITE_INDEX, 0);
				Atomics.notify(stream[kImpl].state, READ_INDEX);
				while (toWriteBytes > stream[kImpl].data.length) {
					leftover = leftover / 2;
					toWrite = stream[kImpl].buf.slice(0, leftover);
					toWriteBytes = Buffer.byteLength(toWrite);
				}
				stream[kImpl].buf = stream[kImpl].buf.slice(leftover);
				write(stream, toWrite, nextFlush.bind(null, stream));
			});
		} else if (leftover === 0) {
			if (writeIndex === 0 && stream[kImpl].buf.length === 0) return;
			stream.flush(() => {
				Atomics.store(stream[kImpl].state, READ_INDEX, 0);
				Atomics.store(stream[kImpl].state, WRITE_INDEX, 0);
				Atomics.notify(stream[kImpl].state, READ_INDEX);
				nextFlush(stream);
			});
		} else destroy(stream, /* @__PURE__ */ new Error("overwritten"));
	}
	function onWorkerMessage(msg) {
		const stream = this.stream.deref();
		if (stream === void 0) {
			this.exited = true;
			this.terminate();
			return;
		}
		switch (msg.code) {
			case "READY":
				this.stream = new WeakRef(stream);
				stream.flush(() => {
					stream[kImpl].ready = true;
					stream.emit("ready");
				});
				break;
			case "ERROR":
				destroy(stream, msg.err);
				break;
			case "EVENT":
				if (Array.isArray(msg.args)) stream.emit(msg.name, ...msg.args);
				else stream.emit(msg.name, msg.args);
				break;
			case "WARNING":
				process.emitWarning(msg.err);
				break;
			default: destroy(stream, /* @__PURE__ */ new Error("this should not happen: " + msg.code));
		}
	}
	function onWorkerExit(code) {
		const stream = this.stream.deref();
		if (stream === void 0) return;
		registry.unregister(stream);
		stream.worker.exited = true;
		stream.worker.off("exit", onWorkerExit);
		destroy(stream, code !== 0 ? /* @__PURE__ */ new Error("the worker thread exited") : null);
	}
	var ThreadStream = class extends EventEmitter$2 {
		constructor(opts = {}) {
			super();
			if (opts.bufferSize < 4) throw new Error("bufferSize must at least fit a 4-byte utf-8 char");
			this[kImpl] = {};
			this[kImpl].stateBuf = new SharedArrayBuffer(128);
			this[kImpl].state = new Int32Array(this[kImpl].stateBuf);
			this[kImpl].dataBuf = new SharedArrayBuffer(opts.bufferSize || 4 * 1024 * 1024);
			this[kImpl].data = Buffer.from(this[kImpl].dataBuf);
			this[kImpl].sync = opts.sync || false;
			this[kImpl].ending = false;
			this[kImpl].ended = false;
			this[kImpl].needDrain = false;
			this[kImpl].destroyed = false;
			this[kImpl].flushing = false;
			this[kImpl].ready = false;
			this[kImpl].finished = false;
			this[kImpl].errored = null;
			this[kImpl].closed = false;
			this[kImpl].buf = "";
			this.worker = createWorker(this, opts);
			this.on("message", (message, transferList) => {
				this.worker.postMessage(message, transferList);
			});
		}
		write(data) {
			if (this[kImpl].destroyed) {
				error(this, /* @__PURE__ */ new Error("the worker has exited"));
				return false;
			}
			if (this[kImpl].ending) {
				error(this, /* @__PURE__ */ new Error("the worker is ending"));
				return false;
			}
			if (this[kImpl].flushing && this[kImpl].buf.length + data.length >= MAX_STRING) try {
				writeSync(this);
				this[kImpl].flushing = true;
			} catch (err) {
				destroy(this, err);
				return false;
			}
			this[kImpl].buf += data;
			if (this[kImpl].sync) try {
				writeSync(this);
				return true;
			} catch (err) {
				destroy(this, err);
				return false;
			}
			if (!this[kImpl].flushing) {
				this[kImpl].flushing = true;
				setImmediate(nextFlush, this);
			}
			this[kImpl].needDrain = this[kImpl].data.length - this[kImpl].buf.length - Atomics.load(this[kImpl].state, WRITE_INDEX) <= 0;
			return !this[kImpl].needDrain;
		}
		end() {
			if (this[kImpl].destroyed) return;
			this[kImpl].ending = true;
			end(this);
		}
		flush(cb) {
			if (this[kImpl].destroyed) {
				if (typeof cb === "function") process.nextTick(cb, /* @__PURE__ */ new Error("the worker has exited"));
				return;
			}
			const writeIndex = Atomics.load(this[kImpl].state, WRITE_INDEX);
			wait(this[kImpl].state, READ_INDEX, writeIndex, Infinity, (err, res) => {
				if (err) {
					destroy(this, err);
					process.nextTick(cb, err);
					return;
				}
				if (res === "not-equal") {
					this.flush(cb);
					return;
				}
				process.nextTick(cb);
			});
		}
		flushSync() {
			if (this[kImpl].destroyed) return;
			writeSync(this);
			flushSync(this);
		}
		unref() {
			this.worker.unref();
		}
		ref() {
			this.worker.ref();
		}
		get ready() {
			return this[kImpl].ready;
		}
		get destroyed() {
			return this[kImpl].destroyed;
		}
		get closed() {
			return this[kImpl].closed;
		}
		get writable() {
			return !this[kImpl].destroyed && !this[kImpl].ending;
		}
		get writableEnded() {
			return this[kImpl].ending;
		}
		get writableFinished() {
			return this[kImpl].finished;
		}
		get writableNeedDrain() {
			return this[kImpl].needDrain;
		}
		get writableObjectMode() {
			return false;
		}
		get writableErrored() {
			return this[kImpl].errored;
		}
	};
	function error(stream, err) {
		setImmediate(() => {
			stream.emit("error", err);
		});
	}
	function destroy(stream, err) {
		if (stream[kImpl].destroyed) return;
		stream[kImpl].destroyed = true;
		if (err) {
			stream[kImpl].errored = err;
			error(stream, err);
		}
		if (!stream.worker.exited) stream.worker.terminate().catch(() => {}).then(() => {
			stream[kImpl].closed = true;
			stream.emit("close");
		});
		else setImmediate(() => {
			stream[kImpl].closed = true;
			stream.emit("close");
		});
	}
	function write(stream, data, cb) {
		const current = Atomics.load(stream[kImpl].state, WRITE_INDEX);
		const length = Buffer.byteLength(data);
		stream[kImpl].data.write(data, current);
		Atomics.store(stream[kImpl].state, WRITE_INDEX, current + length);
		Atomics.notify(stream[kImpl].state, WRITE_INDEX);
		cb();
		return true;
	}
	function end(stream) {
		if (stream[kImpl].ended || !stream[kImpl].ending || stream[kImpl].flushing) return;
		stream[kImpl].ended = true;
		try {
			stream.flushSync();
			let readIndex = Atomics.load(stream[kImpl].state, READ_INDEX);
			Atomics.store(stream[kImpl].state, WRITE_INDEX, -1);
			Atomics.notify(stream[kImpl].state, WRITE_INDEX);
			let spins = 0;
			while (readIndex !== -1) {
				Atomics.wait(stream[kImpl].state, READ_INDEX, readIndex, 1e3);
				readIndex = Atomics.load(stream[kImpl].state, READ_INDEX);
				if (readIndex === -2) {
					destroy(stream, /* @__PURE__ */ new Error("end() failed"));
					return;
				}
				if (++spins === 10) {
					destroy(stream, /* @__PURE__ */ new Error("end() took too long (10s)"));
					return;
				}
			}
			process.nextTick(() => {
				stream[kImpl].finished = true;
				stream.emit("finish");
			});
		} catch (err) {
			destroy(stream, err);
		}
	}
	function writeSync(stream) {
		const cb = () => {
			if (stream[kImpl].ending) end(stream);
			else if (stream[kImpl].needDrain) process.nextTick(drain, stream);
		};
		stream[kImpl].flushing = false;
		while (stream[kImpl].buf.length !== 0) {
			const writeIndex = Atomics.load(stream[kImpl].state, WRITE_INDEX);
			let leftover = stream[kImpl].data.length - writeIndex;
			if (leftover === 0) {
				flushSync(stream);
				Atomics.store(stream[kImpl].state, READ_INDEX, 0);
				Atomics.store(stream[kImpl].state, WRITE_INDEX, 0);
				Atomics.notify(stream[kImpl].state, READ_INDEX);
				continue;
			} else if (leftover < 0) throw new Error("overwritten");
			let toWrite = stream[kImpl].buf.slice(0, leftover);
			let toWriteBytes = Buffer.byteLength(toWrite);
			if (toWriteBytes <= leftover) {
				stream[kImpl].buf = stream[kImpl].buf.slice(leftover);
				write(stream, toWrite, cb);
			} else {
				flushSync(stream);
				Atomics.store(stream[kImpl].state, READ_INDEX, 0);
				Atomics.store(stream[kImpl].state, WRITE_INDEX, 0);
				Atomics.notify(stream[kImpl].state, READ_INDEX);
				while (toWriteBytes > stream[kImpl].buf.length) {
					leftover = leftover / 2;
					toWrite = stream[kImpl].buf.slice(0, leftover);
					toWriteBytes = Buffer.byteLength(toWrite);
				}
				stream[kImpl].buf = stream[kImpl].buf.slice(leftover);
				write(stream, toWrite, cb);
			}
		}
	}
	function flushSync(stream) {
		if (stream[kImpl].flushing) throw new Error("unable to flush while flushing");
		const writeIndex = Atomics.load(stream[kImpl].state, WRITE_INDEX);
		let spins = 0;
		while (true) {
			const readIndex = Atomics.load(stream[kImpl].state, READ_INDEX);
			if (readIndex === -2) throw Error("_flushSync failed");
			if (readIndex !== writeIndex) Atomics.wait(stream[kImpl].state, READ_INDEX, readIndex, 1e3);
			else break;
			if (++spins === 10) throw new Error("_flushSync took too long (10s)");
		}
	}
	module.exports = ThreadStream;
}));
//#endregion
//#region ../../node_modules/.bun/pino@10.3.1/node_modules/pino/lib/transport.js
var require_transport = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { createRequire } = __require("module");
	const { existsSync } = __require("node:fs");
	const getCallers = require_caller();
	const { join, isAbsolute, sep } = __require("node:path");
	const { fileURLToPath } = __require("node:url");
	const sleep = require_atomic_sleep();
	const onExit = require_on_exit_leak_free();
	const ThreadStream = require_thread_stream();
	function setupOnExit(stream) {
		onExit.register(stream, autoEnd);
		onExit.registerBeforeExit(stream, flush);
		stream.on("close", function() {
			onExit.unregister(stream);
		});
	}
	function hasPreloadFlags() {
		const execArgv = process.execArgv;
		for (let i = 0; i < execArgv.length; i++) {
			const arg = execArgv[i];
			if (arg === "--import" || arg === "--require" || arg === "-r") return true;
			if (arg.startsWith("--import=") || arg.startsWith("--require=") || arg.startsWith("-r=")) return true;
		}
		return false;
	}
	function sanitizeNodeOptions(nodeOptions) {
		const tokens = nodeOptions.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g);
		if (!tokens) return nodeOptions;
		const sanitized = [];
		let changed = false;
		for (let i = 0; i < tokens.length; i++) {
			const token = tokens[i];
			if (token === "--require" || token === "-r" || token === "--import") {
				const next = tokens[i + 1];
				if (next && shouldDropPreload(next)) {
					changed = true;
					i++;
					continue;
				}
				sanitized.push(token);
				if (next) {
					sanitized.push(next);
					i++;
				}
				continue;
			}
			if (token.startsWith("--require=") || token.startsWith("-r=") || token.startsWith("--import=")) {
				if (shouldDropPreload(token.slice(token.indexOf("=") + 1))) {
					changed = true;
					continue;
				}
			}
			sanitized.push(token);
		}
		return changed ? sanitized.join(" ") : nodeOptions;
	}
	function shouldDropPreload(value) {
		const unquoted = stripQuotes(value);
		if (!unquoted) return false;
		let path = unquoted;
		if (path.startsWith("file://")) try {
			path = fileURLToPath(path);
		} catch {
			return false;
		}
		return isAbsolute(path) && !existsSync(path);
	}
	function stripQuotes(value) {
		const first = value[0];
		const last = value[value.length - 1];
		if (first === "\"" && last === "\"" || first === "'" && last === "'") return value.slice(1, -1);
		return value;
	}
	function buildStream(filename, workerData, workerOpts, sync, name) {
		if (!workerOpts.execArgv && hasPreloadFlags() && __require.main === void 0) workerOpts = {
			...workerOpts,
			execArgv: []
		};
		if (!workerOpts.env && process.env.NODE_OPTIONS) {
			const nodeOptions = sanitizeNodeOptions(process.env.NODE_OPTIONS);
			if (nodeOptions !== process.env.NODE_OPTIONS) workerOpts = {
				...workerOpts,
				env: {
					...process.env,
					NODE_OPTIONS: nodeOptions
				}
			};
		}
		workerOpts = {
			...workerOpts,
			name
		};
		const stream = new ThreadStream({
			filename,
			workerData,
			workerOpts,
			sync
		});
		stream.on("ready", onReady);
		stream.on("close", function() {
			process.removeListener("exit", onExit);
		});
		process.on("exit", onExit);
		function onReady() {
			process.removeListener("exit", onExit);
			stream.unref();
			if (workerOpts.autoEnd !== false) setupOnExit(stream);
		}
		function onExit() {
			/* istanbul ignore next */
			if (stream.closed) return;
			stream.flushSync();
			sleep(100);
			stream.end();
		}
		return stream;
	}
	function autoEnd(stream) {
		stream.ref();
		stream.flushSync();
		stream.end();
		stream.once("close", function() {
			stream.unref();
		});
	}
	function flush(stream) {
		stream.flushSync();
	}
	function transport(fullOptions) {
		const { pipeline, targets, levels, dedupe, worker = {}, caller = getCallers(), sync = false } = fullOptions;
		const options = { ...fullOptions.options };
		const callers = typeof caller === "string" ? [caller] : caller;
		const bundlerOverrides = typeof globalThis === "object" && Object.prototype.hasOwnProperty.call(globalThis, "__bundlerPathsOverrides") && globalThis.__bundlerPathsOverrides && typeof globalThis.__bundlerPathsOverrides === "object" ? globalThis.__bundlerPathsOverrides : Object.create(null);
		let target = fullOptions.target;
		if (target && targets) throw new Error("only one of target or targets can be specified");
		if (targets) {
			target = bundlerOverrides["pino-worker"] || join(__dirname, "worker.js");
			options.targets = targets.filter((dest) => dest.target).map((dest) => {
				return {
					...dest,
					target: fixTarget(dest.target)
				};
			});
			options.pipelines = targets.filter((dest) => dest.pipeline).map((dest) => {
				return dest.pipeline.map((t) => {
					return {
						...t,
						level: dest.level,
						target: fixTarget(t.target)
					};
				});
			});
		} else if (pipeline) {
			target = bundlerOverrides["pino-worker"] || join(__dirname, "worker.js");
			options.pipelines = [pipeline.map((dest) => {
				return {
					...dest,
					target: fixTarget(dest.target)
				};
			})];
		}
		if (levels) options.levels = levels;
		if (dedupe) options.dedupe = dedupe;
		options.pinoWillSendConfig = true;
		const name = targets || pipeline ? "pino.transport" : target;
		return buildStream(fixTarget(target), options, worker, sync, name);
		function fixTarget(origin) {
			origin = bundlerOverrides[origin] || origin;
			if (isAbsolute(origin) || origin.indexOf("file://") === 0) return origin;
			if (origin === "pino/file") return join(__dirname, "..", "file.js");
			let fixTarget;
			for (const filePath of callers) try {
				fixTarget = createRequire(filePath === "node:repl" ? process.cwd() + sep : filePath).resolve(origin);
				break;
			} catch (err) {
				continue;
			}
			if (!fixTarget) throw new Error(`unable to determine transport target for "${origin}"`);
			return fixTarget;
		}
	}
	module.exports = transport;
}));
//#endregion
//#region ../../node_modules/.bun/pino@10.3.1/node_modules/pino/lib/tools.js
var require_tools = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const diagChan = __require("node:diagnostics_channel");
	const format = require_quick_format_unescaped();
	const { mapHttpRequest, mapHttpResponse } = require_pino_std_serializers();
	const SonicBoom = require_sonic_boom();
	const onExit = require_on_exit_leak_free();
	const { lsCacheSym, chindingsSym, writeSym, serializersSym, formatOptsSym, endSym, stringifiersSym, stringifySym, stringifySafeSym, wildcardFirstSym, nestedKeySym, formattersSym, messageKeySym, errorKeySym, nestedKeyStrSym, msgPrefixSym } = require_symbols();
	const { isMainThread } = __require("worker_threads");
	const transport = require_transport();
	const [nodeMajor] = process.versions.node.split(".").map((v) => Number(v));
	const asJsonChan = diagChan.tracingChannel("pino_asJson");
	const asString = nodeMajor >= 25 ? (str) => JSON.stringify(str) : _asString;
	function noop() {}
	function genLog(level, hook) {
		if (!hook) return LOG;
		return function hookWrappedLog(...args) {
			hook.call(this, args, LOG, level);
		};
		function LOG(o, ...n) {
			if (typeof o === "object") {
				let msg = o;
				if (o !== null) {
					if (o.method && o.headers && o.socket) o = mapHttpRequest(o);
					else if (typeof o.setHeader === "function") o = mapHttpResponse(o);
				}
				let formatParams;
				if (msg === null && n.length === 0) formatParams = [null];
				else {
					msg = n.shift();
					formatParams = n;
				}
				if (typeof this[msgPrefixSym] === "string" && msg !== void 0 && msg !== null) msg = this[msgPrefixSym] + msg;
				this[writeSym](o, format(msg, formatParams, this[formatOptsSym]), level);
			} else {
				let msg = o === void 0 ? n.shift() : o;
				if (typeof this[msgPrefixSym] === "string" && msg !== void 0 && msg !== null) msg = this[msgPrefixSym] + msg;
				this[writeSym](null, format(msg, n, this[formatOptsSym]), level);
			}
		}
	}
	function _asString(str) {
		let result = "";
		let last = 0;
		let found = false;
		let point = 255;
		const l = str.length;
		if (l > 100) return JSON.stringify(str);
		for (var i = 0; i < l && point >= 32; i++) {
			point = str.charCodeAt(i);
			if (point === 34 || point === 92) {
				result += str.slice(last, i) + "\\";
				last = i;
				found = true;
			}
		}
		if (!found) result = str;
		else result += str.slice(last);
		return point < 32 ? JSON.stringify(str) : "\"" + result + "\"";
	}
	/**
	* `asJson` wraps `_asJson` in order to facilitate generating diagnostics.
	*
	* @param {object} obj The merging object passed to the log method.
	* @param {string} msg The log message passed to the log method.
	* @param {number} num The log level number.
	* @param {number} time The log time in milliseconds.
	*
	* @returns {string}
	*/
	function asJson(obj, msg, num, time) {
		if (asJsonChan.hasSubscribers === false) return _asJson.call(this, obj, msg, num, time);
		const store = {
			instance: this,
			arguments
		};
		return asJsonChan.traceSync(_asJson, store, this, obj, msg, num, time);
	}
	/**
	* `_asJson` parses all collected data and generates the finalized newline
	* delimited JSON string.
	*
	* @param {object} obj The merging object passed to the log method.
	* @param {string} msg The log message passed to the log method.
	* @param {number} num The log level number.
	* @param {number} time The log time in milliseconds.
	*
	* @returns {string} The finalized log string terminated with a newline.
	* @private
	*/
	function _asJson(obj, msg, num, time) {
		const stringify = this[stringifySym];
		const stringifySafe = this[stringifySafeSym];
		const stringifiers = this[stringifiersSym];
		const end = this[endSym];
		const chindings = this[chindingsSym];
		const serializers = this[serializersSym];
		const formatters = this[formattersSym];
		const messageKey = this[messageKeySym];
		const errorKey = this[errorKeySym];
		let data = this[lsCacheSym][num] + time;
		data = data + chindings;
		let value;
		if (formatters.log) obj = formatters.log(obj);
		const wildcardStringifier = stringifiers[wildcardFirstSym];
		let propStr = "";
		for (const key in obj) {
			value = obj[key];
			if (Object.prototype.hasOwnProperty.call(obj, key) && value !== void 0) {
				if (serializers[key]) value = serializers[key](value);
				else if (key === errorKey && serializers.err) value = serializers.err(value);
				const stringifier = stringifiers[key] || wildcardStringifier;
				switch (typeof value) {
					case "undefined":
					case "function": continue;
					case "number": if (Number.isFinite(value) === false) value = null;
					case "boolean":
						if (stringifier) value = stringifier(value);
						break;
					case "string":
						value = (stringifier || asString)(value);
						break;
					default: value = (stringifier || stringify)(value, stringifySafe);
				}
				if (value === void 0) continue;
				const strKey = asString(key);
				propStr += "," + strKey + ":" + value;
			}
		}
		let msgStr = "";
		if (msg !== void 0) {
			value = serializers[messageKey] ? serializers[messageKey](msg) : msg;
			const stringifier = stringifiers[messageKey] || wildcardStringifier;
			switch (typeof value) {
				case "function": break;
				case "number": if (Number.isFinite(value) === false) value = null;
				case "boolean":
					if (stringifier) value = stringifier(value);
					msgStr = ",\"" + messageKey + "\":" + value;
					break;
				case "string":
					value = (stringifier || asString)(value);
					msgStr = ",\"" + messageKey + "\":" + value;
					break;
				default:
					value = (stringifier || stringify)(value, stringifySafe);
					msgStr = ",\"" + messageKey + "\":" + value;
			}
		}
		if (this[nestedKeySym] && propStr) return data + this[nestedKeyStrSym] + propStr.slice(1) + "}" + msgStr + end;
		else return data + propStr + msgStr + end;
	}
	function asChindings(instance, bindings) {
		let value;
		let data = instance[chindingsSym];
		const stringify = instance[stringifySym];
		const stringifySafe = instance[stringifySafeSym];
		const stringifiers = instance[stringifiersSym];
		const wildcardStringifier = stringifiers[wildcardFirstSym];
		const serializers = instance[serializersSym];
		const formatter = instance[formattersSym].bindings;
		bindings = formatter(bindings);
		for (const key in bindings) {
			value = bindings[key];
			if (((key.length < 5 || key !== "level" && key !== "serializers" && key !== "formatters" && key !== "customLevels") && bindings.hasOwnProperty(key) && value !== void 0) === true) {
				value = serializers[key] ? serializers[key](value) : value;
				value = (stringifiers[key] || wildcardStringifier || stringify)(value, stringifySafe);
				if (value === void 0) continue;
				data += ",\"" + key + "\":" + value;
			}
		}
		return data;
	}
	function hasBeenTampered(stream) {
		return stream.write !== stream.constructor.prototype.write;
	}
	function buildSafeSonicBoom(opts) {
		const stream = new SonicBoom(opts);
		stream.on("error", filterBrokenPipe);
		if (!opts.sync && isMainThread) {
			onExit.register(stream, autoEnd);
			stream.on("close", function() {
				onExit.unregister(stream);
			});
		}
		return stream;
		function filterBrokenPipe(err) {
			/* istanbul ignore next */
			if (err.code === "EPIPE") {
				stream.write = noop;
				stream.end = noop;
				stream.flushSync = noop;
				stream.destroy = noop;
				return;
			}
			stream.removeListener("error", filterBrokenPipe);
			stream.emit("error", err);
		}
	}
	function autoEnd(stream, eventName) {
		/* istanbul ignore next */
		if (stream.destroyed) return;
		if (eventName === "beforeExit") {
			stream.flush();
			stream.on("drain", function() {
				stream.end();
			});
		} else
 /* istanbul ignore next */
		stream.flushSync();
	}
	function createArgsNormalizer(defaultOptions) {
		return function normalizeArgs(instance, caller, opts = {}, stream) {
			if (typeof opts === "string") {
				stream = buildSafeSonicBoom({ dest: opts });
				opts = {};
			} else if (typeof stream === "string") {
				if (opts && opts.transport) throw Error("only one of option.transport or stream can be specified");
				stream = buildSafeSonicBoom({ dest: stream });
			} else if (opts instanceof SonicBoom || opts.writable || opts._writableState) {
				stream = opts;
				opts = {};
			} else if (opts.transport) {
				if (opts.transport instanceof SonicBoom || opts.transport.writable || opts.transport._writableState) throw Error("option.transport do not allow stream, please pass to option directly. e.g. pino(transport)");
				if (opts.transport.targets && opts.transport.targets.length && opts.formatters && typeof opts.formatters.level === "function") throw Error("option.transport.targets do not allow custom level formatters");
				let customLevels;
				if (opts.customLevels) customLevels = opts.useOnlyCustomLevels ? opts.customLevels : Object.assign({}, opts.levels, opts.customLevels);
				stream = transport({
					caller,
					...opts.transport,
					levels: customLevels
				});
			}
			opts = Object.assign({}, defaultOptions, opts);
			opts.serializers = Object.assign({}, defaultOptions.serializers, opts.serializers);
			opts.formatters = Object.assign({}, defaultOptions.formatters, opts.formatters);
			if (opts.prettyPrint) throw new Error("prettyPrint option is no longer supported, see the pino-pretty package (https://github.com/pinojs/pino-pretty)");
			const { enabled, onChild } = opts;
			if (enabled === false) opts.level = "silent";
			if (!onChild) opts.onChild = noop;
			if (!stream) if (!hasBeenTampered(process.stdout)) stream = buildSafeSonicBoom({ fd: process.stdout.fd || 1 });
			else stream = process.stdout;
			return {
				opts,
				stream
			};
		};
	}
	function stringify(obj, stringifySafeFn) {
		try {
			return JSON.stringify(obj);
		} catch (_) {
			try {
				return (stringifySafeFn || this[stringifySafeSym])(obj);
			} catch (_) {
				return "\"[unable to serialize, circular reference is too complex to analyze]\"";
			}
		}
	}
	function buildFormatters(level, bindings, log) {
		return {
			level,
			bindings,
			log
		};
	}
	/**
	* Convert a string integer file descriptor to a proper native integer
	* file descriptor.
	*
	* @param {string} destination The file descriptor string to attempt to convert.
	*
	* @returns {Number}
	*/
	function normalizeDestFileDescriptor(destination) {
		const fd = Number(destination);
		if (typeof destination === "string" && Number.isFinite(fd)) return fd;
		if (destination === void 0) return 1;
		return destination;
	}
	module.exports = {
		noop,
		buildSafeSonicBoom,
		asChindings,
		asJson,
		genLog,
		createArgsNormalizer,
		stringify,
		buildFormatters,
		normalizeDestFileDescriptor
	};
}));
//#endregion
//#region ../../node_modules/.bun/pino@10.3.1/node_modules/pino/lib/constants.js
var require_constants = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = {
		DEFAULT_LEVELS: {
			trace: 10,
			debug: 20,
			info: 30,
			warn: 40,
			error: 50,
			fatal: 60
		},
		SORTING_ORDER: {
			ASC: "ASC",
			DESC: "DESC"
		}
	};
}));
//#endregion
//#region ../../node_modules/.bun/pino@10.3.1/node_modules/pino/lib/levels.js
var require_levels = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { lsCacheSym, levelValSym, useOnlyCustomLevelsSym, streamSym, formattersSym, hooksSym, levelCompSym } = require_symbols();
	const { noop, genLog } = require_tools();
	const { DEFAULT_LEVELS, SORTING_ORDER } = require_constants();
	const levelMethods = {
		fatal: (hook) => {
			const logFatal = genLog(DEFAULT_LEVELS.fatal, hook);
			return function(...args) {
				const stream = this[streamSym];
				logFatal.call(this, ...args);
				if (typeof stream.flushSync === "function") try {
					stream.flushSync();
				} catch (e) {}
			};
		},
		error: (hook) => genLog(DEFAULT_LEVELS.error, hook),
		warn: (hook) => genLog(DEFAULT_LEVELS.warn, hook),
		info: (hook) => genLog(DEFAULT_LEVELS.info, hook),
		debug: (hook) => genLog(DEFAULT_LEVELS.debug, hook),
		trace: (hook) => genLog(DEFAULT_LEVELS.trace, hook)
	};
	const nums = Object.keys(DEFAULT_LEVELS).reduce((o, k) => {
		o[DEFAULT_LEVELS[k]] = k;
		return o;
	}, {});
	const initialLsCache = Object.keys(nums).reduce((o, k) => {
		o[k] = "{\"level\":" + Number(k);
		return o;
	}, {});
	function genLsCache(instance) {
		const formatter = instance[formattersSym].level;
		const { labels } = instance.levels;
		const cache = {};
		for (const label in labels) {
			const level = formatter(labels[label], Number(label));
			cache[label] = JSON.stringify(level).slice(0, -1);
		}
		instance[lsCacheSym] = cache;
		return instance;
	}
	function isStandardLevel(level, useOnlyCustomLevels) {
		if (useOnlyCustomLevels) return false;
		switch (level) {
			case "fatal":
			case "error":
			case "warn":
			case "info":
			case "debug":
			case "trace": return true;
			default: return false;
		}
	}
	function setLevel(level) {
		const { labels, values } = this.levels;
		if (typeof level === "number") {
			if (labels[level] === void 0) throw Error("unknown level value" + level);
			level = labels[level];
		}
		if (values[level] === void 0) throw Error("unknown level " + level);
		const preLevelVal = this[levelValSym];
		const levelVal = this[levelValSym] = values[level];
		const useOnlyCustomLevelsVal = this[useOnlyCustomLevelsSym];
		const levelComparison = this[levelCompSym];
		const hook = this[hooksSym].logMethod;
		for (const key in values) {
			if (levelComparison(values[key], levelVal) === false) {
				this[key] = noop;
				continue;
			}
			this[key] = isStandardLevel(key, useOnlyCustomLevelsVal) ? levelMethods[key](hook) : genLog(values[key], hook);
		}
		this.emit("level-change", level, levelVal, labels[preLevelVal], preLevelVal, this);
	}
	function getLevel(level) {
		const { levels, levelVal } = this;
		return levels && levels.labels ? levels.labels[levelVal] : "";
	}
	function isLevelEnabled(logLevel) {
		const { values } = this.levels;
		const logLevelVal = values[logLevel];
		return logLevelVal !== void 0 && this[levelCompSym](logLevelVal, this[levelValSym]);
	}
	/**
	* Determine if the given `current` level is enabled by comparing it
	* against the current threshold (`expected`).
	*
	* @param {SORTING_ORDER} direction comparison direction "ASC" or "DESC"
	* @param {number} current current log level number representation
	* @param {number} expected threshold value to compare with
	* @returns {boolean}
	*/
	function compareLevel(direction, current, expected) {
		if (direction === SORTING_ORDER.DESC) return current <= expected;
		return current >= expected;
	}
	/**
	* Create a level comparison function based on `levelComparison`
	* it could a default function which compares levels either in "ascending" or "descending" order or custom comparison function
	*
	* @param {SORTING_ORDER | Function} levelComparison sort levels order direction or custom comparison function
	* @returns Function
	*/
	function genLevelComparison(levelComparison) {
		if (typeof levelComparison === "string") return compareLevel.bind(null, levelComparison);
		return levelComparison;
	}
	function mappings(customLevels = null, useOnlyCustomLevels = false) {
		const customNums = customLevels ? Object.keys(customLevels).reduce((o, k) => {
			o[customLevels[k]] = k;
			return o;
		}, {}) : null;
		return {
			labels: Object.assign(Object.create(Object.prototype, { Infinity: { value: "silent" } }), useOnlyCustomLevels ? null : nums, customNums),
			values: Object.assign(Object.create(Object.prototype, { silent: { value: Infinity } }), useOnlyCustomLevels ? null : DEFAULT_LEVELS, customLevels)
		};
	}
	function assertDefaultLevelFound(defaultLevel, customLevels, useOnlyCustomLevels) {
		if (typeof defaultLevel === "number") {
			if (![].concat(Object.keys(customLevels || {}).map((key) => customLevels[key]), useOnlyCustomLevels ? [] : Object.keys(nums).map((level) => +level), Infinity).includes(defaultLevel)) throw Error(`default level:${defaultLevel} must be included in custom levels`);
			return;
		}
		if (!(defaultLevel in Object.assign(Object.create(Object.prototype, { silent: { value: Infinity } }), useOnlyCustomLevels ? null : DEFAULT_LEVELS, customLevels))) throw Error(`default level:${defaultLevel} must be included in custom levels`);
	}
	function assertNoLevelCollisions(levels, customLevels) {
		const { labels, values } = levels;
		for (const k in customLevels) {
			if (k in values) throw Error("levels cannot be overridden");
			if (customLevels[k] in labels) throw Error("pre-existing level values cannot be used for new levels");
		}
	}
	/**
	* Validates whether `levelComparison` is correct
	*
	* @throws Error
	* @param {SORTING_ORDER | Function} levelComparison - value to validate
	* @returns
	*/
	function assertLevelComparison(levelComparison) {
		if (typeof levelComparison === "function") return;
		if (typeof levelComparison === "string" && Object.values(SORTING_ORDER).includes(levelComparison)) return;
		throw new Error("Levels comparison should be one of \"ASC\", \"DESC\" or \"function\" type");
	}
	module.exports = {
		initialLsCache,
		genLsCache,
		levelMethods,
		getLevel,
		setLevel,
		isLevelEnabled,
		mappings,
		assertNoLevelCollisions,
		assertDefaultLevelFound,
		genLevelComparison,
		assertLevelComparison
	};
}));
//#endregion
//#region ../../node_modules/.bun/pino@10.3.1/node_modules/pino/lib/meta.js
var require_meta = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = { version: "10.3.1" };
}));
//#endregion
//#region ../../node_modules/.bun/pino@10.3.1/node_modules/pino/lib/proto.js
var require_proto = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { EventEmitter: EventEmitter$1 } = __require("node:events");
	const { lsCacheSym, levelValSym, setLevelSym, getLevelSym, chindingsSym, mixinSym, asJsonSym, writeSym, mixinMergeStrategySym, timeSym, timeSliceIndexSym, streamSym, serializersSym, formattersSym, errorKeySym, messageKeySym, useOnlyCustomLevelsSym, needsMetadataGsym, redactFmtSym, stringifySym, formatOptsSym, stringifiersSym, msgPrefixSym, hooksSym } = require_symbols();
	const { getLevel, setLevel, isLevelEnabled, mappings, initialLsCache, genLsCache, assertNoLevelCollisions } = require_levels();
	const { asChindings, asJson, buildFormatters, stringify, noop } = require_tools();
	const { version } = require_meta();
	const redaction = require_redaction();
	const prototype = {
		constructor: class Pino {},
		child,
		bindings,
		setBindings,
		flush,
		isLevelEnabled,
		version,
		get level() {
			return this[getLevelSym]();
		},
		set level(lvl) {
			this[setLevelSym](lvl);
		},
		get levelVal() {
			return this[levelValSym];
		},
		set levelVal(n) {
			throw Error("levelVal is read-only");
		},
		get msgPrefix() {
			return this[msgPrefixSym];
		},
		get [Symbol.toStringTag]() {
			return "Pino";
		},
		[lsCacheSym]: initialLsCache,
		[writeSym]: write,
		[asJsonSym]: asJson,
		[getLevelSym]: getLevel,
		[setLevelSym]: setLevel
	};
	Object.setPrototypeOf(prototype, EventEmitter$1.prototype);
	module.exports = function() {
		return Object.create(prototype);
	};
	const resetChildingsFormatter = (bindings) => bindings;
	function child(bindings, options) {
		if (!bindings) throw Error("missing bindings for child Pino");
		const serializers = this[serializersSym];
		const formatters = this[formattersSym];
		const instance = Object.create(this);
		if (options == null) {
			if (instance[formattersSym].bindings !== resetChildingsFormatter) instance[formattersSym] = buildFormatters(formatters.level, resetChildingsFormatter, formatters.log);
			instance[chindingsSym] = asChindings(instance, bindings);
			if (this.onChild !== noop) this.onChild(instance);
			return instance;
		}
		if (options.hasOwnProperty("serializers") === true) {
			instance[serializersSym] = Object.create(null);
			for (const k in serializers) instance[serializersSym][k] = serializers[k];
			const parentSymbols = Object.getOwnPropertySymbols(serializers);
			for (var i = 0; i < parentSymbols.length; i++) {
				const ks = parentSymbols[i];
				instance[serializersSym][ks] = serializers[ks];
			}
			for (const bk in options.serializers) instance[serializersSym][bk] = options.serializers[bk];
			const bindingsSymbols = Object.getOwnPropertySymbols(options.serializers);
			for (var bi = 0; bi < bindingsSymbols.length; bi++) {
				const bks = bindingsSymbols[bi];
				instance[serializersSym][bks] = options.serializers[bks];
			}
		} else instance[serializersSym] = serializers;
		if (options.hasOwnProperty("formatters")) {
			const { level, bindings: chindings, log } = options.formatters;
			instance[formattersSym] = buildFormatters(level || formatters.level, chindings || resetChildingsFormatter, log || formatters.log);
		} else instance[formattersSym] = buildFormatters(formatters.level, resetChildingsFormatter, formatters.log);
		if (options.hasOwnProperty("customLevels") === true) {
			assertNoLevelCollisions(this.levels, options.customLevels);
			instance.levels = mappings(options.customLevels, instance[useOnlyCustomLevelsSym]);
			genLsCache(instance);
		}
		if (typeof options.redact === "object" && options.redact !== null || Array.isArray(options.redact)) {
			instance.redact = options.redact;
			const stringifiers = redaction(instance.redact, stringify);
			const formatOpts = { stringify: stringifiers[redactFmtSym] };
			instance[stringifySym] = stringify;
			instance[stringifiersSym] = stringifiers;
			instance[formatOptsSym] = formatOpts;
		}
		if (typeof options.msgPrefix === "string") instance[msgPrefixSym] = (this[msgPrefixSym] || "") + options.msgPrefix;
		instance[chindingsSym] = asChindings(instance, bindings);
		if (options.level !== void 0 && options.level !== this.level || options.hasOwnProperty("customLevels")) {
			const childLevel = options.level || this.level;
			instance[setLevelSym](childLevel);
		}
		this.onChild(instance);
		return instance;
	}
	function bindings() {
		const chindingsJson = `{${this[chindingsSym].substr(1)}}`;
		const bindingsFromJson = JSON.parse(chindingsJson);
		delete bindingsFromJson.pid;
		delete bindingsFromJson.hostname;
		return bindingsFromJson;
	}
	function setBindings(newBindings) {
		this[chindingsSym] = asChindings(this, newBindings);
	}
	/**
	* Default strategy for creating `mergeObject` from arguments and the result from `mixin()`.
	* Fields from `mergeObject` have higher priority in this strategy.
	*
	* @param {Object} mergeObject The object a user has supplied to the logging function.
	* @param {Object} mixinObject The result of the `mixin` method.
	* @return {Object}
	*/
	function defaultMixinMergeStrategy(mergeObject, mixinObject) {
		return Object.assign(mixinObject, mergeObject);
	}
	function write(_obj, msg, num) {
		const t = this[timeSym]();
		const mixin = this[mixinSym];
		const errorKey = this[errorKeySym];
		const messageKey = this[messageKeySym];
		const mixinMergeStrategy = this[mixinMergeStrategySym] || defaultMixinMergeStrategy;
		let obj;
		const streamWriteHook = this[hooksSym].streamWrite;
		if (_obj === void 0 || _obj === null) obj = {};
		else if (_obj instanceof Error) {
			obj = { [errorKey]: _obj };
			if (msg === void 0) msg = _obj.message;
		} else {
			obj = _obj;
			if (msg === void 0 && _obj[messageKey] === void 0 && _obj[errorKey]) msg = _obj[errorKey].message;
		}
		if (mixin) obj = mixinMergeStrategy(obj, mixin(obj, num, this));
		const s = this[asJsonSym](obj, msg, num, t);
		const stream = this[streamSym];
		if (stream[needsMetadataGsym] === true) {
			stream.lastLevel = num;
			stream.lastObj = obj;
			stream.lastMsg = msg;
			stream.lastTime = t.slice(this[timeSliceIndexSym]);
			stream.lastLogger = this;
		}
		stream.write(streamWriteHook ? streamWriteHook(s) : s);
	}
	function flush(cb) {
		if (cb != null && typeof cb !== "function") throw Error("callback must be a function");
		const stream = this[streamSym];
		if (typeof stream.flush === "function") stream.flush(cb || noop);
		else if (cb) cb();
	}
}));
//#endregion
//#region ../../node_modules/.bun/safe-stable-stringify@2.5.0/node_modules/safe-stable-stringify/index.js
var require_safe_stable_stringify = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { hasOwnProperty } = Object.prototype;
	const stringify = configure();
	stringify.configure = configure;
	stringify.stringify = stringify;
	stringify.default = stringify;
	exports.stringify = stringify;
	exports.configure = configure;
	module.exports = stringify;
	const strEscapeSequencesRegExp = /[\u0000-\u001f\u0022\u005c\ud800-\udfff]/;
	function strEscape(str) {
		if (str.length < 5e3 && !strEscapeSequencesRegExp.test(str)) return `"${str}"`;
		return JSON.stringify(str);
	}
	function sort(array, comparator) {
		if (array.length > 200 || comparator) return array.sort(comparator);
		for (let i = 1; i < array.length; i++) {
			const currentValue = array[i];
			let position = i;
			while (position !== 0 && array[position - 1] > currentValue) {
				array[position] = array[position - 1];
				position--;
			}
			array[position] = currentValue;
		}
		return array;
	}
	const typedArrayPrototypeGetSymbolToStringTag = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(Object.getPrototypeOf(new Int8Array())), Symbol.toStringTag).get;
	function isTypedArrayWithEntries(value) {
		return typedArrayPrototypeGetSymbolToStringTag.call(value) !== void 0 && value.length !== 0;
	}
	function stringifyTypedArray(array, separator, maximumBreadth) {
		if (array.length < maximumBreadth) maximumBreadth = array.length;
		const whitespace = separator === "," ? "" : " ";
		let res = `"0":${whitespace}${array[0]}`;
		for (let i = 1; i < maximumBreadth; i++) res += `${separator}"${i}":${whitespace}${array[i]}`;
		return res;
	}
	function getCircularValueOption(options) {
		if (hasOwnProperty.call(options, "circularValue")) {
			const circularValue = options.circularValue;
			if (typeof circularValue === "string") return `"${circularValue}"`;
			if (circularValue == null) return circularValue;
			if (circularValue === Error || circularValue === TypeError) return { toString() {
				throw new TypeError("Converting circular structure to JSON");
			} };
			throw new TypeError("The \"circularValue\" argument must be of type string or the value null or undefined");
		}
		return "\"[Circular]\"";
	}
	function getDeterministicOption(options) {
		let value;
		if (hasOwnProperty.call(options, "deterministic")) {
			value = options.deterministic;
			if (typeof value !== "boolean" && typeof value !== "function") throw new TypeError("The \"deterministic\" argument must be of type boolean or comparator function");
		}
		return value === void 0 ? true : value;
	}
	function getBooleanOption(options, key) {
		let value;
		if (hasOwnProperty.call(options, key)) {
			value = options[key];
			if (typeof value !== "boolean") throw new TypeError(`The "${key}" argument must be of type boolean`);
		}
		return value === void 0 ? true : value;
	}
	function getPositiveIntegerOption(options, key) {
		let value;
		if (hasOwnProperty.call(options, key)) {
			value = options[key];
			if (typeof value !== "number") throw new TypeError(`The "${key}" argument must be of type number`);
			if (!Number.isInteger(value)) throw new TypeError(`The "${key}" argument must be an integer`);
			if (value < 1) throw new RangeError(`The "${key}" argument must be >= 1`);
		}
		return value === void 0 ? Infinity : value;
	}
	function getItemCount(number) {
		if (number === 1) return "1 item";
		return `${number} items`;
	}
	function getUniqueReplacerSet(replacerArray) {
		const replacerSet = /* @__PURE__ */ new Set();
		for (const value of replacerArray) if (typeof value === "string" || typeof value === "number") replacerSet.add(String(value));
		return replacerSet;
	}
	function getStrictOption(options) {
		if (hasOwnProperty.call(options, "strict")) {
			const value = options.strict;
			if (typeof value !== "boolean") throw new TypeError("The \"strict\" argument must be of type boolean");
			if (value) return (value) => {
				let message = `Object can not safely be stringified. Received type ${typeof value}`;
				if (typeof value !== "function") message += ` (${value.toString()})`;
				throw new Error(message);
			};
		}
	}
	function configure(options) {
		options = { ...options };
		const fail = getStrictOption(options);
		if (fail) {
			if (options.bigint === void 0) options.bigint = false;
			if (!("circularValue" in options)) options.circularValue = Error;
		}
		const circularValue = getCircularValueOption(options);
		const bigint = getBooleanOption(options, "bigint");
		const deterministic = getDeterministicOption(options);
		const comparator = typeof deterministic === "function" ? deterministic : void 0;
		const maximumDepth = getPositiveIntegerOption(options, "maximumDepth");
		const maximumBreadth = getPositiveIntegerOption(options, "maximumBreadth");
		function stringifyFnReplacer(key, parent, stack, replacer, spacer, indentation) {
			let value = parent[key];
			if (typeof value === "object" && value !== null && typeof value.toJSON === "function") value = value.toJSON(key);
			value = replacer.call(parent, key, value);
			switch (typeof value) {
				case "string": return strEscape(value);
				case "object": {
					if (value === null) return "null";
					if (stack.indexOf(value) !== -1) return circularValue;
					let res = "";
					let join = ",";
					const originalIndentation = indentation;
					if (Array.isArray(value)) {
						if (value.length === 0) return "[]";
						if (maximumDepth < stack.length + 1) return "\"[Array]\"";
						stack.push(value);
						if (spacer !== "") {
							indentation += spacer;
							res += `\n${indentation}`;
							join = `,\n${indentation}`;
						}
						const maximumValuesToStringify = Math.min(value.length, maximumBreadth);
						let i = 0;
						for (; i < maximumValuesToStringify - 1; i++) {
							const tmp = stringifyFnReplacer(String(i), value, stack, replacer, spacer, indentation);
							res += tmp !== void 0 ? tmp : "null";
							res += join;
						}
						const tmp = stringifyFnReplacer(String(i), value, stack, replacer, spacer, indentation);
						res += tmp !== void 0 ? tmp : "null";
						if (value.length - 1 > maximumBreadth) {
							const removedKeys = value.length - maximumBreadth - 1;
							res += `${join}"... ${getItemCount(removedKeys)} not stringified"`;
						}
						if (spacer !== "") res += `\n${originalIndentation}`;
						stack.pop();
						return `[${res}]`;
					}
					let keys = Object.keys(value);
					const keyLength = keys.length;
					if (keyLength === 0) return "{}";
					if (maximumDepth < stack.length + 1) return "\"[Object]\"";
					let whitespace = "";
					let separator = "";
					if (spacer !== "") {
						indentation += spacer;
						join = `,\n${indentation}`;
						whitespace = " ";
					}
					const maximumPropertiesToStringify = Math.min(keyLength, maximumBreadth);
					if (deterministic && !isTypedArrayWithEntries(value)) keys = sort(keys, comparator);
					stack.push(value);
					for (let i = 0; i < maximumPropertiesToStringify; i++) {
						const key = keys[i];
						const tmp = stringifyFnReplacer(key, value, stack, replacer, spacer, indentation);
						if (tmp !== void 0) {
							res += `${separator}${strEscape(key)}:${whitespace}${tmp}`;
							separator = join;
						}
					}
					if (keyLength > maximumBreadth) {
						const removedKeys = keyLength - maximumBreadth;
						res += `${separator}"...":${whitespace}"${getItemCount(removedKeys)} not stringified"`;
						separator = join;
					}
					if (spacer !== "" && separator.length > 1) res = `\n${indentation}${res}\n${originalIndentation}`;
					stack.pop();
					return `{${res}}`;
				}
				case "number": return isFinite(value) ? String(value) : fail ? fail(value) : "null";
				case "boolean": return value === true ? "true" : "false";
				case "undefined": return;
				case "bigint": if (bigint) return String(value);
				default: return fail ? fail(value) : void 0;
			}
		}
		function stringifyArrayReplacer(key, value, stack, replacer, spacer, indentation) {
			if (typeof value === "object" && value !== null && typeof value.toJSON === "function") value = value.toJSON(key);
			switch (typeof value) {
				case "string": return strEscape(value);
				case "object": {
					if (value === null) return "null";
					if (stack.indexOf(value) !== -1) return circularValue;
					const originalIndentation = indentation;
					let res = "";
					let join = ",";
					if (Array.isArray(value)) {
						if (value.length === 0) return "[]";
						if (maximumDepth < stack.length + 1) return "\"[Array]\"";
						stack.push(value);
						if (spacer !== "") {
							indentation += spacer;
							res += `\n${indentation}`;
							join = `,\n${indentation}`;
						}
						const maximumValuesToStringify = Math.min(value.length, maximumBreadth);
						let i = 0;
						for (; i < maximumValuesToStringify - 1; i++) {
							const tmp = stringifyArrayReplacer(String(i), value[i], stack, replacer, spacer, indentation);
							res += tmp !== void 0 ? tmp : "null";
							res += join;
						}
						const tmp = stringifyArrayReplacer(String(i), value[i], stack, replacer, spacer, indentation);
						res += tmp !== void 0 ? tmp : "null";
						if (value.length - 1 > maximumBreadth) {
							const removedKeys = value.length - maximumBreadth - 1;
							res += `${join}"... ${getItemCount(removedKeys)} not stringified"`;
						}
						if (spacer !== "") res += `\n${originalIndentation}`;
						stack.pop();
						return `[${res}]`;
					}
					stack.push(value);
					let whitespace = "";
					if (spacer !== "") {
						indentation += spacer;
						join = `,\n${indentation}`;
						whitespace = " ";
					}
					let separator = "";
					for (const key of replacer) {
						const tmp = stringifyArrayReplacer(key, value[key], stack, replacer, spacer, indentation);
						if (tmp !== void 0) {
							res += `${separator}${strEscape(key)}:${whitespace}${tmp}`;
							separator = join;
						}
					}
					if (spacer !== "" && separator.length > 1) res = `\n${indentation}${res}\n${originalIndentation}`;
					stack.pop();
					return `{${res}}`;
				}
				case "number": return isFinite(value) ? String(value) : fail ? fail(value) : "null";
				case "boolean": return value === true ? "true" : "false";
				case "undefined": return;
				case "bigint": if (bigint) return String(value);
				default: return fail ? fail(value) : void 0;
			}
		}
		function stringifyIndent(key, value, stack, spacer, indentation) {
			switch (typeof value) {
				case "string": return strEscape(value);
				case "object": {
					if (value === null) return "null";
					if (typeof value.toJSON === "function") {
						value = value.toJSON(key);
						if (typeof value !== "object") return stringifyIndent(key, value, stack, spacer, indentation);
						if (value === null) return "null";
					}
					if (stack.indexOf(value) !== -1) return circularValue;
					const originalIndentation = indentation;
					if (Array.isArray(value)) {
						if (value.length === 0) return "[]";
						if (maximumDepth < stack.length + 1) return "\"[Array]\"";
						stack.push(value);
						indentation += spacer;
						let res = `\n${indentation}`;
						const join = `,\n${indentation}`;
						const maximumValuesToStringify = Math.min(value.length, maximumBreadth);
						let i = 0;
						for (; i < maximumValuesToStringify - 1; i++) {
							const tmp = stringifyIndent(String(i), value[i], stack, spacer, indentation);
							res += tmp !== void 0 ? tmp : "null";
							res += join;
						}
						const tmp = stringifyIndent(String(i), value[i], stack, spacer, indentation);
						res += tmp !== void 0 ? tmp : "null";
						if (value.length - 1 > maximumBreadth) {
							const removedKeys = value.length - maximumBreadth - 1;
							res += `${join}"... ${getItemCount(removedKeys)} not stringified"`;
						}
						res += `\n${originalIndentation}`;
						stack.pop();
						return `[${res}]`;
					}
					let keys = Object.keys(value);
					const keyLength = keys.length;
					if (keyLength === 0) return "{}";
					if (maximumDepth < stack.length + 1) return "\"[Object]\"";
					indentation += spacer;
					const join = `,\n${indentation}`;
					let res = "";
					let separator = "";
					let maximumPropertiesToStringify = Math.min(keyLength, maximumBreadth);
					if (isTypedArrayWithEntries(value)) {
						res += stringifyTypedArray(value, join, maximumBreadth);
						keys = keys.slice(value.length);
						maximumPropertiesToStringify -= value.length;
						separator = join;
					}
					if (deterministic) keys = sort(keys, comparator);
					stack.push(value);
					for (let i = 0; i < maximumPropertiesToStringify; i++) {
						const key = keys[i];
						const tmp = stringifyIndent(key, value[key], stack, spacer, indentation);
						if (tmp !== void 0) {
							res += `${separator}${strEscape(key)}: ${tmp}`;
							separator = join;
						}
					}
					if (keyLength > maximumBreadth) {
						const removedKeys = keyLength - maximumBreadth;
						res += `${separator}"...": "${getItemCount(removedKeys)} not stringified"`;
						separator = join;
					}
					if (separator !== "") res = `\n${indentation}${res}\n${originalIndentation}`;
					stack.pop();
					return `{${res}}`;
				}
				case "number": return isFinite(value) ? String(value) : fail ? fail(value) : "null";
				case "boolean": return value === true ? "true" : "false";
				case "undefined": return;
				case "bigint": if (bigint) return String(value);
				default: return fail ? fail(value) : void 0;
			}
		}
		function stringifySimple(key, value, stack) {
			switch (typeof value) {
				case "string": return strEscape(value);
				case "object": {
					if (value === null) return "null";
					if (typeof value.toJSON === "function") {
						value = value.toJSON(key);
						if (typeof value !== "object") return stringifySimple(key, value, stack);
						if (value === null) return "null";
					}
					if (stack.indexOf(value) !== -1) return circularValue;
					let res = "";
					const hasLength = value.length !== void 0;
					if (hasLength && Array.isArray(value)) {
						if (value.length === 0) return "[]";
						if (maximumDepth < stack.length + 1) return "\"[Array]\"";
						stack.push(value);
						const maximumValuesToStringify = Math.min(value.length, maximumBreadth);
						let i = 0;
						for (; i < maximumValuesToStringify - 1; i++) {
							const tmp = stringifySimple(String(i), value[i], stack);
							res += tmp !== void 0 ? tmp : "null";
							res += ",";
						}
						const tmp = stringifySimple(String(i), value[i], stack);
						res += tmp !== void 0 ? tmp : "null";
						if (value.length - 1 > maximumBreadth) {
							const removedKeys = value.length - maximumBreadth - 1;
							res += `,"... ${getItemCount(removedKeys)} not stringified"`;
						}
						stack.pop();
						return `[${res}]`;
					}
					let keys = Object.keys(value);
					const keyLength = keys.length;
					if (keyLength === 0) return "{}";
					if (maximumDepth < stack.length + 1) return "\"[Object]\"";
					let separator = "";
					let maximumPropertiesToStringify = Math.min(keyLength, maximumBreadth);
					if (hasLength && isTypedArrayWithEntries(value)) {
						res += stringifyTypedArray(value, ",", maximumBreadth);
						keys = keys.slice(value.length);
						maximumPropertiesToStringify -= value.length;
						separator = ",";
					}
					if (deterministic) keys = sort(keys, comparator);
					stack.push(value);
					for (let i = 0; i < maximumPropertiesToStringify; i++) {
						const key = keys[i];
						const tmp = stringifySimple(key, value[key], stack);
						if (tmp !== void 0) {
							res += `${separator}${strEscape(key)}:${tmp}`;
							separator = ",";
						}
					}
					if (keyLength > maximumBreadth) {
						const removedKeys = keyLength - maximumBreadth;
						res += `${separator}"...":"${getItemCount(removedKeys)} not stringified"`;
					}
					stack.pop();
					return `{${res}}`;
				}
				case "number": return isFinite(value) ? String(value) : fail ? fail(value) : "null";
				case "boolean": return value === true ? "true" : "false";
				case "undefined": return;
				case "bigint": if (bigint) return String(value);
				default: return fail ? fail(value) : void 0;
			}
		}
		function stringify(value, replacer, space) {
			if (arguments.length > 1) {
				let spacer = "";
				if (typeof space === "number") spacer = " ".repeat(Math.min(space, 10));
				else if (typeof space === "string") spacer = space.slice(0, 10);
				if (replacer != null) {
					if (typeof replacer === "function") return stringifyFnReplacer("", { "": value }, [], replacer, spacer, "");
					if (Array.isArray(replacer)) return stringifyArrayReplacer("", value, [], getUniqueReplacerSet(replacer), spacer, "");
				}
				if (spacer.length !== 0) return stringifyIndent("", value, [], spacer, "");
			}
			return stringifySimple("", value, []);
		}
		return stringify;
	}
}));
//#endregion
//#region ../../node_modules/.bun/pino@10.3.1/node_modules/pino/lib/multistream.js
var require_multistream = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const metadata = Symbol.for("pino.metadata");
	const { DEFAULT_LEVELS } = require_constants();
	const DEFAULT_INFO_LEVEL = DEFAULT_LEVELS.info;
	function multistream(streamsArray, opts) {
		streamsArray = streamsArray || [];
		opts = opts || { dedupe: false };
		const streamLevels = Object.create(DEFAULT_LEVELS);
		streamLevels.silent = Infinity;
		if (opts.levels && typeof opts.levels === "object") Object.keys(opts.levels).forEach((i) => {
			streamLevels[i] = opts.levels[i];
		});
		const res = {
			write,
			add,
			remove,
			emit,
			flushSync,
			end,
			minLevel: 0,
			lastId: 0,
			streams: [],
			clone,
			[metadata]: true,
			streamLevels
		};
		if (Array.isArray(streamsArray)) streamsArray.forEach(add, res);
		else add.call(res, streamsArray);
		streamsArray = null;
		return res;
		function write(data) {
			let dest;
			const level = this.lastLevel;
			const { streams } = this;
			let recordedLevel = 0;
			let stream;
			for (let i = initLoopVar(streams.length, opts.dedupe); checkLoopVar(i, streams.length, opts.dedupe); i = adjustLoopVar(i, opts.dedupe)) {
				dest = streams[i];
				if (dest.level <= level) {
					if (recordedLevel !== 0 && recordedLevel !== dest.level) break;
					stream = dest.stream;
					if (stream[metadata]) {
						const { lastTime, lastMsg, lastObj, lastLogger } = this;
						stream.lastLevel = level;
						stream.lastTime = lastTime;
						stream.lastMsg = lastMsg;
						stream.lastObj = lastObj;
						stream.lastLogger = lastLogger;
					}
					stream.write(data);
					if (opts.dedupe) recordedLevel = dest.level;
				} else if (!opts.dedupe) break;
			}
		}
		function emit(...args) {
			for (const { stream } of this.streams) if (typeof stream.emit === "function") stream.emit(...args);
		}
		function flushSync() {
			for (const { stream } of this.streams) if (typeof stream.flushSync === "function") stream.flushSync();
		}
		function add(dest) {
			if (!dest) return res;
			const isStream = typeof dest.write === "function" || dest.stream;
			const stream_ = dest.write ? dest : dest.stream;
			if (!isStream) throw Error("stream object needs to implement either StreamEntry or DestinationStream interface");
			const { streams, streamLevels } = this;
			let level;
			if (typeof dest.levelVal === "number") level = dest.levelVal;
			else if (typeof dest.level === "string") level = streamLevels[dest.level];
			else if (typeof dest.level === "number") level = dest.level;
			else level = DEFAULT_INFO_LEVEL;
			const dest_ = {
				stream: stream_,
				level,
				levelVal: void 0,
				id: ++res.lastId
			};
			streams.unshift(dest_);
			streams.sort(compareByLevel);
			this.minLevel = streams[0].level;
			return res;
		}
		function remove(id) {
			const { streams } = this;
			const index = streams.findIndex((s) => s.id === id);
			if (index >= 0) {
				streams.splice(index, 1);
				streams.sort(compareByLevel);
				this.minLevel = streams.length > 0 ? streams[0].level : -1;
			}
			return res;
		}
		function end() {
			for (const { stream } of this.streams) {
				if (typeof stream.flushSync === "function") stream.flushSync();
				stream.end();
			}
		}
		function clone(level) {
			const streams = new Array(this.streams.length);
			for (let i = 0; i < streams.length; i++) streams[i] = {
				level,
				stream: this.streams[i].stream
			};
			return {
				write,
				add,
				remove,
				minLevel: level,
				streams,
				clone,
				emit,
				flushSync,
				[metadata]: true
			};
		}
	}
	function compareByLevel(a, b) {
		return a.level - b.level;
	}
	function initLoopVar(length, dedupe) {
		return dedupe ? length - 1 : 0;
	}
	function adjustLoopVar(i, dedupe) {
		return dedupe ? i - 1 : i + 1;
	}
	function checkLoopVar(i, length, dedupe) {
		return dedupe ? i >= 0 : i < length;
	}
	module.exports = multistream;
}));
//#endregion
//#region ../../node_modules/.bun/pino@10.3.1/node_modules/pino/pino.js
var require_pino = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const os = __require("node:os");
	const stdSerializers = require_pino_std_serializers();
	const caller = require_caller();
	const redaction = require_redaction();
	const time = require_time();
	const proto = require_proto();
	const symbols = require_symbols();
	const { configure } = require_safe_stable_stringify();
	const { assertDefaultLevelFound, mappings, genLsCache, genLevelComparison, assertLevelComparison } = require_levels();
	const { DEFAULT_LEVELS, SORTING_ORDER } = require_constants();
	const { createArgsNormalizer, asChindings, buildSafeSonicBoom, buildFormatters, stringify, normalizeDestFileDescriptor, noop } = require_tools();
	const { version } = require_meta();
	const { chindingsSym, redactFmtSym, serializersSym, timeSym, timeSliceIndexSym, streamSym, stringifySym, stringifySafeSym, stringifiersSym, setLevelSym, endSym, formatOptsSym, messageKeySym, errorKeySym, nestedKeySym, mixinSym, levelCompSym, useOnlyCustomLevelsSym, formattersSym, hooksSym, nestedKeyStrSym, mixinMergeStrategySym, msgPrefixSym } = symbols;
	const { epochTime, nullTime } = time;
	const { pid } = process;
	const hostname = os.hostname();
	const defaultErrorSerializer = stdSerializers.err;
	const normalize = createArgsNormalizer({
		level: "info",
		levelComparison: SORTING_ORDER.ASC,
		levels: DEFAULT_LEVELS,
		messageKey: "msg",
		errorKey: "err",
		nestedKey: null,
		enabled: true,
		base: {
			pid,
			hostname
		},
		serializers: Object.assign(Object.create(null), { err: defaultErrorSerializer }),
		formatters: Object.assign(Object.create(null), {
			bindings(bindings) {
				return bindings;
			},
			level(label, number) {
				return { level: number };
			}
		}),
		hooks: {
			logMethod: void 0,
			streamWrite: void 0
		},
		timestamp: epochTime,
		name: void 0,
		redact: null,
		customLevels: null,
		useOnlyCustomLevels: false,
		depthLimit: 5,
		edgeLimit: 100
	});
	const serializers = Object.assign(Object.create(null), stdSerializers);
	function pino(...args) {
		const instance = {};
		const { opts, stream } = normalize(instance, caller(), ...args);
		if (opts.level && typeof opts.level === "string" && DEFAULT_LEVELS[opts.level.toLowerCase()] !== void 0) opts.level = opts.level.toLowerCase();
		const { redact, crlf, serializers, timestamp, messageKey, errorKey, nestedKey, base, name, level, customLevels, levelComparison, mixin, mixinMergeStrategy, useOnlyCustomLevels, formatters, hooks, depthLimit, edgeLimit, onChild, msgPrefix } = opts;
		const stringifySafe = configure({
			maximumDepth: depthLimit,
			maximumBreadth: edgeLimit
		});
		const allFormatters = buildFormatters(formatters.level, formatters.bindings, formatters.log);
		const stringifyFn = stringify.bind({ [stringifySafeSym]: stringifySafe });
		const stringifiers = redact ? redaction(redact, stringifyFn) : {};
		const formatOpts = redact ? { stringify: stringifiers[redactFmtSym] } : { stringify: stringifyFn };
		const end = "}" + (crlf ? "\r\n" : "\n");
		const coreChindings = asChindings.bind(null, {
			[chindingsSym]: "",
			[serializersSym]: serializers,
			[stringifiersSym]: stringifiers,
			[stringifySym]: stringify,
			[stringifySafeSym]: stringifySafe,
			[formattersSym]: allFormatters
		});
		let chindings = "";
		if (base !== null) if (name === void 0) chindings = coreChindings(base);
		else chindings = coreChindings(Object.assign({}, base, { name }));
		const time = timestamp instanceof Function ? timestamp : timestamp ? epochTime : nullTime;
		const timeSliceIndex = time().indexOf(":") + 1;
		if (useOnlyCustomLevels && !customLevels) throw Error("customLevels is required if useOnlyCustomLevels is set true");
		if (mixin && typeof mixin !== "function") throw Error(`Unknown mixin type "${typeof mixin}" - expected "function"`);
		if (msgPrefix && typeof msgPrefix !== "string") throw Error(`Unknown msgPrefix type "${typeof msgPrefix}" - expected "string"`);
		assertDefaultLevelFound(level, customLevels, useOnlyCustomLevels);
		const levels = mappings(customLevels, useOnlyCustomLevels);
		if (typeof stream.emit === "function") stream.emit("message", {
			code: "PINO_CONFIG",
			config: {
				levels,
				messageKey,
				errorKey
			}
		});
		assertLevelComparison(levelComparison);
		const levelCompFunc = genLevelComparison(levelComparison);
		Object.assign(instance, {
			levels,
			[levelCompSym]: levelCompFunc,
			[useOnlyCustomLevelsSym]: useOnlyCustomLevels,
			[streamSym]: stream,
			[timeSym]: time,
			[timeSliceIndexSym]: timeSliceIndex,
			[stringifySym]: stringify,
			[stringifySafeSym]: stringifySafe,
			[stringifiersSym]: stringifiers,
			[endSym]: end,
			[formatOptsSym]: formatOpts,
			[messageKeySym]: messageKey,
			[errorKeySym]: errorKey,
			[nestedKeySym]: nestedKey,
			[nestedKeyStrSym]: nestedKey ? `,${JSON.stringify(nestedKey)}:{` : "",
			[serializersSym]: serializers,
			[mixinSym]: mixin,
			[mixinMergeStrategySym]: mixinMergeStrategy,
			[chindingsSym]: chindings,
			[formattersSym]: allFormatters,
			[hooksSym]: hooks,
			silent: noop,
			onChild,
			[msgPrefixSym]: msgPrefix
		});
		Object.setPrototypeOf(instance, proto());
		genLsCache(instance);
		instance[setLevelSym](level);
		return instance;
	}
	module.exports = pino;
	module.exports.destination = (dest = process.stdout.fd) => {
		if (typeof dest === "object") {
			dest.dest = normalizeDestFileDescriptor(dest.dest || process.stdout.fd);
			return buildSafeSonicBoom(dest);
		} else return buildSafeSonicBoom({
			dest: normalizeDestFileDescriptor(dest),
			minLength: 0
		});
	};
	module.exports.transport = require_transport();
	module.exports.multistream = require_multistream();
	module.exports.levels = mappings();
	module.exports.stdSerializers = serializers;
	module.exports.stdTimeFunctions = Object.assign({}, time);
	module.exports.symbols = symbols;
	module.exports.version = version;
	module.exports.default = pino;
	module.exports.pino = pino;
}));
//#endregion
//#region ../../node_modules/.bun/fastify@5.8.4/node_modules/fastify/lib/logger-pino.js
var require_logger_pino = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* Code imported from `pino-http`
	* Repo: https://github.com/pinojs/pino-http
	* License: MIT (https://raw.githubusercontent.com/pinojs/pino-http/master/LICENSE)
	*/
	const pino = require_pino();
	const { serializersSym } = pino.symbols;
	const { FST_ERR_LOG_INVALID_DESTINATION } = require_errors();
	function createPinoLogger(opts) {
		if (opts.stream && opts.file) throw new FST_ERR_LOG_INVALID_DESTINATION();
		else if (opts.file) {
			opts.stream = pino.destination(opts.file);
			delete opts.file;
		}
		const prevLogger = opts.logger;
		const prevGenReqId = opts.genReqId;
		let logger = null;
		if (prevLogger) {
			opts.logger = void 0;
			opts.genReqId = void 0;
			if (prevLogger[serializersSym]) opts.serializers = Object.assign({}, opts.serializers, prevLogger[serializersSym]);
			logger = prevLogger.child({}, opts);
			opts.logger = prevLogger;
			opts.genReqId = prevGenReqId;
		} else logger = pino(opts, opts.stream);
		return logger;
	}
	module.exports = {
		serializers: {
			req: function asReqValue(req) {
				return {
					method: req.method,
					url: req.url,
					version: req.headers && req.headers["accept-version"],
					host: req.host,
					remoteAddress: req.ip,
					remotePort: req.socket ? req.socket.remotePort : void 0
				};
			},
			err: pino.stdSerializers.err,
			res: function asResValue(reply) {
				return { statusCode: reply.statusCode };
			}
		},
		createPinoLogger
	};
}));
//#endregion
//#region ../../node_modules/.bun/fastify@5.8.4/node_modules/fastify/lib/logger-factory.js
var require_logger_factory = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { FST_ERR_LOG_LOGGER_AND_LOGGER_INSTANCE_PROVIDED, FST_ERR_LOG_INVALID_LOGGER_CONFIG, FST_ERR_LOG_INVALID_LOGGER_INSTANCE, FST_ERR_LOG_INVALID_LOGGER } = require_errors();
	/**
	* Utility for creating a child logger with the appropriate bindings, logger factory
	* and validation.
	* @param {object} context
	* @param {import('../fastify').FastifyBaseLogger} logger
	* @param {import('../fastify').RawRequestDefaultExpression<any>} req
	* @param {string} reqId
	* @param {import('../types/logger.js').ChildLoggerOptions?} loggerOpts
	*
	* @returns {object} New logger instance, inheriting all parent bindings,
	* with child bindings added.
	*/
	function createChildLogger(context, logger, req, reqId, loggerOpts) {
		const loggerBindings = { [context.requestIdLogLabel]: reqId };
		const child = context.childLoggerFactory.call(context.server, logger, loggerBindings, loggerOpts || {}, req);
		if (context.childLoggerFactory !== defaultChildLoggerFactory) validateLogger(child, true);
		return child;
	}
	/** Default factory to create child logger instance
	*
	* @param {import('../fastify.js').FastifyBaseLogger} logger
	* @param {import('../types/logger.js').Bindings} bindings
	* @param {import('../types/logger.js').ChildLoggerOptions} opts
	*
	* @returns {import('../types/logger.js').FastifyBaseLogger}
	*/
	function defaultChildLoggerFactory(logger, bindings, opts) {
		return logger.child(bindings, opts);
	}
	/**
	* Determines if a provided logger object meets the requirements
	* of a Fastify compatible logger.
	*
	* @param {object} logger Object to validate.
	* @param {boolean?} strict `true` if the object must be a logger (always throw if any methods missing)
	*
	* @returns {boolean} `true` when the logger meets the requirements.
	*
	* @throws {FST_ERR_LOG_INVALID_LOGGER} When the logger object is
	* missing required methods.
	*/
	function validateLogger(logger, strict) {
		const methods = [
			"info",
			"error",
			"debug",
			"fatal",
			"warn",
			"trace",
			"child"
		];
		const missingMethods = logger ? methods.filter((method) => !logger[method] || typeof logger[method] !== "function") : methods;
		if (!missingMethods.length) return true;
		else if (missingMethods.length === methods.length && !strict) return false;
		else throw FST_ERR_LOG_INVALID_LOGGER(missingMethods.join(","));
	}
	function createLogger(options) {
		if (options.logger && options.loggerInstance) throw new FST_ERR_LOG_LOGGER_AND_LOGGER_INSTANCE_PROVIDED();
		if (!options.loggerInstance && !options.logger) {
			const logger = require_abstract_logging();
			logger.child = () => logger;
			return {
				logger,
				hasLogger: false
			};
		}
		const { createPinoLogger, serializers } = require_logger_pino();
		if (validateLogger(options.loggerInstance)) return {
			logger: createPinoLogger({
				logger: options.loggerInstance,
				serializers: Object.assign({}, serializers, options.loggerInstance.serializers)
			}),
			hasLogger: true
		};
		if (validateLogger(options.logger)) throw FST_ERR_LOG_INVALID_LOGGER_CONFIG();
		if (options.loggerInstance) throw FST_ERR_LOG_INVALID_LOGGER_INSTANCE();
		const localLoggerOptions = {};
		if (Object.prototype.toString.call(options.logger) === "[object Object]") Reflect.ownKeys(options.logger).forEach((prop) => {
			Object.defineProperty(localLoggerOptions, prop, {
				value: options.logger[prop],
				writable: true,
				enumerable: true,
				configurable: true
			});
		});
		localLoggerOptions.level = localLoggerOptions.level || "info";
		localLoggerOptions.serializers = Object.assign({}, serializers, localLoggerOptions.serializers);
		options.logger = localLoggerOptions;
		return {
			logger: createPinoLogger(options.logger),
			hasLogger: true
		};
	}
	function now() {
		const ts = process.hrtime();
		return ts[0] * 1e3 + ts[1] / 1e6;
	}
	module.exports = {
		createChildLogger,
		defaultChildLoggerFactory,
		createLogger,
		validateLogger,
		now
	};
}));
//#endregion
//#region ../../node_modules/.bun/fastify@5.8.4/node_modules/fastify/lib/schemas.js
var require_schemas = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const fastClone = require_rfdc()({
		circles: false,
		proto: true
	});
	const { kSchemaVisited, kSchemaResponse } = require_symbols$1();
	const kFluentSchema = Symbol.for("fluent-schema-object");
	const { FST_ERR_SCH_MISSING_ID, FST_ERR_SCH_ALREADY_PRESENT, FST_ERR_SCH_DUPLICATE, FST_ERR_SCH_CONTENT_MISSING_SCHEMA } = require_errors();
	const SCHEMAS_SOURCE = [
		"params",
		"body",
		"querystring",
		"query",
		"headers"
	];
	function Schemas(initStore) {
		this.store = initStore || {};
	}
	Schemas.prototype.add = function(inputSchema) {
		const schema = fastClone(inputSchema.isFluentSchema || inputSchema.isFluentJSONSchema || inputSchema[kFluentSchema] ? inputSchema.valueOf() : inputSchema);
		const id = schema.$id;
		if (!id) throw new FST_ERR_SCH_MISSING_ID();
		if (this.store[id]) throw new FST_ERR_SCH_ALREADY_PRESENT(id);
		this.store[id] = schema;
	};
	Schemas.prototype.getSchemas = function() {
		return Object.assign({}, this.store);
	};
	Schemas.prototype.getSchema = function(schemaId) {
		return this.store[schemaId];
	};
	/**
	* Checks whether a schema is a non-plain object.
	*
	* @param {*} schema the schema to check
	* @returns {boolean} true if schema has a custom prototype
	*/
	function isCustomSchemaPrototype(schema) {
		return typeof schema === "object" && Object.getPrototypeOf(schema) !== Object.prototype;
	}
	function normalizeSchema(routeSchemas, serverOptions) {
		if (routeSchemas[kSchemaVisited]) return routeSchemas;
		if (routeSchemas.query) {
			if (routeSchemas.querystring) throw new FST_ERR_SCH_DUPLICATE("querystring");
			routeSchemas.querystring = routeSchemas.query;
		}
		generateFluentSchema(routeSchemas);
		for (const key of SCHEMAS_SOURCE) {
			const schema = routeSchemas[key];
			if (schema && !isCustomSchemaPrototype(schema)) {
				if (key === "body" && schema.content) {
					const contentProperty = schema.content;
					const keys = Object.keys(contentProperty);
					for (let i = 0; i < keys.length; i++) {
						const contentType = keys[i];
						if (!contentProperty[contentType].schema) throw new FST_ERR_SCH_CONTENT_MISSING_SCHEMA(contentType);
					}
					continue;
				}
			}
		}
		if (routeSchemas.response) {
			const httpCodes = Object.keys(routeSchemas.response);
			for (const code of httpCodes) {
				if (isCustomSchemaPrototype(routeSchemas.response[code])) continue;
				const contentProperty = routeSchemas.response[code].content;
				if (contentProperty) {
					const keys = Object.keys(contentProperty);
					for (let i = 0; i < keys.length; i++) {
						const mediaName = keys[i];
						if (!contentProperty[mediaName].schema) throw new FST_ERR_SCH_CONTENT_MISSING_SCHEMA(mediaName);
					}
				}
			}
		}
		routeSchemas[kSchemaVisited] = true;
		return routeSchemas;
	}
	function generateFluentSchema(schema) {
		for (const key of SCHEMAS_SOURCE) if (schema[key] && (schema[key].isFluentSchema || schema[key][kFluentSchema])) schema[key] = schema[key].valueOf();
		if (schema.response) {
			const httpCodes = Object.keys(schema.response);
			for (const code of httpCodes) if (schema.response[code].isFluentSchema || schema.response[code][kFluentSchema]) schema.response[code] = schema.response[code].valueOf();
		}
	}
	/**
	* Search for the right JSON schema compiled function in the request context
	* setup by the route configuration `schema.response`.
	* It will look for the exact match (eg 200) or generic (eg 2xx)
	*
	* @param {object} context the request context
	* @param {number} statusCode the http status code
	* @param {string} [contentType] the reply content type
	* @returns {function|false} the right JSON Schema function to serialize
	* the reply or false if it is not set
	*/
	function getSchemaSerializer(context, statusCode, contentType) {
		const responseSchemaDef = context[kSchemaResponse];
		if (!responseSchemaDef) return false;
		if (responseSchemaDef[statusCode]) {
			if (responseSchemaDef[statusCode].constructor === Object && contentType) {
				const mediaName = contentType.split(";", 1)[0];
				if (responseSchemaDef[statusCode][mediaName]) return responseSchemaDef[statusCode][mediaName];
				if (responseSchemaDef[statusCode]["*/*"]) return responseSchemaDef[statusCode]["*/*"];
				return false;
			}
			return responseSchemaDef[statusCode];
		}
		const fallbackStatusCode = (statusCode + "")[0] + "xx";
		if (responseSchemaDef[fallbackStatusCode]) {
			if (responseSchemaDef[fallbackStatusCode].constructor === Object && contentType) {
				const mediaName = contentType.split(";", 1)[0];
				if (responseSchemaDef[fallbackStatusCode][mediaName]) return responseSchemaDef[fallbackStatusCode][mediaName];
				if (responseSchemaDef[fallbackStatusCode]["*/*"]) return responseSchemaDef[fallbackStatusCode]["*/*"];
				return false;
			}
			return responseSchemaDef[fallbackStatusCode];
		}
		if (responseSchemaDef.default) {
			if (responseSchemaDef.default.constructor === Object && contentType) {
				const mediaName = contentType.split(";", 1)[0];
				if (responseSchemaDef.default[mediaName]) return responseSchemaDef.default[mediaName];
				if (responseSchemaDef.default["*/*"]) return responseSchemaDef.default["*/*"];
				return false;
			}
			return responseSchemaDef.default;
		}
		return false;
	}
	module.exports = {
		buildSchemas(initStore) {
			return new Schemas(initStore);
		},
		getSchemaSerializer,
		normalizeSchema
	};
}));
//#endregion
//#region ../../node_modules/.bun/fastify@5.8.4/node_modules/fastify/lib/error-serializer.js
/* c8 ignore start */
var require_error_serializer = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = function anonymous(validator, serializer) {
		const { asString, asNumber, asBoolean, asDateTime, asDate, asTime, asUnsafeString } = serializer;
		serializer.asInteger.bind(serializer);
		const JSON_STR_BEGIN_OBJECT = "{";
		const JSON_STR_END_OBJECT = "}";
		const JSON_STR_BEGIN_ARRAY = "[";
		const JSON_STR_END_ARRAY = "]";
		const JSON_STR_COMMA = ",";
		const JSON_STR_QUOTE = "\"";
		const JSON_STR_EMPTY_OBJECT = JSON_STR_BEGIN_OBJECT + JSON_STR_END_OBJECT;
		JSON_STR_BEGIN_ARRAY + JSON_STR_END_ARRAY;
		const JSON_STR_EMPTY_STRING = JSON_STR_QUOTE + JSON_STR_QUOTE;
		function anonymous0(input) {
			const obj = input && typeof input.toJSON === "function" ? input.toJSON() : input;
			if (obj === null) return JSON_STR_EMPTY_OBJECT;
			let value;
			let json = JSON_STR_BEGIN_OBJECT;
			let addComma = false;
			value = obj["statusCode"];
			if (value !== void 0) {
				!addComma && (addComma = true) || (json += JSON_STR_COMMA);
				json += "\"statusCode\":";
				json += asNumber(value);
			}
			value = obj["code"];
			if (value !== void 0) {
				!addComma && (addComma = true) || (json += JSON_STR_COMMA);
				json += "\"code\":";
				if (typeof value !== "string") if (value === null) json += JSON_STR_EMPTY_STRING;
				else if (value instanceof Date) json += JSON_STR_QUOTE + value.toISOString() + JSON_STR_QUOTE;
				else if (value instanceof RegExp) json += asString(value.source);
				else json += asString(value.toString());
				else json += asString(value);
			}
			value = obj["error"];
			if (value !== void 0) {
				!addComma && (addComma = true) || (json += JSON_STR_COMMA);
				json += "\"error\":";
				if (typeof value !== "string") if (value === null) json += JSON_STR_EMPTY_STRING;
				else if (value instanceof Date) json += JSON_STR_QUOTE + value.toISOString() + JSON_STR_QUOTE;
				else if (value instanceof RegExp) json += asString(value.source);
				else json += asString(value.toString());
				else json += asString(value);
			}
			value = obj["message"];
			if (value !== void 0) {
				!addComma && (addComma = true) || (json += JSON_STR_COMMA);
				json += "\"message\":";
				if (typeof value !== "string") if (value === null) json += JSON_STR_EMPTY_STRING;
				else if (value instanceof Date) json += JSON_STR_QUOTE + value.toISOString() + JSON_STR_QUOTE;
				else if (value instanceof RegExp) json += asString(value.source);
				else json += asString(value.toString());
				else json += asString(value);
			}
			return json + JSON_STR_END_OBJECT;
		}
		return anonymous0;
	}(null, require_serializer().restoreFromState({ "mode": "standalone" }));
}));
/* c8 ignore stop */
//#endregion
//#region ../../node_modules/.bun/fastify@5.8.4/node_modules/fastify/lib/error-handler.js
var require_error_handler = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const statusCodes = __require("node:http").STATUS_CODES;
	const wrapThenable = require_wrap_thenable();
	const { setErrorStatusCode } = require_error_status();
	const { kReplyHeaders, kReplyNextErrorHandler, kReplyIsRunningOnErrorHook, kRouteContext, kDisableRequestLogging } = require_symbols$1();
	const { FST_ERR_REP_INVALID_PAYLOAD_TYPE, FST_ERR_FAILED_ERROR_SERIALIZATION } = require_errors();
	const { getSchemaSerializer } = require_schemas();
	const serializeError = require_error_serializer();
	const rootErrorHandler = {
		func: defaultErrorHandler,
		toJSON() {
			return this.func.name.toString() + "()";
		}
	};
	function handleError(reply, error, cb) {
		reply[kReplyIsRunningOnErrorHook] = false;
		const context = reply[kRouteContext];
		if (reply[kReplyNextErrorHandler] === false) {
			fallbackErrorHandler(error, reply, function(reply, payload) {
				try {
					reply.raw.writeHead(reply.raw.statusCode, reply[kReplyHeaders]);
				} catch (error) {
					if (!reply.log[kDisableRequestLogging]) reply.log.warn({
						req: reply.request,
						res: reply,
						err: error
					}, error?.message);
					reply.raw.writeHead(reply.raw.statusCode);
				}
				reply.raw.end(payload);
			});
			return;
		}
		const errorHandler = reply[kReplyNextErrorHandler] || context.errorHandler;
		reply[kReplyNextErrorHandler] = Object.getPrototypeOf(errorHandler);
		delete reply[kReplyHeaders]["content-type"];
		delete reply[kReplyHeaders]["content-length"];
		const func = errorHandler.func;
		if (!func) {
			reply[kReplyNextErrorHandler] = false;
			fallbackErrorHandler(error, reply, cb);
			return;
		}
		try {
			const result = func(error, reply.request, reply);
			if (result !== void 0) if (result !== null && typeof result.then === "function") wrapThenable(result, reply);
			else reply.send(result);
		} catch (err) {
			reply.send(err);
		}
	}
	function defaultErrorHandler(error, request, reply) {
		setErrorHeaders(error, reply);
		setErrorStatusCode(reply, error);
		if (reply.statusCode < 500) {
			if (!reply.log[kDisableRequestLogging]) reply.log.info({
				res: reply,
				err: error
			}, error?.message);
		} else if (!reply.log[kDisableRequestLogging]) reply.log.error({
			req: request,
			res: reply,
			err: error
		}, error?.message);
		reply.send(error);
	}
	function fallbackErrorHandler(error, reply, cb) {
		const res = reply.raw;
		const statusCode = reply.statusCode;
		reply[kReplyHeaders]["content-type"] = reply[kReplyHeaders]["content-type"] ?? "application/json; charset=utf-8";
		let payload;
		try {
			const serializerFn = getSchemaSerializer(reply[kRouteContext], statusCode, reply[kReplyHeaders]["content-type"]);
			if (serializerFn === false) payload = serializeError({
				error: statusCodes[statusCode + ""],
				code: error.code,
				message: error.message,
				statusCode
			});
			else payload = serializerFn(Object.create(error, {
				error: { value: statusCodes[statusCode + ""] },
				message: { value: error.message },
				statusCode: { value: statusCode }
			}));
		} catch (err) {
			if (!reply.log[kDisableRequestLogging]) reply.log.error({
				err,
				statusCode: res.statusCode
			}, "The serializer for the given status code failed");
			reply.code(500);
			payload = serializeError(new FST_ERR_FAILED_ERROR_SERIALIZATION(err.message, error.message));
		}
		if (typeof payload !== "string" && !Buffer.isBuffer(payload)) payload = serializeError(new FST_ERR_REP_INVALID_PAYLOAD_TYPE(typeof payload));
		reply[kReplyHeaders]["content-length"] = "" + Buffer.byteLength(payload);
		cb(reply, payload);
	}
	function buildErrorHandler(parent = rootErrorHandler, func) {
		if (!func) return parent;
		const errorHandler = Object.create(parent);
		errorHandler.func = func;
		return errorHandler;
	}
	function setErrorHeaders(error, reply) {
		const res = reply.raw;
		let statusCode = res.statusCode;
		statusCode = statusCode >= 400 ? statusCode : 500;
		if (error != null) {
			if (error.headers !== void 0) reply.headers(error.headers);
			if (error.status >= 400) statusCode = error.status;
			else if (error.statusCode >= 400) statusCode = error.statusCode;
		}
		res.statusCode = statusCode;
	}
	module.exports = {
		buildErrorHandler,
		handleError
	};
}));
//#endregion
//#region ../../node_modules/.bun/fastify@5.8.4/node_modules/fastify/lib/decorate.js
var require_decorate = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { kReply, kRequest, kState, kHasBeenDecorated } = require_symbols$1();
	const { FST_ERR_DEC_ALREADY_PRESENT, FST_ERR_DEC_MISSING_DEPENDENCY, FST_ERR_DEC_AFTER_START, FST_ERR_DEC_REFERENCE_TYPE, FST_ERR_DEC_DEPENDENCY_INVALID_TYPE, FST_ERR_DEC_UNDECLARED } = require_errors();
	function decorate(instance, name, fn, dependencies) {
		if (Object.hasOwn(instance, name)) throw new FST_ERR_DEC_ALREADY_PRESENT(name);
		checkDependencies(instance, name, dependencies);
		if (fn && (typeof fn.getter === "function" || typeof fn.setter === "function")) Object.defineProperty(instance, name, {
			get: fn.getter,
			set: fn.setter
		});
		else instance[name] = fn;
	}
	function getInstanceDecorator(name) {
		if (!checkExistence(this, name)) throw new FST_ERR_DEC_UNDECLARED(name, "instance");
		if (typeof this[name] === "function") return this[name].bind(this);
		return this[name];
	}
	function decorateConstructor(konstructor, name, fn, dependencies) {
		const instance = konstructor.prototype;
		if (Object.hasOwn(instance, name) || hasKey(konstructor, name)) throw new FST_ERR_DEC_ALREADY_PRESENT(name);
		konstructor[kHasBeenDecorated] = true;
		checkDependencies(konstructor, name, dependencies);
		if (fn && (typeof fn.getter === "function" || typeof fn.setter === "function")) Object.defineProperty(instance, name, {
			get: fn.getter,
			set: fn.setter
		});
		else if (typeof fn === "function") instance[name] = fn;
		else konstructor.props.push({
			key: name,
			value: fn
		});
	}
	function checkReferenceType(name, fn) {
		if (typeof fn === "object" && fn && !(typeof fn.getter === "function" || typeof fn.setter === "function")) throw new FST_ERR_DEC_REFERENCE_TYPE(name, typeof fn);
	}
	function decorateFastify(name, fn, dependencies) {
		assertNotStarted(this, name);
		decorate(this, name, fn, dependencies);
		return this;
	}
	function checkExistence(instance, name) {
		if (name) return name in instance || instance.prototype && name in instance.prototype || hasKey(instance, name);
		return instance in this;
	}
	function hasKey(fn, name) {
		if (fn.props) return fn.props.find(({ key }) => key === name);
		return false;
	}
	function checkRequestExistence(name) {
		if (name && hasKey(this[kRequest], name)) return true;
		return checkExistence(this[kRequest].prototype, name);
	}
	function checkReplyExistence(name) {
		if (name && hasKey(this[kReply], name)) return true;
		return checkExistence(this[kReply].prototype, name);
	}
	function checkDependencies(instance, name, deps) {
		if (deps === void 0 || deps === null) return;
		if (!Array.isArray(deps)) throw new FST_ERR_DEC_DEPENDENCY_INVALID_TYPE(name);
		for (let i = 0; i !== deps.length; ++i) if (!checkExistence(instance, deps[i])) throw new FST_ERR_DEC_MISSING_DEPENDENCY(deps[i]);
	}
	function decorateReply(name, fn, dependencies) {
		assertNotStarted(this, name);
		checkReferenceType(name, fn);
		decorateConstructor(this[kReply], name, fn, dependencies);
		return this;
	}
	function decorateRequest(name, fn, dependencies) {
		assertNotStarted(this, name);
		checkReferenceType(name, fn);
		decorateConstructor(this[kRequest], name, fn, dependencies);
		return this;
	}
	function assertNotStarted(instance, name) {
		if (instance[kState].started) throw new FST_ERR_DEC_AFTER_START(name);
	}
	module.exports = {
		add: decorateFastify,
		exist: checkExistence,
		existRequest: checkRequestExistence,
		existReply: checkReplyExistence,
		dependencies: checkDependencies,
		decorateReply,
		decorateRequest,
		getInstanceDecorator,
		hasKey
	};
}));
//#endregion
//#region ../../node_modules/.bun/fastify@5.8.4/node_modules/fastify/lib/reply.js
var require_reply = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const eos = __require("node:stream").finished;
	const { kFourOhFourContext, kReplyErrorHandlerCalled, kReplyHijacked, kReplyStartTime, kReplyEndTime, kReplySerializer, kReplySerializerDefault, kReplyIsError, kReplyHeaders, kReplyTrailers, kReplyHasStatusCode, kReplyIsRunningOnErrorHook, kReplyNextErrorHandler, kDisableRequestLogging, kSchemaResponse, kReplyCacheSerializeFns, kSchemaController, kOptions, kRouteContext, kTimeoutTimer, kOnAbort, kRequestSignal } = require_symbols$1();
	const { onSendHookRunner, onResponseHookRunner, preHandlerHookRunner, preSerializationHookRunner } = require_hooks();
	const internals = require_handle_request()[Symbol.for("internals")];
	const now = require_logger_factory().now;
	const { handleError } = require_error_handler();
	const { getSchemaSerializer } = require_schemas();
	const CONTENT_TYPE = {
		JSON: "application/json; charset=utf-8",
		PLAIN: "text/plain; charset=utf-8",
		OCTET: "application/octet-stream"
	};
	const { FST_ERR_REP_INVALID_PAYLOAD_TYPE, FST_ERR_REP_RESPONSE_BODY_CONSUMED, FST_ERR_REP_READABLE_STREAM_LOCKED, FST_ERR_REP_ALREADY_SENT, FST_ERR_SEND_INSIDE_ONERR, FST_ERR_BAD_STATUS_CODE, FST_ERR_BAD_TRAILER_NAME, FST_ERR_BAD_TRAILER_VALUE, FST_ERR_MISSING_SERIALIZATION_FN, FST_ERR_MISSING_CONTENTTYPE_SERIALIZATION_FN, FST_ERR_DEC_UNDECLARED } = require_errors();
	const decorators = require_decorate();
	const toString = Object.prototype.toString;
	function Reply(res, request, log) {
		this.raw = res;
		this[kReplySerializer] = null;
		this[kReplyErrorHandlerCalled] = false;
		this[kReplyIsError] = false;
		this[kReplyIsRunningOnErrorHook] = false;
		this.request = request;
		this[kReplyHeaders] = {};
		this[kReplyTrailers] = null;
		this[kReplyHasStatusCode] = false;
		this[kReplyStartTime] = void 0;
		this.log = log;
	}
	Reply.props = [];
	Object.defineProperties(Reply.prototype, {
		[kRouteContext]: { get() {
			return this.request[kRouteContext];
		} },
		elapsedTime: { get() {
			if (this[kReplyStartTime] === void 0) return 0;
			return (this[kReplyEndTime] || now()) - this[kReplyStartTime];
		} },
		server: { get() {
			return this.request[kRouteContext].server;
		} },
		sent: {
			enumerable: true,
			get() {
				return (this[kReplyHijacked] || this.raw.writableEnded) === true;
			}
		},
		statusCode: {
			get() {
				return this.raw.statusCode;
			},
			set(value) {
				this.code(value);
			}
		},
		routeOptions: { get() {
			return this.request.routeOptions;
		} }
	});
	Reply.prototype.writeEarlyHints = function(hints, callback) {
		this.raw.writeEarlyHints(hints, callback);
		return this;
	};
	Reply.prototype.hijack = function() {
		this[kReplyHijacked] = true;
		if (this.request[kRequestSignal]) {
			clearTimeout(this.request[kTimeoutTimer]);
			this.request[kTimeoutTimer] = null;
			if (this.request[kOnAbort]) {
				this.request.raw.removeListener("close", this.request[kOnAbort]);
				this.request[kOnAbort] = null;
			}
		}
		return this;
	};
	Reply.prototype.send = function(payload) {
		if (this[kReplyIsRunningOnErrorHook]) throw new FST_ERR_SEND_INSIDE_ONERR();
		if (this.sent === true) {
			this.log.warn({ err: new FST_ERR_REP_ALREADY_SENT(this.request.url, this.request.method) });
			return this;
		}
		if (this[kReplyIsError] || payload instanceof Error) {
			this[kReplyIsError] = false;
			onErrorHook(this, payload, onSendHook);
			return this;
		}
		if (payload === void 0) {
			onSendHook(this, payload);
			return this;
		}
		const contentType = this.getHeader("content-type");
		const hasContentType = contentType !== void 0;
		if (payload !== null) {
			if (typeof payload.pipe === "function" || typeof payload.getReader === "function" || toString.call(payload) === "[object Response]") {
				onSendHook(this, payload);
				return this;
			}
			if (payload.buffer instanceof ArrayBuffer) {
				if (!hasContentType) this[kReplyHeaders]["content-type"] = CONTENT_TYPE.OCTET;
				const payloadToSend = Buffer.isBuffer(payload) ? payload : Buffer.from(payload.buffer, payload.byteOffset, payload.byteLength);
				onSendHook(this, payloadToSend);
				return this;
			}
			if (!hasContentType && typeof payload === "string") {
				this[kReplyHeaders]["content-type"] = CONTENT_TYPE.PLAIN;
				onSendHook(this, payload);
				return this;
			}
		}
		if (this[kReplySerializer] !== null) {
			if (typeof payload !== "string") {
				preSerializationHook(this, payload);
				return this;
			}
			payload = this[kReplySerializer](payload);
		} else if (!hasContentType || contentType.indexOf("json") !== -1) {
			if (!hasContentType) this[kReplyHeaders]["content-type"] = CONTENT_TYPE.JSON;
			else if (contentType.indexOf("charset") === -1) {
				const customContentType = contentType.trim();
				if (customContentType.endsWith(";")) this[kReplyHeaders]["content-type"] = `${customContentType} charset=utf-8`;
				else this[kReplyHeaders]["content-type"] = `${customContentType}; charset=utf-8`;
			}
			if (typeof payload !== "string") {
				preSerializationHook(this, payload);
				return this;
			}
		}
		onSendHook(this, payload);
		return this;
	};
	Reply.prototype.getHeader = function(key) {
		key = key.toLowerCase();
		const value = this[kReplyHeaders][key];
		return value !== void 0 ? value : this.raw.getHeader(key);
	};
	Reply.prototype.getHeaders = function() {
		return {
			...this.raw.getHeaders(),
			...this[kReplyHeaders]
		};
	};
	Reply.prototype.hasHeader = function(key) {
		key = key.toLowerCase();
		return this[kReplyHeaders][key] !== void 0 || this.raw.hasHeader(key);
	};
	Reply.prototype.removeHeader = function(key) {
		delete this[kReplyHeaders][key.toLowerCase()];
		return this;
	};
	Reply.prototype.header = function(key, value = "") {
		key = key.toLowerCase();
		if (this[kReplyHeaders][key] && key === "set-cookie") {
			if (typeof this[kReplyHeaders][key] === "string") this[kReplyHeaders][key] = [this[kReplyHeaders][key]];
			if (Array.isArray(value)) Array.prototype.push.apply(this[kReplyHeaders][key], value);
			else this[kReplyHeaders][key].push(value);
		} else this[kReplyHeaders][key] = value;
		return this;
	};
	Reply.prototype.headers = function(headers) {
		const keys = Object.keys(headers);
		for (let i = 0; i !== keys.length; ++i) {
			const key = keys[i];
			this.header(key, headers[key]);
		}
		return this;
	};
	const INVALID_TRAILERS = new Set([
		"transfer-encoding",
		"content-length",
		"host",
		"cache-control",
		"max-forwards",
		"te",
		"authorization",
		"set-cookie",
		"content-encoding",
		"content-type",
		"content-range",
		"trailer"
	]);
	Reply.prototype.trailer = function(key, fn) {
		key = key.toLowerCase();
		if (INVALID_TRAILERS.has(key)) throw new FST_ERR_BAD_TRAILER_NAME(key);
		if (typeof fn !== "function") throw new FST_ERR_BAD_TRAILER_VALUE(key, typeof fn);
		if (this[kReplyTrailers] === null) this[kReplyTrailers] = {};
		this[kReplyTrailers][key] = fn;
		return this;
	};
	Reply.prototype.hasTrailer = function(key) {
		return this[kReplyTrailers]?.[key.toLowerCase()] !== void 0;
	};
	Reply.prototype.removeTrailer = function(key) {
		if (this[kReplyTrailers] === null) return this;
		this[kReplyTrailers][key.toLowerCase()] = void 0;
		return this;
	};
	Reply.prototype.code = function(code) {
		const statusCode = +code;
		if (!(statusCode >= 100 && statusCode <= 599)) throw new FST_ERR_BAD_STATUS_CODE(code || String(code));
		this.raw.statusCode = statusCode;
		this[kReplyHasStatusCode] = true;
		return this;
	};
	Reply.prototype.status = Reply.prototype.code;
	Reply.prototype.getSerializationFunction = function(schemaOrStatus, contentType) {
		let serialize;
		if (typeof schemaOrStatus === "string" || typeof schemaOrStatus === "number") if (typeof contentType === "string") serialize = this[kRouteContext][kSchemaResponse]?.[schemaOrStatus]?.[contentType];
		else serialize = this[kRouteContext][kSchemaResponse]?.[schemaOrStatus];
		else if (typeof schemaOrStatus === "object") serialize = this[kRouteContext][kReplyCacheSerializeFns]?.get(schemaOrStatus);
		return serialize;
	};
	Reply.prototype.compileSerializationSchema = function(schema, httpStatus = null, contentType = null) {
		const { request } = this;
		const { method, url } = request;
		if (this[kRouteContext][kReplyCacheSerializeFns]?.has(schema)) return this[kRouteContext][kReplyCacheSerializeFns].get(schema);
		const serializeFn = (this[kRouteContext].serializerCompiler || this.server[kSchemaController].serializerCompiler || this.server[kSchemaController].setupSerializer(this.server[kOptions]) || this.server[kSchemaController].serializerCompiler)({
			schema,
			method,
			url,
			httpStatus,
			contentType
		});
		if (this[kRouteContext][kReplyCacheSerializeFns] == null) this[kRouteContext][kReplyCacheSerializeFns] = /* @__PURE__ */ new WeakMap();
		this[kRouteContext][kReplyCacheSerializeFns].set(schema, serializeFn);
		return serializeFn;
	};
	Reply.prototype.serializeInput = function(input, schema, httpStatus, contentType) {
		const possibleContentType = httpStatus;
		let serialize;
		httpStatus = typeof schema === "string" || typeof schema === "number" ? schema : httpStatus;
		contentType = httpStatus && possibleContentType !== httpStatus ? possibleContentType : contentType;
		if (httpStatus != null) {
			if (contentType != null) serialize = this[kRouteContext][kSchemaResponse]?.[httpStatus]?.[contentType];
			else serialize = this[kRouteContext][kSchemaResponse]?.[httpStatus];
			if (serialize == null) {
				if (contentType) throw new FST_ERR_MISSING_CONTENTTYPE_SERIALIZATION_FN(httpStatus, contentType);
				throw new FST_ERR_MISSING_SERIALIZATION_FN(httpStatus);
			}
		} else if (this[kRouteContext][kReplyCacheSerializeFns]?.has(schema)) serialize = this[kRouteContext][kReplyCacheSerializeFns].get(schema);
		else serialize = this.compileSerializationSchema(schema, httpStatus, contentType);
		return serialize(input);
	};
	Reply.prototype.serialize = function(payload) {
		if (this[kReplySerializer] !== null) return this[kReplySerializer](payload);
		else if (this[kRouteContext] && this[kRouteContext][kReplySerializerDefault]) return this[kRouteContext][kReplySerializerDefault](payload, this.raw.statusCode);
		else return serialize(this[kRouteContext], payload, this.raw.statusCode);
	};
	Reply.prototype.serializer = function(fn) {
		this[kReplySerializer] = fn;
		return this;
	};
	Reply.prototype.type = function(type) {
		this[kReplyHeaders]["content-type"] = type;
		return this;
	};
	Reply.prototype.redirect = function(url, code) {
		if (!code) code = this[kReplyHasStatusCode] ? this.raw.statusCode : 302;
		return this.header("location", url).code(code).send();
	};
	Reply.prototype.callNotFound = function() {
		notFound(this);
		return this;
	};
	Reply.prototype.then = function(fulfilled, rejected) {
		if (this.sent) {
			fulfilled();
			return;
		}
		eos(this.raw, (err) => {
			if (err && err.code !== "ERR_STREAM_PREMATURE_CLOSE") if (rejected) rejected(err);
			else this.log && this.log.warn("unhandled rejection on reply.then");
			else fulfilled();
		});
	};
	Reply.prototype.getDecorator = function(name) {
		if (!decorators.hasKey(this, name) && !decorators.exist(this, name)) throw new FST_ERR_DEC_UNDECLARED(name, "reply");
		const decorator = this[name];
		if (typeof decorator === "function") return decorator.bind(this);
		return decorator;
	};
	function preSerializationHook(reply, payload) {
		if (reply[kRouteContext].preSerialization !== null) preSerializationHookRunner(reply[kRouteContext].preSerialization, reply.request, reply, payload, preSerializationHookEnd);
		else preSerializationHookEnd(null, void 0, reply, payload);
	}
	function preSerializationHookEnd(err, _request, reply, payload) {
		if (err != null) {
			onErrorHook(reply, err);
			return;
		}
		try {
			if (reply[kReplySerializer] !== null) payload = reply[kReplySerializer](payload);
			else if (reply[kRouteContext] && reply[kRouteContext][kReplySerializerDefault]) payload = reply[kRouteContext][kReplySerializerDefault](payload, reply.raw.statusCode);
			else payload = serialize(reply[kRouteContext], payload, reply.raw.statusCode, reply[kReplyHeaders]["content-type"]);
		} catch (e) {
			wrapSerializationError(e, reply);
			onErrorHook(reply, e);
			return;
		}
		onSendHook(reply, payload);
	}
	function wrapSerializationError(error, reply) {
		error.serialization = reply[kRouteContext].config;
	}
	function onSendHook(reply, payload) {
		if (reply[kRouteContext].onSend !== null) onSendHookRunner(reply[kRouteContext].onSend, reply.request, reply, payload, wrapOnSendEnd);
		else onSendEnd(reply, payload);
	}
	function wrapOnSendEnd(err, request, reply, payload) {
		if (err != null) onErrorHook(reply, err);
		else onSendEnd(reply, payload);
	}
	function safeWriteHead(reply, statusCode) {
		const res = reply.raw;
		try {
			res.writeHead(statusCode, reply[kReplyHeaders]);
		} catch (err) {
			if (err.code === "ERR_HTTP_HEADERS_SENT") reply.log.warn(`Reply was already sent, did you forget to "return reply" in the "${reply.request.raw.url}" (${reply.request.raw.method}) route?`);
			throw err;
		}
	}
	function onSendEnd(reply, payload) {
		const res = reply.raw;
		const req = reply.request;
		if (reply[kReplyTrailers] !== null) {
			const trailerHeaders = Object.keys(reply[kReplyTrailers]);
			let header = "";
			for (const trailerName of trailerHeaders) {
				if (typeof reply[kReplyTrailers][trailerName] !== "function") continue;
				header += " ";
				header += trailerName;
			}
			reply.header("Transfer-Encoding", "chunked");
			reply.header("Trailer", header.trim());
		}
		if (toString.call(payload) === "[object Response]") {
			if (typeof payload.status === "number") reply.code(payload.status);
			if (typeof payload.headers === "object" && typeof payload.headers.forEach === "function") for (const [headerName, headerValue] of payload.headers) reply.header(headerName, headerValue);
			if (payload.body !== null) {
				if (payload.bodyUsed) throw new FST_ERR_REP_RESPONSE_BODY_CONSUMED();
			}
			payload = payload.body;
		}
		const statusCode = res.statusCode;
		if (payload === void 0 || payload === null) {
			if (statusCode >= 200 && statusCode !== 204 && statusCode !== 304 && req.method !== "HEAD" && reply[kReplyTrailers] === null) reply[kReplyHeaders]["content-length"] = "0";
			safeWriteHead(reply, statusCode);
			sendTrailer(payload, res, reply);
			return;
		}
		if (statusCode >= 100 && statusCode < 200 || statusCode === 204) {
			reply.removeHeader("content-type");
			reply.removeHeader("content-length");
			safeWriteHead(reply, statusCode);
			sendTrailer(void 0, res, reply);
			if (typeof payload.resume === "function") {
				payload.on("error", noop);
				payload.resume();
			}
			return;
		}
		if (typeof payload.pipe === "function") {
			sendStream(payload, res, reply);
			return;
		}
		if (typeof payload.getReader === "function") {
			sendWebStream(payload, res, reply);
			return;
		}
		if (typeof payload !== "string" && !Buffer.isBuffer(payload)) throw new FST_ERR_REP_INVALID_PAYLOAD_TYPE(typeof payload);
		if (reply[kReplyTrailers] === null) {
			const contentLength = reply[kReplyHeaders]["content-length"];
			if (!contentLength || req.raw.method !== "HEAD" && Number(contentLength) !== Buffer.byteLength(payload)) reply[kReplyHeaders]["content-length"] = "" + Buffer.byteLength(payload);
		}
		safeWriteHead(reply, statusCode);
		res.write(payload);
		sendTrailer(payload, res, reply);
	}
	function logStreamError(logger, err, res) {
		if (err.code === "ERR_STREAM_PREMATURE_CLOSE") {
			if (!logger[kDisableRequestLogging]) logger.info({ res }, "stream closed prematurely");
		} else logger.warn({ err }, "response terminated with an error with headers already sent");
	}
	function sendWebStream(payload, res, reply) {
		if (payload.locked) throw new FST_ERR_REP_READABLE_STREAM_LOCKED();
		let sourceOpen = true;
		let errorLogged = false;
		let waitingDrain = false;
		const reader = payload.getReader();
		eos(res, function(err) {
			if (sourceOpen) {
				if (err != null && res.headersSent && !errorLogged) {
					errorLogged = true;
					logStreamError(reply.log, err, res);
				}
				reader.cancel().catch(noop);
			}
		});
		if (!res.headersSent) for (const key in reply[kReplyHeaders]) res.setHeader(key, reply[kReplyHeaders][key]);
		else reply.log.warn("response will send, but you shouldn't use res.writeHead in stream mode");
		function onRead(result) {
			if (result.done) {
				sourceOpen = false;
				sendTrailer(null, res, reply);
				return;
			}
			/* c8 ignore next 5 - race condition: eos handler typically fires first */
			if (res.destroyed) {
				sourceOpen = false;
				reader.cancel().catch(noop);
				return;
			}
			if (res.write(result.value) === false) {
				waitingDrain = true;
				res.once("drain", onDrain);
				return;
			}
			reader.read().then(onRead, onReadError);
		}
		function onDrain() {
			if (!waitingDrain || !sourceOpen || res.destroyed) return;
			waitingDrain = false;
			reader.read().then(onRead, onReadError);
		}
		function onReadError(err) {
			sourceOpen = false;
			if (res.headersSent || reply.request.raw.aborted === true) {
				if (!errorLogged) {
					errorLogged = true;
					logStreamError(reply.log, err, reply);
				}
				res.destroy();
			} else onErrorHook(reply, err);
		}
		reader.read().then(onRead, onReadError);
	}
	function sendStream(payload, res, reply) {
		let sourceOpen = true;
		let errorLogged = false;
		sendStreamTrailer(payload, res, reply);
		eos(payload, {
			readable: true,
			writable: false
		}, function(err) {
			sourceOpen = false;
			if (err != null) if (res.headersSent || reply.request.raw.aborted === true) {
				if (!errorLogged) {
					errorLogged = true;
					logStreamError(reply.log, err, reply);
				}
				res.destroy();
			} else onErrorHook(reply, err);
		});
		eos(res, function(err) {
			if (sourceOpen) {
				if (err != null && res.headersSent && !errorLogged) {
					errorLogged = true;
					logStreamError(reply.log, err, res);
				}
				if (typeof payload.destroy === "function") payload.destroy();
				else if (typeof payload.close === "function") payload.close(noop);
				else if (typeof payload.abort === "function") payload.abort();
				else reply.log.warn("stream payload does not end properly");
			}
		});
		if (!res.headersSent) for (const key in reply[kReplyHeaders]) res.setHeader(key, reply[kReplyHeaders][key]);
		else reply.log.warn("response will send, but you shouldn't use res.writeHead in stream mode");
		payload.pipe(res);
	}
	function sendTrailer(payload, res, reply) {
		if (reply[kReplyTrailers] === null) {
			res.end(null, null, null);
			return;
		}
		const trailerHeaders = Object.keys(reply[kReplyTrailers]);
		const trailers = {};
		let handled = 0;
		let skipped = true;
		function send() {
			/* istanbul ignore else */
			if (handled === 0) {
				res.addTrailers(trailers);
				res.end(null, null, null);
			}
		}
		for (const trailerName of trailerHeaders) {
			if (typeof reply[kReplyTrailers][trailerName] !== "function") continue;
			skipped = false;
			handled--;
			function cb(err, value) {
				handled++;
				if (err) reply.log.debug(err);
				else trailers[trailerName] = value;
				process.nextTick(send);
			}
			const result = reply[kReplyTrailers][trailerName](reply, payload, cb);
			if (typeof result === "object" && typeof result.then === "function") result.then((v) => cb(null, v), cb);
		}
		if (skipped) res.end(null, null, null);
	}
	function sendStreamTrailer(payload, res, reply) {
		if (reply[kReplyTrailers] === null) return;
		payload.on("end", () => sendTrailer(null, res, reply));
	}
	function onErrorHook(reply, error, cb) {
		if (reply[kRouteContext].onError !== null && !reply[kReplyNextErrorHandler]) {
			reply[kReplyIsRunningOnErrorHook] = true;
			onSendHookRunner(reply[kRouteContext].onError, reply.request, reply, error, () => handleError(reply, error, cb));
		} else handleError(reply, error, cb);
	}
	function setupResponseListeners(reply) {
		reply[kReplyStartTime] = now();
		const onResFinished = (err) => {
			reply[kReplyEndTime] = now();
			reply.raw.removeListener("finish", onResFinished);
			reply.raw.removeListener("error", onResFinished);
			const ctx = reply[kRouteContext];
			if (reply.request[kRequestSignal]) {
				clearTimeout(reply.request[kTimeoutTimer]);
				reply.request[kTimeoutTimer] = null;
				if (reply.request[kOnAbort]) {
					reply.request.raw.removeListener("close", reply.request[kOnAbort]);
					reply.request[kOnAbort] = null;
				}
			}
			if (ctx && ctx.onResponse !== null) onResponseHookRunner(ctx.onResponse, reply.request, reply, onResponseCallback);
			else onResponseCallback(err, reply.request, reply);
		};
		reply.raw.on("finish", onResFinished);
		reply.raw.on("error", onResFinished);
	}
	function onResponseCallback(err, request, reply) {
		if (reply.log[kDisableRequestLogging]) return;
		const responseTime = reply.elapsedTime;
		if (err != null) {
			reply.log.error({
				res: reply,
				err,
				responseTime
			}, "request errored");
			return;
		}
		reply.log.info({
			res: reply,
			responseTime
		}, "request completed");
	}
	function buildReply(R) {
		const props = R.props.slice();
		function _Reply(res, request, log) {
			this.raw = res;
			this[kReplyIsError] = false;
			this[kReplyErrorHandlerCalled] = false;
			this[kReplyHijacked] = false;
			this[kReplySerializer] = null;
			this.request = request;
			this[kReplyHeaders] = {};
			this[kReplyTrailers] = null;
			this[kReplyStartTime] = void 0;
			this[kReplyEndTime] = void 0;
			this.log = log;
			let prop;
			for (let i = 0; i < props.length; i++) {
				prop = props[i];
				this[prop.key] = prop.value;
			}
		}
		Object.setPrototypeOf(_Reply.prototype, R.prototype);
		Object.setPrototypeOf(_Reply, R);
		_Reply.parent = R;
		_Reply.props = props;
		return _Reply;
	}
	function notFound(reply) {
		if (reply[kRouteContext][kFourOhFourContext] === null) {
			reply.log.warn("Trying to send a NotFound error inside a 404 handler. Sending basic 404 response.");
			reply.code(404).send("404 Not Found");
			return;
		}
		reply.request[kRouteContext] = reply[kRouteContext][kFourOhFourContext];
		if (reply[kRouteContext].preHandler !== null) preHandlerHookRunner(reply[kRouteContext].preHandler, reply.request, reply, internals.preHandlerCallback);
		else internals.preHandlerCallback(null, reply.request, reply);
	}
	/**
	* This function runs when a payload that is not a string|buffer|stream or null
	* should be serialized to be streamed to the response.
	* This is the default serializer that can be customized by the user using the replySerializer
	*
	* @param {object} context the request context
	* @param {object} data the JSON payload to serialize
	* @param {number} statusCode the http status code
	* @param {string} [contentType] the reply content type
	* @returns {string} the serialized payload
	*/
	function serialize(context, data, statusCode, contentType) {
		const fnSerialize = getSchemaSerializer(context, statusCode, contentType);
		if (fnSerialize) return fnSerialize(data);
		return JSON.stringify(data);
	}
	function noop() {}
	module.exports = Reply;
	module.exports.buildReply = buildReply;
	module.exports.setupResponseListeners = setupResponseListeners;
}));
//#endregion
//#region ../../node_modules/.bun/fastify@5.8.4/node_modules/fastify/lib/request.js
var require_request$1 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const proxyAddr = require_proxy_addr();
	const { kHasBeenDecorated, kSchemaBody, kSchemaHeaders, kSchemaParams, kSchemaQuerystring, kSchemaController, kOptions, kRequestCacheValidateFns, kRouteContext, kRequestOriginalUrl, kRequestSignal, kOnAbort } = require_symbols$1();
	const { FST_ERR_REQ_INVALID_VALIDATION_INVOCATION, FST_ERR_DEC_UNDECLARED } = require_errors();
	const decorators = require_decorate();
	const HTTP_PART_SYMBOL_MAP = {
		body: kSchemaBody,
		headers: kSchemaHeaders,
		params: kSchemaParams,
		querystring: kSchemaQuerystring,
		query: kSchemaQuerystring
	};
	function Request(id, params, req, query, log, context) {
		this.id = id;
		this[kRouteContext] = context;
		this.params = params;
		this.raw = req;
		this.query = query;
		this.log = log;
		this.body = void 0;
	}
	Request.props = [];
	function getTrustProxyFn(tp) {
		if (typeof tp === "function") return tp;
		if (tp === true) return function() {
			return true;
		};
		if (typeof tp === "number") return function(a, i) {
			return a != null && i < tp;
		};
		if (typeof tp === "string") {
			const values = tp.split(",").map((it) => it.trim());
			const trust = proxyAddr.compile(values);
			return function(a, i) {
				return a != null && trust(a, i);
			};
		}
		const trust = proxyAddr.compile(tp);
		return function(a, i) {
			return a != null && trust(a, i);
		};
	}
	function buildRequest(R, trustProxy) {
		if (trustProxy) return buildRequestWithTrustProxy(R, trustProxy);
		return buildRegularRequest(R);
	}
	function buildRegularRequest(R) {
		const props = R.props.slice();
		function _Request(id, params, req, query, log, context) {
			this.id = id;
			this[kRouteContext] = context;
			this.params = params;
			this.raw = req;
			this.query = query;
			this.log = log;
			this.body = void 0;
			let prop;
			for (let i = 0; i < props.length; i++) {
				prop = props[i];
				this[prop.key] = prop.value;
			}
		}
		Object.setPrototypeOf(_Request.prototype, R.prototype);
		Object.setPrototypeOf(_Request, R);
		_Request.props = props;
		_Request.parent = R;
		return _Request;
	}
	function getLastEntryInMultiHeaderValue(headerValue) {
		const lastIndex = headerValue.lastIndexOf(",");
		return lastIndex === -1 ? headerValue.trim() : headerValue.slice(lastIndex + 1).trim();
	}
	function buildRequestWithTrustProxy(R, trustProxy) {
		const _Request = buildRegularRequest(R);
		const proxyFn = getTrustProxyFn(trustProxy);
		_Request[kHasBeenDecorated] = true;
		Object.defineProperties(_Request.prototype, {
			ip: { get() {
				const addrs = proxyAddr.all(this.raw, proxyFn);
				return addrs[addrs.length - 1];
			} },
			ips: { get() {
				return proxyAddr.all(this.raw, proxyFn);
			} },
			host: { get() {
				if (this.headers["x-forwarded-host"] && proxyFn(this.raw.socket?.remoteAddress, 0)) return getLastEntryInMultiHeaderValue(this.headers["x-forwarded-host"]);
				/**
				* The last fallback supports the following cases:
				* 1. http.requireHostHeader === false
				* 2. HTTP/1.0 without a Host Header
				* 3. Headers schema that may remove the Host Header
				*/
				return this.headers.host ?? this.headers[":authority"] ?? "";
			} },
			protocol: { get() {
				if (this.headers["x-forwarded-proto"] && proxyFn(this.raw.socket?.remoteAddress, 0)) return getLastEntryInMultiHeaderValue(this.headers["x-forwarded-proto"]);
				if (this.socket) return this.socket.encrypted ? "https" : "http";
			} }
		});
		return _Request;
	}
	function assertsRequestDecoration(request, name) {
		if (!decorators.hasKey(request, name) && !decorators.exist(request, name)) throw new FST_ERR_DEC_UNDECLARED(name, "request");
	}
	Object.defineProperties(Request.prototype, {
		server: { get() {
			return this[kRouteContext].server;
		} },
		url: { get() {
			return this.raw.url;
		} },
		originalUrl: { get() {
			/* istanbul ignore else */
			if (!this[kRequestOriginalUrl]) this[kRequestOriginalUrl] = this.raw.originalUrl || this.raw.url;
			return this[kRequestOriginalUrl];
		} },
		method: { get() {
			return this.raw.method;
		} },
		routeOptions: { get() {
			const context = this[kRouteContext];
			const routeLimit = context._parserOptions.limit;
			const serverLimit = context.server.initialConfig.bodyLimit;
			const version = context.server.hasConstraintStrategy("version") ? this.raw.headers["accept-version"] : void 0;
			return {
				method: context.config?.method,
				url: context.config?.url,
				bodyLimit: routeLimit || serverLimit,
				handlerTimeout: context.handlerTimeout,
				attachValidation: context.attachValidation,
				logLevel: context.logLevel,
				exposeHeadRoute: context.exposeHeadRoute,
				prefixTrailingSlash: context.prefixTrailingSlash,
				handler: context.handler,
				config: context.config,
				schema: context.schema,
				version
			};
		} },
		is404: { get() {
			return this[kRouteContext].config?.url === void 0;
		} },
		socket: { get() {
			return this.raw.socket;
		} },
		signal: { get() {
			let ac = this[kRequestSignal];
			if (ac) return ac.signal;
			ac = new AbortController();
			this[kRequestSignal] = ac;
			const onAbort = () => {
				if (!ac.signal.aborted) ac.abort();
			};
			this.raw.on("close", onAbort);
			this[kOnAbort] = onAbort;
			return ac.signal;
		} },
		ip: { get() {
			if (this.socket) return this.socket.remoteAddress;
		} },
		host: { get() {
			/**
			* The last fallback supports the following cases:
			* 1. http.requireHostHeader === false
			* 2. HTTP/1.0 without a Host Header
			* 3. Headers schema that may remove the Host Header
			*/
			return this.raw.headers.host ?? this.raw.headers[":authority"] ?? "";
		} },
		hostname: { get() {
			if (this.host[0] === "[") return this.host.slice(0, this.host.indexOf("]") + 1);
			return this.host.split(":", 1)[0];
		} },
		port: { get() {
			const portFromHost = parseInt(this.host.split(":").slice(-1)[0]);
			if (!isNaN(portFromHost)) return portFromHost;
			const host = this.headers.host ?? this.headers[":authority"] ?? "";
			const portFromHeader = parseInt(host.split(":").slice(-1)[0]);
			if (!isNaN(portFromHeader)) return portFromHeader;
			return null;
		} },
		protocol: { get() {
			if (this.socket) return this.socket.encrypted ? "https" : "http";
		} },
		headers: {
			get() {
				if (this.additionalHeaders) return Object.assign({}, this.raw.headers, this.additionalHeaders);
				return this.raw.headers;
			},
			set(headers) {
				this.additionalHeaders = headers;
			}
		},
		getValidationFunction: { value: function(httpPartOrSchema) {
			if (typeof httpPartOrSchema === "string") {
				const symbol = HTTP_PART_SYMBOL_MAP[httpPartOrSchema];
				return this[kRouteContext][symbol];
			} else if (typeof httpPartOrSchema === "object") return this[kRouteContext][kRequestCacheValidateFns]?.get(httpPartOrSchema);
		} },
		compileValidationSchema: { value: function(schema, httpPart = null) {
			const { method, url } = this;
			if (this[kRouteContext][kRequestCacheValidateFns]?.has(schema)) return this[kRouteContext][kRequestCacheValidateFns].get(schema);
			const validateFn = (this[kRouteContext].validatorCompiler || this.server[kSchemaController].validatorCompiler || this.server[kSchemaController].setupValidator(this.server[kOptions]) || this.server[kSchemaController].validatorCompiler)({
				schema,
				method,
				url,
				httpPart
			});
			if (this[kRouteContext][kRequestCacheValidateFns] == null) this[kRouteContext][kRequestCacheValidateFns] = /* @__PURE__ */ new WeakMap();
			this[kRouteContext][kRequestCacheValidateFns].set(schema, validateFn);
			return validateFn;
		} },
		validateInput: { value: function(input, schema, httpPart) {
			httpPart = typeof schema === "string" ? schema : httpPart;
			const symbol = httpPart != null && typeof httpPart === "string" && HTTP_PART_SYMBOL_MAP[httpPart];
			let validate;
			if (symbol) validate = this[kRouteContext][symbol];
			if (validate == null && (schema == null || typeof schema !== "object" || Array.isArray(schema))) throw new FST_ERR_REQ_INVALID_VALIDATION_INVOCATION(httpPart);
			if (validate == null) if (this[kRouteContext][kRequestCacheValidateFns]?.has(schema)) validate = this[kRouteContext][kRequestCacheValidateFns].get(schema);
			else validate = this.compileValidationSchema(schema, httpPart);
			return validate(input);
		} },
		getDecorator: { value: function(name) {
			assertsRequestDecoration(this, name);
			const decorator = this[name];
			if (typeof decorator === "function") return decorator.bind(this);
			return decorator;
		} },
		setDecorator: { value: function(name, value) {
			assertsRequestDecoration(this, name);
			this[name] = value;
		} }
	});
	module.exports = Request;
	module.exports.buildRequest = buildRequest;
}));
//#endregion
//#region ../../node_modules/.bun/fastify@5.8.4/node_modules/fastify/lib/context.js
var require_context = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { kFourOhFourContext, kReplySerializerDefault, kSchemaErrorFormatter, kErrorHandler, kChildLoggerFactory, kOptions, kReply, kRequest, kBodyLimit, kLogLevel, kContentTypeParser, kRouteByFastify, kRequestCacheValidateFns, kReplyCacheSerializeFns, kHandlerTimeout } = require_symbols$1();
	function Context({ schema, handler, config, requestIdLogLabel, childLoggerFactory, errorHandler, bodyLimit, logLevel, logSerializers, attachValidation, validatorCompiler, serializerCompiler, replySerializer, schemaErrorFormatter, exposeHeadRoute, prefixTrailingSlash, server, isFastify, handlerTimeout }) {
		this.schema = schema;
		this.handler = handler;
		this.Reply = server[kReply];
		this.Request = server[kRequest];
		this.contentTypeParser = server[kContentTypeParser];
		this.onRequest = null;
		this.onSend = null;
		this.onError = null;
		this.onTimeout = null;
		this.preHandler = null;
		this.onResponse = null;
		this.preSerialization = null;
		this.onRequestAbort = null;
		this.config = config;
		this.errorHandler = errorHandler || server[kErrorHandler];
		this.requestIdLogLabel = requestIdLogLabel || server[kOptions].requestIdLogLabel;
		this.childLoggerFactory = childLoggerFactory || server[kChildLoggerFactory];
		this._middie = null;
		this._parserOptions = { limit: bodyLimit || server[kBodyLimit] };
		this.exposeHeadRoute = exposeHeadRoute;
		this.prefixTrailingSlash = prefixTrailingSlash;
		this.logLevel = logLevel || server[kLogLevel];
		this.logSerializers = logSerializers;
		this[kFourOhFourContext] = null;
		this.attachValidation = attachValidation;
		this[kReplySerializerDefault] = replySerializer;
		this.schemaErrorFormatter = schemaErrorFormatter || server[kSchemaErrorFormatter] || defaultSchemaErrorFormatter;
		this[kRouteByFastify] = isFastify;
		this[kRequestCacheValidateFns] = null;
		this[kReplyCacheSerializeFns] = null;
		this.validatorCompiler = validatorCompiler || null;
		this.serializerCompiler = serializerCompiler || null;
		this.handlerTimeout = handlerTimeout || server[kHandlerTimeout] || 0;
		this.server = server;
	}
	function defaultSchemaErrorFormatter(errors, dataVar) {
		let text = "";
		const separator = ", ";
		for (let i = 0; i !== errors.length; ++i) {
			const e = errors[i];
			text += dataVar + (e.instancePath || "") + " " + e.message + separator;
		}
		return new Error(text.slice(0, -2));
	}
	module.exports = Context;
}));
//#endregion
//#region ../../node_modules/.bun/toad-cache@3.7.0/node_modules/toad-cache/dist/toad-cache.cjs
/**
* toad-cache
*
* @copyright 2024 Igor Savin <kibertoad@gmail.com>
* @license MIT
* @version 3.7.0
*/
var require_toad_cache = /* @__PURE__ */ __commonJSMin(((exports) => {
	var FifoMap = class {
		constructor(max = 1e3, ttlInMsecs = 0) {
			if (isNaN(max) || max < 0) throw new Error("Invalid max value");
			if (isNaN(ttlInMsecs) || ttlInMsecs < 0) throw new Error("Invalid ttl value");
			this.first = null;
			this.items = /* @__PURE__ */ new Map();
			this.last = null;
			this.max = max;
			this.ttl = ttlInMsecs;
		}
		get size() {
			return this.items.size;
		}
		clear() {
			this.items = /* @__PURE__ */ new Map();
			this.first = null;
			this.last = null;
		}
		delete(key) {
			if (this.items.has(key)) {
				const deletedItem = this.items.get(key);
				this.items.delete(key);
				if (deletedItem.prev !== null) deletedItem.prev.next = deletedItem.next;
				if (deletedItem.next !== null) deletedItem.next.prev = deletedItem.prev;
				if (this.first === deletedItem) this.first = deletedItem.next;
				if (this.last === deletedItem) this.last = deletedItem.prev;
			}
		}
		deleteMany(keys) {
			for (var i = 0; i < keys.length; i++) this.delete(keys[i]);
		}
		evict() {
			if (this.size > 0) {
				const item = this.first;
				this.items.delete(item.key);
				if (this.size === 0) {
					this.first = null;
					this.last = null;
				} else {
					this.first = item.next;
					this.first.prev = null;
				}
			}
		}
		expiresAt(key) {
			if (this.items.has(key)) return this.items.get(key).expiry;
		}
		get(key) {
			if (this.items.has(key)) {
				const item = this.items.get(key);
				if (this.ttl > 0 && item.expiry <= Date.now()) {
					this.delete(key);
					return;
				}
				return item.value;
			}
		}
		getMany(keys) {
			const result = [];
			for (var i = 0; i < keys.length; i++) result.push(this.get(keys[i]));
			return result;
		}
		keys() {
			return this.items.keys();
		}
		set(key, value) {
			if (this.items.has(key)) {
				const item = this.items.get(key);
				item.value = value;
				item.expiry = this.ttl > 0 ? Date.now() + this.ttl : this.ttl;
				return;
			}
			if (this.max > 0 && this.size === this.max) this.evict();
			const item = {
				expiry: this.ttl > 0 ? Date.now() + this.ttl : this.ttl,
				key,
				prev: this.last,
				next: null,
				value
			};
			this.items.set(key, item);
			if (this.size === 1) this.first = item;
			else this.last.next = item;
			this.last = item;
		}
	};
	var LruMap = class {
		constructor(max = 1e3, ttlInMsecs = 0) {
			if (isNaN(max) || max < 0) throw new Error("Invalid max value");
			if (isNaN(ttlInMsecs) || ttlInMsecs < 0) throw new Error("Invalid ttl value");
			this.first = null;
			this.items = /* @__PURE__ */ new Map();
			this.last = null;
			this.max = max;
			this.ttl = ttlInMsecs;
		}
		get size() {
			return this.items.size;
		}
		bumpLru(item) {
			if (this.last === item) return;
			const last = this.last;
			const next = item.next;
			const prev = item.prev;
			if (this.first === item) this.first = next;
			item.next = null;
			item.prev = last;
			last.next = item;
			if (prev !== null) prev.next = next;
			if (next !== null) next.prev = prev;
			this.last = item;
		}
		clear() {
			this.items = /* @__PURE__ */ new Map();
			this.first = null;
			this.last = null;
		}
		delete(key) {
			if (this.items.has(key)) {
				const item = this.items.get(key);
				this.items.delete(key);
				if (item.prev !== null) item.prev.next = item.next;
				if (item.next !== null) item.next.prev = item.prev;
				if (this.first === item) this.first = item.next;
				if (this.last === item) this.last = item.prev;
			}
		}
		deleteMany(keys) {
			for (var i = 0; i < keys.length; i++) this.delete(keys[i]);
		}
		evict() {
			if (this.size > 0) {
				const item = this.first;
				this.items.delete(item.key);
				if (this.size === 0) {
					this.first = null;
					this.last = null;
				} else {
					this.first = item.next;
					this.first.prev = null;
				}
			}
		}
		expiresAt(key) {
			if (this.items.has(key)) return this.items.get(key).expiry;
		}
		get(key) {
			if (this.items.has(key)) {
				const item = this.items.get(key);
				if (this.ttl > 0 && item.expiry <= Date.now()) {
					this.delete(key);
					return;
				}
				this.bumpLru(item);
				return item.value;
			}
		}
		getMany(keys) {
			const result = [];
			for (var i = 0; i < keys.length; i++) result.push(this.get(keys[i]));
			return result;
		}
		keys() {
			return this.items.keys();
		}
		set(key, value) {
			if (this.items.has(key)) {
				const item = this.items.get(key);
				item.value = value;
				item.expiry = this.ttl > 0 ? Date.now() + this.ttl : this.ttl;
				if (this.last !== item) this.bumpLru(item);
				return;
			}
			if (this.max > 0 && this.size === this.max) this.evict();
			const item = {
				expiry: this.ttl > 0 ? Date.now() + this.ttl : this.ttl,
				key,
				prev: this.last,
				next: null,
				value
			};
			this.items.set(key, item);
			if (this.size === 1) this.first = item;
			else this.last.next = item;
			this.last = item;
		}
	};
	var LruObject = class {
		constructor(max = 1e3, ttlInMsecs = 0) {
			if (isNaN(max) || max < 0) throw new Error("Invalid max value");
			if (isNaN(ttlInMsecs) || ttlInMsecs < 0) throw new Error("Invalid ttl value");
			this.first = null;
			this.items = Object.create(null);
			this.last = null;
			this.size = 0;
			this.max = max;
			this.ttl = ttlInMsecs;
		}
		bumpLru(item) {
			if (this.last === item) return;
			const last = this.last;
			const next = item.next;
			const prev = item.prev;
			if (this.first === item) this.first = next;
			item.next = null;
			item.prev = last;
			last.next = item;
			if (prev !== null) prev.next = next;
			if (next !== null) next.prev = prev;
			this.last = item;
		}
		clear() {
			this.items = Object.create(null);
			this.first = null;
			this.last = null;
			this.size = 0;
		}
		delete(key) {
			if (Object.prototype.hasOwnProperty.call(this.items, key)) {
				const item = this.items[key];
				delete this.items[key];
				this.size--;
				if (item.prev !== null) item.prev.next = item.next;
				if (item.next !== null) item.next.prev = item.prev;
				if (this.first === item) this.first = item.next;
				if (this.last === item) this.last = item.prev;
			}
		}
		deleteMany(keys) {
			for (var i = 0; i < keys.length; i++) this.delete(keys[i]);
		}
		evict() {
			if (this.size > 0) {
				const item = this.first;
				delete this.items[item.key];
				if (--this.size === 0) {
					this.first = null;
					this.last = null;
				} else {
					this.first = item.next;
					this.first.prev = null;
				}
			}
		}
		expiresAt(key) {
			if (Object.prototype.hasOwnProperty.call(this.items, key)) return this.items[key].expiry;
		}
		get(key) {
			if (Object.prototype.hasOwnProperty.call(this.items, key)) {
				const item = this.items[key];
				if (this.ttl > 0 && item.expiry <= Date.now()) {
					this.delete(key);
					return;
				}
				this.bumpLru(item);
				return item.value;
			}
		}
		getMany(keys) {
			const result = [];
			for (var i = 0; i < keys.length; i++) result.push(this.get(keys[i]));
			return result;
		}
		keys() {
			return Object.keys(this.items);
		}
		set(key, value) {
			if (Object.prototype.hasOwnProperty.call(this.items, key)) {
				const item = this.items[key];
				item.value = value;
				item.expiry = this.ttl > 0 ? Date.now() + this.ttl : this.ttl;
				if (this.last !== item) this.bumpLru(item);
				return;
			}
			if (this.max > 0 && this.size === this.max) this.evict();
			const item = {
				expiry: this.ttl > 0 ? Date.now() + this.ttl : this.ttl,
				key,
				prev: this.last,
				next: null,
				value
			};
			this.items[key] = item;
			if (++this.size === 1) this.first = item;
			else this.last.next = item;
			this.last = item;
		}
	};
	var HitStatisticsRecord = class {
		constructor() {
			this.records = {};
		}
		initForCache(cacheId, currentTimeStamp) {
			this.records[cacheId] = { [currentTimeStamp]: {
				cacheSize: 0,
				hits: 0,
				falsyHits: 0,
				emptyHits: 0,
				misses: 0,
				expirations: 0,
				evictions: 0,
				invalidateOne: 0,
				invalidateAll: 0,
				sets: 0
			} };
		}
		resetForCache(cacheId) {
			for (let key of Object.keys(this.records[cacheId])) this.records[cacheId][key] = {
				cacheSize: 0,
				hits: 0,
				falsyHits: 0,
				emptyHits: 0,
				misses: 0,
				expirations: 0,
				evictions: 0,
				invalidateOne: 0,
				invalidateAll: 0,
				sets: 0
			};
		}
		getStatistics() {
			return this.records;
		}
	};
	/**
	*
	* @param {Date} date
	* @returns {string}
	*/
	function getTimestamp(date) {
		return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
	}
	var HitStatistics = class {
		constructor(cacheId, statisticTtlInHours, globalStatisticsRecord) {
			this.cacheId = cacheId;
			this.statisticTtlInHours = statisticTtlInHours;
			this.collectionStart = /* @__PURE__ */ new Date();
			this.currentTimeStamp = getTimestamp(this.collectionStart);
			this.records = globalStatisticsRecord || new HitStatisticsRecord();
			this.records.initForCache(this.cacheId, this.currentTimeStamp);
		}
		get currentRecord() {
			/* c8 ignore next 14 */
			if (!this.records.records[this.cacheId][this.currentTimeStamp]) this.records.records[this.cacheId][this.currentTimeStamp] = {
				cacheSize: 0,
				hits: 0,
				falsyHits: 0,
				emptyHits: 0,
				misses: 0,
				expirations: 0,
				evictions: 0,
				sets: 0,
				invalidateOne: 0,
				invalidateAll: 0
			};
			return this.records.records[this.cacheId][this.currentTimeStamp];
		}
		hoursPassed() {
			return (Date.now() - this.collectionStart) / 1e3 / 60 / 60;
		}
		addHit() {
			this.archiveIfNeeded();
			this.currentRecord.hits++;
		}
		addFalsyHit() {
			this.archiveIfNeeded();
			this.currentRecord.falsyHits++;
		}
		addEmptyHit() {
			this.archiveIfNeeded();
			this.currentRecord.emptyHits++;
		}
		addMiss() {
			this.archiveIfNeeded();
			this.currentRecord.misses++;
		}
		addEviction() {
			this.archiveIfNeeded();
			this.currentRecord.evictions++;
		}
		setCacheSize(currentSize) {
			this.archiveIfNeeded();
			this.currentRecord.cacheSize = currentSize;
		}
		addExpiration() {
			this.archiveIfNeeded();
			this.currentRecord.expirations++;
		}
		addSet() {
			this.archiveIfNeeded();
			this.currentRecord.sets++;
		}
		addInvalidateOne() {
			this.archiveIfNeeded();
			this.currentRecord.invalidateOne++;
		}
		addInvalidateAll() {
			this.archiveIfNeeded();
			this.currentRecord.invalidateAll++;
		}
		getStatistics() {
			return this.records.getStatistics();
		}
		archiveIfNeeded() {
			if (this.hoursPassed() >= this.statisticTtlInHours) {
				this.collectionStart = /* @__PURE__ */ new Date();
				this.currentTimeStamp = getTimestamp(this.collectionStart);
				this.records.initForCache(this.cacheId, this.currentTimeStamp);
			}
		}
	};
	var LruObjectHitStatistics = class extends LruObject {
		constructor(max, ttlInMsecs, cacheId, globalStatisticsRecord, statisticTtlInHours) {
			super(max || 1e3, ttlInMsecs || 0);
			if (!cacheId) throw new Error("Cache id is mandatory");
			this.hitStatistics = new HitStatistics(cacheId, statisticTtlInHours !== void 0 ? statisticTtlInHours : 24, globalStatisticsRecord);
		}
		getStatistics() {
			return this.hitStatistics.getStatistics();
		}
		set(key, value) {
			super.set(key, value);
			this.hitStatistics.addSet();
			this.hitStatistics.setCacheSize(this.size);
		}
		evict() {
			super.evict();
			this.hitStatistics.addEviction();
			this.hitStatistics.setCacheSize(this.size);
		}
		delete(key, isExpiration = false) {
			super.delete(key);
			if (!isExpiration) this.hitStatistics.addInvalidateOne();
			this.hitStatistics.setCacheSize(this.size);
		}
		clear() {
			super.clear();
			this.hitStatistics.addInvalidateAll();
			this.hitStatistics.setCacheSize(this.size);
		}
		get(key) {
			if (Object.prototype.hasOwnProperty.call(this.items, key)) {
				const item = this.items[key];
				if (this.ttl > 0 && item.expiry <= Date.now()) {
					this.delete(key, true);
					this.hitStatistics.addExpiration();
					return;
				}
				this.bumpLru(item);
				if (!item.value) this.hitStatistics.addFalsyHit();
				if (item.value === void 0 || item.value === null || item.value === "") this.hitStatistics.addEmptyHit();
				this.hitStatistics.addHit();
				return item.value;
			}
			this.hitStatistics.addMiss();
		}
	};
	var FifoObject = class {
		constructor(max = 1e3, ttlInMsecs = 0) {
			if (isNaN(max) || max < 0) throw new Error("Invalid max value");
			if (isNaN(ttlInMsecs) || ttlInMsecs < 0) throw new Error("Invalid ttl value");
			this.first = null;
			this.items = Object.create(null);
			this.last = null;
			this.size = 0;
			this.max = max;
			this.ttl = ttlInMsecs;
		}
		clear() {
			this.items = Object.create(null);
			this.first = null;
			this.last = null;
			this.size = 0;
		}
		delete(key) {
			if (Object.prototype.hasOwnProperty.call(this.items, key)) {
				const deletedItem = this.items[key];
				delete this.items[key];
				this.size--;
				if (deletedItem.prev !== null) deletedItem.prev.next = deletedItem.next;
				if (deletedItem.next !== null) deletedItem.next.prev = deletedItem.prev;
				if (this.first === deletedItem) this.first = deletedItem.next;
				if (this.last === deletedItem) this.last = deletedItem.prev;
			}
		}
		deleteMany(keys) {
			for (var i = 0; i < keys.length; i++) this.delete(keys[i]);
		}
		evict() {
			if (this.size > 0) {
				const item = this.first;
				delete this.items[item.key];
				if (--this.size === 0) {
					this.first = null;
					this.last = null;
				} else {
					this.first = item.next;
					this.first.prev = null;
				}
			}
		}
		expiresAt(key) {
			if (Object.prototype.hasOwnProperty.call(this.items, key)) return this.items[key].expiry;
		}
		get(key) {
			if (Object.prototype.hasOwnProperty.call(this.items, key)) {
				const item = this.items[key];
				if (this.ttl > 0 && item.expiry <= Date.now()) {
					this.delete(key);
					return;
				}
				return item.value;
			}
		}
		getMany(keys) {
			const result = [];
			for (var i = 0; i < keys.length; i++) result.push(this.get(keys[i]));
			return result;
		}
		keys() {
			return Object.keys(this.items);
		}
		set(key, value) {
			if (Object.prototype.hasOwnProperty.call(this.items, key)) {
				const item = this.items[key];
				item.value = value;
				item.expiry = this.ttl > 0 ? Date.now() + this.ttl : this.ttl;
				return;
			}
			if (this.max > 0 && this.size === this.max) this.evict();
			const item = {
				expiry: this.ttl > 0 ? Date.now() + this.ttl : this.ttl,
				key,
				prev: this.last,
				next: null,
				value
			};
			this.items[key] = item;
			if (++this.size === 1) this.first = item;
			else this.last.next = item;
			this.last = item;
		}
	};
	exports.Fifo = FifoObject;
	exports.FifoMap = FifoMap;
	exports.FifoObject = FifoObject;
	exports.HitStatisticsRecord = HitStatisticsRecord;
	exports.Lru = LruObject;
	exports.LruHitStatistics = LruObjectHitStatistics;
	exports.LruMap = LruMap;
	exports.LruObject = LruObject;
	exports.LruObjectHitStatistics = LruObjectHitStatistics;
}));
//#endregion
//#region ../../node_modules/.bun/secure-json-parse@4.1.0/node_modules/secure-json-parse/index.js
var require_secure_json_parse = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const hasBuffer = typeof Buffer !== "undefined";
	const suspectProtoRx = /"(?:_|\\u005[Ff])(?:_|\\u005[Ff])(?:p|\\u0070)(?:r|\\u0072)(?:o|\\u006[Ff])(?:t|\\u0074)(?:o|\\u006[Ff])(?:_|\\u005[Ff])(?:_|\\u005[Ff])"\s*:/;
	const suspectConstructorRx = /"(?:c|\\u0063)(?:o|\\u006[Ff])(?:n|\\u006[Ee])(?:s|\\u0073)(?:t|\\u0074)(?:r|\\u0072)(?:u|\\u0075)(?:c|\\u0063)(?:t|\\u0074)(?:o|\\u006[Ff])(?:r|\\u0072)"\s*:/;
	/**
	* @description Internal parse function that parses JSON text with security checks.
	* @private
	* @param {string|Buffer} text - The JSON text string or Buffer to parse.
	* @param {Function} [reviver] - The JSON.parse() optional reviver argument.
	* @param {import('./types').ParseOptions} [options] - Optional configuration object.
	* @returns {*} The parsed object.
	* @throws {SyntaxError} If a forbidden prototype property is found and `options.protoAction` or
	* `options.constructorAction` is `'error'`.
	*/
	function _parse(text, reviver, options) {
		if (options == null) {
			if (reviver !== null && typeof reviver === "object") {
				options = reviver;
				reviver = void 0;
			}
		}
		if (hasBuffer && Buffer.isBuffer(text)) text = text.toString();
		if (text && text.charCodeAt(0) === 65279) text = text.slice(1);
		const obj = JSON.parse(text, reviver);
		if (obj === null || typeof obj !== "object") return obj;
		const protoAction = options && options.protoAction || "error";
		const constructorAction = options && options.constructorAction || "error";
		if (protoAction === "ignore" && constructorAction === "ignore") return obj;
		if (protoAction !== "ignore" && constructorAction !== "ignore") {
			if (suspectProtoRx.test(text) === false && suspectConstructorRx.test(text) === false) return obj;
		} else if (protoAction !== "ignore" && constructorAction === "ignore") {
			if (suspectProtoRx.test(text) === false) return obj;
		} else if (suspectConstructorRx.test(text) === false) return obj;
		return filter(obj, {
			protoAction,
			constructorAction,
			safe: options && options.safe
		});
	}
	/**
	* @description Scans and filters an object for forbidden prototype properties.
	* @param {Object} obj - The object being scanned.
	* @param {import('./types').ParseOptions} [options] - Optional configuration object.
	* @returns {Object|null} The filtered object, or `null` if safe mode is enabled and issues are found.
	* @throws {SyntaxError} If a forbidden prototype property is found and `options.protoAction` or
	* `options.constructorAction` is `'error'`.
	*/
	function filter(obj, { protoAction = "error", constructorAction = "error", safe } = {}) {
		let next = [obj];
		while (next.length) {
			const nodes = next;
			next = [];
			for (const node of nodes) {
				if (protoAction !== "ignore" && Object.prototype.hasOwnProperty.call(node, "__proto__")) {
					if (safe === true) return null;
					else if (protoAction === "error") throw new SyntaxError("Object contains forbidden prototype property");
					delete node.__proto__;
				}
				if (constructorAction !== "ignore" && Object.prototype.hasOwnProperty.call(node, "constructor") && node.constructor !== null && typeof node.constructor === "object" && Object.prototype.hasOwnProperty.call(node.constructor, "prototype")) {
					if (safe === true) return null;
					else if (constructorAction === "error") throw new SyntaxError("Object contains forbidden prototype property");
					delete node.constructor;
				}
				for (const key in node) {
					const value = node[key];
					if (value && typeof value === "object") next.push(value);
				}
			}
		}
		return obj;
	}
	/**
	* @description Parses a given JSON-formatted text into an object.
	* @param {string|Buffer} text - The JSON text string or Buffer to parse.
	* @param {Function} [reviver] - The `JSON.parse()` optional reviver argument, or options object.
	* @param {import('./types').ParseOptions} [options] - Optional configuration object.
	* @returns {*} The parsed object.
	* @throws {SyntaxError} If the JSON text is malformed or contains forbidden prototype properties
	* when `options.protoAction` or `options.constructorAction` is `'error'`.
	*/
	function parse(text, reviver, options) {
		const { stackTraceLimit } = Error;
		Error.stackTraceLimit = 0;
		try {
			return _parse(text, reviver, options);
		} finally {
			Error.stackTraceLimit = stackTraceLimit;
		}
	}
	/**
	* @description Safely parses a given JSON-formatted text into an object.
	* @param {string|Buffer} text - The JSON text string or Buffer to parse.
	* @param {Function} [reviver] - The `JSON.parse()` optional reviver argument.
	* @returns {*|null|undefined} The parsed object, `null` if security issues found, or `undefined` on parse error.
	*/
	function safeParse(text, reviver) {
		const { stackTraceLimit } = Error;
		Error.stackTraceLimit = 0;
		try {
			return _parse(text, reviver, { safe: true });
		} catch {
			return;
		} finally {
			Error.stackTraceLimit = stackTraceLimit;
		}
	}
	module.exports = parse;
	module.exports.default = parse;
	module.exports.parse = parse;
	module.exports.safeParse = safeParse;
	module.exports.scan = filter;
}));
//#endregion
//#region ../../node_modules/.bun/fastify@5.8.4/node_modules/fastify/lib/content-type-parser.js
var require_content_type_parser = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { AsyncResource } = __require("node:async_hooks");
	const { FifoMap: Fifo } = require_toad_cache();
	const { parse: secureJsonParse } = require_secure_json_parse();
	const ContentType = require_content_type();
	const { kDefaultJsonParse, kContentTypeParser, kBodyLimit, kRequestPayloadStream, kState, kTestInternals, kReplyIsError, kRouteContext } = require_symbols$1();
	const { FST_ERR_CTP_INVALID_TYPE, FST_ERR_CTP_EMPTY_TYPE, FST_ERR_CTP_ALREADY_PRESENT, FST_ERR_CTP_INVALID_HANDLER, FST_ERR_CTP_INVALID_PARSE_TYPE, FST_ERR_CTP_BODY_TOO_LARGE, FST_ERR_CTP_INVALID_MEDIA_TYPE, FST_ERR_CTP_INVALID_CONTENT_LENGTH, FST_ERR_CTP_EMPTY_JSON_BODY, FST_ERR_CTP_INSTANCE_ALREADY_STARTED, FST_ERR_CTP_INVALID_JSON_BODY } = require_errors();
	const { FSTSEC001 } = require_warnings();
	function ContentTypeParser(bodyLimit, onProtoPoisoning, onConstructorPoisoning) {
		this[kDefaultJsonParse] = getDefaultJsonParser(onProtoPoisoning, onConstructorPoisoning);
		this.customParsers = /* @__PURE__ */ new Map();
		this.customParsers.set("application/json", new Parser(true, false, bodyLimit, this[kDefaultJsonParse]));
		this.customParsers.set("text/plain", new Parser(true, false, bodyLimit, defaultPlainTextParser));
		this.parserList = ["application/json", "text/plain"];
		this.parserRegExpList = [];
		this.cache = new Fifo(100);
	}
	ContentTypeParser.prototype.add = function(contentType, opts, parserFn) {
		const contentTypeIsString = typeof contentType === "string";
		if (contentTypeIsString) {
			contentType = contentType.trim().toLowerCase();
			if (contentType.length === 0) throw new FST_ERR_CTP_EMPTY_TYPE();
		} else if (!(contentType instanceof RegExp)) throw new FST_ERR_CTP_INVALID_TYPE();
		if (typeof parserFn !== "function") throw new FST_ERR_CTP_INVALID_HANDLER();
		if (this.existingParser(contentType)) throw new FST_ERR_CTP_ALREADY_PRESENT(contentType);
		if (opts.parseAs !== void 0) {
			if (opts.parseAs !== "string" && opts.parseAs !== "buffer") throw new FST_ERR_CTP_INVALID_PARSE_TYPE(opts.parseAs);
		}
		const parser = new Parser(opts.parseAs === "string", opts.parseAs === "buffer", opts.bodyLimit, parserFn);
		if (contentType === "*") this.customParsers.set("", parser);
		else if (contentTypeIsString) {
			const ct = new ContentType(contentType);
			if (ct.isValid === false) throw new FST_ERR_CTP_INVALID_TYPE();
			const normalizedContentType = ct.toString();
			this.parserList.unshift(normalizedContentType);
			this.customParsers.set(normalizedContentType, parser);
		} else {
			validateRegExp(contentType);
			this.parserRegExpList.unshift(contentType);
			this.customParsers.set(contentType.toString(), parser);
		}
	};
	ContentTypeParser.prototype.hasParser = function(contentType) {
		if (typeof contentType === "string") contentType = new ContentType(contentType).toString();
		else {
			if (!(contentType instanceof RegExp)) throw new FST_ERR_CTP_INVALID_TYPE();
			contentType = contentType.toString();
		}
		return this.customParsers.has(contentType);
	};
	ContentTypeParser.prototype.existingParser = function(contentType) {
		if (typeof contentType === "string") {
			const ct = new ContentType(contentType).toString();
			if (contentType === "application/json" && this.customParsers.has(contentType)) return this.customParsers.get(ct).fn !== this[kDefaultJsonParse];
			if (contentType === "text/plain" && this.customParsers.has(contentType)) return this.customParsers.get(ct).fn !== defaultPlainTextParser;
		}
		return this.hasParser(contentType);
	};
	ContentTypeParser.prototype.getParser = function(contentType) {
		if (typeof contentType === "string") contentType = new ContentType(contentType);
		const ct = contentType.toString();
		let parser = this.cache.get(ct);
		if (parser !== void 0) return parser;
		parser = this.customParsers.get(ct);
		if (parser !== void 0) {
			this.cache.set(ct, parser);
			return parser;
		}
		parser = this.customParsers.get(contentType.mediaType);
		if (parser !== void 0) return parser;
		for (let j = 0; j !== this.parserRegExpList.length; ++j) {
			const parserRegExp = this.parserRegExpList[j];
			if (parserRegExp.test(ct)) {
				parser = this.customParsers.get(parserRegExp.toString());
				this.cache.set(ct, parser);
				return parser;
			}
		}
		return this.customParsers.get("");
	};
	ContentTypeParser.prototype.removeAll = function() {
		this.customParsers = /* @__PURE__ */ new Map();
		this.parserRegExpList = [];
		this.parserList = [];
		this.cache = new Fifo(100);
	};
	ContentTypeParser.prototype.remove = function(contentType) {
		let parsers;
		if (typeof contentType === "string") {
			contentType = new ContentType(contentType).toString();
			parsers = this.parserList;
		} else {
			if (!(contentType instanceof RegExp)) throw new FST_ERR_CTP_INVALID_TYPE();
			contentType = contentType.toString();
			parsers = this.parserRegExpList;
		}
		const removed = this.customParsers.delete(contentType);
		const idx = parsers.findIndex((ct) => ct.toString() === contentType);
		if (idx > -1) parsers.splice(idx, 1);
		return removed || idx > -1;
	};
	ContentTypeParser.prototype.run = function(contentType, handler, request, reply) {
		const parser = this.getParser(contentType);
		if (parser === void 0) {
			if (request.is404 === true) {
				handler(request, reply);
				return;
			}
			reply[kReplyIsError] = true;
			reply.send(new FST_ERR_CTP_INVALID_MEDIA_TYPE());
			return;
		}
		const resource = new AsyncResource("content-type-parser:run", request);
		const done = resource.bind(onDone);
		if (parser.asString === true || parser.asBuffer === true) {
			rawBody(request, reply, reply[kRouteContext]._parserOptions, parser, done);
			return;
		}
		const result = parser.fn(request, request[kRequestPayloadStream], done);
		if (result && typeof result.then === "function") result.then((body) => {
			done(null, body);
		}, done);
		function onDone(error, body) {
			resource.emitDestroy();
			if (error != null) {
				reply.header("connection", "close");
				reply[kReplyIsError] = true;
				reply.send(error);
				return;
			}
			request.body = body;
			handler(request, reply);
		}
	};
	function rawBody(request, reply, options, parser, done) {
		const asString = parser.asString === true;
		const limit = options.limit === null ? parser.bodyLimit : options.limit;
		const contentLength = Number(request.headers["content-length"]);
		if (contentLength > limit) {
			done(new FST_ERR_CTP_BODY_TOO_LARGE(), void 0);
			return;
		}
		let receivedLength = 0;
		let body = asString ? "" : [];
		const payload = request[kRequestPayloadStream] || request.raw;
		if (asString) payload.setEncoding("utf8");
		payload.on("data", onData);
		payload.on("end", onEnd);
		payload.on("error", onEnd);
		payload.resume();
		function onData(chunk) {
			receivedLength += asString ? Buffer.byteLength(chunk) : chunk.length;
			const { receivedEncodedLength = 0 } = payload;
			if (receivedLength > limit || receivedEncodedLength > limit) {
				payload.removeListener("data", onData);
				payload.removeListener("end", onEnd);
				payload.removeListener("error", onEnd);
				done(new FST_ERR_CTP_BODY_TOO_LARGE(), void 0);
				return;
			}
			if (asString) body += chunk;
			else body.push(chunk);
		}
		function onEnd(err) {
			payload.removeListener("data", onData);
			payload.removeListener("end", onEnd);
			payload.removeListener("error", onEnd);
			if (err != null) {
				if (!(typeof err.statusCode === "number" && err.statusCode >= 400)) err.statusCode = 400;
				done(err, void 0);
				return;
			}
			if (!Number.isNaN(contentLength) && (payload.receivedEncodedLength || receivedLength) !== contentLength) {
				done(new FST_ERR_CTP_INVALID_CONTENT_LENGTH(), void 0);
				return;
			}
			if (!asString) body = Buffer.concat(body);
			const result = parser.fn(request, body, done);
			if (result && typeof result.then === "function") result.then((body) => {
				done(null, body);
			}, done);
		}
	}
	function getDefaultJsonParser(onProtoPoisoning, onConstructorPoisoning) {
		const parseOptions = {
			protoAction: onProtoPoisoning,
			constructorAction: onConstructorPoisoning
		};
		return defaultJsonParser;
		function defaultJsonParser(req, body, done) {
			if (body.length === 0) {
				done(new FST_ERR_CTP_EMPTY_JSON_BODY(), void 0);
				return;
			}
			try {
				done(null, secureJsonParse(body, parseOptions));
			} catch {
				done(new FST_ERR_CTP_INVALID_JSON_BODY(), void 0);
			}
		}
	}
	function defaultPlainTextParser(req, body, done) {
		done(null, body);
	}
	function Parser(asString, asBuffer, bodyLimit, fn) {
		this.asString = asString;
		this.asBuffer = asBuffer;
		this.bodyLimit = bodyLimit;
		this.fn = fn;
	}
	function buildContentTypeParser(c) {
		const contentTypeParser = new ContentTypeParser();
		contentTypeParser[kDefaultJsonParse] = c[kDefaultJsonParse];
		contentTypeParser.customParsers = new Map(c.customParsers.entries());
		contentTypeParser.parserList = c.parserList.slice();
		contentTypeParser.parserRegExpList = c.parserRegExpList.slice();
		return contentTypeParser;
	}
	function addContentTypeParser(contentType, opts, parser) {
		if (this[kState].started) throw new FST_ERR_CTP_INSTANCE_ALREADY_STARTED("addContentTypeParser");
		if (typeof opts === "function") {
			parser = opts;
			opts = {};
		}
		if (!opts) opts = {};
		if (!opts.bodyLimit) opts.bodyLimit = this[kBodyLimit];
		if (Array.isArray(contentType)) contentType.forEach((type) => this[kContentTypeParser].add(type, opts, parser));
		else this[kContentTypeParser].add(contentType, opts, parser);
		return this;
	}
	function hasContentTypeParser(contentType) {
		return this[kContentTypeParser].hasParser(contentType);
	}
	function removeContentTypeParser(contentType) {
		if (this[kState].started) throw new FST_ERR_CTP_INSTANCE_ALREADY_STARTED("removeContentTypeParser");
		if (Array.isArray(contentType)) for (const type of contentType) this[kContentTypeParser].remove(type);
		else this[kContentTypeParser].remove(contentType);
	}
	function removeAllContentTypeParsers() {
		if (this[kState].started) throw new FST_ERR_CTP_INSTANCE_ALREADY_STARTED("removeAllContentTypeParsers");
		this[kContentTypeParser].removeAll();
	}
	function validateRegExp(regexp) {
		if (regexp.source[0] !== "^" && regexp.source.includes(";?") === false) FSTSEC001(regexp.source);
	}
	module.exports = ContentTypeParser;
	module.exports.helpers = {
		buildContentTypeParser,
		addContentTypeParser,
		hasContentTypeParser,
		removeContentTypeParser,
		removeAllContentTypeParsers
	};
	module.exports.defaultParsers = {
		getDefaultJsonParser,
		defaultTextParser: defaultPlainTextParser
	};
	module.exports[kTestInternals] = { rawBody };
}));
//#endregion
//#region ../../node_modules/.bun/fastify@5.8.4/node_modules/fastify/lib/schema-controller.js
var require_schema_controller = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { buildSchemas } = require_schemas();
	/**
	* Called at every fastify context that is being created.
	* @param {object} parentSchemaCtrl: the SchemaController instance of the Fastify parent context
	* @param {object} opts: the `schemaController` server option. It can be undefined when a parentSchemaCtrl is set
	* @return {object}:a new SchemaController
	*/
	function buildSchemaController(parentSchemaCtrl, opts) {
		if (parentSchemaCtrl) return new SchemaController(parentSchemaCtrl, opts);
		const compilersFactory = Object.assign({
			buildValidator: null,
			buildSerializer: null
		}, opts?.compilersFactory);
		if (!compilersFactory.buildValidator) compilersFactory.buildValidator = require_ajv_compiler()();
		if (!compilersFactory.buildSerializer) compilersFactory.buildSerializer = require_fast_json_stringify_compiler()();
		return new SchemaController(void 0, {
			bucket: opts && opts.bucket || buildSchemas,
			compilersFactory,
			isCustomValidatorCompiler: typeof opts?.compilersFactory?.buildValidator === "function",
			isCustomSerializerCompiler: typeof opts?.compilersFactory?.buildValidator === "function"
		});
	}
	var SchemaController = class {
		constructor(parent, options) {
			this.opts = options || parent?.opts;
			this.addedSchemas = false;
			this.compilersFactory = this.opts.compilersFactory;
			if (parent) {
				this.schemaBucket = this.opts.bucket(parent.getSchemas());
				this.validatorCompiler = parent.getValidatorCompiler();
				this.serializerCompiler = parent.getSerializerCompiler();
				this.isCustomValidatorCompiler = parent.isCustomValidatorCompiler;
				this.isCustomSerializerCompiler = parent.isCustomSerializerCompiler;
				this.parent = parent;
			} else {
				this.schemaBucket = this.opts.bucket();
				this.isCustomValidatorCompiler = this.opts.isCustomValidatorCompiler || false;
				this.isCustomSerializerCompiler = this.opts.isCustomSerializerCompiler || false;
			}
		}
		add(schema) {
			this.addedSchemas = true;
			return this.schemaBucket.add(schema);
		}
		getSchema(schemaId) {
			return this.schemaBucket.getSchema(schemaId);
		}
		getSchemas() {
			return this.schemaBucket.getSchemas();
		}
		setValidatorCompiler(validatorCompiler) {
			this.compilersFactory = Object.assign({}, this.compilersFactory, { buildValidator: () => validatorCompiler });
			this.validatorCompiler = validatorCompiler;
			this.isCustomValidatorCompiler = true;
		}
		setSerializerCompiler(serializerCompiler) {
			this.compilersFactory = Object.assign({}, this.compilersFactory, { buildSerializer: () => serializerCompiler });
			this.serializerCompiler = serializerCompiler;
			this.isCustomSerializerCompiler = true;
		}
		getValidatorCompiler() {
			return this.validatorCompiler || this.parent && this.parent.getValidatorCompiler();
		}
		getSerializerCompiler() {
			return this.serializerCompiler || this.parent && this.parent.getSerializerCompiler();
		}
		getSerializerBuilder() {
			return this.compilersFactory.buildSerializer || this.parent && this.parent.getSerializerBuilder();
		}
		getValidatorBuilder() {
			return this.compilersFactory.buildValidator || this.parent && this.parent.getValidatorBuilder();
		}
		/**
		* This method will be called when a validator must be setup.
		* Do not setup the compiler more than once
		* @param {object} serverOptions the fastify server options
		*/
		setupValidator(serverOptions) {
			if (this.validatorCompiler !== void 0 && !this.addedSchemas) return;
			this.validatorCompiler = this.getValidatorBuilder()(this.schemaBucket.getSchemas(), serverOptions.ajv);
		}
		/**
		* This method will be called when a serializer must be setup.
		* Do not setup the compiler more than once
		* @param {object} serverOptions the fastify server options
		*/
		setupSerializer(serverOptions) {
			if (this.serializerCompiler !== void 0 && !this.addedSchemas) return;
			this.serializerCompiler = this.getSerializerBuilder()(this.schemaBucket.getSchemas(), serverOptions.serializerOpts);
		}
	};
	SchemaController.buildSchemaController = buildSchemaController;
	module.exports = SchemaController;
}));
//#endregion
//#region ../../node_modules/.bun/fastify@5.8.4/node_modules/fastify/lib/plugin-utils.js
var require_plugin_utils = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const semver = require_semver();
	const assert$6 = __require("node:assert");
	const kRegisteredPlugins = Symbol.for("registered-plugin");
	const { kTestInternals } = require_symbols$1();
	const { exist, existReply, existRequest } = require_decorate();
	const { FST_ERR_PLUGIN_VERSION_MISMATCH, FST_ERR_PLUGIN_NOT_PRESENT_IN_INSTANCE, FST_ERR_PLUGIN_INVALID_ASYNC_HANDLER } = require_errors();
	const rcRegex = /-(?:rc|pre|alpha).+$/u;
	function getMeta(fn) {
		return fn[Symbol.for("plugin-meta")];
	}
	function getPluginName(func) {
		const display = getDisplayName(func);
		if (display) return display;
		const cache = __require.cache;
		if (cache) {
			const keys = Object.keys(cache);
			for (let i = 0; i < keys.length; i++) {
				const key = keys[i];
				if (cache[key].exports === func) return key;
			}
		}
		if (func.name) return func.name;
		return null;
	}
	function getFuncPreview(func) {
		return func.toString().split("\n", 2).map((s) => s.trim()).join(" -- ");
	}
	function getDisplayName(fn) {
		return fn[Symbol.for("fastify.display-name")];
	}
	function shouldSkipOverride(fn) {
		return !!fn[Symbol.for("skip-override")];
	}
	function checkDependencies(fn) {
		const meta = getMeta(fn);
		if (!meta) return;
		const dependencies = meta.dependencies;
		if (!dependencies) return;
		assert$6(Array.isArray(dependencies), "The dependencies should be an array of strings");
		dependencies.forEach((dependency) => {
			assert$6(this[kRegisteredPlugins].indexOf(dependency) > -1, `The dependency '${dependency}' of plugin '${meta.name}' is not registered`);
		});
	}
	function checkDecorators(fn) {
		const meta = getMeta(fn);
		if (!meta) return;
		const { decorators, name } = meta;
		if (!decorators) return;
		if (decorators.fastify) _checkDecorators(this, "Fastify", decorators.fastify, name);
		if (decorators.reply) _checkDecorators(this, "Reply", decorators.reply, name);
		if (decorators.request) _checkDecorators(this, "Request", decorators.request, name);
	}
	const checks = {
		Fastify: exist,
		Request: existRequest,
		Reply: existReply
	};
	function _checkDecorators(that, instance, decorators, name) {
		assert$6(Array.isArray(decorators), "The decorators should be an array of strings");
		decorators.forEach((decorator) => {
			const withPluginName = typeof name === "string" ? ` required by '${name}'` : "";
			if (!checks[instance].call(that, decorator)) throw new FST_ERR_PLUGIN_NOT_PRESENT_IN_INSTANCE(decorator, withPluginName, instance);
		});
	}
	function checkVersion(fn) {
		const meta = getMeta(fn);
		if (meta?.fastify == null) return;
		const requiredVersion = meta.fastify;
		const fastifyRc = rcRegex.test(this.version);
		if (fastifyRc === true && semver.gt(this.version, semver.coerce(requiredVersion)) === true) return;
		if (requiredVersion && semver.satisfies(this.version, requiredVersion, { includePrerelease: fastifyRc }) === false) throw new FST_ERR_PLUGIN_VERSION_MISMATCH(meta.name, requiredVersion, this.version);
	}
	function registerPluginName(fn) {
		const meta = getMeta(fn);
		if (!meta) return;
		const name = meta.name;
		if (!name) return;
		this[kRegisteredPlugins].push(name);
		return name;
	}
	function checkPluginHealthiness(fn, pluginName) {
		if (fn.constructor.name === "AsyncFunction" && fn.length === 3) throw new FST_ERR_PLUGIN_INVALID_ASYNC_HANDLER(pluginName);
	}
	function registerPlugin(fn) {
		const pluginName = registerPluginName.call(this, fn) || getPluginName(fn);
		checkPluginHealthiness.call(this, fn, pluginName);
		checkVersion.call(this, fn);
		checkDecorators.call(this, fn);
		checkDependencies.call(this, fn);
		return shouldSkipOverride(fn);
	}
	module.exports = {
		getPluginName,
		getFuncPreview,
		kRegisteredPlugins,
		getDisplayName,
		registerPlugin
	};
	module.exports[kTestInternals] = {
		shouldSkipOverride,
		getMeta,
		checkDecorators,
		checkDependencies
	};
}));
//#endregion
//#region ../../node_modules/.bun/fastify@5.8.4/node_modules/fastify/lib/req-id-gen-factory.js
var require_req_id_gen_factory = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* @callback GenerateRequestId
	* @param {Object} req
	* @returns {string}
	*/
	/**
	* @param {string} [requestIdHeader]
	* @param {GenerateRequestId} [optGenReqId]
	* @returns {GenerateRequestId}
	*/
	function reqIdGenFactory(requestIdHeader, optGenReqId) {
		const genReqId = optGenReqId || buildDefaultGenReqId();
		if (requestIdHeader) return buildOptionalHeaderReqId(requestIdHeader, genReqId);
		return genReqId;
	}
	function getGenReqId(contextServer, req) {
		return contextServer.genReqId(req);
	}
	function buildDefaultGenReqId() {
		const maxInt = 2147483647;
		let nextReqId = 0;
		return function defaultGenReqId() {
			nextReqId = nextReqId + 1 & maxInt;
			return `req-${nextReqId.toString(36)}`;
		};
	}
	function buildOptionalHeaderReqId(requestIdHeader, genReqId) {
		return function(req) {
			return req.headers[requestIdHeader] || genReqId(req);
		};
	}
	module.exports = {
		getGenReqId,
		reqIdGenFactory
	};
}));
//#endregion
//#region ../../node_modules/.bun/ret@0.5.0/node_modules/ret/dist/types/tokens.js
var require_tokens = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
}));
//#endregion
//#region ../../node_modules/.bun/ret@0.5.0/node_modules/ret/dist/types/types.js
var require_types$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.types = void 0;
	(function(types) {
		types[types["ROOT"] = 0] = "ROOT";
		types[types["GROUP"] = 1] = "GROUP";
		types[types["POSITION"] = 2] = "POSITION";
		types[types["SET"] = 3] = "SET";
		types[types["RANGE"] = 4] = "RANGE";
		types[types["REPETITION"] = 5] = "REPETITION";
		types[types["REFERENCE"] = 6] = "REFERENCE";
		types[types["CHAR"] = 7] = "CHAR";
	})(exports.types || (exports.types = {}));
}));
//#endregion
//#region ../../node_modules/.bun/ret@0.5.0/node_modules/ret/dist/types/set-lookup.js
var require_set_lookup = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
}));
//#endregion
//#region ../../node_modules/.bun/ret@0.5.0/node_modules/ret/dist/types/index.js
var require_types = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		Object.defineProperty(o, k2, {
			enumerable: true,
			get: function() {
				return m[k];
			}
		});
	}) : (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		o[k2] = m[k];
	}));
	var __exportStar = exports && exports.__exportStar || function(m, exports$2) {
		for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports$2, p)) __createBinding(exports$2, m, p);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	__exportStar(require_tokens(), exports);
	__exportStar(require_types$1(), exports);
	__exportStar(require_set_lookup(), exports);
}));
//#endregion
//#region ../../node_modules/.bun/ret@0.5.0/node_modules/ret/dist/sets.js
var require_sets = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.anyChar = exports.notWhitespace = exports.whitespace = exports.notInts = exports.ints = exports.notWords = exports.words = void 0;
	const types_1 = require_types();
	const INTS = () => [{
		type: types_1.types.RANGE,
		from: 48,
		to: 57
	}];
	const WORDS = () => [
		{
			type: types_1.types.CHAR,
			value: 95
		},
		{
			type: types_1.types.RANGE,
			from: 97,
			to: 122
		},
		{
			type: types_1.types.RANGE,
			from: 65,
			to: 90
		},
		{
			type: types_1.types.RANGE,
			from: 48,
			to: 57
		}
	];
	const WHITESPACE = () => [
		{
			type: types_1.types.CHAR,
			value: 9
		},
		{
			type: types_1.types.CHAR,
			value: 10
		},
		{
			type: types_1.types.CHAR,
			value: 11
		},
		{
			type: types_1.types.CHAR,
			value: 12
		},
		{
			type: types_1.types.CHAR,
			value: 13
		},
		{
			type: types_1.types.CHAR,
			value: 32
		},
		{
			type: types_1.types.CHAR,
			value: 160
		},
		{
			type: types_1.types.CHAR,
			value: 5760
		},
		{
			type: types_1.types.RANGE,
			from: 8192,
			to: 8202
		},
		{
			type: types_1.types.CHAR,
			value: 8232
		},
		{
			type: types_1.types.CHAR,
			value: 8233
		},
		{
			type: types_1.types.CHAR,
			value: 8239
		},
		{
			type: types_1.types.CHAR,
			value: 8287
		},
		{
			type: types_1.types.CHAR,
			value: 12288
		},
		{
			type: types_1.types.CHAR,
			value: 65279
		}
	];
	const NOTANYCHAR = () => [
		{
			type: types_1.types.CHAR,
			value: 10
		},
		{
			type: types_1.types.CHAR,
			value: 13
		},
		{
			type: types_1.types.CHAR,
			value: 8232
		},
		{
			type: types_1.types.CHAR,
			value: 8233
		}
	];
	exports.words = () => ({
		type: types_1.types.SET,
		set: WORDS(),
		not: false
	});
	exports.notWords = () => ({
		type: types_1.types.SET,
		set: WORDS(),
		not: true
	});
	exports.ints = () => ({
		type: types_1.types.SET,
		set: INTS(),
		not: false
	});
	exports.notInts = () => ({
		type: types_1.types.SET,
		set: INTS(),
		not: true
	});
	exports.whitespace = () => ({
		type: types_1.types.SET,
		set: WHITESPACE(),
		not: false
	});
	exports.notWhitespace = () => ({
		type: types_1.types.SET,
		set: WHITESPACE(),
		not: true
	});
	exports.anyChar = () => ({
		type: types_1.types.SET,
		set: NOTANYCHAR(),
		not: true
	});
}));
//#endregion
//#region ../../node_modules/.bun/ret@0.5.0/node_modules/ret/dist/util.js
var require_util = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		Object.defineProperty(o, k2, {
			enumerable: true,
			get: function() {
				return m[k];
			}
		});
	}) : (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		o[k2] = m[k];
	}));
	var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? (function(o, v) {
		Object.defineProperty(o, "default", {
			enumerable: true,
			value: v
		});
	}) : function(o, v) {
		o["default"] = v;
	});
	var __importStar = exports && exports.__importStar || function(mod) {
		if (mod && mod.__esModule) return mod;
		var result = {};
		if (mod != null) {
			for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
		}
		__setModuleDefault(result, mod);
		return result;
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.tokenizeClass = exports.strToChars = void 0;
	const types_1 = require_types();
	const sets = __importStar(require_sets());
	const CTRL = "@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^ ?";
	/**
	* Finds character representations in str and convert all to
	* their respective characters.
	*
	* @param {string} str
	* @returns {string}
	*/
	exports.strToChars = (str) => {
		return str.replace(/(\[\\b\])|(\\)?\\(?:u([A-F0-9]{4})|x([A-F0-9]{2})|c([@A-Z[\\\]^?])|([0tnvfr]))/g, (s, b, lbs, a16, b16, dctrl, eslsh) => {
			if (lbs) return s;
			let code = b ? 8 : a16 ? parseInt(a16, 16) : b16 ? parseInt(b16, 16) : dctrl ? CTRL.indexOf(dctrl) : {
				0: 0,
				t: 9,
				n: 10,
				v: 11,
				f: 12,
				r: 13
			}[eslsh];
			let c = String.fromCharCode(code);
			return /[[\]{}^$.|?*+()]/.test(c) ? `\\${c}` : c;
		});
	};
	/**
	* Turns class into tokens
	* reads str until it encounters a ] not preceeded by a \
	*
	* @param {string} str
	* @param {string} regexpStr
	* @returns {Array.<Array.<Object>, number>}
	*/
	exports.tokenizeClass = (str, regexpStr) => {
		var _a, _b, _c, _d, _e, _f, _g;
		let tokens = [], rs, c;
		const regexp = /\\(?:(w)|(d)|(s)|(W)|(D)|(S))|((?:(?:\\)(.)|([^\]\\]))-(((?:\\)])|(((?:\\)?([^\]])))))|(\])|(?:\\)?([^])/g;
		while ((rs = regexp.exec(str)) !== null) {
			const p = (_g = (_f = (_e = (_d = (_c = (_b = (_a = rs[1] && sets.words()) !== null && _a !== void 0 ? _a : rs[2] && sets.ints()) !== null && _b !== void 0 ? _b : rs[3] && sets.whitespace()) !== null && _c !== void 0 ? _c : rs[4] && sets.notWords()) !== null && _d !== void 0 ? _d : rs[5] && sets.notInts()) !== null && _e !== void 0 ? _e : rs[6] && sets.notWhitespace()) !== null && _f !== void 0 ? _f : rs[7] && {
				type: types_1.types.RANGE,
				from: (rs[8] || rs[9]).charCodeAt(0),
				to: (c = rs[10]).charCodeAt(c.length - 1)
			}) !== null && _g !== void 0 ? _g : (c = rs[16]) && {
				type: types_1.types.CHAR,
				value: c.charCodeAt(0)
			};
			if (p) tokens.push(p);
			else return [tokens, regexp.lastIndex];
		}
		throw new SyntaxError(`Invalid regular expression: /${regexpStr}/: Unterminated character class`);
	};
}));
//#endregion
//#region ../../node_modules/.bun/ret@0.5.0/node_modules/ret/dist/tokenizer.js
var require_tokenizer = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		Object.defineProperty(o, k2, {
			enumerable: true,
			get: function() {
				return m[k];
			}
		});
	}) : (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		o[k2] = m[k];
	}));
	var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? (function(o, v) {
		Object.defineProperty(o, "default", {
			enumerable: true,
			value: v
		});
	}) : function(o, v) {
		o["default"] = v;
	});
	var __importStar = exports && exports.__importStar || function(mod) {
		if (mod && mod.__esModule) return mod;
		var result = {};
		if (mod != null) {
			for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
		}
		__setModuleDefault(result, mod);
		return result;
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.tokenizer = void 0;
	const util = __importStar(require_util());
	const types_1 = require_types();
	const sets = __importStar(require_sets());
	/**
	* Valid opening characters for capture group names.
	*/
	const captureGroupFirstChar = /^[a-zA-Z_$]$/i;
	/**
	* Valid characters for capture group names.
	*/
	const captureGroupChars = /^[a-zA-Z0-9_$]$/i;
	const digit = /\d/;
	/**
	* Tokenizes a regular expression (that is currently a string)
	* @param {string} regexpStr String of regular expression to be tokenized
	*
	* @returns {Root}
	*/
	exports.tokenizer = (regexpStr) => {
		let i = 0, c;
		let start = {
			type: types_1.types.ROOT,
			stack: []
		};
		let lastGroup = start;
		let last = start.stack;
		let groupStack = [];
		let referenceQueue = [];
		let groupCount = 0;
		const repeatErr = (col) => {
			throw new SyntaxError(`Invalid regular expression: /${regexpStr}/: Nothing to repeat at column ${col - 1}`);
		};
		let str = util.strToChars(regexpStr);
		while (i < str.length) switch (c = str[i++]) {
			case "\\":
				if (i === str.length) throw new SyntaxError(`Invalid regular expression: /${regexpStr}/: \\ at end of pattern`);
				switch (c = str[i++]) {
					case "b":
						last.push({
							type: types_1.types.POSITION,
							value: "b"
						});
						break;
					case "B":
						last.push({
							type: types_1.types.POSITION,
							value: "B"
						});
						break;
					case "w":
						last.push(sets.words());
						break;
					case "W":
						last.push(sets.notWords());
						break;
					case "d":
						last.push(sets.ints());
						break;
					case "D":
						last.push(sets.notInts());
						break;
					case "s":
						last.push(sets.whitespace());
						break;
					case "S":
						last.push(sets.notWhitespace());
						break;
					default: if (digit.test(c)) {
						let digits = c;
						while (i < str.length && digit.test(str[i])) digits += str[i++];
						let value = parseInt(digits, 10);
						const reference = {
							type: types_1.types.REFERENCE,
							value
						};
						last.push(reference);
						referenceQueue.push({
							reference,
							stack: last,
							index: last.length - 1
						});
					} else last.push({
						type: types_1.types.CHAR,
						value: c.charCodeAt(0)
					});
				}
				break;
			case "^":
				last.push({
					type: types_1.types.POSITION,
					value: "^"
				});
				break;
			case "$":
				last.push({
					type: types_1.types.POSITION,
					value: "$"
				});
				break;
			case "[": {
				let not;
				if (str[i] === "^") {
					not = true;
					i++;
				} else not = false;
				let classTokens = util.tokenizeClass(str.slice(i), regexpStr);
				i += classTokens[1];
				last.push({
					type: types_1.types.SET,
					set: classTokens[0],
					not
				});
				break;
			}
			case ".":
				last.push(sets.anyChar());
				break;
			case "(": {
				let group = {
					type: types_1.types.GROUP,
					stack: [],
					remember: true
				};
				if (str[i] === "?") {
					c = str[i + 1];
					i += 2;
					if (c === "=") {
						group.followedBy = true;
						group.remember = false;
					} else if (c === "!") {
						group.notFollowedBy = true;
						group.remember = false;
					} else if (c === "<") {
						let name = "";
						if (captureGroupFirstChar.test(str[i])) {
							name += str[i];
							i++;
						} else throw new SyntaxError(`Invalid regular expression: /${regexpStr}/: Invalid capture group name, character '${str[i]}' after '<' at column ${i + 1}`);
						while (i < str.length && captureGroupChars.test(str[i])) {
							name += str[i];
							i++;
						}
						if (!name) throw new SyntaxError(`Invalid regular expression: /${regexpStr}/: Invalid capture group name, character '${str[i]}' after '<' at column ${i + 1}`);
						if (str[i] !== ">") throw new SyntaxError(`Invalid regular expression: /${regexpStr}/: Unclosed capture group name, expected '>', found '${str[i]}' at column ${i + 1}`);
						group.name = name;
						i++;
					} else if (c === ":") group.remember = false;
					else throw new SyntaxError(`Invalid regular expression: /${regexpStr}/: Invalid group, character '${c}' after '?' at column ${i - 1}`);
				} else groupCount += 1;
				last.push(group);
				groupStack.push(lastGroup);
				lastGroup = group;
				last = group.stack;
				break;
			}
			case ")":
				if (groupStack.length === 0) throw new SyntaxError(`Invalid regular expression: /${regexpStr}/: Unmatched ) at column ${i - 1}`);
				lastGroup = groupStack.pop();
				last = lastGroup.options ? lastGroup.options[lastGroup.options.length - 1] : lastGroup.stack;
				break;
			case "|": {
				if (!lastGroup.options) {
					lastGroup.options = [lastGroup.stack];
					delete lastGroup.stack;
				}
				let stack = [];
				lastGroup.options.push(stack);
				last = stack;
				break;
			}
			case "{": {
				let rs = /^(\d+)(,(\d+)?)?\}/.exec(str.slice(i)), min, max;
				if (rs !== null) {
					if (last.length === 0) repeatErr(i);
					min = parseInt(rs[1], 10);
					max = rs[2] ? rs[3] ? parseInt(rs[3], 10) : Infinity : min;
					i += rs[0].length;
					last.push({
						type: types_1.types.REPETITION,
						min,
						max,
						value: last.pop()
					});
				} else last.push({
					type: types_1.types.CHAR,
					value: 123
				});
				break;
			}
			case "?":
				if (last.length === 0) repeatErr(i);
				last.push({
					type: types_1.types.REPETITION,
					min: 0,
					max: 1,
					value: last.pop()
				});
				break;
			case "+":
				if (last.length === 0) repeatErr(i);
				last.push({
					type: types_1.types.REPETITION,
					min: 1,
					max: Infinity,
					value: last.pop()
				});
				break;
			case "*":
				if (last.length === 0) repeatErr(i);
				last.push({
					type: types_1.types.REPETITION,
					min: 0,
					max: Infinity,
					value: last.pop()
				});
				break;
			default: last.push({
				type: types_1.types.CHAR,
				value: c.charCodeAt(0)
			});
		}
		if (groupStack.length !== 0) throw new SyntaxError(`Invalid regular expression: /${regexpStr}/: Unterminated group`);
		updateReferences(referenceQueue, groupCount);
		return start;
	};
	/**
	* This is a side effecting function that changes references to chars
	* if there are not enough capturing groups to reference
	* See: https://github.com/fent/ret.js/pull/39#issuecomment-1006475703
	* See: https://github.com/fent/ret.js/issues/38
	* @param {(Reference | Char)[]} referenceQueue
	* @param {number} groupCount
	* @returns {void}
	*/
	function updateReferences(referenceQueue, groupCount) {
		for (const elem of referenceQueue.reverse()) if (groupCount < elem.reference.value) {
			elem.reference.type = types_1.types.CHAR;
			const valueString = elem.reference.value.toString();
			elem.reference.value = parseInt(valueString, 8);
			if (!/^[0-7]+$/.test(valueString)) {
				let i = 0;
				while (valueString[i] !== "8" && valueString[i] !== "9") i += 1;
				if (i === 0) {
					elem.reference.value = valueString.charCodeAt(0);
					i += 1;
				} else elem.reference.value = parseInt(valueString.slice(0, i), 8);
				if (valueString.length > i) {
					const tail = elem.stack.splice(elem.index + 1);
					for (const char of valueString.slice(i)) elem.stack.push({
						type: types_1.types.CHAR,
						value: char.charCodeAt(0)
					});
					elem.stack.push(...tail);
				}
			}
		}
	}
}));
//#endregion
//#region ../../node_modules/.bun/ret@0.5.0/node_modules/ret/dist/sets-lookup.js
var require_sets_lookup = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		Object.defineProperty(o, k2, {
			enumerable: true,
			get: function() {
				return m[k];
			}
		});
	}) : (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		o[k2] = m[k];
	}));
	var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? (function(o, v) {
		Object.defineProperty(o, "default", {
			enumerable: true,
			value: v
		});
	}) : function(o, v) {
		o["default"] = v;
	});
	var __importStar = exports && exports.__importStar || function(mod) {
		if (mod && mod.__esModule) return mod;
		var result = {};
		if (mod != null) {
			for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
		}
		__setModuleDefault(result, mod);
		return result;
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.NOTANYCHAR = exports.WHITESPACE = exports.WORDS = exports.INTS = void 0;
	const Sets = __importStar(require_sets());
	const types_1 = require_types();
	function setToLookup(tokens) {
		let lookup = {};
		let len = 0;
		for (const token of tokens) {
			if (token.type === types_1.types.CHAR) lookup[token.value] = true;
			if (token.type === types_1.types.RANGE) lookup[`${token.from}-${token.to}`] = true;
			len += 1;
		}
		return {
			lookup: () => Object.assign({}, lookup),
			len
		};
	}
	exports.INTS = setToLookup(Sets.ints().set);
	exports.WORDS = setToLookup(Sets.words().set);
	exports.WHITESPACE = setToLookup(Sets.whitespace().set);
	exports.NOTANYCHAR = setToLookup(Sets.anyChar().set);
}));
//#endregion
//#region ../../node_modules/.bun/ret@0.5.0/node_modules/ret/dist/write-set-tokens.js
var require_write_set_tokens = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		Object.defineProperty(o, k2, {
			enumerable: true,
			get: function() {
				return m[k];
			}
		});
	}) : (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		o[k2] = m[k];
	}));
	var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? (function(o, v) {
		Object.defineProperty(o, "default", {
			enumerable: true,
			value: v
		});
	}) : function(o, v) {
		o["default"] = v;
	});
	var __importStar = exports && exports.__importStar || function(mod) {
		if (mod && mod.__esModule) return mod;
		var result = {};
		if (mod != null) {
			for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
		}
		__setModuleDefault(result, mod);
		return result;
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.writeSetTokens = exports.setChar = void 0;
	const types_1 = require_types();
	const sets = __importStar(require_sets_lookup());
	/**
	* Takes character code and returns character to be displayed in a set
	* @param {number} charCode Character code of set element
	* @returns {string} The string for the sets character
	*/
	function setChar(charCode) {
		return charCode === 94 ? "\\^" : charCode === 92 ? "\\\\" : charCode === 93 ? "\\]" : charCode === 45 ? "\\-" : String.fromCharCode(charCode);
	}
	exports.setChar = setChar;
	/**
	* Test if a character set matches a 'set-lookup'
	* @param {SetTokens} set The set to be tested
	* @param {SetLookup} param The predefined 'set-lookup' & the number of elements in the lookup
	* @returns {boolean} True if the character set corresponds to the 'set-lookup'
	*/
	function isSameSet(set, { lookup, len }) {
		if (len !== set.length) return false;
		const map = lookup();
		for (const elem of set) {
			if (elem.type === types_1.types.SET) return false;
			const key = elem.type === types_1.types.CHAR ? elem.value : `${elem.from}-${elem.to}`;
			if (map[key]) map[key] = false;
			else return false;
		}
		return true;
	}
	/**
	* Writes the tokens for a set
	* @param {Set} set The set to display
	* @param {boolean} isNested Whether the token is nested inside another set token
	* @returns {string} The tokens for the set
	*/
	function writeSetTokens(set, isNested = false) {
		if (isSameSet(set.set, sets.INTS)) return set.not ? "\\D" : "\\d";
		if (isSameSet(set.set, sets.WORDS)) return set.not ? "\\W" : "\\w";
		if (set.not && isSameSet(set.set, sets.NOTANYCHAR)) return ".";
		if (isSameSet(set.set, sets.WHITESPACE)) return set.not ? "\\S" : "\\s";
		let tokenString = "";
		for (let i = 0; i < set.set.length; i++) {
			const subset = set.set[i];
			tokenString += writeSetToken(subset);
		}
		const contents = `${set.not ? "^" : ""}${tokenString}`;
		return isNested ? contents : `[${contents}]`;
	}
	exports.writeSetTokens = writeSetTokens;
	/**
	* Writes a token within a set
	* @param {Range | Char | Set} set The set token to display
	* @returns {string} The token as a string
	*/
	function writeSetToken(set) {
		if (set.type === types_1.types.CHAR) return setChar(set.value);
		else if (set.type === types_1.types.RANGE) return `${setChar(set.from)}-${setChar(set.to)}`;
		return writeSetTokens(set, true);
	}
}));
//#endregion
//#region ../../node_modules/.bun/ret@0.5.0/node_modules/ret/dist/reconstruct.js
var require_reconstruct = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.reconstruct = void 0;
	const types_1 = require_types();
	const write_set_tokens_1 = require_write_set_tokens();
	const reduceStack = (stack) => stack.map(exports.reconstruct).join("");
	const createAlternate = (token) => {
		if ("options" in token) return token.options.map(reduceStack).join("|");
		else if ("stack" in token) return reduceStack(token.stack);
		else throw new Error(`options or stack must be Root or Group token`);
	};
	exports.reconstruct = (token) => {
		switch (token.type) {
			case types_1.types.ROOT: return createAlternate(token);
			case types_1.types.CHAR: {
				const c = String.fromCharCode(token.value);
				return (/[[\\{}$^.|?*+()]/.test(c) ? "\\" : "") + c;
			}
			case types_1.types.POSITION: if (token.value === "^" || token.value === "$") return token.value;
			else return `\\${token.value}`;
			case types_1.types.REFERENCE: return `\\${token.value}`;
			case types_1.types.SET: return write_set_tokens_1.writeSetTokens(token);
			case types_1.types.GROUP: return `(${token.name ? `?<${token.name}>` : token.remember ? "" : token.followedBy ? "?=" : token.notFollowedBy ? "?!" : "?:"}${createAlternate(token)})`;
			case types_1.types.REPETITION: {
				const { min, max } = token;
				let endWith;
				if (min === 0 && max === 1) endWith = "?";
				else if (min === 1 && max === Infinity) endWith = "+";
				else if (min === 0 && max === Infinity) endWith = "*";
				else if (max === Infinity) endWith = `{${min},}`;
				else if (min === max) endWith = `{${min}}`;
				else endWith = `{${min},${max}}`;
				return `${exports.reconstruct(token.value)}${endWith}`;
			}
			case types_1.types.RANGE: return `${write_set_tokens_1.setChar(token.from)}-${write_set_tokens_1.setChar(token.to)}`;
			default: throw new Error(`Invalid token type ${token}`);
		}
	};
}));
//#endregion
//#region ../../node_modules/.bun/ret@0.5.0/node_modules/ret/dist/index.js
var require_dist = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		Object.defineProperty(o, k2, {
			enumerable: true,
			get: function() {
				return m[k];
			}
		});
	}) : (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		o[k2] = m[k];
	}));
	var __exportStar = exports && exports.__exportStar || function(m, exports$1) {
		for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports$1, p)) __createBinding(exports$1, m, p);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.types = void 0;
	/* istanbul ignore file */
	const types_1 = require_types();
	Object.defineProperty(exports, "types", {
		enumerable: true,
		get: function() {
			return types_1.types;
		}
	});
	__exportStar(require_tokenizer(), exports);
	__exportStar(require_reconstruct(), exports);
	const tokenizer_1 = require_tokenizer();
	const reconstruct_1 = require_reconstruct();
	__exportStar(require_types(), exports);
	exports.default = tokenizer_1.tokenizer;
	module.exports = tokenizer_1.tokenizer;
	module.exports.types = types_1.types;
	module.exports.reconstruct = reconstruct_1.reconstruct;
}));
//#endregion
//#region ../../node_modules/.bun/safe-regex2@5.1.0/node_modules/safe-regex2/index.js
var require_safe_regex2 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const parse = require_dist();
	const { types } = require_dist();
	/**
	* @param {*} node
	* @param {object} opts
	* @param {number} opts.reps - The number of repetitions encountered
	* @param {number} opts.limit - The maximum number of repetitions allowed
	* @param {number} starHeight - The current height of the star in the regex tree
	* @returns {boolean}
	*/
	function walk(node, opts, starHeight) {
		let i;
		let ok;
		let len;
		if (node.type === types.REPETITION) {
			starHeight++;
			opts.reps++;
			if (starHeight > 1) return false;
			if (opts.reps > opts.limit) return false;
		}
		if (node.options) for (i = 0, len = node.options.length; i < len; i++) {
			ok = walk({ stack: node.options[i] }, opts, starHeight);
			if (!ok) return false;
		}
		const stack = node.stack || node.value?.stack;
		if (!stack) return true;
		for (i = 0, len = stack.length; i < len; i++) {
			ok = walk(stack[i], opts, starHeight);
			if (!ok) return false;
		}
		return true;
	}
	/**
	* @param {string|RegExp} re - The regular expression to check, can be a string or RegExp object
	* @param {object} [options]
	* @param {number} [options.limit=25] - The maximum number of repetitions allowed
	* @returns {boolean} - Returns true if the regex is safe, false if it is unsafe or invalid
	*/
	function safeRegex(re, options) {
		const opts = {
			reps: 0,
			limit: options?.limit ?? 25
		};
		if (isRegExp(re)) re = re.source;
		else if (typeof re !== "string") re = String(re);
		try {
			return walk(parse(re), opts, 0);
		} catch {
			return false;
		}
	}
	/**
	* @param {*} x
	* @returns {x is RegExp}
	*/
	function isRegExp(x) {
		return Object.prototype.toString.call(x) === "[object RegExp]";
	}
	module.exports = safeRegex;
	module.exports.default = safeRegex;
	module.exports.safeRegex = safeRegex;
}));
//#endregion
//#region ../../node_modules/.bun/find-my-way@9.5.0/node_modules/find-my-way/lib/strategies/http-method.js
var require_http_method = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = {
		name: "__fmw_internal_strategy_merged_tree_http_method__",
		storage: function() {
			const handlers = /* @__PURE__ */ new Map();
			return {
				get: (type) => {
					return handlers.get(type) || null;
				},
				set: (type, store) => {
					handlers.set(type, store);
				}
			};
		},
		deriveConstraint: (req) => req.method,
		mustMatchWhenDerived: true
	};
}));
//#endregion
//#region ../../node_modules/.bun/find-my-way@9.5.0/node_modules/find-my-way/lib/pretty-print.js
var require_pretty_print = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const deepEqual = require_fast_deep_equal();
	const httpMethodStrategy = require_http_method();
	const treeDataSymbol = Symbol("treeData");
	function printObjectTree(obj, parentPrefix = "") {
		let tree = "";
		const keys = Object.keys(obj);
		for (let i = 0; i < keys.length; i++) {
			const key = keys[i];
			const value = obj[key];
			const isLast = i === keys.length - 1;
			const nodePrefix = isLast ? "└── " : "├── ";
			const childPrefix = isLast ? "    " : "│   ";
			const prefixedNodeData = (value[treeDataSymbol] || "").replaceAll("\n", "\n" + parentPrefix + childPrefix);
			tree += parentPrefix + nodePrefix + key + prefixedNodeData + "\n";
			tree += printObjectTree(value, parentPrefix + childPrefix);
		}
		return tree;
	}
	function parseFunctionName(fn) {
		let fName = fn.name || "";
		fName = fName.replace("bound", "").trim();
		fName = (fName || "anonymous") + "()";
		return fName;
	}
	function parseMeta(meta) {
		if (Array.isArray(meta)) return meta.map((m) => parseMeta(m));
		if (typeof meta === "symbol") return meta.toString();
		if (typeof meta === "function") return parseFunctionName(meta);
		return meta;
	}
	function getRouteMetaData(route, options) {
		if (!options.includeMeta) return {};
		const metaDataObject = options.buildPrettyMeta(route);
		const filteredMetaData = {};
		let includeMetaKeys = options.includeMeta;
		if (!Array.isArray(includeMetaKeys)) includeMetaKeys = Reflect.ownKeys(metaDataObject);
		for (const metaKey of includeMetaKeys) {
			if (!Object.prototype.hasOwnProperty.call(metaDataObject, metaKey)) continue;
			const serializedKey = metaKey.toString();
			const metaValue = metaDataObject[metaKey];
			if (metaValue !== void 0 && metaValue !== null) filteredMetaData[serializedKey] = JSON.stringify(parseMeta(metaValue));
		}
		return filteredMetaData;
	}
	function serializeMetaData(metaData) {
		let serializedMetaData = "";
		for (const [key, value] of Object.entries(metaData)) serializedMetaData += `\n• (${key}) ${value}`;
		return serializedMetaData;
	}
	function normalizeRoute(route) {
		const constraints = { ...route.opts.constraints };
		const method = constraints[httpMethodStrategy.name];
		delete constraints[httpMethodStrategy.name];
		return {
			...route,
			method,
			opts: { constraints }
		};
	}
	function serializeRoute(route) {
		let serializedRoute = ` (${route.method})`;
		const constraints = route.opts.constraints || {};
		if (Object.keys(constraints).length !== 0) serializedRoute += " " + JSON.stringify(constraints);
		serializedRoute += serializeMetaData(route.metaData);
		return serializedRoute;
	}
	function mergeSimilarRoutes(routes) {
		return routes.reduce((mergedRoutes, route) => {
			for (const nodeRoute of mergedRoutes) if (deepEqual(route.opts.constraints, nodeRoute.opts.constraints) && deepEqual(route.metaData, nodeRoute.metaData)) {
				nodeRoute.method += ", " + route.method;
				return mergedRoutes;
			}
			mergedRoutes.push(route);
			return mergedRoutes;
		}, []);
	}
	function serializeNode(node, prefix, options) {
		let routes = node.routes;
		if (options.method === void 0) routes = routes.map(normalizeRoute);
		routes = routes.map((route) => {
			route.metaData = getRouteMetaData(route, options);
			return route;
		});
		if (options.method === void 0) routes = mergeSimilarRoutes(routes);
		return routes.map(serializeRoute).join(`\n${prefix}`);
	}
	function buildObjectTree(node, tree, prefix, options) {
		if (node.isLeafNode || options.commonPrefix !== false) {
			prefix = prefix || "(empty root node)";
			tree = tree[prefix] = {};
			if (node.isLeafNode) tree[treeDataSymbol] = serializeNode(node, prefix, options);
			prefix = "";
		}
		if (node.staticChildren) for (const child of Object.values(node.staticChildren)) buildObjectTree(child, tree, prefix + child.prefix, options);
		if (node.parametricChildren) for (const child of Object.values(node.parametricChildren)) {
			const childPrefix = Array.from(child.nodePaths).join("|");
			buildObjectTree(child, tree, prefix + childPrefix, options);
		}
		if (node.wildcardChild) buildObjectTree(node.wildcardChild, tree, "*", options);
	}
	function prettyPrintTree(root, options) {
		const objectTree = {};
		buildObjectTree(root, objectTree, root.prefix, options);
		return printObjectTree(objectTree);
	}
	module.exports = { prettyPrintTree };
}));
//#endregion
//#region ../../node_modules/.bun/find-my-way@9.5.0/node_modules/find-my-way/lib/null-object.js
var require_null_object = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const NullObject = function() {};
	NullObject.prototype = Object.create(null);
	module.exports = { NullObject };
}));
//#endregion
//#region ../../node_modules/.bun/find-my-way@9.5.0/node_modules/find-my-way/lib/handler-storage.js
var require_handler_storage = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { NullObject } = require_null_object();
	const httpMethodStrategy = require_http_method();
	var HandlerStorage = class {
		constructor() {
			this.unconstrainedHandler = null;
			this.constraints = [];
			this.handlers = [];
			this.constrainedHandlerStores = null;
		}
		getMatchingHandler(derivedConstraints) {
			if (derivedConstraints === void 0) return this.unconstrainedHandler;
			return this._getHandlerMatchingConstraints(derivedConstraints);
		}
		addHandler(constrainer, route) {
			const params = route.params;
			const constraints = route.opts.constraints || {};
			const handlerObject = {
				params,
				constraints,
				handler: route.handler,
				store: route.store || null,
				_createParamsObject: this._compileCreateParamsObject(params)
			};
			const constraintsNames = Object.keys(constraints);
			if (constraintsNames.length === 0) this.unconstrainedHandler = handlerObject;
			for (const constraint of constraintsNames) if (!this.constraints.includes(constraint)) if (constraint === "version") this.constraints.unshift(constraint);
			else this.constraints.push(constraint);
			const isMergedTree = constraintsNames.includes(httpMethodStrategy.name);
			if (!isMergedTree && this.handlers.length >= 31) throw new Error("find-my-way supports a maximum of 31 route handlers per node when there are constraints, limit reached");
			this.handlers.push(handlerObject);
			this.handlers.sort((a, b) => Object.keys(a.constraints).length - Object.keys(b.constraints).length);
			if (!isMergedTree) this._compileGetHandlerMatchingConstraints(constrainer, constraints);
		}
		_compileCreateParamsObject(params) {
			const fnBody = [];
			fnBody.push("const fn = function _createParamsObject (paramsArray) {");
			fnBody.push("const params = new NullObject()");
			for (let i = 0; i < params.length; i++) fnBody.push(`params['${params[i]}'] = paramsArray[${i}]`);
			fnBody.push("return params");
			fnBody.push("}");
			fnBody.push("return fn");
			return new Function("NullObject", fnBody.join("\n"))(NullObject);
		}
		_getHandlerMatchingConstraints() {
			return null;
		}
		_buildConstraintStore(store, constraint) {
			for (let i = 0; i < this.handlers.length; i++) {
				const constraintValue = this.handlers[i].constraints[constraint];
				if (constraintValue !== void 0) {
					let indexes = store.get(constraintValue) || 0;
					indexes |= 1 << i;
					store.set(constraintValue, indexes);
				}
			}
		}
		_constrainedIndexBitmask(constraint) {
			let mask = 0;
			for (let i = 0; i < this.handlers.length; i++) if (this.handlers[i].constraints[constraint] !== void 0) mask |= 1 << i;
			return ~mask;
		}
		_compileGetHandlerMatchingConstraints(constrainer) {
			this.constrainedHandlerStores = {};
			for (const constraint of this.constraints) {
				const store = constrainer.newStoreForConstraint(constraint);
				this.constrainedHandlerStores[constraint] = store;
				this._buildConstraintStore(store, constraint);
			}
			const lines = [];
			lines.push(`
    let candidates = ${(1 << this.handlers.length) - 1}
    let mask, matches
    `);
			for (const constraint of this.constraints) {
				lines.push(`
      mask = ${this._constrainedIndexBitmask(constraint)}
      value = derivedConstraints.${constraint}
      `);
				const matchMask = constrainer.strategies[constraint].mustMatchWhenDerived ? "matches" : "(matches | mask)";
				lines.push(`
      if (value === undefined) {
        candidates &= mask
      } else {
        matches = this.constrainedHandlerStores.${constraint}.get(value) || 0
        candidates &= ${matchMask}
      }
      if (candidates === 0) return null;
      `);
			}
			for (const constraint in constrainer.strategies) {
				if (!Object.hasOwn(constrainer.strategies, constraint)) continue;
				if (constrainer.strategies[constraint].mustMatchWhenDerived && !this.constraints.includes(constraint)) lines.push(`if (derivedConstraints.${constraint} !== undefined) return null`);
			}
			lines.push("return this.handlers[Math.floor(Math.log2(candidates))]");
			this._getHandlerMatchingConstraints = new Function("derivedConstraints", lines.join("\n"));
		}
	};
	module.exports = HandlerStorage;
}));
//#endregion
//#region ../../node_modules/.bun/find-my-way@9.5.0/node_modules/find-my-way/lib/node.js
var require_node = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const HandlerStorage = require_handler_storage();
	const NODE_TYPES = {
		STATIC: 0,
		PARAMETRIC: 1,
		WILDCARD: 2
	};
	var Node = class {
		constructor() {
			this.isLeafNode = false;
			this.routes = null;
			this.handlerStorage = null;
		}
		addRoute(route, constrainer) {
			if (this.routes === null) this.routes = [];
			if (this.handlerStorage === null) this.handlerStorage = new HandlerStorage();
			this.isLeafNode = true;
			this.routes.push(route);
			this.handlerStorage.addHandler(constrainer, route);
		}
	};
	var ParentNode = class extends Node {
		constructor() {
			super();
			this.staticChildren = {};
		}
		findStaticMatchingChild(path, pathIndex) {
			const staticChild = this.staticChildren[path.charAt(pathIndex)];
			if (staticChild === void 0 || !staticChild.matchPrefix(path, pathIndex)) return null;
			return staticChild;
		}
		getStaticChild(path, pathIndex = 0) {
			if (path.length === pathIndex) return this;
			const staticChild = this.findStaticMatchingChild(path, pathIndex);
			if (staticChild) return staticChild.getStaticChild(path, pathIndex + staticChild.prefix.length);
			return null;
		}
		createStaticChild(path) {
			if (path.length === 0) return this;
			let staticChild = this.staticChildren[path.charAt(0)];
			if (staticChild) {
				let i = 1;
				for (; i < staticChild.prefix.length; i++) if (path.charCodeAt(i) !== staticChild.prefix.charCodeAt(i)) {
					staticChild = staticChild.split(this, i);
					break;
				}
				return staticChild.createStaticChild(path.slice(i));
			}
			const label = path.charAt(0);
			this.staticChildren[label] = new StaticNode(path);
			return this.staticChildren[label];
		}
	};
	var StaticNode = class StaticNode extends ParentNode {
		constructor(prefix) {
			super();
			this.prefix = prefix;
			this.wildcardChild = null;
			this.parametricChildren = [];
			this.kind = NODE_TYPES.STATIC;
			this._compilePrefixMatch();
		}
		getParametricChild(regex) {
			const regexpSource = regex && regex.source;
			const parametricChild = this.parametricChildren.find((child) => {
				return (child.regex && child.regex.source) === regexpSource;
			});
			if (parametricChild) return parametricChild;
			return null;
		}
		createParametricChild(regex, staticSuffix, nodePath) {
			let parametricChild = this.getParametricChild(regex);
			if (parametricChild) {
				parametricChild.nodePaths.add(nodePath);
				return parametricChild;
			}
			parametricChild = new ParametricNode(regex, staticSuffix, nodePath);
			this.parametricChildren.push(parametricChild);
			this.parametricChildren.sort((child1, child2) => {
				if (!child1.isRegex) return 1;
				if (!child2.isRegex) return -1;
				if (child1.staticSuffix === null) return 1;
				if (child2.staticSuffix === null) return -1;
				if (child2.staticSuffix.endsWith(child1.staticSuffix)) return 1;
				if (child1.staticSuffix.endsWith(child2.staticSuffix)) return -1;
				return 0;
			});
			return parametricChild;
		}
		getWildcardChild() {
			return this.wildcardChild;
		}
		createWildcardChild() {
			this.wildcardChild = this.getWildcardChild() || new WildcardNode();
			return this.wildcardChild;
		}
		split(parentNode, length) {
			const parentPrefix = this.prefix.slice(0, length);
			const childPrefix = this.prefix.slice(length);
			this.prefix = childPrefix;
			this._compilePrefixMatch();
			const staticNode = new StaticNode(parentPrefix);
			staticNode.staticChildren[childPrefix.charAt(0)] = this;
			parentNode.staticChildren[parentPrefix.charAt(0)] = staticNode;
			return staticNode;
		}
		getNextNode(path, pathIndex, nodeStack, paramsCount) {
			let node = this.findStaticMatchingChild(path, pathIndex);
			let parametricBrotherNodeIndex = 0;
			if (node === null) {
				if (this.parametricChildren.length === 0) return this.wildcardChild;
				node = this.parametricChildren[0];
				parametricBrotherNodeIndex = 1;
			}
			if (this.wildcardChild !== null) nodeStack.push({
				paramsCount,
				brotherPathIndex: pathIndex,
				brotherNode: this.wildcardChild
			});
			for (let i = this.parametricChildren.length - 1; i >= parametricBrotherNodeIndex; i--) nodeStack.push({
				paramsCount,
				brotherPathIndex: pathIndex,
				brotherNode: this.parametricChildren[i]
			});
			return node;
		}
		_compilePrefixMatch() {
			if (this.prefix.length === 1) {
				this.matchPrefix = () => true;
				return;
			}
			const lines = [];
			for (let i = 1; i < this.prefix.length; i++) {
				const charCode = this.prefix.charCodeAt(i);
				lines.push(`path.charCodeAt(i + ${i}) === ${charCode}`);
			}
			this.matchPrefix = new Function("path", "i", `return ${lines.join(" && ")}`);
		}
	};
	var ParametricNode = class extends ParentNode {
		constructor(regex, staticSuffix, nodePath) {
			super();
			this.isRegex = !!regex;
			this.regex = regex || null;
			this.staticSuffix = staticSuffix || null;
			this.kind = NODE_TYPES.PARAMETRIC;
			this.nodePaths = new Set([nodePath]);
		}
		getNextNode(path, pathIndex) {
			return this.findStaticMatchingChild(path, pathIndex);
		}
	};
	var WildcardNode = class extends Node {
		constructor() {
			super();
			this.kind = NODE_TYPES.WILDCARD;
		}
		getNextNode() {
			return null;
		}
	};
	module.exports = {
		StaticNode,
		ParametricNode,
		WildcardNode,
		NODE_TYPES
	};
}));
//#endregion
//#region ../../node_modules/.bun/find-my-way@9.5.0/node_modules/find-my-way/lib/strategies/accept-version.js
var require_accept_version = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const assert$5 = __require("node:assert");
	function SemVerStore() {
		if (!(this instanceof SemVerStore)) return new SemVerStore();
		this.store = /* @__PURE__ */ new Map();
		this.maxMajor = 0;
		this.maxMinors = {};
		this.maxPatches = {};
	}
	SemVerStore.prototype.set = function(version, store) {
		if (typeof version !== "string") throw new TypeError("Version should be a string");
		let [major, minor, patch] = version.split(".", 3);
		if (isNaN(major)) throw new TypeError("Major version must be a numeric value");
		major = Number(major);
		minor = Number(minor) || 0;
		patch = Number(patch) || 0;
		if (major >= this.maxMajor) {
			this.maxMajor = major;
			this.store.set("x", store);
			this.store.set("*", store);
			this.store.set("x.x", store);
			this.store.set("x.x.x", store);
		}
		if (minor >= (this.maxMinors[major] || 0)) {
			this.maxMinors[major] = minor;
			this.store.set(`${major}.x`, store);
			this.store.set(`${major}.x.x`, store);
		}
		if (patch >= (this.maxPatches[`${major}.${minor}`] || 0)) {
			this.maxPatches[`${major}.${minor}`] = patch;
			this.store.set(`${major}.${minor}.x`, store);
		}
		this.store.set(`${major}.${minor}.${patch}`, store);
		return this;
	};
	SemVerStore.prototype.get = function(version) {
		return this.store.get(version);
	};
	module.exports = {
		name: "version",
		mustMatchWhenDerived: true,
		storage: SemVerStore,
		validate(value) {
			assert$5(typeof value === "string", "Version should be a string");
		}
	};
}));
//#endregion
//#region ../../node_modules/.bun/find-my-way@9.5.0/node_modules/find-my-way/lib/strategies/accept-host.js
var require_accept_host = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const assert$4 = __require("node:assert");
	function HostStorage() {
		const hosts = /* @__PURE__ */ new Map();
		const regexHosts = [];
		return {
			get: (host) => {
				const exact = hosts.get(host);
				if (exact) return exact;
				for (const regex of regexHosts) if (regex.host.test(host)) return regex.value;
			},
			set: (host, value) => {
				if (host instanceof RegExp) regexHosts.push({
					host,
					value
				});
				else hosts.set(host, value);
			}
		};
	}
	module.exports = {
		name: "host",
		mustMatchWhenDerived: false,
		storage: HostStorage,
		validate(value) {
			assert$4(typeof value === "string" || Object.prototype.toString.call(value) === "[object RegExp]", "Host should be a string or a RegExp");
		}
	};
}));
//#endregion
//#region ../../node_modules/.bun/find-my-way@9.5.0/node_modules/find-my-way/lib/constrainer.js
var require_constrainer = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const acceptVersionStrategy = require_accept_version();
	const acceptHostStrategy = require_accept_host();
	const assert$3 = __require("node:assert");
	var Constrainer = class {
		constructor(customStrategies) {
			this.strategies = {
				version: acceptVersionStrategy,
				host: acceptHostStrategy
			};
			this.strategiesInUse = /* @__PURE__ */ new Set();
			this.asyncStrategiesInUse = /* @__PURE__ */ new Set();
			if (customStrategies) for (const strategy of Object.values(customStrategies)) this.addConstraintStrategy(strategy);
		}
		isStrategyUsed(strategyName) {
			return this.strategiesInUse.has(strategyName) || this.asyncStrategiesInUse.has(strategyName);
		}
		hasConstraintStrategy(strategyName) {
			const customConstraintStrategy = this.strategies[strategyName];
			if (customConstraintStrategy !== void 0) return customConstraintStrategy.isCustom || this.isStrategyUsed(strategyName);
			return false;
		}
		addConstraintStrategy(strategy) {
			assert$3(typeof strategy.name === "string" && strategy.name !== "", "strategy.name is required.");
			assert$3(strategy.storage && typeof strategy.storage === "function", "strategy.storage function is required.");
			assert$3(strategy.deriveConstraint && typeof strategy.deriveConstraint === "function", "strategy.deriveConstraint function is required.");
			if (this.strategies[strategy.name] && this.strategies[strategy.name].isCustom) throw new Error(`There already exists a custom constraint with the name ${strategy.name}.`);
			if (this.isStrategyUsed(strategy.name)) throw new Error(`There already exists a route with ${strategy.name} constraint.`);
			strategy.isCustom = true;
			strategy.isAsync = strategy.deriveConstraint.length === 3;
			this.strategies[strategy.name] = strategy;
			if (strategy.mustMatchWhenDerived) this.noteUsage({ [strategy.name]: strategy });
		}
		deriveConstraints(req, ctx, done) {
			const constraints = this.deriveSyncConstraints(req, ctx);
			if (done === void 0) return constraints;
			this.deriveAsyncConstraints(constraints, req, ctx, done);
		}
		deriveSyncConstraints(req, ctx) {}
		noteUsage(constraints) {
			if (constraints) {
				const beforeSize = this.strategiesInUse.size;
				for (const key in constraints) {
					if (!Object.hasOwn(constraints, key)) continue;
					if (this.strategies[key].isAsync) this.asyncStrategiesInUse.add(key);
					else this.strategiesInUse.add(key);
				}
				if (beforeSize !== this.strategiesInUse.size) this._buildDeriveConstraints();
			}
		}
		newStoreForConstraint(constraint) {
			if (!this.strategies[constraint]) throw new Error(`No strategy registered for constraint key ${constraint}`);
			return this.strategies[constraint].storage();
		}
		validateConstraints(constraints) {
			for (const key in constraints) {
				if (!Object.hasOwn(constraints, key)) continue;
				const value = constraints[key];
				if (typeof value === "undefined") throw new Error("Can't pass an undefined constraint value, must pass null or no key at all");
				const strategy = this.strategies[key];
				if (!strategy) throw new Error(`No strategy registered for constraint key ${key}`);
				if (strategy.validate) strategy.validate(value);
			}
		}
		deriveAsyncConstraints(constraints, req, ctx, done) {
			let asyncConstraintsCount = this.asyncStrategiesInUse.size;
			if (asyncConstraintsCount === 0) {
				done(null, constraints);
				return;
			}
			constraints = constraints || {};
			for (const key of this.asyncStrategiesInUse) this.strategies[key].deriveConstraint(req, ctx, (err, constraintValue) => {
				if (err !== null) {
					done(err);
					return;
				}
				constraints[key] = constraintValue;
				if (--asyncConstraintsCount === 0) done(null, constraints);
			});
		}
		_buildDeriveConstraints() {
			if (this.strategiesInUse.size === 0) return;
			const lines = ["return {"];
			for (const key of this.strategiesInUse) {
				const strategy = this.strategies[key];
				if (!strategy.isCustom) if (key === "version") lines.push("   version: req.headers['accept-version'],");
				else lines.push("   host: req.headers.host || req.headers[':authority'],");
				else lines.push(`  ${strategy.name}: this.strategies.${key}.deriveConstraint(req, ctx),`);
			}
			lines.push("}");
			this.deriveSyncConstraints = new Function("req", "ctx", lines.join("\n")).bind(this);
		}
	};
	module.exports = Constrainer;
}));
//#endregion
//#region ../../node_modules/.bun/find-my-way@9.5.0/node_modules/find-my-way/lib/http-methods.js
var require_http_methods = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = [
		"ACL",
		"BIND",
		"CHECKOUT",
		"CONNECT",
		"COPY",
		"DELETE",
		"GET",
		"HEAD",
		"LINK",
		"LOCK",
		"M-SEARCH",
		"MERGE",
		"MKACTIVITY",
		"MKCALENDAR",
		"MKCOL",
		"MOVE",
		"NOTIFY",
		"OPTIONS",
		"PATCH",
		"POST",
		"PROPFIND",
		"PROPPATCH",
		"PURGE",
		"PUT",
		"QUERY",
		"REBIND",
		"REPORT",
		"SEARCH",
		"SOURCE",
		"SUBSCRIBE",
		"TRACE",
		"UNBIND",
		"UNLINK",
		"UNLOCK",
		"UNSUBSCRIBE"
	];
}));
//#endregion
//#region ../../node_modules/.bun/find-my-way@9.5.0/node_modules/find-my-way/lib/url-sanitizer.js
var require_url_sanitizer = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	function decodeComponentChar(highCharCode, lowCharCode) {
		if (highCharCode === 50) {
			if (lowCharCode === 53) return "%";
			if (lowCharCode === 51) return "#";
			if (lowCharCode === 52) return "$";
			if (lowCharCode === 54) return "&";
			if (lowCharCode === 66) return "+";
			if (lowCharCode === 98) return "+";
			if (lowCharCode === 67) return ",";
			if (lowCharCode === 99) return ",";
			if (lowCharCode === 70) return "/";
			if (lowCharCode === 102) return "/";
			return null;
		}
		if (highCharCode === 51) {
			if (lowCharCode === 65) return ":";
			if (lowCharCode === 97) return ":";
			if (lowCharCode === 66) return ";";
			if (lowCharCode === 98) return ";";
			if (lowCharCode === 68) return "=";
			if (lowCharCode === 100) return "=";
			if (lowCharCode === 70) return "?";
			if (lowCharCode === 102) return "?";
			return null;
		}
		if (highCharCode === 52 && lowCharCode === 48) return "@";
		return null;
	}
	/**
	* Safely decodes a URI path, preserving reserved characters in querystring.
	*
	* @param {string} path - The full request path, possibly including querystring.
	* @param {boolean} [useSemicolonDelimiter] - When true, also treat `;` as a query delimiter.
	* @returns {{ path: string, querystring: string, shouldDecodeParam: boolean }}
	* An object containing the decoded path, the raw querystring, and a flag indicating
	* whether any path parameters contain percent-encoded reserved characters.
	*/
	function safeDecodeURI(path, useSemicolonDelimiter) {
		let shouldDecode = false;
		let shouldDecodeParam = false;
		let querystring = "";
		for (let i = 1; i < path.length; i++) {
			const charCode = path.charCodeAt(i);
			if (charCode === 37) {
				const highCharCode = path.charCodeAt(i + 1);
				const lowCharCode = path.charCodeAt(i + 2);
				if (decodeComponentChar(highCharCode, lowCharCode) === null) shouldDecode = true;
				else {
					shouldDecodeParam = true;
					if (highCharCode === 50 && lowCharCode === 53) {
						shouldDecode = true;
						path = path.slice(0, i + 1) + "25" + path.slice(i + 1);
						i += 2;
					}
					i += 2;
				}
			} else if (charCode === 63 || charCode === 35 || charCode === 59 && useSemicolonDelimiter) {
				querystring = path.slice(i + 1);
				path = path.slice(0, i);
				break;
			}
		}
		return {
			path: shouldDecode ? decodeURI(path) : path,
			querystring,
			shouldDecodeParam
		};
	}
	function safeDecodeURIComponent(uriComponent) {
		const startIndex = uriComponent.indexOf("%");
		if (startIndex === -1) return uriComponent;
		let decoded = "";
		let lastIndex = startIndex;
		for (let i = startIndex; i < uriComponent.length; i++) if (uriComponent.charCodeAt(i) === 37) {
			const decodedChar = decodeComponentChar(uriComponent.charCodeAt(i + 1), uriComponent.charCodeAt(i + 2));
			decoded += uriComponent.slice(lastIndex, i) + decodedChar;
			lastIndex = i + 3;
		}
		return uriComponent.slice(0, startIndex) + decoded + uriComponent.slice(lastIndex);
	}
	module.exports = {
		safeDecodeURI,
		safeDecodeURIComponent
	};
}));
//#endregion
//#region ../../node_modules/.bun/find-my-way@9.5.0/node_modules/find-my-way/index.js
var require_find_my_way = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const assert$2 = __require("node:assert");
	const querystring = require_lib();
	const isRegexSafe = require_safe_regex2();
	const deepEqual = require_fast_deep_equal();
	const { prettyPrintTree } = require_pretty_print();
	const { StaticNode, NODE_TYPES } = require_node();
	const Constrainer = require_constrainer();
	const httpMethods = require_http_methods();
	const httpMethodStrategy = require_http_method();
	const { safeDecodeURI, safeDecodeURIComponent } = require_url_sanitizer();
	const FULL_PATH_REGEXP = /^https?:\/\/.*?\//;
	const OPTIONAL_PARAM_REGEXP = /(\/:[^/()]*?)\?(\/?)/;
	const ESCAPE_REGEXP = /[.*+?^${}()|[\]\\]/g;
	const REMOVE_DUPLICATE_SLASHES_REGEXP = /\/\/+/g;
	if (!isRegexSafe(FULL_PATH_REGEXP)) throw new Error("the FULL_PATH_REGEXP is not safe, update this module");
	if (!isRegexSafe(OPTIONAL_PARAM_REGEXP)) throw new Error("the OPTIONAL_PARAM_REGEXP is not safe, update this module");
	if (!isRegexSafe(ESCAPE_REGEXP)) throw new Error("the ESCAPE_REGEXP is not safe, update this module");
	if (!isRegexSafe(REMOVE_DUPLICATE_SLASHES_REGEXP)) throw new Error("the REMOVE_DUPLICATE_SLASHES_REGEXP is not safe, update this module");
	function Router(opts) {
		if (!(this instanceof Router)) return new Router(opts);
		opts = opts || {};
		this._opts = opts;
		if (opts.defaultRoute) {
			assert$2(typeof opts.defaultRoute === "function", "The default route must be a function");
			this.defaultRoute = opts.defaultRoute;
		} else this.defaultRoute = null;
		if (opts.onBadUrl) {
			assert$2(typeof opts.onBadUrl === "function", "The bad url handler must be a function");
			this.onBadUrl = opts.onBadUrl;
		} else this.onBadUrl = null;
		if (opts.buildPrettyMeta) {
			assert$2(typeof opts.buildPrettyMeta === "function", "buildPrettyMeta must be a function");
			this.buildPrettyMeta = opts.buildPrettyMeta;
		} else this.buildPrettyMeta = defaultBuildPrettyMeta;
		if (opts.querystringParser) {
			assert$2(typeof opts.querystringParser === "function", "querystringParser must be a function");
			this.querystringParser = opts.querystringParser;
		} else this.querystringParser = (query) => query.length === 0 ? {} : querystring.parse(query);
		this.caseSensitive = opts.caseSensitive === void 0 ? true : opts.caseSensitive;
		this.ignoreTrailingSlash = opts.ignoreTrailingSlash || false;
		this.ignoreDuplicateSlashes = opts.ignoreDuplicateSlashes || false;
		this.maxParamLength = opts.maxParamLength || 100;
		this.allowUnsafeRegex = opts.allowUnsafeRegex || false;
		this.constrainer = new Constrainer(opts.constraints);
		this.useSemicolonDelimiter = opts.useSemicolonDelimiter || false;
		this.routes = [];
		this.trees = {};
	}
	Router.prototype.on = function on(method, path, opts, handler, store) {
		if (typeof opts === "function") {
			if (handler !== void 0) store = handler;
			handler = opts;
			opts = {};
		}
		assert$2(typeof path === "string", "Path should be a string");
		assert$2(path.length > 0, "The path could not be empty");
		assert$2(path[0] === "/" || path[0] === "*", "The first character of a path should be `/` or `*`");
		assert$2(typeof handler === "function", "Handler should be a function");
		const optionalParamMatch = path.match(OPTIONAL_PARAM_REGEXP);
		if (optionalParamMatch) {
			assert$2(path.length === optionalParamMatch.index + optionalParamMatch[0].length, "Optional Parameter needs to be the last parameter of the path");
			const pathFull = path.replace(OPTIONAL_PARAM_REGEXP, "$1$2");
			const pathOptional = path.replace(OPTIONAL_PARAM_REGEXP, "$2") || "/";
			this.on(method, pathFull, opts, handler, store);
			this.on(method, pathOptional, opts, handler, store);
			return;
		}
		const route = path;
		if (this.ignoreDuplicateSlashes) path = removeDuplicateSlashes(path);
		if (this.ignoreTrailingSlash) path = trimLastSlash(path);
		const methods = Array.isArray(method) ? method : [method];
		for (const method of methods) {
			assert$2(typeof method === "string", "Method should be a string");
			assert$2(httpMethods.includes(method), `Method '${method}' is not an http method.`);
			this._on(method, path, opts, handler, store, route);
		}
	};
	Router.prototype._on = function _on(method, path, opts, handler, store) {
		let constraints = {};
		if (opts.constraints !== void 0) {
			assert$2(typeof opts.constraints === "object" && opts.constraints !== null, "Constraints should be an object");
			if (Object.keys(opts.constraints).length !== 0) constraints = opts.constraints;
		}
		this.constrainer.validateConstraints(constraints);
		this.constrainer.noteUsage(constraints);
		if (this.trees[method] === void 0) this.trees[method] = new StaticNode("/");
		let pattern = path;
		if (pattern === "*" && this.trees[method].prefix.length !== 0) {
			const currentRoot = this.trees[method];
			this.trees[method] = new StaticNode("");
			this.trees[method].staticChildren["/"] = currentRoot;
		}
		let currentNode = this.trees[method];
		let parentNodePathIndex = currentNode.prefix.length;
		const params = [];
		for (let i = 0; i <= pattern.length; i++) {
			if (pattern.charCodeAt(i) === 58 && pattern.charCodeAt(i + 1) === 58) {
				i++;
				continue;
			}
			const isParametricNode = pattern.charCodeAt(i) === 58 && pattern.charCodeAt(i + 1) !== 58;
			const isWildcardNode = pattern.charCodeAt(i) === 42;
			if (isParametricNode || isWildcardNode || i === pattern.length && i !== parentNodePathIndex) {
				let staticNodePath = pattern.slice(parentNodePathIndex, i);
				if (!this.caseSensitive) staticNodePath = staticNodePath.toLowerCase();
				staticNodePath = staticNodePath.replaceAll("::", ":");
				staticNodePath = staticNodePath.replaceAll("%", "%25");
				currentNode = currentNode.createStaticChild(staticNodePath);
			}
			if (isParametricNode) {
				let isRegexNode = false;
				let isParamSafe = true;
				let backtrack = "";
				const regexps = [];
				let lastParamStartIndex = i + 1;
				for (let j = lastParamStartIndex;; j++) {
					const charCode = pattern.charCodeAt(j);
					const isRegexParam = charCode === 40;
					const isStaticPart = charCode === 45 || charCode === 46;
					const isEndOfNode = charCode === 47 || j === pattern.length;
					if (isRegexParam || isStaticPart || isEndOfNode) {
						const paramName = pattern.slice(lastParamStartIndex, j);
						params.push(paramName);
						isRegexNode = isRegexNode || isRegexParam || isStaticPart;
						if (isRegexParam) {
							const endOfRegexIndex = getClosingParenthensePosition(pattern, j);
							const regexString = pattern.slice(j, endOfRegexIndex + 1);
							if (!this.allowUnsafeRegex) assert$2(isRegexSafe(new RegExp(regexString)), `The regex '${regexString}' is not safe!`);
							regexps.push(trimRegExpStartAndEnd(regexString));
							j = endOfRegexIndex + 1;
							isParamSafe = true;
						} else {
							regexps.push(isParamSafe ? "(.*?)" : `(${backtrack}|(?:(?!${backtrack}).)*)`);
							isParamSafe = false;
						}
						const staticPartStartIndex = j;
						for (; j < pattern.length; j++) {
							const charCode = pattern.charCodeAt(j);
							if (charCode === 47) break;
							if (charCode === 58) if (pattern.charCodeAt(j + 1) === 58) j++;
							else break;
						}
						let staticPart = pattern.slice(staticPartStartIndex, j);
						if (staticPart) {
							staticPart = staticPart.replaceAll("::", ":");
							staticPart = staticPart.replaceAll("%", "%25");
							regexps.push(backtrack = escapeRegExp(staticPart));
						}
						lastParamStartIndex = j + 1;
						if (isEndOfNode || pattern.charCodeAt(j) === 47 || j === pattern.length) {
							const nodePattern = isRegexNode ? "()" + staticPart : staticPart;
							const nodePath = pattern.slice(i, j);
							pattern = pattern.slice(0, i + 1) + nodePattern + pattern.slice(j);
							i += nodePattern.length;
							const regex = isRegexNode ? new RegExp("^" + regexps.join("") + "$") : null;
							currentNode = currentNode.createParametricChild(regex, staticPart || null, nodePath);
							parentNodePathIndex = i + 1;
							break;
						}
					}
				}
			} else if (isWildcardNode) {
				params.push("*");
				currentNode = currentNode.createWildcardChild();
				parentNodePathIndex = i + 1;
				if (i !== pattern.length - 1) throw new Error("Wildcard must be the last character in the route");
			}
		}
		if (!this.caseSensitive) pattern = pattern.toLowerCase();
		if (pattern === "*") pattern = "/*";
		for (const existRoute of this.routes) {
			const routeConstraints = existRoute.opts.constraints || {};
			if (existRoute.method === method && existRoute.pattern === pattern && deepEqual(routeConstraints, constraints)) throw new Error(`Method '${method}' already declared for route '${pattern}' with constraints '${JSON.stringify(constraints)}'`);
		}
		const route = {
			method,
			path,
			pattern,
			params,
			opts,
			handler,
			store
		};
		this.routes.push(route);
		currentNode.addRoute(route, this.constrainer);
	};
	Router.prototype.hasRoute = function hasRoute(method, path, constraints) {
		return this.findRoute(method, path, constraints) !== null;
	};
	Router.prototype.findRoute = function findNode(method, path, constraints = {}) {
		if (this.trees[method] === void 0) return null;
		let pattern = path;
		let currentNode = this.trees[method];
		let parentNodePathIndex = currentNode.prefix.length;
		const params = [];
		for (let i = 0; i <= pattern.length; i++) {
			if (pattern.charCodeAt(i) === 58 && pattern.charCodeAt(i + 1) === 58) {
				i++;
				continue;
			}
			const isParametricNode = pattern.charCodeAt(i) === 58 && pattern.charCodeAt(i + 1) !== 58;
			const isWildcardNode = pattern.charCodeAt(i) === 42;
			if (isParametricNode || isWildcardNode || i === pattern.length && i !== parentNodePathIndex) {
				let staticNodePath = pattern.slice(parentNodePathIndex, i);
				if (!this.caseSensitive) staticNodePath = staticNodePath.toLowerCase();
				staticNodePath = staticNodePath.replaceAll("::", ":");
				staticNodePath = staticNodePath.replaceAll("%", "%25");
				currentNode = currentNode.getStaticChild(staticNodePath);
				if (currentNode === null) return null;
			}
			if (isParametricNode) {
				let isRegexNode = false;
				let isParamSafe = true;
				let backtrack = "";
				const regexps = [];
				let lastParamStartIndex = i + 1;
				for (let j = lastParamStartIndex;; j++) {
					const charCode = pattern.charCodeAt(j);
					const isRegexParam = charCode === 40;
					const isStaticPart = charCode === 45 || charCode === 46;
					const isEndOfNode = charCode === 47 || j === pattern.length;
					if (isRegexParam || isStaticPart || isEndOfNode) {
						const paramName = pattern.slice(lastParamStartIndex, j);
						params.push(paramName);
						isRegexNode = isRegexNode || isRegexParam || isStaticPart;
						if (isRegexParam) {
							const endOfRegexIndex = getClosingParenthensePosition(pattern, j);
							const regexString = pattern.slice(j, endOfRegexIndex + 1);
							if (!this.allowUnsafeRegex) assert$2(isRegexSafe(new RegExp(regexString)), `The regex '${regexString}' is not safe!`);
							regexps.push(trimRegExpStartAndEnd(regexString));
							j = endOfRegexIndex + 1;
							isParamSafe = false;
						} else {
							regexps.push(isParamSafe ? "(.*?)" : `(${backtrack}|(?:(?!${backtrack}).)*)`);
							isParamSafe = false;
						}
						const staticPartStartIndex = j;
						for (; j < pattern.length; j++) {
							const charCode = pattern.charCodeAt(j);
							if (charCode === 47) break;
							if (charCode === 58) if (pattern.charCodeAt(j + 1) === 58) j++;
							else break;
						}
						let staticPart = pattern.slice(staticPartStartIndex, j);
						if (staticPart) {
							staticPart = staticPart.replaceAll("::", ":");
							staticPart = staticPart.replaceAll("%", "%25");
							regexps.push(backtrack = escapeRegExp(staticPart));
						}
						lastParamStartIndex = j + 1;
						if (isEndOfNode || pattern.charCodeAt(j) === 47 || j === pattern.length) {
							const nodePattern = isRegexNode ? "()" + staticPart : staticPart;
							const nodePath = pattern.slice(i, j);
							pattern = pattern.slice(0, i + 1) + nodePattern + pattern.slice(j);
							i += nodePattern.length;
							const regex = isRegexNode ? new RegExp("^" + regexps.join("") + "$") : null;
							currentNode = currentNode.getParametricChild(regex, staticPart || null, nodePath);
							if (currentNode === null) return null;
							parentNodePathIndex = i + 1;
							break;
						}
					}
				}
			} else if (isWildcardNode) {
				params.push("*");
				currentNode = currentNode.getWildcardChild();
				parentNodePathIndex = i + 1;
				if (i !== pattern.length - 1) throw new Error("Wildcard must be the last character in the route");
			}
		}
		if (!this.caseSensitive) pattern = pattern.toLowerCase();
		for (const existRoute of this.routes) {
			const routeConstraints = existRoute.opts.constraints || {};
			if (existRoute.method === method && existRoute.pattern === pattern && deepEqual(routeConstraints, constraints)) return {
				handler: existRoute.handler,
				store: existRoute.store,
				params: existRoute.params
			};
		}
		return null;
	};
	Router.prototype.hasConstraintStrategy = function(strategyName) {
		return this.constrainer.hasConstraintStrategy(strategyName);
	};
	Router.prototype.addConstraintStrategy = function(constraints) {
		this.constrainer.addConstraintStrategy(constraints);
		this._rebuild(this.routes);
	};
	Router.prototype.reset = function reset() {
		this.trees = {};
		this.routes = [];
	};
	Router.prototype.off = function off(method, path, constraints) {
		assert$2(typeof path === "string", "Path should be a string");
		assert$2(path.length > 0, "The path could not be empty");
		assert$2(path[0] === "/" || path[0] === "*", "The first character of a path should be `/` or `*`");
		assert$2(typeof constraints === "undefined" || typeof constraints === "object" && !Array.isArray(constraints) && constraints !== null, "Constraints should be an object or undefined.");
		const optionalParamMatch = path.match(OPTIONAL_PARAM_REGEXP);
		if (optionalParamMatch) {
			assert$2(path.length === optionalParamMatch.index + optionalParamMatch[0].length, "Optional Parameter needs to be the last parameter of the path");
			const pathFull = path.replace(OPTIONAL_PARAM_REGEXP, "$1$2");
			const pathOptional = path.replace(OPTIONAL_PARAM_REGEXP, "$2");
			this.off(method, pathFull, constraints);
			this.off(method, pathOptional, constraints);
			return;
		}
		if (this.ignoreDuplicateSlashes) path = removeDuplicateSlashes(path);
		if (this.ignoreTrailingSlash) path = trimLastSlash(path);
		const methods = Array.isArray(method) ? method : [method];
		for (const method of methods) this._off(method, path, constraints);
	};
	Router.prototype._off = function _off(method, path, constraints) {
		assert$2(typeof method === "string", "Method should be a string");
		assert$2(httpMethods.includes(method), `Method '${method}' is not an http method.`);
		function matcherWithoutConstraints(route) {
			return method !== route.method || path !== route.path;
		}
		function matcherWithConstraints(route) {
			return matcherWithoutConstraints(route) || !deepEqual(constraints, route.opts.constraints || {});
		}
		const predicate = constraints ? matcherWithConstraints : matcherWithoutConstraints;
		const newRoutes = this.routes.filter(predicate);
		this._rebuild(newRoutes);
	};
	Router.prototype.lookup = function lookup(req, res, ctx, done) {
		if (typeof ctx === "function") {
			done = ctx;
			ctx = void 0;
		}
		if (done === void 0) {
			const constraints = this.constrainer.deriveConstraints(req, ctx);
			const handle = this.find(req.method, req.url, constraints);
			return this.callHandler(handle, req, res, ctx);
		}
		this.constrainer.deriveConstraints(req, ctx, (err, constraints) => {
			if (err !== null) {
				done(err);
				return;
			}
			try {
				const handle = this.find(req.method, req.url, constraints);
				const result = this.callHandler(handle, req, res, ctx);
				done(null, result);
			} catch (err) {
				done(err);
			}
		});
	};
	Router.prototype.callHandler = function callHandler(handle, req, res, ctx) {
		if (handle === null) return this._defaultRoute(req, res, ctx);
		return ctx === void 0 ? handle.handler(req, res, handle.params, handle.store, handle.searchParams) : handle.handler.call(ctx, req, res, handle.params, handle.store, handle.searchParams);
	};
	Router.prototype.find = function find(method, path, derivedConstraints) {
		let currentNode = this.trees[method];
		if (currentNode === void 0) return null;
		if (path.charCodeAt(0) !== 47) path = path.replace(FULL_PATH_REGEXP, "/");
		if (this.ignoreDuplicateSlashes) path = removeDuplicateSlashes(path);
		let sanitizedUrl;
		let querystring;
		let shouldDecodeParam;
		try {
			sanitizedUrl = safeDecodeURI(path, this.useSemicolonDelimiter);
			path = sanitizedUrl.path;
			querystring = sanitizedUrl.querystring;
			shouldDecodeParam = sanitizedUrl.shouldDecodeParam;
		} catch (error) {
			return this._onBadUrl(path);
		}
		if (this.ignoreTrailingSlash) path = trimLastSlash(path);
		const originPath = path;
		if (this.caseSensitive === false) path = path.toLowerCase();
		const maxParamLength = this.maxParamLength;
		let pathIndex = currentNode.prefix.length;
		const params = [];
		const pathLen = path.length;
		const brothersNodesStack = [];
		while (true) {
			if (pathIndex === pathLen && currentNode.isLeafNode) {
				const handle = currentNode.handlerStorage.getMatchingHandler(derivedConstraints);
				if (handle !== null) return {
					handler: handle.handler,
					store: handle.store,
					params: handle._createParamsObject(params),
					searchParams: this.querystringParser(querystring)
				};
			}
			let node = currentNode.getNextNode(path, pathIndex, brothersNodesStack, params.length);
			if (node === null) {
				if (brothersNodesStack.length === 0) return null;
				const brotherNodeState = brothersNodesStack.pop();
				pathIndex = brotherNodeState.brotherPathIndex;
				params.splice(brotherNodeState.paramsCount);
				node = brotherNodeState.brotherNode;
			}
			currentNode = node;
			if (currentNode.kind === NODE_TYPES.STATIC) {
				pathIndex += currentNode.prefix.length;
				continue;
			}
			if (currentNode.kind === NODE_TYPES.WILDCARD) {
				let param = originPath.slice(pathIndex);
				if (shouldDecodeParam) param = safeDecodeURIComponent(param);
				params.push(param);
				pathIndex = pathLen;
				continue;
			}
			let paramEndIndex = originPath.indexOf("/", pathIndex);
			if (paramEndIndex === -1) paramEndIndex = pathLen;
			let param = originPath.slice(pathIndex, paramEndIndex);
			if (shouldDecodeParam) param = safeDecodeURIComponent(param);
			if (currentNode.isRegex) {
				const matchedParameters = currentNode.regex.exec(param);
				if (matchedParameters === null) continue;
				for (let i = 1; i < matchedParameters.length; i++) {
					const matchedParam = matchedParameters[i];
					if (matchedParam.length > maxParamLength) return null;
					params.push(matchedParam);
				}
			} else {
				if (param.length > maxParamLength) return null;
				params.push(param);
			}
			pathIndex = paramEndIndex;
		}
	};
	Router.prototype._rebuild = function(routes) {
		this.reset();
		for (const route of routes) {
			const { method, path, opts, handler, store } = route;
			this._on(method, path, opts, handler, store);
		}
	};
	Router.prototype._defaultRoute = function(req, res, ctx) {
		if (this.defaultRoute !== null) return ctx === void 0 ? this.defaultRoute(req, res) : this.defaultRoute.call(ctx, req, res);
		else {
			res.statusCode = 404;
			res.end();
		}
	};
	Router.prototype._onBadUrl = function(path) {
		if (this.onBadUrl === null) return null;
		const onBadUrl = this.onBadUrl;
		return {
			handler: (req, res, ctx) => onBadUrl(path, req, res),
			params: {},
			store: null
		};
	};
	Router.prototype.prettyPrint = function(options = {}) {
		const method = options.method;
		options.buildPrettyMeta = this.buildPrettyMeta.bind(this);
		let tree = null;
		if (method === void 0) {
			const { version, host, ...constraints } = this.constrainer.strategies;
			constraints[httpMethodStrategy.name] = httpMethodStrategy;
			const mergedRouter = new Router({
				...this._opts,
				constraints
			});
			const mergedRoutes = this.routes.map((route) => {
				const constraints = {
					...route.opts.constraints,
					[httpMethodStrategy.name]: route.method
				};
				return {
					...route,
					method: "MERGED",
					opts: { constraints }
				};
			});
			mergedRouter._rebuild(mergedRoutes);
			tree = mergedRouter.trees.MERGED;
		} else tree = this.trees[method];
		if (tree == null) return "(empty tree)";
		return prettyPrintTree(tree, options);
	};
	for (const i in httpMethods) {
		if (!httpMethods.hasOwnProperty(i)) continue;
		const m = httpMethods[i];
		const methodName = m.toLowerCase();
		Router.prototype[methodName] = function(path, handler, store) {
			return this.on(m, path, handler, store);
		};
	}
	Router.prototype.all = function(path, handler, store) {
		this.on(httpMethods, path, handler, store);
	};
	Router.sanitizeUrlPath = function sanitizeUrlPath(url, useSemicolonDelimiter) {
		const decoded = safeDecodeURI(url, useSemicolonDelimiter);
		if (decoded.shouldDecodeParam) return safeDecodeURIComponent(decoded.path);
		return decoded.path;
	};
	Router.removeDuplicateSlashes = removeDuplicateSlashes;
	Router.trimLastSlash = trimLastSlash;
	module.exports = Router;
	function escapeRegExp(string) {
		return string.replace(ESCAPE_REGEXP, "\\$&");
	}
	function removeDuplicateSlashes(path) {
		return path.indexOf("//") !== -1 ? path.replace(REMOVE_DUPLICATE_SLASHES_REGEXP, "/") : path;
	}
	function trimLastSlash(path) {
		if (path.length > 1 && path.charCodeAt(path.length - 1) === 47) return path.slice(0, -1);
		return path;
	}
	function trimRegExpStartAndEnd(regexString) {
		if (regexString.charCodeAt(1) === 94) regexString = regexString.slice(0, 1) + regexString.slice(2);
		if (regexString.charCodeAt(regexString.length - 2) === 36) regexString = regexString.slice(0, regexString.length - 2) + regexString.slice(regexString.length - 1);
		return regexString;
	}
	function getClosingParenthensePosition(path, idx) {
		let parentheses = 1;
		while (idx < path.length) {
			idx++;
			if (path.charCodeAt(idx) === 92) {
				idx++;
				continue;
			}
			if (path.charCodeAt(idx) === 41) parentheses--;
			else if (path.charCodeAt(idx) === 40) parentheses++;
			if (!parentheses) return idx;
		}
		throw new TypeError("Invalid regexp expression in \"" + path + "\"");
	}
	function defaultBuildPrettyMeta(route) {
		if (!route) return {};
		if (!route.store) return {};
		return Object.assign({}, route.store);
	}
}));
//#endregion
//#region ../../node_modules/.bun/fastify@5.8.4/node_modules/fastify/lib/head-route.js
var require_head_route = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	function headRouteOnSendHandler(req, reply, payload, done) {
		if (payload === void 0) {
			reply.header("content-length", "0");
			done(null, null);
			return;
		}
		if (typeof payload.resume === "function") {
			payload.on("error", (err) => {
				reply.log.error({ err }, "Error on Stream found for HEAD route");
			});
			payload.resume();
			done(null, null);
			return;
		}
		if (typeof payload.getReader === "function") {
			payload.cancel("Stream cancelled by HEAD route").catch((err) => {
				reply.log.error({ err }, "Error on Stream found for HEAD route");
			});
			done(null, null);
			return;
		}
		const size = "" + Buffer.byteLength(payload);
		reply.header("content-length", size);
		done(null, null);
	}
	function parseHeadOnSendHandlers(onSendHandlers) {
		if (onSendHandlers == null) return headRouteOnSendHandler;
		return Array.isArray(onSendHandlers) ? [...onSendHandlers, headRouteOnSendHandler] : [onSendHandlers, headRouteOnSendHandler];
	}
	module.exports = { parseHeadOnSendHandlers };
}));
//#endregion
//#region ../../node_modules/.bun/fastify@5.8.4/node_modules/fastify/lib/route.js
var require_route = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const FindMyWay = require_find_my_way();
	const Context = require_context();
	const handleRequest = require_handle_request();
	const { onRequestAbortHookRunner, lifecycleHooks, preParsingHookRunner, onTimeoutHookRunner, onRequestHookRunner } = require_hooks();
	const { normalizeSchema } = require_schemas();
	const { parseHeadOnSendHandlers } = require_head_route();
	const { compileSchemasForValidation, compileSchemasForSerialization } = require_validation();
	const { FST_ERR_SCH_VALIDATION_BUILD, FST_ERR_SCH_SERIALIZATION_BUILD, FST_ERR_DUPLICATED_ROUTE, FST_ERR_INVALID_URL, FST_ERR_HOOK_INVALID_HANDLER, FST_ERR_ROUTE_OPTIONS_NOT_OBJ, FST_ERR_ROUTE_DUPLICATED_HANDLER, FST_ERR_ROUTE_HANDLER_NOT_FN, FST_ERR_ROUTE_MISSING_HANDLER, FST_ERR_ROUTE_METHOD_NOT_SUPPORTED, FST_ERR_ROUTE_METHOD_INVALID, FST_ERR_ROUTE_BODY_VALIDATION_SCHEMA_NOT_SUPPORTED, FST_ERR_ROUTE_BODY_LIMIT_OPTION_NOT_INT, FST_ERR_ROUTE_HANDLER_TIMEOUT_OPTION_NOT_INT, FST_ERR_HANDLER_TIMEOUT, FST_ERR_HOOK_INVALID_ASYNC_HANDLER } = require_errors();
	const { kRoutePrefix, kSupportedHTTPMethods, kLogLevel, kLogSerializers, kHooks, kSchemaController, kOptions, kReplySerializerDefault, kReplyIsError, kRequestPayloadStream, kDisableRequestLogging, kSchemaErrorFormatter, kErrorHandler, kHasBeenDecorated, kRequestAcceptVersion, kRouteByFastify, kRouteContext, kRequestSignal, kTimeoutTimer, kOnAbort } = require_symbols$1();
	const { buildErrorHandler } = require_error_handler();
	const { createChildLogger } = require_logger_factory();
	const { getGenReqId } = require_req_id_gen_factory();
	const { FSTDEP022 } = require_warnings();
	const routerKeys = [
		"allowUnsafeRegex",
		"buildPrettyMeta",
		"caseSensitive",
		"constraints",
		"defaultRoute",
		"ignoreDuplicateSlashes",
		"ignoreTrailingSlash",
		"maxParamLength",
		"onBadUrl",
		"querystringParser",
		"useSemicolonDelimiter"
	];
	function buildRouting(options) {
		const router = FindMyWay(options);
		let avvio;
		let fourOhFour;
		let logger;
		let hasLogger;
		let setupResponseListeners;
		let throwIfAlreadyStarted;
		let disableRequestLogging;
		let disableRequestLoggingFn;
		let ignoreTrailingSlash;
		let ignoreDuplicateSlashes;
		let return503OnClosing;
		let globalExposeHeadRoutes;
		let keepAliveConnections;
		let closing = false;
		return {
			setup(options, fastifyArgs) {
				avvio = fastifyArgs.avvio;
				fourOhFour = fastifyArgs.fourOhFour;
				logger = options.logger;
				hasLogger = fastifyArgs.hasLogger;
				setupResponseListeners = fastifyArgs.setupResponseListeners;
				throwIfAlreadyStarted = fastifyArgs.throwIfAlreadyStarted;
				globalExposeHeadRoutes = options.exposeHeadRoutes;
				disableRequestLogging = options.disableRequestLogging;
				if (typeof disableRequestLogging === "function") disableRequestLoggingFn = options.disableRequestLogging;
				ignoreTrailingSlash = options.routerOptions.ignoreTrailingSlash;
				ignoreDuplicateSlashes = options.routerOptions.ignoreDuplicateSlashes;
				return503OnClosing = Object.hasOwn(options, "return503OnClosing") ? options.return503OnClosing : true;
				keepAliveConnections = fastifyArgs.keepAliveConnections;
			},
			routing: router.lookup.bind(router),
			route,
			hasRoute,
			prepareRoute,
			routeHandler,
			closeRoutes: () => {
				closing = true;
			},
			printRoutes: router.prettyPrint.bind(router),
			addConstraintStrategy,
			hasConstraintStrategy,
			isAsyncConstraint,
			findRoute
		};
		function addConstraintStrategy(strategy) {
			throwIfAlreadyStarted("Cannot add constraint strategy!");
			return router.addConstraintStrategy(strategy);
		}
		function hasConstraintStrategy(strategyName) {
			return router.hasConstraintStrategy(strategyName);
		}
		function isAsyncConstraint() {
			return router.constrainer.asyncStrategiesInUse.size > 0;
		}
		function prepareRoute({ method, url, options, handler, isFastify }) {
			if (typeof url !== "string") throw new FST_ERR_INVALID_URL(typeof url);
			if (!handler && typeof options === "function") {
				handler = options;
				options = {};
			} else if (handler && typeof handler === "function") {
				if (Object.prototype.toString.call(options) !== "[object Object]") throw new FST_ERR_ROUTE_OPTIONS_NOT_OBJ(method, url);
				else if (options.handler) if (typeof options.handler === "function") throw new FST_ERR_ROUTE_DUPLICATED_HANDLER(method, url);
				else throw new FST_ERR_ROUTE_HANDLER_NOT_FN(method, url);
			}
			options = Object.assign({}, options, {
				method,
				url,
				path: url,
				handler: handler || options && options.handler
			});
			return route.call(this, {
				options,
				isFastify
			});
		}
		function hasRoute({ options }) {
			const normalizedMethod = options.method?.toUpperCase() ?? "";
			return router.hasRoute(normalizedMethod, options.url || "", options.constraints);
		}
		function findRoute(options) {
			const route = router.find(options.method, options.url || "", options.constraints);
			if (route) return {
				handler: route.handler,
				params: route.params,
				searchParams: route.searchParams
			};
			else return null;
		}
		/**
		* Route management
		* @param {{ options: import('../fastify').RouteOptions, isFastify: boolean }}
		*/
		function route({ options, isFastify }) {
			throwIfAlreadyStarted("Cannot add route!");
			const opts = { ...options };
			const path = opts.url || opts.path || "";
			if (!opts.handler) throw new FST_ERR_ROUTE_MISSING_HANDLER(opts.method, path);
			if (opts.errorHandler !== void 0 && typeof opts.errorHandler !== "function") throw new FST_ERR_ROUTE_HANDLER_NOT_FN(opts.method, path);
			validateBodyLimitOption(opts.bodyLimit);
			validateHandlerTimeoutOption(opts.handlerTimeout);
			const shouldExposeHead = opts.exposeHeadRoute ?? globalExposeHeadRoutes;
			let isGetRoute = false;
			let isHeadRoute = false;
			if (Array.isArray(opts.method)) for (let i = 0; i < opts.method.length; ++i) {
				opts.method[i] = normalizeAndValidateMethod.call(this, opts.method[i]);
				validateSchemaBodyOption.call(this, opts.method[i], path, opts.schema);
				isGetRoute = opts.method.includes("GET");
				isHeadRoute = opts.method.includes("HEAD");
			}
			else {
				opts.method = normalizeAndValidateMethod.call(this, opts.method);
				validateSchemaBodyOption.call(this, opts.method, path, opts.schema);
				isGetRoute = opts.method === "GET";
				isHeadRoute = opts.method === "HEAD";
			}
			const headOpts = shouldExposeHead && isGetRoute ? { ...options } : null;
			const prefix = this[kRoutePrefix];
			if (path === "/" && prefix.length > 0 && opts.method !== "HEAD") switch (opts.prefixTrailingSlash) {
				case "slash":
					addNewRoute.call(this, {
						path,
						isFastify
					});
					break;
				case "no-slash":
					addNewRoute.call(this, {
						path: "",
						isFastify
					});
					break;
				default:
					addNewRoute.call(this, {
						path: "",
						isFastify
					});
					if (ignoreTrailingSlash !== true && (ignoreDuplicateSlashes !== true || !prefix.endsWith("/"))) addNewRoute.call(this, {
						path,
						prefixing: true,
						isFastify
					});
			}
			else if (path[0] === "/" && prefix.endsWith("/")) addNewRoute.call(this, {
				path: path.slice(1),
				isFastify
			});
			else addNewRoute.call(this, {
				path,
				isFastify
			});
			return this;
			function addNewRoute({ path, prefixing = false, isFastify = false }) {
				const url = prefix + path;
				opts.url = url;
				opts.path = url;
				opts.routePath = path;
				opts.prefix = prefix;
				opts.logLevel = opts.logLevel || this[kLogLevel];
				if (this[kLogSerializers] || opts.logSerializers) opts.logSerializers = Object.assign(Object.create(this[kLogSerializers]), opts.logSerializers);
				if (opts.attachValidation == null) opts.attachValidation = false;
				if (prefixing === false) for (const hook of this[kHooks].onRoute) hook.call(this, opts);
				for (const hook of lifecycleHooks) if (opts && hook in opts) {
					if (Array.isArray(opts[hook])) for (const func of opts[hook]) {
						if (typeof func !== "function") throw new FST_ERR_HOOK_INVALID_HANDLER(hook, Object.prototype.toString.call(func));
						if (hook === "onSend" || hook === "preSerialization" || hook === "onError" || hook === "preParsing") {
							if (func.constructor.name === "AsyncFunction" && func.length === 4) throw new FST_ERR_HOOK_INVALID_ASYNC_HANDLER();
						} else if (hook === "onRequestAbort") {
							if (func.constructor.name === "AsyncFunction" && func.length !== 1) throw new FST_ERR_HOOK_INVALID_ASYNC_HANDLER();
						} else if (func.constructor.name === "AsyncFunction" && func.length === 3) throw new FST_ERR_HOOK_INVALID_ASYNC_HANDLER();
					}
					else if (opts[hook] !== void 0 && typeof opts[hook] !== "function") throw new FST_ERR_HOOK_INVALID_HANDLER(hook, Object.prototype.toString.call(opts[hook]));
				}
				const constraints = opts.constraints || {};
				const config = {
					...opts.config,
					url,
					method: opts.method
				};
				const context = new Context({
					schema: opts.schema,
					handler: opts.handler.bind(this),
					config,
					errorHandler: opts.errorHandler,
					childLoggerFactory: opts.childLoggerFactory,
					bodyLimit: opts.bodyLimit,
					logLevel: opts.logLevel,
					logSerializers: opts.logSerializers,
					attachValidation: opts.attachValidation,
					schemaErrorFormatter: opts.schemaErrorFormatter,
					replySerializer: this[kReplySerializerDefault],
					validatorCompiler: opts.validatorCompiler,
					serializerCompiler: opts.serializerCompiler,
					exposeHeadRoute: shouldExposeHead,
					prefixTrailingSlash: opts.prefixTrailingSlash || "both",
					server: this,
					isFastify,
					handlerTimeout: opts.handlerTimeout
				});
				const hasHEADHandler = router.findRoute("HEAD", opts.url, constraints) !== null;
				try {
					router.on(opts.method, opts.url, { constraints }, routeHandler, context);
				} catch (error) {
					if (!context[kRouteByFastify]) {
						if (error.message.includes(`Method '${opts.method}' already declared for route`)) throw new FST_ERR_DUPLICATED_ROUTE(opts.method, opts.url);
						throw error;
					}
				}
				this.after((notHandledErr, done) => {
					context.errorHandler = opts.errorHandler ? buildErrorHandler(this[kErrorHandler], opts.errorHandler) : this[kErrorHandler];
					context._parserOptions.limit = opts.bodyLimit || null;
					context.logLevel = opts.logLevel;
					context.logSerializers = opts.logSerializers;
					context.attachValidation = opts.attachValidation;
					context[kReplySerializerDefault] = this[kReplySerializerDefault];
					context.schemaErrorFormatter = opts.schemaErrorFormatter || this[kSchemaErrorFormatter] || context.schemaErrorFormatter;
					avvio.once("preReady", () => {
						for (const hook of lifecycleHooks) {
							const toSet = this[kHooks][hook].concat(opts[hook] || []).map((h) => h.bind(this));
							context[hook] = toSet.length ? toSet : null;
						}
						while (!context.Request[kHasBeenDecorated] && context.Request.parent) context.Request = context.Request.parent;
						while (!context.Reply[kHasBeenDecorated] && context.Reply.parent) context.Reply = context.Reply.parent;
						fourOhFour.setContext(this, context);
						if (opts.schema) {
							context.schema = normalizeSchema(context.schema, this.initialConfig);
							const schemaController = this[kSchemaController];
							const hasValidationSchema = opts.schema.body || opts.schema.headers || opts.schema.querystring || opts.schema.params;
							if (!opts.validatorCompiler && hasValidationSchema) schemaController.setupValidator(this[kOptions]);
							try {
								const isCustom = typeof opts?.validatorCompiler === "function" || schemaController.isCustomValidatorCompiler;
								compileSchemasForValidation(context, opts.validatorCompiler || schemaController.validatorCompiler, isCustom);
							} catch (error) {
								throw new FST_ERR_SCH_VALIDATION_BUILD(opts.method, url, error.message);
							}
							if (opts.schema.response && !opts.serializerCompiler) schemaController.setupSerializer(this[kOptions]);
							try {
								compileSchemasForSerialization(context, opts.serializerCompiler || schemaController.serializerCompiler);
							} catch (error) {
								throw new FST_ERR_SCH_SERIALIZATION_BUILD(opts.method, url, error.message);
							}
						}
					});
					done(notHandledErr);
				});
				if (shouldExposeHead && isGetRoute && !isHeadRoute && !hasHEADHandler) {
					const onSendHandlers = parseHeadOnSendHandlers(headOpts.onSend);
					prepareRoute.call(this, {
						method: "HEAD",
						url: path,
						options: {
							...headOpts,
							onSend: onSendHandlers
						},
						isFastify: true
					});
				}
			}
		}
		function routeHandler(req, res, params, context, query) {
			const id = getGenReqId(context.server, req);
			const loggerOpts = { level: context.logLevel };
			if (context.logSerializers) loggerOpts.serializers = context.logSerializers;
			const childLogger = createChildLogger(context, logger, req, id, loggerOpts);
			childLogger[kDisableRequestLogging] = disableRequestLoggingFn ? false : disableRequestLogging;
			if (closing === true) {
				/* istanbul ignore next mac, windows */
				if (req.httpVersionMajor !== 2) res.setHeader("Connection", "close");
				/* istanbul ignore else */
				if (return503OnClosing) {
					res.writeHead(503, {
						"Content-Type": "application/json",
						"Content-Length": "80"
					});
					res.end("{\"error\":\"Service Unavailable\",\"message\":\"Service Unavailable\",\"statusCode\":503}");
					childLogger.info({ res: { statusCode: 503 } }, "request aborted - refusing to accept new requests as server is closing");
					return;
				}
			}
			if (String.prototype.toLowerCase.call(req.headers.connection || "") === "keep-alive") {
				if (keepAliveConnections.has(req.socket) === false) {
					keepAliveConnections.add(req.socket);
					req.socket.on("close", removeTrackedSocket.bind({
						keepAliveConnections,
						socket: req.socket
					}));
				}
			}
			if (req.headers[kRequestAcceptVersion] !== void 0) {
				req.headers["accept-version"] = req.headers[kRequestAcceptVersion];
				req.headers[kRequestAcceptVersion] = void 0;
			}
			const request = new context.Request(id, params, req, query, childLogger, context);
			const reply = new context.Reply(res, request, childLogger);
			const resolvedDisableRequestLogging = disableRequestLoggingFn ? disableRequestLoggingFn(request) : disableRequestLogging;
			childLogger[kDisableRequestLogging] = resolvedDisableRequestLogging;
			if (resolvedDisableRequestLogging === false) childLogger.info({ req: request }, "incoming request");
			const handlerTimeout = context.handlerTimeout;
			if (handlerTimeout > 0) {
				const ac = new AbortController();
				request[kRequestSignal] = ac;
				request[kTimeoutTimer] = setTimeout(() => {
					if (!reply.sent) {
						const err = new FST_ERR_HANDLER_TIMEOUT(handlerTimeout, context.config?.url);
						ac.abort(err);
						reply[kReplyIsError] = true;
						reply.send(err);
					}
				}, handlerTimeout);
				const onAbort = () => {
					if (!ac.signal.aborted) ac.abort();
					clearTimeout(request[kTimeoutTimer]);
				};
				req.on("close", onAbort);
				request[kOnAbort] = onAbort;
			}
			if (hasLogger === true || context.onResponse !== null || handlerTimeout > 0) setupResponseListeners(reply);
			if (context.onRequest !== null) onRequestHookRunner(context.onRequest, request, reply, runPreParsing);
			else runPreParsing(null, request, reply);
			if (context.onRequestAbort !== null) req.on("close", () => {
				/* istanbul ignore else */
				if (req.aborted) onRequestAbortHookRunner(context.onRequestAbort, request, handleOnRequestAbortHooksErrors.bind(null, reply));
			});
			if (context.onTimeout !== null) {
				if (!request.raw.socket._meta) request.raw.socket.on("timeout", handleTimeout);
				request.raw.socket._meta = {
					context,
					request,
					reply
				};
			}
		}
	}
	function handleOnRequestAbortHooksErrors(reply, err) {
		if (err) reply.log.error({ err }, "onRequestAborted hook failed");
	}
	function handleTimeout() {
		const { context, request, reply } = this._meta;
		onTimeoutHookRunner(context.onTimeout, request, reply, noop);
	}
	function normalizeAndValidateMethod(method) {
		if (typeof method !== "string") throw new FST_ERR_ROUTE_METHOD_INVALID();
		method = method.toUpperCase();
		if (!this[kSupportedHTTPMethods].bodyless.has(method) && !this[kSupportedHTTPMethods].bodywith.has(method)) throw new FST_ERR_ROUTE_METHOD_NOT_SUPPORTED(method);
		return method;
	}
	function validateSchemaBodyOption(method, path, schema) {
		if (this[kSupportedHTTPMethods].bodyless.has(method) && schema?.body) throw new FST_ERR_ROUTE_BODY_VALIDATION_SCHEMA_NOT_SUPPORTED(method, path);
	}
	function validateBodyLimitOption(bodyLimit) {
		if (bodyLimit === void 0) return;
		if (!Number.isInteger(bodyLimit) || bodyLimit <= 0) throw new FST_ERR_ROUTE_BODY_LIMIT_OPTION_NOT_INT(bodyLimit);
	}
	function validateHandlerTimeoutOption(handlerTimeout) {
		if (handlerTimeout === void 0) return;
		if (!Number.isInteger(handlerTimeout) || handlerTimeout <= 0) throw new FST_ERR_ROUTE_HANDLER_TIMEOUT_OPTION_NOT_INT(handlerTimeout);
	}
	function runPreParsing(err, request, reply) {
		if (reply.sent === true) return;
		if (err != null) {
			reply[kReplyIsError] = true;
			reply.send(err);
			return;
		}
		request[kRequestPayloadStream] = request.raw;
		if (request[kRouteContext].preParsing !== null) preParsingHookRunner(request[kRouteContext].preParsing, request, reply, handleRequest.bind(request.server));
		else handleRequest.call(request.server, null, request, reply);
	}
	function buildRouterOptions(options, defaultOptions) {
		const routerOptions = options.routerOptions == null ? Object.create(null) : Object.assign(Object.create(null), options.routerOptions);
		const usedDeprecatedOptions = routerKeys.filter((key) => Object.hasOwn(options, key));
		if (usedDeprecatedOptions.length > 0) FSTDEP022(usedDeprecatedOptions.join(", "));
		for (const key of routerKeys) if (!Object.hasOwn(routerOptions, key)) routerOptions[key] = options[key] ?? defaultOptions[key];
		return routerOptions;
	}
	/**
	* Used within the route handler as a `net.Socket.close` event handler.
	* The purpose is to remove a socket from the tracked sockets collection when
	* the socket has naturally timed out.
	*/
	function removeTrackedSocket() {
		this.keepAliveConnections.delete(this.socket);
	}
	function noop() {}
	module.exports = {
		buildRouting,
		validateBodyLimitOption,
		buildRouterOptions
	};
}));
//#endregion
//#region ../../node_modules/.bun/fastify@5.8.4/node_modules/fastify/lib/four-oh-four.js
var require_four_oh_four = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const FindMyWay = require_find_my_way();
	const Reply = require_reply();
	const Request = require_request$1();
	const Context = require_context();
	const { kRoutePrefix, kCanSetNotFoundHandler, kFourOhFourLevelInstance, kFourOhFourContext, kHooks, kErrorHandler } = require_symbols$1();
	const { lifecycleHooks } = require_hooks();
	const { buildErrorHandler } = require_error_handler();
	const { FST_ERR_NOT_FOUND } = require_errors();
	const { createChildLogger } = require_logger_factory();
	const { getGenReqId } = require_req_id_gen_factory();
	/**
	* Each fastify instance have a:
	* kFourOhFourLevelInstance: point to a fastify instance that has the 404 handler set
	* kCanSetNotFoundHandler: bool to track if the 404 handler has already been set
	* kFourOhFour: the singleton instance of this 404 module
	* kFourOhFourContext: the context in the reply object where the handler will be executed
	*/
	function fourOhFour(options) {
		const { logger, disableRequestLogging } = options;
		const router = FindMyWay({
			onBadUrl: createOnBadUrl(),
			defaultRoute: fourOhFourFallBack
		});
		let _onBadUrlHandler = null;
		return {
			router,
			setNotFoundHandler,
			setContext,
			arrange404
		};
		function arrange404(instance) {
			instance[kFourOhFourLevelInstance] = instance;
			instance[kCanSetNotFoundHandler] = true;
			router.onBadUrl = router.onBadUrl.bind(instance);
			router.defaultRoute = router.defaultRoute.bind(instance);
		}
		function basic404(request, reply) {
			const { url, method } = request.raw;
			const message = `Route ${method}:${url} not found`;
			if (!(typeof disableRequestLogging === "function" ? disableRequestLogging(request.raw) : disableRequestLogging)) request.log.info(message);
			reply.code(404).send({
				message,
				error: "Not Found",
				statusCode: 404
			});
		}
		function createOnBadUrl() {
			return function onBadUrl(path, req, res) {
				const fourOhFourContext = this[kFourOhFourLevelInstance][kFourOhFourContext];
				const id = getGenReqId(fourOhFourContext.server, req);
				const childLogger = createChildLogger(fourOhFourContext, logger, req, id);
				const request = new Request(id, null, req, null, childLogger, fourOhFourContext);
				const reply = new Reply(res, request, childLogger);
				_onBadUrlHandler(request, reply);
			};
		}
		function setContext(instance, context) {
			const _404Context = Object.assign({}, instance[kFourOhFourContext]);
			_404Context.onSend = context.onSend;
			context[kFourOhFourContext] = _404Context;
		}
		function setNotFoundHandler(opts, handler, avvio, routeHandler) {
			if (this[kCanSetNotFoundHandler] === void 0) this[kCanSetNotFoundHandler] = true;
			if (this[kFourOhFourContext] === void 0) this[kFourOhFourContext] = null;
			const _fastify = this;
			const prefix = this[kRoutePrefix] || "/";
			if (this[kCanSetNotFoundHandler] === false) throw new Error(`Not found handler already set for Fastify instance with prefix: '${prefix}'`);
			if (typeof opts === "object") {
				if (opts.preHandler) if (Array.isArray(opts.preHandler)) opts.preHandler = opts.preHandler.map((hook) => hook.bind(_fastify));
				else opts.preHandler = opts.preHandler.bind(_fastify);
				if (opts.preValidation) if (Array.isArray(opts.preValidation)) opts.preValidation = opts.preValidation.map((hook) => hook.bind(_fastify));
				else opts.preValidation = opts.preValidation.bind(_fastify);
			}
			if (typeof opts === "function") {
				handler = opts;
				opts = void 0;
			}
			opts = opts || {};
			if (handler) {
				this[kFourOhFourLevelInstance][kCanSetNotFoundHandler] = false;
				handler = handler.bind(this);
				_onBadUrlHandler = handler;
			} else {
				handler = basic404;
				_onBadUrlHandler = basic404;
			}
			this.after((notHandledErr, done) => {
				_setNotFoundHandler.call(this, prefix, opts, handler, avvio, routeHandler);
				done(notHandledErr);
			});
		}
		function _setNotFoundHandler(prefix, opts, handler, avvio, routeHandler) {
			const context = new Context({
				schema: opts.schema,
				handler,
				config: opts.config || {},
				server: this
			});
			avvio.once("preReady", () => {
				const context = this[kFourOhFourContext];
				for (const hook of lifecycleHooks) {
					const toSet = this[kHooks][hook].concat(opts[hook] || []).map((h) => h.bind(this));
					context[hook] = toSet.length ? toSet : null;
				}
				context.errorHandler = opts.errorHandler ? buildErrorHandler(this[kErrorHandler], opts.errorHandler) : this[kErrorHandler];
			});
			if (this[kFourOhFourContext] !== null && prefix === "/") {
				Object.assign(this[kFourOhFourContext], context);
				return;
			}
			this[kFourOhFourLevelInstance][kFourOhFourContext] = context;
			router.all(prefix + (prefix.endsWith("/") ? "*" : "/*"), routeHandler, context);
			router.all(prefix, routeHandler, context);
		}
		function fourOhFourFallBack(req, res) {
			const fourOhFourContext = this[kFourOhFourLevelInstance][kFourOhFourContext];
			const id = getGenReqId(fourOhFourContext.server, req);
			const childLogger = createChildLogger(fourOhFourContext, logger, req, id);
			childLogger.info({ req }, "incoming request");
			const request = new Request(id, null, req, null, childLogger, fourOhFourContext);
			const reply = new Reply(res, request, childLogger);
			request.log.warn("the default handler for 404 did not catch this, this is likely a fastify bug, please report it");
			request.log.warn(router.prettyPrint());
			reply.code(404).send(new FST_ERR_NOT_FOUND());
		}
	}
	module.exports = fourOhFour;
}));
//#endregion
//#region ../../node_modules/.bun/fastify@5.8.4/node_modules/fastify/lib/config-validator.js
/* c8 ignore start */
var require_config_validator$1 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = validate10;
	module.exports.default = validate10;
	const schema11 = {
		"type": "object",
		"additionalProperties": false,
		"properties": {
			"connectionTimeout": {
				"type": "integer",
				"default": 0
			},
			"keepAliveTimeout": {
				"type": "integer",
				"default": 72e3
			},
			"forceCloseConnections": { "oneOf": [{
				"type": "string",
				"pattern": "idle"
			}, { "type": "boolean" }] },
			"maxRequestsPerSocket": {
				"type": "integer",
				"default": 0,
				"nullable": true
			},
			"requestTimeout": {
				"type": "integer",
				"default": 0
			},
			"handlerTimeout": {
				"type": "integer",
				"default": 0
			},
			"bodyLimit": {
				"type": "integer",
				"default": 1048576
			},
			"caseSensitive": {
				"type": "boolean",
				"default": true
			},
			"allowUnsafeRegex": {
				"type": "boolean",
				"default": false
			},
			"http2": { "type": "boolean" },
			"https": {
				"if": { "not": { "oneOf": [
					{ "type": "boolean" },
					{ "type": "null" },
					{
						"type": "object",
						"additionalProperties": false,
						"required": ["allowHTTP1"],
						"properties": { "allowHTTP1": { "type": "boolean" } }
					}
				] } },
				"then": { "setDefaultValue": true }
			},
			"ignoreTrailingSlash": {
				"type": "boolean",
				"default": false
			},
			"ignoreDuplicateSlashes": {
				"type": "boolean",
				"default": false
			},
			"disableRequestLogging": { "default": false },
			"maxParamLength": {
				"type": "integer",
				"default": 100
			},
			"onProtoPoisoning": {
				"type": "string",
				"default": "error"
			},
			"onConstructorPoisoning": {
				"type": "string",
				"default": "error"
			},
			"pluginTimeout": {
				"type": "integer",
				"default": 1e4
			},
			"requestIdHeader": {
				"anyOf": [{ "type": "boolean" }, { "type": "string" }],
				"default": false
			},
			"requestIdLogLabel": {
				"type": "string",
				"default": "reqId"
			},
			"http2SessionTimeout": {
				"type": "integer",
				"default": 72e3
			},
			"exposeHeadRoutes": {
				"type": "boolean",
				"default": true
			},
			"useSemicolonDelimiter": {
				"type": "boolean",
				"default": false
			},
			"routerOptions": {
				"type": "object",
				"additionalProperties": true,
				"properties": {
					"ignoreTrailingSlash": {
						"type": "boolean",
						"default": false
					},
					"ignoreDuplicateSlashes": {
						"type": "boolean",
						"default": false
					},
					"maxParamLength": {
						"type": "integer",
						"default": 100
					},
					"allowUnsafeRegex": {
						"type": "boolean",
						"default": false
					},
					"useSemicolonDelimiter": {
						"type": "boolean",
						"default": false
					}
				}
			},
			"constraints": {
				"type": "object",
				"additionalProperties": {
					"type": "object",
					"required": [
						"name",
						"storage",
						"validate",
						"deriveConstraint"
					],
					"additionalProperties": true,
					"properties": {
						"name": { "type": "string" },
						"storage": {},
						"validate": {},
						"deriveConstraint": {}
					}
				}
			}
		}
	};
	const func2 = Object.prototype.hasOwnProperty;
	const pattern0 = /* @__PURE__ */ new RegExp("idle", "u");
	function validate10(data, { instancePath = "", parentData, parentDataProperty, rootData = data } = {}) {
		let vErrors = null;
		let errors = 0;
		if (errors === 0) if (data && typeof data == "object" && !Array.isArray(data)) {
			if (data.connectionTimeout === void 0) data.connectionTimeout = 0;
			if (data.keepAliveTimeout === void 0) data.keepAliveTimeout = 72e3;
			if (data.maxRequestsPerSocket === void 0) data.maxRequestsPerSocket = 0;
			if (data.requestTimeout === void 0) data.requestTimeout = 0;
			if (data.handlerTimeout === void 0) data.handlerTimeout = 0;
			if (data.bodyLimit === void 0) data.bodyLimit = 1048576;
			if (data.caseSensitive === void 0) data.caseSensitive = true;
			if (data.allowUnsafeRegex === void 0) data.allowUnsafeRegex = false;
			if (data.ignoreTrailingSlash === void 0) data.ignoreTrailingSlash = false;
			if (data.ignoreDuplicateSlashes === void 0) data.ignoreDuplicateSlashes = false;
			if (data.disableRequestLogging === void 0) data.disableRequestLogging = false;
			if (data.maxParamLength === void 0) data.maxParamLength = 100;
			if (data.onProtoPoisoning === void 0) data.onProtoPoisoning = "error";
			if (data.onConstructorPoisoning === void 0) data.onConstructorPoisoning = "error";
			if (data.pluginTimeout === void 0) data.pluginTimeout = 1e4;
			if (data.requestIdHeader === void 0) data.requestIdHeader = false;
			if (data.requestIdLogLabel === void 0) data.requestIdLogLabel = "reqId";
			if (data.http2SessionTimeout === void 0) data.http2SessionTimeout = 72e3;
			if (data.exposeHeadRoutes === void 0) data.exposeHeadRoutes = true;
			if (data.useSemicolonDelimiter === void 0) data.useSemicolonDelimiter = false;
			const _errs1 = errors;
			for (const key0 in data) if (!func2.call(schema11.properties, key0)) delete data[key0];
			if (_errs1 === errors) {
				let data0 = data.connectionTimeout;
				const _errs2 = errors;
				if (!(typeof data0 == "number" && !(data0 % 1) && !isNaN(data0) && isFinite(data0))) {
					let dataType0 = typeof data0;
					let coerced0 = void 0;
					if (!(coerced0 !== void 0)) if (dataType0 === "boolean" || data0 === null || dataType0 === "string" && data0 && data0 == +data0 && !(data0 % 1)) coerced0 = +data0;
					else {
						validate10.errors = [{
							instancePath: instancePath + "/connectionTimeout",
							schemaPath: "#/properties/connectionTimeout/type",
							keyword: "type",
							params: { type: "integer" },
							message: "must be integer"
						}];
						return false;
					}
					if (coerced0 !== void 0) {
						data0 = coerced0;
						if (data !== void 0) data["connectionTimeout"] = coerced0;
					}
				}
				var valid0 = _errs2 === errors;
				if (valid0) {
					let data1 = data.keepAliveTimeout;
					const _errs4 = errors;
					if (!(typeof data1 == "number" && !(data1 % 1) && !isNaN(data1) && isFinite(data1))) {
						let dataType1 = typeof data1;
						let coerced1 = void 0;
						if (!(coerced1 !== void 0)) if (dataType1 === "boolean" || data1 === null || dataType1 === "string" && data1 && data1 == +data1 && !(data1 % 1)) coerced1 = +data1;
						else {
							validate10.errors = [{
								instancePath: instancePath + "/keepAliveTimeout",
								schemaPath: "#/properties/keepAliveTimeout/type",
								keyword: "type",
								params: { type: "integer" },
								message: "must be integer"
							}];
							return false;
						}
						if (coerced1 !== void 0) {
							data1 = coerced1;
							if (data !== void 0) data["keepAliveTimeout"] = coerced1;
						}
					}
					var valid0 = _errs4 === errors;
					if (valid0) {
						if (data.forceCloseConnections !== void 0) {
							let data2 = data.forceCloseConnections;
							const _errs6 = errors;
							const _errs7 = errors;
							let valid1 = false;
							let passing0 = null;
							const _errs8 = errors;
							if (typeof data2 !== "string") {
								let dataType2 = typeof data2;
								let coerced2 = void 0;
								if (!(coerced2 !== void 0)) if (dataType2 == "number" || dataType2 == "boolean") coerced2 = "" + data2;
								else if (data2 === null) coerced2 = "";
								else {
									const err0 = {
										instancePath: instancePath + "/forceCloseConnections",
										schemaPath: "#/properties/forceCloseConnections/oneOf/0/type",
										keyword: "type",
										params: { type: "string" },
										message: "must be string"
									};
									if (vErrors === null) vErrors = [err0];
									else vErrors.push(err0);
									errors++;
								}
								if (coerced2 !== void 0) {
									data2 = coerced2;
									if (data !== void 0) data["forceCloseConnections"] = coerced2;
								}
							}
							if (errors === _errs8) {
								if (typeof data2 === "string") {
									if (!pattern0.test(data2)) {
										const err1 = {
											instancePath: instancePath + "/forceCloseConnections",
											schemaPath: "#/properties/forceCloseConnections/oneOf/0/pattern",
											keyword: "pattern",
											params: { pattern: "idle" },
											message: "must match pattern \"idle\""
										};
										if (vErrors === null) vErrors = [err1];
										else vErrors.push(err1);
										errors++;
									}
								}
							}
							var _valid0 = _errs8 === errors;
							if (_valid0) {
								valid1 = true;
								passing0 = 0;
							}
							const _errs10 = errors;
							if (typeof data2 !== "boolean") {
								let coerced3 = void 0;
								if (!(coerced3 !== void 0)) if (data2 === "false" || data2 === 0 || data2 === null) coerced3 = false;
								else if (data2 === "true" || data2 === 1) coerced3 = true;
								else {
									const err2 = {
										instancePath: instancePath + "/forceCloseConnections",
										schemaPath: "#/properties/forceCloseConnections/oneOf/1/type",
										keyword: "type",
										params: { type: "boolean" },
										message: "must be boolean"
									};
									if (vErrors === null) vErrors = [err2];
									else vErrors.push(err2);
									errors++;
								}
								if (coerced3 !== void 0) {
									data2 = coerced3;
									if (data !== void 0) data["forceCloseConnections"] = coerced3;
								}
							}
							var _valid0 = _errs10 === errors;
							if (_valid0 && valid1) {
								valid1 = false;
								passing0 = [passing0, 1];
							} else if (_valid0) {
								valid1 = true;
								passing0 = 1;
							}
							if (!valid1) {
								const err3 = {
									instancePath: instancePath + "/forceCloseConnections",
									schemaPath: "#/properties/forceCloseConnections/oneOf",
									keyword: "oneOf",
									params: { passingSchemas: passing0 },
									message: "must match exactly one schema in oneOf"
								};
								if (vErrors === null) vErrors = [err3];
								else vErrors.push(err3);
								errors++;
								validate10.errors = vErrors;
								return false;
							} else {
								errors = _errs7;
								if (vErrors !== null) if (_errs7) vErrors.length = _errs7;
								else vErrors = null;
							}
							var valid0 = _errs6 === errors;
						} else var valid0 = true;
						if (valid0) {
							let data3 = data.maxRequestsPerSocket;
							const _errs12 = errors;
							if (!(typeof data3 == "number" && !(data3 % 1) && !isNaN(data3) && isFinite(data3)) && data3 !== null) {
								let dataType4 = typeof data3;
								let coerced4 = void 0;
								if (!(coerced4 !== void 0)) if (dataType4 === "boolean" || data3 === null || dataType4 === "string" && data3 && data3 == +data3 && !(data3 % 1)) coerced4 = +data3;
								else if (data3 === "" || data3 === 0 || data3 === false) coerced4 = null;
								else {
									validate10.errors = [{
										instancePath: instancePath + "/maxRequestsPerSocket",
										schemaPath: "#/properties/maxRequestsPerSocket/type",
										keyword: "type",
										params: { type: "integer" },
										message: "must be integer"
									}];
									return false;
								}
								if (coerced4 !== void 0) {
									data3 = coerced4;
									if (data !== void 0) data["maxRequestsPerSocket"] = coerced4;
								}
							}
							var valid0 = _errs12 === errors;
							if (valid0) {
								let data4 = data.requestTimeout;
								const _errs15 = errors;
								if (!(typeof data4 == "number" && !(data4 % 1) && !isNaN(data4) && isFinite(data4))) {
									let dataType5 = typeof data4;
									let coerced5 = void 0;
									if (!(coerced5 !== void 0)) if (dataType5 === "boolean" || data4 === null || dataType5 === "string" && data4 && data4 == +data4 && !(data4 % 1)) coerced5 = +data4;
									else {
										validate10.errors = [{
											instancePath: instancePath + "/requestTimeout",
											schemaPath: "#/properties/requestTimeout/type",
											keyword: "type",
											params: { type: "integer" },
											message: "must be integer"
										}];
										return false;
									}
									if (coerced5 !== void 0) {
										data4 = coerced5;
										if (data !== void 0) data["requestTimeout"] = coerced5;
									}
								}
								var valid0 = _errs15 === errors;
								if (valid0) {
									let data5 = data.handlerTimeout;
									const _errs17 = errors;
									if (!(typeof data5 == "number" && !(data5 % 1) && !isNaN(data5) && isFinite(data5))) {
										let dataType6 = typeof data5;
										let coerced6 = void 0;
										if (!(coerced6 !== void 0)) if (dataType6 === "boolean" || data5 === null || dataType6 === "string" && data5 && data5 == +data5 && !(data5 % 1)) coerced6 = +data5;
										else {
											validate10.errors = [{
												instancePath: instancePath + "/handlerTimeout",
												schemaPath: "#/properties/handlerTimeout/type",
												keyword: "type",
												params: { type: "integer" },
												message: "must be integer"
											}];
											return false;
										}
										if (coerced6 !== void 0) {
											data5 = coerced6;
											if (data !== void 0) data["handlerTimeout"] = coerced6;
										}
									}
									var valid0 = _errs17 === errors;
									if (valid0) {
										let data6 = data.bodyLimit;
										const _errs19 = errors;
										if (!(typeof data6 == "number" && !(data6 % 1) && !isNaN(data6) && isFinite(data6))) {
											let dataType7 = typeof data6;
											let coerced7 = void 0;
											if (!(coerced7 !== void 0)) if (dataType7 === "boolean" || data6 === null || dataType7 === "string" && data6 && data6 == +data6 && !(data6 % 1)) coerced7 = +data6;
											else {
												validate10.errors = [{
													instancePath: instancePath + "/bodyLimit",
													schemaPath: "#/properties/bodyLimit/type",
													keyword: "type",
													params: { type: "integer" },
													message: "must be integer"
												}];
												return false;
											}
											if (coerced7 !== void 0) {
												data6 = coerced7;
												if (data !== void 0) data["bodyLimit"] = coerced7;
											}
										}
										var valid0 = _errs19 === errors;
										if (valid0) {
											let data7 = data.caseSensitive;
											const _errs21 = errors;
											if (typeof data7 !== "boolean") {
												let coerced8 = void 0;
												if (!(coerced8 !== void 0)) if (data7 === "false" || data7 === 0 || data7 === null) coerced8 = false;
												else if (data7 === "true" || data7 === 1) coerced8 = true;
												else {
													validate10.errors = [{
														instancePath: instancePath + "/caseSensitive",
														schemaPath: "#/properties/caseSensitive/type",
														keyword: "type",
														params: { type: "boolean" },
														message: "must be boolean"
													}];
													return false;
												}
												if (coerced8 !== void 0) {
													data7 = coerced8;
													if (data !== void 0) data["caseSensitive"] = coerced8;
												}
											}
											var valid0 = _errs21 === errors;
											if (valid0) {
												let data8 = data.allowUnsafeRegex;
												const _errs23 = errors;
												if (typeof data8 !== "boolean") {
													let coerced9 = void 0;
													if (!(coerced9 !== void 0)) if (data8 === "false" || data8 === 0 || data8 === null) coerced9 = false;
													else if (data8 === "true" || data8 === 1) coerced9 = true;
													else {
														validate10.errors = [{
															instancePath: instancePath + "/allowUnsafeRegex",
															schemaPath: "#/properties/allowUnsafeRegex/type",
															keyword: "type",
															params: { type: "boolean" },
															message: "must be boolean"
														}];
														return false;
													}
													if (coerced9 !== void 0) {
														data8 = coerced9;
														if (data !== void 0) data["allowUnsafeRegex"] = coerced9;
													}
												}
												var valid0 = _errs23 === errors;
												if (valid0) {
													if (data.http2 !== void 0) {
														let data9 = data.http2;
														const _errs25 = errors;
														if (typeof data9 !== "boolean") {
															let coerced10 = void 0;
															if (!(coerced10 !== void 0)) if (data9 === "false" || data9 === 0 || data9 === null) coerced10 = false;
															else if (data9 === "true" || data9 === 1) coerced10 = true;
															else {
																validate10.errors = [{
																	instancePath: instancePath + "/http2",
																	schemaPath: "#/properties/http2/type",
																	keyword: "type",
																	params: { type: "boolean" },
																	message: "must be boolean"
																}];
																return false;
															}
															if (coerced10 !== void 0) {
																data9 = coerced10;
																if (data !== void 0) data["http2"] = coerced10;
															}
														}
														var valid0 = _errs25 === errors;
													} else var valid0 = true;
													if (valid0) {
														if (data.https !== void 0) {
															let data10 = data.https;
															const _errs27 = errors;
															const _errs28 = errors;
															let valid2 = true;
															const _errs29 = errors;
															const _errs30 = errors;
															const _errs31 = errors;
															const _errs32 = errors;
															let valid4 = false;
															let passing1 = null;
															const _errs33 = errors;
															if (typeof data10 !== "boolean") {
																let coerced11 = void 0;
																if (!(coerced11 !== void 0)) if (data10 === "false" || data10 === 0 || data10 === null) coerced11 = false;
																else if (data10 === "true" || data10 === 1) coerced11 = true;
																else {
																	const err4 = {};
																	if (vErrors === null) vErrors = [err4];
																	else vErrors.push(err4);
																	errors++;
																}
																if (coerced11 !== void 0) {
																	data10 = coerced11;
																	if (data !== void 0) data["https"] = coerced11;
																}
															}
															var _valid2 = _errs33 === errors;
															if (_valid2) {
																valid4 = true;
																passing1 = 0;
															}
															const _errs35 = errors;
															if (data10 !== null) {
																let coerced12 = void 0;
																if (!(coerced12 !== void 0)) if (data10 === "" || data10 === 0 || data10 === false) coerced12 = null;
																else {
																	const err5 = {};
																	if (vErrors === null) vErrors = [err5];
																	else vErrors.push(err5);
																	errors++;
																}
																if (coerced12 !== void 0) {
																	data10 = coerced12;
																	if (data !== void 0) data["https"] = coerced12;
																}
															}
															var _valid2 = _errs35 === errors;
															if (_valid2 && valid4) {
																valid4 = false;
																passing1 = [passing1, 1];
															} else {
																if (_valid2) {
																	valid4 = true;
																	passing1 = 1;
																}
																const _errs37 = errors;
																if (errors === _errs37) if (data10 && typeof data10 == "object" && !Array.isArray(data10)) if (data10.allowHTTP1 === void 0 && "allowHTTP1") {
																	const err6 = {};
																	if (vErrors === null) vErrors = [err6];
																	else vErrors.push(err6);
																	errors++;
																} else {
																	const _errs39 = errors;
																	for (const key1 in data10) if (!(key1 === "allowHTTP1")) delete data10[key1];
																	if (_errs39 === errors) {
																		if (data10.allowHTTP1 !== void 0) {
																			let data11 = data10.allowHTTP1;
																			if (typeof data11 !== "boolean") {
																				let coerced13 = void 0;
																				if (!(coerced13 !== void 0)) if (data11 === "false" || data11 === 0 || data11 === null) coerced13 = false;
																				else if (data11 === "true" || data11 === 1) coerced13 = true;
																				else {
																					const err7 = {};
																					if (vErrors === null) vErrors = [err7];
																					else vErrors.push(err7);
																					errors++;
																				}
																				if (coerced13 !== void 0) {
																					data11 = coerced13;
																					if (data10 !== void 0) data10["allowHTTP1"] = coerced13;
																				}
																			}
																		}
																	}
																}
																else {
																	const err8 = {};
																	if (vErrors === null) vErrors = [err8];
																	else vErrors.push(err8);
																	errors++;
																}
																var _valid2 = _errs37 === errors;
																if (_valid2 && valid4) {
																	valid4 = false;
																	passing1 = [passing1, 2];
																} else if (_valid2) {
																	valid4 = true;
																	passing1 = 2;
																}
															}
															if (!valid4) {
																const err9 = {};
																if (vErrors === null) vErrors = [err9];
																else vErrors.push(err9);
																errors++;
															} else {
																errors = _errs32;
																if (vErrors !== null) if (_errs32) vErrors.length = _errs32;
																else vErrors = null;
															}
															if (_errs31 === errors) {
																const err10 = {};
																if (vErrors === null) vErrors = [err10];
																else vErrors.push(err10);
																errors++;
															} else {
																errors = _errs30;
																if (vErrors !== null) if (_errs30) vErrors.length = _errs30;
																else vErrors = null;
															}
															var _valid1 = _errs29 === errors;
															errors = _errs28;
															if (vErrors !== null) if (_errs28) vErrors.length = _errs28;
															else vErrors = null;
															if (_valid1) {
																const _errs42 = errors;
																data["https"] = true;
																var _valid1 = _errs42 === errors;
																valid2 = _valid1;
															}
															if (!valid2) {
																const err11 = {
																	instancePath: instancePath + "/https",
																	schemaPath: "#/properties/https/if",
																	keyword: "if",
																	params: { failingKeyword: "then" },
																	message: "must match \"then\" schema"
																};
																if (vErrors === null) vErrors = [err11];
																else vErrors.push(err11);
																errors++;
																validate10.errors = vErrors;
																return false;
															}
															var valid0 = _errs27 === errors;
														} else var valid0 = true;
														if (valid0) {
															let data12 = data.ignoreTrailingSlash;
															const _errs43 = errors;
															if (typeof data12 !== "boolean") {
																let coerced14 = void 0;
																if (!(coerced14 !== void 0)) if (data12 === "false" || data12 === 0 || data12 === null) coerced14 = false;
																else if (data12 === "true" || data12 === 1) coerced14 = true;
																else {
																	validate10.errors = [{
																		instancePath: instancePath + "/ignoreTrailingSlash",
																		schemaPath: "#/properties/ignoreTrailingSlash/type",
																		keyword: "type",
																		params: { type: "boolean" },
																		message: "must be boolean"
																	}];
																	return false;
																}
																if (coerced14 !== void 0) {
																	data12 = coerced14;
																	if (data !== void 0) data["ignoreTrailingSlash"] = coerced14;
																}
															}
															var valid0 = _errs43 === errors;
															if (valid0) {
																let data13 = data.ignoreDuplicateSlashes;
																const _errs45 = errors;
																if (typeof data13 !== "boolean") {
																	let coerced15 = void 0;
																	if (!(coerced15 !== void 0)) if (data13 === "false" || data13 === 0 || data13 === null) coerced15 = false;
																	else if (data13 === "true" || data13 === 1) coerced15 = true;
																	else {
																		validate10.errors = [{
																			instancePath: instancePath + "/ignoreDuplicateSlashes",
																			schemaPath: "#/properties/ignoreDuplicateSlashes/type",
																			keyword: "type",
																			params: { type: "boolean" },
																			message: "must be boolean"
																		}];
																		return false;
																	}
																	if (coerced15 !== void 0) {
																		data13 = coerced15;
																		if (data !== void 0) data["ignoreDuplicateSlashes"] = coerced15;
																	}
																}
																var valid0 = _errs45 === errors;
																if (valid0) {
																	let data14 = data.maxParamLength;
																	const _errs47 = errors;
																	if (!(typeof data14 == "number" && !(data14 % 1) && !isNaN(data14) && isFinite(data14))) {
																		let dataType16 = typeof data14;
																		let coerced16 = void 0;
																		if (!(coerced16 !== void 0)) if (dataType16 === "boolean" || data14 === null || dataType16 === "string" && data14 && data14 == +data14 && !(data14 % 1)) coerced16 = +data14;
																		else {
																			validate10.errors = [{
																				instancePath: instancePath + "/maxParamLength",
																				schemaPath: "#/properties/maxParamLength/type",
																				keyword: "type",
																				params: { type: "integer" },
																				message: "must be integer"
																			}];
																			return false;
																		}
																		if (coerced16 !== void 0) {
																			data14 = coerced16;
																			if (data !== void 0) data["maxParamLength"] = coerced16;
																		}
																	}
																	var valid0 = _errs47 === errors;
																	if (valid0) {
																		let data15 = data.onProtoPoisoning;
																		const _errs49 = errors;
																		if (typeof data15 !== "string") {
																			let dataType17 = typeof data15;
																			let coerced17 = void 0;
																			if (!(coerced17 !== void 0)) if (dataType17 == "number" || dataType17 == "boolean") coerced17 = "" + data15;
																			else if (data15 === null) coerced17 = "";
																			else {
																				validate10.errors = [{
																					instancePath: instancePath + "/onProtoPoisoning",
																					schemaPath: "#/properties/onProtoPoisoning/type",
																					keyword: "type",
																					params: { type: "string" },
																					message: "must be string"
																				}];
																				return false;
																			}
																			if (coerced17 !== void 0) {
																				data15 = coerced17;
																				if (data !== void 0) data["onProtoPoisoning"] = coerced17;
																			}
																		}
																		var valid0 = _errs49 === errors;
																		if (valid0) {
																			let data16 = data.onConstructorPoisoning;
																			const _errs51 = errors;
																			if (typeof data16 !== "string") {
																				let dataType18 = typeof data16;
																				let coerced18 = void 0;
																				if (!(coerced18 !== void 0)) if (dataType18 == "number" || dataType18 == "boolean") coerced18 = "" + data16;
																				else if (data16 === null) coerced18 = "";
																				else {
																					validate10.errors = [{
																						instancePath: instancePath + "/onConstructorPoisoning",
																						schemaPath: "#/properties/onConstructorPoisoning/type",
																						keyword: "type",
																						params: { type: "string" },
																						message: "must be string"
																					}];
																					return false;
																				}
																				if (coerced18 !== void 0) {
																					data16 = coerced18;
																					if (data !== void 0) data["onConstructorPoisoning"] = coerced18;
																				}
																			}
																			var valid0 = _errs51 === errors;
																			if (valid0) {
																				let data17 = data.pluginTimeout;
																				const _errs53 = errors;
																				if (!(typeof data17 == "number" && !(data17 % 1) && !isNaN(data17) && isFinite(data17))) {
																					let dataType19 = typeof data17;
																					let coerced19 = void 0;
																					if (!(coerced19 !== void 0)) if (dataType19 === "boolean" || data17 === null || dataType19 === "string" && data17 && data17 == +data17 && !(data17 % 1)) coerced19 = +data17;
																					else {
																						validate10.errors = [{
																							instancePath: instancePath + "/pluginTimeout",
																							schemaPath: "#/properties/pluginTimeout/type",
																							keyword: "type",
																							params: { type: "integer" },
																							message: "must be integer"
																						}];
																						return false;
																					}
																					if (coerced19 !== void 0) {
																						data17 = coerced19;
																						if (data !== void 0) data["pluginTimeout"] = coerced19;
																					}
																				}
																				var valid0 = _errs53 === errors;
																				if (valid0) {
																					let data18 = data.requestIdHeader;
																					const _errs55 = errors;
																					const _errs56 = errors;
																					let valid6 = false;
																					const _errs57 = errors;
																					if (typeof data18 !== "boolean") {
																						let coerced20 = void 0;
																						if (!(coerced20 !== void 0)) if (data18 === "false" || data18 === 0 || data18 === null) coerced20 = false;
																						else if (data18 === "true" || data18 === 1) coerced20 = true;
																						else {
																							const err12 = {
																								instancePath: instancePath + "/requestIdHeader",
																								schemaPath: "#/properties/requestIdHeader/anyOf/0/type",
																								keyword: "type",
																								params: { type: "boolean" },
																								message: "must be boolean"
																							};
																							if (vErrors === null) vErrors = [err12];
																							else vErrors.push(err12);
																							errors++;
																						}
																						if (coerced20 !== void 0) {
																							data18 = coerced20;
																							if (data !== void 0) data["requestIdHeader"] = coerced20;
																						}
																					}
																					var _valid3 = _errs57 === errors;
																					valid6 = valid6 || _valid3;
																					if (!valid6) {
																						const _errs59 = errors;
																						if (typeof data18 !== "string") {
																							let dataType21 = typeof data18;
																							let coerced21 = void 0;
																							if (!(coerced21 !== void 0)) if (dataType21 == "number" || dataType21 == "boolean") coerced21 = "" + data18;
																							else if (data18 === null) coerced21 = "";
																							else {
																								const err13 = {
																									instancePath: instancePath + "/requestIdHeader",
																									schemaPath: "#/properties/requestIdHeader/anyOf/1/type",
																									keyword: "type",
																									params: { type: "string" },
																									message: "must be string"
																								};
																								if (vErrors === null) vErrors = [err13];
																								else vErrors.push(err13);
																								errors++;
																							}
																							if (coerced21 !== void 0) {
																								data18 = coerced21;
																								if (data !== void 0) data["requestIdHeader"] = coerced21;
																							}
																						}
																						var _valid3 = _errs59 === errors;
																						valid6 = valid6 || _valid3;
																					}
																					if (!valid6) {
																						const err14 = {
																							instancePath: instancePath + "/requestIdHeader",
																							schemaPath: "#/properties/requestIdHeader/anyOf",
																							keyword: "anyOf",
																							params: {},
																							message: "must match a schema in anyOf"
																						};
																						if (vErrors === null) vErrors = [err14];
																						else vErrors.push(err14);
																						errors++;
																						validate10.errors = vErrors;
																						return false;
																					} else {
																						errors = _errs56;
																						if (vErrors !== null) if (_errs56) vErrors.length = _errs56;
																						else vErrors = null;
																					}
																					var valid0 = _errs55 === errors;
																					if (valid0) {
																						let data19 = data.requestIdLogLabel;
																						const _errs61 = errors;
																						if (typeof data19 !== "string") {
																							let dataType22 = typeof data19;
																							let coerced22 = void 0;
																							if (!(coerced22 !== void 0)) if (dataType22 == "number" || dataType22 == "boolean") coerced22 = "" + data19;
																							else if (data19 === null) coerced22 = "";
																							else {
																								validate10.errors = [{
																									instancePath: instancePath + "/requestIdLogLabel",
																									schemaPath: "#/properties/requestIdLogLabel/type",
																									keyword: "type",
																									params: { type: "string" },
																									message: "must be string"
																								}];
																								return false;
																							}
																							if (coerced22 !== void 0) {
																								data19 = coerced22;
																								if (data !== void 0) data["requestIdLogLabel"] = coerced22;
																							}
																						}
																						var valid0 = _errs61 === errors;
																						if (valid0) {
																							let data20 = data.http2SessionTimeout;
																							const _errs63 = errors;
																							if (!(typeof data20 == "number" && !(data20 % 1) && !isNaN(data20) && isFinite(data20))) {
																								let dataType23 = typeof data20;
																								let coerced23 = void 0;
																								if (!(coerced23 !== void 0)) if (dataType23 === "boolean" || data20 === null || dataType23 === "string" && data20 && data20 == +data20 && !(data20 % 1)) coerced23 = +data20;
																								else {
																									validate10.errors = [{
																										instancePath: instancePath + "/http2SessionTimeout",
																										schemaPath: "#/properties/http2SessionTimeout/type",
																										keyword: "type",
																										params: { type: "integer" },
																										message: "must be integer"
																									}];
																									return false;
																								}
																								if (coerced23 !== void 0) {
																									data20 = coerced23;
																									if (data !== void 0) data["http2SessionTimeout"] = coerced23;
																								}
																							}
																							var valid0 = _errs63 === errors;
																							if (valid0) {
																								let data21 = data.exposeHeadRoutes;
																								const _errs65 = errors;
																								if (typeof data21 !== "boolean") {
																									let coerced24 = void 0;
																									if (!(coerced24 !== void 0)) if (data21 === "false" || data21 === 0 || data21 === null) coerced24 = false;
																									else if (data21 === "true" || data21 === 1) coerced24 = true;
																									else {
																										validate10.errors = [{
																											instancePath: instancePath + "/exposeHeadRoutes",
																											schemaPath: "#/properties/exposeHeadRoutes/type",
																											keyword: "type",
																											params: { type: "boolean" },
																											message: "must be boolean"
																										}];
																										return false;
																									}
																									if (coerced24 !== void 0) {
																										data21 = coerced24;
																										if (data !== void 0) data["exposeHeadRoutes"] = coerced24;
																									}
																								}
																								var valid0 = _errs65 === errors;
																								if (valid0) {
																									let data22 = data.useSemicolonDelimiter;
																									const _errs67 = errors;
																									if (typeof data22 !== "boolean") {
																										let coerced25 = void 0;
																										if (!(coerced25 !== void 0)) if (data22 === "false" || data22 === 0 || data22 === null) coerced25 = false;
																										else if (data22 === "true" || data22 === 1) coerced25 = true;
																										else {
																											validate10.errors = [{
																												instancePath: instancePath + "/useSemicolonDelimiter",
																												schemaPath: "#/properties/useSemicolonDelimiter/type",
																												keyword: "type",
																												params: { type: "boolean" },
																												message: "must be boolean"
																											}];
																											return false;
																										}
																										if (coerced25 !== void 0) {
																											data22 = coerced25;
																											if (data !== void 0) data["useSemicolonDelimiter"] = coerced25;
																										}
																									}
																									var valid0 = _errs67 === errors;
																									if (valid0) {
																										if (data.routerOptions !== void 0) {
																											let data23 = data.routerOptions;
																											const _errs69 = errors;
																											if (errors === _errs69) if (data23 && typeof data23 == "object" && !Array.isArray(data23)) {
																												if (data23.ignoreTrailingSlash === void 0) data23.ignoreTrailingSlash = false;
																												if (data23.ignoreDuplicateSlashes === void 0) data23.ignoreDuplicateSlashes = false;
																												if (data23.maxParamLength === void 0) data23.maxParamLength = 100;
																												if (data23.allowUnsafeRegex === void 0) data23.allowUnsafeRegex = false;
																												if (data23.useSemicolonDelimiter === void 0) data23.useSemicolonDelimiter = false;
																												let data24 = data23.ignoreTrailingSlash;
																												const _errs72 = errors;
																												if (typeof data24 !== "boolean") {
																													let coerced26 = void 0;
																													if (!(coerced26 !== void 0)) if (data24 === "false" || data24 === 0 || data24 === null) coerced26 = false;
																													else if (data24 === "true" || data24 === 1) coerced26 = true;
																													else {
																														validate10.errors = [{
																															instancePath: instancePath + "/routerOptions/ignoreTrailingSlash",
																															schemaPath: "#/properties/routerOptions/properties/ignoreTrailingSlash/type",
																															keyword: "type",
																															params: { type: "boolean" },
																															message: "must be boolean"
																														}];
																														return false;
																													}
																													if (coerced26 !== void 0) {
																														data24 = coerced26;
																														if (data23 !== void 0) data23["ignoreTrailingSlash"] = coerced26;
																													}
																												}
																												var valid7 = _errs72 === errors;
																												if (valid7) {
																													let data25 = data23.ignoreDuplicateSlashes;
																													const _errs74 = errors;
																													if (typeof data25 !== "boolean") {
																														let coerced27 = void 0;
																														if (!(coerced27 !== void 0)) if (data25 === "false" || data25 === 0 || data25 === null) coerced27 = false;
																														else if (data25 === "true" || data25 === 1) coerced27 = true;
																														else {
																															validate10.errors = [{
																																instancePath: instancePath + "/routerOptions/ignoreDuplicateSlashes",
																																schemaPath: "#/properties/routerOptions/properties/ignoreDuplicateSlashes/type",
																																keyword: "type",
																																params: { type: "boolean" },
																																message: "must be boolean"
																															}];
																															return false;
																														}
																														if (coerced27 !== void 0) {
																															data25 = coerced27;
																															if (data23 !== void 0) data23["ignoreDuplicateSlashes"] = coerced27;
																														}
																													}
																													var valid7 = _errs74 === errors;
																													if (valid7) {
																														let data26 = data23.maxParamLength;
																														const _errs76 = errors;
																														if (!(typeof data26 == "number" && !(data26 % 1) && !isNaN(data26) && isFinite(data26))) {
																															let dataType28 = typeof data26;
																															let coerced28 = void 0;
																															if (!(coerced28 !== void 0)) if (dataType28 === "boolean" || data26 === null || dataType28 === "string" && data26 && data26 == +data26 && !(data26 % 1)) coerced28 = +data26;
																															else {
																																validate10.errors = [{
																																	instancePath: instancePath + "/routerOptions/maxParamLength",
																																	schemaPath: "#/properties/routerOptions/properties/maxParamLength/type",
																																	keyword: "type",
																																	params: { type: "integer" },
																																	message: "must be integer"
																																}];
																																return false;
																															}
																															if (coerced28 !== void 0) {
																																data26 = coerced28;
																																if (data23 !== void 0) data23["maxParamLength"] = coerced28;
																															}
																														}
																														var valid7 = _errs76 === errors;
																														if (valid7) {
																															let data27 = data23.allowUnsafeRegex;
																															const _errs78 = errors;
																															if (typeof data27 !== "boolean") {
																																let coerced29 = void 0;
																																if (!(coerced29 !== void 0)) if (data27 === "false" || data27 === 0 || data27 === null) coerced29 = false;
																																else if (data27 === "true" || data27 === 1) coerced29 = true;
																																else {
																																	validate10.errors = [{
																																		instancePath: instancePath + "/routerOptions/allowUnsafeRegex",
																																		schemaPath: "#/properties/routerOptions/properties/allowUnsafeRegex/type",
																																		keyword: "type",
																																		params: { type: "boolean" },
																																		message: "must be boolean"
																																	}];
																																	return false;
																																}
																																if (coerced29 !== void 0) {
																																	data27 = coerced29;
																																	if (data23 !== void 0) data23["allowUnsafeRegex"] = coerced29;
																																}
																															}
																															var valid7 = _errs78 === errors;
																															if (valid7) {
																																let data28 = data23.useSemicolonDelimiter;
																																const _errs80 = errors;
																																if (typeof data28 !== "boolean") {
																																	let coerced30 = void 0;
																																	if (!(coerced30 !== void 0)) if (data28 === "false" || data28 === 0 || data28 === null) coerced30 = false;
																																	else if (data28 === "true" || data28 === 1) coerced30 = true;
																																	else {
																																		validate10.errors = [{
																																			instancePath: instancePath + "/routerOptions/useSemicolonDelimiter",
																																			schemaPath: "#/properties/routerOptions/properties/useSemicolonDelimiter/type",
																																			keyword: "type",
																																			params: { type: "boolean" },
																																			message: "must be boolean"
																																		}];
																																		return false;
																																	}
																																	if (coerced30 !== void 0) {
																																		data28 = coerced30;
																																		if (data23 !== void 0) data23["useSemicolonDelimiter"] = coerced30;
																																	}
																																}
																																var valid7 = _errs80 === errors;
																															}
																														}
																													}
																												}
																											} else {
																												validate10.errors = [{
																													instancePath: instancePath + "/routerOptions",
																													schemaPath: "#/properties/routerOptions/type",
																													keyword: "type",
																													params: { type: "object" },
																													message: "must be object"
																												}];
																												return false;
																											}
																											var valid0 = _errs69 === errors;
																										} else var valid0 = true;
																										if (valid0) if (data.constraints !== void 0) {
																											let data29 = data.constraints;
																											const _errs82 = errors;
																											if (errors === _errs82) if (data29 && typeof data29 == "object" && !Array.isArray(data29)) for (const key2 in data29) {
																												let data30 = data29[key2];
																												const _errs85 = errors;
																												if (errors === _errs85) if (data30 && typeof data30 == "object" && !Array.isArray(data30)) {
																													let missing1;
																													if (data30.name === void 0 && (missing1 = "name") || data30.storage === void 0 && (missing1 = "storage") || data30.validate === void 0 && (missing1 = "validate") || data30.deriveConstraint === void 0 && (missing1 = "deriveConstraint")) {
																														validate10.errors = [{
																															instancePath: instancePath + "/constraints/" + key2.replace(/~/g, "~0").replace(/\//g, "~1"),
																															schemaPath: "#/properties/constraints/additionalProperties/required",
																															keyword: "required",
																															params: { missingProperty: missing1 },
																															message: "must have required property '" + missing1 + "'"
																														}];
																														return false;
																													} else if (data30.name !== void 0) {
																														let data31 = data30.name;
																														if (typeof data31 !== "string") {
																															let dataType31 = typeof data31;
																															let coerced31 = void 0;
																															if (!(coerced31 !== void 0)) if (dataType31 == "number" || dataType31 == "boolean") coerced31 = "" + data31;
																															else if (data31 === null) coerced31 = "";
																															else {
																																validate10.errors = [{
																																	instancePath: instancePath + "/constraints/" + key2.replace(/~/g, "~0").replace(/\//g, "~1") + "/name",
																																	schemaPath: "#/properties/constraints/additionalProperties/properties/name/type",
																																	keyword: "type",
																																	params: { type: "string" },
																																	message: "must be string"
																																}];
																																return false;
																															}
																															if (coerced31 !== void 0) {
																																data31 = coerced31;
																																if (data30 !== void 0) data30["name"] = coerced31;
																															}
																														}
																													}
																												} else {
																													validate10.errors = [{
																														instancePath: instancePath + "/constraints/" + key2.replace(/~/g, "~0").replace(/\//g, "~1"),
																														schemaPath: "#/properties/constraints/additionalProperties/type",
																														keyword: "type",
																														params: { type: "object" },
																														message: "must be object"
																													}];
																													return false;
																												}
																												if (!(_errs85 === errors)) break;
																											}
																											else {
																												validate10.errors = [{
																													instancePath: instancePath + "/constraints",
																													schemaPath: "#/properties/constraints/type",
																													keyword: "type",
																													params: { type: "object" },
																													message: "must be object"
																												}];
																												return false;
																											}
																											var valid0 = _errs82 === errors;
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
		} else {
			validate10.errors = [{
				instancePath,
				schemaPath: "#/type",
				keyword: "type",
				params: { type: "object" },
				message: "must be object"
			}];
			return false;
		}
		validate10.errors = vErrors;
		return errors === 0;
	}
	module.exports.defaultInitOptions = {
		"connectionTimeout": 0,
		"keepAliveTimeout": 72e3,
		"maxRequestsPerSocket": 0,
		"requestTimeout": 0,
		"handlerTimeout": 0,
		"bodyLimit": 1048576,
		"caseSensitive": true,
		"allowUnsafeRegex": false,
		"disableRequestLogging": false,
		"ignoreTrailingSlash": false,
		"ignoreDuplicateSlashes": false,
		"maxParamLength": 100,
		"onProtoPoisoning": "error",
		"onConstructorPoisoning": "error",
		"pluginTimeout": 1e4,
		"requestIdHeader": false,
		"requestIdLogLabel": "reqId",
		"http2SessionTimeout": 72e3,
		"exposeHeadRoutes": true,
		"useSemicolonDelimiter": false,
		"allowErrorHandlerOverride": true,
		"routerOptions": {
			"ignoreTrailingSlash": false,
			"ignoreDuplicateSlashes": false,
			"maxParamLength": 100,
			"allowUnsafeRegex": false,
			"useSemicolonDelimiter": false
		}
	};
}));
/* c8 ignore stop */
//#endregion
//#region ../../node_modules/.bun/fastify@5.8.4/node_modules/fastify/lib/initial-config-validation.js
var require_initial_config_validation = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const validate = require_config_validator$1();
	const deepClone = require_rfdc()({
		circles: true,
		proto: false
	});
	const { FST_ERR_INIT_OPTS_INVALID } = require_errors();
	function validateInitialConfig(options) {
		const opts = deepClone(options);
		if (!validate(opts)) {
			const error = new FST_ERR_INIT_OPTS_INVALID(JSON.stringify(validate.errors.map((e) => e.message)));
			error.errors = validate.errors;
			throw error;
		}
		return deepFreezeObject(opts);
	}
	function deepFreezeObject(object) {
		const properties = Object.getOwnPropertyNames(object);
		for (const name of properties) {
			const value = object[name];
			if (ArrayBuffer.isView(value) && !(value instanceof DataView)) continue;
			object[name] = value && typeof value === "object" ? deepFreezeObject(value) : value;
		}
		return Object.freeze(object);
	}
	module.exports = validateInitialConfig;
	module.exports.defaultInitOptions = validate.defaultInitOptions;
	module.exports.utils = { deepFreezeObject };
}));
//#endregion
//#region ../../node_modules/.bun/fastify@5.8.4/node_modules/fastify/lib/plugin-override.js
var require_plugin_override = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { kAvvioBoot, kChildren, kRoutePrefix, kLogLevel, kLogSerializers, kHooks, kSchemaController, kContentTypeParser, kReply, kRequest, kFourOhFour, kPluginNameChain, kErrorHandlerAlreadySet } = require_symbols$1();
	const Reply = require_reply();
	const Request = require_request$1();
	const SchemaController = require_schema_controller();
	const ContentTypeParser = require_content_type_parser();
	const { buildHooks } = require_hooks();
	const pluginUtils = require_plugin_utils();
	module.exports = function override(old, fn, opts) {
		const shouldSkipOverride = pluginUtils.registerPlugin.call(old, fn);
		const fnName = pluginUtils.getPluginName(fn) || pluginUtils.getFuncPreview(fn);
		if (shouldSkipOverride) {
			old[kPluginNameChain].push(fnName);
			return old;
		}
		const instance = Object.create(old);
		old[kChildren].push(instance);
		instance.ready = old[kAvvioBoot].bind(instance);
		instance[kChildren] = [];
		instance[kReply] = Reply.buildReply(instance[kReply]);
		instance[kRequest] = Request.buildRequest(instance[kRequest]);
		instance[kContentTypeParser] = ContentTypeParser.helpers.buildContentTypeParser(instance[kContentTypeParser]);
		instance[kHooks] = buildHooks(instance[kHooks]);
		instance[kRoutePrefix] = buildRoutePrefix(instance[kRoutePrefix], opts.prefix);
		instance[kLogLevel] = opts.logLevel || instance[kLogLevel];
		instance[kSchemaController] = SchemaController.buildSchemaController(old[kSchemaController]);
		instance.getSchema = instance[kSchemaController].getSchema.bind(instance[kSchemaController]);
		instance.getSchemas = instance[kSchemaController].getSchemas.bind(instance[kSchemaController]);
		instance[pluginUtils.kRegisteredPlugins] = Object.create(instance[pluginUtils.kRegisteredPlugins]);
		instance[kPluginNameChain] = [fnName];
		instance[kErrorHandlerAlreadySet] = false;
		if (instance[kLogSerializers] || opts.logSerializers) instance[kLogSerializers] = Object.assign(Object.create(instance[kLogSerializers]), opts.logSerializers);
		if (opts.prefix) instance[kFourOhFour].arrange404(instance);
		for (const hook of instance[kHooks].onRegister) hook.call(old, instance, opts);
		return instance;
	};
	function buildRoutePrefix(instancePrefix, pluginPrefix) {
		if (!pluginPrefix) return instancePrefix;
		if (instancePrefix.endsWith("/") && pluginPrefix[0] === "/") pluginPrefix = pluginPrefix.slice(1);
		else if (pluginPrefix[0] !== "/") pluginPrefix = "/" + pluginPrefix;
		return instancePrefix + pluginPrefix;
	}
}));
//#endregion
//#region ../../node_modules/.bun/process-warning@4.0.1/node_modules/process-warning/index.js
var require_process_warning = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { format } = __require("node:util");
	/**
	* @namespace processWarning
	*/
	/**
	* Represents a warning item with details.
	* @typedef {Function} WarningItem
	* @param {*} [a] Possible message interpolation value.
	* @param {*} [b] Possible message interpolation value.
	* @param {*} [c] Possible message interpolation value.
	* @property {string} name - The name of the warning.
	* @property {string} code - The code associated with the warning.
	* @property {string} message - The warning message.
	* @property {boolean} emitted - Indicates if the warning has been emitted.
	* @property {function} format - Formats the warning message.
	*/
	/**
	* Options for creating a process warning.
	* @typedef {Object} ProcessWarningOptions
	* @property {string} name - The name of the warning.
	* @property {string} code - The code associated with the warning.
	* @property {string} message - The warning message.
	* @property {boolean} [unlimited=false] - If true, allows unlimited emissions of the warning.
	*/
	/**
	* Represents the process warning functionality.
	* @typedef {Object} ProcessWarning
	* @property {function} createWarning - Creates a warning item.
	* @property {function} createDeprecation - Creates a deprecation warning item.
	*/
	/**
	* Creates a deprecation warning item.
	* @function
	* @memberof processWarning
	* @param {ProcessWarningOptions} params - Options for creating the warning.
	* @returns {WarningItem} The created deprecation warning item.
	*/
	function createDeprecation(params) {
		return createWarning({
			...params,
			name: "DeprecationWarning"
		});
	}
	/**
	* Creates a warning item.
	* @function
	* @memberof processWarning
	* @param {ProcessWarningOptions} params - Options for creating the warning.
	* @returns {WarningItem} The created warning item.
	* @throws {Error} Throws an error if name, code, or message is empty, or if opts.unlimited is not a boolean.
	*/
	function createWarning({ name, code, message, unlimited = false } = {}) {
		if (!name) throw new Error("Warning name must not be empty");
		if (!code) throw new Error("Warning code must not be empty");
		if (!message) throw new Error("Warning message must not be empty");
		if (typeof unlimited !== "boolean") throw new Error("Warning opts.unlimited must be a boolean");
		code = code.toUpperCase();
		let warningContainer = { [name]: function(a, b, c) {
			if (warning.emitted === true && warning.unlimited !== true) return;
			warning.emitted = true;
			process.emitWarning(warning.format(a, b, c), warning.name, warning.code);
		} };
		if (unlimited) warningContainer = { [name]: function(a, b, c) {
			warning.emitted = true;
			process.emitWarning(warning.format(a, b, c), warning.name, warning.code);
		} };
		const warning = warningContainer[name];
		warning.emitted = false;
		warning.message = message;
		warning.unlimited = unlimited;
		warning.code = code;
		/**
		* Formats the warning message.
		* @param {*} [a] Possible message interpolation value.
		* @param {*} [b] Possible message interpolation value.
		* @param {*} [c] Possible message interpolation value.
		* @returns {string} The formatted warning message.
		*/
		warning.format = function(a, b, c) {
			let formatted;
			if (a && b && c) formatted = format(message, a, b, c);
			else if (a && b) formatted = format(message, a, b);
			else if (a) formatted = format(message, a);
			else formatted = message;
			return formatted;
		};
		return warning;
	}
	/**
	* Module exports containing the process warning functionality.
	* @namespace
	* @property {function} createWarning - Creates a warning item.
	* @property {function} createDeprecation - Creates a deprecation warning item.
	* @property {ProcessWarning} processWarning - Represents the process warning functionality.
	*/
	const out = {
		createWarning,
		createDeprecation
	};
	module.exports = out;
	module.exports.default = out;
	module.exports.processWarning = out;
}));
//#endregion
//#region ../../node_modules/.bun/light-my-request@6.6.0/node_modules/light-my-request/lib/parse-url.js
var require_parse_url = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { URL } = __require("node:url");
	const BASE_URL = "http://localhost";
	/**
	* Parse URL
	*
	* @param {(Object|String)} url
	* @param {Object} [query]
	* @return {URL}
	*/
	module.exports = function parseURL(url, query) {
		if ((typeof url === "string" || Object.prototype.toString.call(url) === "[object String]") && url.startsWith("//")) url = BASE_URL + url;
		const result = typeof url === "object" ? Object.assign(new URL(BASE_URL), url) : new URL(url, BASE_URL);
		if (typeof query === "string") {
			query = new URLSearchParams(query);
			for (const key of query.keys()) {
				result.searchParams.delete(key);
				for (const value of query.getAll(key)) result.searchParams.append(key, value);
			}
		} else {
			const merged = Object.assign({}, url.query, query);
			for (const key in merged) {
				const value = merged[key];
				if (Array.isArray(value)) {
					result.searchParams.delete(key);
					for (const param of value) result.searchParams.append(key, param);
				} else result.searchParams.set(key, value);
			}
		}
		return result;
	};
}));
//#endregion
//#region ../../node_modules/.bun/light-my-request@6.6.0/node_modules/light-my-request/lib/form-data.js
var require_form_data = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { randomUUID } = __require("node:crypto");
	const { Readable: Readable$2 } = __require("node:stream");
	let textEncoder;
	function isFormDataLike(payload) {
		return payload && typeof payload === "object" && typeof payload.append === "function" && typeof payload.delete === "function" && typeof payload.get === "function" && typeof payload.getAll === "function" && typeof payload.has === "function" && typeof payload.set === "function" && payload[Symbol.toStringTag] === "FormData";
	}
	function formDataToStream(formdata) {
		textEncoder = textEncoder ?? new TextEncoder();
		const boundary = `----formdata-${randomUUID()}`;
		const prefix = `--${boundary}\r\nContent-Disposition: form-data`;
		/*! formdata-polyfill. MIT License. Jimmy Wärting <https://jimmy.warting.se/opensource> */
		const escape = (str) => str.replace(/\n/g, "%0A").replace(/\r/g, "%0D").replace(/"/g, "%22");
		const normalizeLinefeeds = (value) => value.replace(/\r?\n|\r/g, "\r\n");
		const linebreak = new Uint8Array([13, 10]);
		async function* asyncIterator() {
			for (const [name, value] of formdata) if (typeof value === "string") {
				yield textEncoder.encode(`${prefix}; name="${escape(normalizeLinefeeds(name))}"\r\n\r\n`);
				yield textEncoder.encode(`${normalizeLinefeeds(value)}\r\n`);
			} else {
				let header = `${prefix}; name="${escape(normalizeLinefeeds(name))}"`;
				value.name && (header += `; filename="${escape(value.name)}"`);
				header += `\r\nContent-Type: ${value.type || "application/octet-stream"}\r\n\r\n`;
				yield textEncoder.encode(header);
				if (value.stream) yield* value.stream();
				else yield value;
				yield linebreak;
			}
			yield textEncoder.encode(`--${boundary}--`);
		}
		return {
			stream: Readable$2.from(asyncIterator()),
			contentType: `multipart/form-data; boundary=${boundary}`
		};
	}
	module.exports.isFormDataLike = isFormDataLike;
	module.exports.formDataToStream = formDataToStream;
}));
//#endregion
//#region ../../node_modules/.bun/light-my-request@6.6.0/node_modules/light-my-request/lib/request.js
var require_request = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { Readable: Readable$1, addAbortSignal: addAbortSignal$1 } = __require("node:stream");
	const util$1 = __require("node:util");
	const cookie = require_dist$1();
	const assert$1 = __require("node:assert");
	const { createDeprecation } = require_process_warning();
	const parseURL = require_parse_url();
	const { isFormDataLike, formDataToStream } = require_form_data();
	const { EventEmitter } = __require("node:events");
	const FST_LIGHTMYREQUEST_DEP01 = createDeprecation({
		name: "FastifyDeprecationLightMyRequest",
		code: "FST_LIGHTMYREQUEST_DEP01",
		message: "You are accessing \"request.connection\", use \"request.socket\" instead."
	});
	/**
	* Get hostname:port
	*
	* @param {URL} parsedURL
	* @return {String}
	*/
	function hostHeaderFromURL(parsedURL) {
		return parsedURL.port ? parsedURL.host : parsedURL.hostname + (parsedURL.protocol === "https:" ? ":443" : ":80");
	}
	/**
	* Mock socket object used to fake access to a socket for a request
	*
	* @constructor
	* @param {String} remoteAddress the fake address to show consumers of the socket
	*/
	var MockSocket = class extends EventEmitter {
		constructor(remoteAddress) {
			super();
			this.remoteAddress = remoteAddress;
		}
	};
	/**
	* CustomRequest
	*
	* @constructor
	* @param {Object} options
	* @param {(Object|String)} options.url || options.path
	* @param {String} [options.method='GET']
	* @param {String} [options.remoteAddress]
	* @param {Object} [options.cookies]
	* @param {Object} [options.headers]
	* @param {Object} [options.query]
	* @param {Object} [options.Request]
	* @param {any} [options.payload]
	*/
	function CustomRequest(options) {
		return new _CustomLMRRequest(this);
		function _CustomLMRRequest(obj) {
			Request.call(obj, {
				...options,
				Request: void 0
			});
			Object.assign(this, obj);
			for (const fn of Object.keys(Request.prototype)) this.constructor.prototype[fn] = Request.prototype[fn];
			util$1.inherits(this.constructor, options.Request);
			return this;
		}
	}
	/**
	* Request
	*
	* @constructor
	* @param {Object} options
	* @param {(Object|String)} options.url || options.path
	* @param {String} [options.method='GET']
	* @param {String} [options.remoteAddress]
	* @param {Object} [options.cookies]
	* @param {Object} [options.headers]
	* @param {Object} [options.query]
	* @param {any} [options.payload]
	*/
	function Request(options) {
		Readable$1.call(this, { autoDestroy: false });
		const parsedURL = parseURL(options.url || options.path, options.query);
		this.url = parsedURL.pathname + parsedURL.search;
		this.aborted = false;
		this.httpVersionMajor = 1;
		this.httpVersionMinor = 1;
		this.httpVersion = "1.1";
		this.method = options.method ? options.method.toUpperCase() : "GET";
		this.headers = {};
		this.rawHeaders = [];
		const headers = options.headers || {};
		for (const field in headers) {
			const fieldLowerCase = field.toLowerCase();
			if ((fieldLowerCase === "user-agent" || fieldLowerCase === "content-type") && headers[field] === void 0) {
				this.headers[fieldLowerCase] = void 0;
				continue;
			}
			const value = headers[field];
			assert$1(value !== void 0, "invalid value \"undefined\" for header " + field);
			this.headers[fieldLowerCase] = "" + value;
		}
		if ("user-agent" in this.headers === false) this.headers["user-agent"] = "lightMyRequest";
		this.headers.host = this.headers.host || options.authority || hostHeaderFromURL(parsedURL);
		if (options.cookies) {
			const { cookies } = options;
			const cookieValues = Object.keys(cookies).map((key) => cookie.serialize(key, cookies[key]));
			if (this.headers.cookie) cookieValues.unshift(this.headers.cookie);
			this.headers.cookie = cookieValues.join("; ");
		}
		this.socket = new MockSocket(options.remoteAddress || "127.0.0.1");
		Object.defineProperty(this, "connection", {
			get() {
				FST_LIGHTMYREQUEST_DEP01();
				return this.socket;
			},
			configurable: true
		});
		let payload = options.payload || options.body || null;
		let payloadResume = payload && typeof payload.resume === "function";
		if (isFormDataLike(payload)) {
			const stream = formDataToStream(payload);
			payload = stream.stream;
			payloadResume = true;
			this.headers["content-type"] = stream.contentType;
			this.headers["transfer-encoding"] = "chunked";
		}
		if (payload && typeof payload !== "string" && !payloadResume && !Buffer.isBuffer(payload)) {
			payload = JSON.stringify(payload);
			if ("content-type" in this.headers === false) this.headers["content-type"] = "application/json";
		}
		if (payload && !payloadResume && !Object.hasOwn(this.headers, "content-length")) this.headers["content-length"] = (Buffer.isBuffer(payload) ? payload.length : Buffer.byteLength(payload)).toString();
		for (const header of Object.keys(this.headers)) this.rawHeaders.push(header, this.headers[header]);
		this._lightMyRequest = {
			payload,
			isDone: false,
			simulate: options.simulate || {},
			payloadAsStream: options.payloadAsStream,
			signal: options.signal
		};
		const signal = options.signal;
		/* c8 ignore next 3 */
		if (signal) addAbortSignal$1(signal, this);
		{
			const payload = this._lightMyRequest.payload;
			if (payload?._readableState) {
				this._read = readStream;
				payload.on("error", (err) => {
					this.destroy(err);
				});
				payload.on("end", () => {
					this.push(null);
				});
			} else this._read = readEverythingElse;
		}
		return this;
	}
	function readStream() {
		const payload = this._lightMyRequest.payload;
		let more = true;
		let pushed = false;
		let chunk;
		while (more && (chunk = payload.read())) {
			pushed = true;
			more = this.push(chunk);
		}
		if (more && !pushed) this._lightMyRequest.payload.once("readable", this._read.bind(this));
	}
	function readEverythingElse() {
		setImmediate(() => {
			if (this._lightMyRequest.isDone) {
				if (this._lightMyRequest.simulate.end !== false) this.push(null);
				return;
			}
			this._lightMyRequest.isDone = true;
			if (this._lightMyRequest.payload) if (this._lightMyRequest.simulate.split) {
				this.push(this._lightMyRequest.payload.slice(0, 1));
				this.push(this._lightMyRequest.payload.slice(1));
			} else this.push(this._lightMyRequest.payload);
			if (this._lightMyRequest.simulate.error) this.emit("error", /* @__PURE__ */ new Error("Simulated"));
			if (this._lightMyRequest.simulate.close) this.emit("close");
			if (this._lightMyRequest.simulate.end !== false) this.push(null);
		});
	}
	util$1.inherits(Request, Readable$1);
	util$1.inherits(CustomRequest, Request);
	Request.prototype.destroy = function(error) {
		if (this.destroyed || this._lightMyRequest.isDone) return;
		this.destroyed = true;
		if (error) {
			this._error = true;
			process.nextTick(() => this.emit("error", error));
		}
		process.nextTick(() => this.emit("close"));
	};
	module.exports = Request;
	module.exports.Request = Request;
	module.exports.CustomRequest = CustomRequest;
}));
//#endregion
//#region ../../node_modules/.bun/set-cookie-parser@2.7.2/node_modules/set-cookie-parser/lib/set-cookie.js
var require_set_cookie = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var defaultParseOptions = {
		decodeValues: true,
		map: false,
		silent: false
	};
	function isForbiddenKey(key) {
		return typeof key !== "string" || key in {};
	}
	function createNullObj() {
		return Object.create(null);
	}
	function isNonEmptyString(str) {
		return typeof str === "string" && !!str.trim();
	}
	function parseString(setCookieValue, options) {
		var parts = setCookieValue.split(";").filter(isNonEmptyString);
		var parsed = parseNameValuePair(parts.shift());
		var name = parsed.name;
		var value = parsed.value;
		options = options ? Object.assign({}, defaultParseOptions, options) : defaultParseOptions;
		if (isForbiddenKey(name)) return null;
		try {
			value = options.decodeValues ? decodeURIComponent(value) : value;
		} catch (e) {
			console.error("set-cookie-parser: failed to decode cookie value. Set options.decodeValues=false to disable decoding.", e);
		}
		var cookie = createNullObj();
		cookie.name = name;
		cookie.value = value;
		parts.forEach(function(part) {
			var sides = part.split("=");
			var key = sides.shift().trimLeft().toLowerCase();
			if (isForbiddenKey(key)) return;
			var value = sides.join("=");
			if (key === "expires") cookie.expires = new Date(value);
			else if (key === "max-age") {
				var n = parseInt(value, 10);
				if (!Number.isNaN(n)) cookie.maxAge = n;
			} else if (key === "secure") cookie.secure = true;
			else if (key === "httponly") cookie.httpOnly = true;
			else if (key === "samesite") cookie.sameSite = value;
			else if (key === "partitioned") cookie.partitioned = true;
			else if (key) cookie[key] = value;
		});
		return cookie;
	}
	function parseNameValuePair(nameValuePairStr) {
		var name = "";
		var value = "";
		var nameValueArr = nameValuePairStr.split("=");
		if (nameValueArr.length > 1) {
			name = nameValueArr.shift();
			value = nameValueArr.join("=");
		} else value = nameValuePairStr;
		return {
			name,
			value
		};
	}
	function parse(input, options) {
		options = options ? Object.assign({}, defaultParseOptions, options) : defaultParseOptions;
		if (!input) if (!options.map) return [];
		else return createNullObj();
		if (input.headers) if (typeof input.headers.getSetCookie === "function") input = input.headers.getSetCookie();
		else if (input.headers["set-cookie"]) input = input.headers["set-cookie"];
		else {
			var sch = input.headers[Object.keys(input.headers).find(function(key) {
				return key.toLowerCase() === "set-cookie";
			})];
			if (!sch && input.headers.cookie && !options.silent) console.warn("Warning: set-cookie-parser appears to have been called on a request object. It is designed to parse Set-Cookie headers from responses, not Cookie headers from requests. Set the option {silent: true} to suppress this warning.");
			input = sch;
		}
		if (!Array.isArray(input)) input = [input];
		if (!options.map) return input.filter(isNonEmptyString).map(function(str) {
			return parseString(str, options);
		}).filter(Boolean);
		else {
			var cookies = createNullObj();
			return input.filter(isNonEmptyString).reduce(function(cookies, str) {
				var cookie = parseString(str, options);
				if (cookie && !isForbiddenKey(cookie.name)) cookies[cookie.name] = cookie;
				return cookies;
			}, cookies);
		}
	}
	function splitCookiesString(cookiesString) {
		if (Array.isArray(cookiesString)) return cookiesString;
		if (typeof cookiesString !== "string") return [];
		var cookiesStrings = [];
		var pos = 0;
		var start;
		var ch;
		var lastComma;
		var nextStart;
		var cookiesSeparatorFound;
		function skipWhitespace() {
			while (pos < cookiesString.length && /\s/.test(cookiesString.charAt(pos))) pos += 1;
			return pos < cookiesString.length;
		}
		function notSpecialChar() {
			ch = cookiesString.charAt(pos);
			return ch !== "=" && ch !== ";" && ch !== ",";
		}
		while (pos < cookiesString.length) {
			start = pos;
			cookiesSeparatorFound = false;
			while (skipWhitespace()) {
				ch = cookiesString.charAt(pos);
				if (ch === ",") {
					lastComma = pos;
					pos += 1;
					skipWhitespace();
					nextStart = pos;
					while (pos < cookiesString.length && notSpecialChar()) pos += 1;
					if (pos < cookiesString.length && cookiesString.charAt(pos) === "=") {
						cookiesSeparatorFound = true;
						pos = nextStart;
						cookiesStrings.push(cookiesString.substring(start, lastComma));
						start = pos;
					} else pos = lastComma + 1;
				} else pos += 1;
			}
			if (!cookiesSeparatorFound || pos >= cookiesString.length) cookiesStrings.push(cookiesString.substring(start, cookiesString.length));
		}
		return cookiesStrings;
	}
	module.exports = parse;
	module.exports.parse = parse;
	module.exports.parseString = parseString;
	module.exports.splitCookiesString = splitCookiesString;
}));
//#endregion
//#region ../../node_modules/.bun/light-my-request@6.6.0/node_modules/light-my-request/lib/response.js
var require_response = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const http$1 = __require("node:http");
	const { Writable, Readable, addAbortSignal } = __require("node:stream");
	const util = __require("node:util");
	const setCookie = require_set_cookie();
	function Response(req, onEnd, reject) {
		http$1.ServerResponse.call(this, req);
		if (req._lightMyRequest?.payloadAsStream) {
			this._lightMyRequest = {
				headers: null,
				trailers: {},
				stream: new Readable({ read: this.emit.bind(this, "drain") })
			};
			const signal = req._lightMyRequest.signal;
			if (signal) addAbortSignal(signal, this._lightMyRequest.stream);
		} else this._lightMyRequest = {
			headers: null,
			trailers: {},
			payloadChunks: []
		};
		this.setHeader("foo", "bar");
		this.removeHeader("foo");
		this.assignSocket(getNullSocket());
		this._promiseCallback = typeof reject === "function";
		let called = false;
		const onEndSuccess = (payload) => {
			if (called) return;
			called = true;
			if (this._promiseCallback) return process.nextTick(() => onEnd(payload));
			process.nextTick(() => onEnd(null, payload));
		};
		this._lightMyRequest.onEndSuccess = onEndSuccess;
		let finished = false;
		const onEndFailure = (err) => {
			if (called) {
				if (this._lightMyRequest.stream && !finished) {
					if (!err) {
						err = /* @__PURE__ */ new Error("response destroyed before completion");
						err.code = "LIGHT_ECONNRESET";
					}
					this._lightMyRequest.stream.destroy(err);
					this._lightMyRequest.stream.on("error", () => {});
				}
				return;
			}
			called = true;
			if (!err) {
				err = /* @__PURE__ */ new Error("response destroyed before completion");
				err.code = "LIGHT_ECONNRESET";
			}
			if (this._promiseCallback) return process.nextTick(() => reject(err));
			process.nextTick(() => onEnd(err, null));
		};
		if (this._lightMyRequest.stream) this.once("finish", () => {
			finished = true;
			this._lightMyRequest.stream.push(null);
		});
		else this.once("finish", () => {
			const res = generatePayload(this);
			res.raw.req = req;
			onEndSuccess(res);
		});
		this.connection.once("error", onEndFailure);
		this.once("error", onEndFailure);
		this.once("close", onEndFailure);
	}
	util.inherits(Response, http$1.ServerResponse);
	Response.prototype.setTimeout = function(msecs, callback) {
		this.timeoutHandle = setTimeout(() => {
			this.emit("timeout");
		}, msecs);
		this.on("timeout", callback);
		return this;
	};
	Response.prototype.writeHead = function() {
		const result = http$1.ServerResponse.prototype.writeHead.apply(this, arguments);
		copyHeaders(this);
		if (this._lightMyRequest.stream) this._lightMyRequest.onEndSuccess(generatePayload(this));
		return result;
	};
	Response.prototype.write = function(data, encoding, callback) {
		if (this.timeoutHandle) clearTimeout(this.timeoutHandle);
		http$1.ServerResponse.prototype.write.call(this, data, encoding, callback);
		if (this._lightMyRequest.stream) return this._lightMyRequest.stream.push(Buffer.from(data, encoding));
		else {
			this._lightMyRequest.payloadChunks.push(Buffer.from(data, encoding));
			return true;
		}
	};
	Response.prototype.end = function(data, encoding, callback) {
		if (data) this.write(data, encoding);
		http$1.ServerResponse.prototype.end.call(this, callback);
		this.emit("finish");
		this.destroy();
	};
	Response.prototype.destroy = function(error) {
		if (this.destroyed) return;
		this.destroyed = true;
		if (error) process.nextTick(() => this.emit("error", error));
		process.nextTick(() => this.emit("close"));
	};
	Response.prototype.addTrailers = function(trailers) {
		for (const key in trailers) this._lightMyRequest.trailers[key.toLowerCase().trim()] = trailers[key].toString().trim();
	};
	function generatePayload(response) {
		/* c8 ignore next 3  */
		if (response._lightMyRequest.headers === null) copyHeaders(response);
		serializeHeaders(response);
		const res = {
			raw: { res: response },
			headers: response._lightMyRequest.headers,
			statusCode: response.statusCode,
			statusMessage: response.statusMessage,
			trailers: {},
			get cookies() {
				return setCookie.parse(this);
			}
		};
		res.trailers = response._lightMyRequest.trailers;
		if (response._lightMyRequest.payloadChunks) {
			const rawBuffer = Buffer.concat(response._lightMyRequest.payloadChunks);
			res.rawPayload = rawBuffer;
			res.payload = rawBuffer.toString();
			res.body = res.payload;
			res.json = function parseJsonPayload() {
				return JSON.parse(res.payload);
			};
		} else res.json = function() {
			throw new Error("Response payload is not available with payloadAsStream: true");
		};
		res.stream = function streamPayload() {
			if (response._lightMyRequest.stream) return response._lightMyRequest.stream;
			return Readable.from(response._lightMyRequest.payloadChunks);
		};
		return res;
	}
	function getNullSocket() {
		return new Writable({ write(_chunk, _encoding, callback) {
			setImmediate(callback);
		} });
	}
	function serializeHeaders(response) {
		const headers = response._lightMyRequest.headers;
		for (const headerName of Object.keys(headers)) {
			const headerValue = headers[headerName];
			if (Array.isArray(headerValue)) headers[headerName] = headerValue.map((value) => "" + value);
			else headers[headerName] = "" + headerValue;
		}
	}
	function copyHeaders(response) {
		response._lightMyRequest.headers = Object.assign({}, response.getHeaders());
		[
			"Date",
			"Connection",
			"Transfer-Encoding"
		].forEach((name) => {
			const regex = new RegExp("\\r\\n" + name + ": ([^\\r]*)\\r\\n");
			const field = response._header?.match(regex);
			if (field) response._lightMyRequest.headers[name.toLowerCase()] = field[1];
		});
	}
	module.exports = Response;
}));
//#endregion
//#region ../../node_modules/.bun/light-my-request@6.6.0/node_modules/light-my-request/lib/config-validator.js
/* c8 ignore start */
var require_config_validator = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = validate10;
	module.exports.default = validate10;
	const schema11 = {
		"type": "object",
		"properties": {
			"url": { "oneOf": [{ "type": "string" }, {
				"type": "object",
				"properties": {
					"protocol": { "type": "string" },
					"hostname": { "type": "string" },
					"pathname": { "type": "string" }
				},
				"additionalProperties": true,
				"required": ["pathname"]
			}] },
			"path": { "oneOf": [{ "type": "string" }, {
				"type": "object",
				"properties": {
					"protocol": { "type": "string" },
					"hostname": { "type": "string" },
					"pathname": { "type": "string" }
				},
				"additionalProperties": true,
				"required": ["pathname"]
			}] },
			"cookies": {
				"type": "object",
				"additionalProperties": true
			},
			"headers": {
				"type": "object",
				"additionalProperties": true
			},
			"query": { "anyOf": [{
				"type": "object",
				"additionalProperties": true
			}, { "type": "string" }] },
			"simulate": {
				"type": "object",
				"properties": {
					"end": { "type": "boolean" },
					"split": { "type": "boolean" },
					"error": { "type": "boolean" },
					"close": { "type": "boolean" }
				}
			},
			"authority": { "type": "string" },
			"remoteAddress": { "type": "string" },
			"method": {
				"type": "string",
				"enum": [
					"ACL",
					"BIND",
					"CHECKOUT",
					"CONNECT",
					"COPY",
					"DELETE",
					"GET",
					"HEAD",
					"LINK",
					"LOCK",
					"M-SEARCH",
					"MERGE",
					"MKACTIVITY",
					"MKCALENDAR",
					"MKCOL",
					"MOVE",
					"NOTIFY",
					"OPTIONS",
					"PATCH",
					"POST",
					"PROPFIND",
					"PROPPATCH",
					"PURGE",
					"PUT",
					"QUERY",
					"REBIND",
					"REPORT",
					"SEARCH",
					"SOURCE",
					"SUBSCRIBE",
					"TRACE",
					"UNBIND",
					"UNLINK",
					"UNLOCK",
					"UNSUBSCRIBE",
					"acl",
					"bind",
					"checkout",
					"connect",
					"copy",
					"delete",
					"get",
					"head",
					"link",
					"lock",
					"m-search",
					"merge",
					"mkactivity",
					"mkcalendar",
					"mkcol",
					"move",
					"notify",
					"options",
					"patch",
					"post",
					"propfind",
					"proppatch",
					"purge",
					"put",
					"query",
					"rebind",
					"report",
					"search",
					"source",
					"subscribe",
					"trace",
					"unbind",
					"unlink",
					"unlock",
					"unsubscribe"
				]
			},
			"validate": { "type": "boolean" }
		},
		"additionalProperties": true,
		"oneOf": [{ "required": ["url"] }, { "required": ["path"] }]
	};
	function validate10(data, { instancePath = "", parentData, parentDataProperty, rootData = data } = {}) {
		let vErrors = null;
		let errors = 0;
		const _errs1 = errors;
		let valid0 = false;
		let passing0 = null;
		const _errs2 = errors;
		if (data && typeof data == "object" && !Array.isArray(data)) {
			let missing0;
			if (data.url === void 0 && (missing0 = "url")) {
				const err0 = {
					instancePath,
					schemaPath: "#/oneOf/0/required",
					keyword: "required",
					params: { missingProperty: missing0 },
					message: "must have required property '" + missing0 + "'"
				};
				if (vErrors === null) vErrors = [err0];
				else vErrors.push(err0);
				errors++;
			}
		}
		var _valid0 = _errs2 === errors;
		if (_valid0) {
			valid0 = true;
			passing0 = 0;
		}
		const _errs3 = errors;
		if (data && typeof data == "object" && !Array.isArray(data)) {
			let missing1;
			if (data.path === void 0 && (missing1 = "path")) {
				const err1 = {
					instancePath,
					schemaPath: "#/oneOf/1/required",
					keyword: "required",
					params: { missingProperty: missing1 },
					message: "must have required property '" + missing1 + "'"
				};
				if (vErrors === null) vErrors = [err1];
				else vErrors.push(err1);
				errors++;
			}
		}
		var _valid0 = _errs3 === errors;
		if (_valid0 && valid0) {
			valid0 = false;
			passing0 = [passing0, 1];
		} else if (_valid0) {
			valid0 = true;
			passing0 = 1;
		}
		if (!valid0) {
			const err2 = {
				instancePath,
				schemaPath: "#/oneOf",
				keyword: "oneOf",
				params: { passingSchemas: passing0 },
				message: "must match exactly one schema in oneOf"
			};
			if (vErrors === null) vErrors = [err2];
			else vErrors.push(err2);
			errors++;
			validate10.errors = vErrors;
			return false;
		} else {
			errors = _errs1;
			if (vErrors !== null) if (_errs1) vErrors.length = _errs1;
			else vErrors = null;
		}
		if (errors === 0) if (data && typeof data == "object" && !Array.isArray(data)) {
			if (data.url !== void 0) {
				let data0 = data.url;
				const _errs5 = errors;
				const _errs6 = errors;
				let valid2 = false;
				let passing1 = null;
				const _errs7 = errors;
				if (typeof data0 !== "string") {
					let dataType0 = typeof data0;
					let coerced0 = void 0;
					if (!(coerced0 !== void 0)) if (dataType0 == "number" || dataType0 == "boolean") coerced0 = "" + data0;
					else if (data0 === null) coerced0 = "";
					else {
						const err3 = {
							instancePath: instancePath + "/url",
							schemaPath: "#/properties/url/oneOf/0/type",
							keyword: "type",
							params: { type: "string" },
							message: "must be string"
						};
						if (vErrors === null) vErrors = [err3];
						else vErrors.push(err3);
						errors++;
					}
					if (coerced0 !== void 0) {
						data0 = coerced0;
						if (data !== void 0) data["url"] = coerced0;
					}
				}
				var _valid1 = _errs7 === errors;
				if (_valid1) {
					valid2 = true;
					passing1 = 0;
				}
				const _errs9 = errors;
				if (errors === _errs9) if (data0 && typeof data0 == "object" && !Array.isArray(data0)) {
					let missing2;
					if (data0.pathname === void 0 && (missing2 = "pathname")) {
						const err4 = {
							instancePath: instancePath + "/url",
							schemaPath: "#/properties/url/oneOf/1/required",
							keyword: "required",
							params: { missingProperty: missing2 },
							message: "must have required property '" + missing2 + "'"
						};
						if (vErrors === null) vErrors = [err4];
						else vErrors.push(err4);
						errors++;
					} else {
						if (data0.protocol !== void 0) {
							let data1 = data0.protocol;
							const _errs12 = errors;
							if (typeof data1 !== "string") {
								let dataType1 = typeof data1;
								let coerced1 = void 0;
								if (!(coerced1 !== void 0)) if (dataType1 == "number" || dataType1 == "boolean") coerced1 = "" + data1;
								else if (data1 === null) coerced1 = "";
								else {
									const err5 = {
										instancePath: instancePath + "/url/protocol",
										schemaPath: "#/properties/url/oneOf/1/properties/protocol/type",
										keyword: "type",
										params: { type: "string" },
										message: "must be string"
									};
									if (vErrors === null) vErrors = [err5];
									else vErrors.push(err5);
									errors++;
								}
								if (coerced1 !== void 0) {
									data1 = coerced1;
									if (data0 !== void 0) data0["protocol"] = coerced1;
								}
							}
							var valid3 = _errs12 === errors;
						} else var valid3 = true;
						if (valid3) {
							if (data0.hostname !== void 0) {
								let data2 = data0.hostname;
								const _errs14 = errors;
								if (typeof data2 !== "string") {
									let dataType2 = typeof data2;
									let coerced2 = void 0;
									if (!(coerced2 !== void 0)) if (dataType2 == "number" || dataType2 == "boolean") coerced2 = "" + data2;
									else if (data2 === null) coerced2 = "";
									else {
										const err6 = {
											instancePath: instancePath + "/url/hostname",
											schemaPath: "#/properties/url/oneOf/1/properties/hostname/type",
											keyword: "type",
											params: { type: "string" },
											message: "must be string"
										};
										if (vErrors === null) vErrors = [err6];
										else vErrors.push(err6);
										errors++;
									}
									if (coerced2 !== void 0) {
										data2 = coerced2;
										if (data0 !== void 0) data0["hostname"] = coerced2;
									}
								}
								var valid3 = _errs14 === errors;
							} else var valid3 = true;
							if (valid3) if (data0.pathname !== void 0) {
								let data3 = data0.pathname;
								const _errs16 = errors;
								if (typeof data3 !== "string") {
									let dataType3 = typeof data3;
									let coerced3 = void 0;
									if (!(coerced3 !== void 0)) if (dataType3 == "number" || dataType3 == "boolean") coerced3 = "" + data3;
									else if (data3 === null) coerced3 = "";
									else {
										const err7 = {
											instancePath: instancePath + "/url/pathname",
											schemaPath: "#/properties/url/oneOf/1/properties/pathname/type",
											keyword: "type",
											params: { type: "string" },
											message: "must be string"
										};
										if (vErrors === null) vErrors = [err7];
										else vErrors.push(err7);
										errors++;
									}
									if (coerced3 !== void 0) {
										data3 = coerced3;
										if (data0 !== void 0) data0["pathname"] = coerced3;
									}
								}
								var valid3 = _errs16 === errors;
							} else var valid3 = true;
						}
					}
				} else {
					const err8 = {
						instancePath: instancePath + "/url",
						schemaPath: "#/properties/url/oneOf/1/type",
						keyword: "type",
						params: { type: "object" },
						message: "must be object"
					};
					if (vErrors === null) vErrors = [err8];
					else vErrors.push(err8);
					errors++;
				}
				var _valid1 = _errs9 === errors;
				if (_valid1 && valid2) {
					valid2 = false;
					passing1 = [passing1, 1];
				} else if (_valid1) {
					valid2 = true;
					passing1 = 1;
				}
				if (!valid2) {
					const err9 = {
						instancePath: instancePath + "/url",
						schemaPath: "#/properties/url/oneOf",
						keyword: "oneOf",
						params: { passingSchemas: passing1 },
						message: "must match exactly one schema in oneOf"
					};
					if (vErrors === null) vErrors = [err9];
					else vErrors.push(err9);
					errors++;
					validate10.errors = vErrors;
					return false;
				} else {
					errors = _errs6;
					if (vErrors !== null) if (_errs6) vErrors.length = _errs6;
					else vErrors = null;
				}
				var valid1 = _errs5 === errors;
			} else var valid1 = true;
			if (valid1) {
				if (data.path !== void 0) {
					let data4 = data.path;
					const _errs18 = errors;
					const _errs19 = errors;
					let valid4 = false;
					let passing2 = null;
					const _errs20 = errors;
					if (typeof data4 !== "string") {
						let dataType4 = typeof data4;
						let coerced4 = void 0;
						if (!(coerced4 !== void 0)) if (dataType4 == "number" || dataType4 == "boolean") coerced4 = "" + data4;
						else if (data4 === null) coerced4 = "";
						else {
							const err10 = {
								instancePath: instancePath + "/path",
								schemaPath: "#/properties/path/oneOf/0/type",
								keyword: "type",
								params: { type: "string" },
								message: "must be string"
							};
							if (vErrors === null) vErrors = [err10];
							else vErrors.push(err10);
							errors++;
						}
						if (coerced4 !== void 0) {
							data4 = coerced4;
							if (data !== void 0) data["path"] = coerced4;
						}
					}
					var _valid2 = _errs20 === errors;
					if (_valid2) {
						valid4 = true;
						passing2 = 0;
					}
					const _errs22 = errors;
					if (errors === _errs22) if (data4 && typeof data4 == "object" && !Array.isArray(data4)) {
						let missing3;
						if (data4.pathname === void 0 && (missing3 = "pathname")) {
							const err11 = {
								instancePath: instancePath + "/path",
								schemaPath: "#/properties/path/oneOf/1/required",
								keyword: "required",
								params: { missingProperty: missing3 },
								message: "must have required property '" + missing3 + "'"
							};
							if (vErrors === null) vErrors = [err11];
							else vErrors.push(err11);
							errors++;
						} else {
							if (data4.protocol !== void 0) {
								let data5 = data4.protocol;
								const _errs25 = errors;
								if (typeof data5 !== "string") {
									let dataType5 = typeof data5;
									let coerced5 = void 0;
									if (!(coerced5 !== void 0)) if (dataType5 == "number" || dataType5 == "boolean") coerced5 = "" + data5;
									else if (data5 === null) coerced5 = "";
									else {
										const err12 = {
											instancePath: instancePath + "/path/protocol",
											schemaPath: "#/properties/path/oneOf/1/properties/protocol/type",
											keyword: "type",
											params: { type: "string" },
											message: "must be string"
										};
										if (vErrors === null) vErrors = [err12];
										else vErrors.push(err12);
										errors++;
									}
									if (coerced5 !== void 0) {
										data5 = coerced5;
										if (data4 !== void 0) data4["protocol"] = coerced5;
									}
								}
								var valid5 = _errs25 === errors;
							} else var valid5 = true;
							if (valid5) {
								if (data4.hostname !== void 0) {
									let data6 = data4.hostname;
									const _errs27 = errors;
									if (typeof data6 !== "string") {
										let dataType6 = typeof data6;
										let coerced6 = void 0;
										if (!(coerced6 !== void 0)) if (dataType6 == "number" || dataType6 == "boolean") coerced6 = "" + data6;
										else if (data6 === null) coerced6 = "";
										else {
											const err13 = {
												instancePath: instancePath + "/path/hostname",
												schemaPath: "#/properties/path/oneOf/1/properties/hostname/type",
												keyword: "type",
												params: { type: "string" },
												message: "must be string"
											};
											if (vErrors === null) vErrors = [err13];
											else vErrors.push(err13);
											errors++;
										}
										if (coerced6 !== void 0) {
											data6 = coerced6;
											if (data4 !== void 0) data4["hostname"] = coerced6;
										}
									}
									var valid5 = _errs27 === errors;
								} else var valid5 = true;
								if (valid5) if (data4.pathname !== void 0) {
									let data7 = data4.pathname;
									const _errs29 = errors;
									if (typeof data7 !== "string") {
										let dataType7 = typeof data7;
										let coerced7 = void 0;
										if (!(coerced7 !== void 0)) if (dataType7 == "number" || dataType7 == "boolean") coerced7 = "" + data7;
										else if (data7 === null) coerced7 = "";
										else {
											const err14 = {
												instancePath: instancePath + "/path/pathname",
												schemaPath: "#/properties/path/oneOf/1/properties/pathname/type",
												keyword: "type",
												params: { type: "string" },
												message: "must be string"
											};
											if (vErrors === null) vErrors = [err14];
											else vErrors.push(err14);
											errors++;
										}
										if (coerced7 !== void 0) {
											data7 = coerced7;
											if (data4 !== void 0) data4["pathname"] = coerced7;
										}
									}
									var valid5 = _errs29 === errors;
								} else var valid5 = true;
							}
						}
					} else {
						const err15 = {
							instancePath: instancePath + "/path",
							schemaPath: "#/properties/path/oneOf/1/type",
							keyword: "type",
							params: { type: "object" },
							message: "must be object"
						};
						if (vErrors === null) vErrors = [err15];
						else vErrors.push(err15);
						errors++;
					}
					var _valid2 = _errs22 === errors;
					if (_valid2 && valid4) {
						valid4 = false;
						passing2 = [passing2, 1];
					} else if (_valid2) {
						valid4 = true;
						passing2 = 1;
					}
					if (!valid4) {
						const err16 = {
							instancePath: instancePath + "/path",
							schemaPath: "#/properties/path/oneOf",
							keyword: "oneOf",
							params: { passingSchemas: passing2 },
							message: "must match exactly one schema in oneOf"
						};
						if (vErrors === null) vErrors = [err16];
						else vErrors.push(err16);
						errors++;
						validate10.errors = vErrors;
						return false;
					} else {
						errors = _errs19;
						if (vErrors !== null) if (_errs19) vErrors.length = _errs19;
						else vErrors = null;
					}
					var valid1 = _errs18 === errors;
				} else var valid1 = true;
				if (valid1) {
					if (data.cookies !== void 0) {
						let data8 = data.cookies;
						const _errs31 = errors;
						if (errors === _errs31) {
							if (!(data8 && typeof data8 == "object" && !Array.isArray(data8))) {
								validate10.errors = [{
									instancePath: instancePath + "/cookies",
									schemaPath: "#/properties/cookies/type",
									keyword: "type",
									params: { type: "object" },
									message: "must be object"
								}];
								return false;
							}
						}
						var valid1 = _errs31 === errors;
					} else var valid1 = true;
					if (valid1) {
						if (data.headers !== void 0) {
							let data9 = data.headers;
							const _errs34 = errors;
							if (errors === _errs34) {
								if (!(data9 && typeof data9 == "object" && !Array.isArray(data9))) {
									validate10.errors = [{
										instancePath: instancePath + "/headers",
										schemaPath: "#/properties/headers/type",
										keyword: "type",
										params: { type: "object" },
										message: "must be object"
									}];
									return false;
								}
							}
							var valid1 = _errs34 === errors;
						} else var valid1 = true;
						if (valid1) {
							if (data.query !== void 0) {
								let data10 = data.query;
								const _errs37 = errors;
								const _errs38 = errors;
								let valid6 = false;
								const _errs39 = errors;
								if (errors === _errs39) {
									if (!(data10 && typeof data10 == "object" && !Array.isArray(data10))) {
										const err17 = {
											instancePath: instancePath + "/query",
											schemaPath: "#/properties/query/anyOf/0/type",
											keyword: "type",
											params: { type: "object" },
											message: "must be object"
										};
										if (vErrors === null) vErrors = [err17];
										else vErrors.push(err17);
										errors++;
									}
								}
								var _valid3 = _errs39 === errors;
								valid6 = valid6 || _valid3;
								if (!valid6) {
									const _errs42 = errors;
									if (typeof data10 !== "string") {
										let dataType8 = typeof data10;
										let coerced8 = void 0;
										if (!(coerced8 !== void 0)) if (dataType8 == "number" || dataType8 == "boolean") coerced8 = "" + data10;
										else if (data10 === null) coerced8 = "";
										else {
											const err18 = {
												instancePath: instancePath + "/query",
												schemaPath: "#/properties/query/anyOf/1/type",
												keyword: "type",
												params: { type: "string" },
												message: "must be string"
											};
											if (vErrors === null) vErrors = [err18];
											else vErrors.push(err18);
											errors++;
										}
										if (coerced8 !== void 0) {
											data10 = coerced8;
											if (data !== void 0) data["query"] = coerced8;
										}
									}
									var _valid3 = _errs42 === errors;
									valid6 = valid6 || _valid3;
								}
								if (!valid6) {
									const err19 = {
										instancePath: instancePath + "/query",
										schemaPath: "#/properties/query/anyOf",
										keyword: "anyOf",
										params: {},
										message: "must match a schema in anyOf"
									};
									if (vErrors === null) vErrors = [err19];
									else vErrors.push(err19);
									errors++;
									validate10.errors = vErrors;
									return false;
								} else {
									errors = _errs38;
									if (vErrors !== null) if (_errs38) vErrors.length = _errs38;
									else vErrors = null;
								}
								var valid1 = _errs37 === errors;
							} else var valid1 = true;
							if (valid1) {
								if (data.simulate !== void 0) {
									let data11 = data.simulate;
									const _errs44 = errors;
									if (errors === _errs44) if (data11 && typeof data11 == "object" && !Array.isArray(data11)) {
										if (data11.end !== void 0) {
											let data12 = data11.end;
											const _errs46 = errors;
											if (typeof data12 !== "boolean") {
												let coerced9 = void 0;
												if (!(coerced9 !== void 0)) if (data12 === "false" || data12 === 0 || data12 === null) coerced9 = false;
												else if (data12 === "true" || data12 === 1) coerced9 = true;
												else {
													validate10.errors = [{
														instancePath: instancePath + "/simulate/end",
														schemaPath: "#/properties/simulate/properties/end/type",
														keyword: "type",
														params: { type: "boolean" },
														message: "must be boolean"
													}];
													return false;
												}
												if (coerced9 !== void 0) {
													data12 = coerced9;
													if (data11 !== void 0) data11["end"] = coerced9;
												}
											}
											var valid7 = _errs46 === errors;
										} else var valid7 = true;
										if (valid7) {
											if (data11.split !== void 0) {
												let data13 = data11.split;
												const _errs48 = errors;
												if (typeof data13 !== "boolean") {
													let coerced10 = void 0;
													if (!(coerced10 !== void 0)) if (data13 === "false" || data13 === 0 || data13 === null) coerced10 = false;
													else if (data13 === "true" || data13 === 1) coerced10 = true;
													else {
														validate10.errors = [{
															instancePath: instancePath + "/simulate/split",
															schemaPath: "#/properties/simulate/properties/split/type",
															keyword: "type",
															params: { type: "boolean" },
															message: "must be boolean"
														}];
														return false;
													}
													if (coerced10 !== void 0) {
														data13 = coerced10;
														if (data11 !== void 0) data11["split"] = coerced10;
													}
												}
												var valid7 = _errs48 === errors;
											} else var valid7 = true;
											if (valid7) {
												if (data11.error !== void 0) {
													let data14 = data11.error;
													const _errs50 = errors;
													if (typeof data14 !== "boolean") {
														let coerced11 = void 0;
														if (!(coerced11 !== void 0)) if (data14 === "false" || data14 === 0 || data14 === null) coerced11 = false;
														else if (data14 === "true" || data14 === 1) coerced11 = true;
														else {
															validate10.errors = [{
																instancePath: instancePath + "/simulate/error",
																schemaPath: "#/properties/simulate/properties/error/type",
																keyword: "type",
																params: { type: "boolean" },
																message: "must be boolean"
															}];
															return false;
														}
														if (coerced11 !== void 0) {
															data14 = coerced11;
															if (data11 !== void 0) data11["error"] = coerced11;
														}
													}
													var valid7 = _errs50 === errors;
												} else var valid7 = true;
												if (valid7) if (data11.close !== void 0) {
													let data15 = data11.close;
													const _errs52 = errors;
													if (typeof data15 !== "boolean") {
														let coerced12 = void 0;
														if (!(coerced12 !== void 0)) if (data15 === "false" || data15 === 0 || data15 === null) coerced12 = false;
														else if (data15 === "true" || data15 === 1) coerced12 = true;
														else {
															validate10.errors = [{
																instancePath: instancePath + "/simulate/close",
																schemaPath: "#/properties/simulate/properties/close/type",
																keyword: "type",
																params: { type: "boolean" },
																message: "must be boolean"
															}];
															return false;
														}
														if (coerced12 !== void 0) {
															data15 = coerced12;
															if (data11 !== void 0) data11["close"] = coerced12;
														}
													}
													var valid7 = _errs52 === errors;
												} else var valid7 = true;
											}
										}
									} else {
										validate10.errors = [{
											instancePath: instancePath + "/simulate",
											schemaPath: "#/properties/simulate/type",
											keyword: "type",
											params: { type: "object" },
											message: "must be object"
										}];
										return false;
									}
									var valid1 = _errs44 === errors;
								} else var valid1 = true;
								if (valid1) {
									if (data.authority !== void 0) {
										let data16 = data.authority;
										const _errs54 = errors;
										if (typeof data16 !== "string") {
											let dataType13 = typeof data16;
											let coerced13 = void 0;
											if (!(coerced13 !== void 0)) if (dataType13 == "number" || dataType13 == "boolean") coerced13 = "" + data16;
											else if (data16 === null) coerced13 = "";
											else {
												validate10.errors = [{
													instancePath: instancePath + "/authority",
													schemaPath: "#/properties/authority/type",
													keyword: "type",
													params: { type: "string" },
													message: "must be string"
												}];
												return false;
											}
											if (coerced13 !== void 0) {
												data16 = coerced13;
												if (data !== void 0) data["authority"] = coerced13;
											}
										}
										var valid1 = _errs54 === errors;
									} else var valid1 = true;
									if (valid1) {
										if (data.remoteAddress !== void 0) {
											let data17 = data.remoteAddress;
											const _errs56 = errors;
											if (typeof data17 !== "string") {
												let dataType14 = typeof data17;
												let coerced14 = void 0;
												if (!(coerced14 !== void 0)) if (dataType14 == "number" || dataType14 == "boolean") coerced14 = "" + data17;
												else if (data17 === null) coerced14 = "";
												else {
													validate10.errors = [{
														instancePath: instancePath + "/remoteAddress",
														schemaPath: "#/properties/remoteAddress/type",
														keyword: "type",
														params: { type: "string" },
														message: "must be string"
													}];
													return false;
												}
												if (coerced14 !== void 0) {
													data17 = coerced14;
													if (data !== void 0) data["remoteAddress"] = coerced14;
												}
											}
											var valid1 = _errs56 === errors;
										} else var valid1 = true;
										if (valid1) {
											if (data.method !== void 0) {
												let data18 = data.method;
												const _errs58 = errors;
												if (typeof data18 !== "string") {
													let dataType15 = typeof data18;
													let coerced15 = void 0;
													if (!(coerced15 !== void 0)) if (dataType15 == "number" || dataType15 == "boolean") coerced15 = "" + data18;
													else if (data18 === null) coerced15 = "";
													else {
														validate10.errors = [{
															instancePath: instancePath + "/method",
															schemaPath: "#/properties/method/type",
															keyword: "type",
															params: { type: "string" },
															message: "must be string"
														}];
														return false;
													}
													if (coerced15 !== void 0) {
														data18 = coerced15;
														if (data !== void 0) data["method"] = coerced15;
													}
												}
												if (!(data18 === "ACL" || data18 === "BIND" || data18 === "CHECKOUT" || data18 === "CONNECT" || data18 === "COPY" || data18 === "DELETE" || data18 === "GET" || data18 === "HEAD" || data18 === "LINK" || data18 === "LOCK" || data18 === "M-SEARCH" || data18 === "MERGE" || data18 === "MKACTIVITY" || data18 === "MKCALENDAR" || data18 === "MKCOL" || data18 === "MOVE" || data18 === "NOTIFY" || data18 === "OPTIONS" || data18 === "PATCH" || data18 === "POST" || data18 === "PROPFIND" || data18 === "PROPPATCH" || data18 === "PURGE" || data18 === "PUT" || data18 === "QUERY" || data18 === "REBIND" || data18 === "REPORT" || data18 === "SEARCH" || data18 === "SOURCE" || data18 === "SUBSCRIBE" || data18 === "TRACE" || data18 === "UNBIND" || data18 === "UNLINK" || data18 === "UNLOCK" || data18 === "UNSUBSCRIBE" || data18 === "acl" || data18 === "bind" || data18 === "checkout" || data18 === "connect" || data18 === "copy" || data18 === "delete" || data18 === "get" || data18 === "head" || data18 === "link" || data18 === "lock" || data18 === "m-search" || data18 === "merge" || data18 === "mkactivity" || data18 === "mkcalendar" || data18 === "mkcol" || data18 === "move" || data18 === "notify" || data18 === "options" || data18 === "patch" || data18 === "post" || data18 === "propfind" || data18 === "proppatch" || data18 === "purge" || data18 === "put" || data18 === "query" || data18 === "rebind" || data18 === "report" || data18 === "search" || data18 === "source" || data18 === "subscribe" || data18 === "trace" || data18 === "unbind" || data18 === "unlink" || data18 === "unlock" || data18 === "unsubscribe")) {
													validate10.errors = [{
														instancePath: instancePath + "/method",
														schemaPath: "#/properties/method/enum",
														keyword: "enum",
														params: { allowedValues: schema11.properties.method.enum },
														message: "must be equal to one of the allowed values"
													}];
													return false;
												}
												var valid1 = _errs58 === errors;
											} else var valid1 = true;
											if (valid1) if (data.validate !== void 0) {
												let data19 = data.validate;
												const _errs60 = errors;
												if (typeof data19 !== "boolean") {
													let coerced16 = void 0;
													if (!(coerced16 !== void 0)) if (data19 === "false" || data19 === 0 || data19 === null) coerced16 = false;
													else if (data19 === "true" || data19 === 1) coerced16 = true;
													else {
														validate10.errors = [{
															instancePath: instancePath + "/validate",
															schemaPath: "#/properties/validate/type",
															keyword: "type",
															params: { type: "boolean" },
															message: "must be boolean"
														}];
														return false;
													}
													if (coerced16 !== void 0) {
														data19 = coerced16;
														if (data !== void 0) data["validate"] = coerced16;
													}
												}
												var valid1 = _errs60 === errors;
											} else var valid1 = true;
										}
									}
								}
							}
						}
					}
				}
			}
		} else {
			validate10.errors = [{
				instancePath,
				schemaPath: "#/type",
				keyword: "type",
				params: { type: "object" },
				message: "must be object"
			}];
			return false;
		}
		validate10.errors = vErrors;
		return errors === 0;
	}
}));
//#endregion
//#region ../../node_modules/.bun/light-my-request@6.6.0/node_modules/light-my-request/index.js
var require_light_my_request = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const assert = __require("node:assert");
	const Request = require_request();
	const Response = require_response();
	const errorMessage = "The dispatch function has already been invoked";
	const optsValidator = require_config_validator();
	function inject(dispatchFunc, options, callback) {
		if (callback === void 0) return new Chain(dispatchFunc, options);
		else return doInject(dispatchFunc, options, callback);
	}
	function supportStream1(req, next) {
		const payload = req._lightMyRequest.payload;
		if (!payload || payload._readableState || typeof payload.resume !== "function") return next();
		const chunks = [];
		payload.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
		payload.on("end", () => {
			const payload = Buffer.concat(chunks);
			req.headers["content-length"] = req.headers["content-length"] || "" + payload.length;
			delete req.headers["transfer-encoding"];
			req._lightMyRequest.payload = payload;
			return next();
		});
		payload.resume();
	}
	function makeRequest(dispatchFunc, server, req, res) {
		req.once("error", function(err) {
			if (this.destroyed) res.destroy(err);
		});
		req.once("close", function() {
			if (this.destroyed && !this._error) res.destroy();
		});
		return supportStream1(req, () => dispatchFunc.call(server, req, res));
	}
	function doInject(dispatchFunc, options, callback) {
		options = typeof options === "string" ? { url: options } : options;
		if (options.validate !== false) {
			assert(typeof dispatchFunc === "function", "dispatchFunc should be a function");
			if (!optsValidator(options)) throw new Error(optsValidator.errors.map((e) => e.message));
		}
		const server = options.server || {};
		const RequestConstructor = options.Request ? Request.CustomRequest : Request;
		if (dispatchFunc.request && dispatchFunc.request.app === dispatchFunc) {
			Object.setPrototypeOf(Object.getPrototypeOf(dispatchFunc.request), RequestConstructor.prototype);
			Object.setPrototypeOf(Object.getPrototypeOf(dispatchFunc.response), Response.prototype);
		}
		if (typeof callback === "function") {
			const req = new RequestConstructor(options);
			return makeRequest(dispatchFunc, server, req, new Response(req, callback));
		} else return new Promise((resolve, reject) => {
			const req = new RequestConstructor(options);
			makeRequest(dispatchFunc, server, req, new Response(req, resolve, reject));
		});
	}
	function Chain(dispatch, option) {
		if (typeof option === "string") this.option = { url: option };
		else this.option = Object.assign({}, option);
		this.dispatch = dispatch;
		this._hasInvoked = false;
		this._promise = null;
		if (this.option.autoStart !== false) process.nextTick(() => {
			if (!this._hasInvoked) this.end();
		});
	}
	[
		"delete",
		"get",
		"head",
		"options",
		"patch",
		"post",
		"put",
		"trace"
	].forEach((method) => {
		Chain.prototype[method] = function(url) {
			if (this._hasInvoked === true || this._promise) throw new Error(errorMessage);
			this.option.url = url;
			this.option.method = method.toUpperCase();
			return this;
		};
	});
	[
		"body",
		"cookies",
		"headers",
		"payload",
		"query"
	].forEach((method) => {
		Chain.prototype[method] = function(value) {
			if (this._hasInvoked === true || this._promise) throw new Error(errorMessage);
			this.option[method] = value;
			return this;
		};
	});
	Chain.prototype.end = function(callback) {
		if (this._hasInvoked === true || this._promise) throw new Error(errorMessage);
		this._hasInvoked = true;
		if (typeof callback === "function") doInject(this.dispatch, this.option, callback);
		else {
			this._promise = doInject(this.dispatch, this.option);
			return this._promise;
		}
	};
	Object.getOwnPropertyNames(Promise.prototype).forEach((method) => {
		if (method === "constructor") return;
		Chain.prototype[method] = function(...args) {
			if (!this._promise) {
				if (this._hasInvoked === true) throw new Error(errorMessage);
				this._hasInvoked = true;
				this._promise = doInject(this.dispatch, this.option);
			}
			return this._promise[method](...args);
		};
	});
	function isInjection(obj) {
		return obj instanceof Request || obj instanceof Response || obj?.constructor?.name === "_CustomLMRRequest";
	}
	module.exports = inject;
	module.exports.default = inject;
	module.exports.inject = inject;
	module.exports.isInjection = isInjection;
}));
//#endregion
//#region ../../node_modules/.bun/fastify@5.8.4/node_modules/fastify/fastify.js
var require_fastify = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const VERSION = "5.8.4";
	const Avvio = require_boot();
	const http = __require("node:http");
	const diagnostics = __require("node:diagnostics_channel");
	let lightMyRequest;
	const { kAvvioBoot, kChildren, kServerBindings, kBodyLimit, kSupportedHTTPMethods, kRoutePrefix, kLogLevel, kLogSerializers, kHooks, kSchemaController, kRequestAcceptVersion, kReplySerializerDefault, kContentTypeParser, kReply, kRequest, kFourOhFour, kState, kOptions, kPluginNameChain, kSchemaErrorFormatter, kErrorHandler, kKeepAliveConnections, kChildLoggerFactory, kGenReqId, kErrorHandlerAlreadySet, kHandlerTimeout } = require_symbols$1();
	const { createServer } = require_server();
	const Reply = require_reply();
	const Request = require_request$1();
	const Context = require_context();
	const decorator = require_decorate();
	const ContentTypeParser = require_content_type_parser();
	const SchemaController = require_schema_controller();
	const { Hooks, hookRunnerApplication, supportedHooks } = require_hooks();
	const { createChildLogger, defaultChildLoggerFactory, createLogger } = require_logger_factory();
	const pluginUtils = require_plugin_utils();
	const { getGenReqId, reqIdGenFactory } = require_req_id_gen_factory();
	const { buildRouting, validateBodyLimitOption, buildRouterOptions } = require_route();
	const build404 = require_four_oh_four();
	const getSecuredInitialConfig = require_initial_config_validation();
	const override = require_plugin_override();
	const { appendStackTrace, AVVIO_ERRORS_MAP, ...errorCodes } = require_errors();
	const PonyPromise = require_promise();
	const { defaultInitOptions } = getSecuredInitialConfig;
	const { FST_ERR_ASYNC_CONSTRAINT, FST_ERR_BAD_URL, FST_ERR_OPTIONS_NOT_OBJ, FST_ERR_QSP_NOT_FN, FST_ERR_SCHEMA_CONTROLLER_BUCKET_OPT_NOT_FN, FST_ERR_AJV_CUSTOM_OPTIONS_OPT_NOT_OBJ, FST_ERR_AJV_CUSTOM_OPTIONS_OPT_NOT_ARR, FST_ERR_INSTANCE_ALREADY_LISTENING, FST_ERR_REOPENED_CLOSE_SERVER, FST_ERR_ROUTE_REWRITE_NOT_STR, FST_ERR_SCHEMA_ERROR_FORMATTER_NOT_FN, FST_ERR_ERROR_HANDLER_NOT_FN, FST_ERR_ERROR_HANDLER_ALREADY_SET, FST_ERR_ROUTE_METHOD_INVALID } = errorCodes;
	const { buildErrorHandler } = require_error_handler();
	const { FSTWRN004 } = require_warnings();
	const initChannel = diagnostics.channel("fastify.initialization");
	/**
	* @param {import('./fastify.js').FastifyServerOptions} serverOptions
	*/
	function fastify(serverOptions) {
		const { options, genReqId, disableRequestLogging, hasLogger, initialConfig } = processOptions(serverOptions, defaultRoute, onBadUrl);
		const router = buildRouting(options.routerOptions);
		const fourOhFour = build404(options);
		const httpHandler = wrapRouting(router, options);
		const { server, listen, forceCloseConnections, serverHasCloseAllConnections, serverHasCloseHttp2Sessions, keepAliveConnections } = createServer(options, httpHandler);
		const setupResponseListeners = Reply.setupResponseListeners;
		const schemaController = SchemaController.buildSchemaController(null, options.schemaController);
		const fastify = {
			[kState]: {
				listening: false,
				closing: false,
				started: false,
				ready: false,
				booting: false,
				aborted: false,
				readyResolver: null
			},
			[kKeepAliveConnections]: keepAliveConnections,
			[kSupportedHTTPMethods]: {
				bodyless: new Set([
					"GET",
					"HEAD",
					"TRACE"
				]),
				bodywith: new Set([
					"DELETE",
					"OPTIONS",
					"PATCH",
					"PUT",
					"POST"
				])
			},
			[kOptions]: options,
			[kChildren]: [],
			[kServerBindings]: [],
			[kBodyLimit]: options.bodyLimit,
			[kHandlerTimeout]: options.handlerTimeout,
			[kRoutePrefix]: "",
			[kLogLevel]: "",
			[kLogSerializers]: null,
			[kHooks]: new Hooks(),
			[kSchemaController]: schemaController,
			[kSchemaErrorFormatter]: null,
			[kErrorHandler]: buildErrorHandler(),
			[kErrorHandlerAlreadySet]: false,
			[kChildLoggerFactory]: options.childLoggerFactory || defaultChildLoggerFactory,
			[kReplySerializerDefault]: null,
			[kContentTypeParser]: new ContentTypeParser(options.bodyLimit, options.onProtoPoisoning || defaultInitOptions.onProtoPoisoning, options.onConstructorPoisoning || defaultInitOptions.onConstructorPoisoning),
			[kReply]: Reply.buildReply(Reply),
			[kRequest]: Request.buildRequest(Request, options.trustProxy),
			[kFourOhFour]: fourOhFour,
			[pluginUtils.kRegisteredPlugins]: [],
			[kPluginNameChain]: ["fastify"],
			[kAvvioBoot]: null,
			[kGenReqId]: genReqId,
			routing: httpHandler,
			delete: function _delete(url, options, handler) {
				return router.prepareRoute.call(this, {
					method: "DELETE",
					url,
					options,
					handler
				});
			},
			get: function _get(url, options, handler) {
				return router.prepareRoute.call(this, {
					method: "GET",
					url,
					options,
					handler
				});
			},
			head: function _head(url, options, handler) {
				return router.prepareRoute.call(this, {
					method: "HEAD",
					url,
					options,
					handler
				});
			},
			trace: function _trace(url, options, handler) {
				return router.prepareRoute.call(this, {
					method: "TRACE",
					url,
					options,
					handler
				});
			},
			patch: function _patch(url, options, handler) {
				return router.prepareRoute.call(this, {
					method: "PATCH",
					url,
					options,
					handler
				});
			},
			post: function _post(url, options, handler) {
				return router.prepareRoute.call(this, {
					method: "POST",
					url,
					options,
					handler
				});
			},
			put: function _put(url, options, handler) {
				return router.prepareRoute.call(this, {
					method: "PUT",
					url,
					options,
					handler
				});
			},
			options: function _options(url, options, handler) {
				return router.prepareRoute.call(this, {
					method: "OPTIONS",
					url,
					options,
					handler
				});
			},
			all: function _all(url, options, handler) {
				return router.prepareRoute.call(this, {
					method: this.supportedMethods,
					url,
					options,
					handler
				});
			},
			route: function _route(options) {
				return router.route.call(this, { options });
			},
			hasRoute: function _route(options) {
				return router.hasRoute.call(this, { options });
			},
			findRoute: function _findRoute(options) {
				return router.findRoute(options);
			},
			log: options.logger,
			withTypeProvider,
			addHook,
			addSchema,
			getSchema: schemaController.getSchema.bind(schemaController),
			getSchemas: schemaController.getSchemas.bind(schemaController),
			setValidatorCompiler,
			setSerializerCompiler,
			setSchemaController,
			setReplySerializer,
			setSchemaErrorFormatter,
			setGenReqId,
			addContentTypeParser: ContentTypeParser.helpers.addContentTypeParser,
			hasContentTypeParser: ContentTypeParser.helpers.hasContentTypeParser,
			getDefaultJsonParser: ContentTypeParser.defaultParsers.getDefaultJsonParser,
			defaultTextParser: ContentTypeParser.defaultParsers.defaultTextParser,
			removeContentTypeParser: ContentTypeParser.helpers.removeContentTypeParser,
			removeAllContentTypeParsers: ContentTypeParser.helpers.removeAllContentTypeParsers,
			register: null,
			after: null,
			ready: null,
			onClose: null,
			close: null,
			printPlugins: null,
			hasPlugin: function(name) {
				return this[pluginUtils.kRegisteredPlugins].includes(name) || this[kPluginNameChain].includes(name);
			},
			listen,
			server,
			addresses: function() {
				/* istanbul ignore next */
				const binded = this[kServerBindings].map((b) => b.address());
				binded.push(this.server.address());
				return binded.filter((adr) => adr);
			},
			decorate: decorator.add,
			hasDecorator: decorator.exist,
			decorateReply: decorator.decorateReply,
			decorateRequest: decorator.decorateRequest,
			hasRequestDecorator: decorator.existRequest,
			hasReplyDecorator: decorator.existReply,
			getDecorator: decorator.getInstanceDecorator,
			addHttpMethod,
			inject,
			printRoutes,
			setNotFoundHandler,
			setErrorHandler,
			setChildLoggerFactory,
			initialConfig,
			addConstraintStrategy: router.addConstraintStrategy.bind(router),
			hasConstraintStrategy: router.hasConstraintStrategy.bind(router)
		};
		Object.defineProperties(fastify, {
			listeningOrigin: { get() {
				const address = this.addresses().slice(-1).pop();
				/* c8 ignore next 3 */
				if (typeof address === "string") return address;
				const host = address.family === "IPv6" ? `[${address.address}]` : address.address;
				return `${this[kOptions].https ? "https" : "http"}://${host}:${address.port}`;
			} },
			pluginName: {
				configurable: true,
				get() {
					if (this[kPluginNameChain].length > 1) return this[kPluginNameChain].join(" -> ");
					return this[kPluginNameChain][0];
				}
			},
			prefix: {
				configurable: true,
				get() {
					return this[kRoutePrefix];
				}
			},
			validatorCompiler: {
				configurable: true,
				get() {
					return this[kSchemaController].getValidatorCompiler();
				}
			},
			serializerCompiler: {
				configurable: true,
				get() {
					return this[kSchemaController].getSerializerCompiler();
				}
			},
			childLoggerFactory: {
				configurable: true,
				get() {
					return this[kChildLoggerFactory];
				}
			},
			version: {
				configurable: true,
				get() {
					return VERSION;
				}
			},
			errorHandler: {
				configurable: true,
				get() {
					return this[kErrorHandler].func;
				}
			},
			genReqId: {
				configurable: true,
				get() {
					return this[kGenReqId];
				}
			},
			supportedMethods: {
				configurable: false,
				get() {
					return [...this[kSupportedHTTPMethods].bodyless, ...this[kSupportedHTTPMethods].bodywith];
				}
			}
		});
		if (options.schemaErrorFormatter) {
			validateSchemaErrorFormatter(options.schemaErrorFormatter);
			fastify[kSchemaErrorFormatter] = options.schemaErrorFormatter.bind(fastify);
		}
		const avvioPluginTimeout = Number(options.pluginTimeout);
		const avvio = Avvio(fastify, {
			autostart: false,
			timeout: isNaN(avvioPluginTimeout) === false ? avvioPluginTimeout : defaultInitOptions.pluginTimeout,
			expose: { use: "register" }
		});
		avvio.override = override;
		avvio.on("start", () => fastify[kState].started = true);
		fastify[kAvvioBoot] = fastify.ready;
		fastify.ready = ready;
		fastify.printPlugins = avvio.prettyPrint.bind(avvio);
		avvio.once("preReady", () => {
			fastify.onClose((instance, done) => {
				fastify[kState].closing = true;
				router.closeRoutes();
				hookRunnerApplication("preClose", fastify[kAvvioBoot], fastify, function() {
					if (fastify[kState].listening) {
						/* istanbul ignore next: Cannot test this without Node.js core support */
						if (forceCloseConnections === "idle") instance.server.closeIdleConnections();
						else if (serverHasCloseAllConnections && forceCloseConnections) instance.server.closeAllConnections();
						else if (forceCloseConnections === true) for (const conn of fastify[kKeepAliveConnections]) {
							conn.destroy();
							fastify[kKeepAliveConnections].delete(conn);
						}
					}
					if (serverHasCloseHttp2Sessions) instance.server.closeHttp2Sessions();
					if (!options.serverFactory || fastify[kState].listening) instance.server.close(function(err) {
						/* c8 ignore next 6 */
						if (err && err.code !== "ERR_SERVER_NOT_RUNNING") done(null);
						else done();
					});
					else process.nextTick(done, null);
				});
			});
		});
		const onBadUrlContext = new Context({
			server: fastify,
			config: {}
		});
		fastify.setNotFoundHandler();
		fourOhFour.arrange404(fastify);
		router.setup(options, {
			avvio,
			fourOhFour,
			hasLogger,
			setupResponseListeners,
			throwIfAlreadyStarted,
			keepAliveConnections
		});
		server.on("clientError", options.clientErrorHandler.bind(fastify));
		if (initChannel.hasSubscribers) initChannel.publish({ fastify });
		if ("asyncDispose" in Symbol) fastify[Symbol.asyncDispose] = function dispose() {
			return fastify.close();
		};
		return fastify;
		function throwIfAlreadyStarted(msg) {
			if (fastify[kState].started) throw new FST_ERR_INSTANCE_ALREADY_LISTENING(msg);
		}
		function inject(opts, cb) {
			if (lightMyRequest === void 0) lightMyRequest = require_light_my_request();
			if (fastify[kState].started) {
				if (fastify[kState].closing) {
					const error = new FST_ERR_REOPENED_CLOSE_SERVER();
					if (cb) {
						cb(error);
						return;
					} else return Promise.reject(error);
				}
				return lightMyRequest(httpHandler, opts, cb);
			}
			if (cb) this.ready((err) => {
				if (err) cb(err, null);
				else lightMyRequest(httpHandler, opts, cb);
			});
			else return lightMyRequest((req, res) => {
				this.ready(function(err) {
					if (err) {
						res.emit("error", err);
						return;
					}
					httpHandler(req, res);
				});
			}, opts);
		}
		function ready(cb) {
			if (this[kState].readyResolver !== null) {
				if (cb != null) {
					this[kState].readyResolver.promise.then(() => cb(null, fastify), cb);
					return;
				}
				return this[kState].readyResolver.promise;
			}
			process.nextTick(runHooks);
			this[kState].readyResolver = PonyPromise.withResolvers();
			if (!cb) return this[kState].readyResolver.promise;
			else this[kState].readyResolver.promise.then(() => cb(null, fastify), cb);
			function runHooks() {
				fastify[kAvvioBoot]((err, done) => {
					if (err || fastify[kState].started || fastify[kState].ready || fastify[kState].booting) manageErr(err);
					else {
						fastify[kState].booting = true;
						hookRunnerApplication("onReady", fastify[kAvvioBoot], fastify, manageErr);
					}
					done();
				});
			}
			function manageErr(err) {
				err = err != null && AVVIO_ERRORS_MAP[err.code] != null ? appendStackTrace(err, new AVVIO_ERRORS_MAP[err.code](err.message)) : err;
				if (err) return fastify[kState].readyResolver.reject(err);
				fastify[kState].readyResolver.resolve(fastify);
				fastify[kState].booting = false;
				fastify[kState].ready = true;
				fastify[kState].readyResolver = null;
			}
		}
		function withTypeProvider() {
			return this;
		}
		function addHook(name, fn) {
			throwIfAlreadyStarted("Cannot call \"addHook\"!");
			if (fn == null) throw new errorCodes.FST_ERR_HOOK_INVALID_HANDLER(name, fn);
			if (name === "onSend" || name === "preSerialization" || name === "onError" || name === "preParsing") {
				if (fn.constructor.name === "AsyncFunction" && fn.length === 4) throw new errorCodes.FST_ERR_HOOK_INVALID_ASYNC_HANDLER();
			} else if (name === "onReady" || name === "onListen") {
				if (fn.constructor.name === "AsyncFunction" && fn.length !== 0) throw new errorCodes.FST_ERR_HOOK_INVALID_ASYNC_HANDLER();
			} else if (name === "onRequestAbort") {
				if (fn.constructor.name === "AsyncFunction" && fn.length !== 1) throw new errorCodes.FST_ERR_HOOK_INVALID_ASYNC_HANDLER();
			} else if (fn.constructor.name === "AsyncFunction" && fn.length === 3) throw new errorCodes.FST_ERR_HOOK_INVALID_ASYNC_HANDLER();
			if (name === "onClose") this.onClose(fn.bind(this));
			else if (name === "onReady" || name === "onListen" || name === "onRoute") this[kHooks].add(name, fn);
			else this.after((err, done) => {
				try {
					_addHook.call(this, name, fn);
					done(err);
				} catch (err) {
					done(err);
				}
			});
			return this;
			function _addHook(name, fn) {
				this[kHooks].add(name, fn);
				this[kChildren].forEach((child) => _addHook.call(child, name, fn));
			}
		}
		function addSchema(schema) {
			throwIfAlreadyStarted("Cannot call \"addSchema\"!");
			this[kSchemaController].add(schema);
			this[kChildren].forEach((child) => child.addSchema(schema));
			return this;
		}
		function defaultRoute(req, res) {
			if (req.headers["accept-version"] !== void 0) {
				req.headers[kRequestAcceptVersion] = req.headers["accept-version"];
				req.headers["accept-version"] = void 0;
			}
			fourOhFour.router.lookup(req, res);
		}
		function onBadUrl(path, req, res) {
			if (options.frameworkErrors) {
				const id = getGenReqId(onBadUrlContext.server, req);
				const childLogger = createChildLogger(onBadUrlContext, options.logger, req, id);
				const request = new Request(id, null, req, null, childLogger, onBadUrlContext);
				const reply = new Reply(res, request, childLogger);
				if ((typeof disableRequestLogging === "function" ? disableRequestLogging(req) : disableRequestLogging) === false) childLogger.info({ req: request }, "incoming request");
				return options.frameworkErrors(new FST_ERR_BAD_URL(path), request, reply);
			}
			const body = JSON.stringify({
				error: "Bad Request",
				code: "FST_ERR_BAD_URL",
				message: `'${path}' is not a valid url component`,
				statusCode: 400
			});
			res.writeHead(400, {
				"Content-Type": "application/json",
				"Content-Length": Buffer.byteLength(body)
			});
			res.end(body);
		}
		function buildAsyncConstraintCallback(isAsync, req, res) {
			if (isAsync === false) return void 0;
			return function onAsyncConstraintError(err) {
				if (err) {
					if (options.frameworkErrors) {
						const id = getGenReqId(onBadUrlContext.server, req);
						const childLogger = createChildLogger(onBadUrlContext, options.logger, req, id);
						const request = new Request(id, null, req, null, childLogger, onBadUrlContext);
						const reply = new Reply(res, request, childLogger);
						if ((typeof disableRequestLogging === "function" ? disableRequestLogging(req) : disableRequestLogging) === false) childLogger.info({ req: request }, "incoming request");
						return options.frameworkErrors(new FST_ERR_ASYNC_CONSTRAINT(), request, reply);
					}
					const body = "{\"error\":\"Internal Server Error\",\"message\":\"Unexpected error from async constraint\",\"statusCode\":500}";
					res.writeHead(500, {
						"Content-Type": "application/json",
						"Content-Length": 101
					});
					res.end(body);
				}
			};
		}
		function setNotFoundHandler(opts, handler) {
			throwIfAlreadyStarted("Cannot call \"setNotFoundHandler\"!");
			fourOhFour.setNotFoundHandler.call(this, opts, handler, avvio, router.routeHandler);
			return this;
		}
		function setValidatorCompiler(validatorCompiler) {
			throwIfAlreadyStarted("Cannot call \"setValidatorCompiler\"!");
			this[kSchemaController].setValidatorCompiler(validatorCompiler);
			return this;
		}
		function setSchemaErrorFormatter(errorFormatter) {
			throwIfAlreadyStarted("Cannot call \"setSchemaErrorFormatter\"!");
			validateSchemaErrorFormatter(errorFormatter);
			this[kSchemaErrorFormatter] = errorFormatter.bind(this);
			return this;
		}
		function setSerializerCompiler(serializerCompiler) {
			throwIfAlreadyStarted("Cannot call \"setSerializerCompiler\"!");
			this[kSchemaController].setSerializerCompiler(serializerCompiler);
			return this;
		}
		function setSchemaController(schemaControllerOpts) {
			throwIfAlreadyStarted("Cannot call \"setSchemaController\"!");
			const old = this[kSchemaController];
			const schemaController = SchemaController.buildSchemaController(old, Object.assign({}, old.opts, schemaControllerOpts));
			this[kSchemaController] = schemaController;
			this.getSchema = schemaController.getSchema.bind(schemaController);
			this.getSchemas = schemaController.getSchemas.bind(schemaController);
			return this;
		}
		function setReplySerializer(replySerializer) {
			throwIfAlreadyStarted("Cannot call \"setReplySerializer\"!");
			this[kReplySerializerDefault] = replySerializer;
			return this;
		}
		function setErrorHandler(func) {
			throwIfAlreadyStarted("Cannot call \"setErrorHandler\"!");
			if (typeof func !== "function") throw new FST_ERR_ERROR_HANDLER_NOT_FN();
			if (!options.allowErrorHandlerOverride && this[kErrorHandlerAlreadySet]) throw new FST_ERR_ERROR_HANDLER_ALREADY_SET();
			else if (this[kErrorHandlerAlreadySet]) FSTWRN004("To disable this behavior, set 'allowErrorHandlerOverride' to false or ignore this message. For more information, visit: https://fastify.dev/docs/latest/Reference/Server/#allowerrorhandleroverride");
			this[kErrorHandlerAlreadySet] = true;
			this[kErrorHandler] = buildErrorHandler(this[kErrorHandler], func.bind(this));
			return this;
		}
		function setChildLoggerFactory(factory) {
			throwIfAlreadyStarted("Cannot call \"setChildLoggerFactory\"!");
			this[kChildLoggerFactory] = factory;
			return this;
		}
		function printRoutes(opts = {}) {
			opts.includeMeta = opts.includeHooks ? opts.includeMeta ? supportedHooks.concat(opts.includeMeta) : supportedHooks : opts.includeMeta;
			return router.printRoutes(opts);
		}
		function wrapRouting(router, { rewriteUrl, logger }) {
			let isAsync;
			return function preRouting(req, res) {
				if (isAsync === void 0) isAsync = router.isAsyncConstraint();
				if (rewriteUrl) {
					req.originalUrl = req.url;
					const url = rewriteUrl.call(fastify, req);
					if (typeof url === "string") req.url = url;
					else {
						const err = new FST_ERR_ROUTE_REWRITE_NOT_STR(req.url, typeof url);
						req.destroy(err);
					}
				}
				router.routing(req, res, buildAsyncConstraintCallback(isAsync, req, res));
			};
		}
		function setGenReqId(func) {
			throwIfAlreadyStarted("Cannot call \"setGenReqId\"!");
			this[kGenReqId] = reqIdGenFactory(this[kOptions].requestIdHeader, func);
			return this;
		}
		function addHttpMethod(method, { hasBody = false } = {}) {
			if (typeof method !== "string" || http.METHODS.indexOf(method) === -1) throw new FST_ERR_ROUTE_METHOD_INVALID();
			if (hasBody === true) {
				this[kSupportedHTTPMethods].bodywith.add(method);
				this[kSupportedHTTPMethods].bodyless.delete(method);
			} else {
				this[kSupportedHTTPMethods].bodywith.delete(method);
				this[kSupportedHTTPMethods].bodyless.add(method);
			}
			const _method = method.toLowerCase();
			if (!this.hasDecorator(_method)) this.decorate(_method, function(url, options, handler) {
				return router.prepareRoute.call(this, {
					method,
					url,
					options,
					handler
				});
			});
			return this;
		}
	}
	function processOptions(options, defaultRoute, onBadUrl) {
		if (options && typeof options !== "object") throw new FST_ERR_OPTIONS_NOT_OBJ();
		else options = Object.assign({}, options);
		if (options.querystringParser && typeof options.querystringParser !== "function" || options.routerOptions?.querystringParser && typeof options.routerOptions.querystringParser !== "function") throw new FST_ERR_QSP_NOT_FN(typeof (options.querystringParser ?? options.routerOptions.querystringParser));
		if (options.schemaController && options.schemaController.bucket && typeof options.schemaController.bucket !== "function") throw new FST_ERR_SCHEMA_CONTROLLER_BUCKET_OPT_NOT_FN(typeof options.schemaController.bucket);
		validateBodyLimitOption(options.bodyLimit);
		const requestIdHeader = typeof options.requestIdHeader === "string" && options.requestIdHeader.length !== 0 ? options.requestIdHeader.toLowerCase() : options.requestIdHeader === true && "request-id";
		const genReqId = reqIdGenFactory(requestIdHeader, options.genReqId);
		const requestIdLogLabel = options.requestIdLogLabel || "reqId";
		options.bodyLimit = options.bodyLimit || defaultInitOptions.bodyLimit;
		const disableRequestLogging = options.disableRequestLogging || false;
		const ajvOptions = Object.assign({
			customOptions: {},
			plugins: []
		}, options.ajv);
		if (!ajvOptions.customOptions || Object.prototype.toString.call(ajvOptions.customOptions) !== "[object Object]") throw new FST_ERR_AJV_CUSTOM_OPTIONS_OPT_NOT_OBJ(typeof ajvOptions.customOptions);
		if (!ajvOptions.plugins || !Array.isArray(ajvOptions.plugins)) throw new FST_ERR_AJV_CUSTOM_OPTIONS_OPT_NOT_ARR(typeof ajvOptions.plugins);
		const { logger, hasLogger } = createLogger(options);
		options.connectionTimeout = options.connectionTimeout || defaultInitOptions.connectionTimeout;
		options.keepAliveTimeout = options.keepAliveTimeout || defaultInitOptions.keepAliveTimeout;
		options.maxRequestsPerSocket = options.maxRequestsPerSocket || defaultInitOptions.maxRequestsPerSocket;
		options.requestTimeout = options.requestTimeout || defaultInitOptions.requestTimeout;
		options.logger = logger;
		options.requestIdHeader = requestIdHeader;
		options.requestIdLogLabel = requestIdLogLabel;
		options.disableRequestLogging = disableRequestLogging;
		options.ajv = ajvOptions;
		options.clientErrorHandler = options.clientErrorHandler || defaultClientErrorHandler;
		options.allowErrorHandlerOverride = options.allowErrorHandlerOverride ?? defaultInitOptions.allowErrorHandlerOverride;
		const initialConfig = getSecuredInitialConfig(options);
		options.exposeHeadRoutes = initialConfig.exposeHeadRoutes;
		options.http2SessionTimeout = initialConfig.http2SessionTimeout;
		options.routerOptions = buildRouterOptions(options, {
			defaultRoute,
			onBadUrl,
			ignoreTrailingSlash: defaultInitOptions.ignoreTrailingSlash,
			ignoreDuplicateSlashes: defaultInitOptions.ignoreDuplicateSlashes,
			maxParamLength: defaultInitOptions.maxParamLength,
			allowUnsafeRegex: defaultInitOptions.allowUnsafeRegex,
			buildPrettyMeta: defaultBuildPrettyMeta,
			useSemicolonDelimiter: defaultInitOptions.useSemicolonDelimiter
		});
		return {
			options,
			genReqId,
			disableRequestLogging,
			hasLogger,
			initialConfig
		};
	}
	function defaultBuildPrettyMeta(route) {
		const cleanKeys = {};
		[
			"errorHandler",
			"logLevel",
			"logSerializers"
		].concat(supportedHooks).forEach((k) => {
			cleanKeys[k] = route.store[k];
		});
		return Object.assign({}, cleanKeys);
	}
	function defaultClientErrorHandler(err, socket) {
		if (err.code === "ECONNRESET" || socket.destroyed) return;
		let body, errorCode, errorStatus, errorLabel;
		if (err.code === "ERR_HTTP_REQUEST_TIMEOUT") {
			errorCode = "408";
			errorStatus = http.STATUS_CODES[errorCode];
			body = `{"error":"${errorStatus}","message":"Client Timeout","statusCode":408}`;
			errorLabel = "timeout";
		} else if (err.code === "HPE_HEADER_OVERFLOW") {
			errorCode = "431";
			errorStatus = http.STATUS_CODES[errorCode];
			body = `{"error":"${errorStatus}","message":"Exceeded maximum allowed HTTP header size","statusCode":431}`;
			errorLabel = "header_overflow";
		} else {
			errorCode = "400";
			errorStatus = http.STATUS_CODES[errorCode];
			body = `{"error":"${errorStatus}","message":"Client Error","statusCode":400}`;
			errorLabel = "error";
		}
		this.log.trace({ err }, `client ${errorLabel}`);
		if (socket.writable) socket.write(`HTTP/1.1 ${errorCode} ${errorStatus}\r\nContent-Length: ${body.length}\r\nContent-Type: application/json\r\n\r\n${body}`);
		socket.destroy(err);
	}
	function validateSchemaErrorFormatter(schemaErrorFormatter) {
		if (typeof schemaErrorFormatter !== "function") throw new FST_ERR_SCHEMA_ERROR_FORMATTER_NOT_FN(typeof schemaErrorFormatter);
		else if (schemaErrorFormatter.constructor.name === "AsyncFunction") throw new FST_ERR_SCHEMA_ERROR_FORMATTER_NOT_FN("AsyncFunction");
	}
	/**
	* These export configurations enable JS and TS developers
	* to consume fastify in whatever way best suits their needs.
	* Some examples of supported import syntax includes:
	* - `const fastify = require('fastify')`
	* - `const { fastify } = require('fastify')`
	* - `import * as Fastify from 'fastify'`
	* - `import { fastify, TSC_definition } from 'fastify'`
	* - `import fastify from 'fastify'`
	* - `import fastify, { TSC_definition } from 'fastify'`
	*/
	module.exports = fastify;
	module.exports.errorCodes = errorCodes;
	module.exports.fastify = fastify;
	module.exports.default = fastify;
}));
//#endregion
export { require_fastify as t };
