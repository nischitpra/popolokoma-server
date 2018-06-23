import sys
import psycopg2
import pandas as pd
import numpy as np
from matplotlib import pyplot as plot
import math
import json

import os


connection=psycopg2.connect(os.environ['database'])
cur=connection.cursor()

plot.rcParams["figure.figsize"] = (20,5)

table_name=sys.argv[1]
window_size=24
day=0
data_count=24*30*8
zoom=24*10

trend_reversal_threshold=3 # if has been decreasing for x hrs 
consolidation_threshold=0.95 # to consider if is consolidating
up_down_trend_threshhold=0.65 # to consider if is uptrend or down trend
volatility_threshold=0.023

def consolidation(day_df):
    high=day_df['high'].mean() 
    low=day_df['low'].mean() 
    index=0
    count=0
    confidence=0
    for i in range(day_df.shape[0]):
        row=day_df.iloc[i]
        if ((low<row['low'])and(row['low']<high)) or ((high>row['high'])and(row['high']>low)) or ((high<=row['high'])and(high>row['low'])) or ((low>=row['low'])and(low<row['high'])):
            confidence=count/(i+1)
            index=i
            count=count+1
        elif i-index > trend_reversal_threshold: # this is to detect trend change
            break
    vel=(day_df['close'].iloc[index]-day_df['close'].iloc[0])/max(count,1)
    return [confidence,index,vel]

def up_trend(day_df):
    index=0
    count=0
    confidence=0
    peak=-1
    for i,high in enumerate(day_df['high']):
        if peak<high:
            peak=high
            confidence=count/(i+1)
            index=i
            count=count+1
        elif i-index > trend_reversal_threshold: # this is to detect trend change
            break
    vel=(day_df['close'].iloc[index]-day_df['close'].iloc[0])/max(count,1)
    return [confidence,index,vel]

def down_trend(day_df):
    index=0
    count=0
    confidence=0
    trough=np.inf
    for i,low in enumerate(day_df['high']):
        if trough>low:
            trough=low
            confidence=count/(i+1)
            index=i
            count=count+1
        elif i-index > trend_reversal_threshold: # this is to detect trend change
            break
    vel=(day_df['close'].iloc[index]-day_df['close'].iloc[0])/max(count,1)
    return [confidence,index,vel]

def consolidation(day_df):
    high=day_df['high'].mean() 
    low=day_df['low'].mean() 
    index=0
    count=0
    confidence=0
    for i in range(day_df.shape[0]):
        row=day_df.iloc[i]
        if ((low<row['low'])and(row['low']<high)) or ((high>row['high'])and(row['high']>low)) or ((high<=row['high'])and(high>row['low'])) or ((low>=row['low'])and(low<row['high'])):
            confidence=count/(i+1)
            index=i
            count=count+1
        elif i-index > trend_reversal_threshold: # this is to detect trend change
            break
    vel=(day_df['close'].iloc[index]-day_df['close'].iloc[0])/max(count,1)
    return [confidence,index,vel]

def up_trend(day_df):
    index=0
    count=0
    confidence=0
    peak=-1
    for i,high in enumerate(day_df['high']):
        if peak<high:
            peak=high
            confidence=count/(i+1)
            index=i
            count=count+1
        elif i-index > trend_reversal_threshold: # this is to detect trend change
            break
    vel=(day_df['close'].iloc[index]-day_df['close'].iloc[0])/max(count,1)
    return [confidence,index,vel]

def down_trend(day_df):
    index=0
    count=0
    confidence=0
    trough=np.inf
    for i,low in enumerate(day_df['high']):
        if trough>low:
            trough=low
            confidence=count/(i+1)
            index=i
            count=count+1
        elif i-index > trend_reversal_threshold: # this is to detect trend change
            break
    vel=(day_df['close'].iloc[index]-day_df['close'].iloc[0])/max(count,1)
    return [confidence,index,vel]

