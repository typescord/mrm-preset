import { renameSync } from 'fs';
import { URL } from 'url';
import { file, json, lines, packageJson } from 'mrm-core';
import { execCommand, format, fsStat, install, isUsingYarnBerry } from '../utils';

const addonCpp = `#include <napi.h>

using namespace Napi;

String HelloWorld(const CallbackInfo& args) {
  return String::New(args.Env(), "Hello world!");
}

Object Init(Env env, Object exports) {
  exports.Set("helloWorld", Napi::Function::New(env, HelloWorld));
  return exports;
}

NODE_API_MODULE(NODE_GYP_MODULE_NAME, Init);`;

const bindingGyp = `{
  'targets': [
    {
      'target_name': '<(module_name)',
      'product_dir': '<(module_path)',
      'sources': [
        'src/addon.cc',
      ],
      'include_dirs': [
        '<!@(node -p "require(\\'node-addon-api\\').include")',
      ],
			'cflags!': ['-fno-exceptions'],
      'cflags_cc!': ['-fno-exceptions'],
      'cflags': ['-Wall', '-Wextra'],
      'defines': ['NAPI_DISABLE_CPP_EXCEPTIONS'],
    },
  ],
}`;

module.exports = function task() {
	const pkg = packageJson();
	const tsConfig = json('tsconfig.json');
	const gitignore = lines('.gitignore');

	const name = pkg.get('name', '');
	const nameSlashIndex = name.indexOf('/');

	pkg
		.merge({
			binary: {
				// sanitize name
				module_name: nameSlashIndex === -1 ? name : name.slice(nameSlashIndex + 1),
				module_path: './prebuild/{node_abi}-napi-v{napi_build_version}-{platform}-{arch}-{libc}/',
				remote_path: 'v{version}',
				package_name: '{module_name}-v{version}-{node_abi}-napi-v{napi_build_version}-{platform}-{arch}-{libc}.tar.gz',
				host: `https://github.com/${new URL(pkg.get('homepage')).pathname.slice(1).split('/', 2)}/releases/download/`,
				napi_versions: [3],
			},
		})
		.set('files', ['src', 'binding.gyp']);

	gitignore.add(['build', 'prebuild', 'build-tmp*']);

	if (fsStat('src')?.isDirectory()) {
		renameSync('src', 'lib');
	}

	const toFormat = ['package.json'];

	if (tsConfig.exists()) {
		const outDirectory = tsConfig.get('compilerOptions.outDir');
		pkg
			.set('main', pkg.get('main').replace(outDirectory, 'dist'))
			.setScript('prepublish', pkg.getScript('prepublish') + '-ts')
			.setScript('build-ts', pkg.getScript('build').replace(outDirectory, 'dist'))
			.merge({ files: ['dist'] });
		tsConfig.set('compilerOptions.outDir', 'dist');
		gitignore.add('dist');

		file('lib/index.ts').save(`${
			fsStat('.eslintrc.yml')?.isFile() ? '/* eslint-disable  @typescript-eslint/no-var-requires */\n' : ''
		}import { join } from 'path';
import { find } from '@mapbox/node-pre-gyp';
const addon = require(find(join(__dirname, '../package.json')));

export function helloWorld(): string {
	return helloWorld();
}`);
		toFormat.push('lib/index.ts');
	} else {
		pkg.set('main', pkg.get('main').replace('src', 'lib')).merge({ files: ['lib'] });

		file('lib/index.js').save(`const { join } = require('path');
const { find } = require('@mapbox/node-pre-gyp');
const addon = require(find(join(__dirname, '../package.json')));

module.exports.helloWorld = addon.helloWorld;`);
		toFormat.push('lib/index.js');
	}

	pkg
		.setScript('install', 'node-pre-gyp install --fallback-to-build')
		.setScript('build', 'node-pre-gyp install build package')
		.save();

	file('src/addon.cc').save(addonCpp);
	file('binding.gyp').save(bindingGyp);

	install(['@mapbox/node-pre-gyp', 'node-addon-api', 'node-gyp'], false);
	if (isUsingYarnBerry()) {
		execCommand('yarn', ['unplug', 'node-addon-api']);
	}

	format(toFormat);
};
module.exports.description = 'Adds node-addon-api to the project';
