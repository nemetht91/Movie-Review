
// Slider
const leftArraow = document.querySelector(".arrow-left");
const rightArrow = document.querySelector(".arrow-right");
const movies = document.querySelectorAll(".hot-movies .movie");
const movieGrid = document.querySelector(".hot-movies .grid");
const movieGridStyle = window.getComputedStyle(movieGrid);
var firstmovie = 0;

var movieDisplayNum = movieGridStyle.getPropertyValue("grid-template-columns").split(" ").length;

window.addEventListener("load", event => {
    if(movies != null){
        shiftMovies();
        hideArrows();
    }
});

window.addEventListener("resize", event => {
    var oldMovieDisplayNum = movieDisplayNum;
    movieDisplayNum = movieGridStyle.getPropertyValue("grid-template-columns").split(" ").length;
    if(oldMovieDisplayNum < movieDisplayNum){
        if(firstmovie + movieDisplayNum > movies.length){
            firstmovie--;
        }
    }
    shiftMovies();
    hideArrows();
})

function shiftMovies(){
    for(var i = 0; i < firstmovie; i++){
        movies[i].classList.add("hidden");
    }
    for(var i = firstmovie; i < firstmovie + movieDisplayNum; i++){
        if(i < movies.length){
            movies[i].classList.remove("hidden");
        }
    }
    for(var i =  firstmovie + movieDisplayNum; i < movies.length; i++){
        movies[i].classList.add("hidden");
    }
}


rightArrow.addEventListener("click", event => {
    
    if(firstmovie + movieDisplayNum < movies.length ){
        firstmovie++;
        shiftMovies();
        hideArrows();
    }
});

leftArraow.addEventListener("click", event => {
    if(firstmovie >0 ){
        firstmovie--;
        shiftMovies();
        hideArrows();
    }
});

function hideArrows(){
    if(firstmovie == 0){
        leftArraow.classList.add(".hidden");
    }
    else{
        leftArraow.classList.remove(".hidden");
    }

    if(firstmovie + movieDisplayNum >= movies.length - 1){
        rightArrow.classList.add(".hidden");
    }
    else{
        rightArrow.classList.remove(".hidden");
    }
}

