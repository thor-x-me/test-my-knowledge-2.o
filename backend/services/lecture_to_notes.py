from backend.utils import get_audio_format
import subprocess

def convert_to_mp3(audio_file, output_path="audio.mp3"):
    """
    Converts an audio file to MP3 format using `ffmpeg`. Supports conversion from
    various audio formats including WAV, M4A, AAC, OGG, and AIFF to MP3.

    Parameters:
        audio_file (str): The path to the audio file to be converted.
        output_path (str, optional): The path where the converted
            MP3 file will be saved. Defaults to "audio.mp3".

    Returns:
        bool: True if the conversion was successful or if the audio file is
        already in MP3 format, otherwise False.
    """
    types = ["wav", "mp3", "m4a", "aac", "ogg", "aiff"]
    audio_type = get_audio_format(audio_file)

    if audio_type in types:
        if audio_type == "mp3":
            # already in mp3 format
            return True
        elif audio_type == "wav":
            subprocess.run(
                ["ffmpeg", "-y", "-i", audio_file, output_path],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                check=True
            )
            return True
        elif audio_type == "m4a":
            # logic to convert from .m4a to mp3
            subprocess.run(
                ["ffmpeg", "-y", "-i", audio_file, "-codec:a", "libmp3lame", "-q:a", "2", output_path],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                check=True
            )
            return True
        elif audio_type == "aac":
            subprocess.run(
                ["ffmpeg", "-y", "-i", audio_file, "-codec:a", "libmp3lame", "-qscale:a", "2", output_path],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                check=True
            )
            return True
        elif audio_type == "ogg":
            subprocess.run(
                ["ffmpeg", "-y", "-i", audio_file, output_path],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                check=True
            )
            return True
        elif audio_type == "aiff":
            subprocess.run(
                ["ffmpeg", "-y", "-i", audio_file, "-codec:a", "libmp3lame", "-q:a", "2", output_path],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                check=True
            )
            return True
        else:
            return False
    else:
        return False
