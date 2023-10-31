const catchAsyncError = require('../middlewares/catchAsyncError');
const Project = require('../models/projectModel');
const User = require('../models/userModel');
const sendEmail = require('../utils/email');
const ErrorHandler = require('../utils/errorHandler');
const sendToken = require('../utils/jwt');
const crypto = require('crypto')

const colleges = [
    "Nadar Saraswathi college of engineering and technology",
    "Government College of Engineering, Theni",
    "Theni Kammavar Sangam College of Technology",
    "Thiagarajar College of Engineering, Madurai",
    "Madurai Institute of Engineering and Technology",
    "Velammal College of Engineering and Technology, Madurai",
    "Indian Institute of Technology Madras (IIT Madras)",
    "College of Engineering, Guindy (CEG), Anna University, Chennai",
    "Sri Sairam Engineering College, Chennai",
    "SRM Institute of Science and Technology, Chennai",
  ];
  
  const majors = [
    "Civil Engineering",
    "Mechanical Engineering",
    "Electrical Engineering",
    "Computer Science and Engineering",
    "Chemical Engineering",
    "Aerospace Engineering",
    "Biomedical Engineering",
    "Environmental Engineering",
    "Industrial Engineering",
    "Materials Engineering",
    "Petroleum Engineering",
    "Electronics Engineering",
    "Software Engineering",
    "Automotive Engineering",
    "Telecommunication Engineering",
  ];


//Register User - /auth/register
exports.registerUser = catchAsyncError(async (req, res, next) => {

    if (req.method === 'GET') 
    {
        res.status(200).render('register',{colleges,majors});
    }
    if (req.method === 'POST') 
    {
    const { name, email, password, collegeName, major } = req.body
    let profile;
    
    if(req.file){
        profile = `/uploads/user/${req.file.originalname}`
    }
    const user = await User.create({
        name,
        email,
        password,
        collegeName,
        major,
        profile
    });

    res.status(200).render('login');
    }
})

//Login User - /auth/login
exports.loginUser = catchAsyncError(async (req, res, next) => {

    if (req.method === 'GET') 
    {   
        res.status(200).render('login'); 
    }

    if (req.method === 'POST') 
    {
    const {email, password} =  req.body

    if(!email || !password) {
        return next(new ErrorHandler('Please enter email & password', 400))
    }

    //finding the user database
    const user = await User.findOne({email}).select('+password');

    if(!user) {
        return next(new ErrorHandler('Invalid email or password', 401))
    }
    
    if(!await user.isValidPassword(password)){
        return next(new ErrorHandler('Invalid email or password', 401))
    }

    const projects = await Project.find();
    req.user = user;
    const cookie = sendToken(user)
    res.cookie('token', cookie.token, cookie.options).render('home', {user, projects });
    }    
})

//Logout - /auth/logout
exports.logoutUser = (req, res, next) => {
        res.cookie('token', null, {
            expires: new Date(Date.now()),
            httpOnly: true
        })
        .status(200).render("login")
}

//Forgot Password - /auth/password/forgot
exports.forgotPassword = catchAsyncError( async (req, res, next)=>{

    if (req.method === 'GET') 
    {
        res.status(200).render('forgot_password');
    }

    if (req.method === 'POST') 
    {
    const user =  await User.findOne({email: req.body.email});

    if(!user) {
        return next(new ErrorHandler('User not found with this email', 404))
    }

    const resetToken = user.getResetToken();
    await user.save({validateBeforeSave: false})
    
    let BASE_URL = "http://127.0.0.1:8000";
   
    //Create reset url
    const resetUrl = `${BASE_URL}/auth/password/reset/${resetToken}`;

    const message = `Your password reset url is as follows \n\n 
    ${resetUrl} \n\n If you have not requested this email, then ignore it.`;

    try{
        sendEmail({
            email: user.email,
            subject: "Student Project Portal Password Recovery",
            message
        })

        res.status(200).render("welcome")

    }catch(error){
        user.resetPasswordToken = undefined;
        user.resetPasswordTokenExpire = undefined;
        await user.save({validateBeforeSave: false});
        return next(new ErrorHandler(error.message), 500)
    }}
}
)  

