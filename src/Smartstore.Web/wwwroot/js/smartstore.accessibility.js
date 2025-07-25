﻿/**
* WCAG‑2.2 keyboard framework
* TODO: (wcag) (mh) Docs
*/
'use strict';

/* --------------------------------------------------
*  AccessKit core – plugin host + key dispatcher
* -------------------------------------------------- */
class AccessKit {
    static _registry = [];

    /**
    * Add a plugin descriptor to the global plugin registry of AccessKit
    *
    * @param {Object} param
    * @param {Function} param.ctor          Plugin constructor.
    * @param {string=}  param.rootSelector  CSS selector; if the element that receives focus lies inside an ancestor
    *                                       matching this selector, the plugin is considered applicable.
    * @param {Function=} param.match        Alternative test — receives the focused element and must return the widget’s
    *                                       root element or null. Use when the widget is not in the ancestor chain (e.g. menu dropdowns).
    *
    * Either `rootSelector` or `match` must be provided.
    * The descriptor is stored in `AccessKit._registry` and later queried by `_initIfNeeded` to lazily instantiate plugins.
    */
    static register({ ctor, rootSelector, match }) {
        this._registry.push({ ctor, rootSelector, match });
    }

    constructor(options = {}) {
        this.options = options;
        this.rtl = options.rtl ?? (document.documentElement.dir === 'rtl');
        this._plugins = new Map();

        /* one keydown/keyup listener for relevant elements – capture phase */
        document.addEventListener('keydown', e => this._onKey(e), true);
        document.addEventListener('keyup', e => this._onKey(e), true);

        // TODO: (wcag) (mh) Maybe this ain't the correct place to handle this. 
        // Finish the job!!! Build proper generic trapping mechanism for all modal like components and evaluate anew. 
        this._initOffCanvasTrap();

        // Handle .nav-collapsible aria-expanded attribute on page resize
        this._initCollapsibles();
    }

    _onKey(e) {
        // Skip irrelevant targets immediately.
        const t = e.target;
        if (!t || !(t instanceof Element)) return;
        if (t.matches('input, textarea') || t.isContentEditable) return;
        if (!t.matches('a,[role],[tabindex]')) return;

        // Exit if no navigational key is pressed.
        // TODO: (wcag) (mh) Use a static Set for key codes instead of an array, or find another faster way to lookup.
        if (![AK.KEY.TAB, AK.KEY.UP, AK.KEY.DOWN, AK.KEY.LEFT, AK.KEY.RIGHT, AK.KEY.HOME, AK.KEY.END, AK.KEY.ENTER, AK.KEY.SPACE, AK.KEY.ESC].includes(e.key))
            return;

        // Init plugin if needed.
        this._initIfNeeded(t);

        // Dispatch event to all already active plugins.
        this._dispatchKey(e);
    }

    /**
    * Lazily boot the first plugin whose root contains the currently-focused element.
    * 
    * If the focused element belongs to a widget that has no plugin yet,
    * find its root (via rootSelector or match()), create ONE instance of
    * the corresponding ctor, store it in this._plugins, then exit.
    * 
    * @param {Element} target  element that holds keyboard focus (event.target from a key event)
    */
    _initIfNeeded(target) {
        for (const plugin of AccessKit._registry) {
            let root = plugin.rootSelector ? target.closest(plugin.rootSelector) : typeof plugin.match === 'function' ? plugin.match(target) : null;

            if (!root)
                continue;

            if (!this._plugins.has(plugin.ctor)) {
                const instance = new plugin.ctor(this, root);
                this._plugins.set(plugin.ctor, instance);
            }
            return;         
        }
    }

    _dispatchKey(e) {
        const hook = e.type === 'keydown' ? 'handleKey' : 'handleKeyUp';

        for (const plugin of this._plugins.values()) {
            const handler = plugin[hook]; 
            // Check whether plugin implements the handler method & if it returns true (handled).
            if (typeof handler === 'function' && handler.call(plugin, e)) {
                // Preserve natural Tab behaviour, but prevent default for all other keys.
                if (e.type === 'keydown' && e.key !== KEY.TAB) {
                    e.preventDefault();
                }

                e.stopPropagation();
                return;
            }
        }
    }

