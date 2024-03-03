import DbModel from "./dbModel.js";

class MoviesDbModel extends DbModel{
    constructor(dbConnection){
        super(dbConnection)
    }

    async getAllMovies(){
        const result = await this.dbConnection.sendQuery(
            "SELECT movies.*, count(review) as review_count, avg(rating) as avg_rating FROM movies JOIN reviews on reviews.movie_id = movies.id GROUP BY movies.id ORDER BY review_count DESC",[]
        );
        
        if (this.isResult(result)){
            return result;
        }
        return null;
    }

    async getMovies(limit){
        const result = await this.dbConnection.sendQuery(
            "SELECT movies.*, count(review) as review_count, avg(rating) as avg_rating FROM movies JOIN reviews on reviews.movie_id = movies.id GROUP BY movies.id ORDER BY review_count DESC LIMIT $1",[ limit]
        );
        
        if (this.isResult(result)){
            return result;
        }
        return null;
    }

    async getMovie(movieId){
        const result = await this.dbConnection.sendQuery(
            "SELECT movies.*, count(review) as review_count, avg(rating) as avg_rating FROM movies JOIN reviews on reviews.movie_id = movies.id WHERE movies.id = $1 GROUP BY movies.id",[movieId]
        );
        if (this.isResult(result)){
            return result[0];
        }
        return null;
    }

    async isSaved(movieId){
        const result = await this.dbConnection.sendQuery(
            "SELECT movies.*, count(review) as review_count, avg(rating) as avg_rating FROM movies JOIN reviews on reviews.movie_id = movies.id WHERE movies.id = $1 GROUP BY movies.id",[movieId]
        );
        return this.isResult(result);
    }


    async getMovieByApiID(apiId){
        const result = await this.dbConnection.sendQuery(
            "SELECT movies.*, count(review) as review_count, avg(rating) as avg_rating FROM movies JOIN reviews on reviews.movie_id = movies.id WHERE api_id = $1 GROUP BY movies.id",[apiId]
        );
        
        if (this.isResult(result)){
            return result[0];
        }
        return null;
    }

    async getMovieByTitle(title){
        const result = await this.dbConnection.sendQuery(
            "SELECT movies.*, count(review) as review_count, avg(rating) as avg_rating FROM movies JOIN reviews on reviews.movie_id = movies.id WHERE title = $1 GROUP BY movies.id",[title]
        );
        if (this.isResult(result)){
            return result[0];
        }
        return null;
    }

    async saveMovie(movie){
        const result = await this.dbConnection.sendQuery(
            "INSERT INTO movies (api_id, title, poster_path, overview, release_date) VALUES ($1, $2, $3, $4, $5) RETURNING *", [movie.id, movie.title, movie.poster_path, movie.overview, movie.release_date]
        );
        if (this.isResult(result)){
            return result[0];
        }
        return null;
    }

}

export default MoviesDbModel;