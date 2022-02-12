from flask import Flask,render_template
import requests
app = Flask(__name__)

@app.route('/')
def index():
    url = "https://newsapi.org/v2/top-headlines?country=in&apiKey=2e30219277054eeab3f13200b9ac3cb1"
    r = requests.get(url).json()
    cases = {
        'articles' : r['articles']
    }
    return render_template('index.html',case=cases)

@app.route('/about')
def about():
    return render_template('aboutus.html')

app.run(debug = True)