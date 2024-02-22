const axios = require('axios');
// const emailValidator = require('deep-email-validator');
const dayjs = require('dayjs');
const validator = require('email-validator');

const allowedDomains = ['belfastcity.gov.uk', 'example.com', 'yourdomain.com'];



const isAuthenticated = (req, res, next) => {
    if (req.session.isLoggedIn && req.session.user_id) {
        next(); // User is authenticated, proceed to the next middleware/route handler
    } else {
        res.render('login', { error: 'You are either not logged in, or your session has timed out, please log in.', message: null, username: null });
    }
};

exports.getLoginRoute = (req, res) => {
    
    res.render('login', { error: null, message: null, username: null });
};

exports.getLoginFromLogoutRoute = (req, res) => {
    const logoutMessage = req.query.logoutMessage;
    res.render('login', { error: null, message: logoutMessage, username: null });
};

exports.getRegisterRoute = (req, res) => {
    
    res.render('register', { error: '', passwordStrength: 'Medium', passwordMatch: '', message: null, username: null });
};



exports.postRegisterRoute = async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).send({
            message: "Email or password missing."
        });
    }

    // Validate the email using the email-validator middleware
    if (!validator.validate(email)) {
        return res.render('register', {error:"Please provide a valid email address.", passwordStrength: 'Medium', passwordMatch: '', message: null, username: null});         
    }

    // Check if the passwords match
    if (password !== req.body.passwordCheck) {
        return res.render('register', { error: 'Passwords do not match', passwordStrength: 'Medium', passwordMatch: '', message: null, username: null});
    }

    // Check if the email is already taken
    const userApiUrl = `http://localhost:3002/emotion/email/${email}`;
    axios.post(userApiUrl)
        .then(response => {
            const userData = response.data;
            return res.render('register', { error: 'Email already taken', passwordStrength: 'Medium', passwordMatch: '', message: null, username: null });
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
                        axios.get(userApiUrl)
                            .then(response => {
                                const userData = response.data;
                                const user_id = responseData.data.insertId;
                                req.session.user_id = user_id; // Set user_id in session
                                username = req.session.email;
                                console.log(req.session);
                                res.render('view', { error: null, message: null, username });
                            })
                            .catch(userError => {
                                console.error('Error fetching user_id:', userError);
                                res.render('login', { error: 'An error occurred while fetching user_id', message: null, username: null });
                            });
                    } else if (responseData.message === 'User not found') {
                        res.render('login', { error: "User not found", message: null, username: null });
                    } else {
                        res.render('login', { error: "Incorrect Password", message: null, username: null });
                    }
                })
                .catch(registrationError => {
                    if (registrationError.response && registrationError.response.status === 401) {
                        res.render('login', { error: 'Incorrect email or password', message: null, username: null });
                    } else if (registrationError.response && registrationError.response.status === 404) {
                        console.log('User not found. Please check your credentials.');
                    } else {
                        console.error('Error during registration request:', registrationError);
                        res.render('register', { error: 'An error occurred during registration', passwordStrength: 'Medium', passwordMatch: '', message: null, username: null });
                    }
                });
        });
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
                axios.get(userApiUrl)
                    .then(response => {
                        const userData = response.data;
                        const username = req.session.email;
                        const user_id = userData.data;
                        console.log(user_id);
                        req.session.user_id = userData.data; // Set user_id in session
                        console.log(req.session);
                        res.render('view', { error: null, message: null, username });
                    })
                    .catch(userError => {
                        console.error('Error fetching user_id:', userError);
                        res.render('login', { error: 'An error occurred while fetching user_id', message: null, username: null });
                    });
            } else if (responseData.message === 'User not found') {
                res.render('login', { error: "User not found", message: null, username: null });
            } else {
                res.render('login', { error: "Incorrect Password", message: null, username: null });
            }
        })
        .catch(error =>{
            if (error.response.status === 401) {
                res.render('login', { error: 'Incorrect email or password', message: null, username: null });
            } else if (error.response && error.response.status === 404) {
                res.render('login', { error: 'Incorrect email or password', message: null, username: null });
                console.log('User not found. Please check your credentials.');
            } else {
                console.error('Error during login request:', error);
                res.render('login', { error: 'An error occurred during login', message: null, username: null });
            }
        });
}

