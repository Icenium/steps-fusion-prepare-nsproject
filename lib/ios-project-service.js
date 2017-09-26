"use strict";

const fs = require('fs');
const path = require('path');
const util = require('util');
const constants = require('./constants');

class IosProjectService {
	prepare(projectPath, downloads, buildRequest) {
		const uploadCandidates = this._getUploadCandidates(buildRequest);

		uploadCandidates.forEach(upload => {
			const filePath = path.join(projectPath, upload.relativePath);
			if (fs.existsSync(filePath)) {
				console.log(`Deleting previous build result file: ${filePath}`);
				fs.unlinkSync(filePath);
			}
		});

		const buildArgs = [
			projectPath,
			downloads[constants.DISPOSITIONS.PACKAGE_GIT] ? null : downloads[constants.DISPOSITIONS.PACKAGE_ZIP],
			downloads[constants.DISPOSITIONS.PROVISION],
			downloads[constants.DISPOSITIONS.KEYCHAIN],
			downloads[constants.DISPOSITIONS.PROVISIONS_PACKAGE_ZIP]
		];
		return this._prepareBuildArgs(...buildArgs)
	}

	_getUploadCandidates(buildRequest) {
		const result = [
			{ relativePath: constants.DEFAULT_BUILD_RESULT_FILE_NAMES.SIMULATOR },
			{ relativePath: constants.DEFAULT_BUILD_RESULT_FILE_NAMES.DEVICE },
			// Uploads Cordova Info.plist because it's located in a templateAppName directory
			{
				relativePath: `${buildRequest.args.templateAppName}/${buildRequest.args.templateAppName}-Info.plist`,
				destinationFileName: constants.INFO_PLIST,
				disposition: constants.DISPOSITIONS.ADDITIONAL_FILE
			},
			// Uploads NativeScript Info.plist because it's in the root of the app Directory
			{
				relativePath: constants.INFO_PLIST,
				destinationFileName: constants.INFO_PLIST,
				disposition: constants.DISPOSITIONS.ADDITIONAL_FILE
			},
			{ relativePath: constants.NATIVE_PROJECT_ARCHIVE_NAME },
		];

		const otherDeviceBuildResult = `${buildRequest.args.templateAppName}.ipa`;
		if (otherDeviceBuildResult !== constants.DEFAULT_BUILD_RESULT_FILE_NAMES.DEVICE) {
			result.push({ relativePath: otherDeviceBuildResult });
		}

		const otherSimulatorBuildResult = `${buildRequest.args.templateAppName}.zip`;
		if (otherSimulatorBuildResult !== constants.DEFAULT_BUILD_RESULT_FILE_NAMES.SIMULATOR) {
			result.push({ relativePath: otherSimulatorBuildResult });
		}

		return result;
	}

	_prepareBuildArgs(projectPath, packageFilePath, provisionFilePath, keychainFilePath, provisionsPackageZip) {
		return {
			projectPath: projectPath,
			zipPath: packageFilePath,
			provisionFile: provisionFilePath,
			keyFilePath: keychainFilePath,
			provisionsPackageZip: provisionsPackageZip,
			nativeProjectArchiveName: constants.NATIVE_PROJECT_ARCHIVE_NAME
		};
	}
}

module.exports.IosProjectService = IosProjectService;
