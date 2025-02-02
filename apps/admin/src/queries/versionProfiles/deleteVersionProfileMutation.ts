// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

import {gql} from '@apollo/client';
export const deleteVersionProfileMutation = gql`
    mutation DELETE_VERSION_PROFILE($id: String!) {
        deleteVersionProfile(id: $id) {
            id
        }
    }
`;
