const express = require("express");

const app = express();

app.use(express.json()); // add this line

// movies

const movieControllers = require("./controllers/movieControllers");
const validateMovie = require("./middlewares/validateMovie");

app.get("/api/movies", movieControllers.getMovies);
app.get("/api/movies/:id", movieControllers.getMovieById);
app.post("/api/movies", validateMovie, movieControllers.postMovie);
app.put("/api/movies/:id", movieControllers.updateMovie);
app.delete("/api/movies/:id", movieControllers.deleteMovie);

// users

const userControllers = require("./controllers/userControllers");
const validateUser = require("./middlewares/validateuser");

app.get("/api/users", (req, res) => userControllers.getUsers(req, res));
app.get("/api/users/:id", validateUser, userControllers.getUserById);
app.post("/api/users", validateUser, userControllers.postUser);
app.put("/api/users/:id", userControllers.updateUser);
app.delete("/api/users/:id", userControllers.deleteUser);

module.exports = app;


