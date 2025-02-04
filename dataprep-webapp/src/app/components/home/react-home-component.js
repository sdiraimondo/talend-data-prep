/*  ============================================================================

 Copyright (C) 2006-2016 Talend Inc. - www.talend.com

 This source code is available under agreement available at
 https://github.com/Talend/data-prep/blob/master/LICENSE

 You should have received a copy of the agreement
 along with this program; if not, write to Talend SA
 9 rue Pages 92150 Suresnes, France

 ============================================================================*/

const HomeComponent = {
	template: `
		<dataset-xls-preview></dataset-xls-preview>
		<preparation-copy-move></preparation-copy-move>
		<preparation-creator></preparation-creator>
		<layout>
			<ui-view name="home-content"></ui-view>
		</layout>
	`,
};

export default HomeComponent;
