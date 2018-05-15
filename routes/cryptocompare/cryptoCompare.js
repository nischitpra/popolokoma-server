var express = require('express');
var router = express.Router();
const presenter = require('./presenter')
const service = require('./service')
const id = require('../constants').id
const values = require('../constants').values
const string = require('../constants').string
const db = require('../database')
// const WebSocket = require('ws')

/** lock is made into an array so as to accomodate multiple updates to different talbes. */
var lock=[]

var intervalList={
    _1m:undefined,
    _1h:undefined,
    _1d:undefined,
}


/** get candle stick data from db */
router.get('/gcs', function(req, res, next) {
    var from=req.query[id.params.from]
    var to=req.query[id.params.to]
    var interval=req.query[id.params.type]
    var fromTime=req.query[id.params.fromTime]
    var toTime=req.query[id.params.toTime]
    var isNew=req.query[id.params.isNew]
    
    from=(from==undefined||from==null)?'XRP':from
    to=(to==undefined||to==null)?'BTC':to
    interval=(interval==undefined||interval==null)?'1h':interval
    fromTime=(fromTime==undefined||fromTime==null)?new Date().getTime()-1000*60*60*500:fromTime
    toTime=(toTime==undefined||toTime==null)?new Date().getTime():toTime
    isNew=(isNew==undefined||isNew==null)?true:isNew
    isNew=isNew=='true'

    presenter.initGCS(from,to,interval,fromTime,toTime,isNew,(status,data)=>{
        res.json({
            status:status,
            type:interval,
            message: data,
        })
    },lock)
});


/** ticker 24 hours for all pair supported in binance api */
router.get('/t', function(req, res, next) {
    var from=req.query[id.params.from]
    var to=req.query[id.params.to]
    
    service.get24HrTicker(from,to,(status,data)=>res.json({
            status:status,
            message: data
        })
    )
});

/** filtered trend for pairs*/
router.get('/gft', function(req, res, next) {
    var filterType=req.query[id.params.filterType]
    var fromTime=req.query[id.params.fromTime]
    filterType=(filterType==undefined || filterType==null || filterType<-1 || filterType>1)? 0 : filterType
    fromTime=(fromTime==undefined||fromTime==null)?new Date().getTime()-96*values.binance.candle_interval_milliseconds['_1h']:fromTime
    
    presenter.getFilterTrend(filterType,fromTime,(status,data)=>res.json({
            status:status,
            message: data
        })
    )
});
/** specific filtered trend for pairs*/
router.get('/gsft', function(req, res, next) {
    var from=req.query[id.params.from]
    var to=req.query[id.params.to]
    var fromTime=req.query[id.params.fromTime]

    from=(from==undefined||from==null)?'XRP':from
    to=(to==undefined||to==null)?'BTC':to
    fromTime=(fromTime==undefined||fromTime==null)?new Date().getTime()-96*values.binance.candle_interval_milliseconds['_1h']:fromTime

    presenter.getSpecificTrend(id.database.collection.history_from_to_type(from,to,'1h'),fromTime,(status,data)=>res.json({
            status:status,
            message: data
        })
    )
});

/** filtered trend for pairs*/
router.get('/gv', function(req, res, next) {
    var from=req.query[id.params.from]
    var to=req.query[id.params.to]
    var fromTime=req.query[id.params.fromTime]
    from=(from==undefined||from==null)?'XRP':from
    to=(to==undefined||to==null)?'BTC':to
    fromTime=(fromTime==undefined||fromTime==null)?new Date().getTime()-96*values.binance.candle_interval_milliseconds['_1h']:fromTime

    presenter.getSpecificVolatility(id.database.collection.history_from_to_type(from,to,'1h'),fromTime,(status,data)=>res.json({
            status:status,
            message: data
        })
    )
});

/** get summary */
router.get('/gs', function(req, res, next) {
    var from=req.query[id.params.from]
    var to=req.query[id.params.to]
    var fromTime=req.query[id.params.fromTime]

    from=(from==undefined||from==null)?'XRP':from
    to=(to==undefined||to==null)?'BTC':to
    fromTime=(fromTime==undefined||fromTime==null)?new Date().getTime()-96*values.binance.candle_interval_milliseconds['_1h']:fromTime

    presenter.getSummary(id.database.collection.history_from_to_type(from,to,'1h'),fromTime,(status,data)=>res.json({
            status:status,
            message: data
        })
    )
});

/** update candle stick force */
router.get('/ucsf', function(req, res, next) {
    service.ucsf(1,(status,data)=>res.json({
            status:status,
            message: data
        }),lock)
});


module.exports = { 
    router:router,
    lock:lock,
    intervalList:intervalList,
    service:service,
    uscs:(type)=>service.uscs(intervalList,type,(status,message)=>{
        console.log(`status: ${status}, message: ${message}`)
      },lock)
}