#!/bin/sh

if [ -z "$IN_DEVCONTAINER" ]; then
    # Not in the dev container, exit the script
    exit
fi

npm run --watch start
