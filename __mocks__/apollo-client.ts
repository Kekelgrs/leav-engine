// use only for unit tests /!\

export class ApolloClient {
    // constructor(options) {}
    async query(): Promise<any> {
        return {
            data: {
                fullTreeContent: [
                    {
                        order: 0,
                        record: {
                            id: '293900',
                            active: true,
                            created_at: 1585753474,
                            created_by: 1,
                            file_name: 'dir',
                            file_path: '.',
                            inode: 573198,
                            is_directory: true,
                            modified_at: 1585753474,
                            modified_by: 1,
                            previews_status: {
                                small: {
                                    status: -1,
                                    message: 'wait for creation'
                                },
                                medium: {
                                    status: -1,
                                    message: 'wait for creation'
                                },
                                big: {
                                    status: -1,
                                    message: 'wait for creation'
                                },
                                pages: {
                                    status: -1,
                                    message: 'wait for creation'
                                }
                            },
                            previews: {
                                small: '',
                                medium: '',
                                big: '',
                                pages: ''
                            },
                            root_key: 'files1',
                            library: 'files'
                        },
                        children: []
                    }
                ]
            }
        };
    }
}