//reset password - /auth/password/reset/:token
exports.resetPassword = catchAsyncError( async (req, res, next) => {

    if (req.method === 'GET') 
    {   
        const resetPasswordToken =  crypto.createHash('sha256').update(req.params.token).digest('hex'); 

        const user = await User.findOne( {
        resetPasswordToken,
        resetPasswordTokenExpire: {
            $gt : Date.now()
        }
        } )

        if(!user) 
        {
            return next(new ErrorHandler('Password reset token is invalid or expired'));
        }

    res.status(200).render('reset_password', { 
        token : req.params.token
    }); 
    }
    
    if (req.method === 'POST') 
    {   
        const resetPasswordToken =  crypto.createHash('sha256').update(req.params.token).digest('hex'); 

        const user = await User.findOne( {
        resetPasswordToken,
        resetPasswordTokenExpire: {
            $gt : Date.now()
        }
        } )

        if( req.body.password !== req.body.confirmPassword) {
            return next(new ErrorHandler('Password does not match'));
        }
    
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordTokenExpire = undefined;
        await user.save({validateBeforeSave: false})
        res.status(200).render('login');
    }
   
})


//Get User Profile - /auth/myprofile
exports.getUserProfile = catchAsyncError(async (req, res, next) => {
   const user = await User.findById(req.user.id)
   res.status(200).json({
        success:true,
        user
   })
})

//Change Password  - api/auth/password/change
exports.changePassword  = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');
    //check old password
    if(!await user.isValidPassword(req.body.oldPassword)) {
        return next(new ErrorHandler('Old password is incorrect', 401));
    }

    //assigning new password
    user.password = req.body.password;
    await user.save();
    res.status(200).json({
        success:true,
        reqbody:req.body
    })
 })

//Update Profile - /auth/update
exports.updateProfile = catchAsyncError(async (req, res, next) => {

    if (req.method === 'GET') 
    {   
        const user = await User.findById(req.user.id);
        const dateObject = user.dob;
        const year = dateObject.getFullYear();
        const month = String(dateObject.getMonth() + 1).padStart(2, "0"); // Month is zero-based, so add 1
        const day = String(dateObject.getDate()).padStart(2, "0");
        const formattedDate = `${year}-${month}-${day}`;
        res.status(200).render('update_profile', {user,date:formattedDate});
        }

    if (req.method === 'POST')
    {
    let newUserData = {
        ...req.body
    }
    console.log(newUserData, req.body);
    let profile;

    if(req.file){
        profile = `/uploads/user/${req.file.originalname}`
        newUserData = {...newUserData, profile }
    }

    const projects = await Project.find();
    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
    })

    res.status(200).render("home", {user, projects}) }

})

//Admin: Get All Users - /api/auth/admin/users
exports.getAllUsers = catchAsyncError(async (req, res, next) => {
   const users = await User.find();
   res.status(200).json({
        success: true,
        users
   })
})

//Admin: Get Specific User - api/auth/admin/user/:id
exports.getUser = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if(!user) {
        return next(new ErrorHandler(`User not found with this id ${req.params.id}`))
    }
    res.status(200).json({
        success: true,
        user
   })
});

//Admin: Update User - api/auth/admin/user/:id
exports.updateUser = catchAsyncError(async (req, res, next) => {
    const newUserData = {
        ...req.body
    }

    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true,
    })

    res.status(200).json({
        success: true,
        user
    })
})


//Admin: Delete User - api/auth/admin/user/:id
exports.deleteUser = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if(!user) {
        return next(new ErrorHandler(`User not found with this id ${req.params.id}`))
    }
    await User.deleteOne({ _id: req.params.id });
    res.status(200).json({
        success: true,
    })
})
