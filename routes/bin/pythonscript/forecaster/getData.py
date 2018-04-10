import numpy as np
import random



class CryptoData(object):
    def __init__(self,
                 stock_sym,
                 fsym,
                 tsym,
                 df,
                 input_size=1,
                 num_steps=30,
                 test_ratio=0.1,
                 normalized=True):
        self.stock_sym = stock_sym
        self.fsym = fsym
        self.tsym = tsym
        self.input_size = input_size
        self.num_steps = num_steps
        self.test_ratio = test_ratio
        self.normalized = normalized
        self.training_data = df

        x = df.iloc[-357:-1, [0, 1, 2, 3]].values.tolist()
        dates = df.iloc[-357:-1, 4].values.tolist()
        for i in range(0, len(x)):
            for j in range(0, len(x[i])):
                x[i][j] = float(x[i][j])
        x = np.array(x)
        raw_seq, self.mu, self.sigma = feature_normalize(x)
        num = len(raw_seq)
        train_size = int(num * 0.8)
        dates = dates[train_size + 2:len(raw_seq)]
        self.dates = np.array(dates)
        self.dates = np.array(dates)
        self.train_X, self.train_y, self.test_X, self.test_y = self.prepare_data(raw_seq,num,train_size)



    def prepare_data(self,seq,num,train_size):
        X_train = seq[0:train_size]
        X_train = X_train.reshape(train_size,1,4)
        X_train = np.array(X_train)
        y_train = seq[1:train_size+1]
        y_train = [[l[i] for i in [0,1,2,3]]for l in y_train]
        y_train = np.array(y_train)
        X_test = seq[train_size+1:len(seq)-1]
        X_test = X_test.reshape(len(X_test),1,4)
        X_test = np.array(X_test)
        y_test = seq[train_size+2:len(seq)]
        y_test = [[l[i] for i in [0,1,2,3]]for l in y_test]
        y_test = np.array(y_test)

        return X_train, y_train, X_test, y_test





    def generate_one_epoch(self, batch_size):
        num_batches = int(len(self.train_X)) // batch_size
        if batch_size * num_batches < len(self.train_X):
            num_batches += 1
        batch_indices = list(range(num_batches))
        random.shuffle(batch_indices)
        for j in batch_indices:
            batch_X = self.train_X[j * batch_size: (j + 1) * batch_size]
            batch_y = self.train_y[j * batch_size: (j + 1) * batch_size]
            #assert set(map(len, batch_X)) == {self.num_steps}
            yield batch_X, batch_y

def feature_normalize(dataset):
    mu = np.mean(dataset,axis=0)
    sigma = np.std(dataset,axis=0)
    return ((dataset - mu)/sigma),mu,sigma