exports.getDefaultRoute = (req, res) =>{
    res.render('login', {error:null, message: null, username: null});
};

exports.getViewRoute = [isAuthenticated, (req, res) => {
    username = req.session.email;
    res.render('view', {error:null, message: null, username});
}]

exports.getLogEmotionRoute = [isAuthenticated, (req, res) => {
    const user_id = req.session.user_id; // Retrieve user_id from session
    if (!user_id) {
        return res.render('login', { error: 'User not logged in', message: null, username: null });
    }else{
        username = req.session.email;
        res.render('logEmotion',  { user_id, error: null, message: null, username });
    }
}];

exports.postEmotionRoute = [isAuthenticated, (req, res) => {
    const apiUrl = `http://localhost:3002/emotion/add/emotion`;
    const { enjoyment, sadness, anger, contempt, disgust, fear, surprise, triggers} = req.body;
    const user_id = req.session.user_id;
    username = req.session.email;
    axios.post(apiUrl, {user_id, enjoyment, sadness, anger, contempt, disgust, fear, surprise, triggers})
        .then(response => {
            
            res.render('view', { error: null, message: null, username})
        })
        .catch(error => {
            console.error('Error during request', error);
            res.render('view', {error: 'An error occured', message: null, username});
        })
}];

exports.getEmotionForUser = [isAuthenticated, (req, res) => {
    const user_id = req.session.user_id;
    const username = req.session.email;
    const apiUrl = `http://localhost:3002/emotion/user/${user_id}`;
    
    axios.get(apiUrl)
        .then(response => {
            if (response.data.status === 'success') {
                const emotions = response.data.data.map(emotion => {
                    // Format the timestamp of each emotion to a human-readable format
                    emotion.timestamp = dayjs(emotion.timestamp).format("YYYY-MM-DD HH:mm:ss");
                    return emotion;
                });
                
                if (emotions.length > 0) {
                    res.render('emotionLog', { emotions, error: null, message: null, username });
                } else {
                    res.render('emotionLog', { emotions: [], error: 'No emotion records found for the user', message: null, username });
                }
            } else if (response.status === 404) {
                res.render('emotionLog', { emotions: [], error: 'No emotion records found for the user', message: null, username });
            } else {
                throw new Error('Unexpected response from server');
            }
        })
        .catch(error => {
            if (error.response && error.response.status === 404) {
                res.render('emotionLog', { emotions: [], error: 'No emotion records found for the user', message: null, username });
            } else {
                console.error('Error during request', error);
                res.render('view', { error: 'An error occurred', message: null, username });
            }
        });
}];



exports.putTriggers = [isAuthenticated, (req, res) => {
    const { emotion_id, triggers } = req.body;
    const username = req.session.email;
    const apiUrl = `http://localhost:3002/emotion/updatetrigger`;
    console.log(emotion_id);
    console.log(triggers);

    axios.put(apiUrl, { emotion_id, triggers })
        .then(response => {
            // Check the response status or data to ensure the update was successful
            // res.status(200).json({ message: 'Triggers updated successfully' });
            res.render('view', {error: null, message: null, username});
        })
        .catch(error => {
            console.error('Error making edit', error);
            res.status(500).json({ error: 'An error occurred while updating triggers', message: null, username });
        });
}];


exports.getEdit = [isAuthenticated, (req, res) => {
    const emotion_id = req.params.emotion_id;
    const username = req.session.email;
    const apiUrl = `http://localhost:3002/emotion/${emotion_id}`;

    axios.get(apiUrl)
        .then(response => {
            const emotion = response.data.data;
            // Format the timestamp of the emotion to a human-readable format
            emotion.timestamp = dayjs(emotion.timestamp).format("YYYY-MM-DD HH:mm:ss");
            const triggers = emotion.triggers;
            console.log(triggers);
            res.render('editEmotion', { emotion, emotion_id, triggers, error: null, message: null, username });
        })
        .catch(error => {
            console.error('Error rendering page', error);
            res.status(500).json({ error: 'An error occurred while loading the specified emotion log', message: null, username });
        });
}];

