# https://heroicons.com/outline
# https://www.chartjs.org/docs/latest/
# https://tailwindcss.com
# https://www.material-tailwind.com/docs/html/installation


# Create a virtual environment named venv
#   python -m venv venv

# Activate venv
#   venv\Scripts\activate

# deactivate venv
# deactivate

# pip install Flask
# pip install google_auth_oauthlib

# pip freeze > requirements.txt
# pip freeze
# pip install -r requirements.txt

# npx tailwindcss -i ./src/input.css -o ./src/output.css --watch
# npx tailwindcss -i ./static/css/input.css -o ./static/css/output.css --watch
# npm run build-css

# ngrok http 5000

# npm install -D prettier prettier-plugin-tailwindcss

# python app.py

# pip install flask-socketio
# pip install Flask-SQLAlchemy

from flask import Flask, render_template, request, jsonify, url_for
from flask_socketio import SocketIO, emit
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.utils import secure_filename
import os

# pip install plotly
# pip install kaleido

import plotly.graph_objects as go
import plotly.io as pio

app = Flask(__name__)
app.config['SECRET_KEY'] = 'temp-secret-key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///BloggerSentiment.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize database and socket connection
db = SQLAlchemy(app)
socketio = SocketIO(app)

# -----------------------------
# Database Models
# -----------------------------

# Message Model
class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.String(500), nullable=False)
    sender = db.Column(db.String(50), nullable=False)
    timestamp = db.Column(db.DateTime, default=lambda: datetime.now())

    def to_dict(self):
        return {
            'id': self.id,
            'content': self.content,
            'sender': self.sender,
            'timestamp': self.timestamp.isoformat()
        }

# Post Model
class Post(db.Model):
    __tablename__ = 'posts'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(500), nullable=False)
    caption = db.Column(db.String(200), nullable=True)
    image_filename = db.Column(db.String(100), nullable=True)
    timestamp = db.Column(db.DateTime, default=lambda: datetime.now())

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'caption': self.caption,
            'image_url': url_for('static', filename=f'uploads/{self.image_filename}') if self.image_filename else None,
            'timestamp': self.timestamp.isoformat()
        }

# -----------------------------
# Routes for Messages
# -----------------------------

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/messages')
def get_messages():
    messages = Message.query.order_by(Message.timestamp).all()
    # print(messages)
    return jsonify([message.to_dict() for message in messages])

@socketio.on('send_message')
def handle_message(data):
    message_content = data.get('message', '').strip()
    # If the user sends a message, process and save it
    if message_content:
        # Process user message
        user_message = Message(content=message_content, sender='user')
        db.session.add(user_message)
        db.session.commit()
        # Broadcast user message
        emit('receive_message', user_message.to_dict(), broadcast=True)

        # After the user message, send a bot response
        bot_message_content = "This is a fixed bot response."  # Fixed bot response text
        bot_message = Message(content=bot_message_content, sender='bot')
        db.session.add(bot_message)
        db.session.commit()
        # Broadcast bot message
        emit('receive_message', bot_message.to_dict(), broadcast=True)

# -----------------------------
# Routes for Posts
# -----------------------------

@app.route('/get_posts')
def get_posts():
    # Order by ascending timestamp to get the newest posts first
    posts = Post.query.order_by(Post.timestamp.asc()).all()
    return jsonify([post.to_dict() for post in posts])

@socketio.on('submit_post')
def handle_post_submission(data):
    title = data.get('title')
    description = data.get('description')
    caption = data.get('caption', '')
    image_filename = data.get('image_filename')

    if title and description:
        new_post = Post(title=title, description=description, caption=caption, image_filename=image_filename)
        db.session.add(new_post)
        db.session.commit()
        emit('receive_post', new_post.to_dict(), broadcast=True)

@app.route('/upload_image', methods=['POST'])
def upload_image():
    image = request.files.get('image')  # Use get to avoid KeyError if no file is uploaded
    if image and image.filename:  # Check if an image is actually uploaded
        filename = secure_filename(image.filename)
        image.save(os.path.join('static', 'uploads', filename))
    else:
        filename = None  # Set filename to None if no image is uploaded
    
    return jsonify({'filename': filename})


@app.route('/account')
def account():
    return render_template('account.html')

@app.route('/settings')
def settings():
    return render_template('settings.html')

# -----------------------------
# Main Application Entry
# -----------------------------

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    socketio.run(app, debug=True, host='0.0.0.0')