    _initCollapsibles() {
        // Handle .nav-collapsible aria-expanded attribute on page resize
        const setCollapsibleState = (viewport) => {
            const toggles = document.querySelectorAll('.nav-collapsible > [data-toggle="collapse"]');
            toggles.forEach(el => {
                el.setAttribute('aria-expanded', viewport.is('>=md') ? 'true' : !el.matches('.collapsed'))
            });
        };

        EventBroker.subscribe("page.resized", function (_, viewport) {
            setCollapsibleState(viewport);
        });

        setCollapsibleState(ResponsiveBootstrapToolkit);
    }

    _initOffCanvasTrap() {
        // TODO: (wcag) (mh) Implement focus trapping.
        // TODO: (wcag) (mh) We need a generic focusHandler that also can handle modal dialogs, popovers etc.

        // INFO: Jquery must be used here, because original event is namespaced & triggered via Jquery.
        $(document).on('shown.sm.offcanvas', function (e) {
            const offcanvas = $(e.target);
            offcanvas.attr("aria-hidden", false);

            // Get opener and set attribute aria-expanded.
            const opener = $(`[aria-controls="${offcanvas.attr('id')}"]`);
            opener.attr("aria-expanded", true);

            // TODO: (wcag) (mh) Find a better way to get the first activatable element in an offcanvas
            // Select first clickable element.
            //const firstActivatableElem = offcanvas.find('[data-toggle="tab"]').first();

            // INFO: Terrible selector, but ensures to find first link in offcanvas facette filter
            const firstActivatableElem = offcanvas.find('a[href]').first();
            firstActivatableElem.trigger("focus");

            // TODO: (wcag) (mh) Reinit AccessToolkit
        });

        $(document).on('hidden.sm.offcanvas', function (e) {
            const offcanvas = $(e.target);
            offcanvas.attr("aria-hidden", true);

            // Get opener and set attribute aria-expanded.
            const opener = $(`[aria-controls="${offcanvas.attr('id')}"]`);
            opener.attr("aria-expanded", false);
            opener.trigger("focus");
        });
    }
}

// Global namespace
window.AccessKit = window.AccessKit || AccessKit;
const AK = window.AccessKit;

AK.KEY = {
    LEFT: 'ArrowLeft',
    UP: 'ArrowUp',
    RIGHT: 'ArrowRight',
    DOWN: 'ArrowDown',
    HOME: 'Home',
    END: 'End',
    ESC: 'Escape',
    SPACE: ' ',
    TAB: 'Tab',
    ENTER: 'Enter'
};

// TODO: (wcag) (mh) Replace every KEY in this script with AK.KEY > Then remove the shortcut KEY
const KEY = AK.KEY;

