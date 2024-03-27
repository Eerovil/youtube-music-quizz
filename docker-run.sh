#!/bin/sh

# Get env param
ENV=$1

# default env is dev
if [ -z "$ENV" ]; then
  ENV=dev
fi

docker build -t youtube-music-quiz:$ENV .

# Run the container
echo "Running container with branch: $ENV"

# Remove any existing container with the same name.
docker rm -f youtube-music-quiz-$ENV

# Use hostname alias youtube-music-quiz-$ENV.
docker run --rm --network tunnel --name youtube-music-quiz-$ENV -it youtube-music-quiz:$ENV
