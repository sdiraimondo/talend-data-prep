/*  ============================================================================

 Copyright (C) 2006-2016 Talend Inc. - www.talend.com

 This source code is available under agreement available at
 https://github.com/Talend/data-prep/blob/master/LICENSE

 You should have received a copy of the agreement
 along with this program; if not, write to Talend SA
 9 rue Pages 92150 Suresnes, France

 ============================================================================*/

import BreadcrumbCtrl from './breadcrumb-controller';

const BreadcrumbContainer = {
	template: '<pure-breadcrumb items="$ctrl.breadcrumbItems" max-items="$ctrl.maxItems"></pure-breadcrumb>',
	controller: BreadcrumbCtrl,
	bindings: {
		items: '<',
	},
};
export default BreadcrumbContainer;
