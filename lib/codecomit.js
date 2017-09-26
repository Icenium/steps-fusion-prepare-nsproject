"use strict";

const fs = require("fs");
const path = require("path");
const mkdirp = require("mkdirp");
const childProcess = require("child_process");

class CodeCommit {
	download(sourceUri, destinationDir) {
		const repoCredentials = this._parseRepoCredentialsFromUrl(sourceUri);
		const env = Object.assign({}, process.env, {
			AWS_ACCESS_KEY_ID: repoCredentials.accessKeyId,
			AWS_SECRET_ACCESS_KEY: repoCredentials.secretAccessKey,
			AWS_SESSION_TOKEN: repoCredentials.sessionToken,
		});
		let cwd;
		let gitCmd;

		if (fs.existsSync(path.join(destinationDir, ".git"))) {
			cwd = destinationDir;
			gitCmd = `git fetch -q --depth=1 && git reset -q --hard origin/master`
		} else {
			cwd = path.dirname(destinationDir);
			mkdirp.sync(cwd);
			gitCmd = `rm -rf ${destinationDir} && git clone -q --recursive -b master --depth=1 ${repoCredentials.cloneUrl} ${destinationDir}`;
		}

		console.log(`Downloading from git with: ${gitCmd}`);
		return this._configureEnvironment()
			.then(() => this._exec(gitCmd, { cwd, env }));
	}

	fileExists(sourceUri) {
		throw new Error("unsupported");
	}

	getDownloadDestination(sourceUri, args) {
		return args.templateAppName;
	}

	_parseRepoCredentialsFromUrl(url) {
		// codecommit:<accessKeyId>;<secretAccessKey>;<sessionToken>@<cloneUrl>
		const matches = url.match(/(?:codecommit:)?(.*?);(.*?);(.*?)@(.*)$/);

		if (!matches) {
			throw new Error(`Can't parse url ${url}`);
		}

		return {
			accessKeyId: matches[1],
			secretAccessKey: matches[2],
			sessionToken: matches[3],
			cloneUrl: matches[4],
		};
	}

	_configureEnvironment() {
		// Allow write access to group but still deny to others (default is 022)
		//process.umask("0002");

		const gitConfigCmd =
			`git config --global credential.helper '!aws codecommit credential-helper \\$@'; ` +
			`git config --global credential.UseHttpPath true`;

		return this._exec(gitConfigCmd, {});
	}

	_exec(command, options) {
		console.log(`Executing: ${command} with opts: ${options}`);
		return new Promise((resolve, reject) => {
			childProcess.exec(command, options, (error, stdout, stderr) => {
				if (error) {
					console.error(`exec error: ${error}`);
					return reject(error);
				}

				resolve(stdout)
			});
		});
	}
}

module.exports.CodeCommit = CodeCommit;
