// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gqlUnchecked} from 'utils';

export const getLibraryDetailQuery = gqlUnchecked`
    query GET_LIBRARY_DETAIL($libId: ID) {
        libraries(filters: {id: $libId}) {
            list {
                id
                system
                label
                attributes {
                    id
                    type
                    format
                    label
                }
                linkedTrees {
                    id
                    label
                }
            }
        }
    }
`;
