
class DbModel{
    constructor(dbConnection){
        this.dbConnection = dbConnection
    }


    async isResult(result){
        if (result == null){
            return false;
        }
        if (result.length < 1){
            return false;
        }
        return true;
    }

}

export default DbModel;