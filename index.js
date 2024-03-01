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
const saltRounds = 10;

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


app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(passport.initialize());
app.use(passport.session());


app.get("/", async(req, res) => {
  const movies = await moviesDbModel.getAllMovies();
  const reviews = await reviewsDbModel.getAllReviews();
  res.render("index.ejs", {
    movies: movies,
    reviews: reviews,
    isLoggedIn: req.isAuthenticated()
  })
    
});

app.get("/reviews", async(req, res) => {
    var title = req.query.movie;
    if (title != undefined){
      await movieRequestTitle(title, req, res);
    }
    else{
      var movieApiId = req.query.movieApi;
      await movieRequestApi(movieApiId, req, res);
    }
});

async function movieRequestTitle(title, req, res){
  const movie = await moviesDbModel.getMovieByTitle(title);
  await renderWithReview(movie, req, res);
}

async function movieRequestApi(apiId, req, res){
  const movie = await moviesDbModel.getMovieByApiID(apiId);
  if(movie == null){
    await renderNewmovie(apiId, req, res);
  }
  else{
    await renderWithReview(movie, req, res);
  }
}

async function renderWithReview(movie, req, res){
  const reviews = await reviewsDbModel.getAllReivewForMovie(movie.id);
    res.render("reviews.ejs", {
        movie: movie,
        reviews: reviews,
        isLoggedIn:req.isAuthenticated()
      });
}

async function renderNewmovie(apiId, req, res){
    const movie = await movieFetcher.getMovieById(apiId);
    res.render("reviews.ejs", {
      movie: movie,
      reviews: [],
      isLoggedIn:req.isAuthenticated()
    });
}

app.get("/review", async(req, res) => {
  var review_id = req.query.id;
  const review = await reviewsDbModel.getReview(review_id);
  const movie = await moviesDbModel.getMovie(review.movie_id);
  
  res.render("review.ejs", {
      movie: movie,
      review: review,
      isLoggedIn:req.isAuthenticated()
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
    movies: movieResultes,
    isLoggedIn:req.isAuthenticated()
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
  if(req.isAuthenticated()){
    res.redirect("/");
    return;
  }
  res.render("login.ejs",{
    isLoggedIn:req.isAuthenticated()
  });

});

app.get("/register", (req, res) => {
  if(req.isAuthenticated()){
    res.redirect("/");
    return;
  }
  res.render("register.ejs",{
    isLoggedIn:req.isAuthenticated()
  });
});

app.get("/logout", (req, res) => {
  req.logout(function (err) {
    if(err){
      return next(err);
    }
    res.redirect("/");
  })
})

app.post("/register", async(req, res) => {
  const newUser = await getNewUser(req);
  if (! await IsUserValid(newUser)){
    res.redirect("/register")
    return;
  }
  const savedUser = await usersDbModel.saveUser(newUser);
  if(savedUser == null){
    console.log("Failed to save user");
    return;
  }
  res.redirect("/");
});

app.post("/login",  passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/login",
}));


async function getNewUser(req){
  const newUser = {};
  newUser.email = req.body.email;
  newUser.password = await hashPassword(req.body.password);
  newUser.firstname = req.body.firstname;
  newUser.lastname = req.body.lastname;
  newUser.username = req.body.username;
  return newUser;
}

async function hashPassword(password){
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    console.log("Error during hashing:", error);
    return null;
  }
}

async function IsUserValid(newUser){
  if(await usersDbModel.isEmailUsed(newUser.email)){
    console.log("Email address is already used");
    return false;
  }
  if(await usersDbModel.isUsernameUsed(newUser.username)){
    console.log("Username is already used");
    return false;
  }
  if(newUser.password == null){
    return false;
  }
  return true;
}



passport.use(
  new Strategy(async function verify(username, password, cb){
    const user = await usersDbModel.getUser(username);
    if (user == null){
      return cb("User not found");
    }
    if(!isPasswordValid(user.password, password)){
      return cb(null, false);
    }
    return cb(null, user)
  })
);

async function isPasswordValid(storedPassword, password){
  try {
    await bcrypt.compare(password, storedPassword);
    return true;
  } catch (error) {
    console.log("Incorrect password!");
    return false;    
  }
  
}

passport.serializeUser((user, cb) => {
  cb(null, user);
});
passport.deserializeUser((user, cb) => {
  cb(null, user);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
