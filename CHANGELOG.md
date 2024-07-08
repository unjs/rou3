# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## v0.2.0

[compare changes](https://github.com/unjs/rou3/compare/v0.1.0...v0.2.0)

### 🩹 Fixes

- **matcher:** Match param in last segment ([#110](https://github.com/unjs/rou3/pull/110))

### 💅 Refactors

- ⚠️  Unify apis with `method, path` order ([#114](https://github.com/unjs/rou3/pull/114))
- **matcher:** Improve readability ([af7af4d](https://github.com/unjs/rou3/commit/af7af4d))

### 🏡 Chore

- Fix coverage report ([4aad1cb](https://github.com/unjs/rou3/commit/4aad1cb))
- More strict tsconfig ([164efa2](https://github.com/unjs/rou3/commit/164efa2))
- Add bundle size badge ([a540ceb](https://github.com/unjs/rou3/commit/a540ceb))

### ✅ Tests

- Update matcher tests ([c81d596](https://github.com/unjs/rou3/commit/c81d596))

#### ⚠️ Breaking Changes

- ⚠️  Unify apis with `method, path` order ([#114](https://github.com/unjs/rou3/pull/114))

### ❤️ Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))

## v0.1.0

[compare changes](https://github.com/unjs/rou3/compare/v1.1.2...v0.1.0)

### 🚀 Enhancements

- ⚠️  Support mixed params in same path segment ([#52](https://github.com/unjs/rou3/pull/52))

### 🔥 Performance

- **add:** Use string check for multi param ([a41fd7b](https://github.com/unjs/rou3/commit/a41fd7b))
- Remove strict trailing slash ([#111](https://github.com/unjs/rou3/pull/111))

### 🩹 Fixes

- Use `Map.size` to calculate the number of children ([#73](https://github.com/unjs/rou3/pull/73))
- ⚠️  Fallback to dynamic matcher if last segment didn't match ([#110](https://github.com/unjs/rou3/pull/110))

### 💅 Refactors

- ⚠️  Rewrite library ([#107](https://github.com/unjs/rou3/pull/107))

### 🏡 Chore

- Rebase with v1 ([641ff03](https://github.com/unjs/rou3/commit/641ff03))
- Update ci ([f9039f0](https://github.com/unjs/rou3/commit/f9039f0))
- Apply automated updates ([9e19e22](https://github.com/unjs/rou3/commit/9e19e22))
- Update deps ([6d263d5](https://github.com/unjs/rou3/commit/6d263d5))
- Update eslint to v9 ([296132b](https://github.com/unjs/rou3/commit/296132b))
- Update pkg ([21db3d7](https://github.com/unjs/rou3/commit/21db3d7))
- Apply automd ([4555c62](https://github.com/unjs/rou3/commit/4555c62))
- Update benchmarks ([9a96709](https://github.com/unjs/rou3/commit/9a96709))
- Update benchmarks ([ec945ab](https://github.com/unjs/rou3/commit/ec945ab))
- Update bench scripts ([51b3ffc](https://github.com/unjs/rou3/commit/51b3ffc))
- Update bench ([d46484e](https://github.com/unjs/rou3/commit/d46484e))
- Update bench ([830e4bc](https://github.com/unjs/rou3/commit/830e4bc))
- Apply automated updates ([f30eba1](https://github.com/unjs/rou3/commit/f30eba1))
- Remove unused code ([f03bdb0](https://github.com/unjs/rou3/commit/f03bdb0))
- Update bench ([487c8e0](https://github.com/unjs/rou3/commit/487c8e0))

### ✅ Tests

- Mark test for #96 with skip ([#96](https://github.com/unjs/rou3/issues/96))
- Add tests from #103 ([#103](https://github.com/unjs/rou3/issues/103))

#### ⚠️ Breaking Changes

- ⚠️  Support mixed params in same path segment ([#52](https://github.com/unjs/rou3/pull/52))
- ⚠️  Fallback to dynamic matcher if last segment didn't match ([#110](https://github.com/unjs/rou3/pull/110))
- ⚠️  Rewrite library ([#107](https://github.com/unjs/rou3/pull/107))

### ❤️ Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))
- Andrew Walsh ([@AndrewWalsh](http://github.com/AndrewWalsh))

## v1.1.2

[compare changes](https://github.com/unjs/radix3/compare/v1.1.1...v1.1.2)

### 🩹 Fixes

- Consider max depth when multiple placeholders are candidate ([#96](https://github.com/unjs/radix3/pull/96))

### 🏡 Chore

- Use `npm publish` ([d4a245b](https://github.com/unjs/radix3/commit/d4a245b))

### ❤️ Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))

## v1.1.1

[compare changes](https://github.com/unjs/radix3/compare/v1.1.0...v1.1.1)

### 🩹 Fixes

- **toRouteMatcher:** Respect non strict trailing slash ([#91](https://github.com/unjs/radix3/pull/91))
- **matcher:** Avoid prefix overlap for wildcards ([#92](https://github.com/unjs/radix3/pull/92))

### 💅 Refactors

- Strict type checks ([ad79316](https://github.com/unjs/radix3/commit/ad79316))

### 🏡 Chore

- **release:** V1.1.0 ([c04bc04](https://github.com/unjs/radix3/commit/c04bc04))
- Update dependencies ([c953444](https://github.com/unjs/radix3/commit/c953444))
- Run ci against `v1` branch too ([aaf0771](https://github.com/unjs/radix3/commit/aaf0771))
- Update dev dependencies ([ff6faab](https://github.com/unjs/radix3/commit/ff6faab))
- Apply automated updates ([8e4a5bb](https://github.com/unjs/radix3/commit/8e4a5bb))

### 🎨 Styles

- Format with prettier v3 ([e77a5d5](https://github.com/unjs/radix3/commit/e77a5d5))

### 🤖 CI

- Add autofix script ([c314b40](https://github.com/unjs/radix3/commit/c314b40))

### ❤️ Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))

## v1.1.0

[compare changes](https://github.com/unjs/radix3/compare/v1.0.1...v1.1.0)


### 🚀 Enhancements

  - Allow exporting/importing matchers ([#62](https://github.com/unjs/radix3/pull/62))

### ❤️  Contributors

- Daniel Roe <daniel@roe.dev>

## v1.0.1

[compare changes](https://github.com/unjs/radix3/compare/v1.0.0...v1.0.1)


### 🩹 Fixes

  - **matchAll:** Sort route with same type ([#45](https://github.com/unjs/radix3/pull/45))

### 🏡 Chore

  - **readme:** Improvements ([75fc5c5](https://github.com/unjs/radix3/commit/75fc5c5))
  - **readme:** Use correct link ([58b49a7](https://github.com/unjs/radix3/commit/58b49a7))
  - Update lockfile ([a423c97](https://github.com/unjs/radix3/commit/a423c97))

### 🎨 Styles

  - Format with prettier ([3eababa](https://github.com/unjs/radix3/commit/3eababa))

### ❤️  Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))
- Sébastien Chopin <seb@nuxtlabs.com>

## [1.0.0](https://github.com/unjs/radix3/compare/v0.2.1...v1.0.0) (2022-11-15)


### Bug Fixes

* dynamic route deletion ([#22](https://github.com/unjs/radix3/issues/22)) ([8328f87](https://github.com/unjs/radix3/commit/8328f87a241ab9f7ceabc0e0d2c23dfd456f3c3c))

### [0.1.2](https://github.com/unjs/radix3/compare/v0.1.1...v0.1.2) (2022-05-04)


### Features

* match wildcard param ([9498610](https://github.com/unjs/radix3/commit/9498610c18e5f10a3780f9653cb1dca8157c0e21))
* named wildcard routes ([2c681b4](https://github.com/unjs/radix3/commit/2c681b41ab787f7f33b910d86253761814e39910))

### 0.1.1 (2022-03-09)


### Features

* support unnamed placeholders with single * ([5900b13](https://github.com/unjs/radix3/commit/5900b135ef6a255713356c242455d837fd295751))
