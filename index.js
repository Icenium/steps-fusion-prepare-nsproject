"use strict";

const path = require("path");
const _ = require("lodash");
const child_process = require("child_process");
const constants = require("./lib/constants");

const { DownloadService } = require("./lib/download-service");
const { IosProjectService } = require("./lib/ios-project-service");
const { AndroidProjectService } = require("./lib/android-project-service");

const jsonArgv = new Buffer(process.argv[2], "base64").toString("utf8");
const request = JSON.parse(jsonArgv);
const workspacePath = request.args.workspacePath;
const downloads = {};
const projectService = request.args.platform.toLowerCase() === constants.PLATFORM.ANDROID ?
	new AndroidProjectService() : new IosProjectService();
const downloadService = new DownloadService(request.storageConfiguration);

return Promise.resolve()
	.then(() => {
		const downloadRequests = [];
		request.files.forEach((fileDesc) => {
			const filePath = path.join(path.dirname(workspacePath), downloadService.getDownloadDestination(fileDesc.sourceUri, request.args));
			fileDesc.fullPath = filePath;
			downloadRequests.push(
				downloadService.download(fileDesc.sourceUri, filePath));
			downloads[fileDesc.disposition] = filePath;
		});

		return downloadRequests;
	})
	.then((downloadRequests) => Promise.all(downloadRequests))
	.then(() => projectService.prepare(workspacePath, downloads, request))
	.then((buildArgs) => {
		_.extend(buildArgs, request.args);
		buildArgs.isSandboxDisabled = true;
		return buildArgs;
	})
	.then((buildArgs) => {
		const base64Args = new Buffer(JSON.stringify(buildArgs)).toString("base64");
		child_process.spawnSync("envman", ["add", "--key", "BUILD_ARGS", "--value", `${base64Args}`]);
		child_process.spawnSync("envman", ["add", "--key", "PROJECT_PATH", "--value", `${buildArgs.projectPath}`]);
	})
	.catch(err => console.log(`Error: ${err}`));
