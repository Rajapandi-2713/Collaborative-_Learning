const mongoose = require('mongoose');

// Define the Project schema
const projectSchema = new mongoose.Schema({
  
  title: {
    type: String,
    required: [true, 'Please enter your project title']
  },

  user: {
    type : mongoose.Schema.Types.ObjectId
  },

  description: {
    type: String,
    required: [true, 'Please enter your project description']
  },

  category: {
    type: String,
    required: [true, 'Please enter your category of your project']
  },

  technologyUsed: {
    type: [String],
    required: [true, 'Please select the technology used'],
    validate: {
      validator: (array) => array.length > 0,
      message: 'At least one technology must be used.',
    },
  },

  projectFiles: {
    type: String,
    required: [true, 'Please select your project file']
  },

  comments: [
    {
      user:{
                type:mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
      time: 
      { 
        type : Date,
        default: Date.now
      }
      ,
      comment: {
        type: String,
        required: true
    }
    }
  ],

  likes: {
    type: Number,
    default: 0,
  },

  projectDocumentation: String,
  projectURL: String,
  projectImage: String,
  collegeName: String,
  
});

// Create the Project model
const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
