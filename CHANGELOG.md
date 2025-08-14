# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.0.3] - 2025-08-14

### Fixed
- 🐛 Move relationship meta to `meta.relationships.nomeRelazione` when no data present
- 🐛 Fix relationship handling when no data, links, or meta are provided
- 🐛 Preserve relationship meta in wrapper when data is present

### Changed
- 💡 Improve relationship meta handling logic
- 💡 Update test cases to reflect new behavior
- 💡 Revert compatibility with old version

## [3.0.2] - 2025-08-14

### Added
- 🎡 Add Dependabot configuration for npm and GitHub Actions
- 🎡 Add GitHub Actions workflow for automated releases
- 🎡 Add automated npm publishing on release

### Changed
- ⚡️ Update mocha to v11.7.1 to resolve deprecated dependencies
- ⚡️ Remove deprecated `inflight@1.0.6` dependency
- ⚡️ Update `glob` from v7.2.0 to v10.4.5

### Fixed
- 🐛 Resolve npm warnings about deprecated packages

## [3.0.0] - 2025-08-13

### Added
- ✨ Enhanced relationship meta handling
- ✨ Move relationship meta to `meta.relationships.nomeRelazione` when no data present
- ✨ Maintain full compatibility with original package
- ✨ Preserve relationship meta in original location when data is present

### Changed
- 💡 Improve relationship deserialization logic
- 💡 Better handling of relationships without data
- 💡 Update test suite to cover enhanced meta handling

## [2.0.0] - Original weillandia/deserialize-json-api

### Added
- ✨ Initial JSON:API deserializer implementation
- ✨ Support for included resources mapping
- ✨ Immutable response handling
- ✨ CamelCase key transformation option

### Features
- [{json:api} spec](https://jsonapi.org/) compliance
- Maps included objects to resources
- Does not mutate original response object
