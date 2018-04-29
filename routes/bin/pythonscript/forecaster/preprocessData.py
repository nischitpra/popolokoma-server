import pandas as pd
from scipy.signal import argrelextrema
import numpy as np

movingAverageHours = 40
movingWindow = 48

def get_maxima_and_minima(closingPrices):
    local_maxima = closingPrices[argrelextrema(closingPrices, np.greater)]
    local_minima = closingPrices[argrelextrema(closingPrices, np.less)]
    indices_maxima = argrelextrema(closingPrices, np.greater)
    indices_minima = argrelextrema(closingPrices, np.less)
    return local_minima,local_maxima, indices_maxima, indices_minima

def get_local_min_max(closingPrices):
    local_maxima = []
    local_minima = []
    indices_minima = []
    indices_maxima = []
    trend = 'neutral'
    for i in range(len(closingPrices)-1):
        if closingPrices[i+1] > closingPrices[i]:
            if trend == 'decreasing':
                local_minima.append(closingPrices[i])
                indices_minima.append(i)
                trend = 'increasing'
            else:
                trend = 'increasing'
        elif closingPrices[i+1] < closingPrices[i]:
            if trend == 'increasing':
                local_maxima.append(closingPrices[i])
                indices_maxima.append(i)
                trend = 'decreasing'
            else:
                trend = 'decreasing'
        elif trend == 'neutral':
            continue
    return local_minima, local_maxima, indices_minima,indices_maxima

def get_peak(dataFrame):
    local_minima, local_maxima, indices_minima, indices_maxima = get_local_min_max(np.array(dataFrame.iloc[:, 1]))
    new_dict_maxima = dict()
    final_dict_maxima = dict()
    new_dict_minima = dict()
    final_dict_minima = dict()
    res = [0,0]
    for i in range(0,len(indices_maxima)):
        new_dict_maxima[indices_maxima[i]] = local_maxima[i]
    for i in range(0,len(indices_minima)):
        new_dict_minima[indices_minima[i]] = local_minima[i]
    for key, value in sorted(new_dict_maxima.items(), key = lambda x:x[1], reverse=True):
        final_dict_maxima[key] = value
    for key1, value1 in sorted(new_dict_minima.items(), key = lambda y:y[1], reverse= True):
        final_dict_minima[key1] = value1
    for key, value in final_dict_maxima.items():
        if dataFrame.iloc[key-1,1] < value and value > dataFrame.iloc[key+1,1]:
            res[0] = abs(dataFrame.iloc[key,1]-dataFrame.iloc[0,1])
            break
    for key, value in final_dict_minima.items():
        if dataFrame.iloc[key-1,1] > value and value < dataFrame.iloc[key+1,1]:
            res[1] = abs(dataFrame.iloc[key,1]-dataFrame.iloc[0,1])
            break
    return res




def get_moving_average_velocity(first, second, noOfDays):
    return ((second-first)/noOfDays)
def get_label(Price):
    local_minima, local_maxima, indices_maxima, indices_minima = get_local_min_max(np.array(Price.iloc[:,1]))
    timeDiff = 0
    if len(indices_minima) != 0 or len(indices_maxima) != 0:
        concat_indices = indices_minima + indices_maxima
        concat_indices.sort()
        for i in range(len(concat_indices)):
            index = concat_indices[i]
            val = Price.iloc[index,1]
            startingPrice = Price.iloc[0, 1]
            diff = val - startingPrice
            if (abs(diff))/startingPrice >= 0.05:
                break
        timeDiff = Price.iloc[index, 0] - Price.iloc[0, 0]
        return (timeDiff / 3600000), Price.iloc[index, 0], Price.iloc[index,1]
    return 0.0, Price.iloc[0,0]



def get_total_volatility(Prices, indices_maxima,indices_minima):
    startMinima = 0
    startMaxima = 0
    if len(indices_minima) == 0:
        minimaFinish = True
    else:
        minimaFinish = False
    if len(indices_maxima) == 0:
        maximaFinish = True
    else:
        maximaFinish = False
    i = 1
    volatility = []
    if len(indices_minima)!=0 or len(indices_maxima)!=0:
        while i < len(Prices):
            if maximaFinish and minimaFinish:
                break
            if not minimaFinish and (maximaFinish or (indices_minima[startMinima] < indices_maxima[startMaxima])):
                initial = Prices.iloc[i, 1]
                final = Prices.iloc[indices_minima[startMinima], 1]
                time = Prices.iloc[indices_minima[startMinima], 0] - Prices.iloc[i, 0]
                if time != 0:
                    volatility.append(abs(final-initial)/(time/3600))
                i = indices_minima[startMinima]
                if startMinima == len(indices_minima)-1:
                    minimaFinish = True
                startMinima = startMinima + 1
            elif not maximaFinish and (minimaFinish or (indices_minima[startMinima] > indices_maxima[startMaxima])):
                initial = Prices.iloc[i, 1]
                final = Prices.iloc[indices_maxima[startMaxima], 1]
                time = Prices.iloc[indices_maxima[startMaxima], 0] - Prices.iloc[i, 0]
                if time != 0:
                    volatility.append(abs(final-initial)/(time/3600000))
                i = indices_maxima[startMaxima]
                if startMaxima == len(indices_maxima)-1:
                    maximaFinish = True
                startMaxima = startMaxima + 1
    return volatility


def process(df):
    df = df.drop(columns = [6,7,8,9,10])
    df[0] = df[0].astype(float)
    df[1] = df[1].astype(float)
    df[2] = df[2].astype(float)
    df[3] = df[3].astype(float)
    df[4] = df[4].astype(float)
    df[5] = df[5].astype(float)
    df.columns = [0,4,2,3,1,5]

    # df = df.sort_values(1, ascending = True)
    new_df = pd.DataFrame(columns = ['startTime','endTime', 'startClosePrices', 'endClosePrices', 'totalVolumeExchanged', 'totalVolatility','movingAverageVelocity', 'highestPeak', 'lowestPeak'])
    x = df.rolling(window=movingAverageHours).mean()
    i = movingAverageHours
    labels = pd.DataFrame(columns= ['startTime','endTime','timeForTrendChange', 'price'])
    while (i+movingWindow) < (len(df)-movingWindow):
        new_df_entry_list = []
        label_list = []
        new_df_entry_list.append(df.iloc[i,0])
        new_df_entry_list.append(df.iloc[i+movingWindow,0])
        new_df_entry_list.append(df.iloc[i,1])
        new_df_entry_list.append(df.iloc[i+movingWindow,1])
        new_df_entry_list.append(sum(df.iloc[j,5] for j in range(i,movingWindow)))
        local_minima, local_maxima, indices_maxima, indices_minima = get_local_min_max(np.array(df.iloc[i:i+movingWindow,1]))
        new_df_entry_list.append(sum(get_total_volatility(df.iloc[i:i+movingWindow],indices_maxima,indices_minima)))
        new_df_entry_list.append(get_moving_average_velocity(x.iloc[i,1],x.iloc[i+movingWindow,1],movingWindow))
        new_df_entry_list.extend(get_peak(df.iloc[i:i+movingWindow]))
        label_list.append(df.iloc[i+movingWindow,0])
        trend, endTime, price = get_label(df.iloc[i+movingWindow:i+(2*movingWindow)])
        label_list.append(endTime)
        label_list.append(trend)
        label_list.append(price)
        new_df.loc[len(new_df)] = new_df_entry_list
        labels.loc[len(labels)] = label_list
        i = i + movingWindow
    return new_df, labels