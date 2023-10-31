const Project = require('../models/projectModel');
const ErrorHandler = require('../utils/errorHandler')
const catchAsyncError = require('../middlewares/catchAsyncError')
const APIFeatures = require('../utils/apiFeatures');
const User = require('../models/userModel');
const mongoose = require('mongoose');

const technology = [
    "HTML",
    "CSS",
    "JavaScript",
    "React",
    "Angular",
    "Vue.js",
    "Node.js",
    "Express.js",
    "MongoDB",
    "SQL",
    "Python",
    "Ruby",
    "PHP",
    "Java",
    "C#",
    "Bootstrap",
    "Sass",
    "TypeScript",
    "Redux",
    "GraphQL",
    "Webpack",
    "Git",
    "RESTful APIs",
    "JSON",
    "AJAX",
    "Docker",
    "AWS",
    "Firebase",
    "Heroku",
  ];


function addArraysWithoutDuplicates(arr1, arr2) {
    // Concatenate the two arrays
    const combinedArray = arr1.concat(arr2);
  
    // Create a new array to store unique values
    const uniqueArray = [];
  
    // Iterate through the combined array
    for (let i = 0; i < combinedArray.length; i++) {
      // Check if the element is not already in the uniqueArray
      if (!uniqueArray.includes(combinedArray[i])) {
        // Add the element to the uniqueArray
        uniqueArray.push(combinedArray[i]);
      }
    }
  
    return uniqueArray;
  }
  
  
// welcome page - /
exports.welcome = catchAsyncError(async (req, res, next) => {
    res.status(200).render('welcome'); }
);

exports.home = catchAsyncError(async (req, res, next) => {
    res.status(200).render('home'); }
);

//Get Projects - /projects
exports.getProjects = catchAsyncError(async (req, res, next)=>{
    const resPerPage = 4;
    
    let buildQuery = () => {
        return new APIFeatures(Project.find(), req.query).search().filter()
    }

    const projects = await buildQuery().paginate(resPerPage).query;

    res.status(200).json({
        success : true,
        projects
    })
})

//get my projects - /myprojects/:id
exports.myProjects = catchAsyncError(async (req, res, next)=>{
    const user = await User.findById(req.params.id).populate('projects');
    res.status(200).render('myprojects',{user:user, projects:user.projects});
});


//Create Project - /project/new
exports.newProject = catchAsyncError(async (req, res, next)=>{
    if (req.method === 'GET') 
    {   
        res.status(200).render('upload_project',{technology});
    }
    else
    {
    if('projectImage' in req.files){
    let url = `/uploads/projects/image/${req.files['projectImage'][0].filename}`;
    req.body.projectImage = url;
    }
    else
    {
        let url = `/uploads/projects/image/default.jpg`;
        req.body.projectImage = url;  
    }

    if('projectDocumentation' in req.files)
    {
        let url = `/uploads/projects/documentation/${req.files['projectDocumentation'][0].filename}`;
        req.body.projectDocumentation = url;
    }

    if('projectFiles' in req.files)
    {
        let url = `/uploads/projects/file/${req.files['projectFiles'][0].filename}`;
        req.body.projectFiles = url;
    }

    req.body.user = req.user.id;
    req.body.collegeName = req.user.collegeName;
    const newArray = req.body.technologyUsed.slice(1);
    req.body.technologyUsed = newArray;
    const project = await Project.create(req.body);
    
    let projects = req.user.projects;
    projects.push(project.id);

    const allprojects = await Project.find();
    const user = await User.findByIdAndUpdate(req.user.id, {projects:projects} , {
        new: true,
        runValidators: true,
    })
    res.status(201).render('home', {user, projects:allprojects })
    }
});

// Get Single Project - /project/get/:id
exports.getSingleProject = catchAsyncError(async(req, res, next) => {
    const project = await Project.findById(req.params.id).populate('user');
    if(!project) {
        return next(new ErrorHandler('Project not found', 400));
    }
    const user = await User.findById(project.user);
    res.status(201).render('project_details',{project, user});
});


//Update Project - /project/update/:id
exports.updateProject = catchAsyncError(async (req, res, next) => {
    if (req.method === 'GET') 
    {   
        const project = await Project.findById(req.params.id);
        res.status(200).render('edit_project',{technology, id:req.params.id,project});
    }

    else{
    let project = await Project.findById(req.params.id);
    if('projectImage' in req.files)
    {
        let url = `/uploads/projects/image/${req.files['projectImage'][0].filename}`;
        req.body.projectImage = url;
    }
    else
    {
        let url = `/uploads/projects/image/default.jpg`;
        req.body.projectImage = url;  
    }
    
    if('projectDocumentation' in req.files)
    {
        let url = `/uploads/projects/documentation/${req.files['projectDocumentation'][0].filename}`;
        req.body.projectDocumentation = url;
    }
    
    if('projectFiles' in req.files)
    {
        let url = `/uploads/projects/file/${req.files['projectFiles'][0].filename}`;
        req.body.projectFiles = url;
    }
    
    if(!project) {
        return res.status(404).json({
            success: false,
            message: "Project not found"
        });
    }
    const newArray = req.body.technologyUsed.slice(1);
    req.body.technologyUsed = addArraysWithoutDuplicates(newArray, project.technologyUsed);

    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })

    const user = await User.findById(project.user).populate('projects');
    res.status(200).render('myprojects', {user:user, projects:user.projects});
    }

});

//Delete Project - /project/:id
exports.deleteProject = catchAsyncError(async (req, res, next) =>{
    const project = await Project.findById(req.params.id);
    const userid = project.user
    if(!project ) {
        return res.status(404).json({
            success: false,
            message: "Project not found"
        });
    }

    await Project.deleteOne({ _id: req.params.id });

    const id = new mongoose.Types.ObjectId(req.params.id);

    let array = req.user.projects.filter(item => item.toString() !== id.toString());

    await User.findByIdAndUpdate(req.user.id , { projects:array });
     
    const user = await User.findById(userid);
    const projects = await Project.find();
    
    res.status(200).render('home',{user,projects})
})

//Create Comment - project/newcomment/:id
exports.createComment = catchAsyncError(async (req, res, next) =>{
    const  { comment } = req.body;

    const data = {
        user : req.user.id,
        comment
    }

    const project = await Project.findById(req.params.id);
   
    //creating the comment
    project.comments.push(data);

    await project.save({validateBeforeSave: false});

    res.status(200).json({
        success: true
    })


})

//update comment - project/comment/:id ?commentId={commentid}
exports.updateComment = catchAsyncError(async (req, res, next) =>{
    const project = await Project.findById(req.params.id);
    
    let comments = project.comments;
    comments.forEach(comment =>{
        if(comment._id.toString() === req.query.commentId.toString())
        {
            comment.comment = req.body.comment;
        }
    })

    //save the document
    await Project.findByIdAndUpdate(req.params.id, {
        comments
    })
    res.status(200).json({
        success: true
    })

});


//Delete comment - project/comment/:id ?commentId={commentid}

exports.deleteComment = catchAsyncError(async (req, res, next) =>{
    const project = await Project.findById(req.params.id);
    
    //filtering the comments which does match the deleting comment id
    const comments = project.comments.filter(comment => {
       return comment._id.toString() !== req.query.commentId.toString()
    });

    //save the document
    await Project.findByIdAndUpdate(req.params.id, {
        comments
    })
    res.status(200).json({
        success: true
    })

});