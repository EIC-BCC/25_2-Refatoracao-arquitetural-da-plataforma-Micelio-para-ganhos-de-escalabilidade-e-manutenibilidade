const express = require("express")
const ActivityController = require("../controllers/ActivityController")
const TokenMiddleware = require("../middleware/TokenMiddleware")
const DeviceIDMiddleware = require("../middleware/DeviceIDMiddleware")

const Router = express.Router()
const activityController = new ActivityController()

Router.post("/", TokenMiddleware, DeviceIDMiddleware, activityController.create)
Router.post(
  "/test",
  TokenMiddleware,
  DeviceIDMiddleware,
  activityController.create
)


Router.get("/", activityController.index)


//i added the line below
Router.get("/by-game/:game_id", async (req, res) => {
  const knex = require("../database/connection");
  const { game_id } = req.params;

  try {
    const activities = await knex("Activity as act")
      .leftJoin("Session as session", "session.session_id", "act.session_id")
      .where("session.game_id", game_id)
      .select(
        "act.activity_id",
        "act.name",
        "act.time",
        "act.properties",
        "session.session_id"
      );

    res.status(200).json({ activities });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar atividades" });
  }
});

//TESTING 1
Router.post("/test/:session_id", activityController.createTestActivities)
//TESTING 2
Router.delete("/test/:session_id", activityController.deleteTestActivities)

//I'M ADDING THIS 
// GET activities for a specific session
Router.get("/session/:session_id", async (req, res) => {
  const knex = require("../database/connection");
  const { session_id } = req.params;

  try {
    const activities = await knex("activity")
      .where({ session_id })
      .select("activity_id", "name", "time", "properties", "session_id");

    res.status(200).json({ activities });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar atividades pela sessão" });
  }
});

//I'M ADDING THIS AS WELL
// GET activities by session ID (required for visualization)
Router.get("/by-session/:session_id", async (req, res) => {
  const knex = require("../database/connection");
  const { session_id } = req.params;

  try {
    const activities = await knex("Activity as act")
      .leftJoin("Action as a", "a.activity_id", "act.activity_id")
      .where("act.session_id", session_id)
      .select(
        "act.activity_id",
        "act.name",
        "act.time",
        "act.properties",
        "act.session_id",
        "a.position_x",
        "a.position_y",
        //"a.position_z"
      );

    res.status(200).json({ activities });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching activities by session" });
  }
});




module.exports = Router
