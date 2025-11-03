#!/usr/bin/env python3
"""
Script to fetch video IDs from TwelveLabs index
Usage: python get_videos.py [index_id]
"""
import os
import sys
from dotenv import load_dotenv
from service.twelvelabs_service import TwelveLabsService

# Load environment variables
load_dotenv()

def main():
    # Get API key from environment
    api_key = os.environ.get('TWELVELABS_API_KEY', '')
    
    if not api_key:
        print("❌ Error: TWELVELABS_API_KEY not found in environment variables")
        print("Please set TWELVELABS_API_KEY in your .env file")
        return 1
    
    print(f"🔑 API Key: {'*' * 20}{api_key[-4:]}")
    
    # Initialize TwelveLabs service
    service = TwelveLabsService(api_key=api_key)
    
    # Get index_id from command line or environment
    if len(sys.argv) > 1:
        index_id = sys.argv[1]
        print(f"📁 Using Index ID from argument: {index_id}")
    else:
        index_id = os.environ.get('TWELVELABS_INDEX_ID', '')
        if not index_id:
            print("\n📋 Fetching available indexes...\n")
            indexes = service.get_indexes()
            
            if not indexes:
                print("❌ No indexes found. Please create an index first.")
                return 1
            
            print(f"✅ Found {len(indexes)} index(es):")
            print("=" * 60)
            for i, idx in enumerate(indexes, 1):
                print(f"{i}. {idx['name']} (ID: {idx['id']})")
            
            # Use the first index as default
            index_id = indexes[0]['id']
            print(f"\n📁 Using first index: {index_id}")
        else:
            print(f"📁 Using Index ID from environment: {index_id}")
    
    print("=" * 60)
    
    # Fetch videos from the index
    print(f"\n📹 Fetching videos from index: {index_id}...\n")
    
    page = 1
    all_videos = []
    
    while True:
        print(f"Fetching page {page}...")
        videos = service.get_videos(index_id, page=page)
        
        if not videos:
            break
        
        all_videos.extend(videos)
        
        # Check if there are more pages (assuming 10 videos per page)
        if len(videos) < 10:
            break
        
        page += 1
    
    if not all_videos:
        print("\n⚠️  No videos found in this index")
        print("Upload a video first using POST /api/upload")
        return 0
    
    # Display all videos with their IDs
    print(f"\n✅ Found {len(all_videos)} video(s) in index '{index_id}':")
    print("=" * 60)
    
    for i, video in enumerate(all_videos, 1):
        print(f"\n{i}. Video Name: {video.get('name', 'Unnamed')}")
        print(f"   📌 Video ID: {video.get('id')}")
        print(f"   ⏱️  Duration: {video.get('duration', 0):.2f} seconds")
        print(f"   📐 Dimensions: {video.get('width', 0)}x{video.get('height', 0)}")
        print(f"   🎬 FPS: {video.get('fps', 0)}")
        print(f"   💾 Size: {video.get('size', 0) / (1024*1024):.2f} MB")
        if video.get('video_url'):
            print(f"   🔗 Video URL: {video.get('video_url')}")
        if video.get('thumbnail_url'):
            print(f"   🖼️  Thumbnail: {video.get('thumbnail_url')}")
    
    print("\n" + "=" * 60)
    print(f"\n💡 To analyze a video, use the video_id in your API calls")
    print(f"   Example: POST /api/analyze/<video_id>")
    print(f"   Example: POST /api/highlights/<video_id>")
    
    return 0

if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print("\n\n⚠️  Interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

