from flask import Flask, make_response, jsonify
from flask_socketio import SocketIO
from flask_cors import CORS
from views import views
from main import setup_streaming
import asyncio
from datetime import timedelta

ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5000",
    "https://middleware-iot.vercel.app"
]

def create_app():
    app = Flask(__name__)
    
    # Basic configuration
    app.config['SECRET_KEY'] = 'your-secret-key-here'
    app.config['SESSION_COOKIE_SAMESITE'] = 'None'
    app.config['SESSION_COOKIE_SECURE'] = True

    # CORS setup
    @app.after_request
    def after_request(response):
        origin = request.headers.get('Origin')
        if origin in ALLOWED_ORIGINS:
            response.headers.add('Access-Control-Allow-Origin', origin)
        else:
            response.headers.add('Access-Control-Allow-Origin', ALLOWED_ORIGINS[0])
            
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        response.headers.add('Access-Control-Max-Age', '3600')
        return response

    # Register blueprints
    app.register_blueprint(views)
    
    # Initialize SocketIO
    socketio = SocketIO(app, cors_allowed_origins=ALLOWED_ORIGINS)
    return app, socketio

async def main():
    app, socketio = create_app()
    setup_streaming(socketio)
    print("Starting server...")
    await socketio.run(app, debug=True, port=5000)

if __name__ == "__main__":
    asyncio.run(main())
