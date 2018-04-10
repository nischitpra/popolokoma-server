import sys
import tensorflow as tf
from getData import CryptoData
from model_rnn import LstmRNN
import numpy as np
import pandas as pd
from scipy.signal import argrelextrema
from pymongo import MongoClient


# database connection
client = MongoClient()
client = MongoClient('mongodb://nischit:nischit-root@ds241059.mlab.com:41059/heroku_w06gvgdc')
db = client.coins



flags = tf.app.flags
flags.DEFINE_integer("crypto_count", 1, "Crypto count [1]")
flags.DEFINE_integer("input_size", 4, "Input size [4]")
flags.DEFINE_integer("output_size", 4, "Output size [1]")
flags.DEFINE_integer("num_steps", 1, "Num of steps [30]")
flags.DEFINE_integer("num_layers", 1, "Num of layer [1]")
flags.DEFINE_integer("lstm_size", 128, "Size of one LSTM cell [128]")
flags.DEFINE_integer("batch_size", 62, "The size of batch images [64]")
flags.DEFINE_float("keep_prob", 0.8, "Keep probability of dropout layer. [0.8]")
flags.DEFINE_float("init_learning_rate", 0.001, "Initial learning rate at early stage. [0.001]")
flags.DEFINE_float("learning_rate_decay", 0.99, "Decay rate of learning rate. [0.99]")
flags.DEFINE_integer("init_epoch", 5, "Num. of epoches considered as early stage. [5]")
flags.DEFINE_integer("max_epoch", 20, "Total training epoches. [50]")
flags.DEFINE_integer("embed_size", None, "If provided, use embedding vector of this size. [None]")
flags.DEFINE_string("stock_symbol", None, "Target stock symbol [None]")
flags.DEFINE_integer("sample_size", 4, "Number of stocks to plot during training. [4]")
flags.DEFINE_boolean("train", True, "True for training, False for testing [False]")

FLAGS = flags.FLAGS

def load_data(input_size, num_steps, fsym, tsym, training_data, target_symbol=None, test_ratio=0.05):
        return [
            CryptoData(
                target_symbol,
                fsym=fsym,
                tsym=tsym,
                df = training_data,
                input_size=input_size,
                num_steps=num_steps,
                test_ratio=test_ratio)
        ]


def checkTrendChange(result):
    result = feature_unnormalize(result)
    n = len(local_minima[0])
    m = len(local_maxima[0])
    # print(result[0][0])
    # print(local_minima[0][n-1])
    # print(local_maxima[0][m-1])
    # print(result)
    if result[0][0] > local_maxima[0][m-1] or result[0][0] < local_minima[0][n-1]:
        return False, result
    return True, result



def main(_):
    sys.stdout.flush()
    history_df=pd.DataFrame(db.history.find({'_id':sys.argv[1]}).next()['history'])
    history_df['senti']=np.zeros(history_df.shape[0])
    x_df=history_df.drop(columns=['time'])

    df=x_df.copy()
    y = df.iloc[-357:-1,0].values.tolist()
    for i in range(0,len(y)):
        y[i] = float(y[i])
    global local_minima, local_maxima
    local_maxima, local_minima = get_maxima_and_minima(np.array(y))
    # print(local_maxima)
    # print(local_minima)
    check =True
    with tf.Session() as sess:
        rnn_model_new = LstmRNN(
            sess,
            FLAGS.crypto_count,
            lstm_size=FLAGS.lstm_size,
            num_layers=FLAGS.num_layers,
            num_steps=FLAGS.num_steps,
            input_size=FLAGS.input_size,
            embed_size=FLAGS.embed_size,
            output_size=FLAGS.output_size
        )
        data = load_data(
            FLAGS.input_size,
            FLAGS.num_steps,
            'BTC',
            'USD',
            training_data=df,
            target_symbol=FLAGS.stock_symbol
        )
        # print(data[0].sigma)
        # print(data[0].mu)
        global sigma
        global mu
        sigma = data[0].sigma
        mu = data[0].mu
    final_test_pred = rnn_model_new.train(data, FLAGS,'BTC',1)
    # final_test_pred = final_test_pred[-1].reshape(1,4)
    FINAL_RESULT = []
    while check == True:
        modelExists, counter, result = rnn_model_new.load(final_test_pred)
        check, result = checkTrendChange(result)
        FINAL_RESULT=result
    res_df=pd.DataFrame(FINAL_RESULT)
    res_df.columns = ['close', 'high','open','low']

    res_df['close']=[float(item) for item in res_df['close']]
    res_df['high']=[float(item) for item in res_df['high']]
    res_df['open']=[float(item) for item in res_df['open']]
    res_df['low']=[float(item) for item in res_df['low']]
    res_df['time']=history_df['time'].iloc[-1]+np.arange(res_df['low'].shape[0])*24*60*60
    val={'_id':sys.argv[1],'history':res_df.to_dict(orient='records')}
    
    print(res_df.shape)
    if not res_df.empty:
        print('inserting into database')



# should remove this. only ment for as a quick hack
        db.forecast.drop()
        
        
        
        
        db.forecast.insert_one(val)
        print('forecast added to db'.format(res_df.shape[0]))
    else:
        print('could not forecast')

    sys.stdout.flush()


def feature_unnormalize(dataset):
    return ((dataset*sigma)+mu)

def get_maxima_and_minima(closingPrices):
    local_minima = []
    local_maxima = []
    local_maxima.append(closingPrices[argrelextrema(closingPrices, np.greater)])
    local_minima.append(closingPrices[argrelextrema(closingPrices, np.less)])
    return local_minima,local_maxima


tf.app.run(main=main)