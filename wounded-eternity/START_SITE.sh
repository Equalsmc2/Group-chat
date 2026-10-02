#!/bin/sh
cd "$(dirname "$0")" || exit 1
printf 'Soul Seekers - The Wounded Eternity\nOpen http://localhost:8000 in your browser.\n'
python3 -m http.server 8000 --bind 127.0.0.1
