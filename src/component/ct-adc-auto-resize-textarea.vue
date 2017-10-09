<template>
    <textarea ref="textarea"
              :value="value"
              @input="updateValue($event.target.value)"
              @blur="emitBlur"
              @change="emitChange"
              v-model="val"></textarea>
</template>

<script type="text/ecmascript-6">
    const map = new Map();

    let createEvent = (name)=> new Event(name, {bubbles: true});

    try {
        new Event('test');
    } catch (e) {
        // IE does not support `new Event()`
        createEvent = (name)=> {
            const evt = document.createEvent('Event');

            evt.initEvent(name, true, false);

            return evt;
        };
    }

    const assign = ta => {
        if (!ta || !ta.nodeName || ta.nodeName !== 'TEXTAREA' || map.has(ta)) return;

        let heightOffset = null;
        let clientWidth = ta.clientWidth;
        let cachedHeight = null;

        const getParentOverflows = el => {
            const arr = [];

            while (el && el.parentNode && el.parentNode instanceof Element) {
                if (el.parentNode.scrollTop) {
                    arr.push({
                        node: el.parentNode,
                        scrollTop: el.parentNode.scrollTop
                    });
                }
                el = el.parentNode;
            }

            return arr;
        };

        const resize = () => {
            const originalHeight = ta.style.height;
            const overflows = getParentOverflows(ta);
            const docTop = document.documentElement && document.documentElement.scrollTop; // Needed for Mobile IE (ticket #240)

            ta.style.height = '';

            const endHeight = ta.scrollHeight + heightOffset;

            if (ta.scrollHeight === 0) {
                // If the scrollHeight is 0, then the element probably has display:none or is detached from the DOM.
                ta.style.height = originalHeight;
                return;
            }

            ta.style.height = endHeight + 'px';

            // used to check if an update is actually necessary on window.resize
            clientWidth = ta.clientWidth;

            // prevents scroll-position jumping
            overflows.forEach(el => {
                el.node.scrollTop = el.scrollTop;
            });

            if (docTop) {
                document.documentElement.scrollTop = docTop;
            }
        };

        const update = () => {
            resize();

            const computed = window.getComputedStyle(ta, null);

            // Using offsetHeight as a replacement for computed.height in IE, because IE does not account use of border-box
            var actualHeight = computed.boxSizing === 'content-box' ? Math.round(parseFloat(computed.height)) : ta.offsetHeight;

            resize();
            actualHeight = computed.boxSizing === 'content-box' ? Math.round(parseFloat(window.getComputedStyle(ta, null).height)) : ta.offsetHeight;

            if (cachedHeight !== actualHeight) {
                cachedHeight = actualHeight;
                const evt = createEvent('autosize:resized');

                try {
                    ta.dispatchEvent(evt);
                } catch (err) {
                    // Firefox will throw an error on dispatchEvent for a detached element
                    // https://bugzilla.mozilla.org/show_bug.cgi?id=889376
                }
            }
        };

        const pageResize = () => {
            if (ta.clientWidth !== clientWidth) {
                update();
            }
        };

        const destroy = style => {
            window.removeEventListener('resize', pageResize, false);
            ta.removeEventListener('input', update, false);
            ta.removeEventListener('keyup', update, false);
            ta.removeEventListener('autosize:destroy', destroy, false);
            ta.removeEventListener('autosize:update', update, false);

            Object.keys(style).forEach(key => {
                ta.style[key] = style[key];
            });

            map.delete(ta);
        };

        const init = () => {
            const style = window.getComputedStyle(ta, null);

            if (style.boxSizing === 'content-box') {
                heightOffset = -(parseFloat(style.paddingTop) + parseFloat(style.paddingBottom));
            } else {
                heightOffset = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
            }
            // Fix when a textarea is not on document body and heightOffset is Not a Number
            if (isNaN(heightOffset)) {
                heightOffset = 0;
            }

            update();
        };

        ta.addEventListener('autosize:destroy', destroy, false);

        // IE9 does not fire onpropertychange or oninput for deletions,
        // so binding to onkeyup to catch most of those events.
        // There is no way that I know of to detect something like 'cut' in IE9.
        if ('onpropertychange' in ta && 'oninput' in ta) {
            ta.addEventListener('keyup', update, false);
        }

        window.addEventListener('resize', pageResize, false);
        ta.addEventListener('input', update, false);
        ta.addEventListener('autosize:update', update, false);
        ta.style.overflowX = 'hidden';
        ta.style.wordWrap = 'break-word';

        map.set(ta, {
            destroy,
            update
        });

        init();
    };

    const destroy = ta => {
        const methods = map.get(ta);

        if (methods) {
            methods.destroy();
        }
    };

    const update = ta => {
        const methods = map.get(ta);

        if (methods) {
            methods.update();
        }
    };

    let autosize = null;

    // Do nothing in Node.js environment and IE8 (or lower)
    if (typeof window === 'undefined' || typeof window.getComputedStyle !== 'function') {
        autosize = el => el;
        autosize.destroy = el => el;
        autosize.update = el => el;
    } else {
        autosize = (el, options) => {
            if (el) {
                Array.prototype.forEach.call(el.length ? el : [el], x => assign(x, options));
            }
            return el;
        };
        autosize.destroy = el => {
            if (el) {
                Array.prototype.forEach.call(el.length ? el : [el], destroy);
            }
            return el;
        };
        autosize.update = el => {
            if (el) {
                Array.prototype.forEach.call(el.length ? el : [el], update);
            }
            return el;
        };
    }

    export default {
        name: 'ct-adc-auto-resize-textarea',
        mounted() {
            this.updateValue(this.value);
            this.initAutosize();
        },
        props: {
            value: {
                required: false,
                type: [Number, String]
            }
        },
        data() {
            return {
                val: '',
                heightOffset: 0
            };
        },
        methods: {
            // init autosize
            initAutosize() {
                this.$nextTick(() => {
                    autosize(this.$refs.textarea);
                });
            },
            // update autosize
            updateAutosize() {
                this.$nextTick(() => {
                    autosize.update(this.$refs.textarea);
                });
            },
            updateValue(val) {
                this.val = val;
                this.emitInput(val);
                this.emitChange(val);
            },

            // emit input event
            emitInput(val) {
                this.$emit('input', val);
            },

            // emit change event
            emitBlur() {
                this.$emit('blur', this.val);
            },

            // emit change event
            emitChange() {
                this.$emit('change', this.val);
            }
        },
        watch: {
            // watch value prop
            value(val) {
                this.updateValue(val);
                this.updateAutosize(); // when value change, update textarea size
            }
        }
    };
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
    textarea {
        overflow-y: hidden;
        height: auto;
    }
</style>
