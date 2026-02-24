/*export default class GraphicStrategy {
  constructor(graphicFactory) {
    this.graphicFactory = graphicFactory;
  }

  getGraphicConstructor(graphicType) {
    return {
      Timeline: this.graphicFactory.GetTimeline.bind(this.graphicFactory),
      ActivityList: this.graphicFactory.GetActivitiesCircle.bind(this.graphicFactory),
      HeatMap: this.graphicFactory.GetHeatMap.bind(this.graphicFactory),
      Population: this.graphicFactory.GetPopulation.bind(this.graphicFactory),
    }[graphicType];
  }
}
  */

// I implemented the code below. The above code came witht the project

export default class GraphicStrategy {
  constructor(graphicFactory) {
    this.graphicFactory = graphicFactory;
  }

  getGraphicConstructor(graphicType) {
    // Normalize to lowercase for comparison
    const type = graphicType.toLowerCase();
    
    const mapping = {
      timeline: this.graphicFactory.GetTimeline.bind(this.graphicFactory),
      circle: this.graphicFactory.GetActivitiesCircle.bind(this.graphicFactory),
      activitylist: this.graphicFactory.GetActivitiesCircle.bind(this.graphicFactory),
      heatmap: this.graphicFactory.GetHeatMap.bind(this.graphicFactory),
      population: this.graphicFactory.GetPopulation.bind(this.graphicFactory),
      bar: this.graphicFactory.GetBar.bind(this.graphicFactory),
    };
    
    return mapping[type];
  }
}
