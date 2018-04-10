import json
import uuid
import requests
import mysql.connector
import time as t


coins=['BTC','ETH','USD','CND','IOTA','XRP','LTC','DASH','EOS','GAS','COE','POE','ADA','DEEP','AIR']
api_url_base = 'https://min-api.cryptocompare.com/data/histoday?allData=true&fsym='
headers = {'Content-Type': 'application/json'}


def get_coin_list(coin_name,choice):
    if choice=='u':
        response = requests.get(api_url_base+coin_name+'&tsym=USD', headers=headers)
    elif choice=='e':
        response = requests.get(api_url_base+coin_name+'&tsym=ETH', headers=headers)
    elif choice=='b':
        response = requests.get(api_url_base+coin_name+'&tsym=BTC', headers=headers)

    if response.status_code == 200:
        return response.content.decode('utf-8')
    else:
        return None


def send_to_database(result, fsym, tsym):
    data = json.loads(result)
    n = len(data["Data"])
    for j in range(n):
        time = t.strftime('%Y-%m-%d %H:%M:%S', t.localtime(data["Data"][j]["time"]))
        close=data["Data"][j]["close"]
        high = data["Data"][j]["high"]
        low = data["Data"][j]["low"]
        open = data["Data"][j]["open"]
        volumeFrom = data["Data"][j]["volumefrom"]
        id = uuid.uuid4()
        add_to_database(id, time, open, high, low, close, volumeFrom, fsym, tsym)



def add_to_database(id, time, open, high, low, close, volumeFrom, fsym, tsym):
    connection = mysql.connector.connect(user='root', database='CryptoCompare', password='xxxx')
    cursor = connection.cursor()
    # Create a new record
    sql = "INSERT INTO `storage` (`ref_id`,`time`,`open`,`high`,`low`,`close`,`volume_from`,`fsym`,`tsym`) VALUES (%s, %s,%s, %s, %s, %s, %s, %s, %s)"
    cursor.execute(sql, (str(id) ,time, open, high, low, close, volumeFrom, fsym, tsym))
    connection.commit()

    connection.close()


for i in range(15):
    if coins[i]=='BTC':
        send_to_database(get_coin_list(coins[i],'u'),coins[i],'USD')
        send_to_database(get_coin_list(coins[i], 'e'), coins[i], 'ETH')
    elif coins[i]=='ETH':
        send_to_database(get_coin_list(coins[i], 'u'), coins[i], 'USD')
        send_to_database(get_coin_list(coins[i], 'b'), coins[i], 'BTC')
    elif coins[i]=='USD':
        send_to_database(get_coin_list(coins[i], 'b'), coins[i], 'BTC')
        send_to_database(get_coin_list(coins[i], 'e'), coins[i], 'ETH')
    else:
        send_to_database(get_coin_list(coins[i], 'u'), coins[i], 'USD')
        send_to_database(get_coin_list(coins[i], 'e'), coins[i], 'ETH')
        send_to_database(get_coin_list(coins[i], 'b'), coins[i], 'BTC')



