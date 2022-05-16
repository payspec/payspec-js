
 
import fs from 'fs'
import path from 'path'


import web3utils from 'web3-utils'
 
  
export default class FileHelper{


    static  readJSONFile(uri:string){

         let input =  fs.readFileSync(path.resolve( uri),   {encoding:'utf8', flag:'r'}); 

         return JSON.parse(input)
    }

    static readLocalFile( path:string  ){

        let output = fs.readFileSync(path,{ encoding: 'utf8' });
    
        return output 

    }


    static mkdirSync(path:string){
        try{
            fs.mkdirSync(path)
        }catch(e){
            //console.error(e)
        }
       
    }
     

    static addRandomSaltToFileName(fileName:string){

        let fileNameSalt = web3utils.randomHex(16)

        let fileNamePrefix = fileName.split('.')[0]
        let fileNamePostfix = fileName.split('.')[1]

        return fileNamePrefix.concat('_').concat(fileNameSalt).concat('.').concat(fileNamePostfix)

    }


}