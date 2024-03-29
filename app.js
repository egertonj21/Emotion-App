const express = require('express');
const morgan = require('morgan');
const dotenv = require('dotenv').config({ path: './config.env' });
const session = require('express-session');
const router = require('./routes/routes');
const helmet = require('helmet');
var path = require('path');

const app = express();

app.use(session({
    secret: 'mysecret',
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 3600000}    
}));


app.set('view engine', 'ejs');
app.use(express.json());
app.use(morgan('tiny'));
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: [
                "'self'", 
                "'unsafe-inline'", 
                "'unsafe-eval'", 
                'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js',
                'https://cdn.jsdelivr.net'
            ],
        },
    })
);

app.use('/', router);

app.listen(process.env.PORT, (error) => {
    if (error) return console.log(error);

    console.log(`Express listening on port ${process.env.PORT}`);
});