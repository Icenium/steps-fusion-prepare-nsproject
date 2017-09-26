const fs = require("fs");
const url = require("url");
const AWS = require("aws-sdk");
const _ = require("lodash");

class AwsS3 {
	constructor(storageConfiguration) {
		this.storageConfiguration = storageConfiguration
	}

	download(sourceUri, destinationFilePath) {
		this._updateConfig(this.storageConfiguration);
		const s3 = new AWS.S3();
		return new Promise((resolve, reject) => {
			const requestData = this._objectRequestFromUri(sourceUri);
			const request = s3.getObject(requestData);

			request.on("error", (err) => {
				reject(err);
			});
			let responseData;
			request.on("success", (response) => {
				responseData = response.data;
			});

			const destinationFile = fs.createWriteStream(destinationFilePath);
			destinationFile.on("error", (err) => {
				reject(err);
			});
			destinationFile.on("finish", () => {
				resolve(responseData);
			});

			request.createReadStream()
				.on("error", (err) => {
					reject(err);
				})
				.pipe(destinationFile);
		});
	}

	fileExists(sourceUri) {
		this._updateConfig(this.storageConfiguration);
		const s3 = new AWS.S3();
		return new Promise((resolve, reject) => {
			const requestData = this._objectRequestFromUri(sourceUri);
			s3.headObject(requestData, (err, data) => resolve(!err));
		});
	}

	_updateConfig(storageConfiguration) {
		AWS.config.update(storageConfiguration);
	}

	_objectRequestFromUri(uri) {
		const parsedUri = url.parse(uri),
			requestData = {
				Bucket: parsedUri.hostname,
				Key: unescape(parsedUri.pathname.substr(1)),
			};
		console.log(requestData, { parameterName: "requestData", function: this._objectRequestFromUri.name, fileName: __filename });
		return requestData;
	}
}

module.exports.AwsS3 = AwsS3;
