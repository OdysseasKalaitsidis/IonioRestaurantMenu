from flask import Flask, request, jsonify, render_template, send_from_directory
import os
from werkzeug.utils import secure_filename
from parse import parse_pdf_to_json  # Your parser logic
import json
from flask_cors import CORS


app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

MENU_JSON_PATH = os.path.join(UPLOAD_FOLDER, "latest_menu.json")
MENU_PDF_PATH = os.path.join(UPLOAD_FOLDER, "latest_menu.pdf")

@app.route("/")
def index():
    return render_template("index.html")  # Ensure templates/index.html exists

@app.route("/upload", methods=["POST"])
def upload_pdf():
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    # Save PDF as "latest_menu.pdf"
    file.save(MENU_PDF_PATH)

    try:
        menu_data = parse_pdf_to_json(MENU_PDF_PATH)

        # Save parsed JSON as "latest_menu.json"
        with open(MENU_JSON_PATH, 'w', encoding='utf-8') as f:
            json.dump(menu_data, f, ensure_ascii=False, indent=2)

        return jsonify({"message": "PDF uploaded and processed successfully!"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/menu", methods=["GET"])
def get_menu():
    if not os.path.exists(MENU_JSON_PATH):
        return jsonify({"error": "No menu has been uploaded yet."}), 404

    with open(MENU_JSON_PATH, 'r', encoding='utf-8') as f:
        return jsonify(json.load(f))

@app.route("/pdf", methods=["GET"])
def get_pdf():
    if os.path.exists(MENU_PDF_PATH):
        return send_from_directory(UPLOAD_FOLDER, "latest_menu.pdf")
    return jsonify({"error": "No PDF found"}), 404

if __name__ == "__main__":
    app.run()
