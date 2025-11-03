from flask import jsonify, request, Response, send_file
from datetime import datetime
import json
import logging
import os
from service.twelvelabs_service import TwelveLabsService
from service.video_editor_service import VideoEditorService

logger = logging.getLogger(__name__)

def safe_json_dumps(obj):

    try:
        json_str = json.dumps(obj, ensure_ascii=False, separators=(',', ':'))
        json.loads(json_str)
        return json_str
    except (TypeError, ValueError, json.JSONDecodeError) as e:
        logger.error(f"JSON serialization error: {e}")
        logger.error(f"Problematic object type: {type(obj)}")
        logger.error(f"Object keys (if dict): {list(obj.keys()) if isinstance(obj, dict) else 'Not a dict'}")
        
        # Return a safe fallback
        return json.dumps({
            'type': 'error',
            'message': f'Failed to serialize response data: {str(e)}'
        })

def register_routes(app):
    @app.route('/')
    def index():
        return jsonify({
            'status': 'healthy',
            'message': 'Video2Reel API',
            'version': '3.0.0',
            'workflows': {
                'upload_and_process': {
                    'endpoint': 'POST /api/workflow/upload-and-process',
                    'description': 'Complete workflow: Upload video → Index → Generate highlights → Get transcripts → Cut videos → Portrait format → Add captions',
                    'parameters': 'file (multipart), highlight_prompt (optional), add_captions (optional), resize_method (optional)'
                },
                'select_and_process': {
                    'endpoint': 'POST /api/workflow/select-and-process/<video_id>',
                    'description': 'Complete workflow: Select video from index → Generate highlights → Get transcripts → Cut videos → Portrait format → Add captions',
                    'parameters': 'index_id (optional), highlight_prompt (optional), add_captions (optional), resize_method (optional)'
                }
            },
            'endpoints': {
                'indexes': 'POST /api/indexes',
                'videos': 'POST /api/videos',
                'video_details': 'POST /api/video/<index_id>/<video_id>',
                'analyze': 'POST /api/analyze/<video_id>',
                'highlights': 'POST /api/highlights/<video_id>',
                'transcription': 'POST /api/transcription/<index_id>/<video_id>',
                'upload': 'POST /api/upload',
                'process_reel': 'POST /api/process-reel',
                'process_reels': 'POST /api/process-reels',
                'process_highlights_to_reels': 'POST /api/process-highlights-to-reels/<video_id>',
                'download_reel': 'GET /api/download-reel/<filename>'
            }
        })

    @app.route('/health')
    def health_check():
        return jsonify({
            'status': 'healthy',
            'timestamp': datetime.now().isoformat(),
            'message': 'Video2Reel API is running',
            'version': '1.0.1' 
        })

    @app.route('/api/config/twelvelabs', methods=['POST'])
    def set_twelvelabs_config():
        try:
            data = request.get_json()
            api_key = data.get('api_key')
            
            if not api_key or api_key == '':
                return jsonify({'success': False, 'error': 'TwelveLabs API key is required.'}), 400
            
            # Test the API key by trying to fetch indexes
            service = TwelveLabsService(api_key=api_key)
            test_result = service.get_indexes()
            
            if isinstance(test_result, list):
                # API key is valid, return success without storing it server-side
                return jsonify({
                    'success': True,
                    'message': 'TwelveLabs API key validated successfully',
                    'indexes': test_result
                })
            else:
                return jsonify({
                    'success': False,
                    'error': 'Invalid API key: Failed to fetch indexes'
                }), 401
                
        except Exception as e:
            return jsonify({
                'success': False,
                'error': f'Error validating API key: {str(e)}'
            }), 500

    @app.route('/api/config/twelvelabs', methods=['GET'])
    def get_twelvelabs_config():
        try:
            # Only return environment API key status, not user-specific keys
            env_api_key = app.config.get('TWELVELABS_API_KEY_ENV')
            if env_api_key:
                return jsonify({
                    'success': True,
                    'configured': True,
                    'environment_key_available': True
                })
            else:
                return jsonify({
                    'success': True,
                    'configured': False,
                    'environment_key_available': False
                })
                
        except Exception as e:
            return jsonify({
                'success': False,
                'error': f'Error getting API key configuration: {str(e)}'
            }), 500

    @app.route('/api/config/twelvelabs', methods=['DELETE'])
    def clear_twelvelabs_config():
        try:
            # This endpoint now just confirms the client should use environment key
            return jsonify({
                'success': True,
                'message': 'Switched to environment API key mode'
            })
                
        except Exception as e:
            return jsonify({
                'success': False,
                'error': f'Error switching to environment key: {str(e)}'
            }), 500

    @app.route('/api/indexes', methods=['POST'])
    def get_indexes():
        try:
            data = request.get_json()
            # Try client API key first, then fall back to environment
            api_key = data.get('api_key') or app.config.get('TWELVELABS_API_KEY_ENV')
            
            if not api_key or api_key == '':
                return jsonify({'success': False, 'error': 'TwelveLabs API key is required. Please connect your API key in the UI or set TWELVELABS_API_KEY in environment variables.'}), 400
            
            # Create service with provided API key
            service = TwelveLabsService(api_key=api_key)
            indexes = service.get_indexes()
            
            return jsonify({
                'success': True,
                'indexes': indexes
            })
            
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500

    @app.route('/api/videos', methods=['POST'])
    def get_videos():
        try:
            data = request.get_json()
            # Try client API key first, then fall back to environment
            api_key = data.get('api_key') or app.config.get('TWELVELABS_API_KEY_ENV')
            index_id = data.get('index_id')
            page = data.get('page', 1)  # Default to page 1 if not provided
            
            if not api_key or api_key == '':
                return jsonify({'success': False, 'error': 'TwelveLabs API key is required. Please connect your API key in the UI or set TWELVELABS_API_KEY in environment variables.'}), 400
            
            if not index_id:
                return jsonify({'success': False, 'error': 'Index ID is required'}), 400
            
            # Create service with provided API key
            service = TwelveLabsService(api_key=api_key)
            videos = service.get_videos(index_id, page=page)
            
            return jsonify({
                'success': True,
                'videos': videos,
                'page': page
            })
            
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500

    @app.route('/api/upload', methods=['POST'])
    def upload_video():
        try:
            # Always use environment API key for uploads to maintain consistency
            api_key = app.config.get('TWELVELABS_API_KEY_ENV')
            default_index_id = app.config.get('TWELVELABS_DEFAULT_INDEX_ID')
            if not api_key:
                return jsonify({'success': False, 'error': 'TwelveLabs API key not configured in environment'}), 400
            if not default_index_id:
                return jsonify({'success': False, 'error': 'Default index id not configured in environment (TWELVELABS_INDEX_ID)'}), 400
            
            if 'file' not in request.files:
                return jsonify({'success': False, 'error': 'No file uploaded'}), 400
            upload_file = request.files['file']
            if not upload_file or upload_file.filename == '':
                return jsonify({'success': False, 'error': 'Invalid file'}), 400
            
            import tempfile
            import os
            tmp_file = tempfile.NamedTemporaryFile(delete=False)
            tmp_file_path = tmp_file.name
            tmp_file.close()
            upload_file.save(tmp_file_path)
            
            logger.info(f"Temporary file created: {tmp_file_path}")
            
            try:
                service = TwelveLabsService(api_key=api_key)
                logger.info("Starting video upload and indexing...")
                result = service.upload_video_file(index_id=default_index_id, file_path=tmp_file_path)
                logger.info(f"Upload and indexing completed with result: {result}")
            finally:
                # Clean up temporary file after indexing is complete (or failed)
                try:
                    if os.path.exists(tmp_file_path):
                        os.remove(tmp_file_path)
                        logger.info(f"Temporary file deleted: {tmp_file_path}")
                    else:
                        logger.warning(f"Temporary file not found for deletion: {tmp_file_path}")
                except Exception as e:
                    logger.error(f"Failed to delete temporary file {tmp_file_path}: {str(e)}")
            
            if 'error' in result:
                return jsonify({
                    'success': False, 
                    'error': result['error'], 
                    'task_id': result.get('task_id'),
                    'task': result.get('task')
                }), 400
            
            return jsonify({
                'success': True, 
                'video_id': result.get('video_id'), 
                'task_id': result.get('task_id'),
                'status': result.get('status'),
                'message': f"Video indexed successfully with ID: {result.get('video_id')}"
            })
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500

    @app.route('/api/video/<index_id>/<video_id>', methods=['POST'])
    def get_video_details(index_id, video_id):
        try:
            data = request.get_json()
            # Try client API key first, then fall back to environment
            api_key = data.get('api_key') or app.config.get('TWELVELABS_API_KEY_ENV')
            
            if not api_key or api_key == '':
                return jsonify({'success': False, 'error': 'TwelveLabs API key is required. Please connect your API key in the UI or set TWELVELABS_API_KEY in environment variables.'}), 400
            
            # Create service with provided API key
            service = TwelveLabsService(api_key=api_key)
            video_details = service.get_video_details(index_id, video_id)
            
            if video_details:
                return jsonify({
                    'success': True,
                    'video_details': video_details
                })
            else:
                return jsonify({'success': False, 'error': 'Video not found or access denied'}), 400
            
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500

    @app.route('/api/analyze/<video_id>', methods=['POST'])
    def analyze_video(video_id):
        try:
            data = request.get_json()
            # Try client API key first, then fall back to environment
            api_key = data.get('api_key') or app.config.get('TWELVELABS_API_KEY_ENV')
            prompt = data.get('prompt')
            
            if not api_key or api_key == '':
                return jsonify({'success': False, 'error': 'TwelveLabs API key is required. Please connect your API key in the UI or set TWELVELABS_API_KEY in environment variables.'}), 400
            
            if not prompt:
                return jsonify({'success': False, 'error': 'Prompt is required'}), 400
            
            # Create service with provided API key
            service = TwelveLabsService(api_key=api_key)
            analysis = service.analyze_video(video_id, prompt)
            
            return jsonify({
                'success': True,
                'analysis': analysis
            })
            
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500

    @app.route('/api/highlights/<video_id>', methods=['POST'])
    def generate_highlights(video_id):
        try:
            data = request.get_json() or {}
            # Try client API key first, then fall back to environment
            api_key = data.get('api_key') or app.config.get('TWELVELABS_API_KEY_ENV')
            prompt = data.get('prompt')  # Optional custom prompt
            min_duration = data.get('min_duration', 20)  # Minimum highlight duration in seconds (default: 20)
            
            if not api_key or api_key == '':
                return jsonify({'success': False, 'error': 'TwelveLabs API key is required. Please connect your API key in the UI or set TWELVELABS_API_KEY in environment variables.'}), 400
            
            logger.info(f"[DEBUG] Generating highlights with min_duration: {min_duration}s")
            
            # Create service with provided API key
            service = TwelveLabsService(api_key=api_key)
            highlights_data = service.generate_highlights(video_id, prompt, min_duration=min_duration)
            
            logger.info(f"[DEBUG] Highlights response from service: {highlights_data}")
            logger.info(f"[DEBUG] Highlights type: {type(highlights_data)}")
            
            # The service returns a dict with 'highlights' key
            highlights_list = highlights_data.get('highlights', []) if isinstance(highlights_data, dict) else []
            
            logger.info(f"[DEBUG] Extracted highlights list: {highlights_list}")
            logger.info(f"[DEBUG] Highlights count: {len(highlights_list)}")
            logger.info(f"[DEBUG] All highlights >= {min_duration}s duration")
            
            return jsonify({
                'success': True,
                'highlights': highlights_list,
                'video_id': video_id,
                'min_duration': min_duration,
                'summary': highlights_data.get('summary') if isinstance(highlights_data, dict) else None
            })
            
        except Exception as e:
            logger.error(f"Error generating highlights for video {video_id}: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
            return jsonify({'success': False, 'error': str(e)}), 500

    @app.route('/api/transcription/<index_id>/<video_id>', methods=['POST'])
    def get_transcription(index_id, video_id):
        try:
            data = request.get_json() or {}
            # Try client API key first, then fall back to environment
            api_key = data.get('api_key') or app.config.get('TWELVELABS_API_KEY_ENV')
            
            if not api_key or api_key == '':
                return jsonify({'success': False, 'error': 'TwelveLabs API key is required. Please connect your API key in the UI or set TWELVELABS_API_KEY in environment variables.'}), 400
            
            # Create service with provided API key
            service = TwelveLabsService(api_key=api_key)
            transcription = service.get_video_transcription(video_id, index_id)
            
            return jsonify({
                'success': True,
                'transcription': transcription
            })
            
        except Exception as e:
            logger.error(f"Error getting transcription for video {video_id}: {str(e)}")
            return jsonify({'success': False, 'error': str(e)}), 500

    @app.route('/api/process-reel', methods=['POST'])
    def process_single_reel():
        """
        Process a single video highlight into a reel with captions.
        Expects video_url or video_path, start_time, end_time, and optional captions.
        """
        try:
            data = request.get_json()
            
            # Extract parameters
            video_url = data.get('video_url')
            video_path = data.get('video_path')
            start_time = data.get('start_time')
            end_time = data.get('end_time')
            captions = data.get('captions', [])
            resize_method = data.get('resize_method', 'crop')
            add_captions = data.get('add_captions', True)
            output_filename = data.get('output_filename')
            
            # Validation
            if not (video_url or video_path):
                return jsonify({'success': False, 'error': 'Either video_url or video_path is required'}), 400
            
            if start_time is None or end_time is None:
                return jsonify({'success': False, 'error': 'start_time and end_time are required'}), 400
            
            # Initialize video editor service
            output_dir = os.path.join(os.path.dirname(__file__), '..', 'output', 'reels')
            os.makedirs(output_dir, exist_ok=True)
            video_editor = VideoEditorService(output_dir=output_dir)
            
            # Download video if URL provided
            if video_url:
                logger.info(f"Downloading video from URL: {video_url}")
                video_path = video_editor.download_video(video_url)
            
            # Process the highlight into a reel
            logger.info(f"Processing reel: {start_time}s to {end_time}s")
            reel_path = video_editor.process_highlight_to_reel(
                video_path=video_path,
                start_time=float(start_time),
                end_time=float(end_time),
                captions=captions if add_captions else None,
                output_filename=output_filename,
                resize_method=resize_method,
                add_captions=add_captions
            )
            
            # Return the reel file path and download URL
            reel_filename = os.path.basename(reel_path)
            download_url = f"/api/download-reel/{reel_filename}"
            
            return jsonify({
                'success': True,
                'reel_path': reel_path,
                'download_url': download_url,
                'filename': reel_filename
            })
            
        except Exception as e:
            logger.error(f"Error processing reel: {str(e)}")
            return jsonify({'success': False, 'error': str(e)}), 500

    @app.route('/api/process-reels', methods=['POST'])
    def process_multiple_reels():
        """
        Process multiple video highlights into reels with captions.
        Expects video_url or video_path, highlights array, and optional captions.
        """
        try:
            data = request.get_json()
            
            # Extract parameters
            video_url = data.get('video_url')
            video_path = data.get('video_path')
            highlights = data.get('highlights', [])
            captions = data.get('captions', [])
            resize_method = data.get('resize_method', 'crop')
            
            # Validation
            if not (video_url or video_path):
                return jsonify({'success': False, 'error': 'Either video_url or video_path is required'}), 400
            
            if not highlights or len(highlights) == 0:
                return jsonify({'success': False, 'error': 'At least one highlight is required'}), 400
            
            # Initialize video editor service
            output_dir = os.path.join(os.path.dirname(__file__), '..', 'output', 'reels')
            os.makedirs(output_dir, exist_ok=True)
            video_editor = VideoEditorService(output_dir=output_dir)
            
            # Download video if URL provided
            if video_url:
                logger.info(f"Downloading video from URL: {video_url}")
                video_path = video_editor.download_video(video_url)
            
            # Process all highlights
            logger.info(f"Processing {len(highlights)} highlights into reels")
            reel_paths = video_editor.process_multiple_highlights(
                video_path=video_path,
                highlights=highlights,
                captions=captions,
                output_dir=output_dir,
                resize_method=resize_method
            )
            
            # Prepare response with download URLs
            reels_info = []
            for reel_path in reel_paths:
                reel_filename = os.path.basename(reel_path)
                reels_info.append({
                    'path': reel_path,
                    'filename': reel_filename,
                    'download_url': f"/api/download-reel/{reel_filename}"
                })
            
            return jsonify({
                'success': True,
                'reels': reels_info,
                'count': len(reels_info)
            })
            
        except Exception as e:
            logger.error(f"Error processing multiple reels: {str(e)}")
            return jsonify({'success': False, 'error': str(e)}), 500

    @app.route('/api/download-reel/<filename>', methods=['GET'])
    def download_reel(filename):
        """
        Download a processed reel video.
        """
        try:
            output_dir = os.path.join(os.path.dirname(__file__), '..', 'output', 'reels')
            file_path = os.path.join(output_dir, filename)
            
            if not os.path.exists(file_path):
                return jsonify({'success': False, 'error': 'File not found'}), 404
            
            return send_file(
                file_path,
                mimetype='video/mp4',
                as_attachment=True,
                download_name=filename
            )
            
        except Exception as e:
            logger.error(f"Error downloading reel: {str(e)}")
            return jsonify({'success': False, 'error': str(e)}), 500

    @app.route('/api/workflow/upload-and-process', methods=['POST'])
    def workflow_upload_and_process():
        """
        Complete Workflow 1: Upload video, index it, generate highlights, get transcripts, 
        cut video, convert to portrait, and add captions.
        """
        try:
            # Always use environment API key for uploads
            api_key = app.config.get('TWELVELABS_API_KEY_ENV')
            default_index_id = app.config.get('TWELVELABS_DEFAULT_INDEX_ID')
            
            if not api_key:
                return jsonify({'success': False, 'error': 'TwelveLabs API key not configured in environment'}), 400
            if not default_index_id:
                return jsonify({'success': False, 'error': 'Default index ID not configured in environment (TWELVELABS_INDEX_ID)'}), 400
            
            if 'file' not in request.files:
                return jsonify({'success': False, 'error': 'No file uploaded'}), 400
            
            upload_file = request.files['file']
            if not upload_file or upload_file.filename == '':
                return jsonify({'success': False, 'error': 'Invalid file'}), 400
            
            # Get optional parameters
            highlight_prompt = request.form.get('highlight_prompt')
            add_captions = request.form.get('add_captions', 'true').lower() == 'true'
            resize_method = request.form.get('resize_method', 'crop')
            
            logger.info("=== Starting Upload and Process Workflow ===")
            
            # Step 1: Upload and index video
            logger.info("Step 1: Uploading and indexing video...")
            import tempfile
            tmp_file = tempfile.NamedTemporaryFile(delete=False)
            tmp_file_path = tmp_file.name
            tmp_file.close()
            upload_file.save(tmp_file_path)
            
            try:
                service = TwelveLabsService(api_key=api_key)
                result = service.upload_video_file(index_id=default_index_id, file_path=tmp_file_path)
                
                if 'error' in result:
                    return jsonify({
                        'success': False, 
                        'error': f"Upload failed: {result['error']}",
                        'step': 'upload'
                    }), 400
                
                video_id = result.get('video_id')
                logger.info(f"✓ Video uploaded and indexed. Video ID: {video_id}")
                
                # Step 2: Generate highlights
                logger.info("Step 2: Generating highlights...")
                highlights_data = service.generate_highlights(video_id, highlight_prompt)
                highlights = highlights_data.get('highlights', [])
                
                if not highlights:
                    return jsonify({
                        'success': False, 
                        'error': 'No highlights generated',
                        'video_id': video_id,
                        'step': 'highlights'
                    }), 400
                
                logger.info(f"✓ Generated {len(highlights)} highlights")
                
                # Step 3: Get detailed transcription with timestamps
                logger.info("Step 3: Getting detailed transcription...")
                captions = []
                if add_captions:
                    captions = service.get_video_transcription(video_id, default_index_id)
                    logger.info(f"✓ Retrieved {len(captions)} caption segments")
                    
                    # If no captions available, create demo captions from highlights
                    if not captions and highlights:
                        logger.info("No transcription available, creating demo captions from highlights")
                        for highlight in highlights:
                            title = highlight.get('title', '')
                            start = highlight.get('start', 0)
                            end = highlight.get('end', 0)
                            duration = end - start
                            
                            # Add caption at the beginning of each highlight (absolute timestamps)
                            captions.append({
                                'text': title,
                                'start': start,  # Absolute timestamp in video
                                'end': start + min(duration, 5.0)  # Show for 5 seconds or highlight duration
                            })
                        logger.info(f"✓ Created {len(captions)} demo captions")
                
                # Step 4: Get video details to get video URL
                logger.info("Step 4: Getting video details...")
                video_details = service.get_video_details(default_index_id, video_id)
                video_url = None
                if video_details and 'hls' in video_details:
                    video_url = video_details['hls'].get('video_url')
                
                if not video_url:
                    # Use the uploaded file path
                    video_path = tmp_file_path
                    logger.info("Using uploaded file for processing")
                else:
                    logger.info(f"Video URL: {video_url}")
                    output_dir = os.path.join(os.path.dirname(__file__), '..', 'output', 'reels')
                    os.makedirs(output_dir, exist_ok=True)
                    video_editor = VideoEditorService(output_dir=output_dir)
                    video_path = video_editor.download_video(video_url)
                
                # Step 5: Process highlights into portrait reels with captions
                logger.info("Step 5: Processing highlights into portrait reels with captions...")
                output_dir = os.path.join(os.path.dirname(__file__), '..', 'output', 'reels')
                os.makedirs(output_dir, exist_ok=True)
                video_editor = VideoEditorService(output_dir=output_dir)
                
                reel_paths = video_editor.process_multiple_highlights(
                    video_path=video_path,
                    highlights=highlights,
                    captions=captions if add_captions else None,
                    output_dir=output_dir,
                    resize_method=resize_method
                )
                
                logger.info(f"✓ Created {len(reel_paths)} reels")
                
                # Prepare response
                reels_info = []
                for i, reel_path in enumerate(reel_paths):
                    reel_filename = os.path.basename(reel_path)
                    reels_info.append({
                        'path': reel_path,
                        'filename': reel_filename,
                        'download_url': f"/api/download-reel/{reel_filename}",
                        'highlight': highlights[i] if i < len(highlights) else None
                    })
                
                # Cleanup
                if video_path and os.path.exists(video_path):
                    video_editor.cleanup_temp_files([video_path])
                if os.path.exists(tmp_file_path):
                    os.remove(tmp_file_path)
                
                logger.info("=== Workflow completed successfully ===")
                
                return jsonify({
                    'success': True,
                    'workflow': 'upload-and-process',
                    'video_id': video_id,
                    'index_id': default_index_id,
                    'highlights_count': len(highlights),
                    'captions_count': len(captions),
                    'reels_created': len(reels_info),
                    'highlights': highlights,
                    'reels': reels_info
                })
                
            finally:
                # Clean up temporary file
                try:
                    if os.path.exists(tmp_file_path):
                        os.remove(tmp_file_path)
                except Exception as e:
                    logger.error(f"Failed to delete temporary file: {str(e)}")
            
        except Exception as e:
            logger.error(f"Error in upload and process workflow: {str(e)}")
            import traceback
            traceback.print_exc()
            return jsonify({'success': False, 'error': str(e)}), 500

    @app.route('/api/workflow/select-and-process/<video_id>', methods=['POST'])
    def workflow_select_and_process(video_id):
        """
        Complete Workflow 2: Select video from index, generate highlights, get transcripts,
        cut video, convert to portrait, and add captions.
        """
        try:
            data = request.get_json() or {}
            
            # Get parameters
            api_key = data.get('api_key') or app.config.get('TWELVELABS_API_KEY_ENV')
            index_id = data.get('index_id') or app.config.get('TWELVELABS_DEFAULT_INDEX_ID')
            highlight_prompt = data.get('highlight_prompt')
            add_captions = data.get('add_captions', True)
            resize_method = data.get('resize_method', 'crop')
            
            if not api_key:
                return jsonify({'success': False, 'error': 'TwelveLabs API key is required'}), 400
            if not index_id:
                return jsonify({'success': False, 'error': 'Index ID is required'}), 400
            
            logger.info(f"=== Starting Select and Process Workflow for video {video_id} ===")
            
            service = TwelveLabsService(api_key=api_key)
            
            # Step 1: Verify video exists and get details
            logger.info("Step 1: Getting video details...")
            video_details = service.get_video_details(index_id, video_id)
            
            if not video_details:
                return jsonify({
                    'success': False, 
                    'error': 'Video not found in index',
                    'step': 'video_details'
                }), 404
            
            video_url = None
            if 'hls' in video_details:
                video_url = video_details['hls'].get('video_url')
            
            if not video_url:
                return jsonify({
                    'success': False, 
                    'error': 'Video URL not available',
                    'step': 'video_details'
                }), 400
            
            logger.info(f"✓ Video found: {video_details.get('metadata', {}).get('filename', 'Unknown')}")
            
            # Step 2: Generate highlights
            logger.info("Step 2: Generating highlights...")
            highlights_data = service.generate_highlights(video_id, highlight_prompt)
            highlights = highlights_data.get('highlights', [])
            
            if not highlights:
                return jsonify({
                    'success': False, 
                    'error': 'No highlights generated',
                    'video_id': video_id,
                    'step': 'highlights'
                }), 400
            
            logger.info(f"✓ Generated {len(highlights)} highlights")
            
            # Step 3: Get detailed transcription with timestamps
            logger.info("Step 3: Getting detailed transcription...")
            captions = []
            if add_captions:
                captions = service.get_video_transcription(video_id, index_id)
                logger.info(f"✓ Retrieved {len(captions)} caption segments")
                
                # If no captions available, create demo captions from highlights
                if not captions and highlights:
                    logger.info("No transcription available, creating demo captions from highlights")
                    for highlight in highlights:
                        title = highlight.get('title', '')
                        start = highlight.get('start', 0)
                        end = highlight.get('end', 0)
                        duration = end - start
                        
                        # Add caption at the beginning of each highlight (absolute timestamps)
                        captions.append({
                            'text': title,
                            'start': start,  # Absolute timestamp in video
                            'end': start + min(duration, 5.0)  # Show for 5 seconds or highlight duration
                        })
                    logger.info(f"✓ Created {len(captions)} demo captions")
            
            # Step 4: Download video
            logger.info("Step 4: Downloading video...")
            output_dir = os.path.join(os.path.dirname(__file__), '..', 'output', 'reels')
            os.makedirs(output_dir, exist_ok=True)
            video_editor = VideoEditorService(output_dir=output_dir)
            video_path = video_editor.download_video(video_url)
            logger.info(f"✓ Video downloaded")
            
            # Step 5: Process highlights into portrait reels with captions
            logger.info("Step 5: Processing highlights into portrait reels with captions...")
            reel_paths = video_editor.process_multiple_highlights(
                video_path=video_path,
                highlights=highlights,
                captions=captions if add_captions else None,
                output_dir=output_dir,
                resize_method=resize_method
            )
            
            logger.info(f"✓ Created {len(reel_paths)} reels")
            
            # Prepare response
            reels_info = []
            for i, reel_path in enumerate(reel_paths):
                reel_filename = os.path.basename(reel_path)
                reels_info.append({
                    'path': reel_path,
                    'filename': reel_filename,
                    'download_url': f"/api/download-reel/{reel_filename}",
                    'highlight': highlights[i] if i < len(highlights) else None
                })
            
            # Cleanup downloaded video
            if video_path and os.path.exists(video_path):
                video_editor.cleanup_temp_files([video_path])
            
            logger.info("=== Workflow completed successfully ===")
            
            return jsonify({
                'success': True,
                'workflow': 'select-and-process',
                'video_id': video_id,
                'index_id': index_id,
                'video_name': video_details.get('metadata', {}).get('filename', 'Unknown'),
                'highlights_count': len(highlights),
                'captions_count': len(captions),
                'reels_created': len(reels_info),
                'highlights': highlights,
                'reels': reels_info
            })
            
        except Exception as e:
            logger.error(f"Error in select and process workflow: {str(e)}")
            import traceback
            traceback.print_exc()
            return jsonify({'success': False, 'error': str(e)}), 500

    @app.route('/api/process-highlights-to-reels/<video_id>', methods=['POST'])
    def process_highlights_to_reels(video_id):
        """
        Complete workflow: Get highlights from TwelveLabs and process them into reels.
        """
        try:
            data = request.get_json() or {}
            
            # Extract parameters
            api_key = data.get('api_key') or app.config.get('TWELVELABS_API_KEY_ENV')
            index_id = data.get('index_id')
            video_url = data.get('video_url')  # URL to the actual video file
            highlight_prompt = data.get('highlight_prompt')
            add_captions = data.get('add_captions', True)
            resize_method = data.get('resize_method', 'crop')
            
            if not api_key:
                return jsonify({'success': False, 'error': 'TwelveLabs API key is required'}), 400
            
            if not video_url:
                return jsonify({'success': False, 'error': 'video_url is required for processing'}), 400
            
            # Step 1: Get highlights from TwelveLabs
            logger.info(f"Getting highlights for video {video_id}")
            twelvelabs_service = TwelveLabsService(api_key=api_key)
            highlights_data = twelvelabs_service.generate_highlights(video_id, highlight_prompt)
            
            highlights = highlights_data.get('highlights', [])
            if not highlights:
                return jsonify({'success': False, 'error': 'No highlights generated'}), 400
            
            # Step 2: Get transcription for captions (if requested)
            captions = []
            if add_captions and index_id:
                logger.info(f"Getting transcription for video {video_id}")
                captions = twelvelabs_service.get_video_transcription(video_id, index_id)
            
            # Step 3: Process highlights into reels
            output_dir = os.path.join(os.path.dirname(__file__), '..', 'output', 'reels')
            os.makedirs(output_dir, exist_ok=True)
            video_editor = VideoEditorService(output_dir=output_dir)
            
            logger.info(f"Downloading and processing video into {len(highlights)} reels")
            video_path = video_editor.download_video(video_url)
            
            reel_paths = video_editor.process_multiple_highlights(
                video_path=video_path,
                highlights=highlights,
                captions=captions if add_captions else None,
                output_dir=output_dir,
                resize_method=resize_method
            )
            
            # Prepare response
            reels_info = []
            for i, reel_path in enumerate(reel_paths):
                reel_filename = os.path.basename(reel_path)
                reels_info.append({
                    'path': reel_path,
                    'filename': reel_filename,
                    'download_url': f"/api/download-reel/{reel_filename}",
                    'highlight': highlights[i] if i < len(highlights) else None
                })
            
            # Cleanup downloaded video
            if video_path and os.path.exists(video_path):
                video_editor.cleanup_temp_files([video_path])
            
            return jsonify({
                'success': True,
                'video_id': video_id,
                'highlights_count': len(highlights),
                'reels_created': len(reels_info),
                'reels': reels_info
            })
            
        except Exception as e:
            logger.error(f"Error in complete workflow: {str(e)}")
            return jsonify({'success': False, 'error': str(e)}), 500
