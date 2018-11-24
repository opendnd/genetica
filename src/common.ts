import defaults from "./defaults";
import { Genders } from "opendnd-core";
import { IGeneticaOpts } from "./genetica";

const colors = require("colors/safe");

const { 
  races,
  genderOptions,
  raceOptions,
} = defaults;

export const sanitizeWizardOpts = (opts): IGeneticaOpts => {
  if (!genderOptions.includes(opts.gender)) opts.gender = undefined;
  if (opts.gender) opts.gender = Genders[opts.gender];

  if (opts.race) {
    Object.values(races).forEach((race) => {
      if (race.name === opts.race) opts.race = race;
    });
  }

  // remove empty opts
  Object.keys(opts).forEach((key) => {
    if (opts[key] === "") { opts[key] = undefined; }
  });

  return opts;
};

export const standardQuestions = {
  gender: {
    info: colors.cyan("What's this person's gender? ") + colors.white(`(${genderOptions.join(" | ")})`),
    required: false,
  },
  race: {
    info: colors.cyan("What race does this person have? ") + colors.white(`(${raceOptions.join(" | ")})`),
    required: false,
  },
};
