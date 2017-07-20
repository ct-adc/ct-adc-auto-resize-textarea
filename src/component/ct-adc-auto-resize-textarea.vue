<template>
    <textarea ref="textarea"
              :value="value"
              @input="updateValue($event.target.value)"
              @change="emitChange"
              v-model="val"></textarea>
</template>

<script type="text/ecmascript-6">
    import autosize from '../lib/autosize';

    export default {
        name: 'ct-adc-auto-resize-textarea',
        mounted() {
            this.updateValue(this.value);
            autosize(this.$refs.textarea);
        },
        props: {
            value: {
                required: true,
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
            emitChange() {
                this.$emit('change', this.val);
            }
        },
        watch: {
            // watch value prop
//            value(val) {
//                this.updateValue(val);
//            }
        }
    };
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
    textarea {
        overflow-y: hidden;
        height: auto;
    }
</style>
