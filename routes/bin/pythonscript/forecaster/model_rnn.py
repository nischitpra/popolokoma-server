import numpy as np
import os
import random
import re
import time
import tensorflow as tf
import matplotlib.pyplot as plt

base_path_nhuche='/app/routes/bin/pythonscript'
base_path_pandu="C:\\Users\\SHYAM\\OneDrive\\UBUNTU LATEST BACKUP\\"

class LstmRNN(object):
    def __init__(self, sess, crypto_count,
                 lstm_size=128,
                 num_layers=1,
                 num_steps=30,
                 input_size=1,
                 embed_size=None,
                 logs_dir="logs",
                 plots_dir="images",
                 output_size=1):
        self.sess = sess
        self.crypto_count = crypto_count

        self.lstm_size = lstm_size
        self.num_layers = num_layers
        self.num_steps = num_steps
        self.input_size = input_size
        self.output_size = output_size

        self.use_embed = (embed_size is not None) and (embed_size > 0)
        self.embed_size = embed_size or -1

        self.logs_dir = logs_dir
        self.plots_dir = plots_dir

        self.build_graph()

    def build_graph(self):
        """
        The model asks for five things to be trained:
        - learning_rate
        - keep_prob: 1 - dropout rate
        - symbols: a list of stock symbols associated with each sample
        - input: training data X
        - targets: training label y
        """
        # inputs.shape = (number of examples, number of input, dimension of each input).
        self.learning_rate = tf.placeholder(tf.float32, None, name="learning_rate")
        self.keep_prob = tf.placeholder(tf.float32, None, name="keep_prob")

        # Stock symbols are mapped to integers.
        #self.symbols = tf.placeholder(tf.int32, [None, 1], name='coin_labels')

        self.inputs = tf.placeholder(tf.float32, [None, self.num_steps, self.input_size], name="inputs")
        self.targets = tf.placeholder(tf.float32, [None,self.output_size], name="targets")

        def _create_one_cell():
            lstm_cell = tf.contrib.rnn.LSTMCell(self.lstm_size, state_is_tuple=True)
            lstm_cell = tf.contrib.rnn.DropoutWrapper(lstm_cell, output_keep_prob=self.keep_prob)
            return lstm_cell

        cell = tf.contrib.rnn.MultiRNNCell(
            [_create_one_cell() for _ in range(self.num_layers)],
            state_is_tuple=True
        ) if self.num_layers > 1 else _create_one_cell()

        self.inputs_with_embed = tf.identity(self.inputs)
        self.embed_matrix_summ = None
        #val = tf.Variable()
        # Run dynamic RNN
        val, state_ = tf.nn.dynamic_rnn(cell, self.inputs_with_embed, dtype=tf.float32, scope="dynamic_rnn")
        # Before transpose, val.get_shape() = (batch_size, num_steps, lstm_size)
        # After transpose, val.get_shape() = (num_steps, batch_size, lstm_size)
        val = tf.transpose(val, [1, 0, 2])

        last = tf.gather(val, int(val.get_shape()[0]) - 1, name="lstm_state")
        #last = tf.dynamic_partition(val, int(val.get_shape()[0]) - 1,1, name="lstm_state")
        ws = tf.Variable(tf.truncated_normal([self.lstm_size, self.output_size]), name="w")
        bias = tf.Variable(tf.constant(0.1, shape=[self.output_size]), name="b")
        self.pred = tf.matmul(last, ws) + bias

        self.last_sum = tf.summary.histogram("lstm_state", last)
        self.w_sum = tf.summary.histogram("w", ws)
        self.b_sum = tf.summary.histogram("b", bias)
        self.pred_summ = tf.summary.histogram("pred", self.pred)

        # self.loss = -tf.reduce_sum(targets * tf.log(tf.clip_by_value(prediction, 1e-10, 1.0)))
        self.loss = tf.reduce_mean(tf.square(self.pred - self.targets), name="loss_mse_train")
        self.optim = tf.train.RMSPropOptimizer(self.learning_rate).minimize(self.loss, name="rmsprop_optim")

        # Separated from train loss.
        self.loss_test = tf.reduce_mean(tf.square(self.pred - self.targets), name="loss_mse_test")

        self.loss_sum = tf.summary.scalar("loss_mse_train", self.loss)
        self.loss_test_sum = tf.summary.scalar("loss_mse_test", self.loss_test)
        self.learning_rate_sum = tf.summary.scalar("learning_rate", self.learning_rate)

        self.t_vars = tf.trainable_variables()
        self.saver = tf.train.Saver()


    def train(self, dataset_list, config, to, i):

        self.merged_sum = tf.summary.merge_all()
        self.sess.run(tf.global_variables_initializer())

        # Merged test data of different stocks.
        merged_test_X = []
        merged_test_y = []
        merged_test_labels = []
        dates = []

        for label_, d_ in enumerate(dataset_list):
            merged_test_X += list(d_.test_X)
            merged_test_y += list(d_.test_y)
            merged_test_labels += [[label_]] * len(d_.test_X)
            dates += list(d_.dates)

        merged_test_X = np.array(merged_test_X)
        merged_test_y = np.array(merged_test_y)
        merged_test_labels = np.array(merged_test_labels)



        test_data_feed = {
            self.learning_rate: 0.0,
            self.keep_prob: 1.0,
            self.inputs: merged_test_X,
            self.targets: merged_test_y,
        }

        global_step = 0

        num_batches = sum(len(d_.train_X) for d_ in dataset_list) // config.batch_size
        random.seed(time.time())

        sample_labels = range(min(config.sample_size, len(dataset_list)))
        sample_indices = {}
        for l in sample_labels:
            sym = dataset_list[l].stock_sym
            target_indices = np.array([
                i for i, sym_label in enumerate(merged_test_labels)
                if sym_label[0] == l])
            sample_indices[sym] = target_indices


        test_pred = []
        for epoch in range(config.max_epoch):
            epoch_step = 0
            learning_rate = config.init_learning_rate * (
                config.learning_rate_decay ** max(float(epoch + 1 - config.init_epoch), 0.0)
            )

            for label_, d_ in enumerate(dataset_list):
                for batch_X, batch_y in d_.generate_one_epoch(config.batch_size):
                    global_step += 1
                    epoch_step += 1
                    batch_labels = np.array([[label_]] * len(batch_X))
                    train_data_feed = {
                        self.learning_rate: learning_rate,
                        self.keep_prob: config.keep_prob,
                        self.inputs: batch_X,
                        self.targets: batch_y,
                    }
                    train_loss, _, train_merged_sum = self.sess.run(
                        [self.loss, self.optim, self.merged_sum], train_data_feed)
                    test_loss, test_pred = self.sess.run([self.loss_test, self.pred], test_data_feed)
                    # print("Step:%d [Epoch:%d] [Learning rate: %.6f] train_loss:%.6f test_loss:%.6f", global_step, epoch,
                        #   learning_rate, train_loss, test_loss)


        final_pred, final_loss = self.sess.run([self.pred, self.loss], test_data_feed)
        
        # Save the final model
        self.save(global_step,to)
        return final_pred

    @property
    def model_name(self):
        name = "stock_rnn_lstm%d_step%d_input%d" % (
            self.lstm_size, self.num_steps, self.input_size)

        if self.embed_size > 0:
            name += "_embed%d" % self.embed_size

        return name

    @property
    def model_plots_dir(self):
        model_plots_dir = os.path.join(self.plots_dir, self.model_name)
        if not os.path.exists(model_plots_dir):
            os.makedirs(model_plots_dir)
        return model_plots_dir

    @property
    def model_logs_dir(self):
        model_logs_dir = os.path.join(self.logs_dir, self.model_name)
        if not os.path.exists(model_logs_dir):
            os.makedirs(model_logs_dir)
        return model_logs_dir

    def save(self, step,to):
        model_name = self.model_name + ".model"
        self.saver.save(
            self.sess,
            os.path.join(base_path_nhuche+"/forecaster/saved_model", model_name),
            global_step=step
        )

    def load(self,predict_X):
        ckpt = tf.train.get_checkpoint_state(base_path_nhuche+"/forecaster/saved_model")
        # print ('checkpoint: ',ckpt)        
        if ckpt and ckpt.model_checkpoint_path:
            ckpt_name = os.path.basename(ckpt.model_checkpoint_path)
            self.saver.restore(self.sess, os.path.join(base_path_nhuche+"/forecaster/saved_model", ckpt_name))
            counter = int(next(re.finditer("(\d+)(?!.*\d)", ckpt_name)).group(0))
            predict_X = predict_X.reshape(predict_X.shape[0],1,predict_X.shape[1])
            pred_feed_dict = {
                self.learning_rate: 0.0,
                self.keep_prob: 1.0,
                self.inputs: predict_X,
            }
            results = self.sess.run(self.pred, pred_feed_dict)
            return True, counter, results
        else:
            return False, 0,[[],[],[],[]]

    def plot_samples(self, preds, targets, figname, stock_sym=None, multiplier=5):
        def _flatten(seq):
            return np.array([x for y in seq for x in y])
      