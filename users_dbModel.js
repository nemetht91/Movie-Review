import DbModel from "./dbModel.js";

class UsersDbModel extends DbModel{
    constructor(dbConnection){
        super(dbConnection)
    }

    async getUser(email){
        const result = await this.dbConnection.sendQuery(
            "SELECT * FROM users WHERE email = $1", [email]
        );
        if (this.isResult(result)){
            return result[0];
        }
        return null;
    }

    async getUserByUsername(username){
        const result = await this.dbConnection.sendQuery(
            "SELECT * FROM users WHERE username = $1", [username]
        );
        if (this.isResult(result)){
            return result[0];
        }
        return null;
    }

    async saveUser(newUser){
        const result = await this.dbConnection.sendQuery(
            "INSERT INTO users (email, password, first_name, last_name, username) VALUES ($1, $2, $3, $4, $5) RETURNING *", [newUser.email, newUser.password, newUser.firstname, newUser.lastname, newUser.username]
        );
        if (this.isResult(result)){
            return result;
        }
        return null;
    }

    async isEmailUsed(email){
        const result = await this.dbConnection.sendQuery(
            "SELECT * from users WHERE email = $1", [email]
        );
        return !this.isResult(result);
    }

    async isUsernameUsed(username){
        const result = await this.dbConnection.sendQuery(
            "SELECT * from users WHERE username = $1", [username]
        );
        return !this.isResult(result);
    }

}

export default UsersDbModel;