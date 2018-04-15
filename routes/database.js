const network = require('./constants').network;
const id = require('./constants').id;
const values = require('./constants').values;
const string = require('./constants').string;
var MongoClient = require('mongodb').MongoClient;

module.exports={
    updateHistory(key,hist,callback){
        MongoClient.connect(network.database,(err, db)=>{
            if (err) throw err;
            var dbo = db.db(id.database.name);
            dbo.collection(id.database.collection.history).update(
                {[id.database.cc.id]:key},
                {$push:{history: { $each: hist }}},
            (err,res)=>{
                if (err) {
                    callback(values.status.error,string.someWrong)
                    throw err;
                }else{
                    console.log(`${key} ${hist.length} rows pushed`);
                    db.close();
                    callback(values.status.ok,string.inserted(1))
                }
            });
        })
    },
    insertOne(collection,value,callback){
        MongoClient.connect(network.database,(err, db)=>{
            if (err) throw err;
            var dbo = db.db(id.database.name);
            dbo.collection(collection).insertOne(value, (err, res)=>{
                if (err) {
                    callback(values.status.error,string.someWrong)
                    throw err;
                }else{
                    console.log(`1 document inserted`);
                    db.close();
                    callback(values.status.ok,string.inserted(1))
                }
            });
        })
    },
    insertMany(collection,value,callback){
        MongoClient.connect(network.database,(err, db)=>{
            if (err) throw err;
            var dbo = db.db(id.database.name);
            dbo.collection(collection).insertMany(value, {ordered:false},(err, res)=>{
                if (err) {
                    callback(values.status.error,string.someWrong)
                    throw err;
                }else{
                    console.log(`${value.length} document inserted`);
                    db.close();
                    callback(values.status.ok,string.inserted(value.length))
                }
            });
        })
    },

    findOne(collection,query,callback){
        MongoClient.connect(network.database,(err, db)=>{
            if (err) throw err;
            var dbo = db.db(id.database.name);
            dbo.collection(collection).findOne(query,(err, result)=>{
                if (err) throw err;
                if(result!=null){
                    callback(values.status.ok,result)
                }else{
                    callback(values.status.error,result)
                }
                db.close();
            });
        });
    },
    findMany(collection,query,callback){
        MongoClient.connect(network.database,(err, db)=>{
            if (err) throw err;
            var dbo = db.db(id.database.name);
            dbo.collection(collection).find(query).toArray((err, result)=>{
                if (err){
                    callback(values.status.error,string.someWrong)
                    throw err;
                }
                callback(values.status.ok,result)
                db.close();
            });
        });
    },
    findManySorted(collection,query,sortQuery,callback){
        MongoClient.connect(network.database,(err, db)=>{
            if (err) throw err;
            var dbo = db.db(id.database.name);
            dbo.collection(collection).find(query).sort(sortQuery).toArray((err, result)=>{
                if (err){
                    callback(values.status.error,string.someWrong)
                    throw err;
                }

                console.log(`db.${collection}.find(${JSON.stringify(query)}).sort(${JSON.stringify(sortQuery)})`)
                callback(values.status.ok,result)
                db.close();
            });
        });
    },
    findManyLimited(collection,query,sortQuery,_limit,callback){
        MongoClient.connect(network.database,(err, db)=>{
            if (err) throw err;
            var dbo = db.db(id.database.name);
            dbo.collection(collection).find(query).sort(sortQuery).limit(_limit).toArray((err, result)=>{
                if (err){
                    callback(values.status.error,string.someWrong)
                    throw err;
                }
                callback(values.status.ok,result)
                db.close();
            });
        });
    },
    dropCollection(collection){
        MongoClient.connect(network.database, (err, db)=>{
            if (err) throw err;
            var dbo = db.db(id.database.name);
            dbo.collection(collection).drop((err, delOK)=>{
                if (err) throw err;
                if (delOK) console.log("Collection deleted");
                db.close();
            });
        });
    },

    // for subscribe
    validateOtp(collection,key,otp,callback,mailerCallback){
        MongoClient.connect(network.database,(err, db)=>{
            if (err) throw err;
            var dbo = db.db(id.database.name);
            dbo.collection(collection).findOne({[key]:otp},(err, result)=>{
                if (err) throw err;
                console.log(result)
                if(result!=null&& !result.isDeleted){
                    this.delete(id.database.collection.otp,{[key]:otp},undefined)
                    callback(id.mailer.subscribe.validationSuccess,mailerCallback)
                }else{
                    callback(id.mailer.subscribe.validationError,mailerCallback)
                }
                db.close();
            });
        });
    },
    delete(collection,query,callback){
        MongoClient.connect(network.database,(err, db)=>{
            if (err) throw err;
            var dbo = db.db(id.database.name);
            dbo.collection(collection).updateOne(query,{$set:{[id.database.isDeleted]:true}},(err, result)=>{
                if (err) throw err;
                console.log(result)
                if(callback!=undefined){
                    callback(values.status.ok,string.subscribe.unsubscribed)
                }
                db.close();
            });
        });
    },
    isSubscribed(email,from,to,mailerCallback){
        MongoClient.connect(network.database,(err, db)=>{
            if (err) throw err;
            var dbo = db.db(id.database.name);
            dbo.collection(id.database.collection.subscribed).findOne({[id.database.email]:email,[id.database.from]:from,[id.database.to]:to,[id.database.isDeleted]:false},(err, result)=>{
                if (err) throw err;
                console.log(result)
                if(result!=null && !result.isDeleted){
                    mailerCallback(values.status.ok,true)
                }else{
                    mailerCallback(values.status.ok,false)
                }
                db.close();
            });
        });
    },
    getGoodBadTweets(callback){
        MongoClient.connect(network.database,(err, db)=>{
            if (err) throw err;
            var dbo = db.db(id.database.name);
            dbo.collection(id.database.collection.goodBadTweets).aggregate([
                {$lookup:{from: id.database.collection.tweets,localField: id.twitter.tweet.id,foreignField: id.twitter.tweet.id,as: id.twitter.tweet.tweet}}
            ]).toArray((err, result)=>{
                if (err){
                    callback(values.status.error,string.someWrong)
                    throw err;
                }
                callback(values.status.ok,result)
                db.close();
            });
        });
    },
    getGoodBadTweetsFew(count,callback){
        MongoClient.connect(network.database,(err, db)=>{
            if (err) throw err;
            var dbo = db.db(id.database.name);
            dbo.collection(id.database.collection.goodBadTweets).aggregate([
                    {$lookup:{
                        from: id.database.collection.tweets,
                        localField: id.twitter.tweet.id,
                        foreignField: id.twitter.tweet.id,
                        as: id.twitter.tweet.tweet,
                    }},
                    {$sort:{[id.twitter.tweet.timestamp]: -1}},
                    {$limit:count}, 
            ]).toArray((err, result)=>{
                if (err){
                    callback(values.status.error,string.someWrong)
                    throw err;
                }
                callback(values.status.ok,result)
                db.close();
            });
        });
    },

    getHistoryStartTime(key,callback){
        MongoClient.connect(network.database,(err, db)=>{
            if (err) throw err;
            var dbo = db.db(id.database.name);
            dbo.collection(id.database.collection.history).aggregate([
                {$match:{[id.database.cc.id]:key}},
                {$unwind:`$${id.database.cc.history}`},
                {$sort:{[`${id.database.cc.history}.${id.database.cc.time}`]:1}},
                {$limit:1}
            ]).toArray((err, result)=>{
                if (err){
                    callback(values.status.error,string.someWrong)
                    throw err;
                }
                const his=result[id.database.cc.history]
                if(his==undefined){
                    callback(values.status.error,-1)
                }else{
                    callback(values.status.ok,his[id.database.cc.time])
                }
                db.close();
            });
        });
    },
}