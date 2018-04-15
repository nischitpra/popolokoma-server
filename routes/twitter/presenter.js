const id = require('../constants').id
const values = require('../constants').values
const string = require('../constants').string
const connection = require('../connection')
const db = require('../database')
const pythoninvoker=require('../../routes/pythoninvoker')
const ObjectID = require('mongodb').ObjectID


/** twitter api */
var Twitter = require('twitter');
var client = new Twitter({
    consumer_key: values.twitter.consumerKey,
    consumer_secret: values.twitter.consumerSecret,
    access_token_key: values.twitter.accessTokenKey,
    access_token_secret: values.twitter.accessTokenSecret,
});

module.exports={
    getSpecificTweetsDb(name,from,limit,callback){
        console.log(`getting tweet for ${name} ${from}`)
        db.findManyLimited(id.database.collection.tweets,{[id.twitter.tweet.text] : {$regex : new RegExp( `${name}|${from}`, 'i')}},{'_id':-1},limit,(status,data)=>{
            callback(status,data)
        })
    },
    getTweetsDb(callback){
        console.log(`getting home tweets`)
        db.findMany(id.database.collection.tweets,{},(status,data)=>{
            callback(status,data)
        })
    },
    searchTweets(name,symbol,callback){
        console.log(`getting tweet for ${symbol}`)
        connection.searchTweets(client,name,symbol,callback)
    },
    saveTweet(data){

    },
    preFilterTweetsList(data){
        list=[]
        for(var i in data){
            var item={}
            item[id.twitter.tweet.id]=data[i][id.twitter.tweet.id]
            item[id.twitter.tweet.index]=i
            item[id.twitter.tweet.text]=data[i][id.twitter.tweet.text]
            item[id.twitter.tweet.timestamp]=data[i][id.twitter.tweet.createdAt]
            list.push(item)
        }
        return list
    },
    postFilterTweetsList(data,filteredData){
        list=[]
        console.log(`filtered data length: ${filteredData.length}`)
        for(var i in filteredData){
            var item=data[filteredData[i][id.twitter.tweet.index]]
            console.log(item)
            list.push(item)
        }
        return list
    },
    getGoodBadTweetsDb(callback){
        console.log(`getting good bad tweet`)
        db.getGoodBadTweets((status,tweets)=>{
            console.log(tweets)
            callback(status,tweets)
        })
    },
    getGoodBadTweetsFewDb(count,callback){
        console.log(`getting good bad tweet few`)
        db.getGoodBadTweetsFew(count,(status,tweets)=>{
            callback(status,tweets)
        })
    },
    streamTweets(name,symbol){
        connection.streamTweets(client,name,symbol,this.saveTweetDb.bind(this)) // need to bind context 
    },

    /**
     * Need to bind context for this function call as it uses the context(this.) to call functions
     */
    saveTweetDb(tweets){
        console.log(`${tweets.length} tweets received`)
        var preparedList=this.preFilterTweetsList(tweets)
        pythoninvoker.getFilteredTweet(JSON.stringify(preparedList),(status,filteredData)=>{
            filteredData=this.postFilterTweetsList(tweets,filteredData)
            console.log(`${filteredData.length} tweets filtered`)

            if(filteredData.length>0){
                db.insertMany(id.database.collection.tweets,filteredData,(status,message)=>console.log(message))
            }else{
                console.log(string.database.insert.emptyList)
            }
        })
    },
    getSentimentTrend(callback){
        console.log(`getting sentiment trend`)
        db.findManySorted(id.database.collection.sentimentTrend,{},{'time':1},(status,data)=>{
            callback(status,data)
        })
    },
    
}
