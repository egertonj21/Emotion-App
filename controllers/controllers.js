const axios = require('axios');
const emailValidator = require('deep-email-validator');



async function isEmailValid(email) {
    return emailValidator.validate(email)
}

const isAuthenticated = (req, res, next) => {
    if (req.session.isLoggedIn && req.session.user_id) {
        next(); // User is authenticated, proceed to the next middleware/route handler
    } else {
        res.render('login', { error: 'You are either not logged in, or your session has timed out, please log in.', message: null });
    }
};

exports.getLoginRoute = (req, res) => {
    
    res.render('login', { error: null, message: null });
};

exports.getLoginFromLogoutRoute = (req, res) => {
    const logoutMessage = req.query.logoutMessage;
    res.render('login', { error: null, message: logoutMessage });
};

exports.getRegisterRoute = (req, res) => {
    
    res.render('register', { error: '', passwordStrength: 'Medium', passwordMatch: '', message: null });
};



exports.postRegisterRoute = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send({
            message: "Email or password missing."
        });
    }

    const { valid, reason, validators } = await isEmailValid(email);

    if (valid) {
        // Check if the passwords match
        if (password !== req.body.passwordCheck) {
            return res.render('register', { error: 'Passwords do not match', passwordStrength: 'Medium', passwordMatch: '', message: null});
        }

        // Check if the email is already taken
        const userApiUrl = `http://localhost:3002/emotion/email/${email}`;
        axios.post(userApiUrl)
            .then(response => {
                const userData = response.data;
                return res.render('register', { error: 'Email already taken', passwordStrength: 'Medium', passwordMatch: '', message: null });
            })
            .catch(error => {
                const apiUrl = `http://localhost:3002/emotion/add/user`;
                axios.post(apiUrl, { email, password })
                    .then(response => {
                        const responseData = response.data;
                        console.log(responseData);
                        if (responseData.status === 'success') {
                            req.session.isLoggedIn = true;
                            req.session.email = email; // Set email in session

                            // Fetch user_id based on the email
                            axios.post(userApiUrl)
                                .then(response => {
                                    const userData = response.data;
                                    // Check if the result array is not empty before accessing user_id
                                    const user_id = userData.result.length > 0 ? userData.result[0].user_id : null;
                                    req.session.user_id = user_id; // Set user_id in session
                                    console.log(req.session);
                                    res.render('view', { error: null, message: null });
                                })
                                .catch(userError => {
                                    console.error('Error fetching user_id:', userError);
                                    res.render('login', { error: 'An error occurred while fetching user_id' });
                                });
                        } else if (responseData.message === 'User not found') {
                            res.render('login', { error: "User not found", message: null });
                        } else {
                            res.render('login', { error: "Incorrect Password", message: null });
                        }
                    })
                    .catch(registrationError => {
                        if (registrationError.response && registrationError.response.status === 401) {
                            res.render('login', { error: 'Incorrect email or password', message: null });
                        } else if (registrationError.response && registrationError.response.status === 404) {
                            console.log('User not found. Please check your credentials.');
                        } else {
                            console.error('Error during registration request:', registrationError);
                            res.render('register', { error: 'An error occurred during registration', passwordStrength: 'Medium', passwordMatch: '', message: null });
                        }
                    });
            });
    } else {
        return res.render('register', {error:"Please provide a valid email address.", passwordStrength: 'Medium', passwordMatch: '', message: null});         
    }
};


exports.postLoginRoute = (req, res) => {
    console.log('postLoginRoute function called');
    const { email, password } = req.body;
    const apiUrl = `http://localhost:3002/emotion/login`;
    console.log(email)

    axios.post(apiUrl, { email, password })
        .then(response => {
            const responseData = response.data;
            // console.log(responseData);
            if (responseData.status === 'success') {
                req.session.isLoggedIn = true;
                req.session.email = email; // Set email in session

                // Fetch user_id based on the email
                const userApiUrl = `http://localhost:3002/emotion/email/${email}`;
                axios.post(userApiUrl)
                    .then(response => {
                        const userData = response.data;
                        const user_id = userData.result[0].user_id;
                        req.session.user_id = user_id; // Set user_id in session
                        console.log(req.session);
                        res.render('view', { error: null, message: null });
                    })
                    .catch(userError => {
                        console.error('Error fetching user_id:', userError);
                        res.render('login', { error: 'An error occurred while fetching user_id', message: null });
                    });
            } else if (responseData.message === 'User not found') {
                res.render('login', { error: "User not found", message: null });
            } else {
                res.render('login', { error: "Incorrect Password", message: null });
            }
        })
        .catch(error =>{
            if (error.response.status === 401) {
                res.render('login', { error: 'Incorrect email or password', message: null });
            } else if (error.response && error.response.status === 404) {
                console.log('User not found. Please check your credentials.');
            } else {
                console.error('Error during login request:', error);
                res.render('login', { error: 'An error occurred during login', message: null });
            }
        });
}

