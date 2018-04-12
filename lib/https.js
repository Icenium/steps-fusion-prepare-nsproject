"use strict";

const fs = require("fs");
const request = require('request');

class Https {
	download(sourceUri, destinationFilePath) {
		return new Promise((resolve, reject) => {
			request.get(sourceUri)
				.pipe(fs.createWriteStream(destinationFilePath))
				.on('finish', () => {
					resolve(destinationFilePath);
				}).on('error', (err) => {
					reject(err);
				});
		});
	}

	fileExists(sourceUri) {
		return new Promise((resolve, reject) => {
			request.head(sourceUri)
				.on('response', (response) => {
					resolve(this._isHttpCodeSuccess(response.statusCode));
				})
				.on('error', (err) => {
					reject(err);
				});
		});
	}

	_isHttpCodeSuccess(code) {
		return 200 <= code && code < 300;
	}
}

module.exports.Https = Https;
