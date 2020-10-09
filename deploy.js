var fs = require("fs");
var path = require("path");
var cp = require("child_process");

// Deploy
var lib = path.resolve(__dirname, "functions/");
fs.readdirSync(lib).forEach(function (mod) {
  var modPath = path.join(lib, mod);

  console.log(`Building "${mod}"`);
  cp.execSync(`yarn tsc`, { env: process.env, cwd: modPath, stdio: "inherit" });

  var libPath = path.join(modPath, "/lib");
  fs.copyFileSync(`${modPath}/package.json`, `${libPath}/package.json`);
  var packageFile = JSON.parse(fs.readFileSync(modPath + "/package.json"));

  // Deploy for each region in config file
  packageFile.config.regions.forEach((region) => {
    const execStr = `gcloud functions deploy ${packageFile.config.name} --region ${region} --entry-point ${packageFile.config.entryPoint} --runtime nodejs10 --trigger-http --allow-unauthenticated --memory ${packageFile.config.mem}`;

    console.log(`Start deploy ${packageFile.config.name} to ${region}`);
    cp.execSync(execStr, { env: process.env, cwd: libPath, stdio: "inherit" });
  });
});
