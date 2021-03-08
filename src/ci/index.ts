import { packageJson, yaml } from 'mrm-core';
import { minVersion, satisfies } from 'semver';

import { format, isUsingYarn } from '../utils';

const NODE_MAJOR_VERSIONS = Array.from({ length: 15 }, (_, index) => (index + 1).toString());

module.exports = function task() {
	const pkg = packageJson();
	if (!pkg.getScript('lint') && !pkg.getScript('build') && !pkg.getScript('test')) {
		console.error('There is nothing to test with CI (lint, build, test).');
		return;
	}

	const version = pkg.get('engines.node', '>=15.0.0');
	const versions = NODE_MAJOR_VERSIONS.filter((nodeVersion) => satisfies(`${nodeVersion}.0.0`, version));
	let singleVersion = versions.length === 0 ? minVersion(version)?.version : undefined;
	if (!singleVersion && versions.length === 1) {
		singleVersion = versions[0];
	}
	const usingYarn = isUsingYarn();
	const scriptRunCmd = usingYarn ? 'yarn' : 'npm run';

	yaml('.github/workflows/main.yml')
		.merge({
			name: 'Continuous Integration',
			on: {
				push: {
					branches: ['main'],
					'paths-ignore': ['*.md', '*.txt', 'LICENSE', '.editorconfig', '.*ignore', '.vscode'],
					'tags-ignore': ['*'],
				},
				pull_request: {
					branches: ['*'],
					'paths-ignore': ['*.md', '*.txt', 'LICENSE', '.editorconfig', '.*ignore', '.vscode'],
				},
			},

			jobs: {
				main: {
					'runs-on': 'ubuntu-latest',

					strategy: singleVersion
						? undefined
						: {
								matrix: {
									'node-version': versions,
								},
						  },

					steps: [
						{ uses: 'actions/checkout@v2' },
						{
							name: `Use Node.js v${singleVersion ?? '${{ matrix.node-version }}'}`,
							uses: 'actions/setup-node@v2',
							with: {
								'node-version': singleVersion ?? '${{ matrix.node-version }}',
							},
						},

						{ name: 'Install dependencies', run: usingYarn ? 'yarn install --immutable' : 'npm ci' },

						pkg.getScript('lint') ? { name: 'Lint', run: `${scriptRunCmd} lint` } : undefined,
						pkg.getScript('build')
							? {
									name: 'Build',
									run: `${scriptRunCmd} build ${usingYarn ? '' : '-- '}--noEmit`,
							  }
							: undefined,
						pkg.getScript('test') ? { name: 'Test', run: `${scriptRunCmd} lint` } : undefined,
					],
				},
			},
		})
		.save();
	format(['.github/workflows/main.yml']);
};
module.exports.description = 'Adds Github Actions to the project';
