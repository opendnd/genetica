import * as fs from 'fs';
import * as path from 'path';

import defaults from './defaults';
import SaverSeed from './saver';

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
  questions.askMany({
    race: {
      info: colors.cyan('What race is this seed for? ') + colors.white(`(${defaults.races.join(' | ')})`),
      required: true,
    },

    gender: {
      info: colors.cyan('What gender is this seed for? ') + colors.white(`(${defaults.genders.join(' | ')})`),
      required: true,
    },

    mutation: {
      info: colors.cyan('How much should this seed mutate? (Ex. d6 would be 1 out of 6 probability of mutation)'),
      required: false,
    },
  }, (opts) => {
    const template = defaults.DNA[opts.race];

    const seedQuestions = {};

    Object.keys(template.legend).forEach((legendName) => {
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
        const chromosome = template.legend[legendName];
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

        if (legendName === 'sex') {
          geneOpts['chromosome-sex'] = gene;
          return;
        }

        geneOpts[`chromosome-${chromosome}`] = gene;
      });

      opts = Object.assign(opts, geneOpts);

      SaverSeed.finish(outputDir, 'Do you want to save this seed? (y | n)', opts, new Date().getTime(), undefined);
    });
  });
};

export default wizardSeed;
