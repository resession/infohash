const DHT = require('bittorrent-dht')
const ed = require('bittorrent-dht-sodium')
const dht = new DHT({verify: ed.verify})
const fs = require('fs')
const readline = require("readline");
const Data = require('./data.js')

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
const datas = []

let files = fs.readdirSync('./data/')

for(let i = 0;i < files.length;i++){
    let data = JSON.parse(fs.readFileSync('./data/' + files[i]))
    data.redo = true
    data.dht = dht
    data.ed = ed
    data = new Data(data)
    datas.push(data)
}

let line = true

dht.listen(async () => {
  console.log('listening')
  while(line){
      let commandLine = await testFunc()
      if(commandLine === 'closed'){
            console.log(commandLine)
            rl.close()
            line = false
      }
  }
})

rl.on("close", function(){
  console.log("\nBYE BYE !!!");
  process.exit(0);
});

function testFunc(){
  return new Promise((resolve, reject) => {
    rl.question("waiting for something:", function(command){
      if(command === 'close'){
        console.log('closing')
        datas.forEach(res => {
            res.finish()
        })
        console.log('closed')
        resolve('closed')
      } else if(command === 'add'){
        rl.question("info:", function(info){
            if(info.length < 200){
                console.log('adding')
                let data = new Data({redo: false, info, dht, ed})
                datas.push(data)
                console.log('added')
                resolve('added')
            } else {
                console.log('info too long')
                resolve('info too long')
            }
        })
      } else if(command === 'search'){
        rl.question("hash:", function(hash){
            console.log('searching')
            dht.get(hash, (error, hashData) => {
                let res = null
                if(error){
                    res = error
                } else if(hashData){
                    console.log('info:', hashData)
                    console.log('data:', hashData.v.toString('hex').toUpperCase())
                    res = 'found'
                } else {
                    res = 'error: nothing happened'
                }
                console.log(res)
                resolve(res)
            })
        })
      } else if(command === 'see'){
        rl.question("hash:", function(hash){
            console.log('seeing')
            let iter = null
            for(let i = 0;i < datas.length;i++){
                if(datas[i].hash === hash){
                    iter = i
                }
            }
            let res = null
            if(typeof(iter) === 'number'){
                console.log(datas[iter])
                res = 'shown'
            } else {
                res = 'did not find'
            }
            console.log('shown')
            resolve('shown')
        })
      } else if(command === 'remove'){
        rl.question("hash:", function(hash){
            console.log('removing')
            let iter = null
            for(let i = 0;i < datas.length;i++){
                if(datas[i].hash === hash){
                    datas[i].finish()
                    fs.unlinkSync('./data/' + datas[i].hash)
                    iter = i
                }
            }
            let res = null
            if(typeof(iter) === 'number'){
                datas.splice(iter, 1)
                res = 'removed'
            } else {
                res = 'did not find it'
            }
            console.log(res)
            resolve(res)
        })
      } else if(command === 'update'){
        rl.question("hash-info:", function(lineData){
            if(lineData.length < 200){
                console.log('updating')
                let hash = lineData.split('-')[0]
                let info = lineData.split('-')[1]
                let iter = null
                for(let i = 0;i < datas.length;i++){
                    if(datas[i].hash === hash){
                        datas[i].updateData(info)
                        iter = i
                    }
                }
                let res = null
                if(typeof(iter) === 'number'){
                    res = 'updated'
                } else {
                    res = 'did not find it'
                }
                console.log(res)
                resolve(res)
            } else {
                console.log('info too long')
                resolve('info too long')
            }
        })
      } else {
          console.log('error with command')
          reject('error with command')
      }
      // rl.question("Where do you live ? ", function(country) {
      //     console.log(`${name}, is a citizen of ${country}`);
      //     rl.close();
      // });
    });
  })
}