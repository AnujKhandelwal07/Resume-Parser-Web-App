
from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
import os
import json

# Now try importing the function
from groq_integration import extract_info_from_text


app = Flask(__name__)
CORS(app)  # Enable CORS
 
@app.route("/parse-resume", methods=["POST"])
def upload_resume():
    """Handles resume upload and runs run.py."""
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
 
    file = request.files["file"]
    file_path = f"uploads/{file.filename}"
    os.makedirs("uploads", exist_ok=True)
    file.save(file_path)
 
    try:
        # Run run.py and capture output
        result = subprocess.run(["python", "run.py", file_path], capture_output=True, text=True)
        os.remove(file_path)  # Clean up
 
        if result.returncode != 0:
            return jsonify({"error": "Parsing failed", "details": result.stderr}), 500
 
        # Convert output string to JSON (fix single-quote issue)
        parsed_output = json.loads(result.stdout.replace("'", '"'))
 
        # Extract education & experience safely
        education_text = parsed_output.get("education", "").strip()
        experience_text = parsed_output.get("experience", "").strip()
 
        if not education_text and not experience_text:
            return jsonify({"error": "No valid education or experience data found"}), 400
 
        # Send extracted text to Groq for structured parsing
        formatted_data = extract_info_from_text({
            "education": education_text,
            "experience": experience_text
        })
 
        # Remove original experience to avoid duplication
        parsed_output.pop('experience', None)
 
        # Combine both outputs
        final_output = {
            "message": "Resume parsed and formatted successfully",
            "output": {**parsed_output, **formatted_data}  # Merge both results
        }
 
        return jsonify(final_output)
 
    except json.JSONDecodeError as e:
        return jsonify({"error": f"JSON parsing failed: {e}"}), 500
 
    except Exception as e:
        return jsonify({"error": f"Error processing resume: {e}"}), 500
 
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
    

# from flask import Flask, request, jsonify
# from flask_cors import CORS
# import subprocess
# import os

# app = Flask(__name__)
# CORS(app)  # Enable CORS

# import json  # Import JSON module

# @app.route("/parse-resume", methods=["POST"])
# def upload_resume():
#     """Handles resume upload and runs run.py."""
#     if "file" not in request.files:
#         return jsonify({"error": "No file uploaded"}), 400

#     file = request.files["file"]
#     file_path = f"uploads/{file.filename}"
#     os.makedirs("uploads", exist_ok=True)
#     file.save(file_path)

#     try:
#         # Run run.py and capture the output
#         result = subprocess.run(["python", "run.py", file_path], capture_output=True, text=True)
#         os.remove(file_path)  # Clean up file after processing

#         if result.returncode == 0:
#             # Convert string output to JSON
#             parsed_output = json.loads(result.stdout.replace("'", '"'))  # Convert single quotes to double quotes
#             return jsonify({"message": "Resume parsed successfully", "output": parsed_output})
#         else:
#             return jsonify({"error": "Parsing failed", "details": result.stderr}), 500

#     except Exception as e:
#         return jsonify({"error": f"Error running script: {e}"}), 500


# if __name__ == "__main__":
#     app.run(host="0.0.0.0", port=5001, debug=True)