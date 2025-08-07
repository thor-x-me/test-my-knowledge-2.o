from pytubefix import YouTube
from pytubefix.cli import on_progress

import os
import sys
import subprocess
import logging
import time
from datetime import datetime
from typing import Dict, Optional, Tuple
from moviepy.editor import VideoFileClip

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class YouTubeService:
    """
    Service class for downloading YouTube videos and extracting audio.
    Integrates with the quiz generation workflow.
    """
    
    def __init__(self, url: str, output_directory: str = "downloads"):
        """
        Initialize the YouTube service.
        
        Args:
            url (str): youtube video url
            output_directory (str): Directory to store downloaded files
        """
        self.output_directory = output_directory
        self.url = url

        # Create output directory if it doesn't exist
        os.makedirs(output_directory, exist_ok=True)

    def get_video_info(self) -> Dict:
        """
        Get video information from a YouTube URL.
        """
        yt = YouTube(self.url, on_progress_callback=on_progress)
        self.title = yt.title
        self.author = yt.author
        self.length = yt.length
        self.views = yt.views
        self.description = yt.description
        self.keywords = yt.keywords
        self.thumbnail_url = yt.thumbnail_url
        self.video_id = yt.video_id
        
        
        return {
            "title": self.title,
            "author": self.author,
            "length": self.length,
            "views": self.views,
            "description": self.description,
            "keywords": self.keywords,
            "thumbnail_url": self.thumbnail_url,
            "video_id": self.video_id

        }
                  
    
    def download_audio(self, url=None) -> Dict:
        """
        Extract audio from a video file.
        
        Args:
            url (str): url of the video to download the audio from`
            
        Returns:
            Dict: Audio extraction result
        """
        if url is None:
            url = self.url

        try:
            if not os.path.exists(self.output_directory):
                return {"error": "Directory for saving audio not found"}
            
            yt = YouTube(url, on_progress_callback=on_progress)

            self.title = yt.title
            self.channel_name = yt.author
            self.length = yt.length
            # self.views = yt.views
            self.description = yt.description
            # self.keywords = yt.keywords
            # self.thumbnail_url = yt.thumbnail_url
            self.video_id = yt.video_id


            ys = yt.streams.get_audio_only()
            
            ys.download(
                output_path=self.output_directory,
                filename=f"{self.video_id}.m4a",
                max_retries=2
                )
            
            logger.info(f"Downloaded audio in: {os.path.basename(self.output_directory)}")
            
            return {
                "success": True,
                "audio_path": os.path.join(self.output_directory, f"{self.video_id}.m4a"),
                "title": self.title,
                "new_audio_name": f"{self.video_id}.m4a",
            }
            
        except Exception as e:
            logger.error(f"Error downloading audio: {str(e)}")
            return {"error": f"Audio download failed: {str(e)}"}
    
    
    def cleanup_file(self, file_path: str) -> Dict:
        """
        Clean up downloaded file.
        
        Args:
            file_path (list): file paths to delete
            
        Returns:
            Dict: Cleanup result
        """
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                logger.info(f"Deleted file: {file_path}")
        except Exception as e:
            logger.error(f"Failed to delete {file_path}: {str(e)}")
        
        return {
            "deleted_files": file_path,
        }
    