exports.getDelete = [isAuthenticated, (req, res) => {
    const emotion_id = req.params.emotion_id;
    const username = req.session.email;
    const apiUrl = `http://localhost:3002/emotion/${emotion_id}`;

    axios.get(apiUrl)
        .then(response => {
            const emotion = response.data.data;
            // Format the timestamp of the emotion to a human-readable format
            emotion.timestamp = dayjs(emotion.timestamp).format("YYYY-MM-DD HH:mm:ss");
            const triggers = emotion.triggers;
            console.log(triggers);
            res.render('deleteEmotion', { emotion, emotion_id, triggers, error: null, message: "Please note you will be unable to recover this once deleted, proceed with caution", username });
        })
        .catch(error => {
            console.error('Error rendering page', error);
            res.status(500).json({ error: 'An error occurred while loading the specified emotion log', message: null, username });
        });
}];

exports.getAccountRoute = [isAuthenticated, (req, res) => {
    const username = req.session.email;
    const user_id = req.session.user_id;
    
    
    res.render('account', {error: null, message: null, username, user_id})
}];

exports.getPasswordChangeRoute = [isAuthenticated, (req, res) => {
    const username = req.session.email;
    
    
    res.render('passwordChange', { error: '', passwordStrength: 'Medium', passwordMatch: '', message: null, username: null })
}];

exports.deleteDelete = [isAuthenticated, (req, res) => {
    const { emotion_id }  = req.body;
    const username = req.session.email;
    const apiUrl = `http://localhost:3002/emotion/delete/${emotion_id}`;
    console.log('Emotion to be deleted' + emotion_id);
    axios.delete(apiUrl)
        .then(() => {
            res.render('view', {error: null, message: null, username});
        })
        .catch(error => {
            console.error('Error deleting Log', error);
            res.status(500).json({ error: 'An error occured deleting the log', message: null, username});
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
        const emotions = response.data.data;
        const username = req.session.email;

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
            const formattedTimestamp = dayjs(emotion.timestamp).format('YYYY-MM-DD HH:mm:ss');
            xlabels.push(formattedTimestamp);
        }

        res.render('emotionChart', {
            emotions: emotions,
            enjoymentArray: enjoymentArray,
            sadnessArray: sadnessArray,
            angerArray: angerArray,
            contemptArray: contemptArray,
            disgustArray: disgustArray,
            fearArray: fearArray,
            surpriseArray: surpriseArray,
            xlabels: xlabels,
            error: null,
            message: null,
            username
        });
    } catch (error) {
        const username = req.session.email;
        console.error('Error fetching emotion data:', error);
        if (error.response && error.response.status === 404) {
            res.render('emotionChart', {
                emotions: [],
                enjoymentArray: [],
                sadnessArray: [],
                angerArray: [],
                contemptArray: [],
                disgustArray: [],
                fearArray: [],
                surpriseArray: [],
                xlabels: [],
                error: 'No emotion records found for the user',
                message: null,
                username
            });
        } else {
            res.render('view', { error: 'An error occurred while fetching emotion data', message: null, username });
        }
    }
}];


exports.emotionForUserbyDate = [isAuthenticated, (req, res) => {
    const user_id = req.session.user_id;
    const username = req.session.email;
    const startDate = req.body.startDate;
    const endDate = req.body.endDate;
    let emotions =[];

    
    const formattedStartDate = dayjs(startDate).format('YYYY-MM-DD');
    const formattedEndDate = dayjs(endDate).format('YYYY-MM-DD');

    console.log(formattedStartDate, formattedEndDate);

    const apiUrl = `http://localhost:3002/emotion/userByDate/${user_id}`;
    axios.get(apiUrl, { params: { startDate: formattedStartDate, endDate: formattedEndDate } })
        .then(response => {
            const emotions = response.data.data.map(emotion => {
                // Format the timestamp of each emotion to a human-readable format
                emotion.timestamp = dayjs(emotion.timestamp).format("YYYY-MM-DD HH:mm:ss");
                return emotion;
            });
            
            res.render('emotionLog', { emotions, error: null, message: null, username });
        })
        .catch(error => {
            
            console.error('Error during request', error);
            res.render('emotionLog', { emotions, error: 'No logs for selected dates', message: null, username });
        });
}];

