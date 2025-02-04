/*  ============================================================================

 Copyright (C) 2006-2016 Talend Inc. - www.talend.com

 This source code is available under agreement available at
 https://github.com/Talend/data-prep/blob/master/LICENSE

 You should have received a copy of the agreement
 along with this program; if not, write to Talend SA
 9 rue Pages 92150 Suresnes, France

 ============================================================================*/

describe('home state', () => {

	beforeEach(angular.mock.module('data-prep.services.state'));

	describe('toggleSidepanel', () => {
		it('should toggle sidepanel', inject((homeState, HomeStateService) => {
			//given
			homeState.sidePanelDocked = false;

			//when
			HomeStateService.toggleSidepanel();

			//then
			expect(homeState.sidePanelDocked).toBe(true);
		}));
	});

	describe('toggleCopyMovePreparation', () => {
		it('should toggle copy/move preparation', inject((homeState, HomeStateService) => {
			//given
			homeState.preparations.copyMove.isVisible = false;

			//when
			HomeStateService.toggleCopyMovePreparation();

			//then
			expect(homeState.preparations.copyMove.isVisible).toBe(true);
		}));

		it('should set preparation and its initial folder',
			inject((homeState, HomeStateService) => {
				//given
				homeState.preparations.copyMove.initialFolder = { id: 'folder 1' };
				homeState.preparations.copyMove.preparation = { id: 'prep 1' };

				const initialFolder = { id: 'folder 2' };
				const preparation = { id: 'prep 2' };

				//when
				HomeStateService.toggleCopyMovePreparation(initialFolder, preparation);

				//then
				expect(homeState.preparations.copyMove.initialFolder).toBe(initialFolder);
				expect(homeState.preparations.copyMove.preparation).toBe(preparation);
			})
		);
	});

	describe('togglePreparationCreator', () => {
		it('should toggle preparation creator', inject((homeState, HomeStateService) => {
			//given
			homeState.preparations.creator.isVisible = false;

			//when
			HomeStateService.togglePreparationCreator();

			//then
			expect(homeState.preparations.creator.isVisible).toBe(true);
		}));
	});

});
