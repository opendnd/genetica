# genetica
Genetica is a tool for using a simplified genetics system to generate inheritable traits for DnD characters.

[![NPM](https://nodei.co/npm/genetica.png?downloads=true&stars=true)](https://nodei.co/npm/genetica/)

[![Build Status](https://travis-ci.org/opendnd/genetica.svg?branch=master)](https://travis-ci.org/opendnd/genetica)

## Installation
You will need [node](https://nodejs.org/en/) and [npm](https://www.npmjs.com/) installed. Then run the command:

`npm install -g genetica`

## Generate DNA from CLI

```shell
genetica
```

Follow the prompts for Race and Gender (optional) and your DNA is outputted with information on traits.

## Module Usage
Require genetica into your file and create a new Genetica class. 

```javascript
const Genetica = require('genetica');

const genetica = new Genetica();

const opts = {
  gender: 'female',
  race: 'Dragonborn'
};

const DNA = genetica.generate(opts);
```

## Simplified DNA System
Each generated character has a set of DNA with chromosomes. These chromosomes go to applying traits.

Each chromosome has two pairs with dice rolls based on the size of the chromosome: either `d2`, `d4`, `d6`, `d8`, `d12`, `d20`, or `d100`. So for example, Chromosome 1 has a size of `d8` and the pair rolls for `5=8` which means the mother gave a roll of `5` and the father gave a roll of `8`.

__Rules__
- Dominant/Recessive Genetic Rules: A rule of `3` means if 3 is the highest rolled then the trait applies. For example: a chromosome pair of `1=3` would mean the rule applies as 3 is the highest roll, but for a pair of `8=3` it would not.
- Co-dominant Genetic Rules: `1=3` means that the roll for the mother must be 1 and the father must be 3 in that order. A `3=1` would not apply the rule. ___This rule is checked BEFORE the dominant/recessive rules___.

Inspiration: http://www.chromosomewalk.ch/en/list-of-chromosomes/

## Developing

To develop genetica,

```shell
git clone https://github.com/opendnd/genetica.git
cd genetica/
npm install
```

## Contributing

If you'd like to contribute, please fork the repository and use a feature
branch. Pull requests are welcome!

Genetica uses the [Airbnb](https://github.com/airbnb/javascript) javascript style.

## Licensing

[MIT](https://github.com/opendnd/genetica/blob/master/LICENSE)