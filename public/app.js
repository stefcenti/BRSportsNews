var BRNewsApp = {
  // Attributes
  baseUrl: 'http://highschoolsports.nj.com',
  brUrl: "http://highschoolsports.nj.com/school/bridgewater-bridgewater-raritan/",
  articles: [],
  currArticle: 0,
  noteCount: 0,

  // Selector Attributes
  $notes: $('#notes'),

  // Methods
  start: function() {
    var self = this;

    // scrape the data from the website and load into the mongo DB
    // self.scrape();
    $.getJSON('/scrape', function(response) {
    }).done(function(response) {

      // grab the articles as a json
      $.getJSON('/articles', function(articles) {
      }).done(function(articles) {

        // save the articles for later
        // display the first article
        self.articles = articles;
        self.displayArticle();

      }).fail(function(articles){
        console.log("failed to retrieve articles");
      });

    }).fail(function(data){
      console.log("failed to scrape data");
    });

  },

  displayArticle: function() {
    // Display the current Article
    if (!this.articles) {console.log("No Articles Yet")}
    var article = this.articles[this.currArticle];

    // 
    // Creat a heading with a link to the sports category.  The link will open in a separate window
    var sportRef = "<a href='" + this.baseUrl + article.sportLink + "'>" + article.sportName + "</a>";
    var articleRef = "<a href='" + this.baseUrl + article.articleLink + "'>" + article.articleHeadline + "</a>";
    var articleDiv = "<div>" + sportRef + "<br>" + articleRef + "</div>";
    $('#article').html(articleDiv);

    // Now get the notes associated with this article
    this.getNotes(article._id);
  },

  nextArticle: function() {
    // Display the next article.  If there are no
    // more articles, start at the beginning.
    this.currArticle = this.currArticle == (this.articles.length - 1) ?
      0 : this.currArticle + 1;

    this.displayArticle();
  },

  // Retrieve the notes for this article and display them in the notes area.
  // Save the Article Id with the Save and Delete buttons to be accessed later.
  getNotes: function(thisId) {
    var self = this;
    // empty the notes from the note section
    $('#notes').empty();

    // reset current note
    self.noteCount = 0;

    // now make an ajax call for the Article
    $.getJSON('/articles/' + thisId, function(){
    })
    // with that done, add the notes to the page
    .done(function( data ) {
      console.log(data);

      // We need to save the article id so it can be accessed later
      // Save it as an attribute of the save-note button
      $('#save-note').attr({'data-id' : data._id});
      // Add a textarea to add a new note body
      //$('#add-note').append('<textarea id="bodyinput" name="body"></textarea>'); 

      // If there's at least one note already associated with the article,
      // place the data in the notes viewing area
      // TODO: change to use handlebars
      if(data.notes){
        var notes = data.notes
        // Append the notes into the notes area
        for(var i=0; i<notes.length; i++) {
          self.displayNote(notes[i]);
        }

        // Place the body of the note in the notes textarea
        //$('#notes').append(text);

        // Save the id of the article associated with this note in the delete button
        $('#delete-note').attr({'data-id': data._id});
      }
    })
    // check for error
    .fail(function(data) {
      console.log("failed to get notes for article: " + thisId);
    });
  },

  displayNote: function(note){
    var rawDate = note.date;
    var correctDate = moment(rawDate).format('lll');

    this.$notes.append(correctDate + "<br>");

    this.$notes.append( ++this.noteCount + ": " + note.body + "<br>=========<br>" );

  },

  saveNote: function(thisId){
    var self = this;
    var noteData = $('#add-note').val()
    // Run a POST request to add the note, using what's entered
    // in the inputs
//    $.post('/articles/' + thisId, function(){
    $.ajax({
      method: "POST",
      url: "/articles/" + thisId,
      data: {
        article: thisId, // associate this note with it's article
        body: noteData // value taken from note textarea
      }
    })
    // with that done
    .done(function( data ) {
      // log the response
      console.log(data);
      // Move this note from the input to the viewing area.
      // Just use the value entered and the current date/time
      // to save an extra query to the db.
      self.displayNote({date: $.now(), body: noteData});
      $('#add-note').val("");
    });
  },

  deleteNote: function(note){ 
    var self = this;
    console.log(thisId);
    // make an AJAX GET request to delete the specific note 
    // this uses the data-id of the p-tag, which is linked to the specific note
    $.ajax({
      type: "POST",
      url: '/delete/' + thisId
    })
    // Code to run if the request succeeds (is done);
    // The response is passed to the function
    .done(function( data ) {
       thisId.remove();
       self.noteCount--;
    })//,
    .fail(function( xhr, status, errorThrown ) {
      alert( "Failed to delete note:\n" + note);
      console.log( "Error: " + errorThrown );
      console.log( "Status: " + status );
      console.dir( xhr );
    })
    // Also, remove the values entered in the input and textarea for note entry
     $('#titleinput').val("");
     $('#bodyinput').val("");
  }
} // End of BRNewsApp

// Make sure the Document is ready and loaded.
// Execute the appropriate method based on events received
$(document).on('ready', function (){
  // when you click the start button
  $(document).on('click', '#start-news', function(){
    BRNewsApp.start();
  });

  // when you click on the article
  $(document).on('click', '#article', function(){
    BRNewsApp.nextArticle();
  });

/*
  // when you click in the comment area, add an input area
  // and stuff the article id into the save button to be
  // retrieved later when clicked by the user.
  $(document).on('click', '#add-note', function(){
    BRNewsApp.getNotes();
  });
*/

  // when you click the savenote button
  $(document).on('click', '#save-note', function(){
    // grab the id associated with the article from the submit button
    var thisId = $(this).attr('data-id');

    BRNewsApp.saveNote(thisId);
  });

  $(document).on('click', '#delete-note', function(){
    // save the p tag that encloses the button
    var note = $(this).attr('data-id');

    BRNewsApp.deleteNote(note);
  });
});

