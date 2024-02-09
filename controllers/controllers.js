const axios = require('axios');

exports.getLoginRoute = (req, res) => {
    res.render('login', {error: null});
};

exports.postLoginRoute = (req, res) => {
    console.log('postLoginRoute function called');
    const {username, password} = req.body;
    req.session.username = username;
    const apiUrl = `http://localhost:3002/emotion/login`;

    axios.post(apiUrl, {username, password})
        .then(response => {
            const responseData = response.data;
            console.log(responseData);
            if(responseData.status === 'success'){
                const session = req.session;
                session.isLoggedIn = true;
                console.log(session);
                res.render('view', {error: null});

            } else if(responseData.message === 'User not found'){
                res.render('login', {error: "User not found"});
            }else{
                res.render('login', {error:"Incorrect Password"});
            }
        })
        .catch(error =>{
            if (error.response.status === 401) {
                res.render('login', {error: 'Incorrect username or password'});
            } else if (error.response && error.response.status === 404) {
                // Handle 404 error (User not found) gracefully
                console.log('User not found. Please check your credentials.');
            } else {
                console.error('Error during login request:', error);
                res.render('login', {error: 'An error occurred during login'});
            }
        });
}

exports.getDefaultRoute = (req, res) =>{
    res.render('login', {error:null});
};

exports.getLogEmotionRoute = (req, res) => {
    const username = req.session.username;
    const apiUrl = `http://localhost:3002/emotion/username/${username}`;
    axios.post(apiUrl)
        .then(response => {
            const userData = response.data;
            const user_id = userData.result[0].user_id;
            req.session.user_id = user_id;
            console.log(response.data);
            res.render('logEmotion', { user_id});
            console.log(`${user_id} retrieved for ${username}`);
        })
        .catch(error =>{
            console.error('Error during  request:', error);
            res.render('view', {error: 'An error occurred'});
        });
    
}

exports.postEmotionRoute = (req, res) => {
    const apiUrl = `http://localhost:3002/emotion/add/emotion`;
    const { enjoyment, sadness, anger, contempt, disgust, fear, surprise, triggers} = req.body;
    const user_id = req.session.user_id;
    axios.post(apiUrl, {user_id, enjoyment, sadness, anger, contempt, disgust, fear, surprise, triggers})
        .then(response => {
            res.render('view')
        })
        .catch(error => {
            console.error('Error during request', error);
            res.render('view', {error: 'An error occured'});
        })
}