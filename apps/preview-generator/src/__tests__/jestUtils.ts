declare namespace NodeJS {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    interface Global {
        __mockPromise(promRes?: any): any;
        __mockPromiseMultiple(promRes?: any[]): any;
    }
}

global.__mockPromise = promRes => jest.fn().mockReturnValue(Promise.resolve(promRes));
global.__mockPromiseMultiple = promResults => {
    const jestFn = jest.fn();
    for (const promRes of promResults) {
        jestFn.mockReturnValueOnce(promRes);
    }

    return jestFn;
};

// Used to mock any interface, turning all function properties to an optionnal mock
// Mockified object must be then passed to a function with a type assertion
type Mockify<T> = {[P in keyof T]?: T[P] extends (...args: any) => any ? jest.Mock : T[P]};
