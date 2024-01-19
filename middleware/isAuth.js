const isAuth = (req, res, next)=>{
    if(req.session.isAuth){
        next()
    }
    else {
        return res.redirect("/login")
        return res.send({
            status: 401,
            message : "session expired"
        })
    }
}

module.exports = isAuth