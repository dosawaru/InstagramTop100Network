let influencers_data = [];

document.addEventListener("DOMContentLoaded", function () {
  // Load the file
  Promise.all([d3.csv("Top_Influencers.csv")]).then(function (values) {
    console.log("Loaded Top_Influencers.csv file");
    influencers_data = values[0];
    console.log(influencers_data);
  });
});
