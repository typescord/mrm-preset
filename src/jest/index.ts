import { dirname } from 'path';
import { json, packageJson } from 'mrm-core';

import { format, install } from '../utils';

module.exports = function task() {
	const dependencies = ['jest'];
	const tsConfig = json('tsconfig.json');
	const pkg = packageJson();
	const jestConfig: Record<string, string> = { testEnvironment: 'node' };

	pkg.setScript('test', 'jest');

	if (tsConfig.exists()) {
		const include = tsConfig.get('include')?.[0];
		const testDirectory = `${include ? dirname('include') : 'src/**'}/__tests__`;
		tsConfig.merge({ include: [`${testDirectory}/*.ts`] }).save();

		json('tsconfig.prod.json')
			.merge({ extends: './tsconfig.json', exclude: [testDirectory] })
			.save();

		pkg.setScript('build', 'tsc -p tsconfig.prod.json');
		dependencies.push((jestConfig.preset = 'ts-jest'));
	}
	pkg.set('jest', jestConfig).save();

	install(dependencies);
	format(['tsconfig.json', 'tsconfig.prod.json', 'package.json']);
};
module.exports.description = 'Adds Jest to the project';
