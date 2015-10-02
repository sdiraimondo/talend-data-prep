(function () {
    'use strict';

    /**
     * @ngdoc controller
     * @name data-prep.transformation-params.controller:TransformSimpleParamsCtrl
     * @description Transformation parameters controller.
     * @requires data-prep.services.utils.service:ConverterService
     */
    function TransformSimpleParamsCtrl(ConverterService) {
        var vm = this;



        /**
         * @ngdoc method
         * @name initParamsValues
         * @methodOf data-prep.transformation-params.controller:TransformSimpleParamsCtrl
         * @description [PRIVATE] Init simple params values to default
         */
        var initParamsValues = function () {
            _.forEach(vm.parameters, function (param) {

                if(typeof param.initialValue !== 'undefined') {
                    param.initialValue = ConverterService.adaptValue(param.type, param.initialValue);
                }

                if (typeof param.value !== 'undefined') {
                    param.value = ConverterService.adaptValue(param.type, param.value);
                }
                else if (typeof param.default !== 'undefined') {
                    param.default = ConverterService.adaptValue(param.type, param.default);
                    param.value = param.default;
                }
            });
        };

        /**
         * @ngdoc method
         * @name initInputTypes
         * @methodOf data-prep.transformation-params.controller:TransformSimpleParamsCtrl
         * @description [PRIVATE] Init params input type, depending on param type
         */
        var initInputTypes = function() {
            _.forEach(vm.parameters, function(param) {
                param.inputType = ConverterService.toInputType(param.type);
            });
        };

        initParamsValues();
        initInputTypes();
    }

    angular.module('data-prep.transformation-params')
        .controller('TransformSimpleParamsCtrl', TransformSimpleParamsCtrl);
})();