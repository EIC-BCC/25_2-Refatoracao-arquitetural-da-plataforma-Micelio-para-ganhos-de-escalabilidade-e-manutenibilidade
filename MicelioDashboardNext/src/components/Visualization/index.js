/*import * as vl from 'vega-lite-api';
import embed from 'vega-embed';
import { useEffect } from 'react';
import { Flex } from '@chakra-ui/react';
import { GraphFactory } from './Graphs/graphs';
import GraphicStrategy from '../../strategies/GraphicStrategy';

const Visualization = ({ activities, config }) => {
  useEffect(() => {
    if (!config || !config.graphs || !activities) return;

    const graphicStrategy = new GraphicStrategy(new GraphFactory(config));
    const graphicsList = [];

    for (const graph of config.graphs) {
      const graphicsFunction = graphicStrategy.getGraphicConstructor(graph.type);
      if (typeof graphicsFunction === 'function') {
        graphicsList.push(graphicsFunction(activities, graph));
      }
    }

    const visualization = vl.vconcat(graphicsList);

    embed('#visualization', JSON.parse(visualization));
  }, [activities, config]);

  return (
    <>
      <Flex id={'visualization'}></Flex>
    </>
  );
};

export default Visualization;

*/



//this is my created code below. The commented code above is the original code that came with the project.

import embed from "vega-embed";
import { useEffect } from "react";
import { Flex } from "@chakra-ui/react";
import Api from "../../services/Api";
import GraphicStrategy from "../../strategies/GraphicStrategy";
import { GraphFactory } from "./Graphs/graphs";

const Visualization = ({ config, currentSession, currentGroupSession }) => {
  useEffect(() => {
    const loadData = async () => {
      console.log('🎨 Visualization component mounted', { config, currentSession, currentGroupSession });
      
      if (!config?.graphs?.length) {
        console.log('❌ No graphs in config');
        return;
      }

      try {
        // Fetch activities - use the visualization endpoint that returns full session data
        let activities = [];
        
        if (currentSession) {
          console.log('📡 Fetching activities for session:', currentSession);
          
          // Try the by-session endpoint first
          try {
            const response = await Api.get(`/activity/by-session/${currentSession}`);
            activities = response.data.activities || [];
          } catch (err) {
            // If that fails, try the visualization endpoint
            console.log('Trying visualization endpoint instead...');
            const response = await Api.get(`/visualization/session/${currentSession}`);
            activities = response.data.activities || [];
          }
        } else if (currentGroupSession) {
          const response = await Api.get(`/activity/by-group-session/${currentGroupSession}`);
          activities = response.data.activities || [];
        }

        console.log('✅ Activities loaded:', activities.length, activities);

        const filterActivities = (names) => {
          if (!names || names.length === 0) return activities;
          return activities.filter((a) => names.includes(a.name));
        };

        const factory = new GraphFactory(config);
        const strategy = new GraphicStrategy(factory);
        const specs = [];

        for (const graph of config.graphs) {
          console.log('🔧 Building graph:', graph.type, graph);
          
          const build = strategy.getGraphicConstructor(graph.type);
          if (!build) {
            console.warn('⚠️ No builder found for graph type:', graph.type);
            continue;
          }

          if (graph.type === "heatmap" || graph.type === "HeatMap") {
            const imgUrl = graph.image?.source || "";
            const finalUrl = imgUrl
              ? `${Api.defaults.baseURL}proxy/image?url=${encodeURIComponent(imgUrl)}`
              : "";
            
            if (finalUrl) {
              const img = new Image();
              img.src = finalUrl;
              img.crossOrigin = "Anonymous";
              await img.decode();
              const data = filterActivities(graph.config?.activities || []);
              specs.push(
                build(data, graph.config, finalUrl, img.naturalWidth, img.naturalHeight)
              );
            } else {
              const data = filterActivities(graph.config?.activities || []);
              specs.push(build(data, graph.config, "", 800, 600));
            }
            continue;
          }

          // For other graph types (bar, timeline, circle, population)
          const data = filterActivities(graph.config?.activities || []);
          console.log('📊 Graph data:', graph.type, 'activities:', data.length);
          specs.push(build(data, graph.config));
        }

        console.log('📈 Total specs generated:', specs.length, specs);

        if (specs.length === 0) {
          console.warn('⚠️ No specs to render');
          return;
        }

        const finalSpec = {
          $schema: "https://vega.github.io/schema/vega-lite/v5.json",
          vconcat: specs,
        };

        console.log('🎯 Final Vega spec:', finalSpec);

        const container = document.getElementById("visualization");
        if (container) {
          container.innerHTML = "";
          console.log('📦 Embedding visualization...');
          await embed("#visualization", finalSpec);
          console.log('✨ Visualization embedded successfully!');
        } else {
          console.error('❌ Container #visualization not found');
        }
      } catch (error) {
        console.error('💥 Error in loadData:', error);
      }
    };

    loadData();
  }, [config, currentSession, currentGroupSession]);

  return <Flex id="visualization" w="100%" minH="400px" />;
};

export default Visualization;



/*for fake real time check
 
 activities = activities.map(a => ({
  ...a,
  time: new Date(2025, 1, 25, 0, 0, a.time) // fake real clock using seconds
}));
*/