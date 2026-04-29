from backend.utils import get_audio_format

mp3_audio = r"C:\Users\thor\Downloads\TunePocket-New-Year-Fireworks-Intro-Reveal-Preview.mp3"
aiff_audio = r"C:\Users\thor\Downloads\aiff.aiff"
wav_audio = r"C:\Users\thor\Downloads\file_example_WAV_1MG.wav"
print(get_audio_format(wav_audio))