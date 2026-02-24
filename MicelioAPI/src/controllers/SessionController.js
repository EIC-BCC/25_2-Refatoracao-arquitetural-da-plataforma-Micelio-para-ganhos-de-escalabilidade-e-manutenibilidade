const knex = require("../database/connection");
const idGenerator = require("../utils/generators/idGenerator");
const {
  decodeUserSession,
} = require("../utils/generators/userSessionGenerator");

class SessionController {
  async get(request, response) {
    const { miceliotoken: userToken } = request.cookies;
    const decodedToken = decodeUserSession(userToken);

    const user_id = decodedToken.sub;

    const session_list = await knex("session")
      .select(["session_id", "name"])
      .innerJoin("haspermission as hp", "session.game_id", "hp.game_id")
      .where("session.game_id", request.params.game_id)
      .andWhere("hp.user_id", user_id);

    return response.status(200).send(session_list);
  }

async create(request, response) {
  let { 
    name, 
    language, 
    date, 
    game_stage, 
    session_group, 
    start_time,
    game_id // ✅ NOW COMES FROM BODY
  } = request.body;

  let { device_id } = request.headers; // ✅ ONLY DEVICE COMES FROM HEADER

  const end_time = null;

  if (!name) name = null;

  // ✅ EXTRA SAFETY CHECK (THIS WAS MISSING BEFORE)
  if (!game_id) {
    console.error(
      `[ERRO VALIDAÇÃO SESSÃO] Game ID ausente:\n` +
      `game_id: ${game_id}\n` +
      `body:${JSON.stringify(request.body, null, 2)}`
    );
    return response.status(400).json({ error: "Invalid game_id" });
  }

  if (!language) {
    console.error(
      `[ERRO VALIDAÇÃO SESSÃO] Não foi possível encontrar o idioma:\n` +
      `language: ${language}\n` +
      `body:${JSON.stringify(request.body, null, 2)}`
    );
    return response.status(400).json({ error: "Invalid session language" });
  }

  if (!date) {
    console.error(
      `[ERRO VALIDAÇÃO SESSÃO] Não foi possível encontrar a data:\n` +
      `date: ${date}\n` +
      `body:${JSON.stringify(request.body, null, 2)}`
    );
    return response.status(400).json({ error: "Invalid session day" });
  }

  if (!game_stage) {
    console.error(
      `[ERRO VALIDAÇÃO SESSÃO] Não foi possível encontrar a nível do jogo:\n` +
      `game_stage: ${game_stage}\n` +
      `body:${JSON.stringify(request.body, null, 2)}`
    );
    return response.status(400).json({ error: "Invalid session game stage" });
  }

  if (!start_time) {
    console.error(
      `[ERRO VALIDAÇÃO SESSÃO] Não foi possível encontrar o tempo de início do jogo:\n` +
      `start_time: ${start_time}\n` +
      `body:${JSON.stringify(request.body, null, 2)}`
    );
    return response.status(400).json({ error: "Invalid session start time" });
  }

  if (request.url === "/test") {
    return response.status(202).json({ ok: true });
  }

  const sessionId = await idGenerator("Session");
  const trx = await knex.transaction();

  try {
    const data = {
      game_id,     // ✅ NOW CORRECTLY FILLED
      device_id,
      session_id: sessionId,
      name,
      language,
      date,
      game_stage,
      start_time,
      end_time,
    };

    const session = await trx("Session").insert(data);

    if (session_group) {
      const group = await trx("SessionGroup")
        .where("session_group_id", session_group)
        .select("session_group_id")
        .first();

      if (group) {
        await trx("SessionInGroup").insert({
          session_id: sessionId,
          session_group_id: session_group,
        });
      }
    }

    if (session) {
      await trx.commit();
      return response.status(201).json({ ok: true, session_id: sessionId });
    } else {
      await trx.rollback();
      console.error("[ERRO INSERÇÃO SESSÃO] Nao foi possível inserir a sessão.");
      return response
        .status(400)
        .json({ error: "Cannot insert session, try again later" });
    }

  } catch (err) {
    await trx.rollback();
    console.error(
      `[ERRO INSERÇÃO SESSÃO] ${err.code} - ${err.sqlMessage}`
    );
    return response.status(400).json({
      error: "Cannot insert, please check the access token and the device id.",
    });
  }
}

  async update(request, response) {
    const { end_time } = request.body;

    const { game_id, device_id } = request.headers;

    if (!end_time) {
      console.error(
        `[ERRO VALIDAÇÃO FIM DE SESSÃO] Não foi possível encontrar o tempo de termino na requisição:\n` +
          `end_time: ${request.body.end_time}\n` +
          `body:${JSON.stringify(request.body, null, 2)}`
      );
      return response.status(400).json({ error: "Invalid session end time" });
    }

    if (request.url === "/test") {
      return response.status(202).json({ ok: true });
    }

    const trx = await knex.transaction();

    try {
      const { session_id } = await trx("Session")
        .where("device_id", device_id)
        .andWhere("game_id", game_id)
        .andWhere("end_time", null)
        .orderBy([
          { column: "date", order: "desc" },
          { column: "start_time", order: "desc" },
        ])
        .select("session_id")
        .first();

      if (session_id) {
        const sessionUpdated = await trx("Session")
          .update("end_time", end_time)
          .where("session_id", session_id);

        if (sessionUpdated) {
          await trx.commit();
          return response.status(201).json({ ok: true });
        } else {
          await trx.rollback();
          console.error(
            "[ERRO FINALIZAR SESSÃO] Nao foi possível finalizar sessão."
          );
          return response
            .status(400)
            .json({ error: "Cannot end session, check the information sent" });
        }
      } else {
        await trx.rollback();
        console.error(
          "[ERRO FINALIZAR SESSÃO] Nao foi possível encontrar uma sessão para finalizar."
        );
        return response
          .status(400)
          .json({ error: "You dont have any opened session" });
      }
    } catch (err) {
      await trx.rollback();
      console.error(
        `[ERRO FINALIZAR SESSÃO] Nao foi possível finalizar a sessão. ${err.code} - ${err.sqlMessage}`
      );
      return response
        .status(400)
        .json({ error: "Cannot end session, check the information sent." });
    }
  }
}

module.exports = SessionController;
