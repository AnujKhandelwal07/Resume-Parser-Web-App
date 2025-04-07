import sys
from parser import ResumeParser  # Ensure 'parser.py' is in the same directory

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Error: No file provided")
        sys.exit(1)

    file_path = sys.argv[1]  # Get file path from command line argument
    parser = ResumeParser(file_path)

    # Print extracted details (Flask will capture this output)
    print({
        "name": parser.extract_name(),
        "contact_number": parser.extract_phone_numbers(),
        "email": parser.extract_email(),
        "address": parser.extract_address(),
        "skills": parser.extract_skills(['Python', 'Data Analysis', 'Machine Learning', 'SQL', 'Java']),
        "education": parser.extract_education(),
        "experience": parser.extract_experience()
    })