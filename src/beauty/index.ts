import { json, lines, packageJson, yaml } from 'mrm-core';

import { execCommand, format, install, isUsingYarn, isUsingYarnBerry } from '../utils';

const dependencies = [
	'@typescord/eslint-config',
	'@typescord/prettier-config',
	'@typescript-eslint/eslint-plugin',
	'@typescript-eslint/parser',
	'eslint',
	'eslint-config-prettier',
	'eslint-plugin-import',
	'eslint-plugin-prettier',
	'eslint-plugin-simple-import-sort',
	'eslint-plugin-sonarjs',
	'eslint-plugin-unicorn',
	'prettier',
];

module.exports = function task() {
	const usingYarnBerry = isUsingYarnBerry();
	const usingYarn = isUsingYarn();
	const tsConfig = json('tsconfig.json');
	const tsConfigExists = tsConfig.exists();

	lines('.prettierignore')
		.add(['.vscode', ...(usingYarnBerry ? ['.yarn', '.yarnrc.yml', '.pnp.*'] : [])])
		.save();

	yaml('.eslintrc.yml')
		.merge({
			root: true,
			extends: ['@typescord', 'plugin:prettier/recommended', 'prettier/@typescript-eslint'],
			plugins: ['prettier'],
			parserOptions: tsConfigExists ? { project: 'tsconfig.json' } : undefined,
			rules: { 'prettier/prettier': 'error' },
			env: { node: true, es2020: true },
		})
		.save();

	packageJson()
		.set('prettier', '@typescord/prettier-config')
		.setScript('lint', `eslint . --ext ${tsConfigExists ? 'ts' : 'js'}`)
		.setScript('lint-fix', `${usingYarn ? 'yarn lint' : 'npm run lint --'} --fix`)
		.setScript('format', `prettier . ${usingYarn ? '' : '-- '}--write`)
		.save();

	install(dependencies);
	format(['.eslintrc.yml', 'package.json']);

	if (usingYarnBerry) {
		execCommand('yarn', ['dlx', '@yarnpkg/pnpify', '--sdk', 'base']);
	}
};
module.exports.description = 'Adds ESLint and Prettier to the project';
