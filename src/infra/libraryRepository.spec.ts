import libraryRepository from './libraryRepository';
import {DocumentCollection} from 'arangojs/lib/esm/collection';
import {Connection} from 'arangojs/lib/esm/connection';
import {Database} from 'arangojs';

describe('LibraryRepository', () => {
    describe('getLibrary', () => {
        test('Should return all libs if no filter', async function() {
            const mockDbServ = {db: null, execute: jest.fn().mockReturnValue(Promise.resolve([]))};
            const mockDbUtils = {cleanup: jest.fn()};
            const libRepo = libraryRepository(mockDbServ, mockDbUtils);

            const lib = await libRepo.getLibraries();

            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatch(/FOR l IN core_libraries/);
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatch(/(?!FILTER)/);
        });

        test('Should filter', async function() {
            const mockDbServ = {db: null, execute: jest.fn().mockReturnValue(Promise.resolve([]))};
            const mockCleanupRes = {id: 'test_library', system: false};
            const mockConvertRes = {_key: 'test_library', system: false};
            const mockDbUtils = {
                cleanup: jest.fn().mockReturnValue(mockCleanupRes),
                convertToDoc: jest.fn().mockReturnValue({_key: 'test', system: false})
            };
            const libRepo = libraryRepository(mockDbServ, mockDbUtils);

            const lib = await libRepo.getLibraries({id: 'test'});

            expect(mockDbServ.execute.mock.calls[0][0].query).toMatch(/(FILTER){1}/);
        });

        test('Should return an empty array if no results', async function() {
            const mockDbServ = {db: null, execute: jest.fn().mockReturnValue(Promise.resolve([]))};

            const mockCleanupRes = {id: 'test_library'};
            const mockDbUtils = {
                cleanup: jest.fn().mockReturnValue(mockCleanupRes),
                convertToDoc: jest.fn().mockReturnValue({_key: 'test'})
            };

            const libRepo = libraryRepository(mockDbServ, mockDbUtils);

            const libs = await libRepo.getLibraries({id: 'test'});

            expect(libs).toBeInstanceOf(Array);
            expect(libs.length).toBe(0);
        });

        test('Should format returned values', async function() {
            const mockLibList = [{_key: 'test', _id: 'core_libraries/test', _rev: '_WR0JkDW--_'}];
            const mockDbServ = {db: null, execute: jest.fn().mockReturnValue(Promise.resolve(mockLibList))};

            const mockCleanupRes = [{id: 'test', system: false}];
            const mockDbUtils = {
                cleanup: jest.fn().mockReturnValue(mockCleanupRes),
                convertToDoc: jest.fn().mockReturnValue({_key: 'test', system: false})
            };
            const libRepo = libraryRepository(mockDbServ, mockDbUtils);

            const libs = await libRepo.getLibraries({id: 'test'});

            expect(mockDbUtils.cleanup.mock.calls.length).toBe(1);
            expect(libs.length).toEqual(1);
            expect(libs[0]).toMatchObject([{id: 'test', system: false}]);
        });
    });

    describe('createLibrary', () => {
        const docLibData = {_key: 'test_library', system: true};
        const libData = {id: 'test_library', system: true};
        test('Should insert a library and create a new collection', async function() {
            const mockDbServ = {
                db: new Database(),
                execute: jest.fn().mockReturnValue(Promise.resolve([docLibData])),
                createCollection: jest.fn().mockReturnValue(Promise.resolve())
            };

            const mockCleanupRes = libData;
            const mockDbUtils = {
                cleanup: jest.fn().mockReturnValue(mockCleanupRes),
                convertToDoc: jest.fn().mockReturnValue(docLibData)
            };

            const libRepo = libraryRepository(mockDbServ, mockDbUtils);

            const createdLib = await libRepo.createLibrary(libData);
            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(mockDbServ.createCollection.mock.calls.length).toBe(1);

            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatch(/^INSERT/);

            expect(createdLib).toMatchObject(libData);
        });
    });

    describe('updateLibrary', () => {
        const docLibData = {_key: 'test_library', system: true};
        const libData = {id: 'test_library', system: true};
        test('Should update library', async function() {
            const mockDbServ = {
                db: new Database(),
                execute: jest.fn().mockReturnValue(Promise.resolve([docLibData]))
            };

            const mockDbUtils = {
                cleanup: jest.fn().mockReturnValue(libData),
                convertToDoc: jest.fn().mockReturnValue(docLibData)
            };

            const libRepo = libraryRepository(mockDbServ, mockDbUtils);

            const updatedLib = await libRepo.updateLibrary(libData);

            expect(mockDbServ.execute.mock.calls.length).toBe(1);

            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatch(/^UPDATE/);

            expect(updatedLib).toMatchObject(libData);
        });
    });
});
