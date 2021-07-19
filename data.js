const fs = require('fs')

class Data {
    constructor(passed){
        this.dht = passed.dht
        this.ed = passed.ed
        this.keypair = passed.redo ? this.ed.keygen(Buffer.from(passed.key)) : this.ed.keygen()
        this.seq = passed.redo ? passed.seq : 0
        this.info = Buffer.from(passed.info, 'utf-8')
        this.hash = passed.redo ? passed.hash : null
        this.check = null
        this.putData()
        this.start()
    }
    updateData(val){
        let self = this
        this.seq = this.seq + 1
        this.info = val
        this.dht.put({k: this.keypair.pk, seq: this.seq, v: this.info, sign: (buf) => {return this.ed.sign(buf, this.keypair.sk)}}, function (error, hashData) {
            if(error){
                console.log(error)
            } else if(hashData){
                self.hash = hashData.toString('hex').toUpperCase()
                self.saveData()
                console.log('hash:' + self.hash)
            } else {
                console.log('error: nothing happened')
            }
        })
    }
    // getData(){
    //     this.dht.get(this.hash, (error, hashData) => {
    //         if(error){
    //             console.log(error)
    //         } else if(hashData){
    //             console.log('data\n' + hashData)
    //         } else {
    //             console.log('error: nothing happened')
    //         }
    //     })
    // }
    putData(){
        let self = this
        this.dht.put({k: this.keypair.pk, seq: this.seq, v: this.info, sign: (buf) => {return this.ed.sign(buf, this.keypair.sk)}}, function (error, hashData){
            if(error){
                console.log(error)
            } else if(hashData){
                self.hash = hashData.toString('hex').toUpperCase()
                self.saveData()
                console.log('hash:' + self.hash)
            } else {
                console.log('error: nothing happened')
            }
        })
    }
    // getSomething(val){
    //     this.dht.get(val, (error, hashData) => {
    //         if(error){
    //             console.log(error)
    //         } else if(hashData){
    //             console.log('data\n' + hashData)
    //         } else {
    //             console.log('error: nothing happened')
    //         }
    //     })
    // }
    saveData(){
        fs.writeFileSync('./data/' + this.hash, JSON.stringify({key: this.keypair.sk, seq: this.seq, info: this.info, hash: this.hash}))
        console.log('\nsaved')
    }
    start(){
        this.check = setInterval(() => {
            this.putData()
        }, 7200000)
    }
    finish(){
        // this.check = clearInterval(this.check)
        clearInterval(this.check)
    }
}

module.exports = Data