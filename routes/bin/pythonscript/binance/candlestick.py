import pandas as pd
import sys
from pymongo import MongoClient

base_path='/Users/oyo/Desktop/awesome/tweets/'

client = MongoClient()
client = MongoClient('localhost', 27017)
db = client.coins

key=sys.argv[1]
isNew=sys.argv[2]

df=pd.DataFrame(list(db.candlestick_dump.find()))
df.columns = ['_id', 'open','high','low','close','volume','close_time','quote_asset_volume','number_of_trades','taker_buy_base_asset_volume','taker_buy_quote_asset_volume','Ignore']
df=df.drop(['close_time','Ignore'],axis=1)

if isNew:
    entryTime=db[key].find({}).sort('_id',-1).limit(1).next()['_id']
    df=df[df['_id']>entryTime]
else:
    entryTime=db[key].find({}).sort('_id',1).limit(1).next()['_id']
    df=df[df['_id']<entryTime]
    
db[key].insert_many(df.to_dict(orient='records'))
db.candlestick_dump.drop()

print('ok'.format(df.shape[0]))
sys.stdout.flush()