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
import UsersDbModel from "./users_dbModel.js";
import MoviesDbModel from "./movies_dbModel.js";
import ReviewsDbModel from "./reviews_dbModel.js";

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

const usersDbModel = new UsersDbModel(dbConnection);
const moviesDbModel = new MoviesDbModel(dbConnection);
const reviewsDbModel = new ReviewsDbModel(dbConnection);


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


app.get("/", async(req, res) => {
  const movies = await moviesDbModel.getAllMovies();
  const reviews = await reviewsDbModel.getAllReviews();
  res.render("index.ejs", {
    movies: movies,
    reviews: reviews
  })
    
});

app.get("/reviews", async(req, res) => {
    var title = req.query.movie;
    //title = title.trimStart();
    const movie = await moviesDbModel.getMovieByTitle(title);
    const reviews = await reviewsDbModel.getAllReivewForMovie(movie.id);
    res.render("reviews.ejs", {
        movie: movie,
        reviews: reviews
      })
});

app.get("/profile", async(req, res) => {
    var username = req.query.user;
    //title = title.trimStart();
    const user = await usersDbModel.getUserByUsername(username);
    const reviews = await reviewsDbModel.getAllReivewForUser(user.id);
    console.log(reviews)
    // res.render("reviews.ejs", {
    //     movie: movie,
    //     reviews: reviews
    //   })
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
