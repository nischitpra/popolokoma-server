var express = require('express');
var router = express.Router();
const presenter = require('./presenter')
const id = require('../constants').id
const values = require('../constants').values
const string = require('../constants').string
const WebSocket = require('ws')
const service = require('./service')

var locked=false

// for general search tweets
router.get('/q', function(req, res, next) {
    const from=req.query[id.params.from]
    // const to=req.query[id.params.to]
    const coinName=req.query[id.twitter.coinName]
    presenter.getSpecificTweetsDb(coinName,from,10,(status,data)=>{
        res.json({
            status:status,
            message: data
        })
    })
});

// for home tweets
router.get('/h', function(req, res, next) {
    presenter.getTweetsDb((status,data)=>{
        res.json({
            status:status,
            message: data
        })
    })
});

// for updating sentiment trend
router.get('/ust',function(req, res, next) {
    service.updateSentimentTrend((status,message)=>{
        res.json({
            status:status,
            message: message
        })
    })
});
router.get('/s',function(req, res, next) {
    presenter.getSentimentTrend((status,data)=>{
        res.json({
            status:status,
            message: data
        })
    })
});

// update tweet (after removing spams)
router.get('/ut',function(req, res, next) {
    if(locked==false){
        locked=true
        var symbol=req.query[id.twitter.symbol]
        var coinName=req.query[id.twitter.coinName]
        if(symbol==undefined||symbol==null) symbol="btc"
        if(coinName==undefined||coinName==null) symbol="bitcoin"
        service.updateTweetDb(coinName,symbol)

        // setInterval(()=>{
        //     service.updateGoodBadTweets((status,message)=>{
        //         console.log('\n\n\n\x1b[41m\x1b[36m%s\x1b[0m',`good bad service: ${status} ${message}`)
        //         service.updateSentimentTrend((status,message)=>{
        //             console.log('\n\n\n\x1b[41m\x1b[36m%s\x1b[0m',`sentiment trend service: ${status} ${message}`)
        //         })
        //     })
        // },10*60*1000)// 1 hr


    }else if(locked){
        res.json({
            status:values.status.error,
            message: string.functionLocked
        })
    }
    
});


// update good bad tweet
router.get('/ugb', function(req, res, next) {
    service.updateGoodBadTweets((status,data)=>{
        res.json({
            status:status,
            message: data
        })
    })
});
// get good bad tweets
router.get('/ggb', function(req, res, next) {
    presenter.getGoodBadTweetsDb((status,data)=>{
        res.json({
            status:status,
            message: data
        })
    })
});
// get good bad few
router.get('/ggbf', function(req, res, next) {
    var count=parseInt(req.query[id.params.count])
    if(count==undefined||count==null||count==''||count=='undefined'||isNaN(count)) count=20
    presenter.getGoodBadTweetsFewDb(count,(status,data)=>{
        res.json({
            status:status,
            message: data
        })
    })
});

module.exports = router;