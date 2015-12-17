ffmpeg -ss 00:00:05 -i %1 -frames:v 1 "%~n1.png"
ffmpeg -i %1 "%~n1.mp4"
ffmpeg -i %1 "%~n1.webm"