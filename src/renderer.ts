import * as colors from 'colors/safe';
import { Genders, DNA} from 'opendnd-core';

class Renderer {
  static leftSpace(c, n) {
    let char = `${c}`;
    const diff = parseInt(n, 10) - char.length;

    for (let i = 0; i < diff; i += 1) {
      char = ` ${char}`;
    }

    return char;
  }

  static rightSpace(c, n) {
    let char = `${c}`;
    const diff = parseInt(n, 10) - char.length;

    for (let i = 0; i < diff; i += 1) {
      char = `${char} `;
    }

    return char;
  }

  static chromosome(c, g) {
    const parts = g.split('=');
    const a = this.leftSpace(parts[0], 10);
    const b = this.rightSpace(parts[1], 10);
    const label = `Chromosome ${this.leftSpace(c, 4)}: `;

    let template = '';

    // alternate colors
    if (parseInt(c, 10) % 2) {
      template += `                             ${colors.blue('o')}=${colors.red('O')}\n`;
      template += `                            ${colors.blue('o')}===${colors.red('O')}\n`;
      template += `${colors.white(label)} ${colors.blue(a)}=====${colors.red(b)}\n`;
      template += `                            ${colors.blue('O')}===${colors.red('o')}\n`;
      template += `                             ${colors.blue('O')}=${colors.red('o')}\n`;
      template += `                              ${colors.blue('O')}\n`;
    } else {
      template += `                             ${colors.red('o')}=${colors.blue('O')}\n`;
      template += `                            ${colors.red('o')}===${colors.blue('O')}\n`;
      template += `${colors.white(label)} ${colors.red(a)}=====${colors.blue(b)}\n`;
      template += `                            ${colors.red('O')}===${colors.blue('o')}\n`;
      template += `                             ${colors.red('O')}=${colors.blue('o')}\n`;
      template += `                              ${colors.red('O')}\n`;
    }

    return template;
  }

  static output(result:DNA) {
    const {
      version,
      chromosomes,
      race,
      gender,
      traits,
    } = result;
    let output = `\n\nHere are your genes for this ${Genders[gender]} ${race.uuid} (made with Genetica v${version}): \n\n`;

    // add start to result
    output += `                              ${colors.red('O')}\n`;

    // output each chromosome
    Object.keys(chromosomes).forEach((c) => {
      const g = chromosomes[c];

      output += this.chromosome(c, g);
    });

    output += '\n\n';

    process.stdout.write(colors.white(output));

    output = 'Traits:\n';

    Object.keys(traits).forEach((trait) => {
      output += `\t${trait}:\t`;

      if (trait === 'sex') output += '\t';

      output += `${colors.bold(traits[trait].trait)} (${traits[trait].gene})\n`;
    });

    output += '\n';

    process.stdout.write(colors.white(output));
  }
}

export default Renderer;
