const axios = require('axios');

exports.getLoginRoute = (req, res) => {
    res.render('login', {error: null});
};

exports.getRegisterRoute = (req, res) => {
    res.render('register', {error: null});
}



exports.postRegisterRoute = (req, res) => {
    const { username, password, passwordCheck } = req.body;
    
    // Check if the passwords match
    if (password !== passwordCheck) {
        return res.render('register', { error: 'Passwords do not match' });
    }

    // Check if the username is already taken
    const userApiUrl = `http://localhost:3002/emotion/username/${username}`;
    axios.post(userApiUrl)
        .then(response => {
            const userData = response.data;
            return res.render('register', { error: 'Username already taken' });
        })
        .catch(error => {
            const apiUrl = `http://localhost:3002/emotion/add/user`;
            axios.post(apiUrl, { username, password })
                .then(response => {
                    const responseData = response.data;
                    console.log(responseData);
                    if (responseData.status === 'success') {
                        req.session.isLoggedIn = true;
                        req.session.username = username; // Set username in session

                        // Fetch user_id based on the username
                        axios.post(userApiUrl)
                            .then(response => {
                                const userData = response.data;
                                // Check if the result array is not empty before accessing user_id
                                const user_id = userData.result.length > 0 ? userData.result[0].user_id : null;
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
                .catch(registrationError => {
                    if (registrationError.response && registrationError.response.status === 401) {
                        res.render('login', { error: 'Incorrect username or password' });
                    } else if (registrationError.response && registrationError.response.status === 404) {
                        console.log('User not found. Please check your credentials.');
                    } else {
                        console.error('Error during registration request:', registrationError);
                        res.render('register', { error: 'An error occurred during registration' });
                    }
                });
        });
};





// exports.postRegisterRoute = (req, res) => {
//     const { username, password, passwordCheck } = req.body;
//     // Check if the passwords match
//     if (password !== passwordCheck) {
//         return res.render('register', { error: 'Passwords do not match' });
//     }

//     const apiUrl = `http://localhost:3002/emotion/add/user`;

//     axios.post(apiUrl, { username, password })
//         .then(response => {
//             const responseData = response.data;
//             console.log(responseData);
//             if (responseData.status === 'success') {
//                 req.session.isLoggedIn = true;
//                 req.session.username = username; // Set username in session

//                 // Fetch user_id based on the username
//                 const userApiUrl = `http://localhost:3002/emotion/username/${username}`;
//                 axios.post(userApiUrl)
//                     .then(response => {
//                         const userData = response.data;
//                         const user_id = userData.result[0].user_id;
//                         req.session.user_id = user_id; // Set user_id in session
//                         console.log(req.session);
//                         res.render('view', { error: null });
//                     })
//                     .catch(userError => {
//                         console.error('Error fetching user_id:', userError);
//                         res.render('login', { error: 'An error occurred while fetching user_id' });
//                     });
//             } else if (responseData.message === 'User not found') {
//                 res.render('login', { error: "User not found" });
//             } else {
//                 res.render('login', { error: "Incorrect Password" });
//             }
//         })
//         .catch(error => {
//             if (error.response && error.response.status === 401) {
//                 res.render('login', { error: 'Incorrect username or password' });
//             } else if (error.response && error.response.status === 404) {
//                 console.log('User not found. Please check your credentials.');
//             } else {
//                 console.error('Error during registration request:', error);
//                 res.render('register', { error: 'An error occurred during registration' });
//             }
//         });
// }


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
    const { emotion_id, triggers } = req.body;
    const apiUrl = `http://localhost:3002/emotion/updatetrigger`;
    console.log(emotion_id);
    console.log(triggers);

    axios.put(apiUrl, { emotion_id, triggers })
        .then(response => {
            // Check the response status or data to ensure the update was successful
            // res.status(200).json({ message: 'Triggers updated successfully' });
            res.render('view');
        })
        .catch(error => {
            console.error('Error making edit', error);
            res.status(500).json({ error: 'An error occurred while updating triggers' });
        });
};


exports.getEdit = (req, res) => {
    const emotion_id = req.params.emotion_id;
    // const { triggers } = req.body;
    
    res.render('editEmotion', {emotion_id})
}

exports.getDelete = (req, res) => {
    const emotion_id = req.params.emotion_id;
    // const { triggers } = req.body;
    
    res.render('deleteEmotion', {emotion_id})
}

exports.deleteDelete = (req, res) => {
    const { emotion_id }  = req.body;
    const apiUrl = `http://localhost:3002/emotion/delete/${emotion_id}`;
    console.log('Emotion to be deleted' + emotion_id);
    axios.delete(apiUrl)
        .then(() => {
            res.render('view');
        })
        .catch(error => {
            console.error('Error deleting Log', error);
            res.status(500).json({ error: 'An error occured deleting the log'});
        });
}