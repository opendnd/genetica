const colors = require('colors/safe');

class Renderer {
  static output(genes) {
    let output = 'Here are your genes: \n\n';

    output += JSON.stringify(genes);

    output += '\n\n';

    process.stdout.write(colors.white(output));
  }
}

module.exports = Renderer;
