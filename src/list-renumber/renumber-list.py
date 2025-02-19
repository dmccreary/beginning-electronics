#!/usr/bin/env python3
import sys
import os

def renumber_list(input_text):
    """
    Renumbers a list of items, removing duplicates and ensuring proper sequential numbering.
    
    Args:
        input_text (str): Text containing numbered items, one per line
                         Format expected: "1. Item name" or similar
    
    Returns:
        str: Renumbered list with duplicates removed
    """
    # Split into lines and filter out empty lines
    lines = [line.strip() for line in input_text.split('\n') if line.strip()]
    
    # Extract items (remove numbers and clean up)
    items = []
    for line in lines:
        # Skip empty lines or lines without proper format
        if not line or '.' not in line:
            continue
            
        # Extract the text after the number and period
        try:
            item_text = line.split('.', 1)[1].strip()
            if item_text:  # Only add non-empty items
                items.append(item_text)
        except IndexError:
            continue
    
    # Remove duplicates while preserving order
    seen = set()
    unique_items = []
    for item in items:
        if item.lower() not in seen:  # Case-insensitive comparison
            seen.add(item.lower())
            unique_items.append(item)
    
    # Create numbered list
    numbered_list = []
    for i, item in enumerate(unique_items, 1):
        numbered_list.append(f"{i}. {item}")
    
    return '\n'.join(numbered_list)

def process_file(input_filename):
    """
    Process an input file and generate an output filename.
    
    Args:
        input_filename (str): Name of the input file
        
    Returns:
        tuple: (processed_content, output_filename)
    """
    # Generate output filename
    base_name = os.path.splitext(input_filename)[0]
    output_filename = f"{base_name}-out.csv"
    
    try:
        with open(input_filename, 'r') as file:
            content = file.read()
        processed_content = renumber_list(content)
        return processed_content, output_filename
    except FileNotFoundError:
        print(f"Error: File '{input_filename}' not found")
        sys.exit(1)
    except Exception as e:
        print(f"Error processing file: {str(e)}")
        sys.exit(1)

def main():
    # Check if filename was provided
    if len(sys.argv) != 2:
        print("Usage: python script.py input_filename")
        print("Example: python script.py my_list.txt")
        sys.exit(1)
    
    input_filename = sys.argv[1]
    
    # Process the file
    processed_content, output_filename = process_file(input_filename)
    
    # Write to output file
    try:
        with open(output_filename, 'w') as file:
            file.write(processed_content)
        print(f"Successfully processed '{input_filename}'")
        print(f"Output written to '{output_filename}'")
    except Exception as e:
        print(f"Error writing to output file: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()