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
        position: Tuple[str, str] = ('center', 0.85),
        font_size: int = 80,
        color: str = 'yellow',
        stroke_color: str = 'black',
        stroke_width: int = 3,
        method: str = 'caption'
    ) -> TextClip:
        """
        Create a modern text clip for captions with cool styling.
        
        Args:
            text: Caption text
            duration: Duration of the caption in seconds
            position: Position of the caption (default: bottom center)
            font_size: Font size for the caption
            color: Text color
            stroke_color: Outline/stroke color
            stroke_width: Width of the text stroke
            method: 'caption' for word-by-word or 'label' for full text
            
        Returns:
            TextClip: The caption clip
        """
        try:
            # Clean and format text - limit to 2-3 words per line for readability
            words = text.strip().split()
            
            # Format text with 2-3 words per line for better mobile viewing
            formatted_lines = []
            for i in range(0, len(words), 3):
                line = ' '.join(words[i:i+3])
                formatted_lines.append(line.upper())  # Uppercase for impact
            
            formatted_text = '\n'.join(formatted_lines)
            
            # Create text clip with stroke effect
            txt_clip = TextClip(
                formatted_text,
                fontsize=font_size,
                color=color,
                stroke_color=stroke_color,
                stroke_width=stroke_width,
                size=(self.REEL_WIDTH - 120, None),  # Leave margins
                method=method,
                align='center',
                font='Impact',  # Bold, modern font (Impact, Arial-Bold, or Helvetica-Bold)
                kerning=2  # Letter spacing for better readability
            )
            txt_clip = txt_clip.set_duration(duration)
            
            # Position at bottom center (0.85 = 85% down from top)
            if isinstance(position, tuple) and len(position) == 2:
                txt_clip = txt_clip.set_position(position, relative=True)
            else:
                txt_clip = txt_clip.set_position(position)
            
            return txt_clip
        except Exception as e:
            logger.error(f"Error creating caption clip: {str(e)}")
            # Fallback to simpler caption if fancy one fails
            try:
                txt_clip = TextClip(
                    text.upper(),
                    fontsize=font_size,
                    color=color,
                    size=(self.REEL_WIDTH - 120, None),
                    method='caption',
                    align='center',
                    font='Arial-Bold'
                )
                txt_clip = txt_clip.set_duration(duration)
                txt_clip = txt_clip.set_position(('center', 0.85), relative=True)
                return txt_clip
            except Exception as e2:
                logger.error(f"Error creating fallback caption: {str(e2)}")
                raise
    
    def add_captions(
        self,
        clip: VideoFileClip,
        captions: List[Dict[str, any]],
        font_size: int = 80,
        color: str = 'yellow',
        stroke_color: str = 'black',
        stroke_width: int = 3
    ) -> VideoFileClip:
        """
        Add synchronized captions to a video clip with modern styling.
        Captions will change as per speech timing for better engagement.
        
        Args:
            clip: The video clip to add captions to
            captions: List of caption dictionaries with 'text', 'start', 'end' keys
            font_size: Font size for captions
            color: Text color (default: yellow for high visibility)
            stroke_color: Stroke/outline color
            stroke_width: Width of the stroke
            
        Returns:
            VideoFileClip: Clip with synchronized captions overlaid
        """
        try:
            logger.info(f"Adding {len(captions)} synchronized captions to video")
            
            if not captions:
                logger.warning("No captions provided, returning original clip")
                return clip
            
            caption_clips = []
            
            for i, caption in enumerate(captions):
                text = caption.get('text', '').strip()
                start = caption.get('start', 0)
                end = caption.get('end', start + 2.0)  # Default 2 second duration
                duration = end - start
                
                # Skip empty captions or invalid timings
                if not text or duration <= 0 or start < 0 or start >= clip.duration:
                    continue
                
                # Ensure caption doesn't exceed clip duration
                if end > clip.duration:
                    end = clip.duration
                    duration = end - start
                
                # Skip if duration is too short (less than 0.1 seconds)
                if duration < 0.1:
                    continue
                
                try:
                    txt_clip = self.create_caption_clip(
                        text=text,
                        duration=duration,
                        font_size=font_size,
                        color=color,
                        stroke_color=stroke_color,
                        stroke_width=stroke_width
                    )
                    txt_clip = txt_clip.set_start(start)
                    caption_clips.append(txt_clip)
                    
                    # Log for debugging
                    if i < 3 or i == len(captions) - 1:  # Log first 3 and last caption
                        logger.info(f"Caption {i+1}: '{text[:30]}...' at {start:.2f}s-{end:.2f}s ({duration:.2f}s)")
                        
                except Exception as e:
                    logger.warning(f"Failed to create caption {i+1} '{text[:30]}': {str(e)}")
                    continue
            
            if caption_clips:
                logger.info(f"Successfully created {len(caption_clips)} caption clips")
                # Composite video with captions
                final_clip = CompositeVideoClip([clip] + caption_clips)
                final_clip.duration = clip.duration
                final_clip.fps = clip.fps
                return final_clip
            else:
                logger.warning("No valid caption clips created, returning original clip")
                return clip
                
        except Exception as e:
            logger.error(f"Error adding captions: {str(e)}")
            import traceback
            traceback.print_exc()
            # Return original clip if caption addition fails
            return clip
    
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
                clip_duration = end_time - start_time
                
                logger.info(f"Processing {len(captions)} captions for highlight {start_time}s-{end_time}s")
                
                for cap in captions:
                    # Get absolute timestamps from original video
                    cap_start_abs = cap.get('start', 0)
                    cap_end_abs = cap.get('end', cap_start_abs + 2.0)
                    
                    # Convert to relative timestamps (relative to highlight start)
                    cap_start = cap_start_abs - start_time
                    cap_end = cap_end_abs - start_time
                    
                    # Only include captions that appear during this highlight
                    # Caption must start before the highlight ends and end after the highlight starts
                    if cap_end > 0 and cap_start < clip_duration:
                        # Clamp the caption timing to the highlight boundaries
                        adjusted_start = max(0, cap_start)
                        adjusted_end = min(clip_duration, cap_end)
                        
                        # Only add if there's a valid duration
                        if adjusted_end > adjusted_start:
                            adjusted_captions.append({
                                'text': cap.get('text', ''),
                                'start': adjusted_start,
                                'end': adjusted_end
                            })
                
                logger.info(f"Found {len(adjusted_captions)} captions within this highlight timeframe")
                
                if adjusted_captions:
                    # Log sample captions for debugging
                    for i, cap in enumerate(adjusted_captions[:3]):
                        logger.info(f"  Caption {i+1}: '{cap['text'][:40]}...' at {cap['start']:.2f}s-{cap['end']:.2f}s")
                    
                    clip = self.add_captions(clip, adjusted_captions)
                else:
                    logger.warning("No captions found within highlight timeframe")
            
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

