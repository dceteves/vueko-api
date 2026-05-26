#!/usr/bin/bash

if [ ! -f "cookies" ]; then
    echo "Cookies file not found. Exiting"
    exit 1 
fi

curl -b "cookies" localhost:3000/api/logout &>/dev/null
rm "cookies"
