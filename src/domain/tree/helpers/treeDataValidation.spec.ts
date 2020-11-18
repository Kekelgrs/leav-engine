import {ILibraryDomain} from 'domain/library/libraryDomain';
import {IUtils} from 'utils/utils';
import {IQueryInfos} from '_types/queryInfos';
import ValidationError from '../../../errors/ValidationError';
import {mockLibrary, mockLibraryFiles} from '../../../__tests__/mocks/library';
import {mockFilesTree, mockTree} from '../../../__tests__/mocks/tree';
import treeDataValidation from './treeDataValidation';

describe('TreeDataValidation', () => {
    describe('Validate', () => {
        const ctx: IQueryInfos = {
            userId: '1'
        };

        const mockUtils: Mockify<IUtils> = {
            isIdValid: jest.fn().mockReturnValue(true)
        };

        const mockLibDomain: Mockify<ILibraryDomain> = {
            getLibraries: global.__mockPromise({
                list: [
                    {...mockLibrary, id: 'lib1'},
                    {...mockLibrary, id: 'lib2'}
                ]
            })
        };

        test('Should throw if ID is invalid', async () => {
            const mockUtilsInvalidId: Mockify<IUtils> = {
                isIdValid: jest.fn().mockReturnValue(false)
            };

            const validationHelper = treeDataValidation({
                'core.library.domain': mockLibDomain as ILibraryDomain,
                'core.utils': mockUtilsInvalidId as IUtils
            });

            await expect(validationHelper.validate({...mockTree, id: 'Invalid ID'}, ctx)).rejects.toThrow(
                ValidationError
            );
        });

        test('Should throw if unkown library', async () => {
            const mockLibDomainNotFound: Mockify<ILibraryDomain> = {
                getLibraries: global.__mockPromise({list: []})
            };

            const validationHelper = treeDataValidation({
                'core.library.domain': mockLibDomainNotFound as ILibraryDomain,
                'core.utils': mockUtils as IUtils
            });

            await expect(validationHelper.validate({...mockTree}, ctx)).rejects.toThrow(ValidationError);
        });

        test('Should throw if, on files behavior, binding a non-files library', async () => {
            const mockLibDomainNotFiles: Mockify<ILibraryDomain> = {
                getLibraries: global.__mockPromise({list: [{...mockLibrary, id: 'lib1'}]})
            };
            const validationHelper = treeDataValidation({
                'core.library.domain': mockLibDomainNotFiles as ILibraryDomain,
                'core.utils': mockUtils as IUtils
            });

            await expect(validationHelper.validate({...mockFilesTree}, ctx)).rejects.toThrow(ValidationError);
        });

        test('Should throw if, on files behavior, binding more than one library', async () => {
            const mockLibDomainNotFiles: Mockify<ILibraryDomain> = {
                getLibraries: global.__mockPromise({
                    list: [
                        {...mockLibraryFiles, id: 'lib1'},
                        {...mockLibraryFiles, id: 'lib2'}
                    ]
                })
            };

            const validationHelper = treeDataValidation({
                'core.library.domain': mockLibDomainNotFiles as ILibraryDomain,
                'core.utils': mockUtils as IUtils
            });

            await expect(
                validationHelper.validate({...mockFilesTree, libraries: ['lib1', 'lib2']}, ctx)
            ).rejects.toThrow(ValidationError);
        });
    });
});