// Plugin base class for AccessKit plugins.
// TODO: (wcag) (mh) Create a separate file for every base class and every plugin.
// TODO: (wcag) (mh) Use this closure for every modular scripts when you place them in separate files.
(function (AK) {
    AK.AccessKitPluginBase = class AccessKitPluginBase {
        constructor(ak) {
            this.ak = ak;
            this._handles = [];
            this._cache = new WeakMap();
            this.init(document);
        }

        // Will be called at initialization of the plugin and can be called after AJAX updates to re-initialize the plugin.
        // @param {Element|Document} container => context
        init(container = document) { }

        // Handle 'keydown' events .
        // Must return `true` if the event has been processed (AccessKit then calls preventDefault / stopPropagation).
        // @param {KeyboardEvent} e
        // @returns {Boolean} handled?
        handleKey(e) { return false; }

        // Optional addition for 'keyup' cases (e.g. cancel gestures, space-to-click semantics). Only implement if needed.
        // @param {KeyboardEvent} e
        // @returns {Boolean} handled?
        handleKeyUp(e) { return false; }

        // Apply roving tabindex to all elements matching the selector within the root element.
        applyRoving(root, selector, start = 0) {
            const items = [...root.querySelectorAll(selector)]
                .filter(i => i.closest(root.getAttribute('role') ? `[role="${root.getAttribute('role')}"]` : root) === root);
            items.forEach((el, i) => el.tabIndex = i === start ? 0 : -1);
            return items;
        }

        // Move focus to the target element and set roving tabindex.
        moveFocus(target, items) {
            if (!target) return;
            items.forEach(i => i.tabIndex = -1);
            target.tabIndex = 0;
            target.focus();
        }

        removeFocus(el) {}

        // Add event listener to element and store the handle for later removal.
        on(el, evt, fn, opts) {
            el.addEventListener(evt, fn, opts);
            this._handles.push(() => el.removeEventListener(evt, fn, opts));
        }

        // Remove all event listeners that were registered by this plugin.
        destroy() { this._handles.forEach(off => off()); }

        // Set cache 
        _setCache(key, value) { this._cache.set(key, value); }

        // Get cache item if it exists else call callback as fallback. 
        _getCache(key, callback = null) {
            if (this._cache.has(key)) return this._cache.get(key);
            if (callback) {
                const value = callback();
                this._cache.set(key, value);
                return value;
            }
            return undefined;
        }

        // Gets directional keys based on menubar or menu  aria-orientation attribute & rtl
        _getNavKeys(orientation, rtl = false) {
            return orientation === 'horizontal'
                ? (rtl ? [KEY.RIGHT, KEY.LEFT] : [KEY.LEFT, KEY.RIGHT])
                : [KEY.UP, KEY.DOWN];
        }

        // Returns the next index in a circular manner.
        _nextIdx(cur, delta, len) {
            return (cur + delta + len) % len;
        }

        _dispatchEvent(name, el, detail = {}) {
            const event = new CustomEvent(name, {
                bubbles: true,
                detail: detail
            });
            el.dispatchEvent(event);
        }

        /*
        * Key handler for plugins using a roving tabindex list 
        * @param {KeyboardEvent}  e        – Original event
        * @param {HTMLElement[]}  items    – Currently visible/focusable list elements
        * @param {Object} [cfg]            – Optional configuration
        *        orientation   'vertical' | 'horizontal'   (Default: 'vertical')
        *        activateFn    function(el, idx, items)    Callback for ENTER/SPACE
        *        extraKeysFn   function(e, idx, items)     Special keys for plugins
        *
        * @returns {boolean}   true → Event processed, false → delegate to browser
        */
        handleRovingKeys(e, items, {orientation = 'vertical', activateFn = null, extraKeysFn = null} = {}) {
            const idx = items.indexOf(e.target);
            if (idx === -1) return false;

            // Determine navigation keys depending on orientation & rtl
            const rtl = this.ak?.rtl === true;
            const [PREV_KEY, NEXT_KEY] = this._getNavKeys(orientation, rtl);

            switch (e.key) {
                /* Navigate ------------------------------------------------------- */
                case PREV_KEY:
                    this._move(items[this._nextIdx(idx, -1, items.length)], null, items);
                    return true;
                case NEXT_KEY:
                    this._move(items[this._nextIdx(idx, +1, items.length)], null, items);
                    return true;
                case KEY.HOME:
                    this._move(items[0], null, items);
                    return true;
                case KEY.END:
                    this._move(items[items.length - 1], null, items);
                    return true;

                /* Activate (ENTER / SPACE) -------------------------------------- */
                case KEY.ENTER:
                case KEY.SPACE:
                    if (typeof activateFn === 'function') {
                        activateFn(e.target, idx, items);
                        return true;
                    }
                    break;
            }

            // Plugin specific extra keys
            if (typeof extraKeysFn === 'function') {
                return extraKeysFn(e, idx, items) === true;
            }

            return false;
        }

        // Overridable base implementation.
        _move(target, _root = null, items = []) {
            this.moveFocus(target, items);
        }
    }
})(window.AccessKit);

