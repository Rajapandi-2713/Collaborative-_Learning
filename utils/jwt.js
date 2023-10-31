const sendToken = (user) => {

    //Creating JWT Token
    const token = user.getJwtToken();

    //setting cookies 
    const options = {
        expires: new Date(
                Date.now() + process.env.COOKIE_EXPIRES_TIME  * 24 * 60 * 60 * 1000 
            ),
        httpOnly: true,
    }

    return {token, options}
}

module.exports = sendToken;