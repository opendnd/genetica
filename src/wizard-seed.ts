import * as fs from "fs";
import * as path from "path";

import {
  Categories,
  roll,
} from "@opendnd/core";
import {
  makeQuestion,
  sanitizeWizardOpts,
  saveMsg,
  standardQuestions,
} from "./common";
import defaults from "./defaults";
import { IGeneticaOpts } from "./genetica";
import SaverSeed from "./saver";

const questions = require("questions"); // tslint:disable-line
const colors = require("colors/safe"); // tslint:disable-line

const rootDir = path.join(__dirname, "..");
const logo = fs.readFileSync(path.join(rootDir, "logo.txt"), { encoding: "utf-8" });

const wizardSeed = (outputDir) => {
  if (outputDir === undefined) { outputDir = "."; }

  // output welcome
  process.stdout.write(`\n${colors.blue(logo)}\n`);

  // ask a few questions
  questions.askMany(Object.assign(standardQuestions, {
    mutation: makeQuestion(
      "How much should this seed mutate?",
      "(Ex. d6 would be 1 out of 6 probability of mutation)",
    ),
  }), (opts) => {
    let genOpts: IGeneticaOpts = sanitizeWizardOpts(opts);
    const template = defaults.racesDict[genOpts.race.uuid];
    const seedQuestions = {};

    Object.keys(template.categories).forEach((legendName) => {
      const options = [];
      Object.keys(template.genes).forEach((gene) => {
        const parts = gene.split(":");

        // add to options if it's in the gene
        if (parts[0] === legendName) {
          options.push(`${parts[2]} (${template.genes[gene]})`);
        }
      });

      seedQuestions[legendName] = makeQuestion(
        `Which gene do you want for ${legendName}?`,
        `\n\t - ${options.join("\n\t - ")}\n\n`,
      );
    });

    // ask questions about the seed
    questions.askMany(seedQuestions, (seedOpts) => {
      const geneOpts = {};

      // iterate through the responses and input the roll on the chromosome
      Object.keys(seedOpts).forEach((legendName) => {
        const chromosome = template.categories[legendName];
        let gene = seedOpts[legendName];
        if (gene.length === 0) { return; } // exit if we don't have any value

        // get a random dice roll
        const diceRoll = roll(`1d${gene}`);

        // XX1
        if (gene.includes("XX") && !gene.includes("=")) {
          gene = gene.replace("X", `X${diceRoll}=`);

        // Y1
        } else if (gene.includes("Y") && !gene.includes("=")) {
          gene = `X${diceRoll}=${gene}`;

        // 20
        } else if (!gene.includes("=")) {
          gene = `${diceRoll}=${gene}`;
        }

        if (legendName === Categories.Sex) {
          geneOpts["chromosome-sex"] = gene;
          return;
        }

        geneOpts[`chromosome-${chromosome}`] = gene;
      });

      genOpts = Object.assign(genOpts, geneOpts);

      SaverSeed.finish(outputDir, saveMsg("seed"), genOpts, new Date().getTime(), undefined);
    });
  });
};

export default wizardSeed;
