const fs = require("fs");

const catalogPath = "./catalog/catalog.json";
const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));

for (let i = 984; i <= 1088; i++) {
  const ep = String(i).padStart(4, "0");
  catalog.episodes.push({
    id: `s01e${ep}`,
    title: `Episode ${i}`,
    season: 1,
    episode: i,
    description: `One Piece Episode ${i}`,
    mediaUrl: `/media/s01e${ep}.mp4`,
    subsUrl: "",
    imageUrl: `/images/s01e${ep}.jpg`,
    duration: 1440,
  });
}

fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2) + "\n");
console.log(
  `Added episodes 984-1088. Total episodes: ${catalog.episodes.length}`,
);
