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
    }
    
}
