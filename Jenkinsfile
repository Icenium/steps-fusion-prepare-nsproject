#!groovy

@Library('jenkins-shared-library') _
def securityScanHelper = new com.progress.SecurityScanHelper()

node ("linux") {
    checkout scm
    def securityScanImage = docker.build("security-scan-image", ".")

    securityScanHelper.lint(securityScanImage)
    securityScanHelper.securityScan(securityScanImage)
}
