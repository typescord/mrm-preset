import { spawnSync } from 'child_process';
import { Stats, statSync } from 'fs';
import { packageJson } from 'mrm-core';

const PackagePropertiesOrder = [
	'name',
	'description',
	'version',
	'private',
	'main',
	'types',
	'prettier',
	'scripts',
	'engines',
	'author',
	'maintainers',
	'license',
	'repository',
	'homepage',
	'bugs',
	'dependencies',
	'peerDependencies',
	'devDependencies',
	'jest',
	'binary',
	'files',
	'keywords',
];

export function execCommand(command: string, args: string[] = []): void {
	spawnSync(command, args, {
		stdio: 'inherit',
		cwd: process.cwd(),
	});
}

export function orderProperties<T extends Record<string, unknown>>(object: T, order: string[]): T {
	const ordered: Partial<T> = {};
	for (const key of Object.keys(object).sort((a, b) => order.indexOf(a) - order.indexOf(b)) as (keyof T)[]) {
		ordered[key] = object[key];
	}
	return ordered as T;
}

export function format(files: string[]): void {
	const pkg = packageJson();
	if (!pkg.exists() || !(pkg.get('prettier') && files.includes('package.json'))) {
		return;
	}

	console.log('Formatting...');

	if (files.includes('package.json')) {
		pkg.set(orderProperties(pkg.get(), PackagePropertiesOrder)).save();
	}

	if (pkg.get('prettier')) {
		const usingYarn = isUsingYarn();
		execCommand(usingYarn ? 'yarn' : 'npx', [
			'prettier',
			...(usingYarn ? [] : ['--no-install', '--']),
			...files,
			'--write',
		]);
	}
}

export function fsStat(filename: string): Stats | undefined {
	try {
		return statSync(filename);
		// eslint-disable-next-line no-empty
	} catch {}
}

export function isUsingYarn(): boolean {
	return fsStat('yarn.lock')?.isFile() ?? false;
}

export function isUsingYarnBerry(): boolean {
	return fsStat('.yarnrc.yml')?.isFile() ?? false;
}

export function install(dependencies: string[], development = true): void {
	const usingYarn = isUsingYarn() || isUsingYarnBerry();
	const args = ['add', ...dependencies];
	if (development) {
		args.push(usingYarn ? '-D' : '--save-dev');
	}
	execCommand(usingYarn ? 'yarn' : 'npm', args);
}

export function inquirerRequired(input: string | undefined): boolean {
	return !!input?.trim();
}
