import DbModel from "./dbModel.js";

class CommentsDbModel extends DbModel{
    constructor(dbConnection){
        super(dbConnection);
    }

    async getComments(reviewId){
        const result = await this.dbConnection.sendQuery(
            "SELECT comments.*, users.username FROM comments JOIN users on comments.user_id = users.id WHERE review_id = $1 ORDER BY id DESC ", [reviewId]
        );

        if (this.isResult(result)){
            return result;
        }
        return null;
    }

    async saveComment(comment, date, userId, reviewId){
        const result = await this.dbConnection.sendQuery(
            "INSERT INTO comments (comment_text, date, user_id, review_id) VALUES ($1, $2, $3, $4) RETURNING *", [comment, date, userId, reviewId]
        );
        if (this.isResult(result)){
            return result[0];
        }
        return null;
    }
}

export default CommentsDbModel;