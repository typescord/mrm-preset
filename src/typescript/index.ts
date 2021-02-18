import { json, lines, packageJson, yaml } from 'mrm-core';

import { execCommand, format, install, isUsingYarnBerry } from '../utils';
import tsConfig from './_tsconfig.json';

const dependencies = ['typescript', '@types/node'];
const EslintRcPropertiesOrder = ['root', 'extends', 'plugins', 'parserOptions', 'rules', 'env'];

module.exports = function task() {
	const pkg = packageJson().setScript('build', 'tsc');
	json('tsconfig.json').merge(tsConfig).save();
	lines('.gitignore').add(tsConfig.compilerOptions.outDir).save();

	const eslintRc = yaml('.eslintrc.yml');
	if (eslintRc.exists() && !eslintRc.get('parserOptions.project')) {
		pkg.setScript('lint', 'eslint . --ext ts').save();
		const data = eslintRc.merge({ parserOptions: { project: 'tsconfig.json' } }).get();
	}

	install(dependencies);
	format(['tsconfig.json', '.eslintrc.yml', 'package.json']);

	if (isUsingYarnBerry()) {
		execCommand('yarn', ['dlx', '@yarnpkg/pnpify', '--sdk', 'base']);
	}
};
module.exports.description = 'Adds TypeScript to the project';
