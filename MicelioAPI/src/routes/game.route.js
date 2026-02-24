

const express = require('express');
const GameController = require('../controllers/GameController.js');
const ShareController = require ("../controllers/ShareController");

const Router = express.Router();

const gameController = new GameController();
const shareController = new ShareController();


Router.get('/:game_id', gameController.index);
Router.get('/', gameController.get);
Router.post('/', gameController.create);

Router.delete('/:id', gameController.deleteGame); 
Router.post('/share', shareController.create); 




// Add this DELETE route for deleting a game by ID
// Router.delete('/:game_id', gameController.delete);
// Define the delete route
  // Router.delete('/game/:id', gameController.deleteGame);



module.exports = Router;
