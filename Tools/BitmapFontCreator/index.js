var readline = require('readline-sync'),
    chalk = require('chalk'),
    log4js = require('log4js'),
    logger, user, pw, command;

logger = log4js.getLogger('fooApp');

readline.setDefaultOptions({
    print: function(display, encoding) {
        logger.info(chalk.stripColor(display));
    }, // Remove ctrl-chars.
    prompt: chalk.red.bold('> ')
});


let filename = null

const showEditor = () => {
    for (let y = 0; y < 8; y++) {
        console.log("xxxxxxxx")
    }
}

while (true) {
    readline.promptCLLoop({
        open: function(target) {
        },
        create: function(name) {

            showEditor();
        },
        exit: function() {
            console.log("Bye!")
            process.exit(0)
        }
    });
}
