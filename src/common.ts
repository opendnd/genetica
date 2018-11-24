import { Genders } from "@opendnd/core";
import defaults from "./defaults";
import { IGeneticaOpts } from "./genetica";

const colors = require("colors/safe"); // tslint:disable-line

const {
  races,
  genderOptions,
  raceOptions,
} = defaults;

export const sanitizeWizardOpts = (opts): IGeneticaOpts => {
  if (!genderOptions.includes(opts.gender)) { opts.gender = undefined; }
  if (opts.gender) { opts.gender = Genders[opts.gender]; }

  if (opts.race) {
    Object.values(races).forEach((race) => {
      if (race.name === opts.race) { opts.race = race; }
    });
  }

  // remove empty opts
  Object.keys(opts).forEach((key) => {
    if (opts[key] === "") { opts[key] = undefined; }
  });

  return opts;
};

export const makeQuestion = (question: string = "", options: string = "", required: boolean = false) => {
  return {
    info: colors.cyan(`${question} `) + colors.white(options),
    required,
  };
};

export const standardQuestions = {
  gender: makeQuestion("What's this person's gender?", `(${genderOptions.join(" | ")})`),
  race: makeQuestion("What race does this person have?", `(${raceOptions.join(" | ")})`),
};

export const saveMsg = (resource) => {
  return `Would you like to save the ${resource}? (y | n)`;
};
