from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/api/config')
def config():
    return jsonify({"test": "ok with CORS"})
