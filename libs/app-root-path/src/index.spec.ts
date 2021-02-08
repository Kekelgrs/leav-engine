// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

import {appRootPath} from '.';

jest.mock('app-root-path', () => ({
    path: 'path/from/deps'
}));

describe('appRootPath', () => {
    const OLD_ENV = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = {...OLD_ENV};
    });

    test('Return path from env variable', async () => {
        process.env.APP_ROOT_PATH = 'path/from/variable';
        expect(appRootPath()).toBe('path/from/variable');
    });

    test('Determine path from app location', async () => {
        expect(appRootPath()).toBe('path/from/deps');
    });

    test('Remove trailing slashes', async () => {
        process.env.APP_ROOT_PATH = 'path/from/variable/';
        expect(appRootPath()).toBe('path/from/variable');
    });
});
