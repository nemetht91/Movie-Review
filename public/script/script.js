
// Slider
const leftArraow = document.querySelector(".arrow-left");
const rightArrow = document.querySelector(".arrow-right");
const movies = document.querySelectorAll(".hot-movies .movie");
const movieGrid = document.querySelector(".hot-movies .grid");
var movieGridStyle = null;
var firstmovie = 0;

var movieDisplayNum = 0;

window.addEventListener("load", event => {
    if(window.location.href.replaceAll(window.location.origin, '').replaceAll('/','').length === 0 ){
        movieGridStyle = window.getComputedStyle(movieGrid);
        movieDisplayNum = movieGridStyle.getPropertyValue("grid-template-columns").split(" ").length
        shiftMovies();
        hideArrows();
    }
});

window.addEventListener("resize", event => {
    if(window.location.href.replaceAll(window.location.origin, '').replaceAll('/','').length === 0 ){
        var oldMovieDisplayNum = movieDisplayNum;
        movieDisplayNum = movieGridStyle.getPropertyValue("grid-template-columns").split(" ").length;
        if(oldMovieDisplayNum < movieDisplayNum){
            if(firstmovie + movieDisplayNum > movies.length){
                firstmovie--;
            }
        }
        shiftMovies();
        hideArrows();
    }
    
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

if(rightArrow){
    rightArrow.addEventListener("click", event => {
    
        if(firstmovie + movieDisplayNum < movies.length ){
            firstmovie++;
            shiftMovies();
            hideArrows();
        }
    });
}

if(leftArraow){
    leftArraow.addEventListener("click", event => {
        if(firstmovie >0 ){
            firstmovie--;
            shiftMovies();
            hideArrows();
        }
    });
}


function hideArrows(){
    if(firstmovie == 0){
        leftArraow.classList.add("hidden");
    }
    else{
        leftArraow.classList.remove("hidden");
    }

    if(firstmovie + movieDisplayNum >= movies.length - 1){
        rightArrow.classList.add("hidden");
    }
    else{
        rightArrow.classList.remove("hidden");
    }
}


/* Rating */
const stars = document.querySelectorAll(".stars .star");
const ratingInput = document.querySelector("#rating");

stars.forEach(star => {
    star.addEventListener("click", event => {
        var starId = event.currentTarget.getAttribute("id");
        var id = Number(starId.split("-")[1]);
        highlightStars(id);
        ratingInput.setAttribute("value", id);
    });
});

function highlightStars(starId){
    for(let i =0; i < starId; i++){
        highlightStar(stars[i]);
    }
    for(let i = starId; i < stars.length; i++){
        UnHighlightStar(stars[i]);
    }
}

function highlightStar(star){
    var starIcons = star.querySelectorAll("i");
    starIcons[0].classList.add("hidden");
    starIcons[1].classList.remove("hidden");
}

function UnHighlightStar(star){
    var starIcons = star.querySelectorAll("i");
    starIcons[0].classList.remove("hidden");
    starIcons[1].classList.add("hidden");
}




