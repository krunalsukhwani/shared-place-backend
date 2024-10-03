const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");
const getCoordinatesforAddress = require("../util/location");
const Place = require("../models/place");

//In memory storage - refresh data - reset data
let DUMMY_PLACES = [
  {
    id: "p1",
    title: "Centennial College",
    description: "One of the best college in GTA",
    address: "941 Progress Ave, Scarborough, ON M1G 3T8",
    location: {
      lat: 43.7852043,
      lng: -79.230744,
    },
    creator: "tyler",
  },
  {
    id: "p2",
    title: "Service Canada",
    description: "Get all federal services from service canada",
    address: "31 Tapscott Rd, Scarborough, ON M1B 4Y7",
    location: {
      lat: 43.7852024,
      lng: -79.2487686,
    },
    creator: "nadzeya",
  },
];

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;

  try{
    place = await Place.findById(placeId);
  }catch(err){
    const error = new HttpError('Something went wrong, Could not find a place.', 500);
    return next(error);
  }
 
  if (!place) {
    const error = new HttpError(
      "Could not find a place for the provided place id.",
      404
    );
    return next(error);
  }

  res.json({place : place.toObject({ getters: true })});
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  
  let places;

  try{
    places = await Place.find({creator: userId});
  }catch(err){
    const error = new HttpError('Fetching places failed, try again later!', 500);
    return next(error);
  }

  if (!places || places.length === 0) {
    return next(
      new HttpError("Could not find a places for the provided user id.", 404)
    );
  }

  res.json({ places: places.map(place => place.toObject({getters: true})) });
};

const createPlace = async (req, res, next) => {

  const errors = validationResult(req);

  if(!errors.isEmpty()){
    console.log(errors);
    return next(new HttpError("Invalid input, please check data!", 422));
  }

  const { title, description, address, creator } = req.body;

  let coordinates;

  try{
    coordinates = await getCoordinatesforAddress(address);
  }catch(error){
    return next(error);
  }
  
  const createdPlace = new Place({
    title, 
    description,
    location: coordinates,
    address,
    creator,
    image: 'https://upload.wikimedia.org/wikipedia/commons/3/3f/JPEG_example_flower.jpg'
  });

  try{
    await createdPlace.save();
  }catch(err){
    const error = new HttpError('Creating place failed, please try again!', 500);
    return next(error);
  }
  

  res.status(201).json({ place: createdPlace });
};

const deletePlace = async (req, res, next) => {
    const placeId = req.params.pid;

    let place;

    //find the place by place id from the mongo database
    try {
      place = await Place.findById(placeId);
    }catch(err){
      const error = new HttpError('Something went wrong, could not delete the place.', 500);
      return next(error);
    }

    //display the error message if place is not available with given place id
    if(!place) {
      const error = new HttpError('Could not find the place for the provided place id.', 404);
      return next(error);
    }

    //if place is available with given id, delete the place from the MongoDB
    try{
      await place.deleteOne();
    }catch(err){
      const error = new HttpError('Something went wrong, could not delete the place.', 500);
      return next(error);
    }
    
    res.status(200).json({message: 'Successfully deleted a place.'});
};

const updatePlace = (req, res, next) => {

    const errors = validationResult(req);

    if(!errors.isEmpty()){
      console.log(errors);
      throw new HttpError("Invalid input, please check data!", 422);
    }

    const { title, description } = req.body;
    const placeId = req.params.pid;

    const updatedPlace = { ...DUMMY_PLACES.find(p => p.id === placeId)};

    const placeIndex = DUMMY_PLACES.findIndex(p => p.id === placeId);

    updatedPlace.title = title;
    updatedPlace.description = description;

    DUMMY_PLACES[placeIndex] = updatedPlace;

    res.status(200).json({place: updatedPlace});
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.deletePlace = deletePlace;
exports.updatePlace = updatePlace;