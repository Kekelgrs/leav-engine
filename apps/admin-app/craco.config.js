module.exports = {
    plugins: [{plugin: require('@semantic-ui-react/craco-less')}],
    webpack: {
        configure: {
            resolve: {
                fallback: {
                    path: false
                }
            }
        }
    }
};
