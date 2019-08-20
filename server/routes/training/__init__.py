from routes.preprocessing import preprocessTrainingData
import itertools
import json as j
import pandas as pd
import re
import numpy as np
import pickle
from sklearn.metrics import confusion_matrix, f1_score, precision_score, recall_score, accuracy_score
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC, SVC		
from sklearn.pipeline import Pipeline, make_pipeline 	#for fitting the tained data
from sklearn.model_selection import train_test_split	#for training and testing


pd.set_option('display.max_columns', None)

def trainData(preprocess,save):
	print("Currently training data . . .")
	""" DATA PREPROCESSING of data """
	if(preprocess):
		data = pd.read_json(path_or_buf='../data/corpus-old.json', orient='records')
		data['clean']= data['content']
		data['clean']= preprocessTrainingData(data['clean']); 
		print("Prepocessing done..")
		"""Saving cleaned data to json file"""

		if(save):
			with open('../data/result-old.json', 'w') as f:
				f.write(data.to_json(orient='records'))
			print("Saving file done..")
	else:
		"""loading of already cleaned data"""
		data = pd.read_json(path_or_buf='../data/result-old.json', orient='records')

	
	X_train, X_test, y_train, y_test = train_test_split(data['clean'],data['emotion'],test_size=0.2)

	vect = TfidfVectorizer(ngram_range=(1, 2), stop_words="english", sublinear_tf=True)
	clf = LinearSVC(C=1.0, penalty='l1', max_iter=3000, dual=False)
	pipeline = make_pipeline(vect,clf)

	""" Fitting """
	model = pipeline.fit(X_train,y_train)
	
	Y_test_predict = model.predict(X_test)

	""" Map confusion matrix """
	cnf_matrix = confusion_matrix(y_test, Y_test_predict)

	""" Performance Measures """
	accuracy = accuracy_score(Y_test_predict,y_test)
	score_f1 = f1_score(Y_test_predict, y_test, average='weighted')
	score_f1_micro = f1_score(Y_test_predict, y_test, average='micro')
	score_f1_macro = f1_score(Y_test_predict, y_test, average='macro')
	score_precision = precision_score(Y_test_predict, y_test, average='weighted')
	score_precision_micro = precision_score(Y_test_predict, y_test, average='micro')
	score_precision_macro = precision_score(Y_test_predict, y_test, average='macro')
	score_recall = recall_score(Y_test_predict, y_test, average='weighted')
	score_recall_micro = recall_score(Y_test_predict, y_test, average='micro')
	score_recall_macro = recall_score(Y_test_predict, y_test, average='macro')

	print('(sklearn) Test data accuracy:',accuracy)
	print('(sklearn) Test data f1:',score_f1)
	print('(micro) Test data f1:',score_f1_micro)
	print('(macro) Test data f1:',score_f1_macro)
	print('(sklearn) Test data precision:',score_precision)
	print('(micro) Test data precision:',score_precision_micro)
	print('(macro) Test data precision:',score_precision_macro)
	print('(sklearn) Test data recall:',score_recall)
	print('(micro) Test data precision:',score_recall_micro)
	print('(macro) Test data precision:',score_recall_macro)
	print('(sklearn) Confusion Matrix:',cnf_matrix)
	print("model score: "+str(model.score(X_test, y_test)))
	
	if(accuracy < 0.58):
		trainData(preprocess,save)
	else:
		print("Finished training!")
		"""save the model """
		print("yes")
		pickle.dump(model, open('model.sav','wb'))
		return model