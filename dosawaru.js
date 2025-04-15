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

    // Create simulation
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink()
          .id((d) => d.id)
          .links(links)
          .distance(100)
      )
      .force("charge", d3.forceManyBody().strength(-50))
      .force("center", d3.forceCenter(width / 2, height / 2));

    // Draw links
    const link = svg
      .selectAll(".link")
      .data(links)
      .enter()
      .append("line")
      .attr("class", "links")
      .attr("stroke-width", 2)
      .attr("stroke", "#999");

    // Draw nodes
    const node = svg
      .selectAll(".node")
      .data(nodes)
      .enter()
      .append("g")
      .attr("class", "node");

    // Shape nodes into circles
    node
      .append("clipPath")
      .attr("id", (d) => `clip-${d.id}`)
      .append("circle")
      .attr("r", (d) => (d.score * 4.5) / 8)
      .attr("cx", 0)
      .attr("cy", 0);

    // Add images to nodes
    node
      .append("image")
      .attr("href", (d) => {
        console.log(`profile_pics/${d.name}.jpg`);
        return `profile_pics/${d.name}.jpg`;
      })
      .attr("width", (d) => d.score * 1.5)
      .attr("height", (d) => d.score * 1.5)
      .attr("x", (d) => -(d.score * 1.5) / 2)
      .attr("y", (d) => -(d.score * 1.5) / 2)
      .attr("clip-path", (d) => `url(#clip-${d.id})`);

    simulation.on("tick", () => {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      node.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });
  });
});
