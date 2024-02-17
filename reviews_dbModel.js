import DbModel from "./dbModel.js";

class ReviewsDbModel extends DbModel{
    constructor(dbConnection){
        super(dbConnection)
    }

    async getAllReviews(){
        const result = await this.dbConnection.sendQuery(
            "SELECT reviews.*, movies.title, movies.poster_path, users.username FROM reviews JOIN movies ON reviews.movie_id = movies.id JOIN users ON reviews.user_id = users.id ORDER BY reviews.id DESC ",[]
        );
        
        if (this.isResult(result)){
            return result;
        }
        return null;
    }

    async getAllReivewForMovie(movieId){
        const result = await this.dbConnection.sendQuery(
            "SELECT * FROM reviews WHERE movie_id = $1 ORDER by id DESC",[movieId]
        );
        
        if (this.isResult(result)){
            return result;
        }
        return null;
    }

    async getAllReivewForUser(userId){
        const result = await this.dbConnection.sendQuery(
            "SELECT * FROM reviews WHERE user_id = $1 ORDER by id DESC",[userId]
        );
        
        if (this.isResult(result)){
            return result;
        }
        return null;
    }

    async saveReview(rating, review, userId, movieId, date){
        const result = await this.dbConnection.sendQuery(
            "INSERT INTO reviews (rating, review, user_id, movie_id, date) VALUES ($1, $2, $3, $4, $5) RETURNING *", [rating, review, userId, movieId, date]
        );
        if (this.isResult(result)){
            return result[0];
        }
        return null;
    }

}

export default ReviewsDbModel;