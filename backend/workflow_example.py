#!/usr/bin/env python3
"""
Example script to demonstrate the two workflow APIs:
1. Upload and Process Workflow
2. Select from Index and Process Workflow
"""
import os
import sys
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

API_BASE_URL = os.getenv('APP_URL', 'http://localhost:5000')

def workflow_1_upload_and_process(video_file_path):
    """
    Workflow 1: Upload a video file and process it into reels
    
    Steps:
    1. Upload video
    2. Index video in TwelveLabs
    3. Generate highlights
    4. Get detailed transcription with timestamps
    5. Cut video based on highlight timestamps
    6. Convert to portrait format (9:16)
    7. Add captions
    """
    print("\n" + "="*60)
    print("WORKFLOW 1: UPLOAD AND PROCESS")
    print("="*60)
    
    if not os.path.exists(video_file_path):
        print(f"❌ Error: Video file not found: {video_file_path}")
        return
    
    url = f"{API_BASE_URL}/api/workflow/upload-and-process"
    
    # Prepare multipart form data
    with open(video_file_path, 'rb') as video_file:
        files = {'file': video_file}
        data = {
            'highlight_prompt': 'Find the most engaging moments suitable for social media reels',
            'add_captions': 'true',
            'resize_method': 'crop'
        }
        
        print(f"\n📤 Uploading video: {os.path.basename(video_file_path)}")
        print("⏳ Processing (this may take several minutes)...")
        
        try:
            response = requests.post(url, files=files, data=data, timeout=600)
            
            if response.status_code == 200:
                result = response.json()
                if result.get('success'):
                    print("\n✅ Workflow completed successfully!")
                    print(f"\n📊 Results:")
                    print(f"   Video ID: {result.get('video_id')}")
                    print(f"   Index ID: {result.get('index_id')}")
                    print(f"   Highlights: {result.get('highlights_count')}")
                    print(f"   Captions: {result.get('captions_count')}")
                    print(f"   Reels Created: {result.get('reels_created')}")
                    
                    print(f"\n🎬 Generated Reels:")
                    for i, reel in enumerate(result.get('reels', []), 1):
                        print(f"\n   {i}. {reel.get('filename')}")
                        highlight = reel.get('highlight', {})
                        print(f"      Title: {highlight.get('title', 'N/A')}")
                        print(f"      Time: {highlight.get('start', 0):.1f}s - {highlight.get('end', 0):.1f}s")
                        print(f"      Download: {API_BASE_URL}{reel.get('download_url')}")
                    
                    return result
                else:
                    print(f"\n❌ Workflow failed: {result.get('error')}")
                    print(f"   Failed at step: {result.get('step', 'unknown')}")
            else:
                print(f"\n❌ Request failed with status {response.status_code}")
                print(f"   Error: {response.text}")
                
        except requests.Timeout:
            print("\n⚠️  Request timed out (processing may still be ongoing)")
        except Exception as e:
            print(f"\n❌ Error: {str(e)}")


def workflow_2_select_and_process(video_id, index_id=None):
    """
    Workflow 2: Select an existing video from index and process it into reels
    
    Steps:
    1. Select video from index
    2. Generate highlights
    3. Get detailed transcription with timestamps
    4. Download video
    5. Cut video based on highlight timestamps
    6. Convert to portrait format (9:16)
    7. Add captions
    """
    print("\n" + "="*60)
    print("WORKFLOW 2: SELECT FROM INDEX AND PROCESS")
    print("="*60)
    
    url = f"{API_BASE_URL}/api/workflow/select-and-process/{video_id}"
    
    payload = {
        'highlight_prompt': 'Find the most engaging moments suitable for social media reels',
        'add_captions': True,
        'resize_method': 'crop'
    }
    
    if index_id:
        payload['index_id'] = index_id
    
    print(f"\n🎥 Processing video: {video_id}")
    print("⏳ Processing (this may take several minutes)...")
    
    try:
        response = requests.post(url, json=payload, timeout=600)
        
        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                print("\n✅ Workflow completed successfully!")
                print(f"\n📊 Results:")
                print(f"   Video ID: {result.get('video_id')}")
                print(f"   Video Name: {result.get('video_name')}")
                print(f"   Index ID: {result.get('index_id')}")
                print(f"   Highlights: {result.get('highlights_count')}")
                print(f"   Captions: {result.get('captions_count')}")
                print(f"   Reels Created: {result.get('reels_created')}")
                
                print(f"\n🎬 Generated Reels:")
                for i, reel in enumerate(result.get('reels', []), 1):
                    print(f"\n   {i}. {reel.get('filename')}")
                    highlight = reel.get('highlight', {})
                    print(f"      Title: {highlight.get('title', 'N/A')}")
                    print(f"      Time: {highlight.get('start', 0):.1f}s - {highlight.get('end', 0):.1f}s")
                    print(f"      Download: {API_BASE_URL}{reel.get('download_url')}")
                
                return result
            else:
                print(f"\n❌ Workflow failed: {result.get('error')}")
                print(f"   Failed at step: {result.get('step', 'unknown')}")
        elif response.status_code == 404:
            print(f"\n❌ Video not found in index")
        else:
            print(f"\n❌ Request failed with status {response.status_code}")
            print(f"   Error: {response.text}")
            
    except requests.Timeout:
        print("\n⚠️  Request timed out (processing may still be ongoing)")
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")


def main():
    print("\n🎬 Video to Reel Workflow Examples")
    print("="*60)
    
    if len(sys.argv) < 2:
        print("\nUsage:")
        print("  Workflow 1 (Upload): python workflow_example.py upload <video_file>")
        print("  Workflow 2 (Select): python workflow_example.py select <video_id> [index_id]")
        print("\nExamples:")
        print("  python workflow_example.py upload /path/to/video.mp4")
        print("  python workflow_example.py select 68e12b5e66ecb2513d7ede4b")
        print("  python workflow_example.py select 68e12b5e66ecb2513d7ede4b 68e12b4bf2e53b115e1ad058")
        return 1
    
    workflow_type = sys.argv[1].lower()
    
    if workflow_type == 'upload':
        if len(sys.argv) < 3:
            print("❌ Error: Please provide video file path")
            print("Usage: python workflow_example.py upload <video_file>")
            return 1
        
        video_file = sys.argv[2]
        workflow_1_upload_and_process(video_file)
        
    elif workflow_type == 'select':
        if len(sys.argv) < 3:
            print("❌ Error: Please provide video ID")
            print("Usage: python workflow_example.py select <video_id> [index_id]")
            return 1
        
        video_id = sys.argv[2]
        index_id = sys.argv[3] if len(sys.argv) > 3 else None
        workflow_2_select_and_process(video_id, index_id)
        
    else:
        print(f"❌ Error: Unknown workflow type '{workflow_type}'")
        print("Available workflows: upload, select")
        return 1
    
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print("\n\n⚠️  Interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

