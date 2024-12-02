# https://heroicons.com/outline
# https://www.chartjs.org/docs/latest/
# https://tailwindcss.com
# https://www.material-tailwind.com/docs/html/installation

# https://huggingface.co/j-hartmann/emotion-english-distilroberta-base?text=Wow%2C+congratulations%21+So+excited+for+you%21
# https://huggingface.co/Helsinki-NLP/opus-mt-bn-en
# https://huggingface.co/papluca/xlm-roberta-base-language-detection
# https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct


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

from flask import Flask, render_template, request, jsonify, url_for, current_app
from flask_socketio import SocketIO, emit
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.utils import secure_filename
import os

import random
import time

# pip install plotly
# pip install kaleido

# import plotly.graph_objects as go
# import plotly.io as pio

# pip install transformers
# pip install torch
# pip install sentencepiece
# pip install sacremoses

# pip install accelerate>=0.26.0


from transformers import pipeline, AutoModelForCausalLM, AutoTokenizer
import torch

app = Flask(__name__)
app.config['SECRET_KEY'] = 'temp-secret-key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///BloggerSentiment.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize database and socket connection
db = SQLAlchemy(app)
socketio = SocketIO(app)

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
print(device)
isCuda = 0 if torch.cuda.is_available() else -1  # Use 0 for GPU or -1 for CPU

print("PyTorch version:", torch.__version__)
print("CUDA available:", torch.cuda.is_available())
if torch.cuda.is_available():
    print("CUDA version:", torch.version.cuda)
    print("Device name:", torch.cuda.get_device_name(0))
else:
    print("No CUDA device detected.")

# Initialize the emotion classification pipeline
emotion = pipeline("text-classification", 
                   model="j-hartmann/emotion-english-distilroberta-base", 
                   return_all_scores=True, 
                   truncation=True, 
                   max_length=512,
                   device=isCuda)
# Initialize the translation pipeline
translator = pipeline("translation", model="Helsinki-NLP/opus-mt-bn-en", device=isCuda)
# Initialize the language detection pipeline
detector = pipeline("text-classification", 
                    model="papluca/xlm-roberta-base-language-detection", 
                    truncation=True, 
                    max_length=512,
                    device=isCuda)

# Loading the chat model
model_name = "Qwen/Qwen2.5-1.5B-Instruct"

model = AutoModelForCausalLM.from_pretrained(
    model_name,
    torch_dtype="auto",
    device_map="auto",
)
tokenizer = AutoTokenizer.from_pretrained(model_name)

# Global variables
accessDescription = ""  # Initialize accessDescription at the global level


conversation= [
    {"role": "system", "content": "You are EmoBot, created by EmotionSphere. You are a helpful assistant."},
]



# -----------------------------
# Database Models
# -----------------------------

# Message Model
class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text(500), nullable=False)
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
    description = db.Column(db.Text(500), nullable=False)
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
        
# Define Sentiment Model
class Sentiment(db.Model):
    __tablename__ = 'sentiment'
    id = db.Column(db.Integer, primary_key=True)
    post_id = db.Column(db.Integer, db.ForeignKey('posts.id'), nullable=False)
    happy = db.Column(db.Integer, nullable=False)
    sad = db.Column(db.Integer, nullable=False)
    angry = db.Column(db.Integer, nullable=False)
    surprised = db.Column(db.Integer, nullable=False)
    neutral = db.Column(db.Integer, nullable=False)
    fear = db.Column(db.Integer, nullable=False)
    disgust = db.Column(db.Integer, nullable=False)


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
    global accessDescription  # Declare the global variable
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
        bot_message_content = chat_with_bot(message_content)
        # bot_message_content = "This is a fixed bot response."  # Fixed bot response text
        # bot_message_content = result["answer"]  # Fixed bot response text

        bot_message = Message(content=bot_message_content, sender='bot')
        db.session.add(bot_message)
        db.session.commit()
        # Broadcast bot message
        emit('receive_message', bot_message.to_dict(), broadcast=True)

# Function to generate bot response
def get_model_response(messages):
    try:
        # Convert messages to a chat template
        text = tokenizer.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True
        )

        # Tokenize the input
        # model_inputs = tokenizer([text], return_tensors="pt").to(model.device)
        model_inputs = tokenizer([text], return_tensors="pt").to(device)

        # Generate response
        generated_ids = model.generate(
            **model_inputs,
            max_new_tokens=512
        )

        # Decode the response (removing the input prompt)
        generated_ids = generated_ids[0][len(model_inputs.input_ids[0]):]
        response = tokenizer.decode(generated_ids, skip_special_tokens=True)

        return response
    except Exception as e:
        return f"An error occurred: {str(e)}"
        
