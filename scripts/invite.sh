
if [ ! -f "cookies" ]; then 
    echo "Cookies file not found"
    exit 1
fi

recipient="sdf98080aj3241k3lk3j"

curl "http://localhost:3000/api/invitations" \
    --request POST \
    --header "Content-Type: application/json" \
    --data '{ "recipientId": "sdf98080aj3241k3lk3j", "teamId": "cmhb4adlz0000mwrmc4gtg5re" }' \
    --cookie cookies
