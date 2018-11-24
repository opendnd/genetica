import * as fs from 'fs';
import * as path from 'path';

import { standardQuestions, sanitizeWizardOpts } from './common';
import defaults from './defaults';
import SaverSeed from './saver';
import { IGeneticaOpts } from './genetica';
import { Categories } from 'opendnd-core';

const questions = require('questions');
const colors = require('colors/safe');

const Roll = require('Roll');
const roll = new Roll();

const rootDir = path.join(__dirname, '..');
const logo = fs.readFileSync(path.join(rootDir, 'logo.txt'), { encoding: 'utf-8' });

const wizardSeed = (outputDir) => {
  if (outputDir === undefined) outputDir = '.';

  // output welcome
  process.stdout.write(`\n${colors.blue(logo)}\n`);

  // ask a few questions
  questions.askMany(Object.assign(standardQuestions, {
    mutation: {
      info: colors.cyan('How much should this seed mutate? (Ex. d6 would be 1 out of 6 probability of mutation)'),
      required: false,
    },
  }), (opts) => {
    let genOpts:IGeneticaOpts = sanitizeWizardOpts(opts);
    const template = defaults.racesDict[genOpts.race.uuid];
    const seedQuestions = {};

    Object.keys(template.categories).forEach((legendName) => {
      const options = [];
      Object.keys(template.genes).forEach((gene) => {
        const parts = gene.split(':');

        // add to options if it's in the gene
        if (parts[0] === legendName) {
          options.push(`${parts[2]} (${template.genes[gene]})`);
        }
      });

      seedQuestions[legendName] = {
        info: colors.cyan(`Which gene do you want for ${legendName}?`) + colors.white(`\n\t - ${options.join('\n\t - ')}\n\n`),
        required: false,
      };
    });

    // ask questions about the seed
    questions.askMany(seedQuestions, (seedOpts) => {
      const geneOpts = {};

      // iterate through the responses and input the roll on the chromosome
      Object.keys(seedOpts).forEach((legendName) => {
        const chromosome = template.categories[legendName];
        let gene = seedOpts[legendName];
        if (gene.length === 0) return; // exit if we don't have any value

        // get a random dice roll
        const diceRoll = roll.roll(`1d${gene}`).result;

        // XX1
        if (gene.includes('XX') && !gene.includes('=')) {
          gene = gene.replace('X', `X${diceRoll}=`);

        // Y1
        } else if (gene.includes('Y') && !gene.includes('=')) {
          gene = `X${diceRoll}=${gene}`;

        // 20
        } else if (!gene.includes('=')) {
          gene = `${diceRoll}=${gene}`;
        }

        if (legendName === Categories.Sex) {
          geneOpts['chromosome-sex'] = gene;
          return;
        }

        geneOpts[`chromosome-${chromosome}`] = gene;
      });

      genOpts = Object.assign(genOpts, geneOpts);

      SaverSeed.finish(outputDir, 'Do you want to save this seed? (y | n)', genOpts, new Date().getTime(), undefined);
    });
  });
};

export default wizardSeed;
