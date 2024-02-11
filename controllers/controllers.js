const axios = require('axios');

exports.getLoginRoute = (req, res) => {
    res.render('login', {error: null});
};

exports.postLoginRoute = (req, res) => {
    console.log('postLoginRoute function called');
    const { username, password } = req.body;
    const apiUrl = `http://localhost:3002/emotion/login`;

    axios.post(apiUrl, { username, password })
        .then(response => {
            const responseData = response.data;
            // console.log(responseData);
            if (responseData.status === 'success') {
                req.session.isLoggedIn = true;
                req.session.username = username; // Set username in session

                // Fetch user_id based on the username
                const userApiUrl = `http://localhost:3002/emotion/username/${username}`;
                axios.post(userApiUrl)
                    .then(response => {
                        const userData = response.data;
                        const user_id = userData.result[0].user_id;
                        req.session.user_id = user_id; // Set user_id in session
                        console.log(req.session);
                        res.render('view', { error: null });
                    })
                    .catch(userError => {
                        console.error('Error fetching user_id:', userError);
                        res.render('login', { error: 'An error occurred while fetching user_id' });
                    });
            } else if (responseData.message === 'User not found') {
                res.render('login', { error: "User not found" });
            } else {
                res.render('login', { error: "Incorrect Password" });
            }
        })
        .catch(error =>{
            if (error.response.status === 401) {
                res.render('login', { error: 'Incorrect username or password' });
            } else if (error.response && error.response.status === 404) {
                console.log('User not found. Please check your credentials.');
            } else {
                console.error('Error during login request:', error);
                res.render('login', { error: 'An error occurred during login' });
            }
        });
}

exports.getDefaultRoute = (req, res) =>{
    res.render('login', {error:null});
};

exports.getLogEmotionRoute = (req, res) => {
    const user_id = req.session.user_id; // Retrieve user_id from session
    if (!user_id) {
        return res.render('login', { error: 'User not logged in' });
    }else{
        res.render('logEmotion',  { user_id });
    }
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

exports.getEmotionForUser = (req, res) => {
    const user_id = req.session.user_id;
    const apiUrl = `http://localhost:3002/emotion/user/${user_id}`;
    axios.get(apiUrl)
        .then(response => {
            const emotions = response.data.result;
            // console.log(emotions);
            
            res.render('emotionLog', { emotions })
        })
        .catch(error => {
            console.error('Error during request', error);
            res.render('view', {error: 'An error occured'});
        })
}

exports.putTriggers = (req, res) => {
    console.log('triggered');
    const { emotion_id, triggers } = req.body;
    const apiUrl = `http://localhost:3002/emotion/updatetrigger`;
    axios.put(apiUrl, { emotion_id, triggers})
        .then(response => {
            // Check the response status or data to ensure the update was successful
            res.status(200).json({ message: 'Triggers updated successfully' });
        })
        .catch(error => {
            console.error('Error making edit', error);
            res.status(500).json({ error: 'An error occurred while updating triggers' });
        })
}