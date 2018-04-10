module.exports={
    base64(value){
        return new Buffer(value+"").toString('base64')
    },
}