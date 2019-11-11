var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");

var axios = require("axios");
var cheerio = require("cheerio");

var db = require("./models")

var PORT = 3000;

var app = express();

app.use(logger("dev"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI);

app.get("/scrape", function(request, reply) {

    axios.get("https://pitchfork.com/reviews/best/albums/").then(function(response) {
     
      var $ = cheerio.load(response.data);

      $(".reviews-page__contents").each(function(i, element) {
        // Save an empty result object
        var result = {}
  
        // Add the text and href of every link, and save them as properties of the result object
        result.artist = $(this)
        .find(".review__title-artist")
        .children("li")
        .text();

        result.album = $(this)
        .find(".review__title-album")
        .text();

        result.genre = $(this)
        .find(".genre-list__link")
        .text();

        result.image = $(this)
        .find(".review__artwork")
        .find("img")
        .attr("src");

        result.link = "https://pitchfork.com/" + $(this)
        .find(".review")
        .children("a")
        .attr("href");

        result.author = $(this)
        .find(".authors")
        .find(".display-name")
        .text();

        result.date = $(this)
        .find(".pub-date")
        .text();

        db.Review.create(result)
          .then(function(dbReview) {
            // View the added result in the console
            console.log(dbReview);
          })
          .catch(function(err) {
            // If an error occurred, log it
            console.log(err);
          });
      });
  
      // Send a message to the client
      reply.json(result);
    });
  });

  app.get("/reviews", function(request, reply) {
    // TODO: Finish the route so it grabs all of the articles
    db.Review.find({})
    .then(function(dbReview){
      reply.json(dbReview)
    })
    .catch(function(error){
      reply.json(error);
    })
  });

  app.get("/articles/:id", function(request, reply) {

    db.Review.find({$set: {_id: request.params.id}})
    .populate("note")
    .then(function(dbReview){
      reply.json(dbReview)
    })
    .catch(function(error){
      reply.json(error);
    })
  });

  app.post("/articles/:id", function(request, reply) {

    db.Note.create(request.body)
    .then(function(dbNote){
      return db.Article.findOneAndUpdate({_id: request.params.id}, {$push: {notes: dbNote._id}});
    })
  });

  app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
  });