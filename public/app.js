var BRNewsApp = {
  // Attributes
  articles: [],
  currArticle: 0,

  // Methods
  start: function() {
    // grab the articles as a json
    // display the first article
    var self = this;
    $.getJSON('/articles', function(data) {

      self.articles = data;
      // for each one
        /* This code pushes all the articles to the page
         * We only want to show one article.  Before we do that, save
         * all the articles for displaying as the user clicks through them.

        // display the apropos information on the page
      for (var i = 0; i<data.length; i++){
        $('#articles').append(
            '<p data-id="' + data[i]._id + '">'+ 
            data[i].sportName + '<br />'+ 
            data[i].sportLink + '<br />'+
            data[i].articleHeadline + '<br />' +
            data[i].articleLink + '</p>');
        */
        self.displayArticle();
      });
  },

  displayArticle: function() {
    // Display the current Article
    var heading = "<h3>" + this.articles[this.currArticle].sportName + "<h3>";

    $('#article').html(heading);
  },

  nextArticle: function() {
    // Display the next article.  If there are no
    // more articles, start at the beginning
    this.currArticle = this.currArticle == this.articles.length ?
      0 : this.currArticle + 1;

    this.displayArticle();
  }
}


// whenever someone clicks a p tag
$(document).on('click', 'p', function(){
  // empty the notes from the note section
  $('#notes').empty();
  // save the id from the p tag
  var thisId = $(this).attr('data-id');

  // now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId,
  })
    // with that done, add the note information to the page
    .done(function( data ) {
      console.log(data);
      // the title of the article
      $('#notes').append('<h2>' + data.title + '</h2>'); 
      // an input to enter a new title
      $('#notes').append('<input id="titleinput" name="title" >'); 
      // a textarea to add a new note body
      $('#notes').append('<textarea id="bodyinput" name="body"></textarea>'); 
      // a button to submit a new note, with the id of the article saved to it
      $('#notes').append('<button data-id="' + data._id + '" id="savenote">Save Note</button>');

      // if there's a note in the article
      if(data.note){
        // place the title of the note in the title input
        $('#titleinput').val(data.note.title);
        // place the body of the note in the body textarea
        $('#bodyinput').val(data.note.body);
      }
    });
});

// when you click the savenote button
$(document).on('click', '#savenote', function(){
  // grab the id associated with the article from the submit button
  var thisId = $(this).attr('data-id');

  // run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      title: $('#titleinput').val(), // value taken from title input
      body: $('#bodyinput').val() // value taken from note textarea
    }
  })
    // with that done
    .done(function( data ) {
      // log the response
      console.log(data);
      // empty the notes section
      $('#notes').empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $('#titleinput').val("");
  $('#bodyinput').val("");
});

// when you click the savenote button
$(document).on('click', '#startnews', function(){
  BRNewsApp.start();
});

$(document).on('click', '#article', function(){
  BRNewsApp.nextArticle();
})
