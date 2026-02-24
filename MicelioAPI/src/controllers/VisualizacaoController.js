const knex = require("../database/connection");
const Jinq = require("jinq");
const idGenerator = require("../utils/generators/idGenerator");
const {
  decodeUserSession,
} = require("../utils/generators/userSessionGenerator");
const path = require("path");

class VisualizacaoController {
  // ============================================================
  // GET SESSION DATA + OPTIONAL VISUALIZATION CONFIG
  // ============================================================
  async get(request, response) {
    const { session_id } = request.params;
    const { visualization_id } = request.query;

    try {
      // -----------------------------------------
      // 1. SESSION QUERY
      // -----------------------------------------
      const completeSession = await knex("Session as session")
        .select([
          "session.*",
          "act.activity_id",
          "act.name as activity_name",
          "act.time as activity_time",
          "act.properties as activity_properties",
          "influenced.influenced_id as influenced_by",
          "action.position_x as activity_position_x",
          "action.position_y as activity_position_y",
          "ent.entity_id",
          "ent.name as entity_name",
          "ent.properties as entity_properties",
          "gameobj.position_x as entity_position_x",
          "gameobj.position_y as entity_position_y",
          "gamechar.position_x as agent_position_x",
          "gamechar.position_y as agent_position_y",
          "act_ent.properties as entity_properties",
          "act_ent.role as entity_role",
          "agent.agent_id",
          "agent.name as agent_name",
          "agent.type as agent_type",
          "agent.properties as agent_properties",
          "act_agent.position_x as activity_agent_position_x",
          "act_agent.position_y as activity_agent_position_y",
          "act_agent.properties as activity_agent_properties",
          "act_agent.role as agent_role",
        ])
        .leftJoin("Activity as act", "act.session_id", "session.session_id")
        .leftJoin(
          "ActivityEntities as act_ent",
          "act_ent.activity_id",
          "act.activity_id"
        )
        .leftJoin("Entity as ent", "ent.entity_id", "act_ent.entity_id")
        .leftJoin(
          "ActivityAgents as act_agent",
          "act_agent.activity_id",
          "act.activity_id"
        )
        .leftJoin("Agent as agent", "agent.agent_id", "act_agent.agent_id")
        .leftJoin("Action as action", "action.activity_id", "act.activity_id")
        .leftJoin("GameObject as gameobj", "gameobj.entity_id", "ent.entity_id")
        .leftJoin(
          "GameCharacter as gamechar",
          "gamechar.agent_id",
          "agent.agent_id"
        )
        .leftJoin(
          "InfluencedBy as influenced",
          "influenced.influence_id",
          "act.activity_id"
        )
        .where({ "session.session_id": session_id });

      // -----------------------------------------------------
      // 2. BUILD THE SESSION OBJECT (your original logic)
      // -----------------------------------------------------
      const finalSession = {};

      const extractAgent = (session) => {
        if (!session.agent_id) return null;

        return {
          agent_id: session.agent_id,
          name: session.agent_name,
          type: session.agent_type,
          position_x: session.agent_position_x,
          position_y: session.agent_position_y,
          properties: JSON.parse(session.agent_properties),
          role: session.agent_role,
        };
      };

      const extractEntity = (session) => {
        if (!session.entity_id) return null;

        return {
          entity_id: session.entity_id,
          name: session.entity_name,
          position_x: session.entity_position_x,
          position_y: session.entity_position_y,
          properties: JSON.parse(session.entity_properties),
          role: session.entity_role,
        };
      };

      const extractActivity = (session) => {
        if (!session.activity_id) return null;

        const currentEntity = extractEntity(session);
        const currentAgent = extractAgent(session);

        if (finalSession[session.session_id]) {
          const registeredActivityIndex = finalSession[
            session.session_id
          ].activities.findIndex(
            (act) => act?.activity_id === session.activity_id
          );

          if (registeredActivityIndex >= 0) {
            if (currentEntity) {
              finalSession[session.session_id].activities[
                registeredActivityIndex
              ].entities.push(currentEntity);
            }

            if (currentAgent) {
              finalSession[session.session_id].activities[
                registeredActivityIndex
              ].agents.push(currentAgent);
            }

            return;
          }
        }

        const entitiesList = currentEntity ? [currentEntity] : [];
        const agentsList = currentAgent ? [currentAgent] : [];

        return {
          activity_id: session.activity_id,
          name: session.activity_name,
          time: session.activity_time,
          influenced_by: session.influenced_by,
          position_x: session.activity_position_x,
          position_y: session.activity_position_y,
          entities: entitiesList,
          agents: agentsList,
          properties: JSON.parse(session.activity_properties),
        };
      };

      const extractSession = (session) => {
        if (!session.session_id) return {};
        const currentActivity = extractActivity(session);
        const activityList = currentActivity ? [currentActivity] : [];

        return {
          name: session.name,
          language: session.language,
          game_stage: session.game_stage,
          session_id: session.session_id,
          date: session.date,
          session_group_id: session.session_group_id,
          start_time: session.start_time,
          end_time: session.end_time,
          activities: activityList,
        };
      };

      for (const session of completeSession) {
        const currentActivity = extractActivity(session);

        if (!finalSession[session.session_id]) {
          finalSession[session.session_id] = extractSession(session);
          continue;
        }

        if (currentActivity) {
          finalSession[session.session_id].activities.push(currentActivity);
        }
      }

      const sessionResult = Object.values(finalSession)[0];

      // -----------------------------------------------------
      // 3. LOAD VISUALIZATION CONFIG (NEW)
      // -----------------------------------------------------
      let visualizationConfig = { graphs: [] };

      if (visualization_id) {
        const viz = await knex("Visualization")
          .select("config")
          .where({ visualization_id })
          .first();

        if (viz?.config) {
          try {
            visualizationConfig = JSON.parse(viz.config);
          } catch (error) {
            console.error("Invalid JSON in Visualization config:", error);
          }
        }
      }

      // -----------------------------------------------------
      // 4. RETURN FULL SESSION + CONFIG
      // -----------------------------------------------------
      return response.json({
        ...sessionResult,
        config: visualizationConfig,
      });
    } catch (error) {
      console.error("Error in get():", error);
      return response.status(500).json({ error: "Internal server error" });
    }
  }

