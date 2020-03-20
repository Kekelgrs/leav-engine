import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {ILibraryDomain} from 'domain/library/libraryDomain';
import {ITreeDomain} from 'domain/tree/treeDomain';
import {IAttributeRepo} from 'infra/attribute/attributeRepo';
import {ILibraryRepo} from 'infra/library/libraryRepo';
import {ITreeRepo} from 'infra/tree/treeRepo';
import {IMigration} from '_types/migration';
import {ActionsListEvents} from '../../../_types/actionsList';
import {AttributeFormats, AttributeTypes, IAttribute} from '../../../_types/attribute';
import {LibraryBehavior} from '../../../_types/library';
import {TreeBehavior} from '../../../_types/tree';
import {IDbService} from '../dbService';

interface IDeps {
    config?: any;
    'core.infra.db.dbService'?: IDbService;
    'core.domain.attribute'?: IAttributeDomain;
    'core.domain.library'?: ILibraryDomain;
    'core.domain.tree'?: ITreeDomain;
    'core.infra.attribute'?: IAttributeRepo;
    'core.infra.library'?: ILibraryRepo;
    'core.infra.tree'?: ITreeRepo;
}

export default function({
    'core.infra.attribute': attributeRepo = null,
    'core.domain.attribute': attributeDomain = null,
    'core.domain.library': libraryDomain = null,
    'core.domain.tree': treeDomain = null,
    'core.infra.library': libraryRepo = null,
    'core.infra.tree': treeRepo = null,
    config
}: IDeps): IMigration {
    return {
        async run() {
            const existingAttributes = await attributeDomain.getAttributes();
            const attributesById: {[key: string]: IAttribute} = existingAttributes.list.reduce((attrs, curAttr) => {
                attrs[curAttr.id] = curAttr;
                return attrs;
            }, {});

            // Create attributes needed for files manager
            if (typeof attributesById.root_key === 'undefined') {
                attributesById.root_key = await attributeRepo.createAttribute({
                    id: 'root_key',
                    system: true,
                    type: AttributeTypes.SIMPLE,
                    format: AttributeFormats.TEXT,
                    label: {fr: 'Clé racine', en: 'Root key'},
                    actions_list: {
                        [ActionsListEvents.GET_VALUE]: [],
                        [ActionsListEvents.SAVE_VALUE]: [
                            {
                                id: 'validateFormat',
                                name: 'Validate Format',
                                is_system: true
                            }
                        ],
                        [ActionsListEvents.DELETE_VALUE]: []
                    }
                });
            }

            if (typeof attributesById.is_directory === 'undefined') {
                attributesById.is_directory = await attributeRepo.createAttribute({
                    id: 'is_directory',
                    system: true,
                    type: AttributeTypes.SIMPLE,
                    format: AttributeFormats.BOOLEAN,
                    label: {fr: 'Dossier', en: 'Directory'},
                    actions_list: {
                        [ActionsListEvents.GET_VALUE]: [
                            {
                                id: 'toBoolean',
                                name: 'To Boolean',
                                is_system: true
                            }
                        ],
                        [ActionsListEvents.SAVE_VALUE]: [
                            {
                                id: 'validateFormat',
                                name: 'Validate Format',
                                is_system: true
                            },
                            {
                                id: 'toBoolean',
                                name: 'To Boolean',
                                is_system: true
                            }
                        ],
                        [ActionsListEvents.DELETE_VALUE]: []
                    }
                });
            }

            if (typeof attributesById.file_path === 'undefined') {
                attributesById.file_path = await attributeRepo.createAttribute({
                    id: 'file_path',
                    system: true,
                    type: AttributeTypes.SIMPLE,
                    format: AttributeFormats.TEXT,
                    label: {fr: 'Chemin du fichier', en: 'File path'},
                    actions_list: {
                        [ActionsListEvents.GET_VALUE]: [],
                        [ActionsListEvents.SAVE_VALUE]: [
                            {
                                id: 'validateFormat',
                                name: 'Validate Format',
                                is_system: true
                            }
                        ],
                        [ActionsListEvents.DELETE_VALUE]: []
                    }
                });
            }

            if (typeof attributesById.file_name === 'undefined') {
                attributesById.file_name = await attributeRepo.createAttribute({
                    id: 'file_name',
                    system: true,
                    type: AttributeTypes.SIMPLE,
                    format: AttributeFormats.TEXT,
                    label: {fr: 'Nom du fichier', en: 'File name'},
                    actions_list: {
                        [ActionsListEvents.GET_VALUE]: [],
                        [ActionsListEvents.SAVE_VALUE]: [
                            {
                                id: 'validateFormat',
                                name: 'Validate Format',
                                is_system: true
                            }
                        ],
                        [ActionsListEvents.DELETE_VALUE]: []
                    }
                });
            }

            if (typeof attributesById.inode === 'undefined') {
                attributesById.inode = await attributeRepo.createAttribute({
                    id: 'inode',
                    system: true,
                    type: AttributeTypes.SIMPLE,
                    format: AttributeFormats.NUMERIC,
                    label: {fr: 'Inode', en: 'Inode'},
                    actions_list: {
                        [ActionsListEvents.GET_VALUE]: [],
                        [ActionsListEvents.SAVE_VALUE]: [
                            {
                                id: 'validateFormat',
                                name: 'Validate Format',
                                is_system: true
                            },
                            {
                                id: 'toNumber',
                                name: 'To Number',
                                is_system: true
                            }
                        ],
                        [ActionsListEvents.DELETE_VALUE]: []
                    }
                });
            }

            if (typeof attributesById.previews === 'undefined') {
                attributesById.previews = await attributeRepo.createAttribute({
                    id: 'previews',
                    system: true,
                    type: AttributeTypes.SIMPLE,
                    format: AttributeFormats.EXTENDED,
                    embedded_fields: [
                        {
                            id: 'small',
                            format: AttributeFormats.TEXT
                        },
                        {
                            id: 'medium',
                            format: AttributeFormats.TEXT
                        },
                        {
                            id: 'big',
                            format: AttributeFormats.TEXT
                        },
                        {
                            id: 'pages',
                            format: AttributeFormats.TEXT
                        }
                    ],
                    label: {fr: 'Aperçus', en: 'Previews'},
                    actions_list: {
                        [ActionsListEvents.GET_VALUE]: [],
                        [ActionsListEvents.SAVE_VALUE]: [
                            {
                                id: 'validateFormat',
                                name: 'Validate Format',
                                is_system: true
                            }
                        ],
                        [ActionsListEvents.DELETE_VALUE]: []
                    }
                });
            }

            if (typeof attributesById.previews_status === 'undefined') {
                const previewStatusSubFields = [
                    {
                        id: 'status',
                        format: AttributeFormats.NUMERIC
                    },
                    {
                        id: 'message',
                        format: AttributeFormats.TEXT
                    }
                ];

                attributesById.previews_status = await attributeRepo.createAttribute({
                    id: 'previews_status',
                    system: true,
                    type: AttributeTypes.SIMPLE,
                    format: AttributeFormats.EXTENDED,
                    label: {fr: 'Statut des aperçus', en: 'Previews status'},
                    embedded_fields: [
                        {
                            id: 'small',
                            format: AttributeFormats.EXTENDED,
                            embedded_fields: previewStatusSubFields
                        },
                        {
                            id: 'medium',
                            format: AttributeFormats.EXTENDED,
                            embedded_fields: previewStatusSubFields
                        },
                        {
                            id: 'big',
                            format: AttributeFormats.EXTENDED,
                            embedded_fields: previewStatusSubFields
                        },
                        {
                            id: 'pages',
                            format: AttributeFormats.EXTENDED,
                            embedded_fields: previewStatusSubFields
                        }
                    ],
                    actions_list: {
                        [ActionsListEvents.GET_VALUE]: [],
                        [ActionsListEvents.SAVE_VALUE]: [
                            {
                                id: 'validateFormat',
                                name: 'Validate Format',
                                is_system: true
                            }
                        ],
                        [ActionsListEvents.DELETE_VALUE]: []
                    }
                });
            }

            if (typeof attributesById.file_name === 'undefined') {
                attributesById.file_name = await attributeRepo.createAttribute({
                    id: 'file_name',
                    system: true,
                    type: AttributeTypes.SIMPLE,
                    format: AttributeFormats.TEXT,
                    label: {fr: 'Nom du fichier', en: 'File name'}
                });
            }

            if (typeof attributesById.inode === 'undefined') {
                attributesById.inode = await attributeRepo.createAttribute({
                    id: 'inode',
                    system: true,
                    type: AttributeTypes.SIMPLE,
                    format: AttributeFormats.NUMERIC,
                    label: {fr: 'Inode', en: 'Inode'}
                });
            }

            if (typeof attributesById.previews === 'undefined') {
                attributesById.previews = await attributeRepo.createAttribute({
                    id: 'previews',
                    system: true,
                    type: AttributeTypes.SIMPLE,
                    format: AttributeFormats.EXTENDED,
                    embedded_fields: [
                        {
                            id: 'small',
                            format: AttributeFormats.TEXT
                        },
                        {
                            id: 'medium',
                            format: AttributeFormats.TEXT
                        },
                        {
                            id: 'big',
                            format: AttributeFormats.TEXT
                        }
                    ],
                    label: {fr: 'Aperçus', en: 'Previews'}
                });
            }

            if (typeof attributesById.previews_status === 'undefined') {
                const previewStatusSubFields = [
                    {
                        id: 'status',
                        format: AttributeFormats.NUMERIC
                    },
                    {
                        id: 'message',
                        format: AttributeFormats.TEXT
                    }
                ];

                attributesById.previews_status = await attributeRepo.createAttribute({
                    id: 'previews_status',
                    system: true,
                    type: AttributeTypes.SIMPLE,
                    format: AttributeFormats.EXTENDED,
                    label: {fr: 'Statut des aperçus', en: 'Previews status'},
                    embedded_fields: [
                        {
                            id: 'small',
                            format: AttributeFormats.EXTENDED,
                            embedded_fields: previewStatusSubFields
                        },
                        {
                            id: 'medium',
                            format: AttributeFormats.EXTENDED,
                            embedded_fields: previewStatusSubFields
                        },
                        {
                            id: 'big',
                            format: AttributeFormats.EXTENDED,
                            embedded_fields: previewStatusSubFields
                        }
                    ]
                });
            }

            // Create "files" library
            const filesLibraryId = 'files';
            const existingLibrary = await libraryDomain.getLibraries({filters: {id: filesLibraryId}});
            if (!existingLibrary.list.length) {
                await libraryRepo.createLibrary({
                    id: filesLibraryId,
                    system: true,
                    behavior: LibraryBehavior.FILES,
                    label: {fr: 'Fichiers', en: 'Files'}
                });

                await libraryRepo.saveLibraryAttributes(filesLibraryId, [
                    'id',
                    'created_by',
                    'created_at',
                    'modified_by',
                    'modified_at',
                    'root_key',
                    'is_directory',
                    'file_path',
                    'file_name',
                    'inode',
                    'previews',
                    'previews_status'
                ]);
            }

            // Create tree linked to files library
            const filesTreeId = 'files_tree';
            const existingTree = await treeDomain.getTrees({filters: {id: filesTreeId}});
            if (!existingTree.list.length) {
                await treeRepo.createTree({
                    id: filesTreeId,
                    system: true,
                    behavior: TreeBehavior.FILES,
                    label: {fr: 'Fichiers', en: 'Files'},
                    libraries: [filesLibraryId]
                });
            }
        }
    };
}
