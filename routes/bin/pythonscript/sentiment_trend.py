import pandas as pd
from pymongo import MongoClient
from bson.objectid import ObjectId
import sys
import json
base_path='/Users/oyo/Desktop/awesome/tweets/'
window_size=60*60 # per hour

client = MongoClient()
client = MongoClient('mongodb://heroku_w06gvgdc:39i4hl2t7g5fqejfb07jbb9gf4@ds241059.mlab.com:41059/heroku_w06gvgdc')
db_name="heroku_w06gvgdc"
db = client[db_name]

# Loading data and preparation
last_insert=list(db.sentiment_trend.find().sort('time',-1).limit(1))
if len(last_insert)>0:
    cursor=db.good_bad_tweets.aggregate([{'$match': { '_id':{'$gte':last_insert[0]['_id']} }},
                                         {'$lookup':{
                                             'from': "tweets",
                                             'localField': "_id",
                                             'foreignField': "_id",
                                             'as': "tweet"
                                         }},
                                         {'$sort':{'timestamp':1}}
                                        ],allowDiskUse=True)
    m_df=pd.DataFrame(list(cursor))
else:
    m_df=pd.DataFrame(list(db.good_bad_tweets.find()))

if m_df.empty:
    print("no good bad tweets found")
    sys.exit(0)
df=pd.DataFrame()
df['category']=m_df['category'].copy()
df['timestamp']=m_df['timestamp']
df['probability']=m_df['probability']
df['_id']=m_df['_id']

# Main
endTime=df['timestamp'].iloc[0]+window_size

senti_df=pd.DataFrame()
open_list=[]
close_list=[]
high_list=[]
low_list=[]
time_list=[]
id_list=[]
if len(last_insert)==0:
    opn=1000.0
    close=opn
    high=opn
    low=opn
else:
    opn=last_insert[0]['close']
    close=opn
    high=opn
    low=opn
checkpoint_id=0.0
for i in range(df.shape[0]):
    if df['timestamp'].iloc[i]>=endTime:
        senti_df=senti_df.append({'_id':df['_id'].iloc[i],'time':endTime,'open':opn,'high':high,'low':low,'close':close},ignore_index=True)
        endTime+=window_size
        opn=close
        close=opn
        high=opn
        low=opn
    if df['category'].iloc[i]==0:
        close+=df['probability'].iloc[i]
    elif df['category'].iloc[i]==1.0:
        close-=df['probability'].iloc[i]
    elif df['category'].iloc[i]==4.0:
        close+=df['probability'].iloc[i]
#     close+=df['probability'].iloc[i] if df['category'].iloc[i]==0 else -df['probability'].iloc[i]
    low=close if close<low else low
    high=close if close>high else high


if not senti_df.empty:
    db.sentiment_trend.insert_many(senti_df.to_dict(orient='records'))
    print('{} rows added'.format(senti_df.shape[0]))
else:
    print('no rows filtered')
sys.stdout.flush()