  // ============================================================
  // LIST VISUALIZATIONS
  // ============================================================
  async index(request, response) {
    const { miceliotoken } = request.cookies;
    if (!miceliotoken) {
      return response.status(401).send();
    }

    const { sub: user_id } = decodeUserSession(miceliotoken);
    const { game_id } = request.params;

    try {
      const visualization = await knex("Visualization")
        .select("*")
        .where("user_id", user_id)
        .andWhere("game_id", game_id);

      if (!visualization) {
        return response
          .status(400)
          .json({ error: "Cannot get visualization, try again later" });
      } else {
        return response.status(200).json(visualization);
      }
    } catch (e) {
      return response.status(400).json({ error: e });
    }
  }

  // ============================================================
  // CREATE VISUALIZATION
  // ============================================================
  async create(request, response) {
    const { game_id } = request.params;
    let { name, config } = request.body;
    const visualization_id = await idGenerator("Visualization");
    const { miceliotoken } = request.cookies;

    if (!miceliotoken) {
      return response.status(401).json({ error: "Unauthorized" });
    }

    const { sub: user_id } = decodeUserSession(miceliotoken);

    if (!game_id) {
      return response.status(400).json({ error: "Invalid game ID" });
    }

    if (!name || name.trim() === "") {
      return response
        .status(400)
        .json({ error: "Visualization name is required" });
    }

    if (!config) {
      return response.status(400).json({ error: "Invalid JSON config" });
    }

    try {
      name = name.toLowerCase();

      const registeredConfig = await knex("Visualization")
        .select("visualization_id", "name")
        .where({ user_id, game_id, name })
        .first();

      if (registeredConfig) {
        return response.status(400).json({ error: "Name already in use" });
      }

      const data = {
        visualization_id,
        user_id,
        game_id,
        name,
        config: JSON.stringify(config),
      };

      const insertVisualization = await knex("Visualization").insert(data);

      if (insertVisualization) {
        return response.status(201).json(data);
      } else {
        return response
          .status(400)
          .json({ error: "Could not insert visualization" });
      }
    } catch (e) {
      console.error("Error creating visualization:", e.message);
      return response.status(500).json({ error: e.message });
    }
  }
}

module.exports = VisualizacaoController;
