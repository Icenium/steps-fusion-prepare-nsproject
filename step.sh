#!/bin/bash
THIS_SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo $THIS_SCRIPT_DIR/index.js
node "$THIS_SCRIPT_DIR/index.js" $REQUEST