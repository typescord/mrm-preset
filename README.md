# Mrm Preset

Typescord preset for [mrm](https://github.com/sapegin/mrm) to easily init projects and keep configuration files in-sync.

### Getting started

```sh
npm install mrm @typescord/mrm-preset --save-dev
# or with Yarn
yarn add mrm @typescord/mrm-preset -D
```

Add script to `package.json` file:

```json
{
	"scripts": {
		"mrm": "mrm --preset @typescord/mrm-preset"
	}
}
```

Run tasks:

```sh
npm run mrm all --interactive # or task1 task2 etc.
# or with Yarn
yarn mrm all --interactive # or task1 task2 etc.
```
`--interactive`, `-i` : to have the questions in an interactive way (instead of `--config:foo bar --config:foo1 bar1 etc.`).

### Available tasks

- **all** (alias) : runs respectively **license**, **gitignore**, **editorconfig**, **beauty**, **package**, **typescript**, **jest** and **ci**
- **base** (alias) : runs respectively **license**, **gitignore**, **editorconfig**, **beauty** and **package**
- **beauty** : setups ESLint and Prettier
- **ci** : setups GitHub Actions
- **editorconfig** : setups a EditorConfig file
- **gitignore** : setups a Gitignore file
- **jest** : setups Jest (and ts-jest if TypeScript is setup)
- **license** : setups a MIT license
- **package** : setups a complete package.json file
- **typescript** : setups TypeScript
