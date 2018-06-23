import sys
import tensorflow as tf
from getData_latest_trend import CryptoData
from preprocessData import process
from model_rnn_new import LstmRNN
import numpy as np
import pandas as pd
import pickle
import os
import psycopg2

connection=psycopg2.connect(os.environ['database'])
cur=connection.cursor()

base_path='/app/routes/bin/pythonscript'
total_window_size=4*24 #4 day


flags = tf.app.flags
flags.DEFINE_integer("crypto_count", 1, "Crypto count [1]")
flags.DEFINE_integer("input_size", 7, "Input size [4]")
flags.DEFINE_integer("output_size", 2, "Output size [1]")
flags.DEFINE_integer("num_steps", 10, "Num of steps [30]")
flags.DEFINE_integer("num_layers", 2, "Num of layer [1]")
flags.DEFINE_integer("lstm_size", 128, "Size of one LSTM cell [128]")
flags.DEFINE_integer("batch_size", 62, "The size of batch images [64]")
flags.DEFINE_float("keep_prob", 0.8, "Keep probability of dropout layer. [0.8]")
flags.DEFINE_float("init_learning_rate", 0.001, "Initial learning rate at early stage. [0.001]")
flags.DEFINE_float("learning_rate_decay", 0.99, "Decay rate of learning rate. [0.99]")
flags.DEFINE_integer("init_epoch", 3, "Num. of epoches considered as early stage. [5]")
flags.DEFINE_integer("max_epoch", 2000, "Total training epoches. [50]")
flags.DEFINE_integer("embed_size", None, "If provided, use embedding vector of this size. [None]")
flags.DEFINE_string("stock_symbol", None, "Target stock symbol [None]")
flags.DEFINE_integer("sample_size", 4, "Number of stocks to plot during training. [4]")
flags.DEFINE_boolean("train", True, "True for training, False for testing [False]")

FLAGS = flags.FLAGS
coins=['ETH','CND','IOTA','XRP','LTC','DASH','EOS','GAS','COE','POE','ADA','NEO','RPX', 'MANA', 'ONT', 'BNB', 'TRX', 'XEM']
dir = 'C:\\Users\\SHYAM\\OneDrive\\CryptoCompare\\DataValuesNewApproach2\\'
lab = 'C:\\Users\\SHYAM\\OneDrive\\CryptoCompare\\DataLabelsNewApproach2\\'


def load_data(input_size, num_steps,training_data, labels, target_symbol=None, test_ratio=0.2):
        return [
            CryptoData(
                target_symbol,
                df = training_data,
                labels = labels,
                input_size=input_size,
                num_steps=num_steps,
                test_ratio=test_ratio)
        ]

def predict(df, lab):
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
        # data = load_data(
        #     FLAGS.input_size,
        #     FLAGS.num_steps,
        #     training_data=df,
        #     labels=lab,
        #     target_symbol=FLAGS.stock_symbol
        # )


        print('df:',df.head,'\n\n\n labels:',lab)

        # pred = rnn_model_new.load(sess= sess, data= data[0].train_X)
        # pred = np.array(pred)
        # final_result = (pred*data[0].sigma)+data[0].mu
        return df


def train(_):
    final_pred = []
    list = os.listdir(dir)
    i = 34
    for f in list:
        df = pd.read_csv(dir + f, sep='\t', header=None)
        y = pd.read_csv(lab + f, sep='\t', header=None)
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
                training_data=df,
                labels= y,
                target_symbol=FLAGS.stock_symbol
             )
        if i ==0:
            result = rnn_model_new.train(sess, data, FLAGS, i)
        else:
            final_test_pred = rnn_model_new.load(sess= sess, data= data, configs= FLAGS, i=i)
        i =i +1
        tf.reset_default_graph()

def main(_):
    cur.execute("select * from (select * from {} order by cast(_id as BIGINT) desc limit {}) as data order by cast(_id as bigint) asc;".format(sys.argv[1],total_window_size))
    df = pd.DataFrame(list(cur.fetchall()))
    preped_df,labs=process(df)
    result=predict(preped_df, labs)
    print('result:',result)
    sys.stdout.flush()



tf.app.run(main=main)