import { spawnSync } from 'child_process';
import { Stats, statSync } from 'fs';
import { platform } from 'os';
import { packageJson } from 'mrm-core';

const isUsingWindows = platform() === 'win32';
const PackagePropertiesOrder = [
	'name',
	'description',
	'version',
	'private',
	'main',
	'prettier',
	'scripts',
	'engines',
	'license',
	'repository',
	'homepage',
	'bugs',
	'dependencies',
	'peerDependencies',
	'devDependencies',
	'files',
	'jest',
	'keywords',
];

function escapeArguments(args: string[]): string[] {
	return isUsingWindows ? args.map((arg) => arg.replaceAll('^', '^^^^')) : args;
}

export function execCommand(command: string, args: string[] = []): void {
	spawnSync(isUsingWindows ? `${command}.cmd` : command, escapeArguments(args), {
		stdio: 'inherit',
		cwd: process.cwd(),
	});
}

export function orderProperties<T extends Record<string, unknown>>(object: T, order: string[]): T {
	const ordered: Partial<T> = {};
	for (const key of Object.keys(object).sort((a, b) => order.indexOf(a) - order.indexOf(b)) as (keyof T)[]) {
		ordered[key] = object[key];
	}
	return ordered as Required<T>;
}

export function format(files: string[]): void {
	const pkg = packageJson();
	if (!pkg.exists() || (!pkg.get('prettier') && !files.includes('package.json'))) {
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

export function install(dependencies: string[]): void {
	const usingYarn = isUsingYarn() || isUsingYarnBerry();
	execCommand(usingYarn ? 'yarn' : 'npm', ['add', usingYarn ? '-D' : '--save-dev', ...dependencies]);
}

export function inquirerRequired(input: string): boolean {
	return !!input;
}
