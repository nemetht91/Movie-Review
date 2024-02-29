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
    if (title != undefined){
      await movieRequestTitle(title, res);
    }
    else{
      var movieApiId = req.query.movieApi;
      await movieRequestApi(movieApiId, res);
    }
});

async function movieRequestTitle(title, res){
  const movie = await moviesDbModel.getMovieByTitle(title);
  await renderWithReview(movie, res);
}

async function movieRequestApi(apiId, res){
  const movie = await moviesDbModel.getMovieByApiID(apiId);
  if(movie == null){
    await renderNewmovie(apiId, res);
  }
  else{
    await renderWithReview(movie, res);
  }
}

async function renderWithReview(movie, res){
  const reviews = await reviewsDbModel.getAllReivewForMovie(movie.id);
    res.render("reviews.ejs", {
        movie: movie,
        reviews: reviews
      });
}

async function renderNewmovie(apiId, res){
    const movie = await movieFetcher.getMovieById(apiId);
    res.render("reviews.ejs", {
      movie: movie,
      reviews: []
    });
}

app.get("/review", async(req, res) => {
  var review_id = req.query.id;
  const review = await reviewsDbModel.getReview(review_id);
  const movie = await moviesDbModel.getMovie(review.movie_id);
  
  res.render("review.ejs", {
      movie: movie,
      review: review
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


app.post("/search", async(req, res) => {
  const movieTitle = req.body.movieTitle;
  var movieResultes = await movieFetcher.getMovie(movieTitle);
  movieResultes = await addReviewCount(movieResultes);
  res.render("movie_results.ejs",
  {
    search_text: movieTitle,
    movies: movieResultes
  });
});

async function addReviewCount(movies){
  for(let i = 0; i < movies.length; i++ ){
    var movieWithReview = await moviesDbModel.getMovieByApiID(movies[i].id);
    if (movieWithReview == null){
      movies[i].review_count = 0;
    }
    else{
      movies[i].review_count = movieWithReview.review_count;
    }
  }
  return movies;  
}

app.get("/login", (req, res) => {
  res.render("login.ejs");

});

app.get("/register", (req, res) => {
  res.render("register.ejs");

});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
