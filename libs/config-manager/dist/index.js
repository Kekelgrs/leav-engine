'use strict';
const __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) {
k2 = k;
}
    Object.defineProperty(o, k2, {enumerable: true, get() {
 return m[k];
}});
}) : (function(o, m, k, k2) {
    if (k2 === undefined) {
k2 = k;
}
    o[k2] = m[k];
}));
const __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, 'default', {enumerable: true, value: v});
}) : function(o, v) {
    o.default = v;
});
const __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) {
return mod;
}
    const result = {};
    if (mod != null) {
for (const k in mod) {
if (k !== 'default' && Object.prototype.hasOwnProperty.call(mod, k)) {
__createBinding(result, mod, k);
}
}
}
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, '__esModule', {value: true});
exports.loadConfig = void 0;
const fs = __importStar(require('fs'));
const path = __importStar(require('path'));
/**
 * Load config file for given env
 *
 * @param  {string}  dirPath
 * @param  {string}  env
 * @return {Promise<{}>}
 */
const _getConfigByEnv = async function (dirPath, env) {
    const envFile = path.join(dirPath, `${env}.js`);
    if (env && (await fs.existsSync(envFile))) {
        const envConf = await Promise.resolve().then(() => __importStar(require(envFile)));
        return envConf.default;
    }
    return {};
};
const _isObject = (item) => {
    return item && typeof item === 'object' && !Array.isArray(item);
};
/**
 * Deep merge two objects.
 *
 * @param target
 * @param ...sources
 */
const _mergeDeep = function (target, ...sources) {
    if (!sources.length) {
        return target;
    }
    const source = sources.shift();
    if (_isObject(target) && _isObject(source)) {
        for (const key in source) {
            if (_isObject(source[key])) {
                if (!target[key]) {
                    Object.assign(target, {[key]: {}});
                }
                _mergeDeep(target[key], source[key]);
            } else {
                Object.assign(target, {[key]: source[key]});
            }
        }
    }
    return _mergeDeep(target, ...sources);
};
/**
 * Load appropriate config based on application environment.
 * We first load default config, then env specified config (production, development...).
 * Finally, config can be overridden locally with "local.js" config file
 *
 * If one of these files is missing, it will be silently ignored.
 *
 * @return {Promise} Full config
 */
async function loadConfig(dirPath, env) {
    const merged = _mergeDeep(await _getConfigByEnv(dirPath, 'default'), await _getConfigByEnv(dirPath, env), await _getConfigByEnv(dirPath, 'local'), {
        env
    });
    return merged;
}
exports.loadConfig = loadConfig;
//# sourceMappingURL=index.js.map