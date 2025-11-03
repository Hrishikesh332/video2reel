import os
import sys
import tempfile
import requests
from typing import List, Dict, Optional, Tuple
from moviepy.editor import VideoFileClip, TextClip, CompositeVideoClip, concatenate_videoclips
import moviepy.video.fx.all as vfx
import logging

logger = logging.getLogger(__name__)


class VideoEditorService:
    """
    Service for editing videos into reel format with captions.
    Supports:
    - Extracting highlights from timestamps
    - Converting to portrait format (9:16 ratio)
    - Adding dynamic captions
    - Exporting in reel-ready format
    """
    
    # Standard reel dimensions
    REEL_WIDTH = 1080
    REEL_HEIGHT = 1920
    REEL_ASPECT_RATIO = 9 / 16
    
    def __init__(self, output_dir: str = None):
        """
        Initialize the video editor service.
        
        Args:
            output_dir: Directory to save processed videos. Defaults to temp directory.
        """
        self.output_dir = output_dir or tempfile.gettempdir()
        os.makedirs(self.output_dir, exist_ok=True)
    
    def download_video(self, video_url: str, output_path: str = None) -> str:
        """
        Download a video from a URL, including HLS streams.
        
        Args:
            video_url: URL of the video to download
            output_path: Path to save the video. If None, saves to temp directory.
            
        Returns:
            str: Path to the downloaded video
        """
        try:
            if not output_path:
                output_path = os.path.join(tempfile.gettempdir(), f"video_{os.urandom(8).hex()}.mp4")
            
            logger.info(f"Downloading video from {video_url}")
            
            # Check if it's an HLS stream (.m3u8)
            if '.m3u8' in video_url:
                logger.info("Detected HLS stream, using ffmpeg to download...")
                return self._download_hls_video(video_url, output_path)
            else:
                # Regular HTTP download
                response = requests.get(video_url, stream=True, timeout=300)
                response.raise_for_status()
                
                with open(output_path, 'wb') as f:
                    for chunk in response.iter_content(chunk_size=8192):
                        f.write(chunk)
                
                logger.info(f"Video downloaded to {output_path}")
                return output_path
        except Exception as e:
            logger.error(f"Error downloading video: {str(e)}")
            raise
    
    def _download_hls_video(self, hls_url: str, output_path: str) -> str:
        """
        Download HLS stream using ffmpeg.
        
        Args:
            hls_url: URL to the HLS .m3u8 file
            output_path: Path to save the downloaded video
            
        Returns:
            str: Path to the downloaded video
        """
        import subprocess
        
        try:
            logger.info(f"Downloading HLS stream with ffmpeg to {output_path}")
            
            # Use ffmpeg to download and convert HLS stream
            cmd = [
                'ffmpeg',
                '-i', hls_url,
                '-c', 'copy',  # Copy streams without re-encoding (faster)
                '-bsf:a', 'aac_adtstoasc',  # Fix AAC bitstream
                '-y',  # Overwrite output file
                output_path
            ]
            
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=600
            )
            
            if result.returncode != 0:
                logger.error(f"FFmpeg error: {result.stderr}")
                raise Exception(f"FFmpeg failed to download HLS stream: {result.stderr}")
            
            if not os.path.exists(output_path) or os.path.getsize(output_path) == 0:
                raise Exception("Downloaded file is empty or doesn't exist")
            
            logger.info(f"HLS stream downloaded successfully to {output_path}")
            return output_path
            
        except subprocess.TimeoutExpired:
            logger.error("FFmpeg download timed out")
            raise Exception("Video download timed out after 10 minutes")
        except FileNotFoundError:
            logger.error("FFmpeg not found. Please install ffmpeg.")
            raise Exception("FFmpeg is not installed. Please install it to download HLS videos.")
        except Exception as e:
            logger.error(f"Error downloading HLS video: {str(e)}")
            raise
    
    def extract_clip(self, video_path: str, start_time: float, end_time: float) -> VideoFileClip:
        """
        Extract a clip from a video based on timestamps.
        
        Args:
            video_path: Path to the source video
            start_time: Start time in seconds
            end_time: End time in seconds
            
        Returns:
            VideoFileClip: The extracted clip
        """
        try:
            logger.info(f"Extracting clip from {start_time}s to {end_time}s")
            video = VideoFileClip(video_path)
            clip = video.subclip(start_time, end_time)
            return clip
        except Exception as e:
            logger.error(f"Error extracting clip: {str(e)}")
            raise
    
    def resize_to_portrait(self, clip: VideoFileClip, method: str = 'crop') -> VideoFileClip:
        """
        Resize video to portrait format (9:16 ratio for reels).
        
        Args:
            clip: The video clip to resize
            method: 'crop' (center crop) or 'fit' (add padding)
            
        Returns:
            VideoFileClip: Resized clip in portrait format
        """
        try:
            original_width, original_height = clip.size
            original_ratio = original_width / original_height
            
            logger.info(f"Original size: {original_width}x{original_height}, ratio: {original_ratio:.2f}")
            
            if method == 'crop':
                # Center crop to portrait
                target_ratio = self.REEL_ASPECT_RATIO
                
                if original_ratio > target_ratio:
                    # Video is too wide, crop sides
                    new_width = int(original_height * target_ratio)
                    x_center = original_width / 2
                    x1 = int(x_center - new_width / 2)
                    x2 = int(x_center + new_width / 2)
                    clip = vfx.crop(clip, x1=x1, x2=x2, y1=0, y2=original_height)
                else:
                    # Video is too tall or already portrait, crop top/bottom
                    new_height = int(original_width / target_ratio)
                    y_center = original_height / 2
                    y1 = int(y_center - new_height / 2)
                    y2 = int(y_center + new_height / 2)
                    clip = vfx.crop(clip, x1=0, x2=original_width, y1=y1, y2=y2)
                
                # Resize to standard reel dimensions
                clip = vfx.resize(clip, (self.REEL_WIDTH, self.REEL_HEIGHT))
                
            elif method == 'fit':
                # Fit video maintaining aspect ratio, add black bars
                if original_ratio > target_ratio:
                    # Scale based on height
                    clip = vfx.resize(clip, height=self.REEL_HEIGHT)
                else:
                    # Scale based on width
                    clip = vfx.resize(clip, width=self.REEL_WIDTH)
            
            logger.info(f"Resized to portrait: {clip.size[0]}x{clip.size[1]}")
            return clip
        except Exception as e:
            logger.error(f"Error resizing to portrait: {str(e)}")
            raise
    
    def create_caption_clip(
        self,
        text: str,
        duration: float,
        position: Tuple[str, str] = ('center', 'bottom'),
        font_size: int = 60,
        color: str = 'white',
        bg_color: str = 'black',
        method: str = 'caption'
    ) -> TextClip:
        """
        Create a text clip for captions.
        
        Args:
            text: Caption text
            duration: Duration of the caption in seconds
            position: Position of the caption (e.g., ('center', 'bottom'))
            font_size: Font size for the caption
            color: Text color
            bg_color: Background color
            method: 'caption' for word-by-word or 'label' for full text
            
        Returns:
            TextClip: The caption clip
        """
        try:
            txt_clip = TextClip(
                text,
                fontsize=font_size,
                color=color,
                bg_color=bg_color,
                size=(self.REEL_WIDTH - 100, None),  # Leave margins
                method=method,
                align='center'
            )
            txt_clip = txt_clip.set_duration(duration)
            txt_clip = txt_clip.set_position(position)
            
            return txt_clip
        except Exception as e:
            logger.error(f"Error creating caption clip: {str(e)}")
            raise
    
    def add_captions(
        self,
        clip: VideoFileClip,
        captions: List[Dict[str, any]],
        font_size: int = 60,
        color: str = 'white',
        bg_color: str = 'black'
    ) -> VideoFileClip:
        """
        Add captions to a video clip.
        
        Args:
            clip: The video clip to add captions to
            captions: List of caption dictionaries with 'text', 'start', 'end' keys
            font_size: Font size for captions
            color: Text color
            bg_color: Background color for text
            
        Returns:
            VideoFileClip: Clip with captions overlaid
        """
        try:
            logger.info(f"Adding {len(captions)} captions to video")
            
            caption_clips = []
            for caption in captions:
                text = caption.get('text', '')
                start = caption.get('start', 0)
                end = caption.get('end', clip.duration)
                duration = end - start
                
                if text and duration > 0:
                    txt_clip = self.create_caption_clip(
                        text=text,
                        duration=duration,
                        font_size=font_size,
                        color=color,
                        bg_color=bg_color
                    )
                    txt_clip = txt_clip.set_start(start)
                    caption_clips.append(txt_clip)
            
            if caption_clips:
                # Composite video with captions
                final_clip = CompositeVideoClip([clip] + caption_clips)
                return final_clip
            else:
                return clip
                
        except Exception as e:
            logger.error(f"Error adding captions: {str(e)}")
            raise
    
    def process_highlight_to_reel(
        self,
        video_path: str,
        start_time: float,
        end_time: float,
        captions: Optional[List[Dict[str, any]]] = None,
        output_filename: str = None,
        resize_method: str = 'crop',
        add_captions: bool = True
    ) -> str:
        """
        Process a single highlight into a reel-ready video.
        
        Args:
            video_path: Path to the source video
            start_time: Start time of the highlight in seconds
            end_time: End time of the highlight in seconds
            captions: Optional list of caption dictionaries
            output_filename: Optional output filename
            resize_method: Method to resize ('crop' or 'fit')
            add_captions: Whether to add captions
            
        Returns:
            str: Path to the processed reel video
        """
        temp_clips = []
        
        try:
            logger.info(f"Processing highlight: {start_time}s to {end_time}s")
            
            # Extract the highlight clip
            clip = self.extract_clip(video_path, start_time, end_time)
            temp_clips.append(clip)
            
            # Resize to portrait format
            clip = self.resize_to_portrait(clip, method=resize_method)
            
            # Add captions if provided and enabled
            if add_captions and captions:
                # Adjust caption timestamps relative to clip start
                adjusted_captions = []
                for cap in captions:
                    cap_start = cap.get('start', 0) - start_time
                    cap_end = cap.get('end', 0) - start_time
                    
                    # Only include captions within this clip's timeframe
                    if cap_start >= 0 and cap_start < (end_time - start_time):
                        adjusted_captions.append({
                            'text': cap.get('text', ''),
                            'start': max(0, cap_start),
                            'end': min(end_time - start_time, cap_end)
                        })
                
                if adjusted_captions:
                    clip = self.add_captions(clip, adjusted_captions)
            
            # Generate output path
            if not output_filename:
                output_filename = f"reel_{int(start_time)}_{int(end_time)}_{os.urandom(4).hex()}.mp4"
            
            output_path = os.path.join(self.output_dir, output_filename)
            
            # Write the final video
            logger.info(f"Writing reel to {output_path}")
            clip.write_videofile(
                output_path,
                codec='libx264',
                audio_codec='aac',
                temp_audiofile=os.path.join(tempfile.gettempdir(), 'temp-audio.m4a'),
                remove_temp=True,
                fps=30,
                preset='medium',
                threads=4
            )
            
            logger.info(f"Reel created successfully: {output_path}")
            return output_path
            
        except Exception as e:
            logger.error(f"Error processing highlight to reel: {str(e)}")
            raise
        finally:
            # Clean up clips
            for temp_clip in temp_clips:
                try:
                    temp_clip.close()
                except:
                    pass
    
    def process_multiple_highlights(
        self,
        video_path: str,
        highlights: List[Dict[str, any]],
        captions: Optional[List[Dict[str, any]]] = None,
        output_dir: str = None,
        resize_method: str = 'crop'
    ) -> List[str]:
        """
        Process multiple highlights from a video into separate reel videos.
        
        Args:
            video_path: Path to the source video
            highlights: List of highlight dictionaries with 'start', 'end', 'title' keys
            captions: Optional list of caption dictionaries for the entire video
            output_dir: Directory to save the reels
            resize_method: Method to resize ('crop' or 'fit')
            
        Returns:
            List[str]: Paths to the processed reel videos
        """
        if output_dir:
            self.output_dir = output_dir
            os.makedirs(self.output_dir, exist_ok=True)
        
        reel_paths = []
        
        for i, highlight in enumerate(highlights):
            try:
                start = highlight.get('start', 0)
                end = highlight.get('end', 0)
                title = highlight.get('title', f'highlight_{i}')
                
                # Create a safe filename from the title
                safe_title = "".join(c for c in title if c.isalnum() or c in (' ', '-', '_')).rstrip()
                safe_title = safe_title.replace(' ', '_')
                output_filename = f"reel_{i+1}_{safe_title}.mp4"
                
                logger.info(f"Processing highlight {i+1}/{len(highlights)}: {title}")
                
                reel_path = self.process_highlight_to_reel(
                    video_path=video_path,
                    start_time=start,
                    end_time=end,
                    captions=captions,
                    output_filename=output_filename,
                    resize_method=resize_method
                )
                
                reel_paths.append(reel_path)
                
            except Exception as e:
                logger.error(f"Error processing highlight {i+1}: {str(e)}")
                continue
        
        logger.info(f"Processed {len(reel_paths)} out of {len(highlights)} highlights")
        return reel_paths
    
    def cleanup_temp_files(self, file_paths: List[str]):
        """
        Clean up temporary files.
        
        Args:
            file_paths: List of file paths to delete
        """
        for file_path in file_paths:
            try:
                if os.path.exists(file_path):
                    os.remove(file_path)
                    logger.info(f"Cleaned up temporary file: {file_path}")
            except Exception as e:
                logger.warning(f"Failed to clean up {file_path}: {str(e)}")

