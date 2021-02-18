# Mrm Preset

Typescord preset for [mrm](https://github.com/sapegin/mrm) to easily init projects and keep configuration files in-sync.

### Getting started

```sh
npm install @typescord/mrm-preset --save-dev
# or with Yarn
yarn add @typescord/mrm-preset -D
```

Add script to `package.json` file:

```json
{
	"scripts": {
		"mrm": "mrm --preset=@typescord/mrm-preset -i"
	}
}
```

Run tasks:

```sh
npm run mrm all # or task1 task2 etc.
# or with Yarn
yarn mrm all # or task1 task2 etc.
```

### Available tasks

- **all** (alias) : runs all the following tasks
- **beauty** : setups ESLint and Prettier
- **ci** : setups GitHub Actions
- **editorconfig** : setups a EditorConfig file
- **gitignore** : setups a Gitignore file
- **jest** : setups Jest (and ts-jest if TypeScript is setup)
- **license** : setups a MIT license
- **package** : setups a complete package.json file
- **typescript** : setups TypeScript
