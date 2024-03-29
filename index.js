import express from "express";
import bodyParser from "body-parser";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy } from "passport-local";
import session from "express-session";
import env from "dotenv";
import flash from "express-flash-message";
import MovieFetcher from "./movie_fetch.js";
import DbConnection from "./database.js";
import UsersDbModel from "./users_dbModel.js";
import MoviesDbModel from "./movies_dbModel.js";
import ReviewsDbModel from "./reviews_dbModel.js";
import CommentsDbModel from "./comments_db_model.js";

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
const commentsDbModel = new CommentsDbModel(dbConnection);

var returnURL = "/";



app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie:{
      maxAge: 1000 * 60 * 60 *24,
    }
  })
);

app.use(
  flash({
    sessionKeyName: process.env.SESSION_KEY_NAME,
  })
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(passport.initialize());
app.use(passport.session());


app.get("/", async(req, res) => {
  returnURL = req.originalUrl;
  const movies = await moviesDbModel.getMovies(10);
  const newMovies = await moviesDbModel.getNewestMovies(3);
  const reviews = await reviewsDbModel.getReviews(6);
  res.render("index.ejs", {
    movies: movies,
    newMovies: newMovies,
    reviews: reviews,
    isLoggedIn: req.isAuthenticated(),
    overviewShortener: overviewShortener
  })
    
});

function overviewShortener(overview, maxWords){
  var striped = overview.split(" ");
  if (striped.length <= maxWords){
    return overview;
  }
  var shortend = "";
  for(let i = 0; i < maxWords; i++){
    shortend += striped[i];
    if(i != maxWords-1){
      shortend += " ";
    }
  }
  shortend += "..."
  
  return shortend;
}

app.get("/reviews", async(req, res) => {
  returnURL = req.originalUrl;
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
    res.render("movie_reviews.ejs", {
        movie: movie,
        reviews: reviews,
        isLoggedIn:req.isAuthenticated(),
        overviewShortener: overviewShortener
      });
}

async function renderNewmovie(apiId, req, res){
    const movie = await movieFetcher.getMovieById(apiId);
    res.render("movie_reviews.ejs", {
      movie: movie,
      reviews: [],
      isLoggedIn:req.isAuthenticated(),
      overviewShortener: overviewShortener
    });
}

app.get("/review", async(req, res) => {
  returnURL = req.originalUrl;
  var review_id = req.query.id;
  const review = await reviewsDbModel.getReview(review_id);
  const movie = await moviesDbModel.getMovie(review.movie_id);
  const comments = await commentsDbModel.getComments(review.id);
  
  res.render("review.ejs", {
      movie: movie,
      review: review,
      comments: comments,
      isLoggedIn:req.isAuthenticated()
    })
});

app.get("/movies", async(req, res) => {
  returnURL = req.originalUrl;
  const movies = await moviesDbModel.getAllMovies();
  res.render("movies.ejs",
  {
    movies: movies,
    isLoggedIn: req.isAuthenticated()
  })
});

app.get("/all_reviews", async(req, res) => {
  returnURL = req.originalUrl;
  const reviews = await reviewsDbModel.getAllReviews();
  res.render("all_reviews.ejs",
  {
    reviews: reviews,
    isLoggedIn: req.isAuthenticated(),
    overviewShortener: overviewShortener
  })
});

app.get("/profile", async(req, res) => {
    returnURL = req.originalUrl;
    var username = req.query.user;
    const user = await usersDbModel.getUserByUsername(username);
    const reviews = await reviewsDbModel.getAllReivewForUser(user.id);
    res.render("user_profile.ejs", {
        user: user,
        reviews: reviews,
        isLoggedIn: req.isAuthenticated(),
        overviewShortener: overviewShortener
      })
});


app.post("/search", async(req, res) => {
  returnURL = req.originalUrl;
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

app.get("/create", async (req, res) => {
  if(!req.isAuthenticated()){
    res.redirect("/");
    return;
  }
  const movieId= req.query.id;
  const movie = await getMovie(movieId);
  if(movie == null){
    res.redirect("/");
    return;
  }
  res.render("create.ejs",{
    movie: movie,
    isLoggedIn:req.isAuthenticated()
  });
  
});

async function getMovie(id){
  var movie = await moviesDbModel.getMovieByApiID(id);
  if(movie != null){
    return movie;
  }
  return await movieFetcher.getMovieById(id);
}

app.post("/create", async (req, res) => {
  if(!req.isAuthenticated()){
    res.redirect("/");
    return;
  }
  const movieId= req.query.id;
  const review = req.body.review;
  const rating = req.body.rating;
  var movie = await getMovie(movieId);
  const isSaved = await moviesDbModel.isSaved(movieId);
  if(!isSaved){
    movie = await moviesDbModel.saveMovie(movie);
  }
  if(movie == null){
    res.redirect("/");
    return;
  }

  await reviewsDbModel.saveReview(rating, review, req.user.id, movie.id, new Date());

  res.redirect(`/reviews?movie=${movie.title}`);
  
});

app.post("/comment", async(req, res) =>{
  const comment = req.body.comment;
  const reviewId = req.query.review_id;

  if(req.isAuthenticated()){
    await commentsDbModel.saveComment(comment, new Date(), req.user.id, reviewId);
  }

  res.redirect(`/review?id=${reviewId}`);
})

app.post("/register", async(req, res) => {
  const newUser = await getNewUser(req);
  if (! await IsUserValid(newUser, res)){
    res.redirect("/register")
    return;
  }
  const savedUser = await usersDbModel.saveUser(newUser);
  if(savedUser == null){
    res.flash("fail", "Unexpected error, please try agin");
    res.redirect("/register");
    return;
  }
  req.login(savedUser, (err)=> {
    res.redirect("/");
  })
});

app.post("/login",  passport.authenticate("local", {
  successRedirect: "/login-success",
  failureRedirect: "/login-fail",
  failureFlash: true,
}));

app.get("/login-fail", (req,res) => {
  res.flash("fail", "Invalid email or password!");
  res.redirect("/login");
});

app.get("/login-success", (req, res) => {
  res.redirect(returnURL);
});


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

async function IsUserValid(newUser, res){
  var response = true;
  if(await usersDbModel.isEmailUsed(newUser.email)){
    res.flash("fail","Email address is already used");
    response = false;
  }
  if(await usersDbModel.isUsernameUsed(newUser.username)){
    res.flash("fail","Username is already used");
    response = false;
  }
  if(newUser.password == null){
    res.flash("fail","Incorrect Password");
    response = false;
  }
  return response;
}



passport.use(
  new Strategy(async function verify(username, password, cb){
    const user = await usersDbModel.getUser(username);
    if (user == null){
      return cb(null, false);
    }
    if(! await isPasswordValid(user.password, password)){
      return cb(null, false);
    }
    return cb(null, user)
  })
);

async function isPasswordValid(storedPassword, password){
  try {
    var result = await bcrypt.compare(password, storedPassword);
    return result;
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
