// Limit Metro to the project directory to reduce EPERM errors when tools scan ~/Library or .Trash
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);

config.projectRoot = projectRoot;
config.watchFolders = [projectRoot];
config.resolver = config.resolver || {};
config.resolver.blockList = [
  ...(Array.isArray(config.resolver.blockList) ? config.resolver.blockList : []),
  /\/Users\/[^/]+\/\.Trash\/.*/,
  /\/Users\/[^/]+\/Library\/.*/,
];

module.exports = config;
