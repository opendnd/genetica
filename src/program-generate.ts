import * as program from "commander";

import Genetica from "./genetica";
import Renderer from "./renderer";
import Saver from "./saver";
import SaverSeed from "./saver";
import wizard from "./wizard";
import wizardManual from "./wizard-manual";

// program basics
program
  .option("-i, --input <file>", "input *.dna file")
  .option("-o, --output <dir>", "output directory")
  .option("-f, --force", "flag to input genes manually through the wizard")
  .option("-s, --seed <file>", "file to input a seed file")
  .parse(process.argv);

// load a file
if (program.input) {
  const DNA = Saver.load(program.input);
  Renderer.output(DNA);

// generate with seed
} else if (program.seed) {
  const outputDir = program.output || ".";
  const opts = SaverSeed.load(program.seed);
  const genetica = new Genetica(opts);
  const DNA = genetica.generate();

  Renderer.output(DNA);
  Saver.finish(outputDir, "Would you like to save your genes? (y | n)", DNA, DNA.uuid, undefined);

// force a manual roll instead of random
} else if (program.force) {
  wizardManual(program.output);

// go through the standard wizard
} else {
  wizard(program.output);
}
