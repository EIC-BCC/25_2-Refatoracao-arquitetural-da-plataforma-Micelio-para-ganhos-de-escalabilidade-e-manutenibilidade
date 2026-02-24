const knex = require("../database/connection");
const idGenerator = require("../utils/generators/idGenerator");
const {
  decodeUserSession,
} = require("../utils/generators/userSessionGenerator");

class VisualizationGroupController {
  
  // GET all visualization groups for a game
  async index(request, response) {
    const { miceliotoken } = request.cookies;
    if (!miceliotoken) {
      return response.status(401).send();
    }

    const { sub: user_id } = decodeUserSession(miceliotoken);
    const { game_id } = request.params;

    try {
      const visualizationGroups = await knex("visualizationgroup")
        .select("*")
        .where("user_id", user_id)
        .andWhere("game_id", game_id)
        .orderBy("created_at", "desc");

      return response.status(200).json(visualizationGroups);
    } catch (e) {
      console.error("Error fetching visualization groups:", e);
      return response.status(500).json({ error: "Cannot get visualization groups" });
    }
  }

  // GET sessions in a visualization group
  async getSessions(request, response) {
    const { miceliotoken } = request.cookies;
    if (!miceliotoken) {
      return response.status(401).send();
    }

    const { visualization_group_id } = request.params;

    try {
      const sessions = await knex("sessioninvisualizationgroup as svig")
        .select("session.*")
        .join("session", "session.session_id", "svig.session_id")
        .where("svig.visualizationgroup_id", visualization_group_id);

      return response.status(200).json(sessions);
    } catch (e) {
      console.error("Error fetching sessions for group:", e);
      return response.status(500).json({ error: "Cannot get sessions" });
    }
  }

  // ADD session to visualization group
  async addSession(request, response) {
    const { miceliotoken } = request.cookies;
    if (!miceliotoken) {
      return response.status(401).json({ error: "Unauthorized" });
    }

    const { visualization_group_id } = request.params;
    const { session_id } = request.body;

    if (!session_id) {
      return response.status(400).json({ error: "Session ID is required" });
    }

    try {
      await knex("sessioninvisualizationgroup").insert({
        visualizationgroup_id: visualization_group_id,
        session_id: session_id,
      });

      return response.status(201).json({ ok: true });
    } catch (e) {
      console.error("Error adding session to group:", e);
      return response.status(500).json({ error: "Cannot add session to group" });
    }
  }

  // REMOVE session from visualization group
  async removeSession(request, response) {
    const { miceliotoken } = request.cookies;
    if (!miceliotoken) {
      return response.status(401).json({ error: "Unauthorized" });
    }

    const { visualization_group_id, session_id } = request.params;

    try {
      await knex("sessioninvisualizationgroup")
        .where({ visualizationgroup_id: visualization_group_id, session_id })
        .delete();

      return response.status(200).json({ ok: true });
    } catch (e) {
      console.error("Error removing session from group:", e);
      return response.status(500).json({ error: "Cannot remove session from group" });
    }
  }

  // CREATE a new visualization group
  async create(request, response) {
    const { game_id } = request.params;
    let { name, description } = request.body;
    const { miceliotoken } = request.cookies;

    console.log('=== CREATE VISUALIZATION GROUP ===');
    console.log('game_id:', game_id);
    console.log('name:', name);
    console.log('description:', description);
    console.log('has token:', !!miceliotoken);

    if (!miceliotoken) {
      console.log('ERROR: No token');
      return response.status(401).json({ error: "Unauthorized" });
    }

    const { sub: user_id } = decodeUserSession(miceliotoken);
    console.log('user_id:', user_id);

    if (!game_id) {
      console.log('ERROR: No game_id');
      return response.status(400).json({ error: "Invalid game ID" });
    }

    if (!name || name.trim() === "") {
      console.log('ERROR: No name');
      return response.status(400).json({ error: "Group name is required" });
    }

    try {
      // Generate a simple random ID similar to GroupController pattern
      const visualizationgroup_id = `vg_${Math.round(Math.random() * 1000000)}`;
      name = name.toLowerCase();

      console.log('Generated ID:', visualizationgroup_id);
      console.log('Checking for existing group...');

      // Check if name already exists for this user/game
      const existingGroup = await knex("visualizationgroup")
        .select("visualizationgroup_id", "name")
        .where({ user_id, game_id, name })
        .first();

      console.log('Existing group:', existingGroup);

      if (existingGroup) {
        console.log('ERROR: Name already in use');
        return response.status(400).json({ error: "Name already in use" });
      }

      const data = {
        visualizationgroup_id: visualizationgroup_id,
        user_id,
        game_id,
        name,
        description: description || null,
      };

      console.log('Data to insert:', data);

      const insertResult = await knex("visualizationgroup").insert(data);

      console.log('Insert result:', insertResult);

      if (insertResult) {
        console.log('SUCCESS: Group created');
        // Return data without the knex.fn.now() object
        return response.status(201).json({
          visualizationgroup_id,
          user_id,
          game_id,
          name,
          description: description || null,
        });
      } else {
        console.log('ERROR: Insert failed');
        return response.status(400).json({ error: "Could not create visualization group" });
      }
    } catch (e) {
      console.error("EXCEPTION creating visualization group:", e);
      console.error("Error message:", e.message);
      console.error("Error stack:", e.stack);
      return response.status(500).json({ error: e.message });
    }
  }
}

module.exports = VisualizationGroupController;