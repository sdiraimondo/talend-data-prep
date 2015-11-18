(function() {
    'use strict';

    /**
     * @ngdoc service
     * @name data-prep.lookup-datagrid.service:DatagridGridService
     * @description Datagrid private service that init the grid
     * @requires data-prep.state.service:StateService
     * @requires data-prep.lookup-datagrid.service:DatagridService
     * @requires data-prep.lookup-datagrid.service:DatagridStyleService
     * @requires data-prep.lookup-datagrid.service:DatagridColumnService
     * @requires data-prep.lookup-datagrid.service:DatagridSizeService
     * @requires data-prep.lookup-datagrid.service:DatagridExternalService
     * @requires data-prep.lookup-datagrid.service:DatagridTooltipService
     */
    function LookupDatagridGridService(state, StateService, LookupDatagridStyleService, LookupDatagridColumnService,
                                       LookupDatagridSizeService, LookupDatagridExternalService,
                                       LookupDatagridTooltipService, $timeout) {
        var grid = null;
        var gridServices = [
            LookupDatagridColumnService,
            LookupDatagridStyleService,
            LookupDatagridSizeService,
            LookupDatagridExternalService,
            LookupDatagridTooltipService
        ];

        return {
            initGrid : initGrid
        };

        //--------------------------------------------------------------------------------------------------------------

        /**
         * @ngdoc method
         * @name attachLongTableListeners
         * @methodOf data-prep.lookup-datagrid.service:DatagridGridService
         * @description Attach listeners for big table row management
         */
        function attachLongTableListeners() {
            state.playground.lookupGrid.dataView.onRowCountChanged.subscribe(function () {
                grid.updateRowCount();
                grid.render();
            });
            state.playground.lookupGrid.dataView.onRowsChanged.subscribe(function (e, args) {
                grid.invalidateRows(args.rows);
                grid.render();
            });
        }

        /**
         * @ngdoc method
         * @name attachGridStateListeners
         * @methodOf data-prep.lookup-datagrid.service:DatagridGridService
         * @description Attach listeners for saving the state of column id and line selection number
         */
        function attachGridStateListeners() {
            grid.onActiveCellChanged.subscribe(function (e, args) {
                if (angular.isDefined(args.cell)) {
                    var column = grid.getColumns()[args.cell];
                    $timeout(function(){
                        StateService.setLookupGridSelection(column.tdpColMetadata, args.row);
                    });
                }
            });

            grid.onHeaderClick.subscribe(function (e, args) {
                $timeout(function(){
                    StateService.setLookupGridSelection(args.column.tdpColMetadata);
                });
            });
        }

        /**
         * @ngdoc method
         * @name initGridServices
         * @methodOf data-prep.lookup-datagrid.service:DatagridGridService
         * @description Init other grid services with the new created grid
         */
        function initGridServices() {
            _.forEach(gridServices, function(service) {
                service.init(grid);
            });
        }

        /**
         * @ngdoc method
         * @name initGrid
         * @methodOf data-prep.lookup-datagrid.service:DatagridGridService
         * @description Create Slick grid and initiate other lookup-datagrid services
         The dataview is initiated and held by {@link data-prep.services.playground.service:DatagridService DatagridService}
         * @param {string} elementId The element where the grid will be inserted in the DOM. The element must exists
         */
        function initGrid (elementId) {
            //create grid
            var options = {
                autoEdit: false,
                editable: false,
                enableAddRow: false,
                enableCellNavigation: true,
                enableTextSelectionOnCells: false,
                syncColumnCellResize: false,
                frozenColumn: 0
            };
            grid = new Slick.Grid(elementId, state.playground.lookupGrid.dataView, [{id: 'tdpId'}], options);

            //listeners
            attachLongTableListeners();
            attachGridStateListeners();

            //init other services
            initGridServices();

            return grid;
        }
    }

    angular.module('data-prep.lookup')
        .service('LookupDatagridGridService', LookupDatagridGridService);
})();