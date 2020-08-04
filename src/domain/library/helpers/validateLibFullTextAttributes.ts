import {ILibrary} from '_types/library';
import {ErrorFieldDetail, Errors} from '../../../_types/errors';
import {difference} from 'lodash';

export default (attributes: string[], fullTextAttributes: string[]): ErrorFieldDetail<ILibrary> => {
    const errors: ErrorFieldDetail<ILibrary> = {};

    if (difference(fullTextAttributes, attributes).length) {
        errors.fullTextAttributes = {
            msg: Errors.INVALID_FULLTEXT_ATTRIBUTES,
            vars: {fullTextAttributes: fullTextAttributes.join(', ')}
        };
    }

    return errors;
};
