module.exports={
    base64(value){
        return new Buffer(value+"").toString('base64')
    },
    base64Decode(value){
        return new Buffer.from(value, 'base64').toString('ascii')
    }
}