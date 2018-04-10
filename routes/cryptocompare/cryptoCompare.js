var express = require('express');
var router = express.Router();
const presenter = require('./presenter')
const service = require('./service')
const id = require('../constants').id
const values = require('../constants').values
const string = require('../constants').string
const WebSocket = require('ws')


/* GET home page. */
router.get('/history', function(req, res, next) {
    const from=req.query[id.cryptocompare.from]
    const to=req.query[id.cryptocompare.to]
    const exchange=req.query[id.cryptocompare.exchange]
    const historyType=parseInt(req.query[id.cryptocompare.historyType])
    const fromTime=req.query[id.cryptocompare.fromTime]
    const toTime=req.query[id.cryptocompare.toTime]

    presenter.getHistory(historyType,from,to,exchange,fromTime,toTime,
        (status,data)=>res.json({
            status:status,
            [id.cryptocompare.historyType]:historyType,
            message: data
        })
    )
});

router.get('/uh',function(req, res, next) {
    const from=req.query[id.params.from]
    const to=req.query[id.params.to]
    const exchange=req.query[id.params.exchange]
    const type=parseInt(req.query[id.params.type])
    var toTime=req.query[id.params.toTime]

    presenter.getHistoryStartTime(id.database.cc.history_from_to_type(from,to,type),(status,toTime)=>{
        service.insertHistory(type,from,to,exchange,toTime,(status,message)=>res.json({
            status:status,
            message: message
        }))
    })
});


/* GET favourites. */
router.get('/favourites', function(req, res, next) {
    const from=req.query[id.cryptocompare.from]
    const to=req.query[id.cryptocompare.to]
    const exchange=req.query[id.cryptocompare.exchange]

    presenter.getFavourites(from,to,exchange,
        (status,data)=>res.json({
            status:status,
            message: data
        })
    )
});


/* GET coinlist. */
router.get('/coinlist', function(req, res, next) {
    presenter.getCoinList(
        (status,data,baseImageUrl)=>res.json({
            status:status,
            message: data,
            baseImageUrl:baseImageUrl,
        })
    )
});


/* GET socket subscription list. */
router.get('/subs', function(req, res, next) {
    const from=req.query[id.cryptocompare.from]
    const to=req.query[id.cryptocompare.to]

    presenter.getSubsList(from,to,
        (status,data)=>res.json({
            status:status,
            message: data,
        })
    )
});

/* POST trend dataset. */
router.post('/exportDataset', function(req, res, next) {
    const trendDataset=req.body[id.cryptocompare.trendData]
    const pairHistoryType=req.body[id.cryptocompare.pairHistoryType]
    const datasetType=req.body[id.cryptocompare.datasetType]
    
    presenter.saveDataset(trendDataset,pairHistoryType,datasetType,
        (status,data)=>res.json({
            status:status,
            message: data
        })
    )
});

  



module.exports = router;