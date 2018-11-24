import * as program from "commander";

import wizardSeed from "./wizard-seed";

// program basics
program
  .option("-o, --output <dir>", "output directory")
  .parse(process.argv);

wizardSeed(program.output);
