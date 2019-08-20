import sys
import json
import pickle
import numpy as np
import pandas as pd
import preprocessing
import warnings 
from pandas.io.json import json_normalize
from nltk.tokenize import RegexpTokenizer
from statistics import mode
from csv import DictWriter

'''
0 - happy
1 - sad
2 - surprised
3 - angry
4 - neutral
-1 - unclassified/empty

'''


def fxn():
    warnings.warn("deprecated", DeprecationWarning)

with warnings.catch_warnings():
    warnings.simplefilter("ignore")
    fxn()

data = json.loads(sys.argv[1]);
df = pd.DataFrame.from_records(data)
df['cleaned'] = df['message']
df['svm'] = df['message']
#loaded_model= pickle.load(open('finalized_model.sav','rb'))
wordTokenizer = RegexpTokenizer(r'\w+')

def assess(x):
	tokens = wordTokenizer.tokenize(x)
	if(len(tokens)>36 and x.len()>1000):
		print("entered here: "+x)
		x = sent_tokenize(x)
		if(len(x)==1):
			x = x.split()
			n = 35
			x = [' '.join(x[i:i+n]) for i in range(0,len(x),n)]
		str_array=""
		res_array=[]
		for subText in x:
			message, result = assess(subText)
			#res_array.append(result)
			str_array+=message
		return str_array#, mode(res_array)
	else:
		message = preprocessing.preprocessData(x)
		#result = loaded_model.predict([message]) 
		return message#,result[0]

i=0;
for x in df['message'].values:
	if(x!='' or x==None):
		#,df['svm'].values[i]
		df['cleaned'].values[i]=assess(x)
	# else:
	# 	df['svm'].values[i] = 'unclassified' 
	# data = df.to_json(orient='records')
	# print(data)
	# if(i==50):
	# 	data = df.to_json(orient='records')
	# 	print(json.dumps(df))	
	i+=1;
data = df.to_json(orient='records')
#print(json.dumps(data[1]['message']))
#print(json.dumps(df.to_json()))
#print(json.dumps(df))
print(data)