exports.getLoginRoute = (req, res) => {
    res.render('login', {error: null});
};

exports.getDefaultRoute = (req, res) =>{
    res.render('login', {error:null});
};