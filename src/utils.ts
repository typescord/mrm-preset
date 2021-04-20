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
	'files',
	'jest',
	'keywords',
];

export function cleanObject<T extends Record<PropertyKey, unknown>>(object: T): T {
	const finalObject: Record<PropertyKey, any> = {};

	for (const [keys, value] of deepIterOverObject(object)) {
		const lastKey = keys.pop()!;
		// eslint-disable-next-line unicorn/no-array-reduce
		const actualKeys = keys.reduce((base, key) => (base[key] ??= {}), finalObject);

		// eslint-disable-next-line eqeqeq, unicorn/no-null
		if (value == null) {
			continue;
		}

		if (Array.isArray(value)) {
			// eslint-disable-next-line eqeqeq, unicorn/no-null
			actualKeys[lastKey] = value.filter((element) => element != null);
		} else {
			actualKeys[lastKey] = value;
		}
	}

	return finalObject;
}

export function* deepIterOverObject(
	object: Record<PropertyKey, unknown>,
	trailingKeys: string[] = [],
): Generator<readonly [[...string[]], unknown]> {
	for (const [key, value] of Object.entries(object)) {
		if (typeof value === 'object' && !Array.isArray(value)) {
			yield* deepIterOverObject(value as Record<PropertyKey, unknown>, [...trailingKeys, key]);
		} else {
			yield [[...trailingKeys, key], value];
		}
	}
}

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

export function install(dependencies: string[]): void {
	const usingYarn = isUsingYarn() || isUsingYarnBerry();
	execCommand(usingYarn ? 'yarn' : 'npm', ['add', usingYarn ? '-D' : '--save-dev', ...dependencies]);
}

export function inquirerRequired(input: string | undefined): boolean {
	return !!input?.trim();
}
