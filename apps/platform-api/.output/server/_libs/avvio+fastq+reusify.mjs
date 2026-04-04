import { r as __require, t as __commonJSMin } from "../_runtime.mjs";
import { t as require_error } from "./fastify__error.mjs";
//#region ../../node_modules/.bun/reusify@1.1.0/node_modules/reusify/reusify.js
var require_reusify = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	function reusify(Constructor) {
		var head = new Constructor();
		var tail = head;
		function get() {
			var current = head;
			if (current.next) head = current.next;
			else {
				head = new Constructor();
				tail = head;
			}
			current.next = null;
			return current;
		}
		function release(obj) {
			tail.next = obj;
			tail = obj;
		}
		return {
			get,
			release
		};
	}
	module.exports = reusify;
}));
//#endregion
//#region ../../node_modules/.bun/fastq@1.19.1/node_modules/fastq/queue.js
var require_queue = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var reusify = require_reusify();
	function fastqueue(context, worker, _concurrency) {
		if (typeof context === "function") {
			_concurrency = worker;
			worker = context;
			context = null;
		}
		if (!(_concurrency >= 1)) throw new Error("fastqueue concurrency must be equal to or greater than 1");
		var cache = reusify(Task);
		var queueHead = null;
		var queueTail = null;
		var _running = 0;
		var errorHandler = null;
		var self = {
			push,
			drain: noop,
			saturated: noop,
			pause,
			paused: false,
			get concurrency() {
				return _concurrency;
			},
			set concurrency(value) {
				if (!(value >= 1)) throw new Error("fastqueue concurrency must be equal to or greater than 1");
				_concurrency = value;
				if (self.paused) return;
				for (; queueHead && _running < _concurrency;) {
					_running++;
					release();
				}
			},
			running,
			resume,
			idle,
			length,
			getQueue,
			unshift,
			empty: noop,
			kill,
			killAndDrain,
			error
		};
		return self;
		function running() {
			return _running;
		}
		function pause() {
			self.paused = true;
		}
		function length() {
			var current = queueHead;
			var counter = 0;
			while (current) {
				current = current.next;
				counter++;
			}
			return counter;
		}
		function getQueue() {
			var current = queueHead;
			var tasks = [];
			while (current) {
				tasks.push(current.value);
				current = current.next;
			}
			return tasks;
		}
		function resume() {
			if (!self.paused) return;
			self.paused = false;
			if (queueHead === null) {
				_running++;
				release();
				return;
			}
			for (; queueHead && _running < _concurrency;) {
				_running++;
				release();
			}
		}
		function idle() {
			return _running === 0 && self.length() === 0;
		}
		function push(value, done) {
			var current = cache.get();
			current.context = context;
			current.release = release;
			current.value = value;
			current.callback = done || noop;
			current.errorHandler = errorHandler;
			if (_running >= _concurrency || self.paused) if (queueTail) {
				queueTail.next = current;
				queueTail = current;
			} else {
				queueHead = current;
				queueTail = current;
				self.saturated();
			}
			else {
				_running++;
				worker.call(context, current.value, current.worked);
			}
		}
		function unshift(value, done) {
			var current = cache.get();
			current.context = context;
			current.release = release;
			current.value = value;
			current.callback = done || noop;
			current.errorHandler = errorHandler;
			if (_running >= _concurrency || self.paused) if (queueHead) {
				current.next = queueHead;
				queueHead = current;
			} else {
				queueHead = current;
				queueTail = current;
				self.saturated();
			}
			else {
				_running++;
				worker.call(context, current.value, current.worked);
			}
		}
		function release(holder) {
			if (holder) cache.release(holder);
			var next = queueHead;
			if (next && _running <= _concurrency) if (!self.paused) {
				if (queueTail === queueHead) queueTail = null;
				queueHead = next.next;
				next.next = null;
				worker.call(context, next.value, next.worked);
				if (queueTail === null) self.empty();
			} else _running--;
			else if (--_running === 0) self.drain();
		}
		function kill() {
			queueHead = null;
			queueTail = null;
			self.drain = noop;
		}
		function killAndDrain() {
			queueHead = null;
			queueTail = null;
			self.drain();
			self.drain = noop;
		}
		function error(handler) {
			errorHandler = handler;
		}
	}
	function noop() {}
	function Task() {
		this.value = null;
		this.callback = noop;
		this.next = null;
		this.release = noop;
		this.context = null;
		this.errorHandler = null;
		var self = this;
		this.worked = function worked(err, result) {
			var callback = self.callback;
			var errorHandler = self.errorHandler;
			var val = self.value;
			self.value = null;
			self.callback = noop;
			if (self.errorHandler) errorHandler(err, val);
			callback.call(self.context, err, result);
			self.release(self);
		};
	}
	function queueAsPromised(context, worker, _concurrency) {
		if (typeof context === "function") {
			_concurrency = worker;
			worker = context;
			context = null;
		}
		function asyncWrapper(arg, cb) {
			worker.call(this, arg).then(function(res) {
				cb(null, res);
			}, cb);
		}
		var queue = fastqueue(context, asyncWrapper, _concurrency);
		var pushCb = queue.push;
		var unshiftCb = queue.unshift;
		queue.push = push;
		queue.unshift = unshift;
		queue.drained = drained;
		return queue;
		function push(value) {
			var p = new Promise(function(resolve, reject) {
				pushCb(value, function(err, result) {
					if (err) {
						reject(err);
						return;
					}
					resolve(result);
				});
			});
			p.catch(noop);
			return p;
		}
		function unshift(value) {
			var p = new Promise(function(resolve, reject) {
				unshiftCb(value, function(err, result) {
					if (err) {
						reject(err);
						return;
					}
					resolve(result);
				});
			});
			p.catch(noop);
			return p;
		}
		function drained() {
			return new Promise(function(resolve) {
				process.nextTick(function() {
					if (queue.idle()) resolve();
					else {
						var previousDrain = queue.drain;
						queue.drain = function() {
							if (typeof previousDrain === "function") previousDrain();
							resolve();
							queue.drain = previousDrain;
						};
					}
				});
			});
		}
	}
	module.exports = fastqueue;
	module.exports.promise = queueAsPromised;
}));
//#endregion
//#region ../../node_modules/.bun/avvio@9.2.0/node_modules/avvio/lib/errors.js
var require_errors = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { createError } = require_error();
	module.exports = {
		AVV_ERR_EXPOSE_ALREADY_DEFINED: createError("AVV_ERR_EXPOSE_ALREADY_DEFINED", "'%s' is already defined, specify an expose option for '%s'"),
		AVV_ERR_ATTRIBUTE_ALREADY_DEFINED: createError("AVV_ERR_ATTRIBUTE_ALREADY_DEFINED", "'%s' is already defined"),
		AVV_ERR_CALLBACK_NOT_FN: createError("AVV_ERR_CALLBACK_NOT_FN", "Callback for '%s' hook is not a function. Received: '%s'"),
		AVV_ERR_PLUGIN_NOT_VALID: createError("AVV_ERR_PLUGIN_NOT_VALID", "Plugin must be a function or a promise. Received: '%s'"),
		AVV_ERR_ROOT_PLG_BOOTED: createError("AVV_ERR_ROOT_PLG_BOOTED", "Root plugin has already booted"),
		AVV_ERR_PARENT_PLG_LOADED: createError("AVV_ERR_PARENT_PLG_LOADED", "Impossible to load '%s' plugin because the parent '%s' was already loaded"),
		AVV_ERR_READY_TIMEOUT: createError("AVV_ERR_READY_TIMEOUT", "Plugin did not start in time: '%s'. You may have forgotten to call 'done' function or to resolve a Promise"),
		AVV_ERR_PLUGIN_EXEC_TIMEOUT: createError("AVV_ERR_PLUGIN_EXEC_TIMEOUT", "Plugin did not start in time: '%s'. You may have forgotten to call 'done' function or to resolve a Promise")
	};
}));
//#endregion
//#region ../../node_modules/.bun/avvio@9.2.0/node_modules/avvio/lib/symbols.js
var require_symbols = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = {
		kAvvio: Symbol("avvio.Boot"),
		kIsOnCloseHandler: Symbol("isOnCloseHandler"),
		kThenifyDoNotWrap: Symbol("avvio.ThenifyDoNotWrap"),
		kUntrackNode: Symbol("avvio.TimeTree.untrackNode"),
		kTrackNode: Symbol("avvio.TimeTree.trackNode"),
		kGetParent: Symbol("avvio.TimeTree.getParent"),
		kGetNode: Symbol("avvio.TimeTree.getNode"),
		kAddNode: Symbol("avvio.TimeTree.addNode"),
		kPluginMeta: Symbol.for("plugin-meta")
	};
}));
//#endregion
//#region ../../node_modules/.bun/avvio@9.2.0/node_modules/avvio/lib/time-tree.js
var require_time_tree = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { kUntrackNode, kTrackNode, kGetParent, kGetNode, kAddNode } = require_symbols();
	/**
	* Node of the TimeTree
	* @typedef {object} TimeTreeNode
	* @property {string} id
	* @property {string|null} parent
	* @property {string} label
	* @property {Array<TimeTreeNode>} nodes
	* @property {number} start
	* @property {number|undefined} stop
	* @property {number|undefined} diff
	*/
	var TimeTree = class {
		constructor() {
			/**
			* @type {TimeTreeNode|null} root
			* @public
			*/
			this.root = null;
			/**
			* @type {Map<string, TimeTreeNode>} tableId
			* @public
			*/
			this.tableId = /* @__PURE__ */ new Map();
			/**
			* @type {Map<string, Array<TimeTreeNode>>} tableLabel
			* @public
			*/
			this.tableLabel = /* @__PURE__ */ new Map();
		}
		/**
		* @param {TimeTreeNode} node
		*/
		[kTrackNode](node) {
			this.tableId.set(node.id, node);
			if (this.tableLabel.has(node.label)) this.tableLabel.get(node.label).push(node);
			else this.tableLabel.set(node.label, [node]);
		}
		/**
		* @param {TimeTreeNode} node
		*/
		[kUntrackNode](node) {
			this.tableId.delete(node.id);
			const labelNode = this.tableLabel.get(node.label);
			labelNode.pop();
			if (labelNode.length === 0) this.tableLabel.delete(node.label);
		}
		/**
		* @param {string} parent
		* @returns {TimeTreeNode}
		*/
		[kGetParent](parent) {
			if (parent === null) return null;
			else if (this.tableLabel.has(parent)) {
				const parentNode = this.tableLabel.get(parent);
				return parentNode[parentNode.length - 1];
			} else return null;
		}
		/**
		*
		* @param {string} nodeId
		* @returns {TimeTreeNode}
		*/
		[kGetNode](nodeId) {
			return this.tableId.get(nodeId);
		}
		/**
		* @param {string} parent
		* @param {string} label
		* @param {number} start
		* @returns {TimeTreeNode["id"]}
		*/
		[kAddNode](parent, label, start) {
			const parentNode = this[kGetParent](parent);
			if (parentNode === null) {
				this.root = {
					parent: null,
					id: "root",
					label,
					nodes: [],
					start,
					stop: null,
					diff: -1
				};
				this[kTrackNode](this.root);
				return this.root.id;
			}
			const nodeId = `${label}-${Math.random()}`;
			/**
			* @type {TimeTreeNode}
			*/
			const childNode = {
				parent,
				id: nodeId,
				label,
				nodes: [],
				start,
				stop: null,
				diff: -1
			};
			parentNode.nodes.push(childNode);
			this[kTrackNode](childNode);
			return nodeId;
		}
		/**
		* @param {string} parent
		* @param {string} label
		* @param {number|undefined} start
		* @returns {TimeTreeNode["id"]}
		*/
		start(parent, label, start = Date.now()) {
			return this[kAddNode](parent, label, start);
		}
		/**
		* @param {string} nodeId
		* @param {number|undefined} stop
		*/
		stop(nodeId, stop = Date.now()) {
			const node = this[kGetNode](nodeId);
			if (node) {
				node.stop = stop;
				node.diff = node.stop - node.start || 0;
				this[kUntrackNode](node);
			}
		}
		/**
		* @returns {TimeTreeNode}
		*/
		toJSON() {
			return Object.assign({}, this.root);
		}
		/**
		* @returns {string}
		*/
		prettyPrint() {
			return prettyPrintTimeTree(this.toJSON());
		}
	};
	/**
	* @param {TimeTreeNode} obj
	* @param {string|undefined} prefix
	* @returns {string}
	*/
	function prettyPrintTimeTree(obj, prefix = "") {
		let result = prefix;
		const nodesCount = obj.nodes.length;
		const lastIndex = nodesCount - 1;
		result += `${obj.label} ${obj.diff} ms\n`;
		for (let i = 0; i < nodesCount; ++i) {
			const node = obj.nodes[i];
			const prefix_ = prefix + (i === lastIndex ? "  " : "│ ");
			result += prefix;
			result += i === lastIndex ? "└─" : "├─";
			result += node.nodes.length === 0 ? "─ " : "┬ ";
			result += prettyPrintTimeTree(node, prefix_).slice(prefix.length + 2);
		}
		return result;
	}
	module.exports = { TimeTree };
}));
//#endregion
//#region ../../node_modules/.bun/avvio@9.2.0/node_modules/avvio/lib/debug.js
var require_debug = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { debuglog } = __require("node:util");
	module.exports = { debug: debuglog("avvio") };
}));
//#endregion
//#region ../../node_modules/.bun/avvio@9.2.0/node_modules/avvio/lib/create-promise.js
var require_create_promise = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* @callback PromiseResolve
	* @param {any|PromiseLike<any>} value
	* @returns {void}
	*/
	/**
	* @callback PromiseReject
	* @param {any} reason
	* @returns {void}
	*/
	/**
	* @typedef PromiseObject
	* @property {Promise} promise
	* @property {PromiseResolve} resolve
	* @property {PromiseReject} reject
	*/
	/**
	* @returns {PromiseObject}
	*/
	function createPromise() {
		/**
		* @type {PromiseObject}
		*/
		const obj = {
			resolve: null,
			reject: null,
			promise: null
		};
		obj.promise = new Promise((resolve, reject) => {
			obj.resolve = resolve;
			obj.reject = reject;
		});
		return obj;
	}
	module.exports = { createPromise };
}));
//#endregion
//#region ../../node_modules/.bun/avvio@9.2.0/node_modules/avvio/lib/get-plugin-name.js
var require_get_plugin_name = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { kPluginMeta } = require_symbols();
	/**
	* @param {function} plugin
	* @param {object} [options]
	* @param {string} [options.name]
	* @returns {string}
	*/
	function getPluginName(plugin, options) {
		if (plugin[kPluginMeta]?.name) return plugin[kPluginMeta].name;
		if (options?.name) return options.name;
		if (plugin.name) return plugin.name;
		else return plugin.toString().split("\n").slice(0, 2).map((s) => s.trim()).join(" -- ");
	}
	module.exports = { getPluginName };
}));
//#endregion
//#region ../../node_modules/.bun/avvio@9.2.0/node_modules/avvio/lib/is-promise-like.js
var require_is_promise_like = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* @param {any} maybePromiseLike
	* @returns {maybePromiseLike is PromiseLike}
	*/
	function isPromiseLike(maybePromiseLike) {
		return maybePromiseLike !== null && typeof maybePromiseLike === "object" && typeof maybePromiseLike.then === "function";
	}
	module.exports = { isPromiseLike };
}));
//#endregion
//#region ../../node_modules/.bun/avvio@9.2.0/node_modules/avvio/lib/plugin.js
var require_plugin = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { EventEmitter } = __require("node:events");
	const { inherits: inherits$1 } = __require("node:util");
	const { debug } = require_debug();
	const { createPromise } = require_create_promise();
	const { AVV_ERR_PLUGIN_EXEC_TIMEOUT } = require_errors();
	const { getPluginName } = require_get_plugin_name();
	const { isPromiseLike } = require_is_promise_like();
	/**
	* @param {*} queue
	* @param {*} func
	* @param {*} options
	* @param {boolean} isAfter
	* @param {number} [timeout]
	*/
	function Plugin(queue, func, options, isAfter, timeout) {
		this.queue = queue;
		this.func = func;
		this.options = options;
		/**
		* @type {boolean}
		*/
		this.isAfter = isAfter;
		/**
		* @type {number}
		*/
		this.timeout = timeout;
		/**
		* @type {boolean}
		*/
		this.started = false;
		/**
		* @type {string}
		*/
		this.name = getPluginName(func, options);
		this.queue.pause();
		/**
		* @type {Error|null}
		*/
		this._error = null;
		/**
		* @type {boolean}
		*/
		this.loaded = false;
		this._promise = null;
		this.startTime = null;
	}
	inherits$1(Plugin, EventEmitter);
	/**
	* @callback ExecCallback
	* @param {Error|null} execErr
	* @returns
	*/
	/**
	*
	* @param {*} server
	* @param {ExecCallback} callback
	* @returns
	*/
	Plugin.prototype.exec = function(server, callback) {
		debug("exec", this.name);
		this.server = server;
		const func = this.func;
		const name = this.name;
		let completed = false;
		this.options = typeof this.options === "function" ? this.options(this.server) : this.options;
		let timer = null;
		/**
		* @param {Error} [execErr]
		*/
		const done = (execErr) => {
			if (completed) {
				debug("loading complete", name);
				return;
			}
			this._error = execErr;
			if (execErr) debug("exec errored", name);
			else debug("exec completed", name);
			completed = true;
			if (timer) clearTimeout(timer);
			callback(execErr);
		};
		if (this.timeout > 0) {
			debug("setting up timeout", name, this.timeout);
			timer = setTimeout(function() {
				debug("timed out", name);
				timer = null;
				const readyTimeoutErr = new AVV_ERR_PLUGIN_EXEC_TIMEOUT(name);
				readyTimeoutErr.fn = func;
				done(readyTimeoutErr);
			}, this.timeout);
		}
		this.started = true;
		this.startTime = Date.now();
		this.emit("start", this.server ? this.server.name : null, this.name, Date.now());
		const maybePromiseLike = func(this.server, this.options, done);
		if (isPromiseLike(maybePromiseLike)) {
			debug("exec: resolving promise", name);
			maybePromiseLike.then(() => process.nextTick(done), (e) => process.nextTick(done, e));
		} else if (func.length < 3) done();
	};
	/**
	* @returns {Promise}
	*/
	Plugin.prototype.loadedSoFar = function() {
		debug("loadedSoFar", this.name);
		if (this.loaded) return Promise.resolve();
		const setup = () => {
			this.server.after((afterErr, callback) => {
				this._error = afterErr;
				this.queue.pause();
				if (this._promise) {
					if (afterErr) {
						debug("rejecting promise", this.name, afterErr);
						this._promise.reject(afterErr);
					} else {
						debug("resolving promise", this.name);
						this._promise.resolve();
					}
					this._promise = null;
				}
				process.nextTick(callback, afterErr);
			});
			this.queue.resume();
		};
		let res;
		if (!this._promise) {
			this._promise = createPromise();
			res = this._promise.promise;
			if (!this.server) this.on("start", setup);
			else setup();
		} else res = Promise.resolve();
		return res;
	};
	/**
	* @callback EnqueueCallback
	* @param {Error|null} enqueueErr
	* @param {Plugin} result
	*/
	/**
	*
	* @param {Plugin} plugin
	* @param {EnqueueCallback} callback
	*/
	Plugin.prototype.enqueue = function(plugin, callback) {
		debug("enqueue", this.name, plugin.name);
		this.emit("enqueue", this.server ? this.server.name : null, this.name, Date.now());
		this.queue.push(plugin, callback);
	};
	/**
	* @callback FinishCallback
	* @param {Error|null} finishErr
	* @returns
	*/
	/**
	*
	* @param {Error|null} err
	* @param {FinishCallback} callback
	* @returns
	*/
	Plugin.prototype.finish = function(err, callback) {
		debug("finish", this.name, err);
		const done = () => {
			if (this.loaded) return;
			debug("loaded", this.name);
			this.emit("loaded", this.server ? this.server.name : null, this.name, Date.now());
			this.loaded = true;
			callback(err);
		};
		if (err) {
			if (this._promise) {
				this._promise.reject(err);
				this._promise = null;
			}
			done();
			return;
		}
		const check = () => {
			debug("check", this.name, this.queue.length(), this.queue.running(), this._promise);
			if (this.queue.length() === 0 && this.queue.running() === 0) if (this._promise) {
				const wrap = () => {
					debug("wrap");
					queueMicrotask(check);
				};
				this._promise.resolve();
				this._promise.promise.then(wrap, wrap);
				this._promise = null;
			} else done();
			else {
				debug("delayed", this.name);
				this.queue.drain = () => {
					debug("drain", this.name);
					this.queue.drain = noop;
					queueMicrotask(check);
				};
			}
		};
		queueMicrotask(check);
		this.queue.resume();
	};
	function noop() {}
	module.exports = { Plugin };
}));
//#endregion
//#region ../../node_modules/.bun/avvio@9.2.0/node_modules/avvio/lib/validate-plugin.js
var require_validate_plugin = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { AVV_ERR_PLUGIN_NOT_VALID } = require_errors();
	/**
	* @param {any} maybePlugin
	* @throws {AVV_ERR_PLUGIN_NOT_VALID}
	*
	* @returns {asserts plugin is Function|PromiseLike}
	*/
	function validatePlugin(maybePlugin) {
		if (!(maybePlugin && (typeof maybePlugin === "function" || typeof maybePlugin.then === "function"))) if (Array.isArray(maybePlugin)) throw new AVV_ERR_PLUGIN_NOT_VALID("array");
		else if (maybePlugin === null) throw new AVV_ERR_PLUGIN_NOT_VALID("null");
		else throw new AVV_ERR_PLUGIN_NOT_VALID(typeof maybePlugin);
	}
	module.exports = { validatePlugin };
}));
//#endregion
//#region ../../node_modules/.bun/avvio@9.2.0/node_modules/avvio/lib/is-bundled-or-typescript-plugin.js
var require_is_bundled_or_typescript_plugin = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* bundled or typescript plugin
	* @typedef {object} BundledOrTypescriptPlugin
	* @property {function} default
	*/
	/**
	* @param {any} maybeBundledOrTypescriptPlugin
	* @returns {plugin is BundledOrTypescriptPlugin}
	*/
	function isBundledOrTypescriptPlugin(maybeBundledOrTypescriptPlugin) {
		return maybeBundledOrTypescriptPlugin !== null && typeof maybeBundledOrTypescriptPlugin === "object" && typeof maybeBundledOrTypescriptPlugin.default === "function";
	}
	module.exports = { isBundledOrTypescriptPlugin };
}));
//#endregion
//#region ../../node_modules/.bun/avvio@9.2.0/node_modules/avvio/lib/thenify.js
var require_thenify = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { debug } = require_debug();
	const { kThenifyDoNotWrap } = require_symbols();
	/**
	* @callback PromiseConstructorLikeResolve
	* @param {any} value
	* @returns {void}
	*/
	/**
	* @callback PromiseConstructorLikeReject
	* @param {reason} error
	* @returns {void}
	*/
	/**
	* @callback PromiseConstructorLike
	* @param {PromiseConstructorLikeResolve} resolve
	* @param {PromiseConstructorLikeReject} reject
	* @returns {void}
	*/
	/**
	* @returns {PromiseConstructorLike}
	*/
	function thenify() {
		if (this.booted) {
			debug("thenify returning undefined because we are already booted");
			return;
		}
		if (this[kThenifyDoNotWrap]) {
			this[kThenifyDoNotWrap] = false;
			return;
		}
		debug("thenify");
		return (resolve, reject) => {
			return this._loadRegistered().then(() => {
				this[kThenifyDoNotWrap] = true;
				return resolve(this._server);
			}, reject);
		};
	}
	module.exports = { thenify };
}));
//#endregion
//#region ../../node_modules/.bun/avvio@9.2.0/node_modules/avvio/lib/execute-with-thenable.js
var require_execute_with_thenable = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { isPromiseLike } = require_is_promise_like();
	const { kAvvio } = require_symbols();
	/**
	* @callback ExecuteWithThenableCallback
	* @param {Error} error
	* @returns {void}
	*/
	/**
	* @param {Function} func
	* @param {Array<any>} args
	* @param {ExecuteWithThenableCallback} [callback]
	*/
	function executeWithThenable(func, args, callback) {
		let result;
		try {
			result = func.apply(func, args);
		} catch (error) {
			if (callback) process.nextTick(callback, error);
			return;
		}
		if (isPromiseLike(result) && !result[kAvvio]) result.then(() => process.nextTick(callback), (error) => process.nextTick(callback, error));
		else if (callback) process.nextTick(callback);
	}
	module.exports = { executeWithThenable };
}));
//#endregion
//#region ../../node_modules/.bun/avvio@9.2.0/node_modules/avvio/boot.js
var require_boot = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const fastq = require_queue();
	const EE = __require("node:events").EventEmitter;
	const inherits = __require("node:util").inherits;
	const { AVV_ERR_EXPOSE_ALREADY_DEFINED, AVV_ERR_CALLBACK_NOT_FN, AVV_ERR_ROOT_PLG_BOOTED, AVV_ERR_READY_TIMEOUT, AVV_ERR_ATTRIBUTE_ALREADY_DEFINED } = require_errors();
	const { kAvvio, kIsOnCloseHandler } = require_symbols();
	const { TimeTree } = require_time_tree();
	const { Plugin } = require_plugin();
	const { debug } = require_debug();
	const { validatePlugin } = require_validate_plugin();
	const { isBundledOrTypescriptPlugin } = require_is_bundled_or_typescript_plugin();
	const { isPromiseLike } = require_is_promise_like();
	const { thenify } = require_thenify();
	const { executeWithThenable } = require_execute_with_thenable();
	function Boot(server, opts, done) {
		if (typeof server === "function" && arguments.length === 1) {
			done = server;
			opts = {};
			server = null;
		}
		if (typeof opts === "function") {
			done = opts;
			opts = {};
		}
		opts = opts || {};
		opts.autostart = opts.autostart !== false;
		opts.timeout = Number(opts.timeout) || 0;
		opts.expose = opts.expose || {};
		if (!new.target) return new Boot(server, opts, done);
		this._server = server || this;
		this._opts = opts;
		if (server) this._expose();
		/**
		* @type {Array<Plugin>}
		*/
		this._current = [];
		this._error = null;
		this._lastUsed = null;
		this.setMaxListeners(0);
		if (done) this.once("start", done);
		this.started = false;
		this.booted = false;
		this.pluginTree = new TimeTree();
		this._readyQ = fastq(this, callWithCbOrNextTick, 1);
		this._readyQ.pause();
		this._readyQ.drain = () => {
			this.emit("start");
			this._readyQ.drain = noop;
		};
		this._closeQ = fastq(this, closeWithCbOrNextTick, 1);
		this._closeQ.pause();
		this._closeQ.drain = () => {
			this.emit("close");
			this._closeQ.drain = noop;
		};
		this._doStart = null;
		const instance = this;
		this._root = new Plugin(fastq(this, this._loadPluginNextTick, 1), function root(server, opts, done) {
			instance._doStart = done;
			opts.autostart && instance.start();
		}, opts, false, 0);
		this._trackPluginLoading(this._root);
		this._loadPlugin(this._root, (err) => {
			debug("root plugin ready");
			try {
				this.emit("preReady");
				this._root = null;
			} catch (preReadyError) {
				err = err || this._error || preReadyError;
			}
			if (err) {
				this._error = err;
				if (this._readyQ.length() === 0) throw err;
			} else this.booted = true;
			this._readyQ.resume();
		});
	}
	inherits(Boot, EE);
	if ("asyncDispose" in Symbol) Boot.prototype[Symbol.asyncDispose] = function() {
		return new Promise((resolve, reject) => {
			this.close((err) => {
				if (err) return reject(err);
				resolve();
			});
		});
	};
	Boot.prototype.start = function() {
		this.started = true;
		process.nextTick(this._doStart);
		return this;
	};
	Boot.prototype.override = function(server, func, opts) {
		return server;
	};
	Boot.prototype[kAvvio] = true;
	Boot.prototype.use = function(plugin, opts) {
		this._lastUsed = this._addPlugin(plugin, opts, false);
		return this;
	};
	Boot.prototype._loadRegistered = function() {
		const plugin = this._current[0];
		if (!this.started && !this.booted) process.nextTick(() => this._root.queue.resume());
		if (!plugin) return Promise.resolve();
		return plugin.loadedSoFar();
	};
	Object.defineProperty(Boot.prototype, "then", { get: thenify });
	Boot.prototype._addPlugin = function(pluginFn, opts, isAfter) {
		if (isBundledOrTypescriptPlugin(pluginFn)) pluginFn = pluginFn.default;
		validatePlugin(pluginFn);
		opts = opts || {};
		if (this.booted) throw new AVV_ERR_ROOT_PLG_BOOTED();
		const current = this._current[0];
		let timeout = this._opts.timeout;
		if (!current.loaded && current.timeout > 0) {
			const delta = Date.now() - current.startTime;
			timeout = current.timeout - (delta + 3);
		}
		const plugin = new Plugin(fastq(this, this._loadPluginNextTick, 1), pluginFn, opts, isAfter, timeout);
		this._trackPluginLoading(plugin);
		if (current.loaded) throw new Error(plugin.name, current.name);
		current.enqueue(plugin, (err) => {
			err && (this._error = err);
		});
		return plugin;
	};
	Boot.prototype._expose = function _expose() {
		const instance = this;
		const server = instance._server;
		const { use: useKey = "use", after: afterKey = "after", ready: readyKey = "ready", onClose: onCloseKey = "onClose", close: closeKey = "close" } = this._opts.expose;
		if (server[useKey]) throw new AVV_ERR_EXPOSE_ALREADY_DEFINED(useKey, "use");
		server[useKey] = function(fn, opts) {
			instance.use(fn, opts);
			return this;
		};
		if (server[afterKey]) throw new AVV_ERR_EXPOSE_ALREADY_DEFINED(afterKey, "after");
		server[afterKey] = function(func) {
			if (typeof func !== "function") return instance._loadRegistered();
			instance.after(encapsulateThreeParam(func, this));
			return this;
		};
		if (server[readyKey]) throw new AVV_ERR_EXPOSE_ALREADY_DEFINED(readyKey, "ready");
		server[readyKey] = function(func) {
			if (func && typeof func !== "function") throw new AVV_ERR_CALLBACK_NOT_FN(readyKey, typeof func);
			return instance.ready(func ? encapsulateThreeParam(func, this) : void 0);
		};
		if (server[onCloseKey]) throw new AVV_ERR_EXPOSE_ALREADY_DEFINED(onCloseKey, "onClose");
		server[onCloseKey] = function(func) {
			if (typeof func !== "function") throw new AVV_ERR_CALLBACK_NOT_FN(onCloseKey, typeof func);
			instance.onClose(encapsulateTwoParam(func, this));
			return this;
		};
		if (server[closeKey]) throw new AVV_ERR_EXPOSE_ALREADY_DEFINED(closeKey, "close");
		server[closeKey] = function(func) {
			if (func && typeof func !== "function") throw new AVV_ERR_CALLBACK_NOT_FN(closeKey, typeof func);
			if (func) {
				instance.close(encapsulateThreeParam(func, this));
				return this;
			}
			return instance.close();
		};
		if (server.then) throw new AVV_ERR_ATTRIBUTE_ALREADY_DEFINED("then");
		Object.defineProperty(server, "then", { get: thenify.bind(instance) });
		server[kAvvio] = true;
	};
	Boot.prototype.after = function(func) {
		if (!func) return this._loadRegistered();
		this._addPlugin(_after.bind(this), {}, true);
		function _after(s, opts, done) {
			callWithCbOrNextTick.call(this, func, done);
		}
		return this;
	};
	Boot.prototype.onClose = function(func) {
		if (typeof func !== "function") throw new AVV_ERR_CALLBACK_NOT_FN("onClose", typeof func);
		func[kIsOnCloseHandler] = true;
		this._closeQ.unshift(func, (err) => {
			err && (this._error = err);
		});
		return this;
	};
	Boot.prototype.close = function(func) {
		let promise;
		if (func) {
			if (typeof func !== "function") throw new AVV_ERR_CALLBACK_NOT_FN("close", typeof func);
		} else promise = new Promise(function(resolve, reject) {
			func = function(err) {
				if (err) return reject(err);
				resolve();
			};
		});
		this.ready(() => {
			this._error = null;
			this._closeQ.push(func);
			process.nextTick(this._closeQ.resume.bind(this._closeQ));
		});
		return promise;
	};
	Boot.prototype.ready = function(func) {
		if (func) {
			if (typeof func !== "function") throw new AVV_ERR_CALLBACK_NOT_FN("ready", typeof func);
			this._readyQ.push(func);
			queueMicrotask(this.start.bind(this));
			return;
		}
		return new Promise((resolve, reject) => {
			this._readyQ.push(readyPromiseCB);
			this.start();
			/**
			* The `encapsulateThreeParam` let callback function
			* bind to the right server instance.
			* In promises we need to track the last server
			* instance loaded, the first one in the _current queue.
			*/
			const relativeContext = this._current[0].server;
			function readyPromiseCB(err, context, done) {
				if (err) reject(err);
				else resolve(relativeContext);
				process.nextTick(done);
			}
		});
	};
	/**
	* @param {Plugin} plugin
	* @returns {void}
	*/
	Boot.prototype._trackPluginLoading = function(plugin) {
		const parentName = this._current[0]?.name || null;
		plugin.once("start", (serverName, funcName, time) => {
			const nodeId = this.pluginTree.start(parentName || null, funcName, time);
			plugin.once("loaded", (serverName, funcName, time) => {
				this.pluginTree.stop(nodeId, time);
			});
		});
	};
	Boot.prototype.prettyPrint = function() {
		return this.pluginTree.prettyPrint();
	};
	Boot.prototype.toJSON = function() {
		return this.pluginTree.toJSON();
	};
	/**
	* @callback LoadPluginCallback
	* @param {Error} [err]
	*/
	/**
	* Load a plugin
	*
	* @param {Plugin} plugin
	* @param {LoadPluginCallback} callback
	*/
	Boot.prototype._loadPlugin = function(plugin, callback) {
		const instance = this;
		if (isPromiseLike(plugin.func)) {
			plugin.func.then((fn) => {
				if (typeof fn.default === "function") fn = fn.default;
				plugin.func = fn;
				this._loadPlugin(plugin, callback);
			}, callback);
			return;
		}
		const last = instance._current[0];
		instance._current.unshift(plugin);
		if (instance._error && !plugin.isAfter) {
			debug("skipping loading of plugin as instance errored and it is not an after", plugin.name);
			process.nextTick(execCallback);
			return;
		}
		let server = last?.server || instance._server;
		if (!plugin.isAfter) try {
			server = instance.override(server, plugin.func, plugin.options);
		} catch (overrideErr) {
			debug("override errored", plugin.name);
			return execCallback(overrideErr);
		}
		plugin.exec(server, execCallback);
		function execCallback(err) {
			plugin.finish(err, (err) => {
				instance._current.shift();
				callback(err);
			});
		}
	};
	/**
	* Delays plugin loading until the next tick to ensure any bound `_after` callbacks have a chance
	* to run prior to executing the next plugin
	*/
	Boot.prototype._loadPluginNextTick = function(plugin, callback) {
		process.nextTick(this._loadPlugin.bind(this), plugin, callback);
	};
	function noop() {}
	function callWithCbOrNextTick(func, cb) {
		const context = this._server;
		const err = this._error;
		this._error = null;
		if (func.length === 0) {
			this._error = err;
			executeWithThenable(func, [], cb);
		} else if (func.length === 1) executeWithThenable(func, [err], cb);
		else if (this._opts.timeout === 0) {
			const wrapCb = (err) => {
				this._error = err;
				cb(this._error);
			};
			if (func.length === 2) func(err, wrapCb);
			else func(err, context, wrapCb);
		} else timeoutCall.call(this, func, err, context, cb);
	}
	function timeoutCall(func, rootErr, context, cb) {
		const name = func.unwrappedName ?? func.name;
		debug("setting up ready timeout", name, this._opts.timeout);
		let timer = setTimeout(() => {
			debug("timed out", name);
			timer = null;
			const toutErr = new AVV_ERR_READY_TIMEOUT(name);
			toutErr.fn = func;
			this._error = toutErr;
			cb(toutErr);
		}, this._opts.timeout);
		if (func.length === 2) func(rootErr, timeoutCb.bind(this));
		else func(rootErr, context, timeoutCb.bind(this));
		function timeoutCb(err) {
			if (timer) {
				clearTimeout(timer);
				this._error = err;
				cb(this._error);
			}
		}
	}
	function closeWithCbOrNextTick(func, cb) {
		const context = this._server;
		const isOnCloseHandler = func[kIsOnCloseHandler];
		if (func.length === 0 || func.length === 1) {
			let promise;
			if (isOnCloseHandler) promise = func(context);
			else promise = func(this._error);
			if (promise && typeof promise.then === "function") {
				debug("resolving close/onClose promise");
				promise.then(() => process.nextTick(cb), (e) => process.nextTick(cb, e));
			} else process.nextTick(cb);
		} else if (func.length === 2) if (isOnCloseHandler) func(context, cb);
		else func(this._error, cb);
		else if (isOnCloseHandler) func(context, cb);
		else func(this._error, context, cb);
	}
	function encapsulateTwoParam(func, that) {
		return _encapsulateTwoParam.bind(that);
		function _encapsulateTwoParam(context, cb) {
			let res;
			if (func.length === 0) {
				res = func();
				if (res?.then) res.then(function() {
					process.nextTick(cb);
				}, cb);
				else process.nextTick(cb);
			} else if (func.length === 1) {
				res = func(this);
				if (res?.then) res.then(function() {
					process.nextTick(cb);
				}, cb);
				else process.nextTick(cb);
			} else func(this, cb);
		}
	}
	function encapsulateThreeParam(func, that) {
		const wrapped = _encapsulateThreeParam.bind(that);
		wrapped.unwrappedName = func.name;
		return wrapped;
		function _encapsulateThreeParam(err, cb) {
			let res;
			if (!func) process.nextTick(cb);
			else if (func.length === 0) {
				res = func();
				if (res?.then) res.then(function() {
					process.nextTick(cb, err);
				}, cb);
				else process.nextTick(cb, err);
			} else if (func.length === 1) {
				res = func(err);
				if (res?.then) res.then(function() {
					process.nextTick(cb);
				}, cb);
				else process.nextTick(cb);
			} else if (func.length === 2) func(err, cb);
			else func(err, this, cb);
		}
	}
	module.exports = Boot;
}));
//#endregion
export { require_boot as t };
