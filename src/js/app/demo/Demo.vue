<template>
    <div id="demo">
        <div class="container-fluid">
            <div class="col-lg-6 col-lg-offset-3 mt-100">
                <auto-resize-textarea class="form-control" rows="6"
                                      v-model="val"></auto-resize-textarea>
            </div>
        </div>
    </div>
</template>

<script type="text/ecmascript-6">
    import AutoResizeTextarea from '../../../component/ct-adc-auto-resize-textarea.vue';

    export default {
        components: {
            AutoResizeTextarea
        },
        data() {
            return {
                val: 'This is a textarea with auto-height.'
            };
        }
    };
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
    .mt-100 {
        margin-top: 100px;
    }
</style>
