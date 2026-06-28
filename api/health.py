from flask import Flask, jsonify
import os, json, sys

app = Flask(__name__)

@app.route('/api/health')
def health():
    base = os.path.dirname(os.path.abspath(__file__))
    files = sorted(os.listdir(base))
    db_path = os.path.join(base, 'database.json')
    has_db = os.path.exists(db_path)
    
    errors = []
    
    try:
        from flask_cors import CORS
    except Exception as e:
        errors.append(f"flask_cors: {e}")
    
    try:
        import openpyxl
    except Exception as e:
        errors.append(f"openpyxl: {e}")
    
    try:
        from fpdf import FPDF
    except Exception as e:
        errors.append(f"fpdf: {e}")
    
    try:
        sys.path.insert(0, base)
        from calcular import load_db, calcular_quantidades
        db = load_db()
        inv_count = len(db.get('inversores', {}))
        cid_count = len(db.get('cidades', {}))
    except Exception as e:
        errors.append(f"calcular: {e}")
        inv_count = -1
        cid_count = -1
    
    try:
        from calcular import _get_db_path
        db_path_resolved = _get_db_path()
    except Exception as e:
        db_path_resolved = str(e)
    
    return jsonify({
        "status": "ok",
        "base": base,
        "has_db": has_db,
        "db_path_resolved": db_path_resolved,
        "files": files,
        "inversores": inv_count,
        "cidades": cid_count,
        "errors": errors,
        "python": sys.version
    })
