// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
// We're overriding webpack config to handle warnings about missing polyfills in webpack 5
// In the future, this might become unnecessary if CRA provides a fix for this
module.exports = function override(config) {
    return {
        ...config,
        resolve: {
            ...config.resolve,
            fallback: {
                ...config.resolve.fallback,
                // We don't use path in this project, but we import it indirectly through the
                // @leav/utils package. Hence, no need for a polyfill.
                path: false
            }
        }
    };
};
