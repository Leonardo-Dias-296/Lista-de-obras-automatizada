from flask import Flask, jsonify
from flask_cors import CORS
import openpyxl

app = Flask(__name__)
CORS(app)

@app.route('/api/config')
def config():
    return jsonify({"test": "openpyxl ok"})
