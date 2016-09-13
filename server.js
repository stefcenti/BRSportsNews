/* Showing Mongoose's "Populated" Method (18.3.8)
 * INSTRUCTOR ONLY
 * =============================================== */

// dependencies
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
// Notice: Our scraping tools are prepared, too
var request = require('request'); 
var cheerio = require('cheerio');

// use morgan and bodyparser with our app
app.use(logger('dev'));
app.use(bodyParser.urlencoded({
  extended: false
}));

// make public a static dir
app.use(express.static('public'));


// Database configuration with mongoose
var connection = process.env.MONGODB_URI || 'mongodb://localhost/brrhsSportsNewsDB';
mongoose.connect(connection);
//mongoose.connect('mongodb://localhost/brrhsSportsNewsDB');
var db = mongoose.connection;

// show any mongoose errors
db.on('error', function(err) {
  console.log('Mongoose Error: ', err);
});

// once logged in to the db through mongoose, log a success message
db.once('open', function() {
  console.log('Mongoose connection successful.');
});


// And we bring in our Note and Article models
var Note = require('./models/Note.js');
var Article = require('./models/Article.js');


// Routes
// ======

// Simple index route
app.get('/', function(req, res) {
  res.send(index.html);
});

// A GET request to scrape the nj.com website.
app.get('/scrape', function(req, res) {

	// Use an array to hold the Article ID and URL to be used later
	// for scraping the text.  The ID will be used to update the Article
	// with the text retrieved.
	var articleUrls = [];

	// first, we grab the body of the html with request
  	request('http://highschoolsports.nj.com/school/bridgewater-bridgewater-raritan/', function(error, response, html) {
  	// then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);
    // use the blognames for the headings
    // save them in the results array

	$('.item-text').each(function(i, element){
		// we also want to show the headline of the article
		// save it with the associated the sport
		var article = {};

		var result = $(this).children('.blogname');
		article.sportName = result.eq(0).text();
		article.sportLink = result.children('a').attr('href');

		result = $(this).children('.hssn-fullheadline');
		article.articleHeadline = result.eq(0).text();
		article.articleLink = result.children('a').attr('href');

		console.log("==========\n" + 
			article.sportName + 
			article.sportLink + 
			article.articleHeadline + 
			article.articleLink + 
			"\n==========");

		// using our Article model, create a new entry.
		// Notice the (result):
		// This effectively passes the result object to the entry (and the title and link)
		var entry = new Article (article);

		// Make sure the article does not already exist
		Article.count({'articleHeadline': entry.articleHeadline}, function (err, count){
			if (count > 0){
				// Article exists, skip it and get the next one
				return;
			}

			// now, save that entry to the db
			entry.save({w:"majority"}, function(err, doc) {
				// log any errors
			  if (err) {
			    console.log(err);
			  } 
			  // or log the doc
			  else {
			  	articleUrls.push({id: doc._id, url: doc.articleLink, text1: "", text2: ""})
			    console.log(doc);
			  }
			});
		});
    });
		// tell the browser that we finished scraping the text.
	    res.json("Scrape Complete");
	}); // end of request
});

/*
function scrapeText(articles){
console.log("1")
	for (article in articles) {
console.log("2")
    	request(article.url, ( function(article) {
console.log("3")

	        return function(err, resp, html) {
console.log("4")
	            if (err) throw err;
console.log("5")

	            $ = cheerio.load(html);
console.log("6")

	            console.log("****\n"+article+"\n****");
console.log("7")

	            $('#article_container.entry-content p').each(function(i, element){
console.log("8")
	            	// Get the first 2 paragraphs of text. Note that there are almost
	            	// always 2 or less on this site.
	            	if (i===0)
	            		article.text1 = element.text;
	            	else if (i===1)
	            		article.text2 = element.text;
	            })
console.log("9")
	        }
console.log("10")
	    } )(article));
console.log("11")
    }
    // Now that all the text has been scraped, update our database
console.log("12")

}
*/

// this will get the articles we scraped from the mongoDB
app.get('/articles', function(req, res){
	// grab every doc in the Articles array
	Article.find({}, function(err, doc){
		// log any errors
		if (err){
			console.log(err);
		} 
		// or send the doc to the browser as a json object
		else {
			res.json(doc);
		}
	});
});

// grab an article by it's ObjectId
app.get('/articles/:id', function(req, res){
	// using the id passed in the id parameter, 
	// prepare a query that finds the matching one in our db...
	Article.findOne({'_id': req.params.id})
	// and populate all of the notes associated with it.
	.populate('notes')
	// now, execute our query
	.exec(function(err, doc){
		// log any errors
		if (err){
			console.log(err);
		} 
		// otherwise, send the doc to the browser as a json object
		else {
			res.json(doc);
		}
	});
});


// replace the existing note of an article with a new one
// or if no note exists for an article, make the posted note it's note.
app.post('/articles/:id', function(req, res){
	// create a new note and pass the req.body to the entry.
	console.log("newNote(req.body), req= " + req);
	var newNote = new Note(req.body);

	// and save the new note the db
	newNote.save(function(err, doc){
		// log any errors
		if(err){
			console.log(err);
		} 
		// otherwise
		else {
			// using the Article id passed in the id parameter of our url, 
			// prepare a query that finds the matching Article in our db
			// and update it to make it's lone note the one we just saved
			Article.findOneAndUpdate({'_id': req.params.id}, {'notes':doc._id})
			// execute the above query
			.exec(function(err, doc){
				// log any errors
				if (err){
					console.log(err);
				} else {
					// or send the document to the browser
					res.send(doc);
				}
			});
		}
	});
});


// listen on port 3000
app.listen(process.env.PORT || 3000, function() {
 console.log('App running on port 3000!');
});