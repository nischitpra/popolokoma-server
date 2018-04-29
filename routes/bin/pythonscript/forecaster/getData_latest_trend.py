import numpy as np
import random
from sklearn.preprocessing import Normalizer



class CryptoData(object):
    def __init__(self,
                 stock_sym,
                 df,
                 labels,
                 input_size=1,
                 num_steps=30,
                 test_ratio=0.1,
                 normalized=True):
        self.stock_sym = stock_sym
        self.input_size = input_size
        self.num_steps = num_steps
        self.test_ratio = test_ratio
        self.normalized = normalized
        self.training_data = df
        self.labels = labels
        # labels = labels.drop(0)
        dates = labels.iloc[:, 1].values.tolist()
        df = df.drop([0, 1, 2], axis=1)
        df = df.drop(0)
        labels = labels.drop([0, 1, 2], axis=1)
        x = df.values.tolist()
        y = labels.values.tolist()
        for i in range(0, len(x)):
            for j in range(0, len(x[i])):
                x[i][j] = float(x[i][j])
            for k in range(0, len(y[i])):
                y[i][k] = float(y[i][k])
        x = np.array(x)
        y = np.array(y)
        x, self.mu, self.sigma = feature_normalize(x)
        y, l, m = feature_normalize(y)
        x = x.flatten('C')
        i = num_steps
      
        seq = [np.array(x[i * input_size: (i + 1) * input_size]) for i in range(len(x) // input_size)]
        X_raw_seq = np.array([seq[i: i + num_steps] for i in range(len(seq)-num_steps)])


        y_raw_seq = np.array([y[i + num_steps] for i in range(len(y) - num_steps)])

        dates_y = np.array([dates[i + num_steps] for i in range(len(dates)-num_steps)])
        train_size = int(len(X_raw_seq) * 1)#Because you want to predict
        self.train_X, self.test_X = X_raw_seq[:train_size], X_raw_seq[train_size:]
        self.train_y, self.test_y = y_raw_seq[:train_size], y_raw_seq[train_size:]
        self.dates = dates_y[train_size:]
        self.dates = np.array(self.dates)

    def prepare_data(self,X_seq,y_seq,num,train_size):
        return train_X, train_y, test_X, test_y





    def generate_one_epoch(self, batch_size):
        num_batches = int(len(self.train_X)) // batch_size
        if batch_size * num_batches < len(self.train_X):
            num_batches += 1
        batch_indices = list(range(num_batches))
        random.shuffle(batch_indices)
        for j in batch_indices:
            batch_X = self.train_X[j * batch_size: (j + 1) * batch_size]
            batch_y = self.train_y[j * batch_size: (j + 1) * batch_size]
            yield batch_X, batch_y

def feature_normalize(dataset):
    mu = np.mean(dataset,axis=0)
    sigma = np.std(dataset,axis=0)
    return ((dataset - mu)/sigma),mu,sigma