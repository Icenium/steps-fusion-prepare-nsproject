"use strict";

module.exports = {
	DEFAULT_BUILD_RESULT_FILE_NAMES: {
		SIMULATOR: 'iphonesimulatorapp.zip',
		DEVICE: 'app.ipa'
	},
	NATIVE_PROJECT_ARCHIVE_NAME: 'nativeProject.tar.gz',
	LOGS_FILE_NAME: 'output.log',
	STATUS_FILE_NAME: 'status.json',
	RESULTS_FILE_NAME: 'results.json',
	INFO_PLIST: 'Info.plist',
	PRESIGN_URL_EXPIRE_TIME: 60 * 60 * 24 * 30,
	DISPOSITIONS: {
		PACKAGE_GIT: 'PackageGit',
		PACKAGE_ZIP: 'PackageZip',
		CRYPTO_STORE: 'CryptoStore',
		PROVISION: 'Provision',
		CERTIFICATE: 'Certificate',
		KEYCHAIN: 'Keychain',
		PROVISIONS_PACKAGE_ZIP: 'ProvisionsPackageZip',
		ADDITIONAL_FILE: 'AdditionalFile',
	},
	CONFIGURATION: {
		DEBUG: 'debug',
		RELEASE: 'release'
	},
	PLATFORM: {
		ANDROID: 'android'
	}
};
