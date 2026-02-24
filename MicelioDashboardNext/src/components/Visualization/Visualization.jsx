/*import embed from "vega-embed";
import { useEffect } from "react";
import { Flex } from "@chakra-ui/react";
import Api from "../../services/Api";
import GraphicStrategy from "../../strategies/GraphicStrategy";
import { GraphFactory } from "./Graphs/graphs";

const Visualization = ({
  config,
  currentSession,
  currentGroupSession,
  activities: propsActivities
}) => {
  useEffect(() => {
    const loadData = async () => {
      console.log("🎨 Visualization loading...", {
        config,
        currentSession,
        currentGroupSession,
        propsActivities
      });

      if (!config?.graphs?.length) {
        console.log("❌ No graphs in config");
        return;
      }

      try {
        let activities = [];

        // ✅ 1. SELECT DATA SOURCE
        if (propsActivities?.length) {
          console.log("✅ Using activities from props:", propsActivities.length);
          activities = propsActivities;
        }
        else if (currentSession) {
          console.log("📡 Fetching activities for session:", currentSession);
          const response = await Api.get(`/activity/by-session/${currentSession}`);
          activities = response.data.activities || [];
        }
        else if (currentGroupSession) {
          console.log("📡 Fetching activities for group session:", currentGroupSession);
          const response = await Api.get(`/activity/by-group-session/${currentGroupSession}`);
          activities = response.data.activities || [];
        }

        // ✅ 2. FORCE NUMERIC FIELDS (CRITICAL FOR VEGA)
        activities = activities.map(a => ({
          ...a,
          time: Number(a.time),
          position_x: a.position_x !== undefined ? Number(a.position_x) : null,
          position_y: a.position_y !== undefined ? Number(a.position_y) : null,
        }));

        console.log("📊 Normalized activities:", activities.length, activities);

        const filterActivities = (names) => {
          if (!names || names.length === 0) return activities;
          const filtered = activities.filter(a => names.includes(a.name));
          console.log(`🔍 Filtered [${names.join(", ")}] ->`, filtered.length);
          return filtered;
        };

        // ✅ 3. FACTORY + STRATEGY (SAFE INIT)
        const factory = new GraphFactory({ graphs: config.graphs });
        const strategy = new GraphicStrategy(factory);

        const specs = [];

        for (const graph of config.graphs) {
          console.log("🔧 Building graph:", graph.type, graph.config);

          const safeType = graph.type?.toLowerCase();
          const build = strategy.getGraphicConstructor(safeType);

          if (!build) {
            console.warn("⚠️ No builder found for:", safeType);
            continue;
          }

          // ✅ HEATMAP SUPPORT
          if (safeType === "heatmap") {
            const imgUrl = graph.config?.image?.source || "";
            const finalUrl = imgUrl
              ? `${Api.defaults.baseURL}proxy/image?url=${encodeURIComponent(imgUrl)}`
              : "";

            if (finalUrl) {
              const img = new Image();
              img.src = finalUrl;
              img.crossOrigin = "Anonymous";
              await img.decode();

              const activityNames =
                graph.config?.activities ||
                graph.config?.activitie ||   // ✅ fallback for backend typo
                [];

              const data = filterActivities(activityNames);

              specs.push(
                build(
                  data,
                  graph.config,
                  finalUrl,
                  img.naturalWidth,
                  img.naturalHeight
                )
              );
            }
            continue;
          }

          // ✅ ALL OTHER GRAPH TYPES
          const activityNames =
            graph.config?.activities ||
            graph.config?.activitie ||   // ✅ fallback for backend typo
            [];

          const data = filterActivities(activityNames);
          const spec = build(data, graph.config);

          console.log("📈 Generated spec:", spec);
          specs.push(spec);
        }

        console.log("✨ All specs generated:", specs.length, specs);

        if (!specs.length) {
          console.warn("⚠️ No Vega specs generated!");
          return;
        }

        // ✅ 4. FINAL VEGA WRAPPER
        const finalSpec = {
          $schema: "https://vega.github.io/schema/vega-lite/v5.json",
          width: "container",
          autosize: { type: "fit", contains: "padding" },
          vconcat: specs,
        };

        console.log("🎯 FINAL VEGA SPEC:");
        console.log(JSON.stringify(finalSpec, null, 2));

        const container = document.getElementById("visualization");
        if (!container) {
          console.error("❌ Container #visualization not found!");
          return;
        }

        container.innerHTML = "";
        await embed("#visualization", finalSpec, { actions: false });
        console.log("✅ Visualization rendered successfully!");

      } catch (error) {
        console.error("💥 Error in loadData:", error);
      }
    };

    loadData();
  }, [config, currentSession, currentGroupSession, propsActivities]);

  return (
    <Flex
      id="visualization"
      w="100%"
      minH="500px"
      border="1px solid #ccc"
    />
  );
};

export default Visualization;
*/