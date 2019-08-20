import preprocessing
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

""" DATA PREPROCESSING of Training data """

# data = pd.read_json(path_or_buf='../../data/corpus.json', orient='records')
# data['clean']= data['content']
# data['clean']= preprocessing.preprocessTrainingData(data['clean']); 
# print(data['clean'])


"""Saving cleaned data to json file"""

# with open('../../data/result.json', 'w') as f:
#     f.write(data.to_json(orient='records'))

data = pd.read_json(path_or_buf='../../data/result.json', orient='records')

X_train, X_test, y_train, y_test = train_test_split(data['clean'],data['emotion'],test_size=0.2)

vect = TfidfVectorizer(ngram_range=(1, 2), stop_words="english", sublinear_tf=True)
clf = LinearSVC(C=1.0, penalty='l1', max_iter=3000, dual=False)
#clf = SVC(C=1000, decision_function_shape='ovr', kernel='rbf', probability=True, verbose=True)
pipeline = make_pipeline(vect,clf)

model = pipeline.fit(X_train,y_train)

#X_test_predict = model.predict(X_test)
Y_test_predict = model.predict(X_test)

accuracy = accuracy_score(Y_test_predict,y_test)
score_f1 = f1_score(Y_test_predict, y_test, average='weighted')
score_precision = precision_score(Y_test_predict, y_test, average='weighted')
score_recall = recall_score(Y_test_predict, y_test, average='weighted')

cm = confusion_matrix(Y_test_predict,y_test,labels=["happy","sad","angry","amazed","neutral"])

print('(sklearn) Test data accuracy:',accuracy)
print('(sklearn) Test data f1:',score_f1)
print('(sklearn) Test data precision:',score_precision)
print('(sklearn) Test data recall:',score_recall)
print('(sklearn) Confusion Matrix:',cm)
print("model score: "+str(model.score(X_test, y_test)))

print(model.predict(["i am sad", "i am happy", "wow", "i hate you cunt you piss me off"]))

if(accuracy > 0.59):
	"""save the model """
	print("yes")
	pickle.dump(model, open('finalized_model.sav','wb'))

""" Testing of pickle """
#loaded_model= pickle.load(open('finalized_model.sav','rb'))
#print(loaded_model.predict(["i am sad", "i am happy", "wow", "i hate you you cunt"]))