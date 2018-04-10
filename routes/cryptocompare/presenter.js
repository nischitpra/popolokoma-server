const id = require('../constants').id
const string = require('../constants').string
const values = require('../constants').values
const connection = require('../connection')
const db = require('../database')


module.exports={
    getHistory(type,from,to,exchange,fromTime,toTime,callback){
        if(fromTime==null){
            this.getOldHistory(type,from,to,exchange,toTime,callback)
        }else if(toTime==null){
            this.getNewHistory(type,from,to,exchange,fromTime,callback)
        }else{
            callback(values.status.error,[])
        }
        
    },
    getOldHistory(type,from,to,exchange,toTime,callback){
        connection.getHistory(id.cryptocompare.history[type],from,to,exchange,toTime,callback)
    },
    getNewHistory(_id,from,to,exchange,fromTime,callback){

    },


    getFavourites(from,to,exchange,callback){
        connection.getFavourites(from,to,exchange,callback)
    },
    getCoinList(callback){
        connection.getCoinList(callback)
    },
    getSubsList(from,to,callback){
        connection.getSocketScubscriptionList(from,to,callback)
    },

    getHistoryStartTime(key,callback){
        db.findManyLimited(key,{},{[id.database.cc.time]:1},1,(status,data)=>{
            data=data[0]
            if(status==values.status.ok && data!=undefined){
                console.log('previous records exists: '+data[id.database.cc.time])
                callback(status,data[id.database.cc.time])
            }else{
                console.log('fresh start')
                callback(status,Math.round(new Date().getTime()/1000))
            }
        })
    },

    saveDataset(trendDataset,pairHistoryType,datasetType,callback){
        for(var i in trendDataset){
            var startTime=new Date(trendDataset[i][id.cryptocompare.params.start][0]).getTime()/1000
            var endTime=new Date(trendDataset[i][id.cryptocompare.params.end][0]).getTime()/1000
            if(startTime>endTime){
                const t=endTime
                endTime=startTime
                startTime=t
            }
            db.findManySorted(pairHistoryType,{'time':{'$gte':startTime,'$lte':endTime}},{'time':1},(status,data)=>{
                db.insertOne(`${pairHistoryType}_${datasetType}`,{
                    [id.cryptocompare.trendData]:data,
                    [id.cryptocompare.params.start]:startTime,
                    [id.cryptocompare.params.end]:endTime,
                },(status,message)=>{
                    console.log(`${data.length} rows added! status:${status} message:${message}`)
                })
            })
        }
        callback('ok',`${trendDataset.length} trend lines saved`)
    }

   
}
