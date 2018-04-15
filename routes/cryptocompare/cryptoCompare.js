var express = require('express');
var router = express.Router();
const presenter = require('./presenter')
const service = require('./service')
const id = require('../constants').id
const values = require('../constants').values
const string = require('../constants').string
const WebSocket = require('ws')

var lock=false;


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

/** search for saved coin pair */
// router.get('/q', function(req, res, next) {
//     var from=req.query[id.params.from]
//     var to=req.query[id.params.to]
//     var exchange=req.query[id.params.exchange]
//     var historyType=parseInt(req.query[id.params.type])

//     from=(from==null||from==undefined)?'BTC':from
//     to=(to==null||to==undefined)?'USD':to
//     historyType=isNaN(historyType)?1:historyType

//     presenter.getFullPriceHistory(historyType,from,to,(status,data)=>res.json({
//             status:status,
//             message: data
//         })
//     )
// });

// router.get('/uh',function(req, res, next) {
//     const from=req.query[id.params.from]
//     const to=req.query[id.params.to]
//     const exchange=req.query[id.params.exchange]
//     const type=parseInt(req.query[id.params.type])
//     var toTime=req.query[id.params.toTime]

//     presenter.getHistoryStartTime(id.database.cc.history_from_to_type(from,to,type),(status,toTime)=>{
//         service.insertHistory(type,from,to,exchange,toTime,(status,message)=>res.json({
//             status:status,
//             message: message
//         }))
//     })
// });


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

/** candle stick data from binance */
router.get('/ucs', function(req, res, next) {
    var from=req.query[id.params.from]
    var to=req.query[id.params.to]
    var interval=req.query[id.params.type]
    var fromTime=req.query[id.params.fromTime]
    var toTime=req.query[id.params.toTime]
    var isNew=req.query[id.params.isNew]

    from=(from==undefined||from==null)?'XRP':from
    to=(to==undefined||to==null)?'BTC':to
    interval=(interval==undefined||interval==null)?'1h':interval
    isNew=(isNew==undefined||isNew==null)?'true':isNew
    isNew=(isNew.toLowerCase()=='true')

    presenter.updateCandleStick(from,to,interval,isNew,(status,data)=>res.json({
            status:status,
            message: data,
        })
    )
});
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
    isNew=(isNew==undefined||isNew==null)?'true':isNew
    isNew=isNew=='true'


    presenter.getCandleStick(from,to,interval,parseInt(fromTime),parseInt(toTime),isNew,(status,data)=>res.json({
            status:status,
            type:interval,
            message: data,
        }),
        lock,(islocked)=>{console.log('lock callback');lock=islocked}
    )
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