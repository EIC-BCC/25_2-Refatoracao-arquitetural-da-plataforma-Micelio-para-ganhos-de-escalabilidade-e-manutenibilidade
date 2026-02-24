const knex = require('../database/connection');
const idGenerator = require('../utils/generators/idGenerator');
const path = require('path');

class ActivityController {

	async create(request, response){

		let {activity_id, name, position_x, position_y,
				position_z, time, influenced_by, influenced_by_properties,
				properties, entities, agents } = request.body;

		const {game_id, device_id} = request.headers;

		//TODO: validação
		if (!activity_id) {
			console.error(`[ERRO VALIDAÇÃO ATIVIDADE] Não foi possível encontrar o identificador da atividade:\n`+
                          `activity_id: ${request.body.activity_id}\n`+
                          `body:${JSON.stringify(request.body, null, 2)}`);
			return response.status(400).json("Invalid activity id");
		}

		if (!name) {
			console.error(`[ERRO VALIDAÇÃO ATIVIDADE] Não foi possível encontrar o nome da atividade:\n`+
                          `name: ${request.body.name}\n`+
                          `body:${JSON.stringify(request.body, null, 2)}`);
			return response.status(400).json("Invalid activity name");
		}

		if (!time) {
			console.error(`[ERRO VALIDAÇÃO ATIVIDADE] Não foi possível encontrar o tempo da atividade:\n`+
                          `time: ${request.body.time}\n`+
                          `body:${JSON.stringify(request.body, null, 2)}`);
			return response.status(400).json("Invalid activity time");
		}

		//valida agents
		if (!agents) {
			console.error(`[ERRO VALIDAÇÃO ATIVIDADE] Não foi possível encontrar a lista de agentes:\n`+
                          `agents: ${JSON.stringify(request.body.agents, null, 2)}\n`+
                          `body:${JSON.stringify(request.body, null, 2)}`);
			return response.status(400).json("Invalid agents");
		}
		else{
			if(agents instanceof Array){
				const agentsHasProps = agents.map((agent)=>{
					if(agent.agent_id && agent.name && agent.type && agent.role){
						return true;
					}
					else{
						return false;
					}
				});
				if(agentsHasProps.indexOf(false) != -1){
					console.error(`[ERRO VALIDAÇÃO ATIVIDADE] Os agentes não estão de acordo com as regras:\n`+
                          `agents: ${JSON.stringify(request.body.agents, null, 2)}\n`+
                          `body:${JSON.stringify(request.body, null, 2)}`);
					return response.status(400).json("Invalid agents attributes, please check the following information: agent_id, name, type and role.");
				}
			}
			else{
				console.error(`[ERRO VALIDAÇÃO ATIVIDADE] Não foi possível encontrar a lista de agentes:\n`+
                          `agents: ${JSON.stringify(request.body.agents, null, 2)}\n`+
                          `body:${JSON.stringify(request.body, null, 2)}`);
				return response.status(400).json("Invalid agents");
			}
		}

		//valida entities
		if (!entities) {
			console.error(`[ERRO VALIDAÇÃO ATIVIDADE] Não foi possível encontrar a lista de entidades:\n`+
                          `entities: ${JSON.stringify(request.body.entities, null, 2)}\n`+
                          `body:${JSON.stringify(request.body, null, 2)}`);
			return response.status(400).json("Invalid entities");
		}
		else{
			if(entities instanceof Array){
				const entitesHasProps = entities.map((entity)=>{
					if(entity.entity_id && entity.name && entity.role){
						return true;
					}
					else{
						return false;
					}
				});
				if(entitesHasProps.indexOf(false) != -1){
					console.error(`[ERRO VALIDAÇÃO ATIVIDADE] As entidades não estão de acordo com as regras:\n`+
                          `entities: ${JSON.stringify(request.body.entities, null, 2)}\n`+
                          `body:${JSON.stringify(request.body, null, 2)}`);
					return response.status(400).json("Invalid entities attributes, please check the following information: entity_id, name and role.");
				}
			}
			else{
				console.error(`[ERRO VALIDAÇÃO ATIVIDADE] Não foi possível encontrar a lista de entidades:\n`+
                          `entities: ${JSON.stringify(request.body.entities, null, 2)}\n`+
                          `body:${JSON.stringify(request.body, null, 2)}`);
				return response.status(400).json("Invalid entities");
			}
		}

		if(request.url === '/test'){
			return response.status(202).json({ok: true});
		}

		//começa transação
		const trx = await knex.transaction();

        try{

			const { session_id } = await trx('Session')
            .where('device_id', device_id)
            .andWhere('game_id', game_id)
            .orderBy([{ column: 'date', order: 'desc'}, { column: 'start_time', order: 'desc' }])
            .select('session_id')
            .first();

			//desculpa
			activity_id = `${activity_id}#${session_id}`;

			const activity_data = {
				session_id,
				activity_id,
				name,
				time,
				properties: JSON.stringify(properties)
			};

			``
			const inserted_activity = await trx('Activity').insert(activity_data);

			if(position_x && position_y){

				const action_data = {
					activity_id,
					position_x,
					position_y,
					position_z
				};

				const inserted_action = await trx('Action').insert(action_data);

			}

			if(influenced_by){

				const influenced_by_id = await idGenerator('InfluencedBy', 'influenced_by');
				const influenced_by_data = {
					influenced_by_id,
					influence: influenced_by,
					influenced: activity_id,
					properties: JSON.stringify(influenced_by_properties)
				}
				const inserted_influence = await trx('InfluencedBy').insert(influenced_by_data);

			}

			let registered_agents = await knex('Agent')
			.where('agent_id', 'like', `%#${session_id}`)
			.select('agent_id');

			let registered_entities = await knex('Entity')
			.where('entity_id', 'like', `%#${session_id}`)
			.select('entity_id');

			registered_agents = registered_agents.map((row)=>{return row.agent_id});
			registered_entities = registered_entities.map((row)=>{return row.entity_id});

			let agents_to_insert = [];
			let game_characteres_to_insert = [];
			let agents_activity = [];

			let entities_to_insert = [];
			let game_objects_to_insert = [];
			let entities_activity = [];

			agents.forEach((value)=>{

				let {agent_id, name, type, role, position_x: agent_pos_x, position_y: agent_pos_y, position_z: agent_pos_z, properties: agent_properties} = value;

				agent_id = `${agent_id}#${session_id}`;


				const agent_data_activity = {
					agent_id,
					activity_id,
					role,
					position_x: agent_pos_x,
					position_y:agent_pos_y,
					position_z:agent_pos_z,
					properties: JSON.stringify(agent_properties)
				};

				if(agent_pos_x !== undefined && agent_pos_y !== undefined){
					const character_data = {
						agent_id,
						position_x: agent_pos_x,
						position_y: agent_pos_y,
						position_z: agent_pos_z
					}
					game_characteres_to_insert.push(character_data);
				}

				const agent_data = {
						agent_id,
						name,
						type,
						properties: JSON.stringify(agent_properties)
				};

				agents_to_insert.push(agent_data);
				agents_activity.push(agent_data_activity);

			});

			entities.forEach((value)=>{
				let {entity_id, name, role, position_x: entity_pos_x, position_y: entity_pos_y,  position_z: entity_pos_z, properties: entity_properties} = value;

				entity_id = `${entity_id}#${session_id}`;

				const entity_data_activity = {
					entity_id,
					activity_id,
					role,
					position_x: entity_pos_x,
					position_y: entity_pos_y,
					position_z: entity_pos_z,
					properties: JSON.stringify(entity_properties)
				};

				if(entity_pos_x !== undefined && entity_pos_y !== undefined){
					const object_data = {
						entity_id,
						position_x: entity_pos_x,
						position_y: entity_pos_y,
						position_z: entity_pos_z
					}
					game_objects_to_insert.push(object_data);
				}

				const entity_data = {
					entity_id,
					name,
					properties: JSON.stringify(entity_properties)
				};

				entities_to_insert.push(entity_data);
				entities_activity.push(entity_data_activity);
			});

			// Agents

			if(agents_to_insert.length > 0){
				const inserted_agents = await trx('Agent')
				.insert(agents_to_insert)
				.onConflict('agent_id')
  				.merge(['properties']);
			}
			else{
				const inserted_agents = -1;
			}

			if(game_characteres_to_insert.length > 0){
				const inserted_game_characters = await trx('GameCharacter')
				.insert(game_characteres_to_insert)
				.onConflict('entity_id')
  				.merge();
			}
			else{
				const inserted_game_characters = -1;
			}

			if(agents_activity.length > 0){
				const inserted_agents_activity = await trx('ActivityAgents').insert(agents_activity);
			}
			else{
				const inserted_agents_activity = -1;
			}

			// Entities

			if(entities_to_insert.length > 0){
				const inserted_entities = await trx('Entity')
				.insert(entities_to_insert)
				.onConflict('entity_id')
  				.merge(['properties']);
			}
			else{
				const inserted_entities = -1;
			}
			if(game_objects_to_insert.length > 0){
				const inserted_game_objects = await trx('GameObject')
				.insert(game_objects_to_insert)
				.onConflict('entity_id')
  				.merge();
			}
			else{
				const inserted_game_objects = -1;
			}


			if(entities_activity.length > 0){
				const inserted_entities_activity = await trx('ActivityEntities').insert(entities_activity);
			}
			else{
				const inserted_entities_activity = -1;
			}

			await trx.commit();
			return response.status(201).json({ok: 'true'});

        }
        catch(err){
            await trx.rollback();
			console.error(`[ERRO INSERÇÃO ATIVIDADE] Nao foi possível cadastrar atividade. ${err.code} - ${err.sqlMessage}`);
            return response.status(400).json({error: err});
        }

	}


