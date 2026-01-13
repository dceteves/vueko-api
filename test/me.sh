#!/usr/bin/bash

if [ ! -f "cookies" ]; then 
    echo "Cookies file not found"
    exit 1
fi

curl -b cookies localhost:3000/api/me