// Base plugin for accessible expandable elements (tree, menubar, combobox, disclosure, accordion).
AK.AccessKitExpandablePluginBase = class AccessKitExpandablePluginBase extends AK.AccessKitPluginBase {
    /**
    * Opens, closes or toggles an expand/collapse trigger.
    * @param {HTMLElement} trigger   Element mit aria-expanded oder open
    * @param {boolean|null} expand   true = open, false = close, null = Toggle state (default)
    * @param {Object} [opt]
    *        focusTarget      'first' | 'trigger' | HTMLElement | null
    *        collapseSiblings boolean – Close all siblings on opening */
    toggleExpanded(trigger, expand = null, opt = {}) {
        if (!trigger) return;

        // Determine targets
        let target = null;
        if (trigger.hasAttribute('aria-controls')) {
            target = document.getElementById(trigger.getAttribute('aria-controls'));
        } else if (trigger.nextElementSibling) {
            // Fallback: <button> … <div class="panel">
            target = trigger.nextElementSibling;
        }

        const isOpen = trigger.getAttribute('aria-expanded') === 'true' || trigger.open === true;
        const shouldOpen = expand === null ? !isOpen : Boolean(expand);

        // Dispatch event so consumers can execute their special open/close mechanisms if they have to.
        this._dispatchEvent(shouldOpen ? 'ak-toggle-open' : 'ak-toggle-close', trigger, { trigger, target });

        // Set attributes & visibilty
        if (trigger.hasAttribute('aria-expanded')) {
            trigger.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
        } else if ('open' in trigger) {
            trigger.open = shouldOpen;
        }

        if (target) target.hidden = !shouldOpen;

        // Accordeon mode > toggle siblings
        if (shouldOpen && opt.collapseSiblings && trigger.parentElement) {
            const peers = trigger.parentElement.querySelectorAll('[aria-expanded="true"],[open]');
            peers.forEach((p) => {
                if (p !== trigger) this.toggleExpanded(p, false);
            });
        }

        // Focus
        if (shouldOpen && target) {
            let focusEl = null;
            if (opt.focusTarget === 'first') {
                // TODO: (wcag) (mh) This smells :-)
                focusEl = target.querySelector('[tabindex="0"],[role],button,a,input,select,textarea');
            } else if (opt.focusTarget instanceof HTMLElement) {
                focusEl = opt.focusTarget;
            } else if (opt.focusTarget === 'trigger') {
                focusEl = trigger;
            }

            focusEl?.focus();
        }
        
        // Set attributes
        trigger.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');

        if (target) {
            target.setAttribute('aria-hidden', shouldOpen ? 'false' : 'true');
        }
    }
}

