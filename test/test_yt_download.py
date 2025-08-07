from backend.services.youtube_services import YouTubeService

url = "https://youtu.be/u81NapG8yL0?si=OP0xCH99qyckpRHB"

yt = YouTubeService(url=url)

print("video info")
print(yt.get_video_info())
result = yt.download_audio()
print(result)
yt.cleanup_file(result["audio_path"])
