var express = require('express');
var router = express.Router();
const presenter = require('./presenter')
const service = require('./service')
const id = require('../constants').id
const values = require('../constants').values
const string = require('../constants').string
const db = require('../database')
const WebSocket = require('ws')

var lock=false;


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

    db.createCandleStickTable(id.database.cc.history_from_to_type(from,to,interval),(status,message)=>{
        if(status==values.status.ok){
            presenter.getCandleStick(from,to,interval,parseInt(fromTime),parseInt(toTime),isNew,(status,data)=>res.json({
                status:status,
                type:interval,
                message: data,
            }),
            lock,(islocked)=>{console.log('lock callback');lock=islocked})
        }else{
            res.json({
                status:values.status.error,
                type:interval,
                message: string.someWrong,
            })
        }
    })
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




module.exports = router;