/* --------------------------------------------------
*  MenuPlugin – Roving‑Tabindex & Sub‑menu handling
*  Handles all items of role="menubar" based on subitems role="menu" & role="menuitem".
* -------------------------------------------------- */
AK.MenuPlugin = class MenuPlugin extends AK.AccessKitExpandablePluginBase {
    // TODO: (wcag) (mh) Very obfuscated code. Bad naming conventions, no comments. Don't trust ChatGPT unmoderated! TBD with MC.
    // TODO: (wcag) (mh) A special "key handler plugin" belongs to the plugin file if it exists. In this case: smartstore.megamenu.js. But not if it is generic enough to handle more than one widget type.

    init(container = document) {
        // TODO: (wcag) (mh) Slow!
        container.querySelectorAll('[role="menubar"]').forEach(menubar => {
            const menuitem = this.applyRoving(menubar, '[role="menuitem"]');   
            this._setCache(menubar, menuitem);
        });
    }

    _items(container) {
        // TODO: (wcag) (mh) Slow!
        //return this._getCache(container, () =>
        //    [...container.querySelectorAll('[role="menuitem"]')]
        //        .filter(mi => mi.closest('[role="menubar"], [role="menu"]') === container)
        //    );

        // If cached already return immediately
        let items = this._getCache(container);
        if (items) return items;            

        // Get items and store them in cache.
        items = [...container.querySelectorAll('[role="menuitem"]')]
            .filter(mi =>mi.closest('[role="menubar"],[role="menu"]') === container);
        
        this._setCache(container, items);
        
        return items;
    }

    handleKey(e) {
        const el = e.target;

        if (!el || el.getAttribute('role') !== 'menuitem')
            return false;

        // TODO: (wcag) (mh) Slow!
        const menubar = el.closest('[role="menubar"]');
        if (menubar) return this._menuKey(e, menubar, true);

        // TODO: (wcag) (mh) Slow!
        const submenu = el.closest('[role="menu"]');
        if (submenu) return this._menuKey(e, submenu);

        return false;
    }

    _menuKey(e, menu, isMenubar = false) {
        const items = this._items(menu);
        if (!items.length) return false;

        const orientation = menu.getAttribute('aria-orientation') ?? (isMenubar ? 'horizontal' : 'vertical');
            
        return this.handleRovingKeys(e, items, {
            orientation,

            /** ENTER/SPACE → Open submenu or execute command */
            activateFn: (item) => {
                if (item.getAttribute('aria-haspopup') === 'menu') {
                    this._open(item);
                } else {
                    item.click();          // Command
                }
            },

            /** Menu specific keys (Open, close, TAB) */
            extraKeysFn: (ev) => {
                const isVertical = orientation === 'vertical';
                const dirOpen = isMenubar ? null : isVertical ? this.ak.rtl ? KEY.LEFT : KEY.RIGHT : KEY.DOWN;
                const dirClose = isMenubar ? null : isVertical ? this.ak.rtl ? KEY.RIGHT : KEY.LEFT : KEY.UP;

                /* Open sub menu -------------------------------------- */
                if ((isMenubar && [KEY.DOWN, KEY.SPACE, KEY.ENTER].includes(ev.key)) || (!isMenubar && ev.key === dirOpen)) {
                    if (ev.target.getAttribute('aria-haspopup') === 'menu') {
                        this._open(ev.target);
                        return true;
                    }
                }

                /* Close ---------------------------------------------- */
                if (ev.key === KEY.ESC || ev.key === dirClose) {
                    if (isMenubar) {
                        this._closeAll();
                    } else {
                        const trigger = document.querySelector(`[aria-controls="${menu.id}"]`);
                        this._close(trigger, menu);
                        trigger?.focus();
                    }
                    return true;
                }

                /* TAB leaves the component --------------------------- */
                if (ev.key === KEY.TAB) {
                    if (isMenubar) {
                        // Reset focus & tabIndex
                        items.forEach((it, i) => (it.tabIndex = i === 0 ? 0 : -1));
                    } else {
                        this._closeAll();
                    }
                    return true;
                }

                return false;
            },
        });
    }

    _open(trigger) {
        const menu = document.getElementById(trigger.getAttribute('aria-controls'));
        if (!menu)
            return;

        let items = this._getCache(menu);
        if (!items) {
            items = this.applyRoving(menu, '[role="menuitem"]');
            this._setCache(menu, items);
        }

        this.toggleExpanded(trigger, true, { focusTarget: items[0] });
    }

    _close(trigger, menu) {
        if (!menu || !menu.classList.contains('show'))
            return;

        this.toggleExpanded(trigger, false, { focusTarget: "trigger" });
    }

    _closeAll() {
        document.querySelectorAll('[role="menu"].show').forEach(menu => {
            const trigger = document.querySelector(`[aria-controls="${menu.id}"][aria-expanded="true"]`);
            this.toggleExpanded(trigger, false, { focusTarget: "trigger" });
        });
    }
}

/* --------------------------------------------------
*  TablistPlugin – Roving‑Tabindex & Panel Switching
*  Handles all items of [role="tablist"] + [role="tab"] + [role="tabpanel"]
* -------------------------------------------------- */
AK.TablistPlugin = class TablistPlugin extends AK.AccessKitPluginBase {
    init(container = document) {
        container.querySelectorAll('[role="tablist"]').forEach(list => {
            const tabs = this.applyRoving(list, '[role="tab"]');
            this._setCache(list, tabs); 
            const selectedTab = tabs.find(t => t.getAttribute('aria-selected') === 'true') || tabs[0];
            this._select(selectedTab, false);
        });
    }

    handleKey(e) {
        const tab = e.target;
        if (!tab || tab.getAttribute('role') !== 'tab')
            return false;

        const list = tab.closest('[role="tablist"]');
        if (!list)
            return false;

        const tabs = this._getCache(list, () =>
            this.applyRoving(list, '[role="tab"]')
        );

        const orientation = list.getAttribute('aria-orientation') ?? 'horizontal';

        return this.handleRovingKeys(e, tabs, {
            orientation,
            activateFn: (el) => this._select(el),
        });
    }

    // Shift roving focus to the next tab.
    _move(tab) {
        if (!tab)
            return;

        super._move(tab);
        this._select(tab, false); // Do not display tabpanel on move.
    }

    // Update aria attributes & optionally select/display tab panel.
    _select(tab, displayPanel = true) {
        if (!tab)
            return;

        const tabs = this._getCache(tab.closest('[role="tablist"]'));

        // Update tab attributes.
        tabs.forEach(t => {
            const selected = t === tab;
            t.setAttribute('aria-selected', selected ? 'true' : 'false');
            t.setAttribute('tabindex', selected ? 0 : -1);
        });

        // Shift focus and display tabpanel by dispatching the click event on tab.
        if (displayPanel) {
            tab.dispatchEvent(new Event('click', { bubbles: true, cancelable: true }));
            document.getElementById(tab.getAttribute('aria-controls'))?.focus();
        }
    }
}

