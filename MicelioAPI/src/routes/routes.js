const express = require("express")

const GameRoutes = require("./game.route")
const DeviceRoutes = require("./device.route")
const SessionRoutes = require("./session.route")
const ActivityRoutes = require("./activity.route")
const UserRoutes = require("./user.route")
const GroupRoutes = require("./group.route")
const AboutRoutes = require("./about.route")
const VisualizacaoRoutes = require("./visualizacao.route");
const VisualizationGroupRoutes = require("./visualizationGroup.route");
const DashboardRoutes = require('./dashboard.route');
const userRoutes = require("./user.route"); // Adjust the path if necessary

const TokenMiddleware = require("../middleware/TokenMiddleware")
const LogMiddleware = require("../middleware/LogMiddleware")

const Router = express.Router()

Router.use("/user", LogMiddleware, UserRoutes)
Router.use("/game", LogMiddleware, GameRoutes)
Router.use('/visualization', LogMiddleware, VisualizacaoRoutes);
Router.use('/visualization-group', LogMiddleware, VisualizationGroupRoutes);
Router.use("/device", LogMiddleware, TokenMiddleware, DeviceRoutes)
Router.use("/session", LogMiddleware, SessionRoutes)
Router.use("/activity", LogMiddleware, ActivityRoutes)
Router.use("/group", LogMiddleware, GroupRoutes)
Router.use("/about", AboutRoutes)
Router.use('/dashboard', LogMiddleware, DashboardRoutes);
Router.use("/user", userRoutes);

module.exports = Router



