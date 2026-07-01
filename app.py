from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app)

BASE = os.path.dirname(__file__)

def load_products():
    with open(os.path.join(BASE, 'products.json'), 'r') as f:
        return json.load(f)

@app.route('/')
def index():
    return send_from_directory(BASE, 'index.html')

@app.route('/style.css')
def styles():
    return send_from_directory(BASE, 'style.css')

@app.route('/script.js')
def scripts():
    return send_from_directory(BASE, 'script.js')

@app.route('/api/products', methods=['GET'])
def get_products():
    products = load_products()
    category = request.args.get('category')
    if category:
        products = [p for p in products if p['category'] == category]
    return jsonify(products)

@app.route('/api/products/<int:pid>', methods=['GET'])
def get_product(pid):
    products = load_products()
    found = None
    for p in products:
        if p['id'] == pid:
            found = p
            break
    if found is None:
        return jsonify({'error': 'Product not found'}), 404
    return jsonify(found)

@app.route('/api/categories', methods=['GET'])
def get_categories():
    products = load_products()
    cats = []
    for p in products:
        if p['category'] not in cats:
            cats.append(p['category'])
    return jsonify(cats)

@app.errorhandler(404)
def not_found(e):
    return send_from_directory(BASE, 'index.html')

@app.errorhandler(500)
def server_error(e):
    return jsonify({'error': 'Server error'}), 500

if __name__ == '__main__':
    app.run(debug=True)
