import os
import json
from pathlib import Path


def merge_with_en(en_data, target_data):
    """
    Recursively merge en.json keys into target translation file.
    - Adds missing keys from en.json.
    - Preserves existing keys and values in the target file.
    - Removes keys not present in en.json.
    """
    merged = {}
    for key, value in en_data.items():
        if key in target_data:
            # If key exists in both, check if it's a nested dictionary
            if isinstance(value, dict) and isinstance(target_data[key], dict):
                merged[key] = merge_with_en(value, target_data[key])
            else:
                merged[key] = target_data[key]  # Preserve existing value
        else:
            merged[key] = value  # Add missing key with value from en.json

    return merged


def sync_keys(translations_dir, en_file):
    # Load en.json as the reference file
    with open(en_file, 'r', encoding='utf-8') as f:
        en_data = json.load(f)

    for file in os.listdir(translations_dir):
        if file.endswith('.json') and file != os.path.basename(en_file):
            file_path = os.path.join(translations_dir, file)
            with open(file_path, 'r', encoding='utf-8') as f:
                target_data = json.load(f)

            # Synchronize keys with en.json
            synced_data = merge_with_en(en_data, target_data)

            # Save the synchronized file
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(synced_data, f, ensure_ascii=False, indent=2)

            print(f"Synced {file}")


if __name__ == "__main__":
    translations_dir = Path("apps", "keira", "src", "assets", "i18n")  # Update to your directory
    en_file = translations_dir / "en.json"
    sync_keys(translations_dir, en_file)
