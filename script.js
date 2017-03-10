// For querying the MovieDB for a movie title's ID
const S_BASE_URL="https://api.themoviedb.org/3/search/movie?api_key=1710c94a1d9a1c75e363bf47a0f446b3";
// The url path for getting the poster image in the Movie DB
const MOVIE_API_KEY = "?api_key=1710c94a1d9a1c75e363bf47a0f446b3";

// Object for managing state
var state = {
  movieData: {},
  musicData: {},
  favorites: [],
  rndmFilms: []
};

// Empty arrays to hold separate data from the movie DB. JQuery UI's autocomplete
// method will point to movieTitles as its 'source'
// These arrays will be populated with data from the Movie DB upon loading the doc
var autocomp = {
  genreIds: [],
  movieTitles: []
};

// Functions that modify or retrieve data from state
function addFavorite(state) {
  if (state.favorites.length < 5) {
    state.favorites.push({ title: state.movieData.title,
                           poster: state.movieData.poster });
  } else {
    alert("Please only add up to 5 favorites");
  }
}

function removeFavorite(state, index) {
  let favs = state.favorites;
  favs.splice(index, 1);
}

function checkIsFavorite(state) {
  let current = state.movieData;
  let favs = state.favorites;
  for (let i=0; i<favs.length; i++) {
    if(favs[i].title === current.title) {
      return [true, i];
    }
  }
  return [false, 0];
}

// Determine the number of stars to associate with the movie
function getNumStars(state) {
  let rating = state.movieData.rating;
  if (rating > 8) { return 5; }
  else if (rating <= 8 && rating > 6) { return 4; }
  else if (rating <= 6 && rating > 4) { return 3; }
  else if (rating <= 4 && rating > 2) { return 2; }
  else if (rating === 0) { return 2; }
  else { return 1; }
}

// Functions for populating the movies titles array for the autocomplete functionality
// query to movie DM to get a list of titles under each genre
function getTitles(id) {
  let genreReq = `https://api.themoviedb.org/3/genre/${id}/movies${MOVIE_API_KEY}&language=en-US&include_adult=false&sort_by=created_at.asc`;
  $.ajax({
    url: genreReq,
    success: function(data) {
      data.results.forEach(function(item) {
        if (autocomp.movieTitles.indexOf(item.title) === -1) {
          autocomp.movieTitles.push(item.title);
        }
      });
    }
  });
}

// Query the movie DM to get a list of all genres with their ids.
// Save the ids in the genreIds array and invoke getTitles for each genre id
function getGenres(state) {
  let listRequest = `https://api.themoviedb.org/3/genre/movie/list${MOVIE_API_KEY}&language=en-US`;
  //console.log(rndm);
  $.ajax({
    url: listRequest,
    success: function(result) {
      result.genres.forEach(function(item) {
        autocomp.genreIds.push(item.id);
      });
      autocomp.genreIds.forEach(function(id) {
        getTitles(id);
      });
    }
  });
}

// Funciton to handle API calls and handle data for a user search
// Get the data from the movie API
function getMovieData(searchTerm) {
  $.ajax({
    url: S_BASE_URL,
    data: {query: searchTerm},
    success: function(data) {
      let urlSearchID = "https://api.themoviedb.org/3/movie/"+data.results[0].id+MOVIE_API_KEY;
      $.ajax({
        url: urlSearchID,
        success: function(result) {
          state.movieData.title = result.title.toUpperCase();
          state.movieData.year = result.release_date.substr(0, 4);
          state.movieData.poster = "https://image.tmdb.org/t/p/w500"+result.poster_path;
          state.movieData.desc = result.overview;
          state.movieData.rating = result.vote_average;
          state.movieData.tagline = result.tagline;
          state.movieData.site = result.homepage;
          state.movieData.backdropImg = "https://image.tmdb.org/t/p/w500"+result.backdrop_path;
          //console.log(state.movieData);
          // getMusicData() --> Goes here
          renderMovie(state, $("#movie-info"));
        }
      });
    }
  });
}

// Get Data from the music API function Declaration goes here
// function getMusicData(userSearch) {....
// Upon 'success' update state with music data
// invoke renderMovie() and renderMusic()

// Functions for rendering state to the DOM
function doStars(state) {
  let numStars = getNumStars(state);
  for (let i=1; i<=numStars; i++) {
    let star = `#star-${i}`;
    $(star).removeClass("fa-star-o").addClass("fa-star");
  }
}

function renderMovie(state, $element) {
  let m = state.movieData;
  let isFavorite = checkIsFavorite(state);
  let heart = isFavorite[0] ? "fa-heart" : "fa-heart-o";
  let filmHtml =
              (`<div class='three columns' id='left-well'>
                  <img src=${m.poster} id='movie-poster'>
               </div>
               <div class='nine columns'>
                <div class='row'>
                  <div class='ten columns'>
                    <h4>${m.title}</h4>
                    <div id="stars-container">
                      <i id='star-1' class="fa fa-star-o" aria-hidden="true"></i>
                      <i id='star-2' class="fa fa-star-o" aria-hidden="true"></i>
                      <i id='star-3' class="fa fa-star-o" aria-hidden="true"></i>
                      <i id='star-4' class="fa fa-star-o" aria-hidden="true"></i>
                      <i id='star-5' class="fa fa-star-o" aria-hidden="true"></i>
                    </div>
                    <p><i id='heart' class="fa ${heart}" aria-hidden="true"></i>  Add to favorites</p>
                  </div>
                  <div class='two columns' id='year-wrapper'>
                   <h4 id='year'>(${m.year})</h4>
                  </div>
                </div>
                <p><em>${m.tagline}</em></p>
                <p id='desc'>${m.desc}</p>
               </div>`);
  $element.html(filmHtml);
  doStars(state);
}

// renderMusic Function Declaration goes here
// Render music data

// Event Listeners
// Handle each time a user searches for a movie title
function handleSearch($btn, $input) {
  $btn.on("click", function(e) {
    let userSearch = $input.val();
    getMovieData(userSearch);
  });
}

// Handle the autocomplete functionality
function doAutocomplete($input) {
  getGenres(state);
  $input.autocomplete({
     source: autocomp.movieTitles,
     minLength: 2,
     delay: 300
  });
}

function handleAddFavorite($container) {
  $container.on("click", "#heart", function(e) {
    let isFavorite = checkIsFavorite(state);
    if (!isFavorite[0]) {
      addFavorite(state);
      $("#heart").removeClass("fa-heart-o").addClass("fa-heart");
    } else {
      removeFavorite(state, isFavorite[1]);
      $("#heart").removeClass("fa-heart").addClass("fa-heart-o");
    }
  });
}

function handleGetFavorite($element) {
  console.log('to do');
  // If you click on a button it will handle ajax call for the favoite
}

// Invoke Functions, document ready...
$(document).ready(function() {
  doAutocomplete($("#search"));
  handleSearch($("#btn"), $("#search"));
  handleAddFavorite($("#movie-info"));
});
