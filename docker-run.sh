#!/bin/sh

# Get current git branch
BRANCH=$(git rev-parse --abbrev-ref HEAD)

docker build -t youtube-music-quiz:$BRANCH .

# Run the container
echo "Running container with branch: $BRANCH"

docker run -it youtube-music-quiz:$BRANCH
