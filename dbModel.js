
class DbModel{
    constructor(dbConnection){
        this.dbConnection = dbConnection
    }


    async isResult(result){
        if (result == null){
            return false;
        }
        if (result.length < 1 || result == undefined){
            return false;
        }
        return true;
    }

}

export default DbModel;