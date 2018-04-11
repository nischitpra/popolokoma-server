const network = require('./constants').network
const values = require('./constants').values
const string = require('./constants').string
const id = require('./constants').id
const fetch = require('node-fetch')

module.exports={
    getNews(type,count,page,callback){
        console.log('fetcing data')
        fetch(network.news(type,count,page),{
            method: 'GET',
            headers: {
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.12; rv:57.0) Gecko/20100101 Firefox/57.0",
                "Accept": 'application/json',
                "X-API-Key": values.news.apiKey
            },
        }).then(response=>{
            console.log('data fetched')
            if(response.ok){
                response.json().then(json=>{
                    console.log('sending data back')
                    callback(values.status.on,json[id.news.articles])
                })
            }
        }).catch((error)=>{
            callback(values.status.error,[])
            console.log(error)
        })
    },

    getHistory(type,from,to,exchange,toTime,callback){
        console.log(network.history(type,from,to,exchange,toTime))
        fetch(network.history(type,from,to,exchange,toTime),{
            method: 'GET',
            headers: values.baseHeader,
        }).then(response=>{
            response.json().then(json=>{
                callback(values.status.ok,json[id.cryptocompare.data])
            })
        }).catch((error)=>{
            callback(values.status.error,[])
            console.log(error)
        })
    },

    getFavourites(from,to,exchange,callback){
        console.log(network.favourites(from,to,exchange))
        fetch(network.favourites(from,to,exchange),{
            method: 'GET',
            headers: values.baseHeader,
        }).then(response=>{
            response.json().then(json=>{
                if(json[id.cryptocompare.raw]===undefined){
                    callback(values.status.error,[])
                }else{
                    callback(values.status.ok,json[id.cryptocompare.raw])
                }
            })
        }).catch((error)=>{
            callback(values.status.error,string.someWrong)
            console.log(error)
        })
    },

    getCoinList(callback){
        console.log(network.coinList)
        fetch(network.coinList,{
            method: 'GET',
            headers: values.baseHeader,
        }).then(response=>{
            response.json().then(json=>{
                callback(values.status.ok,Object.values(json[id.cryptocompare.data]),json[id.cryptocompare.baseImageUrl])
            })
        }).catch((error)=>{
            callback(values.status.error,[],'')
            console.log(values.status.error)
        })
    },

    getSocketScubscriptionList(from,to,callback){
        console.log(network.socketSubsList(from,to))
        fetch(network.socketSubsList(from,to),{
            method: 'GET',
            headers: values.baseHeader,
        }).then(response=>{
            response.json().then(json=>{
                callback(values.status.ok,json[to][id.cryptocompare.trades])
            })
        }).catch((error)=>{
            callback(values.status.error,[])
            console.log(error)
        })
    },
    searchTweets(client,name,symbol,callback){
        console.log(network.searchTweet(name,symbol))
        client.get('search/tweets', {q: `${symbol}%20${name}`})
        .then((tweet)=>{
            callback(values.status.ok,tweet[id.twitter.statuses])
        })
        .catch((error)=>{
            console.log('search tweet error')
            callback(values.status.error,[])
        })
    },
    streamTweets(client,name,symbol,callback){
        var bufferTweets=[]
        console.log('streaming tweets from twitter api')
        client.stream('statuses/filter', {track: `${symbol}`},  function(stream) {
            stream.on('data', function(tweet) {
                bufferTweets.push(tweet)
                if(bufferTweets.length>50){
                    callback(bufferTweets)
                    bufferTweets=[]
                }
            });
            stream.on('error', function(error) {
                console.log(error);
            });
        });
    }
}