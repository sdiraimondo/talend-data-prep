(function () {
    'use strict';

    /**
     * @ngdoc controller
     * @name data-prep.transformation-menu.controller:TransformMenuCtrl
     * @description Transformation menu item controller.
     * @requires data-prep.services.playground.service:PlaygroundService
     * @requires data-prep.services.preparation.service:PreparationService
     * @requires data-prep.services.transformation.service:TransformationService
     * @requires data-prep.services.utils.service:ConverterService
     */
    function TransformMenuCtrl(PlaygroundService, PreparationService, TransformationService, ConverterService) {
        var vm = this;
        vm.converterService = ConverterService;

        /**
         * @ngdoc method
         * @name initDynamicParams
         * @methodOf data-prep.transformation-menu.controller:TransformMenuCtrl
         * @description [PRIVATE] Fetch the transformation dynamic parameters and inject them into transformation menu params
         * @returns {promise} The GET request promise
         */
        var initDynamicParams = function(menu) {
            var infos = {
                columnId: vm.column.id,
                datasetId:  PlaygroundService.currentMetadata.id,
                preparationId:  PreparationService.currentPreparationId
            };
            return TransformationService.initDynamicParameters(menu, infos);
        };

        /**
         * @ngdoc method
         * @name select
         * @methodOf data-prep.transformation-menu.controller:TransformMenuCtrl
         * @description Menu selected. 3 choices :
         * <ul>
         *     <li>divider : no action</li>
         *     <li>no parameter and no choice is required : transformation call</li>
         *     <li>parameter or choice required : show modal</li>
         * </ul>
         */
        vm.select = function (menu, scope) {
            if(menu.dynamic) {
                vm.dynamicFetchInProgress = true;
                vm.showModal = true;
                vm.selectedMenu = menu;
                vm.selectedScope = scope;

                //get new parameters
                initDynamicParams(menu).finally(function() {
                    vm.dynamicFetchInProgress = false;
                });
            }
            else if (menu.parameters || menu.items) {
                vm.showModal = true;
                vm.selectedMenu = menu;
                vm.selectedScope = scope;
            }
            else {
                vm.transformClosure(menu, scope)();
            }
        };

        vm.transformClosure = function(menu, scope) {
            return function(params) {
                params = params || {};
                params.scope = scope;
                params.column_id = vm.column.id;
                params.column_name = vm.column.name;

                transform(menu, params);
            };
        };

        /**
         * @ngdoc method
         * @name transform
         * @methodOf data-prep.transformation-menu.controller:TransformMenuCtrl
         * @param {object} params The transformation params
         * @description Perform a transformation on the column
         */
        function transform(menu, params) {
            PlaygroundService.appendStep(menu.name, params)
                .then(function() {
                    vm.showModal = false;
                });
        }
    }

    angular.module('data-prep.transformation-menu')
        .controller('TransformMenuCtrl', TransformMenuCtrl);
})();