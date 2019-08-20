import re, string, unicodedata
import nltk
import contractions
from nltk import word_tokenize, sent_tokenize
from nltk.corpus import stopwords
from nltk.stem import SnowballStemmer
from nltk.tokenize import RegexpTokenizer
from googletrans import Translator
import pandas as pd
 
# Emoticons
emoticons = \
	[	(" emotihappy ",	["\U0001f608","\U0001f600","\U0001f601","\U0001f602","\U0001f923","\U0001f603","\U0001f604","\U0001f606","\U0001f60a","\ud83d\ude00","\ud83d\ude01","\ud83d\ude02","\ud83e\udd23","\ud83d\ude03","\ud83d\ude04","\ud83d\ude06","\ud83d\ude0a",":-D", ":D", "X-D", "XD", "xD",":-)",":]","=]","=)",":)", "(:","(=","[=","[:", "(-:","^_^"])	,\
		(" emotineutral ",	["\U0001f914","\U0001f928","\U0001f610","\U0001f611","\U0001f636","\U0001f605","\ud83e\udd14","\ud83e\udd28","\ud83d\ude10","\ud83d\ude11","\ud83d\ude36","\ud83d\ude05",":-|", ":|", "|:", "|-;"])	,\
		(" emotiwow ",		["\U0001f628","\U0001f631","\U0001f633","\U0001f929","\U0001f62f","\U0001f62e","\U0001f632","\ud83d\ude31","\ud83d\ude33","\ud83e\udd29","\ud83d\ude2f","\ud83d\ude2e","\ud83d\ude32",":-O", ":O", "O:", "O-;"])	,\
		(" emotisad ",		["\U0001f625","\U0001f641","\U0001f616","\U0001f61e","\U0001f61f","\U0001f613","\U0001f614","\U0001f622","\U0001f62d","\u2639\ufe0f","\ud83d\ude41","\ud83d\ude16","\ud83d\ude1e","\ud83d\ude1f","\ud83d\ude13","\ud83d\ude14","\ud83d\ude22","\ud83d\ude2d",":,(", ":\'(", ':"(', ":((",":-(",":[","=[","=(",":(", "):", ")=", "]=","]:",")-:"])	,\
		(" emotiangry ",	["\U0001f595","\U0001f620","\U0001f92c","\U0001f624","\U0001f47f","\ud83d\ude20", "\ud83e\udd2c", "\ud83d\ude24", "\ud83d\udc7f"] )	,\
	]
slangs = {
		"121":"one to one",
		"adn":"any day now",
		"afaik":"as far as know",
		"afk":"away from keyboard",
		"aight":"alright",
		"alol":"actually laughing out loud",		
		"b4":"before",	
		"b4n":"bye now",
		"bak":"back keyboard",
		"bf":"boyfriend",
		"bff":"best friends forever",
		"bfn":"bye now",
		"bg":"big grin",
		"bta":"but then again",
		"btw":"by way",
		"cid":"crying disgrace",
		"cnp":"continued next post",
		"cp":"chat post",
		"cu":"see you",
		"cul":"see you later",
		"cul8r":"see you later",
		"cya":"bye",
		"cyo":"see you online",
		"dbau":"doing business as usual",
		"effing":"fucking",
		"eff":"fuck",
		"ftw":"for win",
		"fu":"fuck you",
		"fud":"fear, uncertainty, and doubt",
		"fvck":"fuck",
		"f*ck":"fuck",
		"f**k":"fuck",
		"f*cking":"fuck",
		"f**king":"fuck",
		"fck":"fuck",
		"fwiw":"for what it is worth",
		"fyi":"for your information",
		"g":"game",
		"gg":"good game",
		"g2g":"got to go",
		"ga":"go ahead",
		"gal":"get a life",
		"gf":"girlfriend",
		"gfn":"gone for now",
		"gmbo":"giggling my butt off", 
		"gmta":"great minds think alike", 
		"gud":"good",
		"h8":"hate", 
		"hagn":"have a good night", 
		"hdop":"help delete online predators", 
		"hhis":"hanging head in shame",
		"hrs":"hours", 
		"iac":"in any case", 
		"ianal":"i am not a lawyer", 
		"ic":"i see", 
		"idk":"i do not know", 
		"idrk":"i do not really know", 
		"imao":"in my arrogant opinion", 
		"imnsho":"in my not so humble opinion", 
		"imo":"in my opinion", 
		"iow":"in other words",
		"ipn":"i am posting naked", 
		"irl":"in real life", 
		"jk":"just kidding", 
		"l8r":"later",
		"ld":"later dude",
		"ldr":"long distance relationship",
		"llta":"lots and lots of thunderous applause",
		"lmao":"laugh my ass off",
		"lmirl":"let us meet in real life",
		"lol":"laugh out loud",
		"ltr":"longterm relationship",
		"lulab":"love you like a brother",
		"lulas":"love you like a sister",
		"luv":"love",
		"m/f":"male or female",
		"m8":"mate",
		"oll":"online love",
		"omg":"oh my god",
		"otoh":"on other hand", 
		"pir":"parent in room",
		"pls": "please",
		"ppl":"people",
		"pipz":"people",
		"r":"are",
		"rofl":"roll on floor laughing",
		"rpg":"role playing games",  
		"ru":"are you",
		"shid":"slaps head in disgust",
		"somy":"sick of me yet",
		"sot":"short of time",
		"tgif":"thank god it is friday",
		"thanx":"thanks",
		"thx":"thanks",
		"tnx":"thanks",
		"ty":"thank you",
		"ttyl":"talk to you later",
		"u":"you",
		"ur":"you",
		"uw":"you welcome",
		"wb":"welcome back",
		"wfm":"works for me",
		"wibni":"would not it be nice if",
		"wth":"what hell",
		"wtf":"what fuck",
		"wtg":"way to go",
		"wtgp":"want to go private",
		"y":"why",
		"ym":"young man"
	}


