const db = require('../database')
const connection = require('../connection')
const presenter = require('./presenter')
const id = require('../constants').id
const values = require('../constants').values
const string = require('../constants').string
const pythoninvoker=require('../../routes/pythoninvoker')

module.exports={
    updateSentimentTrend(callback){
        pythoninvoker.getSentimentTrend((status,data)=>{
            callback(status,data)
        })
    },
    updateTweetDb(name,symbol){
        presenter.streamTweets(name,symbol)
    },
    updateGoodBadTweets(callback){
        pythoninvoker.getGoodBadTweet((status,message)=>{
            callback(values.status.ok,message)
        })
    }
}