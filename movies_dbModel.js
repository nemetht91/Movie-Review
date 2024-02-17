import DbModel from "./dbModel.js";

class MoviesDbModel extends DbModel{
    constructor(dbConnection){
        super(dbConnection)
    }

    async getAllMovies(){
        const result = await this.dbConnection.sendQuery(
            "SELECT * FROM movies ORDER by id DESC",[]
        );
        
        if (this.isResult(result)){
            return result;
        }
        return null;
    }

    async getMovieByApiID(apiId){
        const result = await this.dbConnection.sendQuery(
            "SELECT * FROM movies WHERE api_id = $1",[apiId]
        );
        
        if (this.isResult(result)){
            return result[0];
        }
        return null;
    }

    async saveMovie(apiID, title, posterPath, overview, release_date){
        const result = await this.dbConnection.sendQuery(
            "INSERT INTO movies (api_id, title, poster_path, overview, release_date) VALUES ($1, $2, $3, $4, $5) RETURNING *", [apiID, title, posterPath, overview, release_date]
        );
        if (this.isResult(result)){
            return result[0];
        }
        return null;
    }

}

export default MoviesDbModel;