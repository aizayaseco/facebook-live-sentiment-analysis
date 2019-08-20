from server import create_server

app = create_server('conf')

if __name__ == "__main__":
    app.run(threaded=True) #pip install pyopenssl