exports.getDefaultRoute = (req, res) =>{
    res.render('login', {error:null, message: null});
};

exports.getViewRoute = [isAuthenticated, (req, res) => {
    res.render('view', {error:null, message: null});
}]

exports.getLogEmotionRoute = [isAuthenticated, (req, res) => {
    const user_id = req.session.user_id; // Retrieve user_id from session
    if (!user_id) {
        return res.render('login', { error: 'User not logged in', message: null });
    }else{
        res.render('logEmotion',  { user_id, error: null, message: null });
    }
}];

exports.postEmotionRoute = [isAuthenticated, (req, res) => {
    const apiUrl = `http://localhost:3002/emotion/add/emotion`;
    const { enjoyment, sadness, anger, contempt, disgust, fear, surprise, triggers} = req.body;
    const user_id = req.session.user_id;
    axios.post(apiUrl, {user_id, enjoyment, sadness, anger, contempt, disgust, fear, surprise, triggers})
        .then(response => {
            res.render('view', { error: null, message: null})
        })
        .catch(error => {
            console.error('Error during request', error);
            res.render('view', {error: 'An error occured', message: null});
        })
}];

exports.getEmotionForUser = [isAuthenticated, (req, res) => {
    const user_id = req.session.user_id;
    const apiUrl = `http://localhost:3002/emotion/user/${user_id}`;
    axios.get(apiUrl)
        .then(response => {
            const emotions = response.data.result;
            // console.log(emotions);
            
            res.render('emotionLog', { emotions, error: null, message: null })
        })
        .catch(error => {
            console.error('Error during request', error);
            res.render('view', {error: 'An error occured', message: null});
        })
}];

exports.putTriggers = [isAuthenticated, (req, res) => {
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
            res.status(500).json({ error: 'An error occurred while updating triggers', message: null });
        });
}];


exports.getEdit = [isAuthenticated, (req, res) => {
    const emotion_id = req.params.emotion_id;
    // const { triggers } = req.body;
    
    res.render('editEmotion', {emotion_id, error: null, message: null})
}];

exports.getDelete = [isAuthenticated, (req, res) => {
    const emotion_id = req.params.emotion_id;
    // const { triggers } = req.body;
    
    res.render('deleteEmotion', {emotion_id, error: null, message: null})
}];

exports.deleteDelete = [isAuthenticated, (req, res) => {
    const { emotion_id }  = req.body;
    const apiUrl = `http://localhost:3002/emotion/delete/${emotion_id}`;
    console.log('Emotion to be deleted' + emotion_id);
    axios.delete(apiUrl)
        .then(() => {
            res.render('view', {error: null, message: null});
        })
        .catch(error => {
            console.error('Error deleting Log', error);
            res.status(500).json({ error: 'An error occured deleting the log'});
        });
}];

exports.logoutRoute = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            res.status(500).send('Error logging out');
        } else {
            // Redirect to the login page after logout with a logout message
            res.redirect('/loginOut?logoutMessage=You have been logged out');
        }
    });
};

exports.getEmotionChart = [isAuthenticated, async (req, res) => {
    try {
        const user_id = req.session.user_id;
        const apiUrl = `http://localhost:3002/emotion/user/${user_id}`;
        const response = await axios.get(apiUrl);
        const emotions = response.data.result;
        
        // Render the emotionChart.ejs file and pass the fetched data to it
        
        console.log(emotions);
        const enjoymentArray = [];
        const sadnessArray = [];
        const angerArray = [];
        const contemptArray = [];
        const disgustArray = [];
        const fearArray = [];
        const surpriseArray = [];
        const xlabels = [];
        for (let i = 0; i < emotions.length; i++) {
            const emotion = emotions[i];
            enjoymentArray.push(emotion.enjoyment);
            sadnessArray.push(emotion.sadness);
            angerArray.push(emotion.anger);
            contemptArray.push(emotion.contempt);
            disgustArray.push(emotion.disgust);
            fearArray.push(emotion.fear);
            surpriseArray.push(emotion.surprise);
            xlabels.push(emotion.timestamp);
            }
        res.render('emotionChart', {
            emotions: emotions, // Pass the emotions data fetched from the API
            enjoymentArray: enjoymentArray,
            sadnessArray: sadnessArray,
            angerArray: angerArray,
            contemptArray: contemptArray,
            disgustArray: disgustArray,
            fearArray: fearArray,
            surpriseArray: surpriseArray,
            xlabels: xlabels,
            error: null,
            message: null
        });
        // console.log(enjoymentArray);
    
        // Iterate over the array of emotion objects
        
    } catch (error) {
        console.error('Error fetching emotion data:', error);
        res.render('view', { error: 'An error occurred while fetching emotion data', message: null });
    }
}];