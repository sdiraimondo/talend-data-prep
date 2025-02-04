/*  ============================================================================

 Copyright (C) 2006-2016 Talend Inc. - www.talend.com

 This source code is available under agreement available at
 https://github.com/Talend/data-prep/blob/master/LICENSE

 You should have received a copy of the agreement
 along with this program; if not, write to Talend SA
 9 rue Pages 92150 Suresnes, France

 ============================================================================*/

/**
 * @ngdoc service
 * @name data-prep.services.import.service:ImportService
 * @description Import service. This service provide the entry point to the backend import REST api.
 * @requires data-prep.services.import.service:ImportRestService
 */
export default class ImportService {

	constructor(ImportRestService, StateService) {
		'ngInject';

		this.ImportRestService = ImportRestService;
		this.StateService = StateService;
	}

	/**
	 * @ngdoc method
	 * @name initImport
	 * @methodOf data-prep.services.import.service:ImportService
	 * @description Initialize the import types list
	 */
	initImport() {
		return this.ImportRestService.importTypes()
			.then((response) => {
				this.StateService.setImportTypes(response.data);
			});
	}
}
