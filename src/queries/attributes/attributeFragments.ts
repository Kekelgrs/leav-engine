import gql from 'graphql-tag';

export const attributeDetailsFragment = gql`
    fragment AttributeDetails on Attribute {
        id
        type
        format
        system
        label(lang: $lang)
        linked_library
        linked_tree
        multiple_values
        permissions_conf {
            permissionTreeAttributes {
                id
                linked_tree
                label(lang: $lang)
            }
            relation
        }
        versions_conf {
            versionable
            mode
            trees
        }
    }
`;
