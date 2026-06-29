from flask import Flask, jsonify
from flask_cors import CORS
import sys
import os

app = Flask(__name__)
CORS(app)

@app.route('/api/config')
def config():
    try:
        sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
        from calcular import load_db
        db = load_db()
        return jsonify(db)
    except Exception as e:
        import traceback
        return jsonify({"error": str(e), "traceback": traceback.format_exc()}), 500

@app.route('/api/debug')
def debug():
    import traceback
    results = {}
    base = os.path.dirname(os.path.abspath(__file__))
    
    results["base"] = base
    results["files"] = os.listdir(base)
    results["sys_path"] = sys.path[:5]
    
    try:
        import calcular
        results["calcular"] = "ok"
        results["calcular_file"] = calcular.__file__
    except Exception as e:
        results["calcular"] = str(e)
        results["calcular_tb"] = traceback.format_exc()
    
    try:
        import openpyxl
        results["openpyxl"] = "ok"
    except Exception as e:
        results["openpyxl"] = str(e)
    
    try:
        from fpdf import FPDF
        results["fpdf"] = "ok"
    except Exception as e:
        results["fpdf"] = str(e)
    
    return jsonify(results)
