// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql} from 'graphql-tag';

const recordIdentityFragment = gql`
    fragment RecordIdentity on Record {
        id
        whoAmI {
            id
            label
            color
            library {
                id
                label
                gqlNames {
                    query
                    type
                }
            }
            preview {
                tiny
                small
                medium
                big
                huge
                pages
                original
                file {
                    id
                    library {
                        id
                    }
                }
            }
        }
    }
`;

export default recordIdentityFragment;