def summary_days(df):
    m_df=df.copy()
    highest=df['high'].max()
    df['high']=df['high']/highest
    df['low']=df['low']/highest
    df['close']=df['close']/highest
    i=0
    trend_df=pd.DataFrame()
    while i < df.shape[0]-1: # 1 day step size
        day_df=df.iloc[i:min(i+window_size,df.shape[0])]
        [confidence,idx,vel]=consolidation(day_df)
        [up_confidence,up_idx,up_price_vel]=up_trend(day_df)
        [down_confidence,down_idx,down_price_vel]=down_trend(day_df)

        if confidence>consolidation_threshold or (up_confidence<up_down_trend_threshhold and down_confidence<up_down_trend_threshhold):
            i=i+max(idx,1)
            trend_df=trend_df.append([[0,m_df['high'].iloc[i],m_df['low'].iloc[i],m_df['close'].iloc[i],m_df['time'].iloc[i]]],ignore_index=True)
        else:
            vel=up_price_vel if abs(up_price_vel)>abs(down_price_vel) else down_price_vel
            if up_confidence > down_confidence:
                i = i + max(up_idx,1)
                trend_df=trend_df.append([[1,m_df['high'].iloc[i],m_df['low'].iloc[i],m_df['close'].iloc[i],m_df['time'].iloc[i]]],ignore_index=True)
            else:
                i= i + max(down_idx,1)
                trend_df=trend_df.append([[-1,m_df['high'].iloc[i],m_df['low'].iloc[i],m_df['close'].iloc[i],m_df['time'].iloc[i]]],ignore_index=True)
    trend_df.columns=['trend','high','low','close','time']
    return trend_df

cur.execute("select cast(high as real), cast(low as real), cast(close as real), cast(_id as bigint) from (select * from {} order by cast(_id as bigint) desc limit {}) as data order by cast(_id as bigint) asc;".format(table_name,data_count))
df = pd.DataFrame(list(cur.fetchall()))
df.columns = ['high', 'low', 'close', 'time']

trend_df=summary_days(df.copy())


res_df=pd.DataFrame()
sup_df=pd.DataFrame()

for i in range(2,trend_df.shape[0]-2):
    if trend_df.iloc[i-2]['high']<trend_df.iloc[i-1]['high'] and trend_df.iloc[i-1]['high']<trend_df.iloc[i]['high'] and trend_df.iloc[i+1]['high']<trend_df.iloc[i]['high'] and trend_df.iloc[i+2]['high']<trend_df.iloc[i+1]['high']:
        res_df=res_df.append(trend_df.iloc[i].copy())
    
    if trend_df.iloc[i-2]['low']>trend_df.iloc[i-1]['low'] and trend_df.iloc[i-1]['low']>trend_df.iloc[i]['low'] and trend_df.iloc[i+1]['low']>trend_df.iloc[i]['low'] and trend_df.iloc[i+2]['low']>trend_df.iloc[i+1]['low']:
        sup_df=sup_df.append(trend_df.iloc[i].copy())

if res_df.empty or sup_df.empty:
    print(json.dumps({'status':'error','message':'res_df or sup_df is empty {}'.format(table_name)}))
    sys.exit()


highest=l_max=df.iloc[-zoom:]['high'].max()
l_min=df.iloc[-zoom:]['low'].min()
        
res_df=res_df.loc[(res_df['high']<=l_max*1.5)&(res_df['high']>=l_min*0.5)]
sup_df=sup_df.loc[(sup_df['low']<=l_max*1.5)&(sup_df['low']>=l_min*0.5)]

res_df['type']=['r']*res_df.shape[0]
sup_df['type']=['s']*sup_df.shape[0]

level_df=pd.concat([res_df,sup_df])

if level_df.empty:
    print(json.dumps({'status':'error','message':'level_df empty {}'.format(table_name)}))
    sys.exit()



# delete previous levels
cur.execute("delete from trend_levels where _key='{}';".format(table_name))

# save levels
query=[]
for index, row in level_df.iterrows():
    query.append("('{}',{},{},{},{},{},'{}')".format(table_name,row['close'],row['high'],row['low'],row['time'],row['trend'],row['type']))
cur.execute("insert into trend_levels (_key, close, high, low, time, trend, type) values {}".format(','.join(query)))

connection.commit()

print(json.dumps({'status':'ok','message':'levels created for {}'.format(table_name)}))
sys.stdout.flush()