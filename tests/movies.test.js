const request = require("supertest");

const app = require("../src/app");

const database = require("../database");
// GET

describe("GET /api/movies", () => {
  it("should return all movies", async () => {
    const response = await request(app).get("/api/movies");

    expect(response.headers["content-type"]).toMatch(/json/);

    expect(response.status).toEqual(200);
  });
});

describe("GET /api/movies/:id", () => {
  it("should return one movie", async () => {
    const response = await request(app).get("/api/movies/567");

    expect(response.headers["content-type"]).toMatch(/json/);

    expect(response.status).toEqual(200);
  });

  it("should return no movie", async () => {
    const response = await request(app).get("/api/movies/0");

    expect(response.status).toEqual(404);
  });
});

// POST

describe("POST /api/movies", () => {
  it("should return created movie", async () => {
    const newMovie = {
      title: "Star Wars",
      director: "George Lucas",
      year: "1977",
      color: "1",
      duration: 120,
    };

    const response = await request(app).post("/api/movies").send(newMovie);

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toEqual(201);
    expect(response.body).toHaveProperty("id");
    expect(typeof response.body.id).toBe("number");

    const [result] = await database.query(
      "SELECT * FROM movies WHERE id=?",
      response.body.id
    );

    const [movieInDatabase] = result;

    expect(movieInDatabase).toHaveProperty("id");

    expect(movieInDatabase).toHaveProperty("title");
    expect(typeof movieInDatabase.title).toBe("string");

    expect(movieInDatabase).toHaveProperty("director");
    expect(typeof movieInDatabase.director).toBe("string");

    expect(movieInDatabase).toHaveProperty("year");
    expect(typeof movieInDatabase.year).toBe("string");
    expect(movieInDatabase).toHaveProperty("color");
    expect(typeof movieInDatabase.color).toBe("string");

    expect(movieInDatabase).toHaveProperty("duration");
    expect(typeof movieInDatabase.duration).toBe("number");
  });

  it("should return an error", async () => {
    const movieWithMissingProps = { title: "Harry Potter" };

    const response = await request(app)
      .post("/api/movies")
      .send(movieWithMissingProps);

    expect(response.status).toEqual(422);
  });
});

// PUT

describe("PUT /api/movies/:id", () => {
  it("should edit movie", async () => {
    const newMovie = {
      title: "Avatar",
      director: "James Cameron",
      year: "2010",
      color: "1",
      duration: 162,
    };

    const [result] = await database.query(
      "INSERT INTO movies(title, director, year, color, duration) VALUES (?, ?, ?, ?, ?)",
      [
        newMovie.title,
        newMovie.director,
        newMovie.year,
        newMovie.color,
        newMovie.duration,
      ]
    );

    const id = result.insertId;

    const updatedMovie = {
      title: "Wild is life",
      director: "Alan Smithee",
      year: "2023",
      color: "0",
      duration: 120,
    };

    const response = await request(app)
      .put(`/api/movies/${id}`)
      .send(updatedMovie);

    expect(response.status).toEqual(204);

    const [movies] = await database.query(
      "SELECT * FROM movies WHERE id=?",
      id
    );

    const [movieInDatabase] = movies;

    expect(movieInDatabase).toHaveProperty("id");

    expect(movieInDatabase).toHaveProperty("title");
    expect(movieInDatabase.title).toStrictEqual(updatedMovie.title);

    expect(movieInDatabase).toHaveProperty("director");
    expect(movieInDatabase.director).toStrictEqual(updatedMovie.director);

    expect(movieInDatabase).toHaveProperty("year");
    expect(movieInDatabase.year).toStrictEqual(updatedMovie.year);

    expect(movieInDatabase).toHaveProperty("color");
    expect(movieInDatabase.color).toStrictEqual(updatedMovie.color);

    expect(movieInDatabase).toHaveProperty("duration");
    expect(movieInDatabase.duration).toStrictEqual(updatedMovie.duration);
  });

  it("should return an error", async () => {
    const movieWithMissingProps = { title: "Harry Potter" };

    const response = await request(app)
      .put(`/api/movies/1`)
      .send(movieWithMissingProps);

    expect(response.status).toEqual(404);
  });

  it("should return no movie", async () => {
    const newMovie = {
      title: "Avatar",
      director: "James Cameron",
      year: "2009",
      color: "1",
      duration: 162,
    };

    const response = await request(app).put("/api/movies/0").send(newMovie);

    expect(response.status).toEqual(404);
  });
});


// DELETE

describe('DELETE /api/movies/:id', () => {
  it('should respond with status 204 on successful deletion', async () => {
    // creating a movie to delete
    const movieToBeDeleted = {
      title: 'Test Movie',
      director: 'Test Director',
      year: '2022',
      color: '1',
      duration: 120,
    };

    // post the movie
    const postResponse = await request(app).post('/api/movies').send(movieToBeDeleted);
    expect(postResponse.status).toBe(201);

    // put the id of the movie to delete
    const movieIdToDelete = postResponse.body.id;

    // delete the movie just created
    const deleteResponse = await request(app).delete(`/api/movies/${movieIdToDelete}`);
    expect(deleteResponse.status).toBe(204);
  });

  it("should respond with status 404 if the movie doesn't exist", async () => {
    // try to delete the movie 0 - we know it doesnt exist

    const response = await request(app).delete(`/api/movies/0`);
    expect(response.status).toBe(404);
  });

  it('should respond with status 500 on server error', async () => {
    const response = await request(app).delete('/api/movies/:id');
    expect(response.status).toBe(500);
  });
});


