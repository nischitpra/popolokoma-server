const id = require('../constants').id
const values = require('../constants').values
const string = require('../constants').string
const connection = require('../connection')
const db = require('../database')
const pythoninvoker=require('../../routes/pythoninvoker')
const ObjectID = require('mongodb').ObjectID
const DateUtils = require('../utils').DateUtils
const constants = require('../constants')


module.exports={
    getSummaryMessage(from,to,data){
        var message=`<html><body><p>Dear subscriber,</p><p>The summary for ${from}:${to} in the past 4 days (${DateUtils.mmhh_ddMMM_range(data[0]['start_time'],data[data.length-1]['end_time'])}) is as follows:</p>`
        for(var i in data){
            switch(data[i]['trend']){
                case 0:
                    message+=`<p><b>Consolidation</b> from <b>${DateUtils.mmhh_ddMMM_range(data[i]['start_time'],data[i]['end_time'])}</b> with a speed of ${data[i]['velocity']}.</p>`
                    break
                case 1:
                    message+=`<p><b>Uptrend</b> from <b>${DateUtils.mmhh_ddMMM_range(data[i]['start_time'],data[i]['end_time'])}</b> with a speed of ${data[i]['velocity']}.</p>`
                    break
                case -1:
                    message+=`<p><b>Down</b> from <b>${DateUtils.mmhh_ddMMM_range(data[i]['start_time'],data[i]['end_time'])}</b> with a speed of ${data[i]['velocity']}.</p>`
                    break
            }
        }
        message+=`<p><img src='cid:${id.database.collection.history_from_to_type(from,to,'1h')}.png'/></p>`
        message+=`<p>regards,<br/>Popo Team</p></body></html>`
        return message
    },
    
    getTrendChangeMessage(from,to,interval,data){
        const prevTrend=data[data.length-2][id.summarydays.trend]>0?'Up trend':data[data.length-2][id.summarydays.trend]<0?'Down trend':'Consolidation'
        const currTrend=data[data.length-1][id.summarydays.trend]>0?'Up trend':data[data.length-1][id.summarydays.trend]<0?'Down trend':'Consolidation'
        var message=`
        <html>
            <body>
                <p>Dear subscriber,</p>
                <h3>Heads up! ${from}:${to} Trend Changed!</h3>
                <p>The trend has just changed from <b>${prevTrend}</b> to <b>${currTrend}</b> at <b>${DateUtils.mmhh_ddMMM(data[data.length-1][id.summarydays.start_time])}</b></p>
                <p><img src='cid:${id.database.collection.history_from_to_type(from,to,interval)}.png'/></p>
                <p>regards,<br/>Popo Team</p></body></html>
            </body>
        </html>
        `
        return message
    },
    getBigVolumeMessage(from,to,interval,data){
        const prevCS=data[data.length-2]
        const currCS=data[data.length-1]
        if(currCs==undefined|| prevCS==undefined){
            return `
            <html>
                <body>
                    <h1>ERROR:: UNDEFINED ${from}:${to}:${interval}</h1>
                    <p>prevcs: ${JSON.stringify(prevCS)}</p>
                    <p>currcs: ${JSON.stringify(currCS)}</p>
                    <p>regards,<br/>Popo Team</p></body></html>
                </body>
            </html>`
        }
        var message=`
        <html>
            <body>
                <p>Dear subscriber,</p>
                <h3>Heads up! ${from}:${to} Big ${currCS[id.binance.close]>prevCS[id.binance.close]?'Buy':'Sell'} !</h3>
                <p>There has just big ${currCS[id.binance.close]>prevCS[id.binance.close]?'Buy':'Sell'}  volume of ${currCS[id.binance.volume]}, ${((currCS[id.binance.volume]-prevCS[id.binance.volume])/prevCS[id.binance.volume])*100}% more as compared to previous ${prevCS[id.binance.volume]}.</p>
                The closing price ${currCS[id.binance.close]>prevCS[id.binance.close]?'increased':'decreased'} from <b>${prevCS[id.binance.close]}</b> to <b>${currCS[id.binance.close]}</b>,(${((currCS[id.binance.close]-prevCS[id.binance.close])/prevCS[id.binance.close])*100}% change), with high reaching upto <b>${currCS[id.binance.high]}</b> and low upto <b>${currCS[id.binance.low]}</b>.
                The movement happened at <b>${DateUtils.mmhh_ddMMM(currCS[id.binance.id])} UTC</b>
                <p>
                There has been <b>${Math.max((Math.abs(data[data.length-1][id.binance.high]-data[data.length-2][id.binance.low])/data[data.length-1][id.binance.high])*100>5,Math.abs((data[data.length-1][id.binance.low]-data[data.length-2][id.binance.high])/data[data.length-1][id.binance.low])*100>5)}%</b>
                difference between the highs and lows of the last two intervals. 
                </p>
                <p><img src='cid:${id.database.collection.history_from_to_type(from,to,interval)}.png'/></p>
                <p>regards,<br/>Popo Team</p></body></html>
            </body>
        </html>
        `
        return message
    },
    
}
