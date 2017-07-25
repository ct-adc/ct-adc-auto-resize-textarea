<template>
    <div id="demo">
        <div class="container-fluid">
            <div class="col-lg-6 col-lg-offset-3 mt-100">
                <form class="form-horizontal">
                    <div class="form-group has-feedback">
                        <div class="col-md-12">
                            <auto-resize-textarea class="form-control" rows="6" maxlength="50"
                                                  v-model="val"></auto-resize-textarea>
                            <span class="form-control-feedback input-length-counter auto-top b-0">{{ val.length }} / 50</span>
                        </div>
                    </div>
                </form>
                <pre>{{ JSON.stringify(val, null, 4) }}</pre>
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

    .input-length-counter {
        width: auto !important;
        color: #9f9f9f;
        text-align: right;
    }

    .form-horizontal .has-feedback .form-control-feedback {
        right: 20px;
    }

    .auto-top {
        top: auto;
    }

    .b-0 {
        bottom: 0
    }
</style>
