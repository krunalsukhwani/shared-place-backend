const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");
const getCoordinatesforAddress = require("../util/location");

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

const getPlaceById = (req, res, next) => {
  const placeId = req.params.pid;
  const place = DUMMY_PLACES.find((p) => {
    return p.id === placeId;
  });

  if (!place) {
    throw new HttpError(
      "Could not find a place for the provided place id.",
      404
    );
  }

  res.json(place);
};

const getPlacesByUserId = (req, res, next) => {
  const userId = req.params.uid;
  const places = DUMMY_PLACES.filter((p) => {
    return p.creator === userId;
  });

  if (!places || places.length === 0) {
    return next(
      new HttpError("Could not find a places for the provided user id.", 404)
    );
  }

  res.json({ places });
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
  

  const createdPlace = {
    id: uuidv4(),
    title, //title: title
    description,
    location: coordinates,
    address,
    creator,
  };

  DUMMY_PLACES.push(createdPlace);

  res.status(201).json({ place: createdPlace });
};

const deletePlace = (req, res, next) => {
    const placeId = req.params.pid;
    //delete place from array
    DUMMY_PLACES = DUMMY_PLACES.filter(p => p.id !== placeId);

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