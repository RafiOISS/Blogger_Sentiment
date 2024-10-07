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




# from flask import Flask, render_template

# app = Flask("Blogger Sentiment")

# @app.route("/")
# def index():
#     return render_template('index.html')

# if __name__ == "__main__":
#     app.run(debug=True, host='0.0.0.0')
# python app.py



# pip install flask-socketio
# pip install Flask-SQLAlchemy

from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

app = Flask(__name__)
app.config['SECRET_KEY'] = 'temp-secret-key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///chat.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
socketio = SocketIO(app)

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

@app.route('/')
def index():
    # return render_template('chat2_index.html')
    # return render_template('temp_index.html')
    return render_template('navrail.html')

@app.route('/messages')
def get_messages():
    messages = Message.query.order_by(Message.timestamp).all()
    print(messages)
    return jsonify([message.to_dict() for message in messages])

# @socketio.on('send_message')
# def handle_message(data):
#     message_content = data.get('message', '').strip()
#     if message_content:  # Only process if the message is not empty
#         message = Message(content=message_content)
#         db.session.add(message)
#         db.session.commit()
#         emit('receive_message', message.to_dict(), broadcast=True)

@socketio.on('send_message')
def handle_message(data):
    message_content = data.get('message', '').strip()
    # If the user sends a message, process and save it
    if message_content:  
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

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    socketio.run(app, debug=True, host='0.0.0.0')