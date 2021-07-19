const fs = require('fs')

let files = fs.readdirSync('./data/')

for(let i = 0;i < files.length;i++){
    console.log(files[i])
}