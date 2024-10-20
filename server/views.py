from flask import Blueprint, request, jsonify, make_response
from firebase.auth import login, create_user
from firebase.firebase import auth_client
import json

views = Blueprint("views", __name__)

@views.route('/signup', methods=['OPTIONS'])
def handle_signup_preflight():
    response = make_response()
    origin = request.headers.get('Origin')
    if origin in ALLOWED_ORIGINS:
        response.headers.add('Access-Control-Allow-Origin', origin)
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'POST,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    response.headers.add('Access-Control-Max-Age', '3600')
    return response

@views.route('/signup', methods=['POST'])
def handle_signup():
    try:
        if not request.is_json:
            return make_response(jsonify({"error": "Content-Type must be application/json"}), 415)
        
        data = request.get_json()
        email = data.get('email', '').strip()
        password = data.get('password', '')
        
        if not email or not password:
            return make_response(jsonify({"error": "Email and password are required."}), 400)

        user = create_user(email=email, password=password)
        response = make_response(
            jsonify({
                "message": "User created successfully",
                "user_id": user['localId']
            }), 
            200
        )
        
        # Set CORS headers
        origin = request.headers.get('Origin')
        if origin in ALLOWED_ORIGINS:
            response.headers.add('Access-Control-Allow-Origin', origin)
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        
        return response
        
    except Exception as e:
        error_response = make_response(jsonify({"error": str(e)}), 400)
        origin = request.headers.get('Origin')
        if origin in ALLOWED_ORIGINS:
            error_response.headers.add('Access-Control-Allow-Origin', origin)
        error_response.headers.add('Access-Control-Allow-Credentials', 'true')
        return error_response

# Place this at the bottom of views.py
@views.errorhandler(Exception)
def handle_error(e):
    response = make_response(
        jsonify({"error": str(e)}),
        500
    )
    origin = request.headers.get('Origin')
    if origin in ALLOWED_ORIGINS:
        response.headers.add('Access-Control-Allow-Origin', origin)
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response