// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mockRecord} from '__mocks__/common/record';
import {mockRecordPropertyWithAttribute} from '__mocks__/common/value';
import editRecordReducer, {
    EditRecordReducerActionsTypes,
    IEditRecordReducerState,
    initialState
} from './editRecordReducer';

describe('editRecordReducer', () => {
    const mockInitialState: IEditRecordReducerState = {
        ...initialState,
        record: mockRecord
    };

    test('SET_ACTIVE_VALUE', async () => {
        expect(
            editRecordReducer(mockInitialState, {
                type: EditRecordReducerActionsTypes.SET_ACTIVE_VALUE,
                value: mockRecordPropertyWithAttribute
            }).activeValue
        ).toEqual(mockRecordPropertyWithAttribute);
    });
});
