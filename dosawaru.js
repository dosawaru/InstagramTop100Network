let influencers_data = [];

document.addEventListener("DOMContentLoaded", function () {
  // Load the file
  Promise.all([d3.csv("Top_Influencers.csv")]).then(function (values) {
    console.log("Loaded Top_Influencers.csv file");
    influencers_data = values[0];
    console.log(influencers_data);

    // Get window dimensions
    const headerHeight = document.querySelector("#header").offsetHeight;
    const width = window.innerWidth;
    const padding = 20;
    const height = window.innerHeight - headerHeight - padding;

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

    const radiusScale = d3
      .scalePow()
      .exponent(8)
      .domain([70, d3.max(nodes, (d) => d.score)])
      .range([5, 65]);

    // Create simulation
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink()
          .id((d) => d.id)
          .links(links)
          .distance(200)
      )
      .force("charge", d3.forceManyBody().strength(-70))
      .force("center", d3.forceCenter(width / 2, height / 2));

    // Draw links
    const link = svg
      .selectAll(".link")
      .data(links)
      .enter()
      .append("line")
      .attr("class", "links")
      .attr("stroke-width", 1)
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
      .attr("r", (d) => radiusScale(d.score))
      .attr("cx", 0)
      .attr("cy", 0);

    // Add images to nodes
    node
      .append("image")
      .attr("href", (d) => {
        console.log(`profile_pics/${d.name}.jpg`);
        return `profile_pics/${d.name}.jpg`;
      })
      .attr("width", (d) => radiusScale(d.score) * 2)
      .attr("height", (d) => radiusScale(d.score) * 2)
      .attr("x", (d) => -radiusScale(d.score))
      .attr("y", (d) => -radiusScale(d.score))
      .attr("clip-path", (d) => `url(#clip-${d.id})`)
      .style("border", "1px solid white");

    // Dynamically update the positions of the nodes/links and keep nodes within the window bounds
    simulation.on("tick", () => {
      node.attr("transform", (d) => {
        d.x = Math.max(
          padding + radiusScale(d.score) / 2,
          Math.min(width - radiusScale(d.score), d.x)
        );
        d.y = Math.max(
          headerHeight / 2 + radiusScale(d.score) / 2,
          Math.min(height - radiusScale(d.score), d.y)
        );
        return `translate(${d.x},${d.y})`;
      });

      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);
    });
  });
});
