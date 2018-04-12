import {makeGraphQlCall} from '../e2eUtils';

describe('records', () => {
    const testLibName = 'record_library_test';
    const testLibNameType = 'recordLibraryTest';
    let recordId;

    beforeAll(async () => {
        const res = await makeGraphQlCall(`mutation {
                saveLibrary(library: {id: "${testLibName}", label: {fr: "Test lib"}}) { id }
            }`);

        await makeGraphQlCall(`mutation { refreshSchema }`);
    });

    test('Create record', async () => {
        const res = await makeGraphQlCall(`mutation { createRecord(library: "${testLibName}") { id } }`);

        expect(res.status).toBe(200);

        expect(res.data.errors).toBeUndefined();
        expect(res.data.data.createRecord.id).toBeTruthy();

        recordId = res.data.data.createRecord.id;
    });

    test('Get records filtered by ID', async () => {
        const res = await makeGraphQlCall(
            `{ ${testLibNameType}(filters: [{field: id, value: "${recordId}"}]) { id } }
        `
        );

        expect(res.data.errors).toBeUndefined();
        expect(res.status).toBe(200);
        expect(res.data.data[testLibNameType].length).toBe(1);
        expect(res.data.data[testLibNameType][0].id).toBe(recordId);
    });

    test('Delete a record', async () => {
        const res = await makeGraphQlCall(
            `mutation {deleteRecord(library: "${testLibName}", id: "${recordId}") { id }}
        `
        );

        expect(res.status).toBe(200);
        expect(res.data.errors).toBeUndefined();
        expect(res.data.data.deleteRecord).toBeDefined();
        expect(res.data.data.deleteRecord.id).toBe(recordId);
    });
});
