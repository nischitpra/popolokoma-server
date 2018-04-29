var express = require('express');
var router = express.Router();
const presenter = require('./presenter')
const service = require('./service')
const id = require('../constants').id
const values = require('../constants').values
const string = require('../constants').string
const db = require('../database')
// const WebSocket = require('ws')

var lock=false
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

// // update service for candle stick               
// router.get('/uscs', function(req, res, next) {
//     var type=req.query[id.params.type]
//     if(type==undefined) type="1"
//     type=id.cryptocompare.history[type]
//     if(intervalList[`_${type}`]==undefined){
//         service.setIntervalCandleStick(type,(status,data)=>{
//             if(status==values.status.ok){
//                 intervalList[`_${data[id.cryptocompare.interval]}`]=data[id.cryptocompare.intervalObject]
//                 res.json({
//                     status:status,
//                     message: `interval ${data[id.cryptocompare.interval]} interval started`
//                 })
//             }else{
//                 res.json({
//                     status:status,
//                     message: data
//                 })
//             }
//         },lock)
//     }else{
//         res.json({
//             status:values.status.ok,
//             message: 'interval already running'
//         })
//     }
// });
// module.exports = router;



module.exports = { 
    router:router,
    lock:lock,
    intervalList:intervalList,
    service:service,
    uscs:(type)=>service.uscs(intervalList,type,(status,message)=>{
        console.log(`status: ${status}, message: ${message}`)
      },lock)
}