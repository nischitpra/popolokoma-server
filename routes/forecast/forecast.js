var express = require('express');
var router = express.Router();
const presenter = require('./presenter')
const pythoninvoker = require('../pythoninvoker')
const id = require('../constants').id
const values = require('../constants').values
const string = require('../constants').string
const WebSocket = require('ws')
const service = require('./service')

// update forecast
router.get('/uf', function(req, res, next) {
    res.json({
        status:values.status.ok,
        message: string.feature_comming_soon
    })
    // var from=req.query[id.params.from]
    // var to=req.query[id.params.to]
    // var type=req.query[id.params.type]
    // if(from==undefined) from="BTC"
    // if(to==undefined) to="USD"
    // if(type==undefined) type="2"

    // pythoninvoker.updateForecastHistory(id.database.cc.history_from_to_type(from,to,type),(status,message)=>{
    //     res.json({
    //         status:status,
    //         message: message
    //     })
    // })
});

// get forecast
router.get('/q', function(req, res, next) {
    res.json({
        status:values.status.ok,
        message: string.feature_comming_soon
    })
    // var from=req.query[id.params.from]
    // var to=req.query[id.params.to]
    // var type=req.query[id.params.type]
    // if(from==undefined) from="BTC"
    // if(to==undefined) to="USD"
    // if(type==undefined) type="2"

    // presenter.getHistory(id.database.cc.history_from_to_type(from,to,type),(status,message)=>{
    //     res.json({
    //         status:status,
    //         message: message
    //     })
    // })
});

module.exports = router;