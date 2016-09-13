// require mongoose
var mongoose = require('mongoose');
// create Schema class
var Schema = mongoose.Schema;

// Create article schema
var ArticleSchema = new Schema({
  // sport name is required
  sportName: {
    type:String,
    required:true
  },
  // sportLink is required
  sportLink: {
    type:String,
    required:true
  },
  // articleHeadline is required
  articleHeadline: {
    type:String,
    required:true
  },
  // articleLink is required
  articleLink: {
    type:String,
    required:true
  },
  // use an array to hold multiple notes for each article
  notes: [{
      type: Schema.Types.ObjectId,
      ref: 'Note'
  }]
});

// Create the Article model with the ArticleSchema
var Article = mongoose.model('Article', ArticleSchema);

// export the model
module.exports = Article;