const id = require('../constants').id
const values = require('../constants').values
const string = require('../constants').string
const connection = require('../connection')
const db = require('../database')
const pythoninvoker=require('../../routes/pythoninvoker')
const ObjectID = require('mongodb').ObjectID


module.exports={
    getHistory(key,callback){
        console.log(`getting forecast history for ${key}`)
        db.findOne(id.database.collection.forecast,{[id.database.cc.id]:key},(status,data)=>{
            if(status==values.status.ok){
                callback(status,data[id.database.cc.history])
            }else{
                callback(status,data)
            }
        })
    },
    
}
