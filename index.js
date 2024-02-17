import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy } from "passport-local";
import session from "express-session";
import env from "dotenv";
import MovieFetcher from "./movie_fetch.js";
import DbConnection from "./database.js";
import Users from "./users.js";

const app = express();
const port = 3000;

env.config();

const movieFetcher = new MovieFetcher(process.env.MOVIEDB_API_KEY);
const dbConnection = new DbConnection(
    process.env.PG_USER,
    process.env.PG_HOST,
    process.env.PG_DATABASE,
    process.env.PG_PASSWORD,
    process.env.PG_PORT
);

const users = new Users(dbConnection);


app.use(bodyParser.urlencoded({ extended: true }));



app.get("/", async(req, res) => {
    // var movies = await movieFetcher.getMovie("jurassic");
    // movies.forEach(movie => {
    //     console.log(movie);
    // });
    // const new_user = await users.saveUser("dummyemail@gmail.com", "123456", "John", "Smith", "Johnny01");
    // console.log(new_user);
    const isUsed = await users.isUsernameUsed("Johny01");
    console.log(isUsed);
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
