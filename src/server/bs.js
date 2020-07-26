const path = require('path');

const tsnode = require('ts-node');

module.exports = {
    boot(entrypoint, config) {
        if (config == null) config = require('./defaults.json');
        tsnode.register(config);
        return require(path.resolve(entrypoint));
    }
}