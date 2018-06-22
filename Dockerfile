FROM node:6

# https://github.com/aws/aws-cli/issues/2290
RUN apt-get update && apt-get install -y jq && apt-get install -y python-pip libpython-dev && pip install awscli
