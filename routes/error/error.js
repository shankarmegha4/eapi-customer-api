const fs=require('fs');
// eslint-disable-next-line no-undef
const contents = fs.readFileSync(__dirname + '/error.json');
const errorMaster = JSON.parse(contents);

const HttpStatusCodes = { OK:200, INVALIDREQ:400, UNAUTHORIZED:401,NOTFOUND: 404,INVALIDVERB:405, GENERICERROR:500,BACKENDERROR:503 };

function getError(errorCode){
    
    for(var error of errorMaster.errors){
        if (error.status == errorCode){
            var clonedError = JSON.parse(JSON.stringify(error))
            delete clonedError.status;
            return clonedError;
        }
                   
    }
}

module.exports.getError = getError;
module.exports.HttpStatusCodes = HttpStatusCodes;

