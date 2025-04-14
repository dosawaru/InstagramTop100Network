let influencers_data = [];

document.addEventListener("DOMContentLoaded", function () {
  // Load the file
  Promise.all([d3.csv("Top_Influencers.csv")]).then(function (values) {
    console.log("Loaded Top_Influencers.csv file");
    influencers_data = values[0];
    console.log(influencers_data);

    // Get window dimensions
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Create svg and tooltip
    const svg = d3.select("svg").attr("width", width).attr("height", height);
    const tooltip = d3.select(".tooltip");

    // Process data to nodes
    const nodes = influencers_data.map((d) => ({
      id: d.Rank,
      name: d["Channel Info"],
      followers: d.Followers,
      category: d.Category,
      likes: d["Avg. Likes"],
      score: +d["Influence Score"],
    }));

    console.log(nodes);

    // Process data to links
    const links = nodes.slice(1).map((node, index) => ({
      source: nodes[index].id,
      target: node.id,
    }));

    console.log(links);
  });
});
