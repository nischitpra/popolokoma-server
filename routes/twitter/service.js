const db = require('../database')
const connection = require('../connection')
const presenter = require('./presenter')
const id = require('../constants').id
const values = require('../constants').values
const string = require('../constants').string
const pythoninvoker=require('../../routes/pythoninvoker')

module.exports={
    updateSentimentTrend(callback){
        pythoninvoker.getSentimentTrend((status,data)=>{
            callback(status,data)
        })
    },
    updateTweetDb(){
        const track="BTC XRP XVG BCN XMR EOS IOST LOOM TRX NCASH POE CND FUEL DNT MANA IOST ETH ZEN LINK CHAT INS RPX"
        const follow="Bytecoin_BCN BTCTN BelleZoeLan Bitcoin CoinDeskMarkets Cointelegraph CryptoCoinsNews Ripple SalihSarikaya Tronfoundation bitbns coindesk justinsuntron loomnetwork thee_wolf vergestatus"
        presenter.streamTweets(track,follow)
    },
    updateGoodBadTweets(callback){
        pythoninvoker.getGoodBadTweet((status,message)=>{
            callback(values.status.ok,message)
        })
    }
}