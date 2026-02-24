const express = require("express");
const VisualizationGroupController = require("../controllers/VisualizationGroupController");

const Router = express.Router();
const visualizationGroupController = new VisualizationGroupController();

Router.get("/:game_id", visualizationGroupController.index);
Router.post("/:game_id", visualizationGroupController.create);

// New routes for managing sessions in groups
Router.get("/:visualization_group_id/sessions", visualizationGroupController.getSessions);
Router.post("/:visualization_group_id/sessions", visualizationGroupController.addSession);
Router.delete("/:visualization_group_id/sessions/:session_id", visualizationGroupController.removeSession);

module.exports = Router;