# Function to add a new system message
def add_context_message(new_context_content):
    global conversation
    # Remove any existing system messages
    conversation = [{"role": "system", "content": "You are EmoBot, created by EmotionSphere. You are a helpful assistant."},
                    {"role": "user", "content": f"The post/description/context:\n{new_context_content}"},]

    print(f"Context message updated to: {new_context_content}")
    
def chat_with_bot(user_input):
    global conversation
    
    # Add user message to conversation
    conversation.append({"role": "user", "content": user_input})
    
    # Get model response
    model_response = get_model_response(conversation)
    
    # Add model response to conversation
    conversation.append({"role": "assistant", "content": model_response})
    
    # return model_response
    # print(model_response)
    return model_response
    


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
    global accessDescription  # Declare the global variable
    
    title = data.get('title')
    description = data.get('description')
    caption = data.get('caption', '')
    image_filename = data.get('image_filename')

    if title and description:
        # Step 1: Create and store the new post
        new_post = Post(title=title, description=description, caption=caption, image_filename=image_filename)
        
        # Update the global variable with the description
        accessDescription = description  # Set the global variable
        add_context_message(accessDescription)
        print(conversation)
        
        db.session.add(new_post)
        db.session.commit()  # Commit to get the new post ID
        
        detect_results = detector(new_post.description, top_k=1)[0]
        
        # Initialize translate & emo_results outside the if statement
        translate = None
        emo_results = None
        
        is_en = detect_results['label'] == 'en'
        
        if not is_en:
            translate = translator(new_post.description)
            emo_results = emotion(translate[0]['translation_text'])
        else:
            emo_results = emotion(new_post.description)
        
        sentiment_data = Sentiment(
            post_id=new_post.id,
            happy=emo_results[0][3]['score']*100,
            sad=emo_results[0][5]['score']*100,
            angry=emo_results[0][0]['score']*100,
            surprised=emo_results[0][6]['score']*100,
            neutral=emo_results[0][4]['score']*100,
            fear=emo_results[0][2]['score']*100,
            disgust=emo_results[0][1]['score']*100
        )
        
        db.session.add(sentiment_data)
        db.session.commit()  # Commit the sentiment data

        # Step 3: Emit the new post data (including the post ID)
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

@app.route('/get_sentiment_data')
def get_sentiment_data():
    post_id = request.args.get('post_id', type=int)
    sentiment = Sentiment.query.filter_by(post_id=post_id).first()

    if not sentiment:
        return jsonify({"error": "Sentiment data not found"}), 404

    return jsonify({
        "happy": sentiment.happy,
        "sad": sentiment.sad,
        "angry": sentiment.angry,
        "surprised": sentiment.surprised,
        "neutral": sentiment.neutral,
        "fear": sentiment.fear,
        "disgust": sentiment.disgust
    })

@socketio.on('remove_post')
def handle_remove_post(data):
    global accessDescription
    
    post_id = data.get('id')

    if not post_id:
        return

    # Remove the post from the database
    post = Post.query.get(post_id)
    if post:
        db.session.delete(post)

        # Remove the associated sentiment data, if any
        Sentiment.query.filter_by(post_id=post_id).delete()

        db.session.commit()

    latest_post = Post.query.order_by(Post.timestamp.desc()).first()
    accessDescription = latest_post.description
    add_context_message(accessDescription)
    print(conversation)
    
    # Broadcast the post removal to other clients
    emit('post_removed', {}, broadcast=True)

# -----------------------------
# Other Routes
# -----------------------------

@app.route('/account')
def account():
    return render_template('account.html')

@app.route('/settings')
def settings():
    current_app.logger.debug("This is a debug message")
    return render_template('settings.html')

# -----------------------------
# Main Application Entry
# -----------------------------

if __name__ == '__main__':
    with app.app_context():
        db.create_all()

        # Initialize accessDescription and conversation
        latest_post = Post.query.order_by(Post.timestamp.desc()).first()
        
        if latest_post:  # Check if there are any posts in the database
            accessDescription = latest_post.description
            add_context_message(accessDescription)
        else:
            accessDescription = ""  # Default value if no posts exist

        print("Initialization complete.")
        print(f"accessDescription: {accessDescription}")
        print(f"conversation: {conversation}")

    socketio.run(app, debug=True, host='0.0.0.0')