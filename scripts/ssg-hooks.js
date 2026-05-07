/**
 * This script allows us to launch build of showcase app whenever
 * content updates
 */
const express = require("express");
const { exec } = require("child_process");

const app = express();
app.use(express.json());

let buildTimer = null; // Timer pour décaler le build
const debounceTime = 5000; // 5 secondes d'attente après la dernière mise à jour

function buildApp() {
  exec("npm run swc:build", (err, stdout, stderr) => {
    if (err) {
      console.error(`Erreur lors du build: ${stderr}`);
      return res.status(500).send("Erreur lors du build");
    }
    console.log(`Build réussi : ${stdout}`);
  });
}

app.post("/strapi-webhook", (req, res) => {
  console.log("Webhook received:", req.body);
  if (buildTimer) {
    clearTimeout(buildTimer);
    console.log("Build annulé, un autre webhook est arrivé.");
  }

  buildTimer = setTimeout(() => {
    buildApp();
  }, debounceTime);

  res.status(200).send("Build lancé");
});

const port = 3000;
app.listen(port, () => {
  console.log(`Serveur en écoute sur le port ${port}`);
});
