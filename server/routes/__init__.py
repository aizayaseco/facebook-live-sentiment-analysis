import training
import preprocessing
import sys
import json
import numpy as np
import pandas as pd
import warnings 
import pickle
#import time
from googletrans import Translator
from nltk import sent_tokenize
from pandas.io.json import json_normalize
from nltk.tokenize import RegexpTokenizer
from statistics import mode, StatisticsError
from flask import Blueprint, jsonify,abort, request
from access_tokens import tokens

mod = Blueprint('routes', __name__)
N=4
counter=-1

# Uncomment if training of Data is needed
"""
preprocess=False
save=False
model = training.trainData(preprocess,save)
"""

""" Loading of finalized model """
model= pickle.load(open('finalized_model.sav','rb'))
print("The model was loaded.\nServer is ready. . .")

@mod.route('/token', methods=['GET'])
def get_tokens():
	global N
	global counter

	if(counter<N):
		counter = counter + 1
	else:
		counter=0	
	return jsonify({'access_token': tokens[counter]})

@mod.route('/svm', methods=['POST'])
def svm():
	global model
	if not request.form:
		abort(400)
	data= json.loads(request.form['data'])
	df = pd.DataFrame.from_records(data)

	try:
		df['cleaned'] = map(lambda x: x.encode('unicode-escape'), df['message'])
	except KeyError:
		return
		
	df['svm'] = df['message']
	wordTokenizer = RegexpTokenizer(r'\w+')

	#start_time = time.time()
	def assess(x):
		tokenized = x.split()
		if(len(tokenized)>36 and len(x)>1000):
			x = sent_tokenize(x)
			if(len(x)==1):
				x = x[0].split()
				n = 35
				x = [' '.join(x[i:i+n]) for i in range(0,len(x),n)]
			str_array=""
			res_array=[]
			for subText in x:
				message, result = assess(subText)
				res_array.append(result)
				str_array+=message
			try:
				res= mode(res_array)
			except StatisticsError:
				res = res_array[0]
			return str_array, res
		else:
			message = preprocessing.preprocessData(x)
			result = model.predict([message]) 
			return message,result[0]

	i=0;
	for x in df['cleaned'].values:
		#print(x)
		if(x!='' or (len(x)>0 and len(x)<3000)):
			df['cleaned'].values[i],df['svm'].values[i]=assess(x)
		else:
			df['cleaned'].values[i]=''
			df['svm'].values[i] = ''
		i+=1;

	#print("--- %s seconds ---" % (time.time() - start_time))

	data = df.to_json(orient='records')
	return jsonify(data)