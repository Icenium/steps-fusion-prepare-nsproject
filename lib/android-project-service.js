"use strict";

const path = require('path');
const fs = require('fs');
const constants = require('./constants');

class AndroidProjectService {
	prepare(projectPath, downloads, buildRequest) {
		let uploadCandidates = this._getUploadCandidates(projectPath, buildRequest);

		uploadCandidates.forEach(upload => {
			if (fs.existsSync(upload.source)) {
				console.log(`Deleting previous build result file: ${upload.source}`);
				fs.unlinkSync(upload.source);
			}
		});

		const buildArgs = [
			projectPath,
			downloads[constants.DISPOSITIONS.PACKAGE_GIT] ? null : downloads[constants.DISPOSITIONS.PACKAGE_ZIP],
			downloads[constants.DISPOSITIONS.CRYPTO_STORE]
		];

		return this._prepareBuildArgs(...buildArgs)
	}

	_getUploadCandidates(projectPath, buildRequest) {
		const manifestFile = path.join(projectPath, "AndroidManifest.xml");
		const configuration = buildRequest.args.buildConfiguration;
		const apkFile = path.join(projectPath, 'bin', `${buildRequest.args.projectName}-${configuration.toLowerCase()}.apk`);

		const result = [
			{ source: apkFile, targetSuffix: buildRequest.args.projectName + '.apk' },
			{ source: manifestFile, targetSuffix: 'AndroidManifest.xml', disposition: "AdditionalFile" }
		];

		if (buildRequest.args.exportNativeProject) {
			const nativeProjectArchivePath = path.join(projectPath, constants.NATIVE_PROJECT_ARCHIVE_NAME);
			result.push({ source: nativeProjectArchivePath, targetSuffix: constants.NATIVE_PROJECT_ARCHIVE_NAME, disposition: "AdditionalFile" })
		}

		return result;
	}

	_prepareBuildArgs(projectPath, packageFilePath, cryptoStoreFilePath) {
		const buildArgs = {
			projectPath: projectPath,
			zipPath: packageFilePath,
			nativeProjectArchiveName: constants.NATIVE_PROJECT_ARCHIVE_NAME
		};
		if (cryptoStoreFilePath) {
			buildArgs.srcKeyStorePath = cryptoStoreFilePath;
		}

		return buildArgs;
	}
}

module.exports.AndroidProjectService = AndroidProjectService;
