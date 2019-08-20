from flask import Flask, jsonify
from flask_cors import CORS
from config import config

def create_server(env):
	app = Flask(__name__)
	app.config.from_object(config[env])

	# Naive CORS
	CORS(app)
	load_blueprint(app)

	@app.route('/', methods=['GET'])
	def server_up():
		return jsonify("Facebook Emotion Analyzer server is up!")

	return app

def load_blueprint(app):
	from routes import mod as routes_mod

	app.register_blueprint(routes_mod, url_prefix='/api')
