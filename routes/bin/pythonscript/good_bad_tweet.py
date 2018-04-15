import sys
import json
import pandas as pd
import numpy as np
import math
from datetime import datetime
import re
from nltk.corpus import stopwords
from nltk.stem.snowball import EnglishStemmer
import pickle
from pymongo import MongoClient
from bson.objectid import ObjectId


# Mongodb settings
client = MongoClient()
client = MongoClient('mongodb://heroku_w06gvgdc:39i4hl2t7g5fqejfb07jbb9gf4@ds241059.mlab.com:41059/heroku_w06gvgdc')
db_name = 'heroku_w06gvgdc'
db = client[db_name]

base_path='/app/routes/bin/pythonscript'
HISTORY_TYPE=1*60*60*24 #1 day


stemmer = EnglishStemmer()
stop_words = pickle.load(open(base_path+'/saved_classifier/stopwords.sav', 'rb'))
my_stop_words='to and http https com co www'
stop_words=stop_words+my_stop_words.split()

def preprocess(_df):
    if 'text' not in _df:
        return pd.DataFrame({'text':[]})
    _df['text']=_df['text'].apply(lambda tweet:str(tweet).lower() if str(tweet).count('#')<=3 else '')
    _df['text']=_df['text'].apply(lambda tweet:re.sub('[^ ]+\.[^ ]+','',tweet))
#     _df['text']=_df['text'].apply(lambda tweet:re.sub('#[^ ]+','',tweet))
    _df['text']=_df['text'].apply(lambda tweet:re.sub('[^a-z.A-Z0-9.!? ]',' ',(tweet)))
    _df['text']=_df['text'].apply(lambda tweet:' '.join([word for word in tweet.strip().split() if word not in stop_words]))
    _df['text']=_df['text'].apply(lambda tweet:stemmer.stem(tweet.strip()))
    return _df

def time_to_milli(_time):
    return round(_time.timestamp())

def to_time(from_time,window_size):
    return from_time+window_size*HISTORY_TYPE

def slice_tweets(tweets,from_time):
    window_size=1
    return tweets[(tweets['timestamp']>=from_time) & (tweets['timestamp']<to_time(from_time,window_size))]

def sentiment(timestamp,df):
    df=df.set_index(np.arange(df.shape[0]))
    #Preprocess
    p_df=preprocess(df.copy())
    p_df=p_df[p_df['text']!='']
    p_df=p_df[p_df['timestamp']>0]
    if p_df.empty: 
        return None
    probability=classifier.predict_proba(p_df['text'])
    
    proba_df=pd.DataFrame()
    print('current time: ',timestamp)
    for i,row in enumerate(probability):
        if row[0]>0.5 and np.argmax(row)==0: # good 
            proba_df=proba_df.append({'_id':p_df['_id'].iloc[i],'timestamp':p_df['timestamp'].iloc[i],'category':0,'probability':row[0]},ignore_index=True)
        elif row[1]>0.5 and np.argmax(row)==1: # bad
            proba_df=proba_df.append({'_id':p_df['_id'].iloc[i],'timestamp':p_df['timestamp'].iloc[i],'category':1,'probability':row[1]},ignore_index=True)
        elif row[4]>0.5 and np.argmax(row)==4: # less good
            proba_df=proba_df.append({'_id':p_df['_id'].iloc[i],'timestamp':p_df['timestamp'].iloc[i],'category':4,'probability':row[4]},ignore_index=True)
        elif np.argmax(row)==2:
            proba_df=proba_df.append({'_id':p_df['_id'].iloc[i],'timestamp':p_df['timestamp'].iloc[i],'category':2,'probability':row[2]},ignore_index=True)
        else:
            proba_df=proba_df.append({'_id':p_df['_id'].iloc[i],'timestamp':p_df['timestamp'].iloc[i],'category':3,'probability':row[3]},ignore_index=True)

    return [proba_df]

# Twitter Dataset
gb_l=list(db.good_bad_tweets.find().sort('_id',1))

record_exists=len(gb_l)>0

if record_exists:
    print('old record exists')
    last_id=gb_l[-1]['_id']
    main_df=pd.DataFrame(list(db.tweets.find({'_id': {'$gt': ObjectId(last_id)}}).sort('_id',1).limit(5000)))
else:
    print('fresh start')
    main_df=pd.DataFrame(list(db.tweets.find().sort('_id',1).limit(5000)))
    
if main_df.empty:
    print('no values to process')
    sys.exit()
    
main_df=main_df.drop_duplicates(subset=['_id'], keep='first')
print('{} many tweets found'.format(main_df.shape[0]))


tweet_dataset=main_df[['_id','text','created_at']].copy()
tweet_dataset.columns = ['_id', 'text','timestamp']
tweet_dataset['timestamp']=pd.to_datetime(tweet_dataset['timestamp'])
tweet_dataset['timestamp'] = [time_to_milli(_time) for _time in tweet_dataset['timestamp']] 
tweet_df = tweet_dataset.sort_values(['timestamp'], ascending=True)

# Saved Model
classifier = pickle.load(open(base_path+'/saved_classifier/good_bad_classifier.sav', 'rb'))

# Main Loop
current_date=tweet_df['timestamp'].iloc[0]
last_date=tweet_df['timestamp'].iloc[-1]
step=HISTORY_TYPE

print('current: {} last: {}'.format(current_date,last_date))

final_proba_df=pd.DataFrame()

for time_milli in range(current_date,last_date+step,step):
    day_tweets=slice_tweets(tweet_df,time_milli)
    x=sentiment(time_milli,day_tweets.copy())
    if x!=None:
        [proba_df]=x
        final_proba_df=pd.concat([final_proba_df,proba_df])

if not final_proba_df.empty:
    final_proba_df=final_proba_df.drop_duplicates(['_id'],keep='first')
    db.good_bad_tweets.insert_many(final_proba_df.to_dict(orient='records'))
    print('{} rows filtered'.format(final_proba_df.shape[0]))
else:
    print('no rows filtered')

sys.stdout.flush()