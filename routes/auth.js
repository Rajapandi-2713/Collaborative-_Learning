const express = require('express');
const path = require('path')
const router = express.Router();
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/authenticate')

const multer = require('multer');
const upload = multer({storage: multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join( __dirname,'..' , 'public/uploads/user' ))
    },
    filename: function(req, file, cb ) {
        cb(null, file.originalname)
    }
}) }) 


const { 
    registerUser,
    loginUser,
    logoutUser,
    forgotPassword,
    resetPassword,
    getUserProfile,
    changePassword,
    updateProfile,
    getAllUsers,
    getUser,
    updateUser,
    deleteUser,
 } = require('../controllers/authController');


router.route('/register')
    .get(registerUser)
    .post(upload.single('profile'), registerUser);
router.route('/login')
    .get(loginUser)
    .post(loginUser);
router.route('/logout').get(logoutUser);
router.route('/password/forgot')
    .get(forgotPassword)
    .post(forgotPassword);
router.route('/password/reset/:token')
    .get(resetPassword)
    .post(resetPassword)

router.route('/password/change').put(isAuthenticatedUser, changePassword);
router.route('/myprofile').get(isAuthenticatedUser, getUserProfile);
router.route('/update')
.post(isAuthenticatedUser, upload.single('profile'), updateProfile)
.get(isAuthenticatedUser, updateProfile);


//Admin routes
router.route('/admin/users').get(isAuthenticatedUser,authorizeRoles('admin'), getAllUsers);
router.route('/admin/user/:id').get(isAuthenticatedUser,authorizeRoles('admin'), getUser)
                                .put(isAuthenticatedUser,authorizeRoles('admin'), updateUser)
                                .delete(isAuthenticatedUser,authorizeRoles('admin'), deleteUser);


module.exports = router;