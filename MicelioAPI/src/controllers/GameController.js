const {sign}  = require('jsonwebtoken');
const idGenerator = require('../utils/generators/idGenerator');
const { decodeUserSession } = require('../utils/generators/userSessionGenerator')
const knex = require('../database/connection');

class GameController{

  async index(request, response){
    const {game_id} = request.params;
    const {miceliotoken: userToken} = request.cookies;

    if(!userToken) {
      return response.status(401).send()
    }

    const decodedToken = decodeUserSession(userToken);

    const user_id = decodedToken.sub;
    
    

    const game = await knex('Game as g')
      .select('g.token', 'g.name', 'g.version', 'hp.user_id', 'hp.owner', 'mu.username', 'hp.has_permission_id')
      .innerJoin('HasPermission as hp', 'hp.game_id', 'g.game_id')
      .innerJoin("MicelioUser as mu", 'mu.user_id', 'hp.user_id')
      .where('g.game_id', game_id)
      .andWhere('hp.user_id', user_id).first();
      //TODO: desculpa, precisa ajustar a tabela de haspermission
      // remover coluna "owner", adicionar "user_id" na tabela de game (criador do jogo)
      // paz

    if(!game){
      return response.status(400).json({error: "Game not found"});
    }

    const gameOwner = await knex('Game as g')
      .select('user.username')
      .innerJoin('HasPermission as hp', 'hp.game_id', 'g.game_id')
      .innerJoin('MicelioUser as user', 'user.user_id', 'hp.user_id')
      .where("hp.owner", '1')
      .andWhere('g.game_id', game_id).first();

    if(!game.owner) {
      delete game.token;
    }

    game.username = gameOwner.username; //todo:4 perdão, carreira

    // const game_groups = await knex('SessionGroup as sg')
    //   .select('sg.session_group_id', 'sg.it_ends', 'sg.name')
    //   .innerJoin('SessionInGroup as sig', 'sig.session_group_id','sg.session_group_id')
    //   .where('sg.has_permission_id', game.has_permission_id)
    //   .groupBy('sg.session_group_id', 'sg.name', 'sg.it_ends');
    // // //todo: please help


    const game_groups = await knex('SessionGroup as sg')
      .select('sg.session_group_id', 'sg.it_ends', 'sg.name')
      .count('sig.session_group_id as total_sessions')
      .innerJoin('HasPermission as hp', 'hp.has_permission_id', 'sg.has_permission_id')
      .innerJoin('Game as game', 'game.game_id', 'hp.game_id')
      .leftJoin('SessionInGroup as sig', 'sg.session_group_id', 'sig.session_group_id')
      .groupBy('sg.session_group_id')
      .where('sg.has_permission_id', game.has_permission_id);


    return response.json({game, groups: game_groups});
  }

  async get(request, response) {
    const {miceliotoken: userToken} = request.cookies
    if(!userToken) {
      return response.status(401).send()
    }
    const decodedToken = decodeUserSession(userToken)

    const user_id = decodedToken.sub;

    const ownUserGames = await knex('Game as g')
      .select('g.*', knex.raw('TRUE as is_owner'))
      .innerJoin('HasPermission as hp', 'hp.game_id', 'g.game_id')
      .where('hp.user_id', user_id)
      .andWhere('hp.owner', true);

    const sharedUserGames = await knex('Game as g')
      .select('g.game_id', 'g.name', 'g.version', knex.raw('FALSE as is_owner'),  knex.raw('TRUE as is_shared'))
      .innerJoin('HasPermission as hp', 'hp.game_id', 'g.game_id')
      .where('hp.user_id', user_id)
      .andWhere('hp.owner', false);

    const allUserGames = [...ownUserGames, ...sharedUserGames];
    const allUserGamesId = allUserGames.map( game => game.game_id)


    const groupsCreatedByGame = await knex('SessionGroup as sg')
      .innerJoin('HasPermission as hp','sg.has_permission_id','hp.has_permission_id')
      .innerJoin('Game as g','g.game_id', 'hp.game_id')
      .select('g.game_id')
      .where('hp.user_id', user_id)
      .groupBy('g.game_id')
      .count('sg.session_group_id as groups_created');

    const sessionByGame = await knex('Session as s')
      .innerJoin('Game as g', 's.game_id', 'g.game_id')
      .select('g.game_id')
      .whereIn('g.game_id',allUserGamesId)
      .andWhere('s.end_time', null)
      .count('s.session_id as active_sessions')
      .groupBy('g.game_id')

    const userGames = allUserGames.map((game)=>{

        const groupsCreated = groupsCreatedByGame.find(g => g.game_id === game.game_id);
        const totalActiveSessions = sessionByGame.find(g => g.game_id === game.game_id);

        return {
          ...game,
          groups_created: (groupsCreated)?groupsCreated.groups_created:0,
          active_sessions: (totalActiveSessions)?totalActiveSessions.active_sessions:0
        }

    });

    response.json({ok: true, data: userGames})
  }

	async create(request, response){

        const {name, version} = request.body;
        const { miceliotoken } = request.cookies

        if(!miceliotoken) {
          return response.status(401).send()
        }

        if(!version){
            return response.status(400).json({error: "Missing game version"});
        }

        if(!name){
            return response.status(400).json({error: "Missing game name"});
        }

        const { sub: user_id } = decodeUserSession(miceliotoken)

        if(!user_id){
            return response.status(400).json({error: "Missing game user id"});
        }

        //TODO: receber o id do usuário e setar a permissão do usuario
        const gameId = await idGenerator('Game');
        const token = sign({}, process.env.JWT_SECRET, {subject: gameId});

        const trx = await knex.transaction();

        try{

            const user = await trx('MicelioUser')
            .where('user_id', user_id)
            .select('user_id')
            .first();


            if(!user){
                return response.status(400).json({error: "Invalid user id"});
            }

            const insetedGame = await trx('Game')
            .where('name', name)
            .andWhere('version', version)
            .select('game_id')
            .first();

            if(insetedGame){
                return response.status(400).json({error: "This game already exists"});
            }

            const gameData = {
                game_id: gameId,
                token,
                name,
                version
            }

            const game = await trx('Game').insert(gameData);

            const has_permission_id = await idGenerator('HasPermission', 'has_permission');

            const permissionData = {
                has_permission_id,
                user_id,
                game_id: gameId,
                owner: true
            }

            const gamePermission = await trx('HasPermission').insert(permissionData);

            if(game && gamePermission){
                await trx.commit();
                return response.status(201).json({ok: true});
            }
            else{
                await trx.rollback();
                return response.status(400).json({error: 'Cannot insert the game, check the information sent'});
            }
        }
        catch(err){
            await trx.rollback();
            return response.status(400).json({error: 'Cannot insert the game, try again later'});
        }

    }


    async deleteGame(req, res) {
      const { id } = req.params;
  
      try {
          // Step 1: Delete dependent records in haspermission
          await knex('haspermission').where({ game_id: id }).del();
          
          // Step 2: Delete the game
          const result = await knex('Game').where({ game_id: id }).del();
  
          if (result) {
              return res.status(200).json({ message: 'Game deleted successfully' });
          } else {
              return res.status(404).json({ message: 'Game not found' });
          }
      } catch (error) {
          console.error(error);
          return res.status(500).json({ message: 'An error occurred while deleting the game' });
      }
  }
  


}


module.exports = GameController;
