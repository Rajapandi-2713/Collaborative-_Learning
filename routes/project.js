const express = require('express');
const { getProjects, newProject, updateProject, deleteProject, createComment,deleteComment,updateComment, welcome, myProjects,getSingleProject } = require('../controllers/projectController');
const router = express.Router();
const {isAuthenticatedUser} = require('../middlewares/authenticate');
const multer = require('multer');
const path = require('path')

const storage = multer.diskStorage({
    destination: function (req, file, cb)
    {
      let destination;
      if (file.fieldname === 'projectDocumentation') 
      {
        destination = path.join( __dirname,'..' , 'public/uploads/projects/documentation' );
      } else if (file.fieldname === 'projectImage') 
      {
        destination = path.join( __dirname,'..' , 'public/uploads/projects/image' );
      } else if (file.fieldname === 'projectFiles') 
      {
        destination = path.join( __dirname,'..' , 'public/uploads/projects/file' );
      } 
      cb(null, destination);
    },

    filename:  function (req, file, cb){
      cb(null, file.originalname);
    }
  });
  
const upload = multer({ storage: storage });

router.route('').get(welcome);
router.route('/projects').get(getProjects);


router.route('/project/get/:id').get(getSingleProject); 

router.route('/myprojects/:id').get(myProjects);

router.route('/project/new')
.get(isAuthenticatedUser, newProject)
.post(isAuthenticatedUser, 
    upload.fields([
    { name: 'projectDocumentation', maxCount: 1 },
    { name: 'projectImage', maxCount: 1 },
    { name: 'projectFiles', maxCount: 1 },
    ]), newProject);

router.route('/project/delete/:id').get(isAuthenticatedUser, deleteProject);

router.route('/project/update/:id')
.get(isAuthenticatedUser, updateProject)
.post(isAuthenticatedUser,
    upload.fields([
    { name: 'projectDocumentation', maxCount: 1 },
    { name: 'projectImage', maxCount: 1 },
    { name: 'projectFiles', maxCount: 1 },
    ]), updateProject);

router.route('/project/newcomment/:id').post(isAuthenticatedUser, createComment);
router.route('/project/comment/:id').delete(isAuthenticatedUser, deleteComment);
router.route('/project/comment/:id').put(isAuthenticatedUser, updateComment);
    

module.exports = router;