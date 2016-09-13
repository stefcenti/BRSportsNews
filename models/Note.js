// require mongoose
var mongoose = require('mongoose');
// create a schema class
var Schema = mongoose.Schema;

// create the Note schema
var NoteSchema = new Schema({
	// Keep a reference to the article this Note belongs to.
	article: {
		type: Schema.Types.ObjectId,
		ref: 'Article'
	},

	// We only need to keep the text of the notes associated with
	// each article.  Since the the date/time created will 
	// automatically be added by mongodb it is not needed as an 
	// additional attribute
	body: {
		type:String
	}
});

// Remember, Mongoose will automatically save the ObjectIds of the notes.
// These ids are referred to in the Article model.

// create the Note model with the NoteSchema
var Note = mongoose.model('Note', NoteSchema);

// export the Note model
module.exports = Note;