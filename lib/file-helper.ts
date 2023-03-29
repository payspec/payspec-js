
 
 
 

const fs = require('fs')
const path = require('path')

 

export function readJSONFile(uri:string){

    let input =  fs.readFileSync(path.resolve( uri),   {encoding:'utf8', flag:'r'}); 

    return JSON.parse(input)
}
  