/* --------------------------------------------------
*  TreePlugin – 
*  Handles all items of [role="tree"] + [role="treeitem"]
* -------------------------------------------------- */
AK.TreePlugin = class TreePlugin extends AK.AccessKitExpandablePluginBase {
    _initRovingTabindex(tree) {
        const items = this._visibleItems(tree);
        items.forEach((item, i) => item.tabIndex = i === 0 ? 0 : -1);
    }

    init(container = document) {
        container.querySelectorAll('[role="tree"]').forEach(tree => {
            const items = this.applyRoving(tree, '[role="treeitem"]');
            this._setCache(tree, items);
        });
    }

    _allItems(tree) {
        return this._getCache(tree, () =>
        [...tree.querySelectorAll('[role="treeitem"]')]
            .filter(it => it.closest('[role=\"tree\"]') === tree));
    }

    _visibleItems(tree) {
        // TODO: (wcag) (mh) Correct this and use cached items. 
        return Array.from(tree.querySelectorAll('[role="treeitem"]')).filter(node => {
            let anc = node.parentElement?.closest('[role="treeitem"]');
            while (anc) {
                if (anc.getAttribute('aria-expanded') === 'false') return false;
                anc = anc.parentElement?.closest('[role="treeitem"]');
            }
            return true; // No collapsed ancestor found
        });
    }

    handleKey(e) {
        const item = e.target;
        if (!item || item.getAttribute('role') !== 'treeitem')
            return false;

        const tree = item.closest('[role="tree"]') || item.closest('[role="group"]');
        if (!tree)
            return false;

        const items = this._visibleItems(tree);
        if (!items.length)
            return false;

        const orientation = tree.getAttribute('aria-orientation') ?? 'vertical';

        return this.handleRovingKeys(e, items, {
            orientation,
            activateFn: (el) => (el.trigger ? el.trigger('click') : el.click()),
            extraKeysFn: (ev, _idx, list) => {
                if (ev.key === KEY.RIGHT) {
                    this.toggleExpanded(item, true, { focusTarget: 'first' });
                    return true;
                }

                if (ev.key === KEY.LEFT || ev.key === KEY.ESC) {
                    this.toggleExpanded(item, false);
                    return true;
                }

                if (ev.key === KEY.TAB) {
                    this.applyRoving(tree, '[role="treeitem"]');
                    return false;
                }

                return false;
            },
        });
    }

    /* -------- Move roving focus -------- */
    _move(item, tree = null, siblings = null) {
        if (!item)
            return;

        tree = tree || item.closest('[role="tree"]');
        siblings = siblings || this._visibleItems(tree);

        super._move(item, siblings);
    }
}

/* --------------------------------------------------
 *  ListboxPlugin – Roving‑Tabindex, Selection & Type‑ahead
 *  Handles widgets using [role="listbox"] with [role="option"] children
 *  Supports single‑ & multi‑select (aria-multiselectable="true")
 * -------------------------------------------------- */