url_regex = re.compile(r"https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9]\.[^\s]{2,}")

def removeURL(text):
	text = re.sub(r'https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)','',text)
	return text

def removeMentions(text):
	text = re.sub(r'@(\w+)','',text)
	return text

def concatHyphenated(text):
	text = text.replace('-\n','')
	text = text.replace('-','')
	return text

def replaceContractions(text):
    text = contractions.fix(text)
    return text

def removeNonAscii(text):
    text = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode('utf-8', 'ignore')
    return text

def removeStopword(word):
    new_word =""
    if word not in stopwords.words('english'):
        new_word = word
    return new_word

def removeNonAlphaNumeric(text):
	text = re.sub("[^a-zA-Z0-9]"," ",text) #nonalphanumeric
	return text

def replaceEmoticons(text):
	for (repl, emot) in emoticons:
		for emoticon in emot:
		 	text=text.replace(emoticon,repl)
	return text

def replaceSlangs(word):
	if(slangs.has_key(word)):
		word = slangs.get(word)
	return word

def normalize(text):
	stemmer = SnowballStemmer('english')
	wordTokenizer = RegexpTokenizer(r'\w+')
	words = word_tokenize(text)	
	new_words = []
	for w in words:
		w = re.sub(r'(.)\1+', r'\1\1', w) #repeating letters in words
		w = replaceSlangs(w);
		w = removeStopword(w)
	   	w = stemmer.stem(w)
	   	if w != "":
	   		new_words.append(w)
	text = "".join([" "+ i for i in new_words]).strip()
	text = re.sub("[^a-zA-Z]"," ",text)
	return text

def preprocessTrainingData(data):
	print(len(data))
	i = 0
	for x in data.values:
		#emoticons replacer
		x= replaceEmoticons(x)
		#url remover
		x = removeURL(x)
		#mentions
		x = removeMentions(x)
		#concat words with hyphen
		x = concatHyphenated(x)
		#lowercase
		x = x.lower()
		#remove non ascii chatacters
		x = removeNonAscii(x)
		#replace contractions
		x = replaceContractions(x)
		#remove non alphanumeric
		x = removeNonAlphaNumeric(x)
		#normalize
		x = normalize(x)
		data.values[i] = x
		i = i+1
	return data

def preprocessData(data):
	# translator= Translator()
	# try:
	# 	language= translator.detect(data)
	# 	#machine translation
	# 	if(language.lang!='en' and language.confidence>0.5):
	# 		results = translator.translate(data)
	# 		data = results.text
	# except ValueError:
	# 	data=data

	x=data
	#emoticons replacer
	x= replaceEmoticons(x)
	#url remover
	x = removeURL(x)
	#concat words with hyphen
	x = concatHyphenated(x)
	#lowercase
	x = x.lower()
	#remove non ascii chatacters
	try:
		x = x.decode('unicode-escape')
	except (UnicodeEncodeError,UnicodeDecodeError), e:
		x = x
	x = removeNonAscii(x)
	#replace contractions
	x = replaceContractions(x)
	#remove non alphanumeric
	x = removeNonAlphaNumeric(x)
	#normalize
	x = normalize(x)

	return x