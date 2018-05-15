const id = require('../constants').id
const string = require('../constants').string
const values = require('../constants').values
const connection = require('../connection')
const db = require('../database')
const service = require('./service')

module.exports={
    initGCS(from,to,interval,fromTime,toTime,isNew,callback,lock){
        db.createCandleStickTable(id.database.cc.history_from_to_type(from,to,interval),(status,message)=>{
            if(status==values.status.ok){
                return this.getCandleStick(from,to,interval,parseInt(fromTime),parseInt(toTime),isNew,callback,lock,
                (_id,shouldLock)=>{
                    const i= lock.indexOf(_id)
                    if(i===-1 && shouldLock){
                        lock.push(_id)
                    }else if(i>-1 && !shouldLock){
                        lock.splice(i,1)
                    }
                    return lock
                })
            }
            return callback(status,message)
        })
    },
    updateCandleStick(from,to,interval,isNew,callback,lock_callback){
        if(isNew){
            db.find(`select * from ${id.database.cc.history_from_to_type(from,to,interval)} order by cast(_id as bigint) desc limit 1;`,(status,data)=>{
                if(status==values.status.ok){
                    if(data.length>0){
                        const fromTime=parseInt(data[0][id.binance.id])+1
                        const toTime=new Date().getTime()
                        service.updateCandleStick(from,to,interval,fromTime,toTime,isNew,callback,lock_callback)
                    }else{
                        const toTime=new Date().getTime()
                        const fromTime=toTime-values.binance.candle_interval_milliseconds[`_${interval}`]*500
                        service.updateCandleStick(from,to,interval,fromTime,toTime,isNew,callback,lock_callback)
                    }
                }else{
                    lock_callback(id.database.collection.history_from_to_type(from,to,interval),false)
                    callback(status,data)
                }
            })
        }else{
            db.find(`select * from ${id.database.cc.history_from_to_type(from,to,interval)} order by cast(_id as bigint) asc limit 1;`,(status,data)=>{
                if(status==values.status.ok){
                    if(data.length>0){
                        const toTime=data[0][id.binance.id]-1
                        const fromTime=toTime-values.binance.candle_interval_milliseconds[`_${interval}`]*500
                        service.updateCandleStick(from,to,interval,fromTime,toTime,isNew,callback,lock_callback)
                    }else{
                        const toTime=new Date().getTime()
                        const fromTime=toTime-values.binance.candle_interval_milliseconds[`_${interval}`]*500
                        service.updateCandleStick(from,to,interval,fromTime,toTime,isNew,callback,lock_callback)
                    }
                }else{
                    lock_callback(id.database.collection.history_from_to_type(from,to,interval),false)
                    callback(status,data)
                }
            })
        }
    },
    getCandleStick(from,to,interval,fromTime,toTime,isNew,callback,lock,lock_callback){
        console.log(`isNew: ${isNew} from time: ${fromTime} totime: ${toTime} key: ${id.database.cc.history_from_to_type(from,to,interval)}`)
        db.find(`select * from ${id.database.cc.history_from_to_type(from,to,interval)} where cast(_id as bigint)>=${fromTime} and cast(_id as bigint)<=${toTime} order by cast(_id as bigint) asc limit 2000;`,(status,data)=>{
            if(status==values.status.ok){
                console.log(`data length: ${data.length}`)
                if(data.length>0 && !isNew){
                    return callback(status,data)
                }else{
                    if(lock.indexOf(id.database.collection.history_from_to_type(from,to,interval)===-1)){
                        if(!isNew||data.length==0||(isNew  && parseInt(data[data.length-1][id.database.id])+values.binance.candle_interval_milliseconds[`_${interval}`]<toTime)){
                            console.log(`new data available, updating candle stick`)
                            lock_callback(id.database.collection.history_from_to_type(from,to,interval),true)
                            return this.updateCandleStick(from,to,interval,isNew,callback,lock_callback)
                        }else{
                            console.log(`status: error message: inside else of getCandleStick !isNew:${!isNew}||${data.length==0}||${(isNew  && parseInt(data[data.length-1][id.database.id])+values.binance.candle_interval_milliseconds[`_${interval}`]<toTime)}`)
                            return callback(values.status.ok,data)
                        }
                    }
                    console.log(`values.status.error,string.functionLocked`)
                    return callback(values.status.ok,data)
                }
            }else{
                callback(status,data)            
            }
        })
    },
    hasTrendChanged(data){
        if(data.length>0 && data[data.length-2][id.summarydays.trend]!=data[data.length-1][id.summarydays.trend]){
            return data
        }
        return []
    },
    getFilterTrend(filterType,startTime,callback){
        db.find(`select * from ${id.database.collection.trend} where _id in (select max(_id) from ${id.database.collection.trend} group by _key) and trend=${filterType} and cast(end_time as bigint)>=${startTime} order by start_time;`,(status,data)=>{
            if(status==values.status.ok){
                return callback(status,data)
            }
            return callback(values.status.error,string.someWrong)
        })
    },
    getSpecificTrend(key,startTime,callback){
        db.find(`select * from ${id.database.collection.trend} where _key='${key}' and cast(end_time as bigint)>=${startTime} order by start_time;`,(status,data)=>{
            if(status==values.status.ok){
                return callback(status,data)
            }
            return callback(values.status.error,string.someWrong)
        })
    },
    getSpecificVolatility(key,startTime,callback){
        db.find(`select * from ${id.database.collection.volatility} where _key='${key}' and cast(end_time as bigint)>=${startTime} order by start_time;`,(status,data)=>{
            if(status==values.status.ok){
                return callback(status,data)
            }
            console.log(data)
            return callback(values.status.error,string.someWrong)
        })
    },
    getSummary(key,startTime,callback){
        db.find(`select * from ${id.database.collection.trend} where _key='${key}' and cast(end_time as bigint)>=${startTime} order by start_time;`,(status,trend)=>{
            if(status==values.status.ok){
                db.find(`select * from ${id.database.collection.volatility} where _key='${key}' and cast(end_time as bigint)>=${startTime} order by start_time;`,(status,vola)=>{
                    if(status==values.status.ok){
                        return callback(status,{trend:trend,volatility:vola})
                    }else{
                        return callback(values.status.error,string.someWrong)
                    }
                })
            }else{
                return callback(values.status.error,string.someWrong)
            }
        })
    }
}