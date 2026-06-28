from flask import Flask, jsonify
import os, json

app = Flask(__name__)

@app.route('/api/health')
def health():
    base = os.path.dirname(os.path.abspath(__file__))
    files = sorted(os.listdir(base))
    db_path = os.path.join(base, 'database.json')
    has_db = os.path.exists(db_path)
    return jsonify({"status": "ok", "base": base, "has_db": has_db, "files": files})
