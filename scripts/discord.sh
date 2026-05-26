#!/usr/bin/bash

source .env

CALLBACK="http%3A%2F%2Flocalhost%3A3000%2Fauth%2Fdiscord%2Flink%2Fcallback"

echo "https://discord.com/oauth2/authorize?client_id=$DISCORD_CLIENT_ID&redirect_uri=$CALLBACK&response_type=code&scope=identify"
