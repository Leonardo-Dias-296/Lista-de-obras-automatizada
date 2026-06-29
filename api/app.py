from flask import Flask, jsonify
from flask_cors import CORS
from calcular import load_db

app = Flask(__name__)
CORS(app)

@app.route('/api/config')
def config():
    db = load_db()
    return jsonify({"test": "calcular ok", "keys": list(db.keys())})
