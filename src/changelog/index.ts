import { file, lines } from 'mrm-core';

module.exports = function task() {
	file('CHANGELOG.md').save('# Changelog\n');

	const prettierignore = lines('.prettierignore');
	if (prettierignore.exists()) {
		prettierignore.add('CHANGELOG.md');
	}
};
module.exports.description = 'Adds a Changelog to the project';
