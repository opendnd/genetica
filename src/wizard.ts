import * as fs from "fs";
import * as path from "path";

import { DNA } from "@opendnd/core";
import {
  sanitizeWizardOpts,
  saveMsg,
  standardQuestions,
} from "./common";
import Genetica, { IGeneticaOpts } from "./genetica";
import Renderer from "./renderer";
import Saver from "./saver";

const questions = require("questions"); // tslint:disable-line
const colors = require("colors/safe"); // tslint:disable-line

const rootDir = path.join(__dirname, "..");
const logo = fs.readFileSync(path.join(rootDir, "logo.txt"), { encoding: "utf-8" });

const wizard = (outputDir) => {
  if (outputDir === undefined) { outputDir = "."; }

  // output welcome
  process.stdout.write(`\n${colors.blue(logo)}\n`);

  // ask a few questions
  questions.askMany(standardQuestions, (opts) => {
    const genOpts: IGeneticaOpts = sanitizeWizardOpts(opts);
    const genetica = new Genetica(genOpts);
    const result: DNA = genetica.generate();

    Renderer.output(result);
    Saver.finish(outputDir, saveMsg("genes"), result, result.uuid, undefined);
  });
};

export default wizard;
