import pg from "pg";


class DbConnection{
  constructor(dbUser, dbHost, dbName, dbPassword, dbPort){
    this.dbUser = dbUser,
    this.dbHost = dbHost,
    this.dbName = dbName,
    this.dbPassword = dbPassword,
    this.dbPort = dbPort
  }

  async createNewConnection(){
    const db = new pg.Client({
      user: this.dbUser,
      host: this.dbHost,
      database: this.dbName,
      password: this.dbPassword,
      port: this.dbPort,
    });
    await db.connect();
    return db;
  }

  async sendQuery(queryString, parameters){
    var db = await this.createNewConnection();
    var data = null;
    try{
      var result = await db.query(queryString, parameters);
      data = result.rows;
    }
    catch(err){
      console.error("Error executing query", err.stack);
      return null;
    }
    finally{
      await db.end();
    }
  
    return data;
  }

}

export default DbConnection;








