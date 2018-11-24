import * as fs from "fs";
import * as path from "path";

import { Categories, DNA } from "@opendnd/core";
import {
  makeQuestion,
  sanitizeWizardOpts,
  saveMsg,
  standardQuestions,
} from "./common";
import defaults from "./defaults";
import Genetica, { IGeneticaOpts } from "./genetica";
import Renderer from "./renderer";
import Saver from "./saver";

const questions = require("questions"); // tslint:disable-line
const colors = require("colors/safe"); // tslint:disable-line

const rootDir = path.join(__dirname, "..");
const logo = fs.readFileSync(path.join(rootDir, "logo.txt"), { encoding: "utf-8" });

const wizardManual = (outputDir) => {
  if (outputDir === undefined) { outputDir = "."; }

  // output welcome
  process.stdout.write(`\n${colors.blue(logo)}\n`);

  // ask a few questions
  questions.askMany(standardQuestions, (opts) => {
    const tplOpts: IGeneticaOpts = sanitizeWizardOpts(opts);
    const template = defaults.racesDict[tplOpts.race.uuid];
    const Xdice = template.sex.x;
    const Ydice = template.sex.y;

    const geneQuestions = {};

    Object.keys(template.chromosomes).forEach((c) => {
      const dice = template.chromosomes[c];

      if (dice === Categories.Sex) {
        geneQuestions["chromosome-sex"] = makeQuestion(
          `What rolls do you want for the sex Chromosome ${c}?`,
          `ex: X1=Y1 (dice are X: ${Xdice}, Y: ${Ydice})`,
          true,
        );

        return geneQuestions;
      }

      geneQuestions[`chromosome-${c}`] = makeQuestion(
        `What rolls do you want for Chromosome ${c}?`,
        `ex: 1=1 (dice is ${dice})`,
        true,
      );

      return geneQuestions;
    });

    // ask questions about the genes
    questions.askMany(geneQuestions, (geneOpts) => {
      let genOpts: IGeneticaOpts = sanitizeWizardOpts(geneOpts);
      genOpts = Object.assign(tplOpts, genOpts);

      const genetica = new Genetica(genOpts);
      const result: DNA = genetica.generate();

      Renderer.output(result);
      Saver.finish(outputDir, saveMsg("genes"), result, result.uuid, undefined);
    });
  });
};

export default wizardManual;
