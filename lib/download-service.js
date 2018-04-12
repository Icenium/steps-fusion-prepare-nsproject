"use strict";

const crypto = require("crypto");
const path = require("path");
const url = require("url")

const constants = require('./constants');
const { AwsS3 } = require("./aws-s3");
const { Https } = require("./https");
const { CodeCommit } = require("./codecomit");


class DownloadService {
	constructor(storageConfiguration) {
		this.aws = new AwsS3(storageConfiguration);
		this.https = new Https();
		this.codeCommit = new CodeCommit();
		this.transferSchemeMetadata = {
			https: {
				download: this.https.download.bind(this.https),
				fileExists: this.https.fileExists.bind(this.https),
				defaultDisposition: constants.DISPOSITIONS.DEFAULT_DISPOSITION
			},
			s3: {
				download: this.aws.download.bind(this.aws),
				fileExists: this.aws.fileExists.bind(this.aws),
				defaultDisposition: constants.DISPOSITIONS.DEFAULT_DISPOSITION
			},
			codecommit: {
				download: this.codeCommit.download.bind(this.codeCommit),
				fileExists: this.codeCommit.fileExists.bind(this.codeCommit),
				getDownloadDestination: this.codeCommit.getDownloadDestination.bind(this.codeCommit),
				defaultDisposition: constants.DISPOSITIONS.DEFAULT_DISPOSITION
			},
		};
	}

	download(sourceUri, destinationFilePath) {
		return this._getTransferMethods(sourceUri).download(sourceUri, destinationFilePath);
	}

	getDownloadDestination(sourceUri, args) {
		const getDefaultDownloadDestination = () => path.basename(url.parse(sourceUri).pathname);
		const method = this._getTransferMethods(sourceUri).getDownloadDestination || getDefaultDownloadDestination;

		return method(sourceUri, args);
	}

	_getTransferMethods(uri) {
		const proto = url.parse(uri).protocol.replace(":", "");
		return this.transferSchemeMetadata[proto || "https"];
	}
}

module.exports.DownloadService = DownloadService;
