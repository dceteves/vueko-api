
if [ ! -f "cookies" ]; then 
    echo "Cookies file not found"
    exit 1
fi

curl --request POST --header "Content-Type: application/json" --data '{ "name": "test" }' --cookie cookies  "http://localhost:3000/api/teams" 
