#!/usr/bin/bash

[ -f "cookies" ] && ./logout.sh

curl -c cookies "localhost:3000/auth/login-test" &>/dev/null || echo "Error occurred"
