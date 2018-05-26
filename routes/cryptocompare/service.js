const db = require('../database')
const connection = require('../connection')
const presenter = require('./presenter')
const id = require('../constants').id
const values = require('../constants').values
const string = require('../constants').string
const pythoninvoker=require('../../routes/pythoninvoker')
const mailer=require('../../routes/mailer/mailer')
const LifeObject=require('../lifeline/LifeObject')

module.exports={
    get24HrTicker(from,to,callback){
        connection.get24HrTicker(from,to,(status,data)=>{
            callback(status,data)
        })
    },
    updateCandleStick(from,to,interval,fromTime,toTime,isNew,callback,lock_callback){
        connection.getCandleStick(from,to,interval,fromTime,toTime,(status,data)=>{
            if(status==values.status.ok&& data.length>0){
                // console.log(`no of records in json : ${data.length}`)
                const collection=id.database.collection.history_from_to_type(from,to,interval)
                if (isNew){
                    // console.log('inserting for new')
                    db.find(`select * from ${collection} order by ${id.database.id} desc limit 1`,(status,prevData)=>{
                        if(prevData.length==0){
                            this.saveHistoryDataset(collection,data,isNew,0,callback,lock_callback)
                        }else{
                            this.saveHistoryDataset(collection,data,isNew,prevData[0][id.database.cc.id],callback,lock_callback)
                        }
                    })
                }else{
                    // console.log('inserting for old')
                    db.find(`select * from ${collection} order by ${id.database.id} asc limit 1`,(status,prevData)=>{
                        if(prevData.length==0){
                            this.saveHistoryDataset(collection,data,isNew,new Date().getTime(),callback,lock_callback)
                        }else{
                            this.saveHistoryDataset(collection,data,isNew,prevData[0][id.database.cc.id],callback,lock_callback)
                        }
                    })
                }
            }else{
                if(status==values.status.ok){
                    console.log(`status: ${status} data:${data} --no more data in binance server`)
                }else{
                    console.log(`status: ${status} data:${data} -- (updateCandleStick)==> something is worng,, inside outer else`)
                }
                lock_callback(id.database.collection.history_from_to_type(from,to,interval),false)
                return callback(status,data)
            }
        })
    },

    saveHistoryDataset(tableName,data,isNew,entryTime,callback,lock_callback){
        // console.log('saving dataset')
        var list=[]

        data.map(row=>{
            var ob={}
            var i=0
            for(var i in id.database.collection.keyList.history){
                ob[id.database.collection.keyList.history[i]]=parseFloat(row[i])
            }
            list.push(ob)
        })
        if(list.length>0){
            console.log('inserting into the database')
            db.insert(tableName,id.database.collection.keyList.history,list,(status,message)=>{
                if(status==values.status.ok){
                    lock_callback(tableName,false)
                    return callback(status,list)
                }else{
                    lock_callback(tableName,false)
                    return callback(values.status.error,message)
                }
            })
        }else{
            // console.log(string.database.insert.emptyList)
            lock_callback(tableName,false)
            return callback(values.status.error,[])
        }
    },
    getCSInterval(interval){
        if(interval==values.binance.candle_interval['_1m']){ 
            return values.binance.candle_interval_milliseconds[`_${interval}`]*5 // 5 minutes instead of 1 minute
        }
        return values.binance.candle_interval_milliseconds[`_${interval}`]
    },
    puscs(){
        console.log('puscs function called')
        db.find(`select * from ${id.database.collection.pairList} where ${id.database.historyType}='1h';`,(status,list)=>{
            if(status==values.status.ok){
                console.log(`puscs length:${list.length}`)
                for(var i in list){
                    const params=[list[i][id.database.from],list[i][id.database.to],list[i][id.database.historyType]]
                    LIFELINE_CS.push(new LifeObject(id.lifeline.ucs(list[i][id.database.from],list[i][id.database.to],list[i][id.database.historyType]),params,(params)=>{
                        console.log('function callback')
                        var i=0
                        const from=params[i++]
                        const to=params[i++]
                        const interval=params[i++]
                        require('./service').uscs(from,to,interval)
                    }))
                }
                console.log('puscs invalidate')
                LIFELINE_CS.invalidate()
            }else{
                console.log('puscs error getting pairlist data')
            }
        })
    },
    uscs(from,to,interval){
        console.log('uscs service')
        db.find(`select * from ${id.database.collection.history_from_to_type(from,to,interval)} order by cast(${id.binance.id} as bigint) desc limit 1`,(status,data)=>{
            if(status==values.status.ok){
                if(new Date().getTime()-parseInt(data[data.length-1][id.binance.id])>values.binance.candle_interval_milliseconds[`_${interval}`]){
                    require('./presenter').ucs(from,to,interval,parseInt(data[data.length-1][id.binance.id])+1,new Date().getTime(),(status,message)=>{
                        console.log(`uscs ${from}_${to}_${interval} -> status:${status}, message:${message}`)
                        LIFELINE_CS.invalidate()
                    })
                }else{
                    console.log(`${from}_${to} upto date`)
                    LIFELINE_CS.invalidate()
                }
            }else{
                console.log(`uscs else: ${data}`)
                LIFELINE_CS.invalidate()
            }
        })
    },
    velvo(from,to,interval){
        console.log(`velvo ${from}_${to}`)
        pythoninvoker.velvo(id.database.collection.history_from_to_type(from,to,interval),(status,data)=>{
            string.log_callback(status,data)
            if(status==values.status.ok){
                if(data[id.pythonInvoker.isAlert]>0){
                    /** perform alert mail service for trend change  */
                    db.find(`select * from ${id.database.collection.trend} where _key='${id.database.collection.history_from_to_type(from,to,interval)}' order by cast(${id.database.id} as bigint) asc`,(status,trendData)=>{
                        if(status==values.status.ok){
                            console.log('velvo mailer')
                            string.log_callback(status,data)
                            require('../mailer/mailer').trendChangeAlert(from,to,interval,trendData,data[id.pythonInvoker.previousTrend],(status,message)=>{
                                string.log_callback(status,message)
                            })
                        }
                    })
                }else{
                    string.log_callback(status,`velvo not alert: ${data}`)
                }
            }else{
                string.log_callback(status,`velvo else: ${data}`)
            }
        })
    }
}