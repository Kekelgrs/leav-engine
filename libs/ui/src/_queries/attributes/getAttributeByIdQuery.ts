// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql} from '@apollo/client';
import {attributeDetailsFragment} from './attributeDetailsFragment';

export const getAttributeByIdQuery = gql`
    ${attributeDetailsFragment}
    query GET_ATTRIBUTE_BY_ID($id: ID) {
        attributes(filters: {id: $id}) {
            list {
                ...AttributeDetails
            }
        }
    }
`;
