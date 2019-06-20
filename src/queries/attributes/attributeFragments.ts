import gql from 'graphql-tag';

export const attributeDetailsFragment = gql`
    fragment AttributeDetails on Attribute {
        id
        type
        format
        system
        label(lang: $lang)
        linked_tree
        multipleValues
        permissionsConf {
            permissionTreeAttributes {
                id
                linked_tree
                label(lang: $lang)
            }
            relation
        }
        versionsConf {
            versionable
            trees
        }
    }
`;