AK.ListboxPlugin = class ListboxPlugin extends AK.AccessKitPluginBase {
    init(container = document) {
        const lists = Array.from(container.querySelectorAll('[role="listbox"]'));
        lists.forEach(list => this._initListbox(list));
    }

    _initListbox(list) {
        // Determine selection mode
        const multiselect = list.getAttribute('aria-multiselectable') === 'true';
        list.dataset.akMultiselect = multiselect;

        // Initialise roving tabindex & ensure aria-selected is set
        //const options = this._options(list);

        //options.forEach((opt, i) => {
        //    opt.tabIndex = i === 0 ? 0 : -1;
        //    if (!opt.hasAttribute('aria-selected')) {
        //        opt.setAttribute('aria-selected', 'false');
        //    }
        //});

        const options = this.applyRoving(list, '[role="option"]');
        this._setCache(list, options);
            options.forEach(opt => {
                if (!opt.hasAttribute('aria-selected')) {
                    opt.setAttribute('aria-selected', 'false');
                }
        });

        // Pointer interaction mirrors keyboard behaviour
        list.addEventListener('click', e => {
            const opt = e.target.closest('[role="option"]');
            if (opt && list.contains(opt)) {
                const opts = this._options(list);
                this._move(opt, list, opts);
                this._toggleSelect(opt, list, opts);
            }
        });

        // Make listbox focusable itself (fallback if options are removed dynamically)
        if (!list.hasAttribute('tabindex')) {
            list.tabIndex = -1;
        }
    }

    _options(list) {
        //return [...list.querySelectorAll('[role="option"]')]
        //    .filter(opt => opt.closest('[role="listbox"]') === list);

        return this._getCache(list, () =>
            [...list.querySelectorAll('[role="option"]')]
                .filter(opt => opt.closest('[role="listbox"]') === list)
        );
    }

    handleKey(e) {
        const opt = e.target;
        if (!opt || opt.getAttribute('role') !== 'option')
            return false;

        const list = opt.closest('[role="listbox"]');
        if (!list)
            return false;

        const options = this._options(list);
        if (!options.length)
            return false;

        const orientation = list.getAttribute('aria-orientation') ?? 'vertical';
            
        return this.handleRovingKeys(e, options, {
            orientation,
            activateFn: (el, _idx, opts) => this._toggleSelect(el, list, opts),
            extraKeysFn: (ev, idx, opts) => {
                if (ev.key.length === 1 && /\S/.test(ev.key)) {
                    this._typeahead(ev.key, idx, opts, list);
                    return true;
                }
                return false;
            }
        });
    }

    /* -------- Move roving focus -------- */
    _move(opt, list, options) {
        super._move(opt, null, options);

        // TODO: Evaluate if this is needed 
        // In single‑select listboxes, moving also selects
        if (list.length && list.dataset.akMultiselect !== 'true') {
            this._toggleSelect(opt, list, options, /*replace*/ true);
        }
    }

    /* -------- Selection handling -------- */
    _toggleSelect(opt, list, options, replace = false) {
        const multiselect = list.dataset.akMultiselect === 'true';
        if (!multiselect || replace) {
            options.forEach(o => o.setAttribute('aria-selected', o === opt ? 'true' : 'false'));
            this._dispatchEvent('ak-listbox-select', list, { list, opt });
        } else {
            const selected = opt.getAttribute('aria-selected') === 'true';
            opt.setAttribute('aria-selected', selected ? 'false' : 'true');
            this._dispatchEvent(selected ? 'ak-listbox-deselect' : 'ak-listbox-select', list, { list, opt });
        }
    }

    /* -------- First‑character type‑ahead -------- */
    _typeahead(char, startIdx, options, list) {
        char = char.toLowerCase();
        const len = options.length;
        for (let i = 1; i <= len; i++) {
            const opt = options[(startIdx + i) % len];
            if ((opt.textContent || '').trim().toLowerCase().startsWith(char)) {
                this._move(opt, list, options);
                break;
            }
        }
    }
}

AccessKit.register({
    ctor: AK.MenuPlugin,
    match(el) {
        return el.closest('[role="menubar"],[role="menu"]') ||
            (el.closest('[role="menuitem"][aria-controls]') && 
                document.getElementById(el.getAttribute('aria-controls')));
    }
});

AccessKit.register({ ctor: AK.TreePlugin, rootSelector: '[role="tree"]' });
AccessKit.register({ ctor: AK.TablistPlugin, rootSelector: '[role="tablist"]' });
AccessKit.register({ ctor: AK.ListboxPlugin, rootSelector: '[role="listbox"]' });

/* Boot */
document.addEventListener('DOMContentLoaded', () => {
    window.AccessKitInstance = new AccessKit(window.AccessKitConfig || {});
});