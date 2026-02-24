const DEFAULT_SCREEN_WIDTH = 800;

const clone = (obj) => JSON.parse(JSON.stringify(obj));

const getPopulation = (sessionObj, agentsNameList, entitiesNameList, activitiesMap) => {
  const sessionActivities = Array.isArray(sessionObj)
    ? sessionObj
    : sessionObj.activities || [];

  var agentsList = {};
  var entitiesList = {};
  var population = [];

  if (Array.isArray(agentsNameList)) {
    agentsNameList.forEach((a) => (agentsList[a] = 0));
  } else {
    agentsNameList = [];
  }

  if (Array.isArray(entitiesNameList)) {
    entitiesNameList.forEach((e) => (entitiesList[e] = 0));
  } else {
    entitiesNameList = [];
  }

  const includeList = activitiesMap.insert || [];
  const excludeList = activitiesMap.remove || [];

  for (let activity of sessionActivities) {
    // INSERT LOGIC
    if (includeList.some((a) => a.name === activity.name)) {
      const activityAux = includeList.find((a) => a.name === activity.name);

      // AGENTS
      for (let agent of activity.agents || []) {
        if (agentsNameList.includes(agent.name)) {
          if (!activityAux.role || activityAux.role.includes(agent.role)) {
            agentsList[agent.name]++;
            population.push(
              clone({
                time: activity.time,
                agent: agent.name,
                quantity: agentsList[agent.name],
                type: "agent",
              })
            );
          }
        }
      }

      // ENTITIES
      for (let entity of activity.entities || []) {
        if (entitiesNameList.includes(entity.name)) {
          if (!activityAux.role || activityAux.role.includes(entity.role)) {
            entitiesList[entity.name]++;
            population.push(
              clone({
                time: activity.time,
                agent: entity.name,
                quantity: entitiesList[entity.name],
                type: "entity",
              })
            );
          }
        }
      }
    }

    // REMOVE LOGIC
    if (excludeList.some((a) => a.name === activity.name)) {
      const activityAux = excludeList.find((a) => a.name === activity.name);

      for (let agent of activity.agents || []) {
        if (agentsNameList.includes(agent.name)) {
          if (!activityAux.role || activityAux.role.includes(agent.role)) {
            agentsList[agent.name]--;
            population.push(
              clone({
                time: activity.time,
                agent: agent.name,
                quantity: agentsList[agent.name],
                type: "agent",
              })
            );
          }
        }
      }

      for (let entity of activity.entities || []) {
        if (entitiesNameList.includes(entity.name)) {
          if (!activityAux.role || activityAux.role.includes(entity.role)) {
            entitiesList[entity.name]--;
            population.push(
              clone({
                time: activity.time,
                agent: entity.name,
                quantity: entitiesList[entity.name],
                type: "entity",
              })
            );
          }
        }
      }
    }
  }
  return population;
};

export class GraphFactory {
  constructor(visualizationConfig = {}) {
    this.visualizationConfig = visualizationConfig;
    this.screenWidth =
      visualizationConfig.screen_width || DEFAULT_SCREEN_WIDTH;
  }

  // =====================================================
  //  BAR GRAPH  (NEW)
  // =====================================================
  GetBar(activities, graphConfig = {}) {
    const width = graphConfig.width || this.screenWidth;
    const height = graphConfig.height || 300;

    return {
      $schema: "https://vega.github.io/schema/vega-lite/v5.json",
      description: "Bar Chart",
      data: { values: activities || [] },
      mark: "bar",
      encoding: {
        x: {
          field: graphConfig.x || "name",
          type: "nominal",
        },
        y: {
          field: graphConfig.y || "score",
          type: "quantitative",
        },
        color: {
          field: graphConfig.color || "name",
          type: "nominal",
        },
        tooltip: [
          { field: graphConfig.x || "name" },
          { field: graphConfig.y || "score" },
        ],
      },
      width,
      height,
    };
  }

  // =====================================================
  //  TIMELINE
  // =====================================================
  GetTimeline(activities, graphConfig = {}) {
    const filtered = activities.filter((a) =>
      (graphConfig.activities || []).includes(a.name)
    );

    return {
      $schema: "https://vega.github.io/schema/vega-lite/v5.json",
      mark: "area",
      data: { values: filtered },
      encoding: {
        x: { field: "time", type: "quantitative" },
        y: { aggregate: "count" },
        color: { field: "name", type: "nominal" },
      },
      width: graphConfig.width || this.screenWidth,
      height: graphConfig.height || 40,
    };
  }

  // =====================================================
  //  CIRCLE CHART
  // =====================================================
  GetActivitiesCircle(activities, graphConfig = {}) {
    return {
      $schema: "https://vega.github.io/schema/vega-lite/v5.json",
      mark: { type: "circle", tooltip: true },
      data: { values: activities },
      encoding: {
        y: {
          field: "name",
          type: "nominal",
          sort: graphConfig.activitiesList,
        },
        x: {
          field: "time",
          type: "quantitative",
          bin: { maxbins: graphConfig.circle_bins || 20 },
        },
        size: { aggregate: "count" },
        color: { field: "name", type: "nominal" },
      },
      width: graphConfig.width || this.screenWidth,
      height: graphConfig.height || 400,
    };
  }

  // =====================================================
  //  HEATMAP
  // =====================================================
  GetHeatMap(activities, graphConfig = {}, imageUrl, imgW, imgH) {
    const filtered = activities.filter((a) =>
      (graphConfig.activities || []).includes(a.name)
    );

    return {
      $schema: "https://vega.github.io/schema/vega-lite/v5.json",
      mark: { type: "rect", tooltip: true },
      data: { values: filtered },
      encoding: {
        x: { field: "position_x", type: "quantitative", bin: { maxbins: 20 } },
        y: {
          field: "position_y",
          type: "quantitative",
          bin: { maxbins: 20 },
          sort: "descending",
        },
        color: { aggregate: "count", type: "quantitative" },
      },
      width: graphConfig.width || imgW / 2,
      height: graphConfig.height || imgH / 3,
    };
  }

  // =====================================================
  //  POPULATION
  // =====================================================
  GetPopulation(activities, graphConfig = {}) {
    const pop = getPopulation(
      { activities },
      graphConfig.agents || [],
      graphConfig.entities || [],
      {
        insert: graphConfig.insert || [],
        remove: graphConfig.remove || [],
      }
    );

    return {
      $schema: "https://vega.github.io/schema/vega-lite/v5.json",
      mark: { type: "line", interpolate: "step", point: true },
      data: { values: pop },
      encoding: {
        x: { field: "time", type: "quantitative" },
        y: { field: "quantity", type: "quantitative" },
        color: { field: "agent", type: "nominal" },
      },
      width: graphConfig.width || this.screenWidth,
    };
  }
}

export default GraphFactory;
