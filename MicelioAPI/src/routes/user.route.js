const express = require('express');
const UserController = require('../controllers/UserController.js');

const Router = express.Router();
const userController = new UserController();

Router.get('/', userController.get)
Router.post('/', userController.create);
Router.patch('/', userController.update);
Router.post('/login', userController.login)
Router.delete('/login', userController.logout)
Router.post('/update-password', userController.updatePassword)
Router.delete('/login', userController.logout);

module.exports = Router;
