import os
import json
from pathlib import Path

def generate_song_json(folder_path):
    songs = []
    
    # Get all files in the folder
    files = os.listdir(folder_path)
    
    # Filter for .webm and .m4a files
    audio_files = [f for f in files if f.endswith(('.webm', '.m4a'))]
    
    for file in audio_files:
        # Extract the title by removing the date prefix and file extension
        title = ' '.join(file.split('_')[1:]).rsplit('.', 1)[0]
        
        song = {
            "title": title,
            "file": file
        }
        songs.append(song)
    
    # Sort songs by filename (which starts with the date)
    songs.sort(key=lambda x: x['file'])
    
    # Create the JSON structure
    json_data = {"songs": songs}
    
    # Write to a JSON file
    output_file = Path(folder_path) / 'songs.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(json_data, f, indent=2, ensure_ascii=False)
    
    print(f"JSON file created: {output_file}")

# Usage
folder_path = './assets/star_wars_music'  # Replace with your folder path
generate_song_json(folder_path)

