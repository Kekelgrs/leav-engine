import {handleCheck} from './handleCheck';
import {checkInput} from './checkInput/checkInput';
import {IMessageConsume, IConfig} from './../types';
import {checkOutput} from './checkOutput/checkOutput';

describe('handleCheck', () => {
    const inputRootPath = '/app/';
    const outputRootPath = '/app/';
    const config: Mockify<IConfig> = {inputRootPath, outputRootPath};

    const input = 'test.jpg';
    const output = 'test.png';
    const size = 800;

    const msgContent: Mockify<IMessageConsume> = {
        input,
        versions: [
            {
                sizes: [
                    {
                        size,
                        output,
                    },
                ],
            },
        ],
    };

    test('should call checkInput with input absolute path', async () => {
        (checkInput as jest.FunctionLike) = jest.fn();
        (checkOutput as jest.FunctionLike) = jest.fn();

        await handleCheck(msgContent as IMessageConsume, config as IConfig);

        expect(checkInput).toBeCalledWith(msgContent.input, inputRootPath);
    });

    test('should call checkOutput with output', async () => {
        (checkInput as jest.FunctionLike) = jest.fn();
        (checkOutput as jest.FunctionLike) = jest.fn();

        await handleCheck(msgContent as IMessageConsume, config as IConfig);

        expect(checkOutput).toBeCalledWith(inputRootPath + output, size, expect.anything());
    });
});