	async index(request, response){
		const baseDir = path.join(__dirname, '..', '..', '..', 'Scripts', 'MicelioParser', 'Control Harvest', 'JsonConverter', 'Exports')
		return response.status(200).sendFile('sessao213.json', {root: baseDir});
	}

  //testing this out ITS A TEST
async createTestActivities(request, response) {
  const { session_id } = request.params;
  const { game_id, device_id } = request.headers;

  if (!session_id) {
    return response.status(400).json({ error: "Session ID is required" });
  }

  // Verify session exists
  try {
    const session = await knex('Session')
      .where('session_id', session_id)
      .first();

    if (!session) {
      return response.status(404).json({ error: "Session not found" });
    }

    const trx = await knex.transaction();

    try {
      // Sample activities data
      const testActivities = [
        {
          activity_id: `test_activity_001#${session_id}`,
          name: "PlayerMove",
          time: 100,
          position_x: 50,
          position_y: 30,
          properties: {}
        },
        {
          activity_id: `test_activity_002#${session_id}`,
          name: "PlayerMove",
          time: 150,
          position_x: 55,
          position_y: 35,
          properties: {}
        },
        {
          activity_id: `test_activity_003#${session_id}`,
          name: "EnemySpawn",
          time: 200,
          position_x: 80,
          position_y: 60,
          properties: {}
        },
        {
          activity_id: `test_activity_004#${session_id}`,
          name: "PlayerMove",
          time: 250,
          position_x: 60,
          position_y: 40,
          properties: {}
        },
        {
          activity_id: `test_activity_005#${session_id}`,
          name: "CollectItem",
          time: 300,
          position_x: 45,
          position_y: 25,
          properties: {}
        },
        {
          activity_id: `test_activity_006#${session_id}`,
          name: "EnemySpawn",
          time: 350,
          position_x: 70,
          position_y: 50,
          properties: {}
        },
        {
          activity_id: `test_activity_007#${session_id}`,
          name: "PlayerAttack",
          time: 400,
          position_x: 75,
          position_y: 55,
          properties: {}
        },
        {
          activity_id: `test_activity_008#${session_id}`,
          name: "EnemyDeath",
          time: 450,
          position_x: 80,
          position_y: 60,
          properties: {}
        },
        {
          activity_id: `test_activity_009#${session_id}`,
          name: "CollectItem",
          time: 500,
          position_x: 40,
          position_y: 20,
          properties: {}
        },
        {
          activity_id: `test_activity_010#${session_id}`,
          name: "UseItem",
          time: 550,
          position_x: 50,
          position_y: 30,
          properties: {}
        }
      ];

      // Insert activities
      for (const activity of testActivities) {
        await trx('Activity').insert({
          session_id,
          activity_id: activity.activity_id,
          name: activity.name,
          time: activity.time,
          properties: JSON.stringify(activity.properties)
        });

        // Insert action (position)
        if (activity.position_x && activity.position_y) {
          await trx('Action').insert({
            activity_id: activity.activity_id,
            position_x: activity.position_x,
            position_y: activity.position_y,
            
          });
        }
      }

      // Insert test agents
      const playerAgent = {
        agent_id: `player_1#${session_id}`,
        name: "Player",
        type: "human",
        properties: JSON.stringify({})
      };

      const enemyAgent = {
        agent_id: `enemy_1#${session_id}`,
        name: "Enemy",
        type: "npc",
        properties: JSON.stringify({})
      };

      await trx('Agent')
        .insert([playerAgent, enemyAgent])
        .onConflict('agent_id')
        .ignore();

      // Link agents to activities
      const agentActivities = [
        // PlayerMove activities
        { agent_id: playerAgent.agent_id, activity_id: `test_activity_001#${session_id}`, role: "player", position_x: 50, position_y: 30, properties: JSON.stringify({}) },
        { agent_id: playerAgent.agent_id, activity_id: `test_activity_002#${session_id}`, role: "player", position_x: 55, position_y: 35, properties: JSON.stringify({}) },
        { agent_id: playerAgent.agent_id, activity_id: `test_activity_004#${session_id}`, role: "player", position_x: 60, position_y: 40, properties: JSON.stringify({}) },
        
        // EnemySpawn activities
        { agent_id: enemyAgent.agent_id, activity_id: `test_activity_003#${session_id}`, role: "enemy", position_x: 80, position_y: 60, properties: JSON.stringify({}) },
        { agent_id: enemyAgent.agent_id, activity_id: `test_activity_006#${session_id}`, role: "enemy", position_x: 70, position_y: 50, properties: JSON.stringify({}) },
        
        // CollectItem activities
        { agent_id: playerAgent.agent_id, activity_id: `test_activity_005#${session_id}`, role: "player", position_x: 45, position_y: 25, properties: JSON.stringify({}) },
        { agent_id: playerAgent.agent_id, activity_id: `test_activity_009#${session_id}`, role: "player", position_x: 40, position_y: 20, properties: JSON.stringify({}) },
        
        // PlayerAttack
        { agent_id: playerAgent.agent_id, activity_id: `test_activity_007#${session_id}`, role: "player", position_x: 75, position_y: 55, properties: JSON.stringify({}) },
        
        // EnemyDeath
        { agent_id: enemyAgent.agent_id, activity_id: `test_activity_008#${session_id}`, role: "enemy", position_x: 80, position_y: 60, properties: JSON.stringify({}) },
        
        // UseItem
        { agent_id: playerAgent.agent_id, activity_id: `test_activity_010#${session_id}`, role: "player", position_x: 50, position_y: 30, properties: JSON.stringify({}) }
      ];

      await trx('ActivityAgents').insert(agentActivities);

      // Insert test entities
      const healthPotion = {
        entity_id: `health_potion_1#${session_id}`,
        name: "Health Potion",
        properties: JSON.stringify({})
      };

      const sword = {
        entity_id: `sword_1#${session_id}`,
        name: "Sword",
        properties: JSON.stringify({})
      };

      await trx('Entity')
        .insert([healthPotion, sword])
        .onConflict('entity_id')
        .ignore();

      // Link entities to CollectItem activities
      const entityActivities = [
        { entity_id: healthPotion.entity_id, activity_id: `test_activity_005#${session_id}`, role: "item", position_x: 45, position_y: 25, properties: JSON.stringify({}) },
        { entity_id: sword.entity_id, activity_id: `test_activity_009#${session_id}`, role: "item", position_x: 40, position_y: 20, properties: JSON.stringify({}) }
      ];

      await trx('ActivityEntities').insert(entityActivities);

      await trx.commit();

      return response.status(201).json({ 
        ok: true, 
        message: `Successfully created ${testActivities.length} test activities for session ${session_id}` 
      });

    } catch (err) {
      await trx.rollback();
      console.error('[ERRO TEST ACTIVITIES]', err);
      return response.status(500).json({ error: err.message });
    }

  } catch (err) {
    console.error('[ERRO TEST ACTIVITIES]', err);
    return response.status(500).json({ error: err.message });
  }
}
//it ends here oooo

//2nd Test ITS A TEST
async deleteTestActivities(request, response) {
  const { session_id } = request.params;

  try {
    const trx = await knex.transaction();

    try {
      // Delete in correct order (foreign key constraints)
      await trx('ActivityAgents')
        .whereIn('activity_id', function() {
          this.select('activity_id')
            .from('Activity')
            .where('session_id', session_id)
            .andWhere('activity_id', 'like', `test_activity_%`);
        })
        .del();

      await trx('ActivityEntities')
        .whereIn('activity_id', function() {
          this.select('activity_id')
            .from('Activity')
            .where('session_id', session_id)
            .andWhere('activity_id', 'like', `test_activity_%`);
        })
        .del();

      await trx('Action')
        .whereIn('activity_id', function() {
          this.select('activity_id')
            .from('Activity')
            .where('session_id', session_id)
            .andWhere('activity_id', 'like', `test_activity_%`);
        })
        .del();

      await trx('Activity')
        .where('session_id', session_id)
        .andWhere('activity_id', 'like', `test_activity_%`)
        .del();

      await trx.commit();

      return response.status(200).json({ 
        ok: true, 
        message: `Deleted test activities for session ${session_id}` 
      });

    } catch (err) {
      await trx.rollback();
      throw err;
    }

  } catch (err) {
    console.error('[ERRO DELETE TEST ACTIVITIES]', err);
    return response.status(500).json({ error: err.message });
  }
}
//IT ENDS BEFORE THE CLOSSING KEY 
}

    


module.exports = ActivityController;
