var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");

var axios = require("axios");
var cheerio = require("cheerio");

// var db = require('./models')

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

      $(".review-collection-fragment").each(function(i, element) {
        // Save an empty result object
        var result = {
            link: "https://pitchfork.com/" + $(this).children(".fragment-list").children(".review").children("a").attr("href"),
            image: $(this).children(".fragment-list").children(".review").children("a").children("review__artwork artwork").children("img").attr("src"),
            artist: $(this).children(".fragment-list").children(".review").children("a").children("review__title").children("ul").children("li").text(),
            album: $(this).children(".fragment-list").children(".review").children("a").children("review__title").children("h2").text(),
            genre: $(this).children(".fragment-list").children(".review").children("a").children("review__meta").children("h2").text(),
            reviewer: ,
            date:
        };
  
        // Add the text and href of every link, and save them as properties of the result object
        result.title = $(this)
          .children("a")
          .text();
        result.link = $(this)
          .children("a")
          .attr("href");

  
        // Create a new Article using the `result` object built from scraping
    //     db.Article.create(result)
    //       .then(function(dbArticle) {
    //         // View the added result in the console
    //         console.log(dbArticle);
    //       })
    //       .catch(function(err) {
    //         // If an error occurred, log it
    //         console.log(err);
    //       });
      });
  
      // Send a message to the client
      reply.send(result);
    });
  });

  app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
  });