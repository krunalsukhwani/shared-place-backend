const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const placesRoutes = require('./routes/places-routes');
const HttpError = require('./models/http-error');

const app = express();

app.use(bodyParser.json());

app.use('/api/places',placesRoutes);

app.use((req, res, next) => {
    throw new HttpError('Could not find the route.', 404);
});

//add middleware to handle the error
app.use((error, req, res, next) => {
    if(res.headerSent){
        return next(error);
    }

    res.status(error.code || 500);
    res.json({message: error.message || 'An unknown error occurred!'});
});

mongoose
    .connect('mongodb+srv://comp229_405:SLwYzba4SyKOSbxy@cluster0.mvq6l.mongodb.net/shared-places?retryWrites=true&w=majority&appName=Cluster0')
    .then(() => {
        app.listen(8080)
    })
    .catch(err => {
        console.log(err);
    })

