import { file } from 'mrm-core';

module.exports = function task() {
	file('CHANGELOG.md').save('# Changelog\n');
};
module.exports.description = 'Adds a Changelog to the project';
