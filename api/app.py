from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/api/config')
def config():
    return jsonify({"test": "ok"})
