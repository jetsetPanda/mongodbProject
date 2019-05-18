const express = require("express");
// const router = express.Router();
const db = require("../models");
// const request = require("request"); //Makes http calls
const cheerio = require("cheerio");
const axios = require("axios");
const app = express();

// Routes

// fx: GET route for scraping the target website (gsmarena.com)
app.get("/scrape", (req, res) => {
    // First, we grab the body of the html with axios
    axios.get("https://www.gsmarena.com/news.php3").then(function(response) {
        // Then, we load that into cheerio and save it to $ for a shorthand selector
        var $ = cheerio.load(response.data);

        // Now, we grab every h2 within an article tag, and do the following:
        $(".news-item").each(function(i, element) {
            // Save an empty result object
            var result = {};

            // Add the text and href of every link, and save them as properties of the result object
            result.title = $(this)
                .children('a')
                .children('h3')
                .text().trim();
            result.link = $(this)
                .children('a')
                .attr("href");
            result.summary = $(this)
                .children('p')
                .text().trim();
            result.image = $(this)
                .children('.news-item-media-wrap')
                .children('a')
                .children('img')
                .attr("src");

            // Create a new Article using the `result` object built from scraping
            db.Article.create(result)
                .then(function(dbArticle) {
                    // View the added result in the console
                    console.log(dbArticle);
                })
                .catch(function(err) {
                    // If an error occurred, log it
                    console.log(err);
                });
        });

        // Send a message to the client
        res.send("Scrape Complete");
        res.redirect('/');
    });
});

app.get("/", (req, res) => {

    db.Article.find({})
        .then(function(dbArticle) {
            // If we were able to successfully find Articles, send them back to the client
            // const retrievedArticles = dbArticle;
            // let articleObj;
            // articleObj = {
            //     articles: dbArticle
            // };
            res.render("index", { things: dbArticle });
        })
        .catch(function(err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});



// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
    // TODO: Finish the route so it grabs all of the articles
    db.Article.find({})
        .then(function(dbLibrary) {
            res.json(dbLibrary);
        })
        .catch(function(err) {
            res.json(err);
        });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
    var getid = req.params.id
    console.log("GET FUNCTION ID IS: " + getid)
        // TODO
        // ====
        // Finish the route so it finds one article using the req.params.id,
        // and run the populate method with "note",
        // then responds with the article with the note included
        // db.Article.find({this.})
    db.Article.find({ _id: getid })
        .then(function(dbLibrary) {
            res.json(dbLibrary);
        })
        .catch(function(err) {
            res.json(err);
        });
});

app.get("/listnotes", function(req, res) {
    db.Note.find({})
        .then(function(dbLibrary) {
            res.json(dbLibrary);
        })
        .catch(function(err) {
            res.json(err);
        });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
    // TODO
    // ====
    // save the new note that gets posted to the Notes collection
    // then find an article from the req.params.id
    // and update it's "note" property with the _id of the new note
    let localID = req.params.id;
    // let testTitle = req.params.notetitle;
    // console.log("Title is: " + testTitle);

    db.Note.create(req.body)
        .then(function() {
            return db.Article.findOneAndUpdate({ _id: localID }, { $push: { note: localID } })
        });
});

module.exports = app;