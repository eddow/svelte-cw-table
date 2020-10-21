
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function is_promise(value) {
        return value && typeof value === 'object' && typeof value.then === 'function';
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    function handle_promise(promise, info) {
        const token = info.token = {};
        function update(type, index, key, value) {
            if (info.token !== token)
                return;
            info.resolved = value;
            let child_ctx = info.ctx;
            if (key !== undefined) {
                child_ctx = child_ctx.slice();
                child_ctx[key] = value;
            }
            const block = type && (info.current = type)(child_ctx);
            let needs_flush = false;
            if (info.block) {
                if (info.blocks) {
                    info.blocks.forEach((block, i) => {
                        if (i !== index && block) {
                            group_outros();
                            transition_out(block, 1, 1, () => {
                                info.blocks[i] = null;
                            });
                            check_outros();
                        }
                    });
                }
                else {
                    info.block.d(1);
                }
                block.c();
                transition_in(block, 1);
                block.m(info.mount(), info.anchor);
                needs_flush = true;
            }
            info.block = block;
            if (info.blocks)
                info.blocks[index] = block;
            if (needs_flush) {
                flush();
            }
        }
        if (is_promise(promise)) {
            const current_component = get_current_component();
            promise.then(value => {
                set_current_component(current_component);
                update(info.then, 1, info.value, value);
                set_current_component(null);
            }, error => {
                set_current_component(current_component);
                update(info.catch, 2, info.error, error);
                set_current_component(null);
                if (!info.hasCatch) {
                    throw error;
                }
            });
            // if we previously had a then/catch block, destroy it
            if (info.current !== info.pending) {
                update(info.pending, 0);
                return true;
            }
        }
        else {
            if (info.current !== info.then) {
                update(info.then, 1, info.value, promise);
                return true;
            }
            info.resolved = promise;
        }
    }
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error(`Cannot have duplicate keys in a keyed each`);
            }
            keys.add(key);
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.29.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev("SvelteDOMSetProperty", { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    var dataContextKey = {};
    var rowContextKey = {};
    var header = {};
    var footer = {};

    //https://github.com/hperrin/svelte-material-ui/blob/master/packages/common/exclude.js
    function exclude(obj, keys) {
      let names = Object.getOwnPropertyNames(obj);
      const newObj = {};

      for (let i = 0; i < names.length; i++) {
        const name = names[i];
        const cashIndex = name.indexOf('$');
        if (cashIndex !== -1 && keys.indexOf(name.substring(0, cashIndex + 1)) !== -1) {
          continue;
        }
        if (keys.indexOf(name) !== -1) {
          continue;
        }
        newObj[name] = obj[name];
      }

      return newObj;
    }

    //https://github.com/hperrin/svelte-material-ui/blob/master/packages/common/useActions.js
    function useActions(node, actions) {
      let objects = [];

      if (actions) {
        for (let i = 0; i < actions.length; i++) {
          const isArray = Array.isArray(actions[i]);
          const action = isArray ? actions[i][0] : actions[i];
          if (isArray && actions[i].length > 1) {
            objects.push(action(node, actions[i][1]));
          } else {
            objects.push(action(node));
          }
        }
      }

      return {
        update(actions) {
          if ((actions && actions.length || 0) != objects.length) {
            throw new Error('You must not change the length of an actions array.');
          }

          if (actions) {
            for (let i = 0; i < actions.length; i++) {
              if (objects[i] && 'update' in objects[i]) {
                const isArray = Array.isArray(actions[i]);
                if (isArray && actions[i].length > 1) {
                  objects[i].update(actions[i][1]);
                } else {
                  objects[i].update();
                }
              }
            }
          }
        },

        destroy() {
          for (let i = 0; i < objects.length; i++) {
            if (objects[i] && 'destroy' in objects[i]) {
              objects[i].destroy();
            }
          }
        }
      }
    }

    /* src\TableRow.svelte generated by Svelte v3.29.0 */
    const file = "src\\TableRow.svelte";

    function create_fragment(ctx) {
    	let tr;
    	let useActions_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[5].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);

    	let tr_levels = [
    		{ "row-id": /*id*/ ctx[0] },
    		exclude(/*$$props*/ ctx[2], ["use", "class", "row", "id"])
    	];

    	let tr_data = {};

    	for (let i = 0; i < tr_levels.length; i += 1) {
    		tr_data = assign(tr_data, tr_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			if (default_slot) default_slot.c();
    			set_attributes(tr, tr_data);
    			add_location(tr, file, 10, 1, 294);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);

    			if (default_slot) {
    				default_slot.m(tr, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = action_destroyer(useActions_action = useActions.call(null, tr, /*use*/ ctx[1]));
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 16) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[4], dirty, null, null);
    				}
    			}

    			set_attributes(tr, tr_data = get_spread_update(tr_levels, [
    				(!current || dirty & /*id*/ 1) && { "row-id": /*id*/ ctx[0] },
    				dirty & /*$$props*/ 4 && exclude(/*$$props*/ ctx[2], ["use", "class", "row", "id"])
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty & /*use*/ 2) useActions_action.update.call(null, /*use*/ ctx[1]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("TableRow", slots, ['default']);
    	let { row } = $$props;
    	let { id } = $$props;
    	let { use = [] } = $$props;
    	setContext(rowContextKey, row);

    	$$self.$$set = $$new_props => {
    		$$invalidate(2, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("row" in $$new_props) $$invalidate(3, row = $$new_props.row);
    		if ("id" in $$new_props) $$invalidate(0, id = $$new_props.id);
    		if ("use" in $$new_props) $$invalidate(1, use = $$new_props.use);
    		if ("$$scope" in $$new_props) $$invalidate(4, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		setContext,
    		rowContextKey,
    		exclude,
    		useActions,
    		row,
    		id,
    		use
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(2, $$props = assign(assign({}, $$props), $$new_props));
    		if ("row" in $$props) $$invalidate(3, row = $$new_props.row);
    		if ("id" in $$props) $$invalidate(0, id = $$new_props.id);
    		if ("use" in $$props) $$invalidate(1, use = $$new_props.use);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [id, use, $$props, row, $$scope, slots];
    }

    class TableRow extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { row: 3, id: 0, use: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TableRow",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*row*/ ctx[3] === undefined && !("row" in props)) {
    			console.warn("<TableRow> was created without expected prop 'row'");
    		}

    		if (/*id*/ ctx[0] === undefined && !("id" in props)) {
    			console.warn("<TableRow> was created without expected prop 'id'");
    		}
    	}

    	get row() {
    		throw new Error("<TableRow>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set row(value) {
    		throw new Error("<TableRow>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<TableRow>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<TableRow>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get use() {
    		throw new Error("<TableRow>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<TableRow>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    //https://github.com/hperrin/svelte-material-ui/blob/master/packages/common/prefixFilter.js

    function prefixFilter(obj, prefix) {
      let names = Object.getOwnPropertyNames(obj);
      const newObj = {};

      for (let i = 0; i < names.length; i++) {
        const name = names[i];
        if (name.substring(0, prefix.length) === prefix) {
          newObj[name.substring(prefix.length)] = obj[name];
        }
      }

      return newObj;
    }

    /* src\Table.svelte generated by Svelte v3.29.0 */
    const file$1 = "src\\Table.svelte";
    const get_default_slot_changes_2 = dirty => ({});
    const get_default_slot_context_2 = ctx => ({ row: footer });
    const get_default_slot_changes_1 = dirty => ({ row: dirty & /*data*/ 1 });
    const get_default_slot_context_1 = ctx => ({ row: /*row*/ ctx[9] });

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	child_ctx[11] = i;
    	return child_ctx;
    }

    const get_default_slot_changes = dirty => ({});
    const get_default_slot_context = ctx => ({ row: header });

    // (19:2) {#if columnHeaders}
    function create_if_block_1(ctx) {
    	let thead;
    	let tablerow;
    	let current;
    	const tablerow_spread_levels = [{ id: "header" }, { row: header }, prefixFilter(/*$$props*/ ctx[5], "tr$")];

    	let tablerow_props = {
    		$$slots: { default: [create_default_slot_2] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < tablerow_spread_levels.length; i += 1) {
    		tablerow_props = assign(tablerow_props, tablerow_spread_levels[i]);
    	}

    	tablerow = new TableRow({ props: tablerow_props, $$inline: true });

    	const block = {
    		c: function create() {
    			thead = element("thead");
    			create_component(tablerow.$$.fragment);
    			add_location(thead, file$1, 19, 3, 662);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, thead, anchor);
    			mount_component(tablerow, thead, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tablerow_changes = (dirty & /*header, prefixFilter, $$props*/ 32)
    			? get_spread_update(tablerow_spread_levels, [
    					tablerow_spread_levels[0],
    					dirty & /*header*/ 0 && { row: header },
    					dirty & /*prefixFilter, $$props*/ 32 && get_spread_object(prefixFilter(/*$$props*/ ctx[5], "tr$"))
    				])
    			: {};

    			if (dirty & /*$$scope*/ 256) {
    				tablerow_changes.$$scope = { dirty, ctx };
    			}

    			tablerow.$set(tablerow_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tablerow.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tablerow.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(thead);
    			destroy_component(tablerow);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(19:2) {#if columnHeaders}",
    		ctx
    	});

    	return block;
    }

    // (21:4) <TableRow id="header" row={header} {...prefixFilter($$props, 'tr$')}>
    function create_default_slot_2(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[7].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], get_default_slot_context);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 256) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[8], dirty, get_default_slot_changes, get_default_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(21:4) <TableRow id=\\\"header\\\" row={header} {...prefixFilter($$props, 'tr$')}>",
    		ctx
    	});

    	return block;
    }

    // (28:4) <TableRow id={rowId(row, ndx)} row={row} {...prefixFilter($$props, 'tr$')}>
    function create_default_slot_1(ctx) {
    	let t;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[7].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], get_default_slot_context_1);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    			t = space();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			insert_dev(target, t, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope, data*/ 257) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[8], dirty, get_default_slot_changes_1, get_default_slot_context_1);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(28:4) <TableRow id={rowId(row, ndx)} row={row} {...prefixFilter($$props, 'tr$')}>",
    		ctx
    	});

    	return block;
    }

    // (27:3) {#each data as row, ndx (rowId(row, ndx))}
    function create_each_block(key_2, ctx) {
    	let first;
    	let tablerow;
    	let current;

    	const tablerow_spread_levels = [
    		{
    			id: /*rowId*/ ctx[4](/*row*/ ctx[9], /*ndx*/ ctx[11])
    		},
    		{ row: /*row*/ ctx[9] },
    		prefixFilter(/*$$props*/ ctx[5], "tr$")
    	];

    	let tablerow_props = {
    		$$slots: { default: [create_default_slot_1] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < tablerow_spread_levels.length; i += 1) {
    		tablerow_props = assign(tablerow_props, tablerow_spread_levels[i]);
    	}

    	tablerow = new TableRow({ props: tablerow_props, $$inline: true });

    	const block = {
    		key: key_2,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(tablerow.$$.fragment);
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(tablerow, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tablerow_changes = (dirty & /*rowId, data, prefixFilter, $$props*/ 49)
    			? get_spread_update(tablerow_spread_levels, [
    					dirty & /*rowId, data*/ 17 && {
    						id: /*rowId*/ ctx[4](/*row*/ ctx[9], /*ndx*/ ctx[11])
    					},
    					dirty & /*data*/ 1 && { row: /*row*/ ctx[9] },
    					dirty & /*prefixFilter, $$props*/ 32 && get_spread_object(prefixFilter(/*$$props*/ ctx[5], "tr$"))
    				])
    			: {};

    			if (dirty & /*$$scope, data*/ 257) {
    				tablerow_changes.$$scope = { dirty, ctx };
    			}

    			tablerow.$set(tablerow_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tablerow.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tablerow.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			destroy_component(tablerow, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(27:3) {#each data as row, ndx (rowId(row, ndx))}",
    		ctx
    	});

    	return block;
    }

    // (33:2) {#if columnFooters}
    function create_if_block(ctx) {
    	let tfoot;
    	let tablerow;
    	let current;
    	const tablerow_spread_levels = [{ id: "header" }, { row: footer }, prefixFilter(/*$$props*/ ctx[5], "tr$")];

    	let tablerow_props = {
    		$$slots: { default: [create_default_slot] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < tablerow_spread_levels.length; i += 1) {
    		tablerow_props = assign(tablerow_props, tablerow_spread_levels[i]);
    	}

    	tablerow = new TableRow({ props: tablerow_props, $$inline: true });

    	const block = {
    		c: function create() {
    			tfoot = element("tfoot");
    			create_component(tablerow.$$.fragment);
    			add_location(tfoot, file$1, 33, 3, 1044);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tfoot, anchor);
    			mount_component(tablerow, tfoot, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tablerow_changes = (dirty & /*footer, prefixFilter, $$props*/ 32)
    			? get_spread_update(tablerow_spread_levels, [
    					tablerow_spread_levels[0],
    					dirty & /*footer*/ 0 && { row: footer },
    					dirty & /*prefixFilter, $$props*/ 32 && get_spread_object(prefixFilter(/*$$props*/ ctx[5], "tr$"))
    				])
    			: {};

    			if (dirty & /*$$scope*/ 256) {
    				tablerow_changes.$$scope = { dirty, ctx };
    			}

    			tablerow.$set(tablerow_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tablerow.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tablerow.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tfoot);
    			destroy_component(tablerow);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(33:2) {#if columnFooters}",
    		ctx
    	});

    	return block;
    }

    // (35:4) <TableRow id="header" row={footer} {...prefixFilter($$props, 'tr$')}>
    function create_default_slot(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[7].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], get_default_slot_context_2);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 256) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[8], dirty, get_default_slot_changes_2, get_default_slot_context_2);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(35:4) <TableRow id=\\\"header\\\" row={footer} {...prefixFilter($$props, 'tr$')}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let table;
    	let t0;
    	let tbody;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t1;
    	let useActions_action;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*columnHeaders*/ ctx[1] && create_if_block_1(ctx);
    	let each_value = /*data*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*rowId*/ ctx[4](/*row*/ ctx[9], /*ndx*/ ctx[11]);
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	let if_block1 = /*columnFooters*/ ctx[2] && create_if_block(ctx);
    	let table_levels = [exclude(/*$$props*/ ctx[5], ["use", "class", "tr$"])];
    	let table_data = {};

    	for (let i = 0; i < table_levels.length; i += 1) {
    		table_data = assign(table_data, table_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			table = element("table");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = space();
    			if (if_block1) if_block1.c();
    			add_location(tbody, file$1, 25, 2, 815);
    			set_attributes(table, table_data);
    			add_location(table, file$1, 17, 1, 559);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, table, anchor);
    			if (if_block0) if_block0.m(table, null);
    			append_dev(table, t0);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}

    			append_dev(table, t1);
    			if (if_block1) if_block1.m(table, null);
    			current = true;

    			if (!mounted) {
    				dispose = action_destroyer(useActions_action = useActions.call(null, table, /*use*/ ctx[3]));
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*columnHeaders*/ ctx[1]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*columnHeaders*/ 2) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(table, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (dirty & /*rowId, data, prefixFilter, $$props, $$scope*/ 305) {
    				const each_value = /*data*/ ctx[0];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, tbody, outro_and_destroy_block, create_each_block, null, get_each_context);
    				check_outros();
    			}

    			if (/*columnFooters*/ ctx[2]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*columnFooters*/ 4) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(table, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			set_attributes(table, table_data = get_spread_update(table_levels, [
    				dirty & /*$$props*/ 32 && exclude(/*$$props*/ ctx[5], ["use", "class", "tr$"])
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty & /*use*/ 8) useActions_action.update.call(null, /*use*/ ctx[3]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(table);
    			if (if_block0) if_block0.d();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			if (if_block1) if_block1.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Table", slots, ['default']);
    	let { data } = $$props;
    	let { key = null } = $$props;
    	let { columnHeaders = true } = $$props;
    	let { columnFooters = false } = $$props;
    	let { use = [] } = $$props;
    	setContext(dataContextKey, () => data);

    	function rowId(row, ndx) {
    		return key ? row[key] : ndx;
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(5, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("data" in $$new_props) $$invalidate(0, data = $$new_props.data);
    		if ("key" in $$new_props) $$invalidate(6, key = $$new_props.key);
    		if ("columnHeaders" in $$new_props) $$invalidate(1, columnHeaders = $$new_props.columnHeaders);
    		if ("columnFooters" in $$new_props) $$invalidate(2, columnFooters = $$new_props.columnFooters);
    		if ("use" in $$new_props) $$invalidate(3, use = $$new_props.use);
    		if ("$$scope" in $$new_props) $$invalidate(8, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		TableRow,
    		setContext,
    		dataContextKey,
    		header,
    		footer,
    		exclude,
    		prefixFilter,
    		useActions,
    		data,
    		key,
    		columnHeaders,
    		columnFooters,
    		use,
    		rowId
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(5, $$props = assign(assign({}, $$props), $$new_props));
    		if ("data" in $$props) $$invalidate(0, data = $$new_props.data);
    		if ("key" in $$props) $$invalidate(6, key = $$new_props.key);
    		if ("columnHeaders" in $$props) $$invalidate(1, columnHeaders = $$new_props.columnHeaders);
    		if ("columnFooters" in $$props) $$invalidate(2, columnFooters = $$new_props.columnFooters);
    		if ("use" in $$props) $$invalidate(3, use = $$new_props.use);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [data, columnHeaders, columnFooters, use, rowId, $$props, key, slots, $$scope];
    }

    class Table extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			data: 0,
    			key: 6,
    			columnHeaders: 1,
    			columnFooters: 2,
    			use: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Table",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*data*/ ctx[0] === undefined && !("data" in props)) {
    			console.warn("<Table> was created without expected prop 'data'");
    		}
    	}

    	get data() {
    		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get key() {
    		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set key(value) {
    		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get columnHeaders() {
    		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set columnHeaders(value) {
    		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get columnFooters() {
    		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set columnFooters(value) {
    		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get use() {
    		throw new Error("<Table>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<Table>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Column.svelte generated by Svelte v3.29.0 */
    const file$2 = "src\\Column.svelte";
    const get_footer_slot_changes = dirty => ({});
    const get_footer_slot_context = ctx => ({});
    const get_header_slot_changes = dirty => ({});
    const get_header_slot_context = ctx => ({});

    // (21:1) {:else}
    function create_else_block(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);
    	const default_slot_or_fallback = default_slot || fallback_block_2(ctx);

    	const block = {
    		c: function create() {
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 8) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[3], dirty, null, null);
    				}
    			} else {
    				if (default_slot_or_fallback && default_slot_or_fallback.p && dirty & /*prop*/ 1) {
    					default_slot_or_fallback.p(ctx, dirty);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(21:1) {:else}",
    		ctx
    	});

    	return block;
    }

    // (17:26) 
    function create_if_block_2(ctx) {
    	let current;
    	const footer_slot_template = /*#slots*/ ctx[4].footer;
    	const footer_slot = create_slot(footer_slot_template, ctx, /*$$scope*/ ctx[3], get_footer_slot_context);
    	const footer_slot_or_fallback = footer_slot || fallback_block_1(ctx);

    	const block = {
    		c: function create() {
    			if (footer_slot_or_fallback) footer_slot_or_fallback.c();
    		},
    		m: function mount(target, anchor) {
    			if (footer_slot_or_fallback) {
    				footer_slot_or_fallback.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (footer_slot) {
    				if (footer_slot.p && dirty & /*$$scope*/ 8) {
    					update_slot(footer_slot, footer_slot_template, ctx, /*$$scope*/ ctx[3], dirty, get_footer_slot_changes, get_footer_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(footer_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(footer_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (footer_slot_or_fallback) footer_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(17:26) ",
    		ctx
    	});

    	return block;
    }

    // (13:26) 
    function create_if_block_1$1(ctx) {
    	let current;
    	const header_slot_template = /*#slots*/ ctx[4].header;
    	const header_slot = create_slot(header_slot_template, ctx, /*$$scope*/ ctx[3], get_header_slot_context);
    	const header_slot_or_fallback = header_slot || fallback_block(ctx);

    	const block = {
    		c: function create() {
    			if (header_slot_or_fallback) header_slot_or_fallback.c();
    		},
    		m: function mount(target, anchor) {
    			if (header_slot_or_fallback) {
    				header_slot_or_fallback.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (header_slot) {
    				if (header_slot.p && dirty & /*$$scope*/ 8) {
    					update_slot(header_slot, header_slot_template, ctx, /*$$scope*/ ctx[3], dirty, get_header_slot_changes, get_header_slot_context);
    				}
    			} else {
    				if (header_slot_or_fallback && header_slot_or_fallback.p && dirty & /*title, prop*/ 3) {
    					header_slot_or_fallback.p(ctx, dirty);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (header_slot_or_fallback) header_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(13:26) ",
    		ctx
    	});

    	return block;
    }

    // (11:1) {#if !row}
    function create_if_block$1(ctx) {
    	let th;

    	const block = {
    		c: function create() {
    			th = element("th");
    			th.textContent = "`Column` is to be used in a `Table` only";
    			add_location(th, file$2, 11, 2, 398);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(11:1) {#if !row}",
    		ctx
    	});

    	return block;
    }

    // (23:8)      
    function fallback_block_2(ctx) {
    	let td;
    	let t_value = /*row*/ ctx[2][/*prop*/ ctx[0]] + "";
    	let t;

    	const block = {
    		c: function create() {
    			td = element("td");
    			t = text(t_value);
    			add_location(td, file$2, 23, 3, 691);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);
    			append_dev(td, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*prop*/ 1 && t_value !== (t_value = /*row*/ ctx[2][/*prop*/ ctx[0]] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block_2.name,
    		type: "fallback",
    		source: "(23:8)      ",
    		ctx
    	});

    	return block;
    }

    // (18:22)      
    function fallback_block_1(ctx) {
    	let th;

    	const block = {
    		c: function create() {
    			th = element("th");
    			attr_dev(th, "scope", "col");
    			add_location(th, file$2, 18, 3, 608);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block_1.name,
    		type: "fallback",
    		source: "(18:22)      ",
    		ctx
    	});

    	return block;
    }

    // (14:22)      
    function fallback_block(ctx) {
    	let th;
    	let t_value = (/*title*/ ctx[1] || /*prop*/ ctx[0]) + "";
    	let t;

    	const block = {
    		c: function create() {
    			th = element("th");
    			t = text(t_value);
    			attr_dev(th, "scope", "col");
    			add_location(th, file$2, 14, 3, 504);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    			append_dev(th, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*title, prop*/ 3 && t_value !== (t_value = (/*title*/ ctx[1] || /*prop*/ ctx[0]) + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block.name,
    		type: "fallback",
    		source: "(14:22)      ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$1, create_if_block_1$1, create_if_block_2, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (!/*row*/ ctx[2]) return 0;
    		if (/*row*/ ctx[2] === header) return 1;
    		if (/*row*/ ctx[2] === footer) return 2;
    		return 3;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if_block.p(ctx, dirty);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Column", slots, ['header','footer','default']);
    	let { prop = "" } = $$props;
    	let { title = "" } = $$props;
    	const row = getContext(rowContextKey);
    	const writable_props = ["prop", "title"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Column> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("prop" in $$props) $$invalidate(0, prop = $$props.prop);
    		if ("title" in $$props) $$invalidate(1, title = $$props.title);
    		if ("$$scope" in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		header,
    		footer,
    		rowContextKey,
    		prop,
    		title,
    		row
    	});

    	$$self.$inject_state = $$props => {
    		if ("prop" in $$props) $$invalidate(0, prop = $$props.prop);
    		if ("title" in $$props) $$invalidate(1, title = $$props.title);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [prop, title, row, $$scope, slots];
    }

    class Column extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { prop: 0, title: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Column",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get prop() {
    		throw new Error("<Column>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prop(value) {
    		throw new Error("<Column>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<Column>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Column>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Selection.svelte generated by Svelte v3.29.0 */
    const file$3 = "src\\Selection.svelte";

    // (26:2) <th class="selection" slot="header" scope="col">
    function create_header_slot(ctx) {
    	let th;
    	let input;
    	let input_checked_value;
    	let input_indeterminate_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			th = element("th");
    			input = element("input");
    			attr_dev(input, "type", "checkbox");
    			input.checked = input_checked_value = !!/*all*/ ctx[0];
    			input.indeterminate = input_indeterminate_value = /*all*/ ctx[0] === "indeterminate";
    			add_location(input, file$3, 26, 3, 790);
    			attr_dev(th, "class", "selection");
    			attr_dev(th, "slot", "header");
    			attr_dev(th, "scope", "col");
    			add_location(th, file$3, 25, 2, 737);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    			append_dev(th, input);

    			if (!mounted) {
    				dispose = listen_dev(input, "change", /*onChangeAll*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*all*/ 1 && input_checked_value !== (input_checked_value = !!/*all*/ ctx[0])) {
    				prop_dev(input, "checked", input_checked_value);
    			}

    			if (dirty & /*all*/ 1 && input_indeterminate_value !== (input_indeterminate_value = /*all*/ ctx[0] === "indeterminate")) {
    				prop_dev(input, "indeterminate", input_indeterminate_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_header_slot.name,
    		type: "slot",
    		source: "(26:2) <th class=\\\"selection\\\" slot=\\\"header\\\" scope=\\\"col\\\">",
    		ctx
    	});

    	return block;
    }

    // (25:1) <Column>
    function create_default_slot$1(ctx) {
    	let t;
    	let th;
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			t = space();
    			th = element("th");
    			input = element("input");
    			attr_dev(input, "type", "checkbox");
    			input.checked = /*selected*/ ctx[1];
    			add_location(input, file$3, 30, 3, 952);
    			attr_dev(th, "class", "selection");
    			attr_dev(th, "scope", "row");
    			add_location(th, file$3, 29, 2, 913);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    			insert_dev(target, th, anchor);
    			append_dev(th, input);

    			if (!mounted) {
    				dispose = listen_dev(input, "change", /*onChange1*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*selected*/ 2) {
    				prop_dev(input, "checked", /*selected*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(th);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(25:1) <Column>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let column;
    	let current;

    	column = new Column({
    			props: {
    				$$slots: {
    					default: [create_default_slot$1],
    					header: [create_header_slot]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(column.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(column, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const column_changes = {};

    			if (dirty & /*$$scope, selected, all*/ 131) {
    				column_changes.$$scope = { dirty, ctx };
    			}

    			column.$set(column_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(column.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(column.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(column, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Selection", slots, []);
    	let { selection } = $$props;
    	const row = getContext(rowContextKey);
    	let all;
    	let selected;
    	let data;

    	function onChange1(evt) {
    		selection[evt.target.checked ? "add" : "delete"](row);
    		$$invalidate(4, selection = new Set(selection));
    	}

    	function onChangeAll(evt) {
    		var hie = evt.target;
    		if (!hie.indeterminate) $$invalidate(4, selection = new Set(hie.checked ? data : []));
    	}

    	data = getContext(dataContextKey)();
    	const writable_props = ["selection"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Selection> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("selection" in $$props) $$invalidate(4, selection = $$props.selection);
    	};

    	$$self.$capture_state = () => ({
    		Column,
    		getContext,
    		dataContextKey,
    		rowContextKey,
    		selection,
    		row,
    		all,
    		selected,
    		data,
    		onChange1,
    		onChangeAll
    	});

    	$$self.$inject_state = $$props => {
    		if ("selection" in $$props) $$invalidate(4, selection = $$props.selection);
    		if ("all" in $$props) $$invalidate(0, all = $$props.all);
    		if ("selected" in $$props) $$invalidate(1, selected = $$props.selected);
    		if ("data" in $$props) $$invalidate(5, data = $$props.data);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*selection*/ 16) {
    			 $$invalidate(1, selected = selection.has(row));
    		}

    		if ($$self.$$.dirty & /*selection, data*/ 48) {
    			 $$invalidate(0, all = selection.size === 0
    			? false
    			: selection.size === data.length ? true : "indeterminate");
    		}
    	};

    	return [all, selected, onChange1, onChangeAll, selection];
    }

    class Selection extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { selection: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Selection",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*selection*/ ctx[4] === undefined && !("selection" in props)) {
    			console.warn("<Selection> was created without expected prop 'selection'");
    		}
    	}

    	get selection() {
    		throw new Error("<Selection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selection(value) {
    		throw new Error("<Selection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* demo\App.svelte generated by Svelte v3.29.0 */
    const file$4 = "demo\\App.svelte";

    // (1:0) <script lang="ts">import { Table, Column, Selection }
    function create_catch_block(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block.name,
    		type: "catch",
    		source: "(1:0) <script lang=\\\"ts\\\">import { Table, Column, Selection }",
    		ctx
    	});

    	return block;
    }

    // (6:27)     <button on:click={()=> {selection.add(data[3]); selection = new Set(selection);}}
    function create_then_block(ctx) {
    	let button0;
    	let t1;
    	let button1;
    	let t3;
    	let button2;
    	let t5;
    	let button3;
    	let t7;
    	let table;
    	let current;
    	let mounted;
    	let dispose;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[2](/*data*/ ctx[7], ...args);
    	}

    	function click_handler_1(...args) {
    		return /*click_handler_1*/ ctx[3](/*data*/ ctx[7], ...args);
    	}

    	function click_handler_2(...args) {
    		return /*click_handler_2*/ ctx[4](/*data*/ ctx[7], ...args);
    	}

    	table = new Table({
    			props: {
    				data: /*data*/ ctx[7],
    				columnFooters: true,
    				$$slots: {
    					default: [
    						create_default_slot$2,
    						({ row }) => ({ 8: row }),
    						({ row }) => row ? 256 : 0
    					]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			button0 = element("button");
    			button0.textContent = "Add Karianne";
    			t1 = space();
    			button1 = element("button");
    			button1.textContent = "Delete Karianne";
    			t3 = space();
    			button2 = element("button");
    			button2.textContent = "All";
    			t5 = space();
    			button3 = element("button");
    			button3.textContent = "None";
    			t7 = space();
    			create_component(table.$$.fragment);
    			add_location(button0, file$4, 6, 2, 245);
    			add_location(button1, file$4, 7, 2, 352);
    			add_location(button2, file$4, 8, 2, 465);
    			add_location(button3, file$4, 9, 2, 534);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, button1, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, button2, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, button3, anchor);
    			insert_dev(target, t7, anchor);
    			mount_component(table, target, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", click_handler, false, false, false),
    					listen_dev(button1, "click", click_handler_1, false, false, false),
    					listen_dev(button2, "click", click_handler_2, false, false, false),
    					listen_dev(button3, "click", /*click_handler_3*/ ctx[5], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const table_changes = {};

    			if (dirty & /*$$scope, selection, row*/ 769) {
    				table_changes.$$scope = { dirty, ctx };
    			}

    			table.$set(table_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(table.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(table.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(button1);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(button2);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(button3);
    			if (detaching) detach_dev(t7);
    			destroy_component(table, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block.name,
    		type: "then",
    		source: "(6:27)     <button on:click={()=> {selection.add(data[3]); selection = new Set(selection);}}",
    		ctx
    	});

    	return block;
    }

    // (15:4) <td slot="footer">
    function create_footer_slot(ctx) {
    	let td;
    	let t0_value = /*selection*/ ctx[0].size + "";
    	let t0;
    	let t1;
    	let t2_value = /*data*/ ctx[7].length + "";
    	let t2;
    	let t3;

    	const block = {
    		c: function create() {
    			td = element("td");
    			t0 = text(t0_value);
    			t1 = text(" on ");
    			t2 = text(t2_value);
    			t3 = text(" users");
    			attr_dev(td, "slot", "footer");
    			add_location(td, file$4, 14, 4, 734);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);
    			append_dev(td, t0);
    			append_dev(td, t1);
    			append_dev(td, t2);
    			append_dev(td, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*selection*/ 1 && t0_value !== (t0_value = /*selection*/ ctx[0].size + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_footer_slot.name,
    		type: "slot",
    		source: "(15:4) <td slot=\\\"footer\\\">",
    		ctx
    	});

    	return block;
    }

    // (13:3) <Column>
    function create_default_slot_2$1(ctx) {
    	let th;
    	let t0_value = /*row*/ ctx[8].username + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			th = element("th");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(th, "scope", "row");
    			add_location(th, file$4, 13, 4, 693);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    			append_dev(th, t0);
    			insert_dev(target, t1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*row*/ 256 && t0_value !== (t0_value = /*row*/ ctx[8].username + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$1.name,
    		type: "slot",
    		source: "(13:3) <Column>",
    		ctx
    	});

    	return block;
    }

    // (11:2) <Table let:row data={data} columnFooters>
    function create_default_slot$2(ctx) {
    	let selection_1;
    	let updating_selection;
    	let t0;
    	let column0;
    	let t1;
    	let column1;
    	let t2;
    	let column2;
    	let current;

    	function selection_1_selection_binding(value) {
    		/*selection_1_selection_binding*/ ctx[6].call(null, value);
    	}

    	let selection_1_props = {};

    	if (/*selection*/ ctx[0] !== void 0) {
    		selection_1_props.selection = /*selection*/ ctx[0];
    	}

    	selection_1 = new Selection({ props: selection_1_props, $$inline: true });
    	binding_callbacks.push(() => bind(selection_1, "selection", selection_1_selection_binding));

    	column0 = new Column({
    			props: {
    				$$slots: {
    					default: [create_default_slot_2$1],
    					footer: [create_footer_slot]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	column1 = new Column({ props: { prop: "name" }, $$inline: true });
    	column2 = new Column({ props: { prop: "email" }, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(selection_1.$$.fragment);
    			t0 = space();
    			create_component(column0.$$.fragment);
    			t1 = space();
    			create_component(column1.$$.fragment);
    			t2 = space();
    			create_component(column2.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(selection_1, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(column0, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(column1, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(column2, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const selection_1_changes = {};

    			if (!updating_selection && dirty & /*selection*/ 1) {
    				updating_selection = true;
    				selection_1_changes.selection = /*selection*/ ctx[0];
    				add_flush_callback(() => updating_selection = false);
    			}

    			selection_1.$set(selection_1_changes);
    			const column0_changes = {};

    			if (dirty & /*$$scope, selection, row*/ 769) {
    				column0_changes.$$scope = { dirty, ctx };
    			}

    			column0.$set(column0_changes);
    			const column1_changes = {};

    			if (dirty & /*$$scope*/ 512) {
    				column1_changes.$$scope = { dirty, ctx };
    			}

    			column1.$set(column1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(selection_1.$$.fragment, local);
    			transition_in(column0.$$.fragment, local);
    			transition_in(column1.$$.fragment, local);
    			transition_in(column2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(selection_1.$$.fragment, local);
    			transition_out(column0.$$.fragment, local);
    			transition_out(column1.$$.fragment, local);
    			transition_out(column2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(selection_1, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(column0, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(column1, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(column2, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(11:2) <Table let:row data={data} columnFooters>",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script lang="ts">import { Table, Column, Selection }
    function create_pending_block(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block.name,
    		type: "pending",
    		source: "(1:0) <script lang=\\\"ts\\\">import { Table, Column, Selection }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let promise_1;
    	let t0;
    	let t1_value = JSON.stringify(Array.from(/*selection*/ ctx[0])) + "";
    	let t1;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block,
    		value: 7,
    		blocks: [,,,]
    	};

    	handle_promise(promise_1 = /*promise*/ ctx[1], info);

    	const block = {
    		c: function create() {
    			info.block.c();
    			t0 = space();
    			t1 = text(t1_value);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => t0.parentNode;
    			info.anchor = t0;
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			{
    				const child_ctx = ctx.slice();
    				child_ctx[7] = info.resolved;
    				info.block.p(child_ctx, dirty);
    			}

    			if ((!current || dirty & /*selection*/ 1) && t1_value !== (t1_value = JSON.stringify(Array.from(/*selection*/ ctx[0])) + "")) set_data_dev(t1, t1_value);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);

    	let promise = fetch("https://jsonplaceholder.typicode.com/users").then(response => response.json()),
    		selection = new Set();

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const click_handler = data => {
    		selection.add(data[3]);
    		$$invalidate(0, selection = new Set(selection));
    	};

    	const click_handler_1 = data => {
    		selection.delete(data[3]);
    		$$invalidate(0, selection = new Set(selection));
    	};

    	const click_handler_2 = data => {
    		$$invalidate(0, selection = new Set(data));
    	};

    	const click_handler_3 = () => {
    		$$invalidate(0, selection = new Set());
    	};

    	function selection_1_selection_binding(value) {
    		selection = value;
    		$$invalidate(0, selection);
    	}

    	$$self.$capture_state = () => ({
    		Table,
    		Column,
    		Selection,
    		promise,
    		selection
    	});

    	$$self.$inject_state = $$props => {
    		if ("promise" in $$props) $$invalidate(1, promise = $$props.promise);
    		if ("selection" in $$props) $$invalidate(0, selection = $$props.selection);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		selection,
    		promise,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		selection_1_selection_binding
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {}
    });

    return app;

}());
//# sourceMappingURL=index.js.map
