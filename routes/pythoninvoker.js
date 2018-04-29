const network = require('./constants').network
const files = require('./constants').files
const values = require('./constants').values
const string = require('./constants').string
const id = require('./constants').id
const fetch = require('node-fetch')

module.exports={
    getSentimentTrend(callback){
        var spawn = require("child_process").spawn
        var process = spawn(files.python.compiler,[files.buildPath(files.python.sentimentTrend)] )
        console.log('get sentiment trend process spawned')
        process.stdout.on('data', (data)=>{
            console.log('trend returned from python')
            callback(values.status.ok,data.toString('utf8'))
        })
        process.stderr.on('data',(error)=>{
            console.log('---ERROR-----')
            console.log(error.toString('utf8'))
            console.log('=============')
        })
    },
    getFilteredTweet(tweets,callback){
        var spawn = require("child_process").spawn
        var process = spawn(files.python.compiler,[files.buildPath(files.python.filterTweet),tweets] )
        console.log('get filtered tweet process spawned')
        process.stdout.on('data', (data)=>{
            console.log('trend returned from python')
            callback(values.status.ok,JSON.parse(data.toString('utf8')))
        })

        process.stderr.on('data',(error)=>{
            console.log(error.toString('utf8'))
            callback(values.status.error,error.toString('utf8'))
        })
    },
    getGoodBadTweet(callback){
        var spawn = require("child_process").spawn
        var process = spawn(files.python.compiler,[files.buildPath(files.python.goodBadTweet)] )
        console.log('get good bad tweet process spawned')
        process.stdout.on('data', (data)=>{
            console.log('returned good bad from python')
            callback(values.status.ok,data.toString('utf8'))
        })

        process.stderr.on('data',(error)=>{
            console.log('---ERROR-----')
            console.log(error.toString('utf8'))
            console.log('=============')
        })
    },
    updateForecastHistory(key,callback){
        var spawn = require("child_process").spawn
        var process = spawn(files.python.compiler,[files.buildPath(files.python.forecaster),key] )
        console.log('update forecast process spawned')
        process.stdout.on('data', (message)=>{
            console.log('returned update forecast from python')
            callback(values.status.ok,message.toString('utf8'))
        })

        process.stderr.on('data',(error)=>{
            console.log('---ERROR-----')
            console.log(error.toString('utf8'))
            console.log('=============')
        })
    },
    get4DaySummary(key,callback){
        var spawn = require("child_process").spawn
        var process = spawn(files.python.compiler,[files.buildPath(files.python.velvoCalculator),key] )
        process.stdout.on('data', (data)=>{
            callback(values.status.ok,JSON.parse(data.toString('utf8')))
        })

        process.stderr.on('data',(error)=>{
            console.log('---ERROR-----')
            console.log(error.toString('utf8'))
            console.log('=============')
        })
    },

    
}