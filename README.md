# Interactive Instagram Influencer Network  

This project visualizes the **top 100 Instagram influencers** using a **force-directed network graph** built with D3.js. Each influencer is represented as a node with their profile picture, connected to category hubs that represent their influencer type.  

The visualization allows users to explore influencer relationships and categories interactively with hover details, clickable links, and draggable nodes. A subtle animation keeps the layout dynamically shifting for a more engaging experience.  

## Features  
- **Force-Directed Network** layout of influencers and categories  
- **Nodes**:  
  - Influencers displayed with profile pictures  
  - Node size reflects **influence score**  
  - Node color indicates **category**  
- **Edges**: Connections between category hubs and influencers  
- **Interactivity**:  
  - Hover → View influencer details  
  - Click → Open influencer’s Instagram page  
  - Drag → Rearrange nodes  
  - Animated subtle motion keeps network moving  

## Visual Encodings  
- **Marks**: Circles (nodes), lines (edges), text (labels)  
- **Channels**:  
  - Size → Influence score  
  - Color → Influencer category  
  - Shape → Influencers vs. category hubs
    
## Dataset  
- Source: [Kaggle – Top 200 Instagram Influencers](https://www.kaggle.com/datasets/whenamancodes/top-200-influencers-crushing-on-instagram)  
- Used Top 100 influencers subset  
- Dataset modified to include refined categories  
- Profile pictures scraped via a Python script  

## Demo & Screenshot  
<img width="1902" height="853" alt="image" src="https://github.com/user-attachments/assets/88cff2f3-2ebd-4d64-992b-fa230d0b8422" />

https://github.com/user-attachments/assets/c6fcbd45-afa2-417b-afd6-a15795fccd51

## Tech Stack  
- **D3.js** – for force-directed graph layout and interactivity  
- **Python** – for preprocessing dataset and scraping profile pictures  
- HTML, CSS, JavaScript  

## Test it yourself
https://dosawaru.github.io/InstagramTop100Network/
