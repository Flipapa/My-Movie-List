const BASE_URL = "https://movie-list.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/v1/movies/";
const POSTER_URL = BASE_URL + "/posters/";
const MOVIES_PER_PAGE = 12;

const movies = [];
let filteredMovies = [];
let displayMode = "card";
let currentPage = 1;

const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const changeMode = document.querySelector("#change-mode");
const paginetor = document.querySelector("#paginetor");

// Render Card Mode
function renderMovieListCardMode(data) {
  let rawHTML = "";

  data.forEach((item) => {
    //title image
    rawHTML += `
      <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img class="card-img-top"
              src="${POSTER_URL + item.image}"
              alt="Movie Poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer text-muted">
              <button class="btn btn-primary btn-show-movie" data-toggle="modal"
                data-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id
      }">+</button>
            </div>
          </div>
        </div>
      </div>
    `;
  });

  dataPanel.innerHTML = rawHTML;
}

// Render List Mode
function renderMovieListListMode(data) {
  let rawHTML = "";
  rawHTML += `
    <table class="table text-center">
      <thead>
        <tr>
          <th scope="col"></th>
          <th scope="col" class="text-left">Movie Title</th>
          <th scope="col">Release date</th>
          <th scope="col">Function</th>
        </tr>
      </thead>
      <tbody>
  `;
  data.forEach((item) => {
    rawHTML += `
      <tr>
        <th scope="row"></th>
        <td class="text-left">${item.title}</td>
        <td>${item.release_date}</td>
        <td>
          <button class="btn btn-primary btn-show-movie" data-toggle="modal"
                data-target="#movie-modal" data-id="${item.id}">More</button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
        </td>
      </tr>
    `;
  });
  rawHTML += `
      </tbody>
    </table>
  `;

  dataPanel.innerHTML = rawHTML;
}

// Render Movie List

function renderMovieList() {
  displayMode === "card"
    ? renderMovieListCardMode(getMoviesByPage(currentPage))
    : renderMovieListListMode(getMoviesByPage(currentPage));
}

function renderPaginetor(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE);
  let rawHTML = "";

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `
    <li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>
    `;
  }

  paginetor.innerHTML = rawHTML;
}

function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies;
  const startIndex = (page - 1) * MOVIES_PER_PAGE;
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE);
}

function showMovieModal(id) {
  const modalTitle = document.querySelector("#movie-modal-title");
  const modalImage = document.querySelector("#movie-modal-image");
  const modalDate = document.querySelector("#movie-modal-date");
  const modalDescription = document.querySelector("#movie-modal-description");

  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results;
    modalTitle.textContent = data.title;
    modalDate.textContent = "Release date: " + data.release_date;
    modalDescription.textContent = data.description;
    modalImage.innerHTML = `
      <img src="${POSTER_URL + data.image
      }" alt="movie-poster" class="img-fluid">
    `;
  });
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem("favoriteMovies")) || [];
  const movie = movies.find((movie) => movie.id === id);

  if (list.some((movie) => movie.id === id)) {
    return alert("此電影已在收藏清單中！");
  }

  list.push(movie);

  localStorage.setItem("favoriteMovies", JSON.stringify(list));
}

dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.matches(".btn-show-movie")) {
    showMovieModal(Number(event.target.dataset.id));
  } else if (event.target.matches(".btn-add-favorite")) {
    addToFavorite(Number(event.target.dataset.id));
  }
});

paginetor.addEventListener("click", function onPaginetorClicked(event) {
  if (event.target.tagName !== "A") return;
  currentPage = Number(event.target.dataset.page);

  renderMovieList();
});

searchForm.addEventListener("submit", function onSearchFormSubmitted(event) {
  event.preventDefault();
  // console.log(event)
  const keyword = searchInput.value.trim().toLowerCase();
  currentPage = 1;

  // if (!keyword.length) {
  //   return alert('Please enter a valid string')
  // }

  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  );

  if (filteredMovies.length === 0) {
    return alert("Cannot find movies with keyword: " + keyword);
  }

  // for (const movie of movies) {
  //   if (movie.title.toLowerCase().includes(keyword)) {
  //     filteredMovies.push(movie)
  //   }
  // }

  renderPaginetor(filteredMovies.length);
  renderMovieList();
});

changeMode.addEventListener("click", function onModeClicked(event) {
  if (event.target.matches("#card-mode")) {
    displayMode = "card";
  } else if (event.target.matches("#list-mode")) {
    displayMode = "list";
  }
  renderMovieList();
});

axios.get(INDEX_URL).then((response) => {
  movies.push(...response.data.results);
  renderPaginetor(movies.length);
  paginetor.firstElementChild.classList.add("active")
  paginetor.firstElementChild.setAttribute("aria-current", "page")
  renderMovieList();
});
