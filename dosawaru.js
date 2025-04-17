let influencers_data = [];

document.addEventListener("DOMContentLoaded", function () {
  // Load the file
  Promise.all([d3.csv("Top_Influencers.csv")]).then(function (values) {
    console.log("Loaded Top_Influencers.csv file");
    influencers_data = values[0];

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
      isHub: false,
    }));

    // Process data to links
    const links = [];

    // Create category hubs
    const categoryHub = new Map();
    for (const node of nodes) {
      // Loop through each node
      if (!categoryHub.has(node.category)) {
        // Check if category already exists before creating a new hub
        categoryHub.set(node.category, {
          // Create a new hub for the categories
          id: `category-${node.category}`,
          name: node.category,
          isHub: true,
          score: 87.5,
        });
      }
    }

    // Combine all nodes together
    const allNodes = [...nodes, ...Array.from(categoryHub.values())];

    // Create links between influencers and their category hubs
    for (const node of nodes) {
      const hubNode = categoryHub.get(node.category);
      if (hubNode) {
        links.push({
          // Create a link between the influencer and the hub
          source: hubNode.id,
          target: node.id,
        });
      }
    }

    // Create links between each category hubs to connect them together
    const hubArray = Array.from(categoryHub.values());
    const hubLinks = hubArray.flatMap((hub, i) =>
      hubArray.slice(i + 1).map((otherHub) => ({
        source: hub.id,
        target: otherHub.id,
      }))
    );

    // Combine all links together
    const allLinks = [...links, ...hubLinks];

    // Set radius scale based on influence score
    const radiusScale = d3
      .scalePow()
      .exponent(8)
      .domain([0, d3.max(nodes, (d) => d.score)])
      .range([5, 55]);

    // Custom color set
    const pastelColors = [
      "#e29aa5",
      "#e9b76f",
      "#d3dc7c",
      "#94d3a2",
      "#90bcd1",
      "#b3a7d6",
      "#dc91c5",
      "#84d0c9",
      "#c9c48a",
      "#ddbca1",
    ];

    // Set color for category hubs
    const colorScale = d3
      .scaleOrdinal()
      .domain(categoryHub.keys())
      .range(pastelColors);

    // Create simulation
    const simulation = d3
      .forceSimulation(allNodes)
      .force(
        "link",
        d3
          .forceLink()
          .id((d) => d.id)
          .links(allLinks)
          .distance(600)
      )
      .force("charge", d3.forceManyBody().strength(-120))
      .force("center", d3.forceCenter(width / 2, height / 2));

    // Draw links
    const link = svg
      .selectAll(".link")
      .data(allLinks)
      .enter()
      .append("line")
      .attr("class", "links")
      .attr("stroke-width", 1.5)
      .attr("stroke", "grey")
      .attr("opacity", 0);

    // Draw nodes
    const node = svg
      .selectAll(".node")
      .data(allNodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("opacity", 0)
      .call(drag(simulation));

    // Shape nodes into circles (for non-hub nodes)
    node
      .append("clipPath")
      .attr("id", (d) => `clip-${d.id}`)
      .filter((d) => !d.isHub)
      .append("circle")
      .attr("r", (d) => radiusScale(d.score))
      .attr("cx", 0)
      .attr("cy", 0);

    // Shape nodes into squares (for hub nodes)
    node
      .filter((d) => d.isHub)
      .append("rect")
      .attr("class", "hub-rect")
      .attr("x", (d) => -70 / 2)
      .attr("y", (d) => -70 / 2)
      .attr("width", (d) => 70)
      .attr("height", (d) => 70)
      .attr("rx", 10)
      .attr("ry", 10)
      .attr("fill", (d) => colorScale(d.name));

    // Add borders (for non-hub nodes)
    node
      .filter((d) => !d.isHub)
      .append("circle")
      .attr("class", "highlight-ring")
      .attr("r", (d) => radiusScale(d.score) + 1)
      .attr("fill", "none")
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .attr("opacity", 0.5);

    // Add text label to hub nodes
    node
      .filter((d) => d.isHub)
      .append("text")
      .attr("class", "hub-label")
      .attr("x", 0)
      // Position text to center in the square
      .attr("y", (d) => {
        const numLines = d.name.split(" ").length;
        return numLines == 0 ? 0 : -((numLines - 1) * 4);
      })
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .attr("fill", "black")
      .selectAll("tspan")
      .data((d) => d.name.split(" "))
      .enter()
      .append("tspan")
      .attr("x", 0)
      .attr("dy", (d, i) => (i === 0 ? 0 : "1em"))
      .text((name) => name)
      .attr("pointer-events", "none");

    // Add images to nodes (excluding hubs)
    node
      .append("image")
      .attr("href", (d) => (d.isHub ? null : `profile_pics/${d.name}.jpg`))
      .attr("width", (d) => (d.isHub ? 0 : radiusScale(d.score) * 2))
      .attr("height", (d) => (d.isHub ? 0 : radiusScale(d.score) * 2))
      .attr("x", (d) => (d.isHub ? 0 : -radiusScale(d.score)))
      .attr("y", (d) => (d.isHub ? 0 : -radiusScale(d.score)))
      .attr("clip-path", (d) => (d.isHub ? null : `url(#clip-${d.id})`))
      .style("border", "4px solid white");

    // Initial draw animation
    node
      .transition()
      .duration(1200)
      .delay((d, i) => i * 10)
      .ease(d3.easeCubic)
      .attr("opacity", 1);

    link
      .data(links)
      .transition()
      .duration(2000)
      .ease(d3.easeCubic)
      .attr("opacity", 0.9);

    node
      .on("mouseover", function (event, d) {
        // Add tooltip on hover
        if (!d.isHub) {
          tooltip
            .transition()
            .duration(100)
            .ease(d3.easeCubic)
            .style("opacity", 0.9);
          tooltip
            .html(
              `<strong>${d.name}</strong><br>Followers: ${d.followers}
          <br>Category: ${d.category}<br>Influencer Score: ${d.score}`
            )
            .style("left", event.pageX + "px")
            .style("top", event.pageY + "px");
        }
        // Update the link and node border color on hover for nodes that are part of the same category
        if (d.isHub) {
          const category = d.name;
          link
            .data(links)
            .filter((l) => l.source.id === d.id || l.target.id === d.id)
            .attr("stroke", colorScale(category))
            .transition()
            .duration(250)
            .ease(d3.easeCubic)
            .attr("stroke-width", 3);

          node
            .data(allNodes)
            // Checks if at least one of the conditions is true (source to tareget or target to source)
            .filter((n) =>
              links.some(
                (l) =>
                  (l.source.id === d.id && l.target.id === n.id) ||
                  (l.target.id === d.id && l.source.id === n.id)
              )
            )
            .select(".highlight-ring")
            .transition()
            .duration(250)
            .ease(d3.easeCubic)
            .attr("r", (d) => radiusScale(d.score) + 1)
            .attr("fill", "none")
            .attr("stroke", colorScale(category))
            .attr("stroke-width", 2)
            .attr("opacity", 1);
        }
      })
      .on("mouseout", function () {
        tooltip
          .transition()
          .duration(200)
          .ease(d3.easeCubic)
          .style("opacity", 0);
        link
          .transition()
          .duration(250)
          .ease(d3.easeCubic)
          .attr("stroke", "grey")
          .attr("stroke-width", 1.5);
        node
          .selectAll(".highlight-ring")
          .transition()
          .duration(250)
          .ease(d3.easeCubic)
          .attr("stroke", "white")
          .attr("stroke-width", 2)
          .attr("opacity", 0.5);
      })
      // Open new tab to influencer Instagram page on click
      .on("click", function (event, d) {
        if (!d.isHub) {
          const url = `https://www.instagram.com/${d.name}/`;
          window.open(url, "_blank");
          console.log(url);
        }
      });

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

    // Add a small bouncing animation using d3.timer to run infinite loop
    d3.timer((time) => {
      allNodes.forEach((d) => {
        if (!d.isHub) {
          const bounceX = Math.sin(time * 0.5 + d.id.length) * 10;
          const bounceY = Math.cos(time * 0.5 + d.id.length) * 10;
          d.x += bounceX * 0.001;
          d.y += bounceY * 0.001;
        }
      });
      simulation.alpha(0.01).restart();
    });

    // Drag function
    function drag(simulation) {
      function dragestart(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }

      function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
        tooltip
          .style("left", event.subject.fx + "px")
          .style("top", event.subject.fy + 20 + "px");
      }

      function drageend(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }

      return d3
        .drag()
        .on("start", dragestart)
        .on("drag", dragged)
        .on("end", drageend);
    }
  });
});