exports.putPasswordChange = async (req, res) => {
    const { newPassword, passwordCheck } = req.body;
    const email = req.session.email;
    const username = req.session.username;

    if (!newPassword || !passwordCheck || newPassword !== passwordCheck) {
        return res.status(400).json({
            error: "New passwords do not match."
        });
    }

    try {
        // Make a request to your API to change the password
        const response = await axios.put(`http://localhost:3002/emotion/updatePassword`, {
            email: email,
            newPassword: newPassword
        });

        if (response.data && response.data.message === 'Password updated successfully') {
            // Password updated successfully
            return res.render('account', { error: null, message: "Password updated successfully.", username });
        } else {
            // Handle other response cases if necessary
            console.error('Error changing password. Response:', response.data);
            return res.status(500).json({ error: 'An error occurred while changing password.' });
        }
    } catch (error) {
        console.error('Error changing password:', error);
        return res.status(500).json({ error: 'An error occurred while changing password.' });
    }
};

exports.deleteEmotions = async (req, res) => {
    const user_id = req.session.user_id;
    const username = req.body.email;
    console.log(user_id);
    const apiUrl = `http://localhost:3002/emotion/deleteEmotion/${user_id}`;

    try {
        const response = await axios.delete(apiUrl, { user_id: { user_id } });
        res.render('account', { error: null, message: null, username, user_id });
    } catch (error) {
        console.error('Error deleting logs', error);
        res.render('account', { error: 'Could not delete logs', message: null, username, user_id });
    }
}


exports.getDeleteEmotionsRoute = [isAuthenticated, (req, res) => {
    const user_id = req.session.user_id;
    const username = req.session.email;
    const apiUrl = `http://localhost:3002/emotion/user/${user_id}`;
    
    axios.get(apiUrl)
        .then(response => {
            if (response.data.status === 'success') {
                const emotions = response.data.data.map(emotion => {
                    // Format the timestamp of each emotion to a human-readable format
                    emotion.timestamp = dayjs(emotion.timestamp).format("YYYY-MM-DD HH:mm:ss");
                    return emotion;
                });
                
                res.render('deleteEmotions', { emotions, error: null, message: null, username, user_id });
            } else if (response.status === 404) {
                res.render('deleteEmotions', { emotions: [], error: 'No emotion records found for the user', message: null, username, user_id });
            } else {
                throw new Error('Unexpected response from server');
            }
        })
        .catch(error => {
            if (error.response && error.response.status === 404) {
                res.render('deleteEmotions', { emotions: [], error: 'No emotion records found for the user', message: null, username, user_id });
            }else{
            console.error('Error during request', error);
            res.render('account', { error: 'An error occurred', message: null, username });
            }
        });
}];

exports.getWipeout = [isAuthenticated, (req, res) => {
    const username = req.session.email;
    // const { triggers } = req.body;
    
    res.render('wipeout', { error: '', message: null, username: null })
}];

exports.deleteAll = async (req, res) => {
    const user_id = req.session.user_id;
    const username = req.session.email;
    console.log(user_id);
    const apiUrl = `http://localhost:3002/emotion/deleteuser/${user_id}`;

    try {
        const response = await axios.delete(apiUrl, { data: { user_id } });
        // Destroy the session
        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session:', err);
                res.status(500).send('Error logging out');
            } else {
                // Redirect the user to the login screen with a success message
                res.render('login', { message: 'Account deleted successfully', error: '', username: '' });
            }
        });
    } catch (error) {
        console.error('Error deleting account', error);
        res.render('account', { error: 'Could not delete account', message: null, username, user_id });
    }
}
