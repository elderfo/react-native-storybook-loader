#!/usr/bin/env node
'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var path = _interopDefault(require('path'));
var util = _interopDefault(require('util'));
var fs = _interopDefault(require('fs'));
require('colors');
var glob = _interopDefault(require('glob'));
var dot = _interopDefault(require('dot'));
var findup = _interopDefault(require('findup'));

function commonjsRequire () {
	throw new Error('Dynamic requires are not currently supported by rollup-plugin-commonjs');
}



function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

function preserveCamelCase(str) {
	let isLastCharLower = false;
	let isLastCharUpper = false;
	let isLastLastCharUpper = false;

	for (let i = 0; i < str.length; i++) {
		const c = str[i];

		if (isLastCharLower && /[a-zA-Z]/.test(c) && c.toUpperCase() === c) {
			str = str.substr(0, i) + '-' + str.substr(i);
			isLastCharLower = false;
			isLastLastCharUpper = isLastCharUpper;
			isLastCharUpper = true;
			i++;
		} else if (isLastCharUpper && isLastLastCharUpper && /[a-zA-Z]/.test(c) && c.toLowerCase() === c) {
			str = str.substr(0, i - 1) + '-' + str.substr(i - 1);
			isLastLastCharUpper = isLastCharUpper;
			isLastCharUpper = false;
			isLastCharLower = true;
		} else {
			isLastCharLower = c.toLowerCase() === c;
			isLastLastCharUpper = isLastCharUpper;
			isLastCharUpper = c.toUpperCase() === c;
		}
	}

	return str;
}

var index = function (str) {
	if (arguments.length > 1) {
		str = Array.from(arguments)
			.map(x => x.trim())
			.filter(x => x.length)
			.join('-');
	} else {
		str = str.trim();
	}

	if (str.length === 0) {
		return '';
	}

	if (str.length === 1) {
		return str.toLowerCase();
	}

	if (/^[a-z0-9]+$/.test(str)) {
		return str;
	}

	const hasUpperCase = str !== str.toLowerCase();

	if (hasUpperCase) {
		str = preserveCamelCase(str);
	}

	return str
		.replace(/^[_.\- ]+/, '')
		.toLowerCase()
		.replace(/[_.\- ]+(\w|$)/g, (m, p1) => p1.toUpperCase());
};

var fs$1 = require('fs');
var join = require('path').join;
var resolve = require('path').resolve;
var dirname = require('path').dirname;
var defaultOptions = {
    extensions: ['js', 'json', 'coffee'],
    recurse: true,
    rename: function (name) {
      return name;
    },
    visit: function (obj) {
      return obj;
    }
  };

function checkFileInclusion(path$$1, filename, options) {
  return (
    // verify file has valid extension
    (new RegExp('\\.(' + options.extensions.join('|') + ')$', 'i').test(filename)) &&

    // if options.include is a RegExp, evaluate it and make sure the path passes
    !(options.include && options.include instanceof RegExp && !options.include.test(path$$1)) &&

    // if options.include is a function, evaluate it and make sure the path passes
    !(options.include && typeof options.include === 'function' && !options.include(path$$1, filename)) &&

    // if options.exclude is a RegExp, evaluate it and make sure the path doesn't pass
    !(options.exclude && options.exclude instanceof RegExp && options.exclude.test(path$$1)) &&

    // if options.exclude is a function, evaluate it and make sure the path doesn't pass
    !(options.exclude && typeof options.exclude === 'function' && options.exclude(path$$1, filename))
  );
}

function requireDirectory(m, path$$1, options) {
  var retval = {};

  // path is optional
  if (path$$1 && !options && typeof path$$1 !== 'string') {
    options = path$$1;
    path$$1 = null;
  }

  // default options
  options = options || {};
  for (var prop in defaultOptions) {
    if (typeof options[prop] === 'undefined') {
      options[prop] = defaultOptions[prop];
    }
  }

  // if no path was passed in, assume the equivelant of __dirname from caller
  // otherwise, resolve path relative to the equivalent of __dirname
  path$$1 = !path$$1 ? dirname(m.filename) : resolve(dirname(m.filename), path$$1);

  // get the path of each file in specified directory, append to current tree node, recurse
  fs$1.readdirSync(path$$1).forEach(function (filename) {
    var joined = join(path$$1, filename),
      files,
      key,
      obj;

    if (fs$1.statSync(joined).isDirectory() && options.recurse) {
      // this node is a directory; recurse
      files = requireDirectory(m, joined, options);
      // exclude empty directories
      if (Object.keys(files).length) {
        retval[options.rename(filename, joined, filename)] = files;
      }
    } else {
      if (joined !== m.filename && checkFileInclusion(joined, filename, options)) {
        // hash node key shouldn't include file extension
        key = filename.substring(0, filename.lastIndexOf('.'));
        obj = m.require(joined);
        retval[options.rename(key, joined, filename)] = options.visit(obj, joined, filename) || obj;
      }
    }
  });

  return retval;
}

module.exports = requireDirectory;
module.exports.defaults = defaultOptions;


var index$2 = Object.freeze({

});

var index$3 = function whichModule (exported) {
  for (var i = 0, files = Object.keys(commonjsRequire.cache), mod; i < files.length; i++) {
    mod = commonjsRequire.cache[files[i]];
    if (mod.exports === exported) return mod
  }
  return null
};

var require$$1 = ( index$2 && undefined ) || index$2;

const inspect = util.inspect;


const DEFAULT_MARKER = '*';

// handles parsing positional arguments,
// and populating argv with said positional
// arguments.
var command$1 = function (yargs, usage, validation) {
  const self = {};

  var handlers = {};
  var aliasMap = {};
  var defaultCommand;
  self.addHandler = function (cmd, description, builder, handler) {
    var aliases = [];
    handler = handler || function () {};

    if (Array.isArray(cmd)) {
      aliases = cmd.slice(1);
      cmd = cmd[0];
    } else if (typeof cmd === 'object') {
      var command = (Array.isArray(cmd.command) || typeof cmd.command === 'string') ? cmd.command : moduleName(cmd);
      if (cmd.aliases) command = [].concat(command).concat(cmd.aliases);
      self.addHandler(command, extractDesc(cmd), cmd.builder, cmd.handler);
      return
    }

    // allow a module to be provided instead of separate builder and handler
    if (typeof builder === 'object' && builder.builder && typeof builder.handler === 'function') {
      self.addHandler([cmd].concat(aliases), description, builder.builder, builder.handler);
      return
    }

    // parse positionals out of cmd string
    var parsedCommand = self.parseCommand(cmd);

    // remove positional args from aliases only
    aliases = aliases.map(function (alias) {
      return self.parseCommand(alias).cmd
    });

    // check for default and filter out '*''
    var isDefault = false;
    var parsedAliases = [parsedCommand.cmd].concat(aliases).filter(function (c) {
      if (c === DEFAULT_MARKER) {
        isDefault = true;
        return false
      }
      return true
    });

    // short-circuit if default with no aliases
    if (isDefault && parsedAliases.length === 0) {
      defaultCommand = {
        original: cmd.replace(DEFAULT_MARKER, '').trim(),
        handler: handler,
        builder: builder || {},
        demanded: parsedCommand.demanded,
        optional: parsedCommand.optional
      };
      return
    }

    // shift cmd and aliases after filtering out '*'
    if (isDefault) {
      parsedCommand.cmd = parsedAliases[0];
      aliases = parsedAliases.slice(1);
      cmd = cmd.replace(DEFAULT_MARKER, parsedCommand.cmd);
    }

    // populate aliasMap
    aliases.forEach(function (alias) {
      aliasMap[alias] = parsedCommand.cmd;
    });

    if (description !== false) {
      usage.command(cmd, description, isDefault, aliases);
    }

    handlers[parsedCommand.cmd] = {
      original: cmd,
      handler: handler,
      builder: builder || {},
      demanded: parsedCommand.demanded,
      optional: parsedCommand.optional
    };

    if (isDefault) defaultCommand = handlers[parsedCommand.cmd];
  };

  self.addDirectory = function (dir, context, req, callerFile, opts) {
    opts = opts || {};
    // disable recursion to support nested directories of subcommands
    if (typeof opts.recurse !== 'boolean') opts.recurse = false;
    // exclude 'json', 'coffee' from require-directory defaults
    if (!Array.isArray(opts.extensions)) opts.extensions = ['js'];
    // allow consumer to define their own visitor function
    const parentVisit = typeof opts.visit === 'function' ? opts.visit : function (o) { return o };
    // call addHandler via visitor function
    opts.visit = function (obj, joined, filename) {
      const visited = parentVisit(obj, joined, filename);
      // allow consumer to skip modules with their own visitor
      if (visited) {
        // check for cyclic reference
        // each command file path should only be seen once per execution
        if (~context.files.indexOf(joined)) return visited
        // keep track of visited files in context.files
        context.files.push(joined);
        self.addHandler(visited);
      }
      return visited
    };
    require$$1({ require: req, filename: callerFile }, dir, opts);
  };

  // lookup module object from require()d command and derive name
  // if module was not require()d and no name given, throw error
  function moduleName (obj) {
    const mod = index$3(obj);
    if (!mod) throw new Error('No command name given for module: ' + inspect(obj))
    return commandFromFilename(mod.filename)
  }

  // derive command name from filename
  function commandFromFilename (filename) {
    return path.basename(filename, path.extname(filename))
  }

  function extractDesc (obj) {
    for (var keys = ['describe', 'description', 'desc'], i = 0, l = keys.length, test; i < l; i++) {
      test = obj[keys[i]];
      if (typeof test === 'string' || typeof test === 'boolean') return test
    }
    return false
  }

  self.parseCommand = function (cmd) {
    var extraSpacesStrippedCommand = cmd.replace(/\s{2,}/g, ' ');
    var splitCommand = extraSpacesStrippedCommand.split(/\s+(?![^[]*]|[^<]*>)/);
    var bregex = /\.*[\][<>]/g;
    var parsedCommand = {
      cmd: (splitCommand.shift()).replace(bregex, ''),
      demanded: [],
      optional: []
    };
    splitCommand.forEach(function (cmd, i) {
      var variadic = false;
      cmd = cmd.replace(/\s/g, '');
      if (/\.+[\]>]/.test(cmd) && i === splitCommand.length - 1) variadic = true;
      if (/^\[/.test(cmd)) {
        parsedCommand.optional.push({
          cmd: cmd.replace(bregex, '').split('|'),
          variadic: variadic
        });
      } else {
        parsedCommand.demanded.push({
          cmd: cmd.replace(bregex, '').split('|'),
          variadic: variadic
        });
      }
    });
    return parsedCommand
  };

  self.getCommands = function () {
    return Object.keys(handlers).concat(Object.keys(aliasMap))
  };

  self.getCommandHandlers = function () {
    return handlers
  };

  self.hasDefaultCommand = function () {
    return !!defaultCommand
  };

  self.runCommand = function (command, yargs, parsed, commandIndex) {
    var aliases = parsed.aliases;
    var commandHandler = handlers[command] || handlers[aliasMap[command]] || defaultCommand;
    var currentContext = yargs.getContext();
    var numFiles = currentContext.files.length;
    var parentCommands = currentContext.commands.slice();

    // what does yargs look like after the buidler is run?
    var innerArgv = parsed.argv;
    var innerYargs = null;
    var positionalMap = {};

    if (command) currentContext.commands.push(command);
    if (typeof commandHandler.builder === 'function') {
      // a function can be provided, which builds
      // up a yargs chain and possibly returns it.
      innerYargs = commandHandler.builder(yargs.reset(parsed.aliases));
      // if the builder function did not yet parse argv with reset yargs
      // and did not explicitly set a usage() string, then apply the
      // original command string as usage() for consistent behavior with
      // options object below.
      if (yargs.parsed === false) {
        if (typeof yargs.getUsageInstance().getUsage() === 'undefined') {
          yargs.usage('$0 ' + (parentCommands.length ? parentCommands.join(' ') + ' ' : '') + commandHandler.original);
        }
        innerArgv = innerYargs ? innerYargs._parseArgs(null, null, true, commandIndex) : yargs._parseArgs(null, null, true, commandIndex);
      } else {
        innerArgv = yargs.parsed.argv;
      }

      if (innerYargs && yargs.parsed === false) aliases = innerYargs.parsed.aliases;
      else aliases = yargs.parsed.aliases;
    } else if (typeof commandHandler.builder === 'object') {
      // as a short hand, an object can instead be provided, specifying
      // the options that a command takes.
      innerYargs = yargs.reset(parsed.aliases);
      innerYargs.usage('$0 ' + (parentCommands.length ? parentCommands.join(' ') + ' ' : '') + commandHandler.original);
      Object.keys(commandHandler.builder).forEach(function (key) {
        innerYargs.option(key, commandHandler.builder[key]);
      });
      innerArgv = innerYargs._parseArgs(null, null, true, commandIndex);
      aliases = innerYargs.parsed.aliases;
    }

    if (!yargs._hasOutput()) {
      positionalMap = populatePositionals(commandHandler, innerArgv, currentContext, yargs);
    }

    // we apply validation post-hoc, so that custom
    // checks get passed populated positional arguments.
    if (!yargs._hasOutput()) yargs._runValidation(innerArgv, aliases, positionalMap, yargs.parsed.error);

    if (commandHandler.handler && !yargs._hasOutput()) {
      yargs._setHasOutput();
      commandHandler.handler(innerArgv);
    }

    if (command) currentContext.commands.pop();
    numFiles = currentContext.files.length - numFiles;
    if (numFiles > 0) currentContext.files.splice(numFiles * -1, numFiles);

    return innerArgv
  };

  // transcribe all positional arguments "command <foo> <bar> [apple]"
  // onto argv.
  function populatePositionals (commandHandler, argv, context, yargs) {
    argv._ = argv._.slice(context.commands.length); // nuke the current commands
    var demanded = commandHandler.demanded.slice(0);
    var optional = commandHandler.optional.slice(0);
    var positionalMap = {};

    validation.positionalCount(demanded.length, argv._.length);

    while (demanded.length) {
      var demand = demanded.shift();
      populatePositional(demand, argv, yargs, positionalMap);
    }

    while (optional.length) {
      var maybe = optional.shift();
      populatePositional(maybe, argv, yargs, positionalMap);
    }

    argv._ = context.commands.concat(argv._);
    return positionalMap
  }

  // populate a single positional argument and its
  // aliases onto argv.
  function populatePositional (positional, argv, yargs, positionalMap) {
    // "positional" consists of the positional.cmd, an array representing
    // the positional's name and aliases, and positional.variadic
    // indicating whether or not it is a variadic array.
    var variadics = null;
    var value = null;
    for (var i = 0, cmd; (cmd = positional.cmd[i]) !== undefined; i++) {
      if (positional.variadic) {
        if (variadics) argv[cmd] = variadics.slice(0);
        else argv[cmd] = variadics = argv._.splice(0);
      } else {
        if (!value && !argv._.length) continue
        if (value) argv[cmd] = value;
        else argv[cmd] = value = argv._.shift();
      }
      positionalMap[cmd] = true;
      postProcessPositional(yargs, argv, cmd);
      addCamelCaseExpansions(argv, cmd);
    }
  }

  // TODO move positional arg logic to yargs-parser and remove this duplication
  function postProcessPositional (yargs, argv, key) {
    var coerce = yargs.getOptions().coerce[key];
    if (typeof coerce === 'function') {
      try {
        argv[key] = coerce(argv[key]);
      } catch (err) {
        yargs.getUsageInstance().fail(err.message, err);
      }
    }
  }

  function addCamelCaseExpansions (argv, option) {
    if (/-/.test(option)) {
      const cc = index(option);
      if (typeof argv[option] === 'object') argv[cc] = argv[option].slice(0);
      else argv[cc] = argv[option];
    }
  }

  self.reset = function () {
    handlers = {};
    aliasMap = {};
    defaultCommand = undefined;
    return self
  };

  // used by yargs.parse() to freeze
  // the state of commands such that
  // we can apply .parse() multiple times
  // with the same yargs instance.
  var frozen;
  self.freeze = function () {
    frozen = {};
    frozen.handlers = handlers;
    frozen.aliasMap = aliasMap;
    frozen.defaultCommand = defaultCommand;
  };
  self.unfreeze = function () {
    handlers = frozen.handlers;
    aliasMap = frozen.aliasMap;
    defaultCommand = frozen.defaultCommand;
    frozen = undefined;
  };

  return self
};

function YError (msg) {
  this.name = 'YError';
  this.message = msg || 'yargs error';
  Error.captureStackTrace(this, YError);
}

YError.prototype = Object.create(Error.prototype);
YError.prototype.constructor = YError;

var yerror = YError;

const command = command$1();


const positionName = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth'];

var argsert = function (expected, callerArguments, length) {
  // TODO: should this eventually raise an exception.
  try {
    // preface the argument description with "cmd", so
    // that we can run it through yargs' command parser.
    var position = 0;
    var parsed = {demanded: [], optional: []};
    if (typeof expected === 'object') {
      length = callerArguments;
      callerArguments = expected;
    } else {
      parsed = command.parseCommand('cmd ' + expected);
    }
    const args = [].slice.call(callerArguments);

    while (args.length && args[args.length - 1] === undefined) args.pop();
    length = length || args.length;

    if (length < parsed.demanded.length) {
      throw new yerror('Not enough arguments provided. Expected ' + parsed.demanded.length +
        ' but received ' + args.length + '.')
    }

    const totalCommands = parsed.demanded.length + parsed.optional.length;
    if (length > totalCommands) {
      throw new yerror('Too many arguments provided. Expected max ' + totalCommands +
        ' but received ' + length + '.')
    }

    parsed.demanded.forEach(function (demanded) {
      const arg = args.shift();
      const observedType = guessType(arg);
      const matchingTypes = demanded.cmd.filter(function (type) {
        return type === observedType || type === '*'
      });
      if (matchingTypes.length === 0) argumentTypeError(observedType, demanded.cmd, position, false);
      position += 1;
    });

    parsed.optional.forEach(function (optional) {
      if (args.length === 0) return
      const arg = args.shift();
      const observedType = guessType(arg);
      const matchingTypes = optional.cmd.filter(function (type) {
        return type === observedType || type === '*'
      });
      if (matchingTypes.length === 0) argumentTypeError(observedType, optional.cmd, position, true);
      position += 1;
    });
  } catch (err) {
    console.warn(err.stack);
  }
};

function guessType (arg) {
  if (Array.isArray(arg)) {
    return 'array'
  } else if (arg === null) {
    return 'null'
  }
  return typeof arg
}

function argumentTypeError (observedType, allowedTypes, position, optional) {
  throw new yerror('Invalid ' + (positionName[position] || 'manyith') + ' argument.' +
    ' Expected ' + allowedTypes.join(' or ') + ' but received ' + observedType + '.')
}

// lazy Object.assign logic that only works for merging
// two objects; eventually we should replace this with Object.assign.
var assign = function assign (defaults, configuration) {
  var o = {};
  configuration = configuration || {};

  Object.keys(defaults).forEach(function (k) {
    o[k] = defaults[k];
  });
  Object.keys(configuration).forEach(function (k) {
    o[k] = configuration[k];
  });

  return o
};

// add bash completions to your
//  yargs-powered applications.
var completion = function (yargs, usage, command) {
  const self = {
    completionKey: 'get-yargs-completions'
  };

  // get a list of completion commands.
  // 'args' is the array of strings from the line to be completed
  self.getCompletion = function (args, done) {
    const completions = [];
    const current = args.length ? args[args.length - 1] : '';
    const argv = yargs.parse(args, true);
    const aliases = yargs.parsed.aliases;

    // a custom completion function can be provided
    // to completion().
    if (completionFunction) {
      if (completionFunction.length < 3) {
        var result = completionFunction(current, argv);

        // promise based completion function.
        if (typeof result.then === 'function') {
          return result.then(function (list) {
            process.nextTick(function () { done(list); });
          }).catch(function (err) {
            process.nextTick(function () { throw err });
          })
        }

        // synchronous completion function.
        return done(result)
      } else {
        // asynchronous completion function
        return completionFunction(current, argv, function (completions) {
          done(completions);
        })
      }
    }

    var handlers = command.getCommandHandlers();
    for (var i = 0, ii = args.length; i < ii; ++i) {
      if (handlers[args[i]] && handlers[args[i]].builder) {
        const builder = handlers[args[i]].builder;
        if (typeof builder === 'function') {
          const y = yargs.reset();
          builder(y);
          return y.argv
        }
      }
    }

    if (!current.match(/^-/)) {
      usage.getCommands().forEach(function (command) {
        if (args.indexOf(command[0]) === -1) {
          completions.push(command[0]);
        }
      });
    }

    if (current.match(/^-/)) {
      Object.keys(yargs.getOptions().key).forEach(function (key) {
        // If the key and its aliases aren't in 'args', add the key to 'completions'
        var keyAndAliases = [key].concat(aliases[key] || []);
        var notInArgs = keyAndAliases.every(function (val) {
          return args.indexOf('--' + val) === -1
        });
        if (notInArgs) {
          completions.push('--' + key);
        }
      });
    }

    done(completions);
  };

  // generate the completion script to add to your .bashrc.
  self.generateCompletionScript = function ($0) {
    var script = fs.readFileSync(
      path.resolve(__dirname, '../completion.sh.hbs'),
      'utf-8'
    );
    var name = path.basename($0);

    // add ./to applications not yet installed as bin.
    if ($0.match(/\.js$/)) $0 = './' + $0;

    script = script.replace(/{{app_name}}/g, name);
    return script.replace(/{{app_path}}/g, $0)
  };

  // register a function to perform your own custom
  // completions., this function can be either
  // synchrnous or asynchronous.
  var completionFunction = null;
  self.registerFunction = function (fn) {
    completionFunction = fn;
  };

  return self
};

var camelCase$1 = require('camelcase');
var path$2 = require('path');
var tokenizeArgString = require('./lib/tokenize-arg-string');
var util$1 = require('util');

function parse (args, opts) {
  if (!opts) opts = {};
  // allow a string argument to be passed in rather
  // than an argv array.
  args = tokenizeArgString(args);
  // aliases might have transitive relationships, normalize this.
  var aliases = combineAliases(opts.alias || {});
  var configuration = assign$2({
    'short-option-groups': true,
    'camel-case-expansion': true,
    'dot-notation': true,
    'parse-numbers': true,
    'boolean-negation': true,
    'duplicate-arguments-array': true,
    'flatten-duplicate-arrays': true,
    'populate--': false
  }, opts.configuration);
  var defaults = opts.default || {};
  var configObjects = opts.configObjects || [];
  var envPrefix = opts.envPrefix;
  var notFlagsOption = configuration['populate--'];
  var notFlagsArgv = notFlagsOption ? '--' : '_';
  var newAliases = {};
  // allow a i18n handler to be passed in, default to a fake one (util.format).
  var __ = opts.__ || function (str) {
    return util$1.format.apply(util$1, Array.prototype.slice.call(arguments))
  };
  var error = null;
  var flags = {
    aliases: {},
    arrays: {},
    bools: {},
    strings: {},
    numbers: {},
    counts: {},
    normalize: {},
    configs: {},
    defaulted: {},
    nargs: {},
    coercions: {}
  };
  var negative = /^-[0-9]+(\.[0-9]+)?/;[].concat(opts.array).filter(Boolean).forEach(function (key) {
    flags.arrays[key] = true;
  })

  ;[].concat(opts.boolean).filter(Boolean).forEach(function (key) {
    flags.bools[key] = true;
  })

  ;[].concat(opts.string).filter(Boolean).forEach(function (key) {
    flags.strings[key] = true;
  })

  ;[].concat(opts.number).filter(Boolean).forEach(function (key) {
    flags.numbers[key] = true;
  })

  ;[].concat(opts.count).filter(Boolean).forEach(function (key) {
    flags.counts[key] = true;
  })

  ;[].concat(opts.normalize).filter(Boolean).forEach(function (key) {
    flags.normalize[key] = true;
  });

  Object.keys(opts.narg || {}).forEach(function (k) {
    flags.nargs[k] = opts.narg[k];
  });

  Object.keys(opts.coerce || {}).forEach(function (k) {
    flags.coercions[k] = opts.coerce[k];
  });

  if (Array.isArray(opts.config) || typeof opts.config === 'string') {
    [].concat(opts.config).filter(Boolean).forEach(function (key) {
      flags.configs[key] = true;
    });
  } else {
    Object.keys(opts.config || {}).forEach(function (k) {
      flags.configs[k] = opts.config[k];
    });
  }

  // create a lookup table that takes into account all
  // combinations of aliases: {f: ['foo'], foo: ['f']}
  extendAliases(opts.key, aliases, opts.default, flags.arrays);

  // apply default values to all aliases.
  Object.keys(defaults).forEach(function (key) {
    (flags.aliases[key] || []).forEach(function (alias) {
      defaults[alias] = defaults[key];
    });
  });

  var argv = { _: [] };

  Object.keys(flags.bools).forEach(function (key) {
    setArg(key, !(key in defaults) ? false : defaults[key]);
    setDefaulted(key);
  });

  var notFlags = [];
  if (args.indexOf('--') !== -1) {
    notFlags = args.slice(args.indexOf('--') + 1);
    args = args.slice(0, args.indexOf('--'));
  }

  for (var i = 0; i < args.length; i++) {
    var arg = args[i];
    var broken;
    var key;
    var letters;
    var m;
    var next;
    var value;

    // -- seperated by =
    if (arg.match(/^--.+=/) || (
      !configuration['short-option-groups'] && arg.match(/^-.+=/)
    )) {
      // Using [\s\S] instead of . because js doesn't support the
      // 'dotall' regex modifier. See:
      // http://stackoverflow.com/a/1068308/13216
      m = arg.match(/^--?([^=]+)=([\s\S]*)$/);

      // nargs format = '--f=monkey washing cat'
      if (checkAllAliases(m[1], flags.nargs)) {
        args.splice(i + 1, 0, m[2]);
        i = eatNargs(i, m[1], args);
      // arrays format = '--f=a b c'
      } else if (checkAllAliases(m[1], flags.arrays) && args.length > i + 1) {
        args.splice(i + 1, 0, m[2]);
        i = eatArray(i, m[1], args);
      } else {
        setArg(m[1], m[2]);
      }
    } else if (arg.match(/^--no-.+/) && configuration['boolean-negation']) {
      key = arg.match(/^--no-(.+)/)[1];
      setArg(key, false);

    // -- seperated by space.
    } else if (arg.match(/^--.+/) || (
      !configuration['short-option-groups'] && arg.match(/^-.+/)
    )) {
      key = arg.match(/^--?(.+)/)[1];

      // nargs format = '--foo a b c'
      if (checkAllAliases(key, flags.nargs)) {
        i = eatNargs(i, key, args);
      // array format = '--foo a b c'
      } else if (checkAllAliases(key, flags.arrays) && args.length > i + 1) {
        i = eatArray(i, key, args);
      } else {
        next = args[i + 1];

        if (next !== undefined && (!next.match(/^-/) ||
          next.match(negative)) &&
          !checkAllAliases(key, flags.bools) &&
          !checkAllAliases(key, flags.counts)) {
          setArg(key, next);
          i++;
        } else if (/^(true|false)$/.test(next)) {
          setArg(key, next);
          i++;
        } else {
          setArg(key, defaultForType(guessType(key, flags)));
        }
      }

    // dot-notation flag seperated by '='.
    } else if (arg.match(/^-.\..+=/)) {
      m = arg.match(/^-([^=]+)=([\s\S]*)$/);
      setArg(m[1], m[2]);

    // dot-notation flag seperated by space.
    } else if (arg.match(/^-.\..+/)) {
      next = args[i + 1];
      key = arg.match(/^-(.\..+)/)[1];

      if (next !== undefined && !next.match(/^-/) &&
        !checkAllAliases(key, flags.bools) &&
        !checkAllAliases(key, flags.counts)) {
        setArg(key, next);
        i++;
      } else {
        setArg(key, defaultForType(guessType(key, flags)));
      }
    } else if (arg.match(/^-[^-]+/) && !arg.match(negative)) {
      letters = arg.slice(1, -1).split('');
      broken = false;

      for (var j = 0; j < letters.length; j++) {
        next = arg.slice(j + 2);

        if (letters[j + 1] && letters[j + 1] === '=') {
          value = arg.slice(j + 3);
          key = letters[j];

          // nargs format = '-f=monkey washing cat'
          if (checkAllAliases(key, flags.nargs)) {
            args.splice(i + 1, 0, value);
            i = eatNargs(i, key, args);
          // array format = '-f=a b c'
          } else if (checkAllAliases(key, flags.arrays) && args.length > i + 1) {
            args.splice(i + 1, 0, value);
            i = eatArray(i, key, args);
          } else {
            setArg(key, value);
          }

          broken = true;
          break
        }

        if (next === '-') {
          setArg(letters[j], next);
          continue
        }

        // current letter is an alphabetic character and next value is a number
        if (/[A-Za-z]/.test(letters[j]) &&
          /^-?\d+(\.\d*)?(e-?\d+)?$/.test(next)) {
          setArg(letters[j], next);
          broken = true;
          break
        }

        if (letters[j + 1] && letters[j + 1].match(/\W/)) {
          setArg(letters[j], next);
          broken = true;
          break
        } else {
          setArg(letters[j], defaultForType(guessType(letters[j], flags)));
        }
      }

      key = arg.slice(-1)[0];

      if (!broken && key !== '-') {
        // nargs format = '-f a b c'
        if (checkAllAliases(key, flags.nargs)) {
          i = eatNargs(i, key, args);
        // array format = '-f a b c'
        } else if (checkAllAliases(key, flags.arrays) && args.length > i + 1) {
          i = eatArray(i, key, args);
        } else {
          next = args[i + 1];

          if (next !== undefined && (!/^(-|--)[^-]/.test(next) ||
            next.match(negative)) &&
            !checkAllAliases(key, flags.bools) &&
            !checkAllAliases(key, flags.counts)) {
            setArg(key, next);
            i++;
          } else if (/^(true|false)$/.test(next)) {
            setArg(key, next);
            i++;
          } else {
            setArg(key, defaultForType(guessType(key, flags)));
          }
        }
      }
    } else {
      argv._.push(
        flags.strings['_'] || !isNumber(arg) ? arg : Number(arg)
      );
    }
  }

  // order of precedence:
  // 1. command line arg
  // 2. value from env var
  // 3. value from config file
  // 4. value from config objects
  // 5. configured default value
  applyEnvVars(argv, true); // special case: check env vars that point to config file
  applyEnvVars(argv, false);
  setConfig(argv);
  setConfigObjects();
  applyDefaultsAndAliases(argv, flags.aliases, defaults);
  applyCoercions(argv);

  // for any counts either not in args or without an explicit default, set to 0
  Object.keys(flags.counts).forEach(function (key) {
    if (!hasKey(argv, key.split('.'))) setArg(key, 0);
  });

  // '--' defaults to undefined.
  if (notFlagsOption && notFlags.length) argv[notFlagsArgv] = [];
  notFlags.forEach(function (key) {
    argv[notFlagsArgv].push(key);
  });

  // how many arguments should we consume, based
  // on the nargs option?
  function eatNargs (i, key, args) {
    var toEat = checkAllAliases(key, flags.nargs);

    if (args.length - (i + 1) < toEat) error = Error(__('Not enough arguments following: %s', key));

    for (var ii = i + 1; ii < (toEat + i + 1); ii++) {
      setArg(key, args[ii]);
    }

    return (i + toEat)
  }

  // if an option is an array, eat all non-hyphenated arguments
  // following it... YUM!
  // e.g., --foo apple banana cat becomes ["apple", "banana", "cat"]
  function eatArray (i, key, args) {
    var start = i + 1;
    var argsToSet = [];
    var multipleArrayFlag = i > 0;
    for (var ii = i + 1; ii < args.length; ii++) {
      if (/^-/.test(args[ii]) && !negative.test(args[ii])) {
        if (ii === start) {
          setArg(key, defaultForType('array'));
        }
        multipleArrayFlag = true;
        break
      }
      i = ii;
      argsToSet.push(args[ii]);
    }
    if (multipleArrayFlag) {
      setArg(key, argsToSet.map(function (arg) {
        return processValue(key, arg)
      }));
    } else {
      argsToSet.forEach(function (arg) {
        setArg(key, arg);
      });
    }

    return i
  }

  function setArg (key, val) {
    unsetDefaulted(key);

    if (/-/.test(key) && !(flags.aliases[key] && flags.aliases[key].length) && configuration['camel-case-expansion']) {
      var c = camelCase$1(key);
      flags.aliases[key] = [c];
      newAliases[c] = true;
    }

    var value = processValue(key, val);

    var splitKey = key.split('.');
    setKey(argv, splitKey, value);

    // handle populating aliases of the full key
    if (flags.aliases[key]) {
      flags.aliases[key].forEach(function (x) {
        x = x.split('.');
        setKey(argv, x, value);
      });
    }

    // handle populating aliases of the first element of the dot-notation key
    if (splitKey.length > 1 && configuration['dot-notation']) {
      (flags.aliases[splitKey[0]] || []).forEach(function (x) {
        x = x.split('.');

        // expand alias with nested objects in key
        var a = [].concat(splitKey);
        a.shift(); // nuke the old key.
        x = x.concat(a);

        setKey(argv, x, value);
      });
    }

    // Set normalize getter and setter when key is in 'normalize' but isn't an array
    if (checkAllAliases(key, flags.normalize) && !checkAllAliases(key, flags.arrays)) {
      var keys = [key].concat(flags.aliases[key] || []);
      keys.forEach(function (key) {
        argv.__defineSetter__(key, function (v) {
          val = path$2.normalize(v);
        });

        argv.__defineGetter__(key, function () {
          return typeof val === 'string' ? path$2.normalize(val) : val
        });
      });
    }
  }

  function processValue (key, val) {
    // handle parsing boolean arguments --foo=true --bar false.
    if (checkAllAliases(key, flags.bools) || checkAllAliases(key, flags.counts)) {
      if (typeof val === 'string') val = val === 'true';
    }

    var value = val;
    if (!checkAllAliases(key, flags.strings) && !checkAllAliases(key, flags.coercions)) {
      if (isNumber(val)) value = Number(val);
      if (!isUndefined(val) && !isNumber(val) && checkAllAliases(key, flags.numbers)) value = NaN;
    }

    // increment a count given as arg (either no value or value parsed as boolean)
    if (checkAllAliases(key, flags.counts) && (isUndefined(value) || typeof value === 'boolean')) {
      value = increment;
    }

    // Set normalized value when key is in 'normalize' and in 'arrays'
    if (checkAllAliases(key, flags.normalize) && checkAllAliases(key, flags.arrays)) {
      if (Array.isArray(val)) value = val.map(path$2.normalize);
      else value = path$2.normalize(val);
    }
    return value
  }

  // set args from config.json file, this should be
  // applied last so that defaults can be applied.
  function setConfig (argv) {
    var configLookup = {};

    // expand defaults/aliases, in-case any happen to reference
    // the config.json file.
    applyDefaultsAndAliases(configLookup, flags.aliases, defaults);

    Object.keys(flags.configs).forEach(function (configKey) {
      var configPath = argv[configKey] || configLookup[configKey];
      if (configPath) {
        try {
          var config = null;
          var resolvedConfigPath = path$2.resolve(process.cwd(), configPath);

          if (typeof flags.configs[configKey] === 'function') {
            try {
              config = flags.configs[configKey](resolvedConfigPath);
            } catch (e) {
              config = e;
            }
            if (config instanceof Error) {
              error = config;
              return
            }
          } else {
            config = require(resolvedConfigPath);
          }

          setConfigObject(config);
        } catch (ex) {
          if (argv[configKey]) error = Error(__('Invalid JSON config file: %s', configPath));
        }
      }
    });
  }

  // set args from config object.
  // it recursively checks nested objects.
  function setConfigObject (config, prev) {
    Object.keys(config).forEach(function (key) {
      var value = config[key];
      var fullKey = prev ? prev + '.' + key : key;

      // if the value is an inner object and we have dot-notation
      // enabled, treat inner objects in config the same as
      // heavily nested dot notations (foo.bar.apple).
      if (typeof value === 'object' && !Array.isArray(value) && configuration['dot-notation']) {
        // if the value is an object but not an array, check nested object
        setConfigObject(value, fullKey);
      } else {
        // setting arguments via CLI takes precedence over
        // values within the config file.
        if (!hasKey(argv, fullKey.split('.')) || (flags.defaulted[fullKey])) {
          setArg(fullKey, value);
        }
      }
    });
  }

  // set all config objects passed in opts
  function setConfigObjects () {
    if (typeof configObjects === 'undefined') return
    configObjects.forEach(function (configObject) {
      setConfigObject(configObject);
    });
  }

  function applyEnvVars (argv, configOnly) {
    if (typeof envPrefix === 'undefined') return

    var prefix = typeof envPrefix === 'string' ? envPrefix : '';
    Object.keys(process.env).forEach(function (envVar) {
      if (prefix === '' || envVar.lastIndexOf(prefix, 0) === 0) {
        // get array of nested keys and convert them to camel case
        var keys = envVar.split('__').map(function (key, i) {
          if (i === 0) {
            key = key.substring(prefix.length);
          }
          return camelCase$1(key)
        });

        if (((configOnly && flags.configs[keys.join('.')]) || !configOnly) && (!hasKey(argv, keys) || flags.defaulted[keys.join('.')])) {
          setArg(keys.join('.'), process.env[envVar]);
        }
      }
    });
  }

  function applyCoercions (argv) {
    var coerce;
    Object.keys(argv).forEach(function (key) {
      coerce = checkAllAliases(key, flags.coercions);
      if (typeof coerce === 'function') {
        try {
          argv[key] = coerce(argv[key]);
        } catch (err) {
          error = err;
        }
      }
    });
  }

  function applyDefaultsAndAliases (obj, aliases, defaults) {
    Object.keys(defaults).forEach(function (key) {
      if (!hasKey(obj, key.split('.'))) {
        setKey(obj, key.split('.'), defaults[key])

        ;(aliases[key] || []).forEach(function (x) {
          if (hasKey(obj, x.split('.'))) return
          setKey(obj, x.split('.'), defaults[key]);
        });
      }
    });
  }

  function hasKey (obj, keys) {
    var o = obj;

    if (!configuration['dot-notation']) keys = [keys.join('.')];

    keys.slice(0, -1).forEach(function (key) {
      o = (o[key] || {});
    });

    var key = keys[keys.length - 1];

    if (typeof o !== 'object') return false
    else return key in o
  }

  function setKey (obj, keys, value) {
    var o = obj;

    if (!configuration['dot-notation']) keys = [keys.join('.')];

    keys.slice(0, -1).forEach(function (key) {
      if (o[key] === undefined) o[key] = {};
      o = o[key];
    });

    var key = keys[keys.length - 1];

    var isTypeArray = checkAllAliases(keys.join('.'), flags.arrays);
    var isValueArray = Array.isArray(value);
    var duplicate = configuration['duplicate-arguments-array'];

    if (value === increment) {
      o[key] = increment(o[key]);
    } else if (Array.isArray(o[key])) {
      if (duplicate && isTypeArray && isValueArray) {
        o[key] = configuration['flatten-duplicate-arrays'] ? o[key].concat(value) : [o[key]].concat([value]);
      } else if (!duplicate && Boolean(isTypeArray) === Boolean(isValueArray)) {
        o[key] = value;
      } else {
        o[key] = o[key].concat([value]);
      }
    } else if (o[key] === undefined && isTypeArray) {
      o[key] = isValueArray ? value : [value];
    } else if (duplicate && !(o[key] === undefined || checkAllAliases(key, flags.bools) || checkAllAliases(keys.join('.'), flags.bools) || checkAllAliases(key, flags.counts))) {
      o[key] = [ o[key], value ];
    } else {
      o[key] = value;
    }
  }

  // extend the aliases list with inferred aliases.
  function extendAliases () {
    Array.prototype.slice.call(arguments).forEach(function (obj) {
      Object.keys(obj || {}).forEach(function (key) {
        // short-circuit if we've already added a key
        // to the aliases array, for example it might
        // exist in both 'opts.default' and 'opts.key'.
        if (flags.aliases[key]) return

        flags.aliases[key] = [].concat(aliases[key] || []);
        // For "--option-name", also set argv.optionName
        flags.aliases[key].concat(key).forEach(function (x) {
          if (/-/.test(x) && configuration['camel-case-expansion']) {
            var c = camelCase$1(x);
            flags.aliases[key].push(c);
            newAliases[c] = true;
          }
        });
        flags.aliases[key].forEach(function (x) {
          flags.aliases[x] = [key].concat(flags.aliases[key].filter(function (y) {
            return x !== y
          }));
        });
      });
    });
  }

  // check if a flag is set for any of a key's aliases.
  function checkAllAliases (key, flag) {
    var isSet = false;
    var toCheck = [].concat(flags.aliases[key] || [], key);

    toCheck.forEach(function (key) {
      if (flag[key]) isSet = flag[key];
    });

    return isSet
  }

  function setDefaulted (key) {
    [].concat(flags.aliases[key] || [], key).forEach(function (k) {
      flags.defaulted[k] = true;
    });
  }

  function unsetDefaulted (key) {
    [].concat(flags.aliases[key] || [], key).forEach(function (k) {
      delete flags.defaulted[k];
    });
  }

  // return a default value, given the type of a flag.,
  // e.g., key of type 'string' will default to '', rather than 'true'.
  function defaultForType (type) {
    var def = {
      boolean: true,
      string: '',
      number: undefined,
      array: []
    };

    return def[type]
  }

  // given a flag, enforce a default type.
  function guessType (key, flags) {
    var type = 'boolean';

    if (checkAllAliases(key, flags.strings)) type = 'string';
    else if (checkAllAliases(key, flags.numbers)) type = 'number';
    else if (checkAllAliases(key, flags.arrays)) type = 'array';

    return type
  }

  function isNumber (x) {
    if (!configuration['parse-numbers']) return false
    if (typeof x === 'number') return true
    if (/^0x[0-9a-f]+$/i.test(x)) return true
    return /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(e[-+]?\d+)?$/.test(x)
  }

  function isUndefined (num) {
    return num === undefined
  }

  return {
    argv: argv,
    error: error,
    aliases: flags.aliases,
    newAliases: newAliases,
    configuration: configuration
  }
}

// if any aliases reference each other, we should
// merge them together.
function combineAliases (aliases) {
  var aliasArrays = [];
  var change = true;
  var combined = {};

  // turn alias lookup hash {key: ['alias1', 'alias2']} into
  // a simple array ['key', 'alias1', 'alias2']
  Object.keys(aliases).forEach(function (key) {
    aliasArrays.push(
      [].concat(aliases[key], key)
    );
  });

  // combine arrays until zero changes are
  // made in an iteration.
  while (change) {
    change = false;
    for (var i = 0; i < aliasArrays.length; i++) {
      for (var ii = i + 1; ii < aliasArrays.length; ii++) {
        var intersect = aliasArrays[i].filter(function (v) {
          return aliasArrays[ii].indexOf(v) !== -1
        });

        if (intersect.length) {
          aliasArrays[i] = aliasArrays[i].concat(aliasArrays[ii]);
          aliasArrays.splice(ii, 1);
          change = true;
          break
        }
      }
    }
  }

  // map arrays back to the hash-lookup (de-dupe while
  // we're at it).
  aliasArrays.forEach(function (aliasArray) {
    aliasArray = aliasArray.filter(function (v, i, self) {
      return self.indexOf(v) === i
    });
    combined[aliasArray.pop()] = aliasArray;
  });

  return combined
}

function assign$2 (defaults, configuration) {
  var o = {};
  configuration = configuration || {};

  Object.keys(defaults).forEach(function (k) {
    o[k] = defaults[k];
  });
  Object.keys(configuration).forEach(function (k) {
    o[k] = configuration[k];
  });

  return o
}

// this function should only be called when a count is given as an arg
// it is NOT called to set a default value
// thus we can start the count at 1 instead of 0
function increment (orig) {
  return orig !== undefined ? orig + 1 : 1
}

function Parser (args, opts) {
  var result = parse(args.slice(), opts);

  return result.argv
}

// parse arguments and return detailed
// meta information, aliases, etc.
Parser.detailed = function (args, opts) {
  return parse(args.slice(), opts)
};

module.exports = Parser;


var index$5 = Object.freeze({

});

var ansiRegex = require('ansi-regex')();

module.exports = function (str) {
	return typeof str === 'string' ? str.replace(ansiRegex, '') : str;
};


var index$8 = Object.freeze({

});

/* eslint-disable yoda */
var index$9 = x => {
	if (Number.isNaN(x)) {
		return false;
	}

	// code points are derived from:
	// http://www.unix.org/Public/UNIDATA/EastAsianWidth.txt
	if (
		x >= 0x1100 && (
			x <= 0x115f ||  // Hangul Jamo
			x === 0x2329 || // LEFT-POINTING ANGLE BRACKET
			x === 0x232a || // RIGHT-POINTING ANGLE BRACKET
			// CJK Radicals Supplement .. Enclosed CJK Letters and Months
			(0x2e80 <= x && x <= 0x3247 && x !== 0x303f) ||
			// Enclosed CJK Letters and Months .. CJK Unified Ideographs Extension A
			(0x3250 <= x && x <= 0x4dbf) ||
			// CJK Unified Ideographs .. Yi Radicals
			(0x4e00 <= x && x <= 0xa4c6) ||
			// Hangul Jamo Extended-A
			(0xa960 <= x && x <= 0xa97c) ||
			// Hangul Syllables
			(0xac00 <= x && x <= 0xd7a3) ||
			// CJK Compatibility Ideographs
			(0xf900 <= x && x <= 0xfaff) ||
			// Vertical Forms
			(0xfe10 <= x && x <= 0xfe19) ||
			// CJK Compatibility Forms .. Small Form Variants
			(0xfe30 <= x && x <= 0xfe6b) ||
			// Halfwidth and Fullwidth Forms
			(0xff01 <= x && x <= 0xff60) ||
			(0xffe0 <= x && x <= 0xffe6) ||
			// Kana Supplement
			(0x1b000 <= x && x <= 0x1b001) ||
			// Enclosed Ideographic Supplement
			(0x1f200 <= x && x <= 0x1f251) ||
			// CJK Unified Ideographs Extension B .. Tertiary Ideographic Plane
			(0x20000 <= x && x <= 0x3fffd)
		)
	) {
		return true;
	}

	return false;
};

var stripAnsi = ( index$8 && undefined ) || index$8;

var index$6 = str => {
	if (typeof str !== 'string' || str.length === 0) {
		return 0;
	}

	let width = 0;

	str = stripAnsi(str);

	for (let i = 0; i < str.length; i++) {
		const code = str.codePointAt(i);

		// ignore control characters
		if (code <= 0x1f || (code >= 0x7f && code <= 0x9f)) {
			continue;
		}

		// surrogates
		if (code >= 0x10000) {
			i++;
		}

		if (index$9(code)) {
			width += 2;
		} else {
			width++;
		}
	}

	return width;
};

var objFilter = function (original, filter) {
  const obj = {};
  filter = filter || function (k, v) { return true };
  Object.keys(original || {}).forEach(function (key) {
    if (filter(key, original[key])) {
      obj[key] = original[key];
    }
  });
  return obj
};

module.exports = function (blocking) {
  [process.stdout, process.stderr].forEach(function (stream) {
    if (stream._handle && stream.isTTY && typeof stream._handle.setBlocking === 'function') {
      stream._handle.setBlocking(blocking);
    }
  });
};


var index$11 = Object.freeze({

});

var stringWidth = require('string-width');
var stripAnsi$1 = require('strip-ansi');
var wrap = require('wrap-ansi');
var align = {
  right: alignRight,
  center: alignCenter
};
var top = 0;
var right = 1;
var bottom = 2;
var left = 3;

function UI (opts) {
  this.width = opts.width;
  this.wrap = opts.wrap;
  this.rows = [];
}

UI.prototype.span = function () {
  var cols = this.div.apply(this, arguments);
  cols.span = true;
};

UI.prototype.div = function () {
  if (arguments.length === 0) this.div('');
  if (this.wrap && this._shouldApplyLayoutDSL.apply(this, arguments)) {
    return this._applyLayoutDSL(arguments[0])
  }

  var cols = [];

  for (var i = 0, arg; (arg = arguments[i]) !== undefined; i++) {
    if (typeof arg === 'string') cols.push(this._colFromString(arg));
    else cols.push(arg);
  }

  this.rows.push(cols);
  return cols
};

UI.prototype._shouldApplyLayoutDSL = function () {
  return arguments.length === 1 && typeof arguments[0] === 'string' &&
    /[\t\n]/.test(arguments[0])
};

UI.prototype._applyLayoutDSL = function (str) {
  var _this = this;
  var rows = str.split('\n');
  var leftColumnWidth = 0;

  // simple heuristic for layout, make sure the
  // second column lines up along the left-hand.
  // don't allow the first column to take up more
  // than 50% of the screen.
  rows.forEach(function (row) {
    var columns = row.split('\t');
    if (columns.length > 1 && stringWidth(columns[0]) > leftColumnWidth) {
      leftColumnWidth = Math.min(
        Math.floor(_this.width * 0.5),
        stringWidth(columns[0])
      );
    }
  });

  // generate a table:
  //  replacing ' ' with padding calculations.
  //  using the algorithmically generated width.
  rows.forEach(function (row) {
    var columns = row.split('\t');
    _this.div.apply(_this, columns.map(function (r, i) {
      return {
        text: r.trim(),
        padding: _this._measurePadding(r),
        width: (i === 0 && columns.length > 1) ? leftColumnWidth : undefined
      }
    }));
  });

  return this.rows[this.rows.length - 1]
};

UI.prototype._colFromString = function (str) {
  return {
    text: str,
    padding: this._measurePadding(str)
  }
};

UI.prototype._measurePadding = function (str) {
  // measure padding without ansi escape codes
  var noAnsi = stripAnsi$1(str);
  return [0, noAnsi.match(/\s*$/)[0].length, 0, noAnsi.match(/^\s*/)[0].length]
};

UI.prototype.toString = function () {
  var _this = this;
  var lines = [];

  _this.rows.forEach(function (row, i) {
    _this.rowToString(row, lines);
  });

  // don't display any lines with the
  // hidden flag set.
  lines = lines.filter(function (line) {
    return !line.hidden
  });

  return lines.map(function (line) {
    return line.text
  }).join('\n')
};

UI.prototype.rowToString = function (row, lines) {
  var _this = this;
  var padding;
  var rrows = this._rasterize(row);
  var str = '';
  var ts;
  var width;
  var wrapWidth;

  rrows.forEach(function (rrow, r) {
    str = '';
    rrow.forEach(function (col, c) {
      ts = ''; // temporary string used during alignment/padding.
      width = row[c].width; // the width with padding.
      wrapWidth = _this._negatePadding(row[c]); // the width without padding.

      ts += col;

      for (var i = 0; i < wrapWidth - stringWidth(col); i++) {
        ts += ' ';
      }

      // align the string within its column.
      if (row[c].align && row[c].align !== 'left' && _this.wrap) {
        ts = align[row[c].align](ts, wrapWidth);
        if (stringWidth(ts) < wrapWidth) ts += new Array(width - stringWidth(ts)).join(' ');
      }

      // apply border and padding to string.
      padding = row[c].padding || [0, 0, 0, 0];
      if (padding[left]) str += new Array(padding[left] + 1).join(' ');
      str += addBorder(row[c], ts, '| ');
      str += ts;
      str += addBorder(row[c], ts, ' |');
      if (padding[right]) str += new Array(padding[right] + 1).join(' ');

      // if prior row is span, try to render the
      // current row on the prior line.
      if (r === 0 && lines.length > 0) {
        str = _this._renderInline(str, lines[lines.length - 1]);
      }
    });

    // remove trailing whitespace.
    lines.push({
      text: str.replace(/ +$/, ''),
      span: row.span
    });
  });

  return lines
};

function addBorder (col, ts, style) {
  if (col.border) {
    if (/[.']-+[.']/.test(ts)) return ''
    else if (ts.trim().length) return style
    else return '  '
  }
  return ''
}

// if the full 'source' can render in
// the target line, do so.
UI.prototype._renderInline = function (source, previousLine) {
  var leadingWhitespace = source.match(/^ */)[0].length;
  var target = previousLine.text;
  var targetTextWidth = stringWidth(target.trimRight());

  if (!previousLine.span) return source

  // if we're not applying wrapping logic,
  // just always append to the span.
  if (!this.wrap) {
    previousLine.hidden = true;
    return target + source
  }

  if (leadingWhitespace < targetTextWidth) return source

  previousLine.hidden = true;

  return target.trimRight() + new Array(leadingWhitespace - targetTextWidth + 1).join(' ') + source.trimLeft()
};

UI.prototype._rasterize = function (row) {
  var _this = this;
  var i;
  var rrow;
  var rrows = [];
  var widths = this._columnWidths(row);
  var wrapped;

  // word wrap all columns, and create
  // a data-structure that is easy to rasterize.
  row.forEach(function (col, c) {
    // leave room for left and right padding.
    col.width = widths[c];
    if (_this.wrap) wrapped = wrap(col.text, _this._negatePadding(col), {hard: true}).split('\n');
    else wrapped = col.text.split('\n');

    if (col.border) {
      wrapped.unshift('.' + new Array(_this._negatePadding(col) + 3).join('-') + '.');
      wrapped.push("'" + new Array(_this._negatePadding(col) + 3).join('-') + "'");
    }

    // add top and bottom padding.
    if (col.padding) {
      for (i = 0; i < (col.padding[top] || 0); i++) wrapped.unshift('');
      for (i = 0; i < (col.padding[bottom] || 0); i++) wrapped.push('');
    }

    wrapped.forEach(function (str, r) {
      if (!rrows[r]) rrows.push([]);

      rrow = rrows[r];

      for (var i = 0; i < c; i++) {
        if (rrow[i] === undefined) rrow.push('');
      }
      rrow.push(str);
    });
  });

  return rrows
};

UI.prototype._negatePadding = function (col) {
  var wrapWidth = col.width;
  if (col.padding) wrapWidth -= (col.padding[left] || 0) + (col.padding[right] || 0);
  if (col.border) wrapWidth -= 4;
  return wrapWidth
};

UI.prototype._columnWidths = function (row) {
  var _this = this;
  var widths = [];
  var unset = row.length;
  var unsetWidth;
  var remainingWidth = this.width;

  // column widths can be set in config.
  row.forEach(function (col, i) {
    if (col.width) {
      unset--;
      widths[i] = col.width;
      remainingWidth -= col.width;
    } else {
      widths[i] = undefined;
    }
  });

  // any unset widths should be calculated.
  if (unset) unsetWidth = Math.floor(remainingWidth / unset);
  widths.forEach(function (w, i) {
    if (!_this.wrap) widths[i] = row[i].width || stringWidth(row[i].text);
    else if (w === undefined) widths[i] = Math.max(unsetWidth, _minWidth(row[i]));
  });

  return widths
};

// calculates the minimum width of
// a column, based on padding preferences.
function _minWidth (col) {
  var padding = col.padding || [];
  var minWidth = 1 + (padding[left] || 0) + (padding[right] || 0);
  if (col.border) minWidth += 4;
  return minWidth
}

function alignRight (str, width) {
  str = str.trim();
  var padding = '';
  var strWidth = stringWidth(str);

  if (strWidth < width) {
    padding = new Array(width - strWidth + 1).join(' ');
  }

  return padding + str
}

function alignCenter (str, width) {
  str = str.trim();
  var padding = '';
  var strWidth = stringWidth(str.trim());

  if (strWidth < width) {
    padding = new Array(parseInt((width - strWidth) / 2, 10) + 1).join(' ');
  }

  return padding + str
}

module.exports = function (opts) {
  opts = opts || {};

  return new UI({
    width: (opts || {}).width || 80,
    wrap: typeof opts.wrap === 'boolean' ? opts.wrap : true
  })
};


var index$12 = Object.freeze({

});

module.exports = function (str, sep) {
	if (typeof str !== 'string') {
		throw new TypeError('Expected a string');
	}

	sep = typeof sep === 'undefined' ? '_' : sep;

	return str
		.replace(/([a-z\d])([A-Z])/g, '$1' + sep + '$2')
		.replace(/([A-Z]+)([A-Z][a-z\d]+)/g, '$1' + sep + '$2')
		.toLowerCase();
};


var index$13 = Object.freeze({

});

var setBlocking = ( index$11 && undefined ) || index$11;

var require$$0$2 = ( index$12 && undefined ) || index$12;

var require$$1$1 = ( index$13 && undefined ) || index$13;

// this file handles outputting usage instructions,
// failures, etc. keeps logging in one place.





var usage = function (yargs, y18n) {
  const __ = y18n.__;
  const self = {};

  // methods for ouputting/building failure message.
  var fails = [];
  self.failFn = function (f) {
    fails.push(f);
  };

  var failMessage = null;
  var showHelpOnFail = true;
  self.showHelpOnFail = function (enabled, message) {
    if (typeof enabled === 'string') {
      message = enabled;
      enabled = true;
    } else if (typeof enabled === 'undefined') {
      enabled = true;
    }
    failMessage = message;
    showHelpOnFail = enabled;
    return self
  };

  var failureOutput = false;
  self.fail = function (msg, err) {
    const logger = yargs._getLoggerInstance();

    if (fails.length) {
      for (var i = fails.length - 1; i >= 0; --i) {
        fails[i](msg, err, self);
      }
    } else {
      if (yargs.getExitProcess()) setBlocking(true);

      // don't output failure message more than once
      if (!failureOutput) {
        failureOutput = true;
        if (showHelpOnFail) yargs.showHelp('error');
        if (msg) logger.error(msg);
        if (failMessage) {
          if (msg) logger.error('');
          logger.error(failMessage);
        }
      }

      err = err || new yerror(msg);
      if (yargs.getExitProcess()) {
        return yargs.exit(1)
      } else if (yargs._hasParseCallback()) {
        return yargs.exit(1, err)
      } else {
        throw err
      }
    }
  };

  // methods for ouputting/building help (usage) message.
  var usage;
  self.usage = function (msg) {
    usage = msg;
  };
  self.getUsage = function () {
    return usage
  };

  var examples = [];
  self.example = function (cmd, description) {
    examples.push([cmd, description || '']);
  };

  var commands = [];
  self.command = function (cmd, description, isDefault, aliases) {
    // the last default wins, so cancel out any previously set default
    if (isDefault) {
      commands = commands.map(function (cmdArray) {
        cmdArray[2] = false;
        return cmdArray
      });
    }
    commands.push([cmd, description || '', isDefault, aliases]);
  };
  self.getCommands = function () {
    return commands
  };

  var descriptions = {};
  self.describe = function (key, desc) {
    if (typeof key === 'object') {
      Object.keys(key).forEach(function (k) {
        self.describe(k, key[k]);
      });
    } else {
      descriptions[key] = desc;
    }
  };
  self.getDescriptions = function () {
    return descriptions
  };

  var epilog;
  self.epilog = function (msg) {
    epilog = msg;
  };

  var wrapSet = false;
  var wrap;
  self.wrap = function (cols) {
    wrapSet = true;
    wrap = cols;
  };

  function getWrap () {
    if (!wrapSet) {
      wrap = windowWidth();
      wrapSet = true;
    }

    return wrap
  }

  var deferY18nLookupPrefix = '__yargsString__:';
  self.deferY18nLookup = function (str) {
    return deferY18nLookupPrefix + str
  };

  var defaultGroup = 'Options:';
  self.help = function () {
    normalizeAliases();

    // handle old demanded API
    var demandedOptions = yargs.getDemandedOptions();
    var demandedCommands = yargs.getDemandedCommands();
    var groups = yargs.getGroups();
    var options = yargs.getOptions();
    var keys = Object.keys(
      Object.keys(descriptions)
      .concat(Object.keys(demandedOptions))
      .concat(Object.keys(demandedCommands))
      .concat(Object.keys(options.default))
      .reduce(function (acc, key) {
        if (key !== '_') acc[key] = true;
        return acc
      }, {})
    );

    var theWrap = getWrap();
    var ui = require$$0$2({
      width: theWrap,
      wrap: !!theWrap
    });

    // the usage string.
    if (usage) {
      var u = usage.replace(/\$0/g, yargs.$0);
      ui.div(u + '\n');
    }

    // your application's commands, i.e., non-option
    // arguments populated in '_'.
    if (commands.length) {
      ui.div(__('Commands:'));

      commands.forEach(function (command) {
        ui.span(
          {text: command[0], padding: [0, 2, 0, 2], width: maxWidth(commands, theWrap) + 4},
          {text: command[1]}
        );
        var hints = [];
        if (command[2]) hints.push('[' + __('default:').slice(0, -1) + ']'); // TODO hacking around i18n here
        if (command[3] && command[3].length) {
          hints.push('[' + __('aliases:') + ' ' + command[3].join(', ') + ']');
        }
        if (hints.length) {
          ui.div({text: hints.join(' '), padding: [0, 0, 0, 2], align: 'right'});
        } else {
          ui.div();
        }
      });

      ui.div();
    }

    // perform some cleanup on the keys array, making it
    // only include top-level keys not their aliases.
    var aliasKeys = (Object.keys(options.alias) || [])
      .concat(Object.keys(yargs.parsed.newAliases) || []);

    keys = keys.filter(function (key) {
      return !yargs.parsed.newAliases[key] && aliasKeys.every(function (alias) {
        return (options.alias[alias] || []).indexOf(key) === -1
      })
    });

    // populate 'Options:' group with any keys that have not
    // explicitly had a group set.
    if (!groups[defaultGroup]) groups[defaultGroup] = [];
    addUngroupedKeys(keys, options.alias, groups);

    // display 'Options:' table along with any custom tables:
    Object.keys(groups).forEach(function (groupName) {
      if (!groups[groupName].length) return

      ui.div(__(groupName));

      // if we've grouped the key 'f', but 'f' aliases 'foobar',
      // normalizedKeys should contain only 'foobar'.
      var normalizedKeys = groups[groupName].map(function (key) {
        if (~aliasKeys.indexOf(key)) return key
        for (var i = 0, aliasKey; (aliasKey = aliasKeys[i]) !== undefined; i++) {
          if (~(options.alias[aliasKey] || []).indexOf(key)) return aliasKey
        }
        return key
      });

      // actually generate the switches string --foo, -f, --bar.
      var switches = normalizedKeys.reduce(function (acc, key) {
        acc[key] = [ key ].concat(options.alias[key] || [])
          .map(function (sw) {
            return (sw.length > 1 ? '--' : '-') + sw
          })
          .join(', ');

        return acc
      }, {});

      normalizedKeys.forEach(function (key) {
        var kswitch = switches[key];
        var desc = descriptions[key] || '';
        var type = null;

        if (~desc.lastIndexOf(deferY18nLookupPrefix)) desc = __(desc.substring(deferY18nLookupPrefix.length));

        if (~options.boolean.indexOf(key)) type = '[' + __('boolean') + ']';
        if (~options.count.indexOf(key)) type = '[' + __('count') + ']';
        if (~options.string.indexOf(key)) type = '[' + __('string') + ']';
        if (~options.normalize.indexOf(key)) type = '[' + __('string') + ']';
        if (~options.array.indexOf(key)) type = '[' + __('array') + ']';
        if (~options.number.indexOf(key)) type = '[' + __('number') + ']';

        var extra = [
          type,
          (key in demandedOptions) ? '[' + __('required') + ']' : null,
          options.choices && options.choices[key] ? '[' + __('choices:') + ' ' +
            self.stringifiedValues(options.choices[key]) + ']' : null,
          defaultString(options.default[key], options.defaultDescription[key])
        ].filter(Boolean).join(' ');

        ui.span(
          {text: kswitch, padding: [0, 2, 0, 2], width: maxWidth(switches, theWrap) + 4},
          desc
        );

        if (extra) ui.div({text: extra, padding: [0, 0, 0, 2], align: 'right'});
        else ui.div();
      });

      ui.div();
    });

    // describe some common use-cases for your application.
    if (examples.length) {
      ui.div(__('Examples:'));

      examples.forEach(function (example) {
        example[0] = example[0].replace(/\$0/g, yargs.$0);
      });

      examples.forEach(function (example) {
        if (example[1] === '') {
          ui.div(
            {
              text: example[0],
              padding: [0, 2, 0, 2]
            }
          );
        } else {
          ui.div(
            {
              text: example[0],
              padding: [0, 2, 0, 2],
              width: maxWidth(examples, theWrap) + 4
            }, {
              text: example[1]
            }
          );
        }
      });

      ui.div();
    }

    // the usage string.
    if (epilog) {
      var e = epilog.replace(/\$0/g, yargs.$0);
      ui.div(e + '\n');
    }

    return ui.toString()
  };

  // return the maximum width of a string
  // in the left-hand column of a table.
  function maxWidth (table, theWrap) {
    var width = 0;

    // table might be of the form [leftColumn],
    // or {key: leftColumn}
    if (!Array.isArray(table)) {
      table = Object.keys(table).map(function (key) {
        return [table[key]]
      });
    }

    table.forEach(function (v) {
      width = Math.max(index$6(v[0]), width);
    });

    // if we've enabled 'wrap' we should limit
    // the max-width of the left-column.
    if (theWrap) width = Math.min(width, parseInt(theWrap * 0.5, 10));

    return width
  }

  // make sure any options set for aliases,
  // are copied to the keys being aliased.
  function normalizeAliases () {
    // handle old demanded API
    var demandedOptions = yargs.getDemandedOptions();
    var options = yargs.getOptions();(Object.keys(options.alias) || []).forEach(function (key) {
      options.alias[key].forEach(function (alias) {
        // copy descriptions.
        if (descriptions[alias]) self.describe(key, descriptions[alias]);
        // copy demanded.
        if (alias in demandedOptions) yargs.demandOption(key, demandedOptions[alias]);
        // type messages.
        if (~options.boolean.indexOf(alias)) yargs.boolean(key);
        if (~options.count.indexOf(alias)) yargs.count(key);
        if (~options.string.indexOf(alias)) yargs.string(key);
        if (~options.normalize.indexOf(alias)) yargs.normalize(key);
        if (~options.array.indexOf(alias)) yargs.array(key);
        if (~options.number.indexOf(alias)) yargs.number(key);
      });
    });
  }

  // given a set of keys, place any keys that are
  // ungrouped under the 'Options:' grouping.
  function addUngroupedKeys (keys, aliases, groups) {
    var groupedKeys = [];
    var toCheck = null;
    Object.keys(groups).forEach(function (group) {
      groupedKeys = groupedKeys.concat(groups[group]);
    });

    keys.forEach(function (key) {
      toCheck = [key].concat(aliases[key]);
      if (!toCheck.some(function (k) {
        return groupedKeys.indexOf(k) !== -1
      })) {
        groups[defaultGroup].push(key);
      }
    });
    return groupedKeys
  }

  self.showHelp = function (level) {
    const logger = yargs._getLoggerInstance();
    if (!level) level = 'error';
    var emit = typeof level === 'function' ? level : logger[level];
    emit(self.help());
  };

  self.functionDescription = function (fn) {
    var description = fn.name ? require$$1$1(fn.name, '-') : __('generated-value');
    return ['(', description, ')'].join('')
  };

  self.stringifiedValues = function (values, separator) {
    var string = '';
    var sep = separator || ', ';
    var array = [].concat(values);

    if (!values || !array.length) return string

    array.forEach(function (value) {
      if (string.length) string += sep;
      string += JSON.stringify(value);
    });

    return string
  };

  // format the default-value-string displayed in
  // the right-hand column.
  function defaultString (value, defaultDescription) {
    var string = '[' + __('default:') + ' ';

    if (value === undefined && !defaultDescription) return null

    if (defaultDescription) {
      string += defaultDescription;
    } else {
      switch (typeof value) {
        case 'string':
          string += JSON.stringify(value);
          break
        case 'object':
          string += JSON.stringify(value);
          break
        default:
          string += value;
      }
    }

    return string + ']'
  }

  // guess the width of the console window, max-width 80.
  function windowWidth () {
    var maxWidth = 80;
    if (typeof process === 'object' && process.stdout && process.stdout.columns) {
      return Math.min(maxWidth, process.stdout.columns)
    } else {
      return maxWidth
    }
  }

  // logic for displaying application version.
  var version = null;
  self.version = function (ver) {
    version = ver;
  };

  self.showVersion = function () {
    const logger = yargs._getLoggerInstance();
    if (typeof version === 'function') logger.log(version());
    else logger.log(version);
  };

  self.reset = function (localLookup) {
    // do not reset wrap here
    // do not reset fails here
    failMessage = null;
    failureOutput = false;
    usage = undefined;
    epilog = undefined;
    examples = [];
    commands = [];
    descriptions = objFilter(descriptions, function (k, v) {
      return !localLookup[k]
    });
    return self
  };

  var frozen;
  self.freeze = function () {
    frozen = {};
    frozen.failMessage = failMessage;
    frozen.failureOutput = failureOutput;
    frozen.usage = usage;
    frozen.epilog = epilog;
    frozen.examples = examples;
    frozen.commands = commands;
    frozen.descriptions = descriptions;
  };
  self.unfreeze = function () {
    failMessage = frozen.failMessage;
    failureOutput = frozen.failureOutput;
    usage = frozen.usage;
    epilog = frozen.epilog;
    examples = frozen.examples;
    commands = frozen.commands;
    descriptions = frozen.descriptions;
    frozen = undefined;
  };

  return self
};

/*
Copyright (c) 2011 Andrei Mackenzie

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

// levenshtein distance algorithm, pulled from Andrei Mackenzie's MIT licensed.
// gist, which can be found here: https://gist.github.com/andrei-m/982927

// Compute the edit distance between the two given strings
var levenshtein = function (a, b) {
  if (a.length === 0) return b.length
  if (b.length === 0) return a.length

  var matrix = [];

  // increment along the first column of each row
  var i;
  for (i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  // increment each column in the first row
  var j;
  for (j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Fill in the rest of the matrix
  for (i = 1; i <= b.length; i++) {
    for (j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, // substitution
                                Math.min(matrix[i][j - 1] + 1, // insertion
                                         matrix[i - 1][j] + 1)); // deletion
      }
    }
  }

  return matrix[b.length][a.length]
};

const specialKeys = ['$0', '--', '_'];

// validation-type-stuff, missing params,
// bad implications, custom checks.
var validation = function (yargs, usage, y18n) {
  const __ = y18n.__;
  const __n = y18n.__n;
  const self = {};

  // validate appropriate # of non-option
  // arguments were provided, i.e., '_'.
  self.nonOptionCount = function (argv) {
    const demandedCommands = yargs.getDemandedCommands();
    // don't count currently executing commands
    const _s = argv._.length - yargs.getContext().commands.length;

    if (demandedCommands._ && (_s < demandedCommands._.min || _s > demandedCommands._.max)) {
      if (_s < demandedCommands._.min) {
        if (demandedCommands._.minMsg !== undefined) {
          usage.fail(
            // replace $0 with observed, $1 with expected.
            demandedCommands._.minMsg ? demandedCommands._.minMsg.replace(/\$0/g, _s).replace(/\$1/, demandedCommands._.min) : null
          );
        } else {
          usage.fail(
            __('Not enough non-option arguments: got %s, need at least %s', _s, demandedCommands._.min)
          );
        }
      } else if (_s > demandedCommands._.max) {
        if (demandedCommands._.maxMsg !== undefined) {
          usage.fail(
            // replace $0 with observed, $1 with expected.
            demandedCommands._.maxMsg ? demandedCommands._.maxMsg.replace(/\$0/g, _s).replace(/\$1/, demandedCommands._.max) : null
          );
        } else {
          usage.fail(
          __('Too many non-option arguments: got %s, maximum of %s', _s, demandedCommands._.max)
          );
        }
      }
    }
  };

  // validate the appropriate # of <required>
  // positional arguments were provided:
  self.positionalCount = function (required, observed) {
    if (observed < required) {
      usage.fail(
        __('Not enough non-option arguments: got %s, need at least %s', observed, required)
      );
    }
  };

  // make sure that any args that require an
  // value (--foo=bar), have a value.
  self.missingArgumentValue = function (argv) {
    const defaultValues = [true, false, ''];
    const options = yargs.getOptions();

    if (options.requiresArg.length > 0) {
      const missingRequiredArgs = [];

      options.requiresArg.forEach(function (key) {
        const value = argv[key];

        // if a value is explicitly requested,
        // flag argument as missing if it does not
        // look like foo=bar was entered.
        if (~defaultValues.indexOf(value) ||
          (Array.isArray(value) && !value.length)) {
          missingRequiredArgs.push(key);
        }
      });

      if (missingRequiredArgs.length > 0) {
        usage.fail(__n(
          'Missing argument value: %s',
          'Missing argument values: %s',
          missingRequiredArgs.length,
          missingRequiredArgs.join(', ')
        ));
      }
    }
  };

  // make sure all the required arguments are present.
  self.requiredArguments = function (argv) {
    const demandedOptions = yargs.getDemandedOptions();
    var missing = null;

    Object.keys(demandedOptions).forEach(function (key) {
      if (!argv.hasOwnProperty(key) || typeof argv[key] === 'undefined') {
        missing = missing || {};
        missing[key] = demandedOptions[key];
      }
    });

    if (missing) {
      const customMsgs = [];
      Object.keys(missing).forEach(function (key) {
        const msg = missing[key];
        if (msg && customMsgs.indexOf(msg) < 0) {
          customMsgs.push(msg);
        }
      });

      const customMsg = customMsgs.length ? '\n' + customMsgs.join('\n') : '';

      usage.fail(__n(
        'Missing required argument: %s',
        'Missing required arguments: %s',
        Object.keys(missing).length,
        Object.keys(missing).join(', ') + customMsg
      ));
    }
  };

  // check for unknown arguments (strict-mode).
  self.unknownArguments = function (argv, aliases, positionalMap) {
    const aliasLookup = {};
    const descriptions = usage.getDescriptions();
    const demandedOptions = yargs.getDemandedOptions();
    const commandKeys = yargs.getCommandInstance().getCommands();
    const unknown = [];
    const currentContext = yargs.getContext();

    Object.keys(aliases).forEach(function (key) {
      aliases[key].forEach(function (alias) {
        aliasLookup[alias] = key;
      });
    });

    Object.keys(argv).forEach(function (key) {
      if (specialKeys.indexOf(key) === -1 &&
        !descriptions.hasOwnProperty(key) &&
        !demandedOptions.hasOwnProperty(key) &&
        !positionalMap.hasOwnProperty(key) &&
        !yargs._getParseContext().hasOwnProperty(key) &&
        !aliasLookup.hasOwnProperty(key)) {
        unknown.push(key);
      }
    });

    if (commandKeys.length > 0) {
      argv._.slice(currentContext.commands.length).forEach(function (key) {
        if (commandKeys.indexOf(key) === -1) {
          unknown.push(key);
        }
      });
    }

    if (unknown.length > 0) {
      usage.fail(__n(
        'Unknown argument: %s',
        'Unknown arguments: %s',
        unknown.length,
        unknown.join(', ')
      ));
    }
  };

  // validate arguments limited to enumerated choices
  self.limitedChoices = function (argv) {
    const options = yargs.getOptions();
    const invalid = {};

    if (!Object.keys(options.choices).length) return

    Object.keys(argv).forEach(function (key) {
      if (specialKeys.indexOf(key) === -1 &&
        options.choices.hasOwnProperty(key)) {
        [].concat(argv[key]).forEach(function (value) {
          // TODO case-insensitive configurability
          if (options.choices[key].indexOf(value) === -1) {
            invalid[key] = (invalid[key] || []).concat(value);
          }
        });
      }
    });

    const invalidKeys = Object.keys(invalid);

    if (!invalidKeys.length) return

    var msg = __('Invalid values:');
    invalidKeys.forEach(function (key) {
      msg += '\n  ' + __(
        'Argument: %s, Given: %s, Choices: %s',
        key,
        usage.stringifiedValues(invalid[key]),
        usage.stringifiedValues(options.choices[key])
      );
    });
    usage.fail(msg);
  };

  // custom checks, added using the `check` option on yargs.
  var checks = [];
  self.check = function (f, global) {
    checks.push({
      func: f,
      global: global
    });
  };

  self.customChecks = function (argv, aliases) {
    for (var i = 0, f; (f = checks[i]) !== undefined; i++) {
      var func = f.func;
      var result = null;
      try {
        result = func(argv, aliases);
      } catch (err) {
        usage.fail(err.message ? err.message : err, err);
        continue
      }

      if (!result) {
        usage.fail(__('Argument check failed: %s', func.toString()));
      } else if (typeof result === 'string' || result instanceof Error) {
        usage.fail(result.toString(), result);
      }
    }
  };

  // check implications, argument foo implies => argument bar.
  var implied = {};
  self.implies = function (key, value) {
    if (typeof key === 'object') {
      Object.keys(key).forEach(function (k) {
        self.implies(k, key[k]);
      });
    } else {
      yargs.global(key);
      implied[key] = value;
    }
  };
  self.getImplied = function () {
    return implied
  };

  self.implications = function (argv) {
    const implyFail = [];

    Object.keys(implied).forEach(function (key) {
      var num;
      const origKey = key;
      var value = implied[key];

      // convert string '1' to number 1
      num = Number(key);
      key = isNaN(num) ? key : num;

      if (typeof key === 'number') {
        // check length of argv._
        key = argv._.length >= key;
      } else if (key.match(/^--no-.+/)) {
        // check if key doesn't exist
        key = key.match(/^--no-(.+)/)[1];
        key = !argv[key];
      } else {
        // check if key exists
        key = argv[key];
      }

      num = Number(value);
      value = isNaN(num) ? value : num;

      if (typeof value === 'number') {
        value = argv._.length >= value;
      } else if (value.match(/^--no-.+/)) {
        value = value.match(/^--no-(.+)/)[1];
        value = !argv[value];
      } else {
        value = argv[value];
      }

      if (key && !value) {
        implyFail.push(origKey);
      }
    });

    if (implyFail.length) {
      var msg = __('Implications failed:') + '\n';

      implyFail.forEach(function (key) {
        msg += ('  ' + key + ' -> ' + implied[key]);
      });

      usage.fail(msg);
    }
  };

  var conflicting = {};
  self.conflicts = function (key, value) {
    if (typeof key === 'object') {
      Object.keys(key).forEach(function (k) {
        self.conflicts(k, key[k]);
      });
    } else {
      yargs.global(key);
      conflicting[key] = value;
    }
  };
  self.getConflicting = function () {
    return conflicting
  };

  self.conflicting = function (argv) {
    var args = Object.getOwnPropertyNames(argv);

    args.forEach(function (arg) {
      if (conflicting[arg] && args.indexOf(conflicting[arg]) !== -1) {
        usage.fail(__('Arguments %s and %s are mutually exclusive', arg, conflicting[arg]));
      }
    });
  };

  self.recommendCommands = function (cmd, potentialCommands) {
    const distance = levenshtein;
    const threshold = 3; // if it takes more than three edits, let's move on.
    potentialCommands = potentialCommands.sort(function (a, b) { return b.length - a.length });

    var recommended = null;
    var bestDistance = Infinity;
    for (var i = 0, candidate; (candidate = potentialCommands[i]) !== undefined; i++) {
      var d = distance(cmd, candidate);
      if (d <= threshold && d < bestDistance) {
        bestDistance = d;
        recommended = candidate;
      }
    }
    if (recommended) usage.fail(__('Did you mean %s?', recommended));
  };

  self.reset = function (localLookup) {
    implied = objFilter(implied, function (k, v) {
      return !localLookup[k]
    });
    conflicting = objFilter(conflicting, function (k, v) {
      return !localLookup[k]
    });
    checks = checks.filter(function (c) {
      return c.global
    });
    return self
  };

  var frozen;
  self.freeze = function () {
    frozen = {};
    frozen.implied = implied;
    frozen.checks = checks;
    frozen.conflicting = conflicting;
  };
  self.unfreeze = function () {
    implied = frozen.implied;
    checks = frozen.checks;
    conflicting = frozen.conflicting;
    frozen = undefined;
  };

  return self
};

var fs$3 = require('fs');
var path$3 = require('path');
var util$2 = require('util');

function Y18N (opts) {
  // configurable options.
  opts = opts || {};
  this.directory = opts.directory || './locales';
  this.updateFiles = typeof opts.updateFiles === 'boolean' ? opts.updateFiles : true;
  this.locale = opts.locale || 'en';
  this.fallbackToLanguage = typeof opts.fallbackToLanguage === 'boolean' ? opts.fallbackToLanguage : true;

  // internal stuff.
  this.cache = {};
  this.writeQueue = [];
}

Y18N.prototype.__ = function () {
  var args = Array.prototype.slice.call(arguments);
  var str = args.shift();
  var cb = function () {}; // start with noop.

  if (typeof args[args.length - 1] === 'function') cb = args.pop();
  cb = cb || function () {}; // noop.

  if (!this.cache[this.locale]) this._readLocaleFile();

  // we've observed a new string, update the language file.
  if (!this.cache[this.locale][str] && this.updateFiles) {
    this.cache[this.locale][str] = str;

    // include the current directory and locale,
    // since these values could change before the
    // write is performed.
    this._enqueueWrite([this.directory, this.locale, cb]);
  } else {
    cb();
  }

  return util$2.format.apply(util$2, [this.cache[this.locale][str] || str].concat(args))
};

Y18N.prototype._enqueueWrite = function (work) {
  this.writeQueue.push(work);
  if (this.writeQueue.length === 1) this._processWriteQueue();
};

Y18N.prototype._processWriteQueue = function () {
  var _this = this;
  var work = this.writeQueue[0];

  // destructure the enqueued work.
  var directory = work[0];
  var locale = work[1];
  var cb = work[2];

  var languageFile = this._resolveLocaleFile(directory, locale);
  var serializedLocale = JSON.stringify(this.cache[locale], null, 2);

  fs$3.writeFile(languageFile, serializedLocale, 'utf-8', function (err) {
    _this.writeQueue.shift();
    if (_this.writeQueue.length > 0) _this._processWriteQueue();
    cb(err);
  });
};

Y18N.prototype._readLocaleFile = function () {
  var localeLookup = {};
  var languageFile = this._resolveLocaleFile(this.directory, this.locale);

  try {
    localeLookup = JSON.parse(fs$3.readFileSync(languageFile, 'utf-8'));
  } catch (err) {
    if (err instanceof SyntaxError) {
      err.message = 'syntax error in ' + languageFile;
    }

    if (err.code === 'ENOENT') localeLookup = {};
    else throw err
  }

  this.cache[this.locale] = localeLookup;
};

Y18N.prototype._resolveLocaleFile = function (directory, locale) {
  var file = path$3.resolve(directory, './', locale + '.json');
  if (this.fallbackToLanguage && !this._fileExistsSync(file) && ~locale.lastIndexOf('_')) {
    // attempt fallback to language only
    var languageFile = path$3.resolve(directory, './', locale.split('_')[0] + '.json');
    if (this._fileExistsSync(languageFile)) file = languageFile;
  }
  return file
};

// this only exists because fs.existsSync() "will be deprecated"
// see https://nodejs.org/api/fs.html#fs_fs_existssync_path
Y18N.prototype._fileExistsSync = function (file) {
  try {
    return fs$3.statSync(file).isFile()
  } catch (err) {
    return false
  }
};

Y18N.prototype.__n = function () {
  var args = Array.prototype.slice.call(arguments);
  var singular = args.shift();
  var plural = args.shift();
  var quantity = args.shift();

  var cb = function () {}; // start with noop.
  if (typeof args[args.length - 1] === 'function') cb = args.pop();

  if (!this.cache[this.locale]) this._readLocaleFile();

  var str = quantity === 1 ? singular : plural;
  if (this.cache[this.locale][singular]) {
    str = this.cache[this.locale][singular][quantity === 1 ? 'one' : 'other'];
  }

  // we've observed a new string, update the language file.
  if (!this.cache[this.locale][singular] && this.updateFiles) {
    this.cache[this.locale][singular] = {
      one: singular,
      other: plural
    };

    // include the current directory and locale,
    // since these values could change before the
    // write is performed.
    this._enqueueWrite([this.directory, this.locale, cb]);
  } else {
    cb();
  }

  // if a %d placeholder is provided, add quantity
  // to the arguments expanded by util.format.
  var values = [str];
  if (~str.indexOf('%d')) values.push(quantity);

  return util$2.format.apply(util$2, values.concat(args))
};

Y18N.prototype.setLocale = function (locale) {
  this.locale = locale;
};

Y18N.prototype.getLocale = function () {
  return this.locale
};

Y18N.prototype.updateLocale = function (obj) {
  if (!this.cache[this.locale]) this._readLocaleFile();

  for (var key in obj) {
    this.cache[this.locale][key] = obj[key];
  }
};

module.exports = function (opts) {
  var y18n = new Y18N(opts);

  // bind all functions to y18n, so that
  // they can be used in isolation.
  for (var key in y18n) {
    if (typeof y18n[key] === 'function') {
      y18n[key] = y18n[key].bind(y18n);
    }
  }

  return y18n
};


var index$14 = Object.freeze({

});

var previouslyVisitedConfigs = [];

function checkForCircularExtends (path$$2) {
  if (previouslyVisitedConfigs.indexOf(path$$2) > -1) {
    throw new yerror("Circular extended configurations: '" + path$$2 + "'.")
  }
}

function getPathToDefaultConfig (cwd, pathToExtend) {
  return path.resolve(cwd, pathToExtend)
}

function applyExtends (config, cwd) {
  var defaultConfig = {};

  if (config.hasOwnProperty('extends')) {
    if (typeof config.extends !== 'string') return defaultConfig
    var isPath = /\.json$/.test(config.extends);
    var pathToDefault = null;
    if (!isPath) {
      try {
        pathToDefault = commonjsRequire.resolve(config.extends);
      } catch (err) {
        // most likely this simply isn't a module.
      }
    } else {
      pathToDefault = getPathToDefaultConfig(cwd, config.extends);
    }
    // maybe the module uses key for some other reason,
    // err on side of caution.
    if (!pathToDefault && !isPath) return config

    checkForCircularExtends(pathToDefault);

    previouslyVisitedConfigs.push(pathToDefault);

    defaultConfig = isPath ? JSON.parse(fs.readFileSync(pathToDefault, 'utf8')) : commonjsRequire(config.extends);
    delete config.extends;
    defaultConfig = applyExtends(defaultConfig, path.dirname(pathToDefault));
  }

  previouslyVisitedConfigs = [];

  return assign(defaultConfig, config)
}

var applyExtends_1 = applyExtends;

// Call this function in a another function to find out the file from
// which that function was called from. (Inspects the v8 stack trace)
//
// Inspired by http://stackoverflow.com/questions/13227489

module.exports = function getCallerFile(_position) {
  var oldPrepareStackTrace = Error.prepareStackTrace;
  Error.prepareStackTrace = function(err, stack) { return stack; };
  var stack = new Error().stack;
  Error.prepareStackTrace = oldPrepareStackTrace;

  var position = _position ? _position : 2;

  // stack[0] holds this file
  // stack[1] holds where this function was called
  // stack[2] holds the file we're interested in
  return stack[position] ? stack[position].getFileName() : undefined;
};


var index$15 = Object.freeze({

});

const path$4 = require('path');
const pathExists = require('path-exists');
const pLocate = require('p-locate');

module.exports = (iterable, opts) => {
	opts = Object.assign({
		cwd: process.cwd()
	}, opts);

	return pLocate(iterable, el => pathExists(path$4.resolve(opts.cwd, el)), opts);
};

module.exports.sync = (iterable, opts) => {
	opts = Object.assign({
		cwd: process.cwd()
	}, opts);

	for (const el of iterable) {
		if (pathExists.sync(path$4.resolve(opts.cwd, el))) {
			return el;
		}
	}
};


var index$20 = Object.freeze({

});

var locatePath = ( index$20 && undefined ) || index$20;

var index$18 = (filename, opts) => {
	opts = opts || {};

	const startDir = path.resolve(opts.cwd || '');
	const root = path.parse(startDir).root;

	const filenames = [].concat(filename);

	return new Promise(resolve => {
		(function find(dir) {
			locatePath(filenames, {cwd: dir}).then(file => {
				if (file) {
					resolve(path.join(dir, file));
				} else if (dir === root) {
					resolve(null);
				} else {
					find(path.dirname(dir));
				}
			});
		})(startDir);
	});
};

var sync$1 = (filename, opts) => {
	opts = opts || {};

	let dir = path.resolve(opts.cwd || '');
	const root = path.parse(dir).root;

	const filenames = [].concat(filename);

	// eslint-disable-next-line no-constant-condition
	while (true) {
		const file = locatePath.sync(filenames, {cwd: dir});

		if (file) {
			return path.join(dir, file);
		} else if (dir === root) {
			return null;
		}

		dir = path.dirname(dir);
	}
};

index$18.sync = sync$1;

var fs$4 = require('fs');
var polyfills = require('./polyfills.js');
var legacy = require('./legacy-streams.js');
var queue = [];

var util$3 = require('util');

function noop$1 () {}

var debug = noop$1;
if (util$3.debuglog)
  debug = util$3.debuglog('gfs4');
else if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || ''))
  debug = function() {
    var m = util$3.format.apply(util$3, arguments);
    m = 'GFS4: ' + m.split(/\n/).join('\nGFS4: ');
    console.error(m);
  };

if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || '')) {
  process.on('exit', function() {
    debug(queue);
    require('assert').equal(queue.length, 0);
  });
}

module.exports = patch(require('./fs.js'));
if (process.env.TEST_GRACEFUL_FS_GLOBAL_PATCH) {
  module.exports = patch(fs$4);
}

// Always patch fs.close/closeSync, because we want to
// retry() whenever a close happens *anywhere* in the program.
// This is essential when multiple graceful-fs instances are
// in play at the same time.
module.exports.close =
fs$4.close = (function (fs$close) { return function (fd, cb) {
  return fs$close.call(fs$4, fd, function (err) {
    if (!err)
      retry();

    if (typeof cb === 'function')
      cb.apply(this, arguments);
  })
}})(fs$4.close);

module.exports.closeSync =
fs$4.closeSync = (function (fs$closeSync) { return function (fd) {
  // Note that graceful-fs also retries when fs.closeSync() fails.
  // Looks like a bug to me, although it's probably a harmless one.
  var rval = fs$closeSync.apply(fs$4, arguments);
  retry();
  return rval
}})(fs$4.closeSync);

function patch (fs$$1) {
  // Everything that references the open() function needs to be in here
  polyfills(fs$$1);
  fs$$1.gracefulify = patch;
  fs$$1.FileReadStream = ReadStream;  // Legacy name.
  fs$$1.FileWriteStream = WriteStream;  // Legacy name.
  fs$$1.createReadStream = createReadStream;
  fs$$1.createWriteStream = createWriteStream;
  var fs$readFile = fs$$1.readFile;
  fs$$1.readFile = readFile;
  function readFile (path$$1, options, cb) {
    if (typeof options === 'function')
      cb = options, options = null;

    return go$readFile(path$$1, options, cb)

    function go$readFile (path$$1, options, cb) {
      return fs$readFile(path$$1, options, function (err) {
        if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
          enqueue([go$readFile, [path$$1, options, cb]]);
        else {
          if (typeof cb === 'function')
            cb.apply(this, arguments);
          retry();
        }
      })
    }
  }

  var fs$writeFile = fs$$1.writeFile;
  fs$$1.writeFile = writeFile;
  function writeFile (path$$1, data, options, cb) {
    if (typeof options === 'function')
      cb = options, options = null;

    return go$writeFile(path$$1, data, options, cb)

    function go$writeFile (path$$1, data, options, cb) {
      return fs$writeFile(path$$1, data, options, function (err) {
        if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
          enqueue([go$writeFile, [path$$1, data, options, cb]]);
        else {
          if (typeof cb === 'function')
            cb.apply(this, arguments);
          retry();
        }
      })
    }
  }

  var fs$appendFile = fs$$1.appendFile;
  if (fs$appendFile)
    fs$$1.appendFile = appendFile;
  function appendFile (path$$1, data, options, cb) {
    if (typeof options === 'function')
      cb = options, options = null;

    return go$appendFile(path$$1, data, options, cb)

    function go$appendFile (path$$1, data, options, cb) {
      return fs$appendFile(path$$1, data, options, function (err) {
        if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
          enqueue([go$appendFile, [path$$1, data, options, cb]]);
        else {
          if (typeof cb === 'function')
            cb.apply(this, arguments);
          retry();
        }
      })
    }
  }

  var fs$readdir = fs$$1.readdir;
  fs$$1.readdir = readdir;
  function readdir (path$$1, options, cb) {
    var args = [path$$1];
    if (typeof options !== 'function') {
      args.push(options);
    } else {
      cb = options;
    }
    args.push(go$readdir$cb);

    return go$readdir(args)

    function go$readdir$cb (err, files) {
      if (files && files.sort)
        files.sort();

      if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
        enqueue([go$readdir, [args]]);
      else {
        if (typeof cb === 'function')
          cb.apply(this, arguments);
        retry();
      }
    }
  }

  function go$readdir (args) {
    return fs$readdir.apply(fs$$1, args)
  }

  if (process.version.substr(0, 4) === 'v0.8') {
    var legStreams = legacy(fs$$1);
    ReadStream = legStreams.ReadStream;
    WriteStream = legStreams.WriteStream;
  }

  var fs$ReadStream = fs$$1.ReadStream;
  ReadStream.prototype = Object.create(fs$ReadStream.prototype);
  ReadStream.prototype.open = ReadStream$open;

  var fs$WriteStream = fs$$1.WriteStream;
  WriteStream.prototype = Object.create(fs$WriteStream.prototype);
  WriteStream.prototype.open = WriteStream$open;

  fs$$1.ReadStream = ReadStream;
  fs$$1.WriteStream = WriteStream;

  function ReadStream (path$$1, options) {
    if (this instanceof ReadStream)
      return fs$ReadStream.apply(this, arguments), this
    else
      return ReadStream.apply(Object.create(ReadStream.prototype), arguments)
  }

  function ReadStream$open () {
    var that = this;
    open(that.path, that.flags, that.mode, function (err, fd) {
      if (err) {
        if (that.autoClose)
          that.destroy();

        that.emit('error', err);
      } else {
        that.fd = fd;
        that.emit('open', fd);
        that.read();
      }
    });
  }

  function WriteStream (path$$1, options) {
    if (this instanceof WriteStream)
      return fs$WriteStream.apply(this, arguments), this
    else
      return WriteStream.apply(Object.create(WriteStream.prototype), arguments)
  }

  function WriteStream$open () {
    var that = this;
    open(that.path, that.flags, that.mode, function (err, fd) {
      if (err) {
        that.destroy();
        that.emit('error', err);
      } else {
        that.fd = fd;
        that.emit('open', fd);
      }
    });
  }

  function createReadStream (path$$1, options) {
    return new ReadStream(path$$1, options)
  }

  function createWriteStream (path$$1, options) {
    return new WriteStream(path$$1, options)
  }

  var fs$open = fs$$1.open;
  fs$$1.open = open;
  function open (path$$1, flags, mode, cb) {
    if (typeof mode === 'function')
      cb = mode, mode = null;

    return go$open(path$$1, flags, mode, cb)

    function go$open (path$$1, flags, mode, cb) {
      return fs$open(path$$1, flags, mode, function (err, fd) {
        if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
          enqueue([go$open, [path$$1, flags, mode, cb]]);
        else {
          if (typeof cb === 'function')
            cb.apply(this, arguments);
          retry();
        }
      })
    }
  }

  return fs$$1
}

function enqueue (elem) {
  debug('ENQUEUE', elem[0].name, elem[1]);
  queue.push(elem);
}

function retry () {
  var elem = queue.shift();
  if (elem) {
    debug('RETRY', elem[0].name, elem[1]);
    elem[0].apply(null, elem[1]);
  }
}


var gracefulFs = Object.freeze({

});

module.exports = x => {
	if (typeof x !== 'string') {
		throw new TypeError('Expected a string, got ' + typeof x);
	}

	// Catches EFBBBF (UTF-8 BOM) because the buffer-to-string
	// conversion translates it to FEFF (UTF-16 BOM)
	if (x.charCodeAt(0) === 0xFEFF) {
		return x.slice(1);
	}

	return x;
};


var index$25 = Object.freeze({

});

var errorEx = require('error-ex');
var fallback = require('./vendor/parse');

var JSONError = errorEx('JSONError', {
	fileName: errorEx.append('in %s')
});

module.exports = function (x, reviver, filename) {
	if (typeof reviver === 'string') {
		filename = reviver;
		reviver = null;
	}

	try {
		try {
			return JSON.parse(x, reviver);
		} catch (err) {
			fallback.parse(x, {
				mode: 'json',
				reviver: reviver
			});

			throw err;
		}
	} catch (err) {
		var jsonErr = new JSONError(err);

		if (filename) {
			jsonErr.fileName = filename;
		}

		throw jsonErr;
	}
};


var index$26 = Object.freeze({

});

var processFn = function (fn, P, opts) {
	return function () {
		var that = this;
		var args = new Array(arguments.length);

		for (var i = 0; i < arguments.length; i++) {
			args[i] = arguments[i];
		}

		return new P(function (resolve, reject) {
			args.push(function (err, result) {
				if (err) {
					reject(err);
				} else if (opts.multiArgs) {
					var results = new Array(arguments.length - 1);

					for (var i = 1; i < arguments.length; i++) {
						results[i - 1] = arguments[i];
					}

					resolve(results);
				} else {
					resolve(result);
				}
			});

			fn.apply(that, args);
		});
	};
};

var pify = module.exports = function (obj, P, opts) {
	if (typeof P !== 'function') {
		opts = P;
		P = Promise;
	}

	opts = opts || {};
	opts.exclude = opts.exclude || [/.+Sync$/];

	var filter = function (key) {
		var match = function (pattern) {
			return typeof pattern === 'string' ? key === pattern : pattern.test(key);
		};

		return opts.include ? opts.include.some(match) : !opts.exclude.some(match);
	};

	var ret = typeof obj === 'function' ? function () {
		if (opts.excludeMain) {
			return obj.apply(this, arguments);
		}

		return processFn(obj, P, opts).apply(this, arguments);
	} : {};

	return Object.keys(obj).reduce(function (ret, key) {
		var x = obj[key];

		ret[key] = typeof x === 'function' && filter(key) ? processFn(x, P, opts) : x;

		return ret;
	}, ret);
};

pify.all = pify;


var index$27 = Object.freeze({

});

var fs$5 = ( gracefulFs && undefined ) || gracefulFs;

var stripBom = ( index$25 && undefined ) || index$25;

var parseJson = ( index$26 && undefined ) || index$26;

var pify$1 = ( index$27 && undefined ) || index$27;

const parse$1 = (data, fp) => parseJson(stripBom(data), path.relative('.', fp));

var index$23 = fp => pify$1(fs$5.readFile)(fp, 'utf8').then(data => parse$1(data, fp));
var sync$3 = fp => parse$1(fs$5.readFileSync(fp, 'utf8'), fp);

index$23.sync = sync$3;

function type(fn, fn2, fp) {
	if (typeof fp !== 'string') {
		return Promise.reject(new TypeError(`Expected a string, got ${typeof fp}`));
	}

	return pify$1(fs[fn])(fp).then(stats => stats[fn2]());
}

function typeSync(fn, fn2, fp) {
	if (typeof fp !== 'string') {
		throw new TypeError(`Expected a string, got ${typeof fp}`);
	}

	return fs[fn](fp)[fn2]();
}

var file = type.bind(null, 'stat', 'isFile');
var dir = type.bind(null, 'stat', 'isDirectory');
var symlink = type.bind(null, 'lstat', 'isSymbolicLink');
var fileSync = typeSync.bind(null, 'statSync', 'isFile');
var dirSync = typeSync.bind(null, 'statSync', 'isDirectory');
var symlinkSync = typeSync.bind(null, 'lstatSync', 'isSymbolicLink');

var index$28 = {
	file: file,
	dir: dir,
	symlink: symlink,
	fileSync: fileSync,
	dirSync: dirSync,
	symlinkSync: symlinkSync
};

module.exports = normalize;

var fixer = require("./fixer");
normalize.fixer = fixer;

var makeWarning = require("./make_warning");

var fieldsToFix = ['name','version','description','repository','modules','scripts'
                  ,'files','bin','man','bugs','keywords','readme','homepage','license'];
var otherThingsToFix = ['dependencies','people', 'typos'];

var thingsToFix = fieldsToFix.map(function(fieldName) { 
  return ucFirst(fieldName) + "Field"
});
// two ways to do this in CoffeeScript on only one line, sub-70 chars:
// thingsToFix = fieldsToFix.map (name) -> ucFirst(name) + "Field"
// thingsToFix = (ucFirst(name) + "Field" for name in fieldsToFix)
thingsToFix = thingsToFix.concat(otherThingsToFix);

function normalize (data, warn, strict) {
  if(warn === true) warn = null, strict = true;
  if(!strict) strict = false;
  if(!warn || data.private) warn = function(msg) { /* noop */ };

  if (data.scripts && 
      data.scripts.install === "node-gyp rebuild" && 
      !data.scripts.preinstall) {
    data.gypfile = true;
  }
  fixer.warn = function() { warn(makeWarning.apply(null, arguments)); };
  thingsToFix.forEach(function(thingName) {
    fixer["fix" + ucFirst(thingName)](data, strict);
  });
  data._id = data.name + "@" + data.version;
}

function ucFirst (string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}


var normalize$1 = Object.freeze({

});

var require$$0$4 = ( normalize$1 && undefined ) || normalize$1;

var index$21 = (fp, opts) => {
	if (typeof fp !== 'string') {
		opts = fp;
		fp = '.';
	}

	opts = opts || {};

	return index$28.dir(fp)
		.then(isDir => {
			if (isDir) {
				fp = path.join(fp, 'package.json');
			}

			return index$23(fp);
		})
		.then(x => {
			if (opts.normalize !== false) {
				require$$0$4(x);
			}

			return x;
		});
};

var sync$2 = (fp, opts) => {
	if (typeof fp !== 'string') {
		opts = fp;
		fp = '.';
	}

	opts = opts || {};
	fp = index$28.dirSync(fp) ? path.join(fp, 'package.json') : fp;

	const x = index$23.sync(fp);

	if (opts.normalize !== false) {
		require$$0$4(x);
	}

	return x;
};

index$21.sync = sync$2;

var index$16 = opts => {
	return index$18('package.json', opts).then(fp => {
		if (!fp) {
			return {};
		}

		return index$21(fp, opts).then(pkg => ({pkg, path: fp}));
	});
};

var sync = opts => {
	const fp = index$18.sync('package.json', opts);

	if (!fp) {
		return {};
	}

	return {
		pkg: index$21.sync(fp, opts),
		path: fp
	};
};

index$16.sync = sync;

module.exports = function (_require) {
  _require = _require || require;
  var main = _require.main;
  if (main && isIISNode(main)) return handleIISNode(main)
  else return main ? main.filename : process.cwd()
};

function isIISNode (main) {
  return /\\iisnode\\/.test(main.filename)
}

function handleIISNode (main) {
  if (!main.children.length) {
    return main.filename
  } else {
    return main.children[0].filename
  }
}


var index$30 = Object.freeze({

});

const childProcess = require('child_process');
const util$4 = require('util');
const crossSpawn = require('cross-spawn');
const stripEof = require('strip-eof');
const npmRunPath = require('npm-run-path');
const isStream = require('is-stream');
const _getStream = require('get-stream');
const pFinally = require('p-finally');
const onExit = require('signal-exit');
const errname = require('./lib/errname');

const TEN_MEGABYTES = 1000 * 1000 * 10;

function handleArgs(cmd, args, opts) {
	let parsed;

	if (opts && opts.__winShell === true) {
		delete opts.__winShell;
		parsed = {
			command: cmd,
			args,
			options: opts,
			file: cmd,
			original: cmd
		};
	} else {
		parsed = crossSpawn._parse(cmd, args, opts);
	}

	opts = Object.assign({
		maxBuffer: TEN_MEGABYTES,
		stripEof: true,
		preferLocal: true,
		encoding: 'utf8',
		reject: true,
		cleanup: true
	}, parsed.options);

	if (opts.preferLocal) {
		opts.env = npmRunPath.env(opts);
	}

	return {
		cmd: parsed.command,
		args: parsed.args,
		opts
	};
}

function handleInput(spawned, opts) {
	const input = opts.input;

	if (input === null || input === undefined) {
		return;
	}

	if (isStream(input)) {
		input.pipe(spawned.stdin);
	} else {
		spawned.stdin.end(input);
	}
}

function handleOutput(opts, val) {
	if (val && opts.stripEof) {
		val = stripEof(val);
	}

	return val;
}

function handleShell(fn, cmd, opts) {
	let file = '/bin/sh';
	let args = ['-c', cmd];

	opts = Object.assign({}, opts);

	if (process.platform === 'win32') {
		opts.__winShell = true;
		file = process.env.comspec || 'cmd.exe';
		args = ['/s', '/c', `"${cmd}"`];
		opts.windowsVerbatimArguments = true;
	}

	if (opts.shell) {
		file = opts.shell;
		delete opts.shell;
	}

	return fn(file, args, opts);
}

function getStream(process, stream, encoding, maxBuffer) {
	if (!process[stream]) {
		return null;
	}

	let ret;

	if (encoding) {
		ret = _getStream(process[stream], {
			encoding,
			maxBuffer
		});
	} else {
		ret = _getStream.buffer(process[stream], {maxBuffer});
	}

	return ret.catch(err => {
		err.stream = stream;
		err.message = `${stream} ${err.message}`;
		throw err;
	});
}

module.exports = (cmd, args, opts) => {
	let joinedCmd = cmd;

	if (Array.isArray(args) && args.length > 0) {
		joinedCmd += ' ' + args.join(' ');
	}

	const parsed = handleArgs(cmd, args, opts);
	const encoding = parsed.opts.encoding;
	const maxBuffer = parsed.opts.maxBuffer;

	let spawned;
	try {
		spawned = childProcess.spawn(parsed.cmd, parsed.args, parsed.opts);
	} catch (err) {
		return Promise.reject(err);
	}

	let removeExitHandler;
	if (parsed.opts.cleanup) {
		removeExitHandler = onExit(() => {
			spawned.kill();
		});
	}

	let timeoutId = null;
	let timedOut = false;

	const cleanupTimeout = () => {
		if (timeoutId) {
			clearTimeout(timeoutId);
			timeoutId = null;
		}
	};

	if (parsed.opts.timeout > 0) {
		timeoutId = setTimeout(() => {
			timeoutId = null;
			timedOut = true;
			spawned.kill(parsed.killSignal);
		}, parsed.opts.timeout);
	}

	const processDone = new Promise(resolve => {
		spawned.on('exit', (code, signal) => {
			cleanupTimeout();
			resolve({code, signal});
		});

		spawned.on('error', err => {
			cleanupTimeout();
			resolve({err});
		});
	});

	function destroy() {
		if (spawned.stdout) {
			spawned.stdout.destroy();
		}

		if (spawned.stderr) {
			spawned.stderr.destroy();
		}
	}

	const promise = pFinally(Promise.all([
		processDone,
		getStream(spawned, 'stdout', encoding, maxBuffer),
		getStream(spawned, 'stderr', encoding, maxBuffer)
	]).then(arr => {
		const result = arr[0];
		const stdout = arr[1];
		const stderr = arr[2];

		let err = result.err;
		const code = result.code;
		const signal = result.signal;

		if (removeExitHandler) {
			removeExitHandler();
		}

		if (err || code !== 0 || signal !== null) {
			if (!err) {
				err = new Error(`Command failed: ${joinedCmd}\n${stderr}${stdout}`);
				err.code = code < 0 ? errname(code) : code;
			}

			// TODO: missing some timeout logic for killed
			// https://github.com/nodejs/node/blob/master/lib/child_process.js#L203
			// err.killed = spawned.killed || killed;
			err.killed = err.killed || spawned.killed;

			err.stdout = stdout;
			err.stderr = stderr;
			err.failed = true;
			err.signal = signal || null;
			err.cmd = joinedCmd;
			err.timedOut = timedOut;

			if (!parsed.opts.reject) {
				return err;
			}

			throw err;
		}

		return {
			stdout: handleOutput(parsed.opts, stdout),
			stderr: handleOutput(parsed.opts, stderr),
			code: 0,
			failed: false,
			killed: false,
			signal: null,
			cmd: joinedCmd,
			timedOut: false
		};
	}), destroy);

	crossSpawn._enoent.hookChildProcess(spawned, parsed);

	handleInput(spawned, parsed.opts);

	spawned.then = promise.then.bind(promise);
	spawned.catch = promise.catch.bind(promise);

	return spawned;
};

module.exports.stdout = function () {
	// TODO: set `stderr: 'ignore'` when that option is implemented
	return module.exports.apply(null, arguments).then(x => x.stdout);
};

module.exports.stderr = function () {
	// TODO: set `stdout: 'ignore'` when that option is implemented
	return module.exports.apply(null, arguments).then(x => x.stderr);
};

module.exports.shell = (cmd, opts) => handleShell(module.exports, cmd, opts);

module.exports.sync = (cmd, args, opts) => {
	const parsed = handleArgs(cmd, args, opts);

	if (isStream(parsed.opts.input)) {
		throw new TypeError('The `input` option cannot be a stream in sync mode');
	}

	const result = childProcess.spawnSync(parsed.cmd, parsed.args, parsed.opts);

	result.stdout = handleOutput(parsed.opts, result.stdout);
	result.stderr = handleOutput(parsed.opts, result.stderr);

	return result;
};

module.exports.shellSync = (cmd, opts) => handleShell(module.exports.sync, cmd, opts);

module.exports.spawn = util$4.deprecate(module.exports, 'execa.spawn() is deprecated. Use execa() instead.');


var index$33 = Object.freeze({

});

var invertKv = require('invert-kv');
var all = require('./lcid.json');
var inverted = invertKv(all);

exports.from = function (lcidCode) {
	if (typeof lcidCode !== 'number') {
		throw new TypeError('Expected a number');
	}

	return inverted[lcidCode];
};

exports.to = function (localeId) {
	if (typeof localeId !== 'string') {
		throw new TypeError('Expected a string');
	}

	return all[localeId];
};

exports.all = all;


var index$34 = Object.freeze({

});

const mimicFn = require('mimic-fn');

const cacheStore = new WeakMap();

const defaultCacheKey = function (x) {
	if (arguments.length === 1 && (x === null || x === undefined || (typeof x !== 'function' && typeof x !== 'object'))) {
		return x;
	}

	return JSON.stringify(arguments);
};

module.exports = (fn, opts) => {
	opts = Object.assign({
		cacheKey: defaultCacheKey,
		cache: new Map()
	}, opts);

	const memoized = function () {
		const cache = cacheStore.get(memoized);
		const key = opts.cacheKey.apply(null, arguments);

		if (cache.has(key)) {
			const c = cache.get(key);

			if (typeof opts.maxAge !== 'number' || Date.now() < c.maxAge) {
				return c.data;
			}
		}

		const ret = fn.apply(null, arguments);

		cache.set(key, {
			data: ret,
			maxAge: Date.now() + (opts.maxAge || 0)
		});

		return ret;
	};

	mimicFn(memoized, fn);

	cacheStore.set(memoized, opts.cache);

	return memoized;
};

module.exports.clear = fn => {
	const cache = cacheStore.get(fn);

	if (cache && typeof cache.clear === 'function') {
		cache.clear();
	}
};


var index$35 = Object.freeze({

});

var execa = ( index$33 && undefined ) || index$33;

var lcid = ( index$34 && undefined ) || index$34;

var mem = ( index$35 && undefined ) || index$35;

const defaultOpts = {spawn: true};
const defaultLocale = 'en_US';

function getEnvLocale(env) {
	env = env || process.env;
	return env.LC_ALL || env.LC_MESSAGES || env.LANG || env.LANGUAGE;
}

function parseLocale(x) {
	const env = x.split('\n').reduce((env, def) => {
		def = def.split('=');
		env[def[0]] = def[1].replace(/^"|"$/g, '');
		return env;
	}, {});
	return getEnvLocale(env);
}

function getLocale(str) {
	return (str && str.replace(/[.:].*/, ''));
}

function getAppleLocale() {
	return execa.stdout('defaults', ['read', '-g', 'AppleLocale']);
}

function getAppleLocaleSync() {
	return execa.sync('defaults', ['read', '-g', 'AppleLocale']).stdout;
}

function getUnixLocale() {
	if (process.platform === 'darwin') {
		return getAppleLocale();
	}

	return execa.stdout('locale')
		.then(stdout => getLocale(parseLocale(stdout)));
}

function getUnixLocaleSync() {
	if (process.platform === 'darwin') {
		return getAppleLocaleSync();
	}

	return getLocale(parseLocale(execa.sync('locale').stdout));
}

function getWinLocale() {
	return execa.stdout('wmic', ['os', 'get', 'locale'])
		.then(stdout => {
			const lcidCode = parseInt(stdout.replace('Locale', ''), 16);
			return lcid.from(lcidCode);
		});
}

function getWinLocaleSync() {
	const stdout = execa.sync('wmic', ['os', 'get', 'locale']).stdout;
	const lcidCode = parseInt(stdout.replace('Locale', ''), 16);
	return lcid.from(lcidCode);
}

var index$31 = mem(opts => {
	opts = opts || defaultOpts;
	const envLocale = getEnvLocale();
	let thenable;

	if (envLocale || opts.spawn === false) {
		thenable = Promise.resolve(getLocale(envLocale));
	} else if (process.platform === 'win32') {
		thenable = getWinLocale();
	} else {
		thenable = getUnixLocale();
	}

	return thenable.then(locale => locale || defaultLocale)
		.catch(() => defaultLocale);
});

var sync$4 = mem(opts => {
	opts = opts || defaultOpts;
	const envLocale = getEnvLocale();
	let res;

	if (envLocale || opts.spawn === false) {
		res = getLocale(envLocale);
	} else {
		try {
			if (process.platform === 'win32') {
				res = getWinLocaleSync();
			} else {
				res = getUnixLocaleSync();
			}
		} catch (err) {}
	}

	return res || defaultLocale;
});

index$31.sync = sync$4;

var Parser$1 = ( index$5 && undefined ) || index$5;

var Y18n = ( index$14 && undefined ) || index$14;

var require$$0$5 = ( index$15 && undefined ) || index$15;

var require$$2$1 = ( index$30 && undefined ) || index$30;

var yargs = createCommonjsModule(function (module) {
var exports = module.exports = Yargs;
function Yargs (processArgs, cwd, parentRequire) {
  processArgs = processArgs || []; // handle calling yargs().

  const self = {};
  var command = null;
  var completion$$1 = null;
  var groups = {};
  var output = '';
  var preservedGroups = {};
  var usage$$1 = null;
  var validation$$1 = null;

  const y18n = Y18n({
    directory: path.resolve(__dirname, './locales'),
    updateFiles: false
  });

  if (!cwd) cwd = process.cwd();

  self.$0 = process.argv
    .slice(0, 2)
    .map(function (x, i) {
      // ignore the node bin, specify this in your
      // bin file with 
      if (i === 0 && /\b(node|iojs)(\.exe)?$/.test(x)) return
      var b = rebase(cwd, x);
      return x.match(/^(\/|([a-zA-Z]:)?\\)/) && b.length < x.length ? b : x
    })
    .join(' ').trim();

  if (process.env._ !== undefined && process.argv[1] === process.env._) {
    self.$0 = process.env._.replace(
      path.dirname(process.execPath) + '/', ''
    );
  }

  // use context object to keep track of resets, subcommand execution, etc
  // submodules should modify and check the state of context as necessary
  const context = { resets: -1, commands: [], files: [] };
  self.getContext = function () {
    return context
  };

  // puts yargs back into an initial state. any keys
  // that have been set to "global" will not be reset
  // by this action.
  var options;
  self.resetOptions = self.reset = function (aliases) {
    context.resets++;
    aliases = aliases || {};
    options = options || {};
    // put yargs back into an initial state, this
    // logic is used to build a nested command
    // hierarchy.
    var tmpOptions = {};
    tmpOptions.local = options.local ? options.local : [];
    tmpOptions.configObjects = options.configObjects ? options.configObjects : [];

    // if a key has been explicitly set as local,
    // we should reset it before passing options to command.
    var localLookup = {};
    tmpOptions.local.forEach(function (l) {
      localLookup[l] = true
      ;(aliases[l] || []).forEach(function (a) {
        localLookup[a] = true;
      });
    });

    // preserve all groups not set to local.
    preservedGroups = Object.keys(groups).reduce(function (acc, groupName) {
      var keys = groups[groupName].filter(function (key) {
        return !(key in localLookup)
      });
      if (keys.length > 0) {
        acc[groupName] = keys;
      }
      return acc
    }, {});
    // groups can now be reset
    groups = {};

    var arrayOptions = [
      'array', 'boolean', 'string', 'requiresArg', 'skipValidation',
      'count', 'normalize', 'number'
    ];

    var objectOptions = [
      'narg', 'key', 'alias', 'default', 'defaultDescription',
      'config', 'choices', 'demandedOptions', 'demandedCommands', 'coerce'
    ];

    arrayOptions.forEach(function (k) {
      tmpOptions[k] = (options[k] || []).filter(function (k) {
        return !localLookup[k]
      });
    });

    objectOptions.forEach(function (k) {
      tmpOptions[k] = objFilter(options[k], function (k, v) {
        return !localLookup[k]
      });
    });

    tmpOptions.envPrefix = options.envPrefix;
    options = tmpOptions;

    // if this is the first time being executed, create
    // instances of all our helpers -- otherwise just reset.
    usage$$1 = usage$$1 ? usage$$1.reset(localLookup) : usage(self, y18n);
    validation$$1 = validation$$1 ? validation$$1.reset(localLookup) : validation(self, usage$$1, y18n);
    command = command ? command.reset() : command$1(self, usage$$1, validation$$1);
    if (!completion$$1) completion$$1 = completion(self, usage$$1, command);

    completionCommand = null;
    output = '';
    exitError = null;
    hasOutput = false;
    self.parsed = false;

    return self
  };
  self.resetOptions();

  // temporary hack: allow "freezing" of reset-able state for parse(msg, cb)
  var frozen;
  function freeze () {
    frozen = {};
    frozen.options = options;
    frozen.configObjects = options.configObjects.slice(0);
    frozen.exitProcess = exitProcess;
    frozen.groups = groups;
    usage$$1.freeze();
    validation$$1.freeze();
    command.freeze();
    frozen.strict = strict;
    frozen.completionCommand = completionCommand;
    frozen.output = output;
    frozen.exitError = exitError;
    frozen.hasOutput = hasOutput;
    frozen.parsed = self.parsed;
  }
  function unfreeze () {
    options = frozen.options;
    options.configObjects = frozen.configObjects;
    exitProcess = frozen.exitProcess;
    groups = frozen.groups;
    output = frozen.output;
    exitError = frozen.exitError;
    hasOutput = frozen.hasOutput;
    self.parsed = frozen.parsed;
    usage$$1.unfreeze();
    validation$$1.unfreeze();
    command.unfreeze();
    strict = frozen.strict;
    completionCommand = frozen.completionCommand;
    parseFn = null;
    parseContext = null;
    frozen = undefined;
  }

  self.boolean = function (keys) {
    argsert('<array|string>', [keys], arguments.length);
    populateParserHintArray('boolean', keys);
    return self
  };

  self.array = function (keys) {
    argsert('<array|string>', [keys], arguments.length);
    populateParserHintArray('array', keys);
    return self
  };

  self.number = function (keys) {
    argsert('<array|string>', [keys], arguments.length);
    populateParserHintArray('number', keys);
    return self
  };

  self.normalize = function (keys) {
    argsert('<array|string>', [keys], arguments.length);
    populateParserHintArray('normalize', keys);
    return self
  };

  self.count = function (keys) {
    argsert('<array|string>', [keys], arguments.length);
    populateParserHintArray('count', keys);
    return self
  };

  self.string = function (keys) {
    argsert('<array|string>', [keys], arguments.length);
    populateParserHintArray('string', keys);
    return self
  };

  self.requiresArg = function (keys) {
    argsert('<array|string>', [keys], arguments.length);
    populateParserHintArray('requiresArg', keys);
    return self
  };

  self.skipValidation = function (keys) {
    argsert('<array|string>', [keys], arguments.length);
    populateParserHintArray('skipValidation', keys);
    return self
  };

  function populateParserHintArray (type, keys, value) {
    keys = [].concat(keys);
    keys.forEach(function (key) {
      options[type].push(key);
    });
  }

  self.nargs = function (key, value) {
    argsert('<string|object|array> [number]', [key, value], arguments.length);
    populateParserHintObject(self.nargs, false, 'narg', key, value);
    return self
  };

  self.choices = function (key, value) {
    argsert('<object|string|array> [string|array]', [key, value], arguments.length);
    populateParserHintObject(self.choices, true, 'choices', key, value);
    return self
  };

  self.alias = function (key, value) {
    argsert('<object|string|array> [string|array]', [key, value], arguments.length);
    populateParserHintObject(self.alias, true, 'alias', key, value);
    return self
  };

  // TODO: actually deprecate self.defaults.
  self.default = self.defaults = function (key, value, defaultDescription) {
    argsert('<object|string|array> [*] [string]', [key, value, defaultDescription], arguments.length);
    if (defaultDescription) options.defaultDescription[key] = defaultDescription;
    if (typeof value === 'function') {
      if (!options.defaultDescription[key]) options.defaultDescription[key] = usage$$1.functionDescription(value);
      value = value.call();
    }
    populateParserHintObject(self.default, false, 'default', key, value);
    return self
  };

  self.describe = function (key, desc) {
    argsert('<object|string|array> [string]', [key, desc], arguments.length);
    populateParserHintObject(self.describe, false, 'key', key, true);
    usage$$1.describe(key, desc);
    return self
  };

  self.demandOption = function (keys, msg) {
    argsert('<object|string|array> [string]', [keys, msg], arguments.length);
    populateParserHintObject(self.demandOption, false, 'demandedOptions', keys, msg);
    return self
  };

  self.coerce = function (keys, value) {
    argsert('<object|string|array> [function]', [keys, value], arguments.length);
    populateParserHintObject(self.coerce, false, 'coerce', keys, value);
    return self
  };

  function populateParserHintObject (builder, isArray, type, key, value) {
    if (Array.isArray(key)) {
      // an array of keys with one value ['x', 'y', 'z'], function parse () {}
      var temp = {};
      key.forEach(function (k) {
        temp[k] = value;
      });
      builder(temp);
    } else if (typeof key === 'object') {
      // an object of key value pairs: {'x': parse () {}, 'y': parse() {}}
      Object.keys(key).forEach(function (k) {
        builder(k, key[k]);
      });
    } else {
      // a single key value pair 'x', parse() {}
      if (isArray) {
        options[type][key] = (options[type][key] || []).concat(value);
      } else {
        options[type][key] = value;
      }
    }
  }

  self.config = function (key, msg, parseFn) {
    argsert('[object|string] [string|function] [function]', [key, msg, parseFn], arguments.length);
    // allow a config object to be provided directly.
    if (typeof key === 'object') {
      key = applyExtends_1(key, cwd);
      options.configObjects = (options.configObjects || []).concat(key);
      return self
    }

    // allow for a custom parsing function.
    if (typeof msg === 'function') {
      parseFn = msg;
      msg = null;
    }

    key = key || 'config';
    self.describe(key, msg || usage$$1.deferY18nLookup('Path to JSON config file'))
    ;(Array.isArray(key) ? key : [key]).forEach(function (k) {
      options.config[k] = parseFn || true;
    });

    return self
  };

  self.example = function (cmd, description) {
    argsert('<string> [string]', [cmd, description], arguments.length);
    usage$$1.example(cmd, description);
    return self
  };

  self.command = function (cmd, description, builder, handler) {
    argsert('<string|array|object> [string|boolean] [function|object] [function]', [cmd, description, builder, handler], arguments.length);
    command.addHandler(cmd, description, builder, handler);
    return self
  };

  self.commandDir = function (dir, opts) {
    argsert('<string> [object]', [dir, opts], arguments.length);
    const req = parentRequire || commonjsRequire;
    command.addDirectory(dir, self.getContext(), req, require$$0$5(), opts);
    return self
  };

  // TODO: deprecate self.demand in favor of
  // .demandCommand() .demandOption().
  self.demand = self.required = self.require = function (keys, max, msg) {
    // you can optionally provide a 'max' key,
    // which will raise an exception if too many '_'
    // options are provided.
    if (Array.isArray(max)) {
      max.forEach(function (key) {
        self.demandOption(key, msg);
      });
      max = Infinity;
    } else if (typeof max !== 'number') {
      msg = max;
      max = Infinity;
    }

    if (typeof keys === 'number') {
      self.demandCommand(keys, max, msg, msg);
    } else if (Array.isArray(keys)) {
      keys.forEach(function (key) {
        self.demandOption(key, msg);
      });
    } else {
      if (typeof msg === 'string') {
        self.demandOption(keys, msg);
      } else if (msg === true || typeof msg === 'undefined') {
        self.demandOption(keys);
      }
    }

    return self
  };

  self.demandCommand = function (min, max, minMsg, maxMsg) {
    argsert('[number] [number|string] [string|null] [string|null]', [min, max, minMsg, maxMsg], arguments.length);

    if (typeof min === 'undefined') min = 1;

    if (typeof max !== 'number') {
      minMsg = max;
      max = Infinity;
    }

    self.global('_', false);

    options.demandedCommands._ = {
      min: min,
      max: max,
      minMsg: minMsg,
      maxMsg: maxMsg
    };

    return self
  };

  self.getDemandedOptions = function () {
    argsert([], 0);
    return options.demandedOptions
  };

  self.getDemandedCommands = function () {
    argsert([], 0);
    return options.demandedCommands
  };

  self.implies = function (key, value) {
    argsert('<string|object> [string]', [key, value], arguments.length);
    validation$$1.implies(key, value);
    return self
  };

  self.conflicts = function (key1, key2) {
    argsert('<string|object> [string]', [key1, key2], arguments.length);
    validation$$1.conflicts(key1, key2);
    return self
  };

  self.usage = function (msg, opts) {
    argsert('<string|null|object> [object]', [msg, opts], arguments.length);

    if (!opts && typeof msg === 'object') {
      opts = msg;
      msg = null;
    }

    usage$$1.usage(msg);

    if (opts) self.options(opts);

    return self
  };

  self.epilogue = self.epilog = function (msg) {
    argsert('<string>', [msg], arguments.length);
    usage$$1.epilog(msg);
    return self
  };

  self.fail = function (f) {
    argsert('<function>', [f], arguments.length);
    usage$$1.failFn(f);
    return self
  };

  self.check = function (f, _global) {
    argsert('<function> [boolean]', [f, _global], arguments.length);
    validation$$1.check(f, _global !== false);
    return self
  };

  self.global = function (globals, global) {
    argsert('<string|array> [boolean]', [globals, global], arguments.length);
    globals = [].concat(globals);
    if (global !== false) {
      options.local = options.local.filter(function (l) {
        return globals.indexOf(l) === -1
      });
    } else {
      globals.forEach(function (g) {
        if (options.local.indexOf(g) === -1) options.local.push(g);
      });
    }
    return self
  };

  self.pkgConf = function (key, path$$1) {
    argsert('<string> [string]', [key, path$$1], arguments.length);
    var conf = null;
    // prefer cwd to require-main-filename in this method
    // since we're looking for e.g. "nyc" config in nyc consumer
    // rather than "yargs" config in nyc (where nyc is the main filename)
    var obj = pkgUp(path$$1 || cwd);

    // If an object exists in the key, add it to options.configObjects
    if (obj[key] && typeof obj[key] === 'object') {
      conf = applyExtends_1(obj[key], path$$1 || cwd);
      options.configObjects = (options.configObjects || []).concat(conf);
    }

    return self
  };

  var pkgs = {};
  function pkgUp (path$$1) {
    var npath = path$$1 || '*';
    if (pkgs[npath]) return pkgs[npath]
    const readPkgUp = index$16;

    var obj = {};
    try {
      obj = readPkgUp.sync({
        cwd: path$$1 || require$$2$1(parentRequire || commonjsRequire),
        normalize: false
      });
    } catch (noop) {}

    pkgs[npath] = obj.pkg || {};
    return pkgs[npath]
  }

  var parseFn = null;
  var parseContext = null;
  self.parse = function (args, shortCircuit, _parseFn) {
    argsert('<string|array> [function|boolean|object] [function]', [args, shortCircuit, _parseFn], arguments.length);

    // a context object can optionally be provided, this allows
    // additional information to be passed to a command handler.
    if (typeof shortCircuit === 'object') {
      parseContext = shortCircuit;
      shortCircuit = _parseFn;
    }

    // by providing a function as a second argument to
    // parse you can capture output that would otherwise
    // default to printing to stdout/stderr.
    if (typeof shortCircuit === 'function') {
      parseFn = shortCircuit;
      shortCircuit = null;
    }
    // completion short-circuits the parsing process,
    // skipping validation, etc.
    if (!shortCircuit) processArgs = args;

    freeze();
    if (parseFn) exitProcess = false;

    var parsed = self._parseArgs(args, shortCircuit);
    if (parseFn) parseFn(exitError, parsed, output);
    unfreeze();

    return parsed
  };

  self._getParseContext = function () {
    return parseContext || {}
  };

  self._hasParseCallback = function () {
    return !!parseFn
  };

  self.option = self.options = function (key, opt) {
    argsert('<string|object> [object]', [key, opt], arguments.length);
    if (typeof key === 'object') {
      Object.keys(key).forEach(function (k) {
        self.options(k, key[k]);
      });
    } else {
      if (typeof opt !== 'object') {
        opt = {};
      }

      options.key[key] = true; // track manually set keys.

      if (opt.alias) self.alias(key, opt.alias);

      var demand = opt.demand || opt.required || opt.require;

      // deprecated, use 'demandOption' instead
      if (demand) {
        self.demand(key, demand);
      }

      if (opt.demandOption) {
        self.demandOption(key, typeof opt.demandOption === 'string' ? opt.demandOption : undefined);
      }

      if ('config' in opt) {
        self.config(key, opt.configParser);
      }

      if ('conflicts' in opt) {
        self.conflicts(key, opt.conflicts);
      }

      if ('default' in opt) {
        self.default(key, opt.default);
      }

      if ('implies' in opt) {
        self.implies(key, opt.implies);
      }

      if ('nargs' in opt) {
        self.nargs(key, opt.nargs);
      }

      if ('normalize' in opt) {
        self.normalize(key);
      }

      if ('choices' in opt) {
        self.choices(key, opt.choices);
      }

      if ('coerce' in opt) {
        self.coerce(key, opt.coerce);
      }

      if ('group' in opt) {
        self.group(key, opt.group);
      }

      if (opt.boolean || opt.type === 'boolean') {
        self.boolean(key);
        if (opt.alias) self.boolean(opt.alias);
      }

      if (opt.array || opt.type === 'array') {
        self.array(key);
        if (opt.alias) self.array(opt.alias);
      }

      if (opt.number || opt.type === 'number') {
        self.number(key);
        if (opt.alias) self.number(opt.alias);
      }

      if (opt.string || opt.type === 'string') {
        self.string(key);
        if (opt.alias) self.string(opt.alias);
      }

      if (opt.count || opt.type === 'count') {
        self.count(key);
      }

      if (typeof opt.global === 'boolean') {
        self.global(key, opt.global);
      }

      if (opt.defaultDescription) {
        options.defaultDescription[key] = opt.defaultDescription;
      }

      if (opt.skipValidation) {
        self.skipValidation(key);
      }

      var desc = opt.describe || opt.description || opt.desc;
      if (desc) {
        self.describe(key, desc);
      }

      if (opt.requiresArg) {
        self.requiresArg(key);
      }
    }

    return self
  };
  self.getOptions = function () {
    return options
  };

  self.group = function (opts, groupName) {
    argsert('<string|array> <string>', [opts, groupName], arguments.length);
    var existing = preservedGroups[groupName] || groups[groupName];
    if (preservedGroups[groupName]) {
      // we now only need to track this group name in groups.
      delete preservedGroups[groupName];
    }

    var seen = {};
    groups[groupName] = (existing || []).concat(opts).filter(function (key) {
      if (seen[key]) return false
      return (seen[key] = true)
    });
    return self
  };
  self.getGroups = function () {
    // combine explicit and preserved groups. explicit groups should be first
    return assign(groups, preservedGroups)
  };

  // as long as options.envPrefix is not undefined,
  // parser will apply env vars matching prefix to argv
  self.env = function (prefix) {
    argsert('[string|boolean]', [prefix], arguments.length);
    if (prefix === false) options.envPrefix = undefined;
    else options.envPrefix = prefix || '';
    return self
  };

  self.wrap = function (cols) {
    argsert('<number|null>', [cols], arguments.length);
    usage$$1.wrap(cols);
    return self
  };

  var strict = false;
  self.strict = function (enabled) {
    argsert('[boolean]', [enabled], arguments.length);
    strict = enabled !== false;
    return self
  };
  self.getStrict = function () {
    return strict
  };

  self.showHelp = function (level) {
    argsert('[string|function]', [level], arguments.length);
    if (!self.parsed) self._parseArgs(processArgs); // run parser, if it has not already been executed.
    usage$$1.showHelp(level);
    return self
  };

  var versionOpt = null;
  self.version = function (opt, msg, ver) {
    argsert('[string|function] [string|function] [string]', [opt, msg, ver], arguments.length);
    if (arguments.length === 0) {
      ver = guessVersion();
      opt = 'version';
    } else if (arguments.length === 1) {
      ver = opt;
      opt = 'version';
    } else if (arguments.length === 2) {
      ver = msg;
      msg = null;
    }

    versionOpt = opt;
    msg = msg || usage$$1.deferY18nLookup('Show version number');

    usage$$1.version(ver || undefined);
    self.boolean(versionOpt);
    self.describe(versionOpt, msg);
    return self
  };

  function guessVersion () {
    var obj = pkgUp();

    return obj.version || 'unknown'
  }

  var helpOpt = null;
  var useHelpOptAsCommand = false; // a call to .help() will enable this
  self.addHelpOpt = self.help = function (opt, msg, addImplicitCmd) {
    argsert('[string|boolean] [string|boolean] [boolean]', [opt, msg, addImplicitCmd], arguments.length);

    // argument shuffle
    if (arguments.length === 0) {
      useHelpOptAsCommand = true;
    } else if (arguments.length === 1) {
      if (typeof opt === 'boolean') {
        useHelpOptAsCommand = opt;
        opt = null;
      } else {
        useHelpOptAsCommand = true;
      }
    } else if (arguments.length === 2) {
      if (typeof msg === 'boolean') {
        useHelpOptAsCommand = msg;
        msg = null;
      } else {
        useHelpOptAsCommand = true;
      }
    } else {
      useHelpOptAsCommand = Boolean(addImplicitCmd);
    }
    // use arguments, fallback to defaults for opt and msg
    helpOpt = opt || 'help';
    self.boolean(helpOpt);
    self.describe(helpOpt, msg || usage$$1.deferY18nLookup('Show help'));
    return self
  };

  self.showHelpOnFail = function (enabled, message) {
    argsert('[boolean|string] [string]', [enabled, message], arguments.length);
    usage$$1.showHelpOnFail(enabled, message);
    return self
  };

  var exitProcess = true;
  self.exitProcess = function (enabled) {
    argsert('[boolean]', [enabled], arguments.length);
    if (typeof enabled !== 'boolean') {
      enabled = true;
    }
    exitProcess = enabled;
    return self
  };
  self.getExitProcess = function () {
    return exitProcess
  };

  var completionCommand = null;
  self.completion = function (cmd, desc, fn) {
    argsert('[string] [string|boolean|function] [function]', [cmd, desc, fn], arguments.length);

    // a function to execute when generating
    // completions can be provided as the second
    // or third argument to completion.
    if (typeof desc === 'function') {
      fn = desc;
      desc = null;
    }

    // register the completion command.
    completionCommand = cmd || 'completion';
    if (!desc && desc !== false) {
      desc = 'generate bash completion script';
    }
    self.command(completionCommand, desc);

    // a function can be provided
    if (fn) completion$$1.registerFunction(fn);

    return self
  };

  self.showCompletionScript = function ($0) {
    argsert('[string]', [$0], arguments.length);
    $0 = $0 || self.$0;
    _logger.log(completion$$1.generateCompletionScript($0));
    return self
  };

  self.getCompletion = function (args, done) {
    argsert('<array> <function>', [args, done], arguments.length);
    completion$$1.getCompletion(args, done);
  };

  self.locale = function (locale) {
    argsert('[string]', [locale], arguments.length);
    if (arguments.length === 0) {
      guessLocale();
      return y18n.getLocale()
    }
    detectLocale = false;
    y18n.setLocale(locale);
    return self
  };

  self.updateStrings = self.updateLocale = function (obj) {
    argsert('<object>', [obj], arguments.length);
    detectLocale = false;
    y18n.updateLocale(obj);
    return self
  };

  var detectLocale = true;
  self.detectLocale = function (detect) {
    argsert('<boolean>', [detect], arguments.length);
    detectLocale = detect;
    return self
  };
  self.getDetectLocale = function () {
    return detectLocale
  };

  var hasOutput = false;
  var exitError = null;
  // maybe exit, always capture
  // context about why we wanted to exit.
  self.exit = function (code, err) {
    hasOutput = true;
    exitError = err;
    if (exitProcess) process.exit(code);
  };

  // we use a custom logger that buffers output,
  // so that we can print to non-CLIs, e.g., chat-bots.
  var _logger = {
    log: function () {
      const args = [];
      for (var i = 0; i < arguments.length; i++) args.push(arguments[i]);
      if (!self._hasParseCallback()) console.log.apply(console, args);
      hasOutput = true;
      if (output.length) output += '\n';
      output += args.join(' ');
    },
    error: function () {
      const args = [];
      for (var i = 0; i < arguments.length; i++) args.push(arguments[i]);
      if (!self._hasParseCallback()) console.error.apply(console, args);
      hasOutput = true;
      if (output.length) output += '\n';
      output += args.join(' ');
    }
  };
  self._getLoggerInstance = function () {
    return _logger
  };
  // has yargs output an error our help
  // message in the current execution context.
  self._hasOutput = function () {
    return hasOutput
  };

  self._setHasOutput = function () {
    hasOutput = true;
  };

  var recommendCommands;
  self.recommendCommands = function (recommend) {
    argsert('[boolean]', [recommend], arguments.length);
    recommendCommands = typeof recommend === 'boolean' ? recommend : true;
    return self
  };

  self.getUsageInstance = function () {
    return usage$$1
  };

  self.getValidationInstance = function () {
    return validation$$1
  };

  self.getCommandInstance = function () {
    return command
  };

  self.terminalWidth = function () {
    argsert([], 0);
    return typeof process.stdout.columns !== 'undefined' ? process.stdout.columns : null
  };

  Object.defineProperty(self, 'argv', {
    get: function () {
      return self._parseArgs(processArgs)
    },
    enumerable: true
  });

  self._parseArgs = function (args, shortCircuit, _skipValidation, commandIndex) {
    var skipValidation = !!_skipValidation;
    args = args || processArgs;

    options.__ = y18n.__;
    options.configuration = pkgUp()['yargs'] || {};
    const parsed = Parser$1.detailed(args, options);
    var argv = parsed.argv;
    if (parseContext) argv = assign(argv, parseContext);
    var aliases = parsed.aliases;

    argv.$0 = self.$0;
    self.parsed = parsed;

    try {
      guessLocale(); // guess locale lazily, so that it can be turned off in chain.

      // while building up the argv object, there
      // are two passes through the parser. If completion
      // is being performed short-circuit on the first pass.
      if (shortCircuit) {
        return argv
      }

      if (argv._.length) {
        // check for helpOpt in argv._ before running commands
        // assumes helpOpt must be valid if useHelpOptAsCommand is true
        if (useHelpOptAsCommand) {
          // consider any multi-char helpOpt alias as a valid help command
          // unless all helpOpt aliases are single-char
          // note that parsed.aliases is a normalized bidirectional map :)
          var helpCmds = [helpOpt].concat(aliases[helpOpt] || []);
          var multiCharHelpCmds = helpCmds.filter(function (k) {
            return k.length > 1
          });
          if (multiCharHelpCmds.length) helpCmds = multiCharHelpCmds;
          // look for and strip any helpCmds from argv._
          argv._ = argv._.filter(function (cmd) {
            if (~helpCmds.indexOf(cmd)) {
              argv[helpOpt] = true;
              return false
            }
            return true
          });
        }

        // if there's a handler associated with a
        // command defer processing to it.
        var handlerKeys = command.getCommands();
        if (handlerKeys.length) {
          var firstUnknownCommand;
          for (var i = (commandIndex || 0), cmd; argv._[i] !== undefined; i++) {
            cmd = String(argv._[i]);
            if (~handlerKeys.indexOf(cmd) && cmd !== completionCommand) {
              setPlaceholderKeys(argv);
              // commands are executed using a recursive algorithm that executes
              // the deepest command first; we keep track of the position in the
              // argv._ array that is currently being executed.
              return command.runCommand(cmd, self, parsed, i + 1)
            } else if (!firstUnknownCommand && cmd !== completionCommand) {
              firstUnknownCommand = cmd;
              break
            }
          }

          // run the default command, if defined
          if (command.hasDefaultCommand() && !argv[helpOpt]) {
            setPlaceholderKeys(argv);
            return command.runCommand(null, self, parsed)
          }

          // recommend a command if recommendCommands() has
          // been enabled, and no commands were found to execute
          if (recommendCommands && firstUnknownCommand && !argv[helpOpt]) {
            validation$$1.recommendCommands(firstUnknownCommand, handlerKeys);
          }
        }

        // generate a completion script for adding to ~/.bashrc.
        if (completionCommand && ~argv._.indexOf(completionCommand) && !argv[completion$$1.completionKey]) {
          if (exitProcess) setBlocking(true);
          self.showCompletionScript();
          self.exit(0);
        }
      } else if (command.hasDefaultCommand() && !argv[helpOpt]) {
        setPlaceholderKeys(argv);
        return command.runCommand(null, self, parsed)
      }

      // we must run completions first, a user might
      // want to complete the --help or --version option.
      if (completion$$1.completionKey in argv) {
        if (exitProcess) setBlocking(true);

        // we allow for asynchronous completions,
        // e.g., loading in a list of commands from an API.
        var completionArgs = args.slice(args.indexOf('--' + completion$$1.completionKey) + 1);
        completion$$1.getCompletion(completionArgs, function (completions) {
          (completions || []).forEach(function (completion$$1) {
            _logger.log(completion$$1);
          });

          self.exit(0);
        });
        return setPlaceholderKeys(argv)
      }

      // Handle 'help' and 'version' options
      // if we haven't already output help!
      if (!hasOutput) {
        Object.keys(argv).forEach(function (key) {
          if (key === helpOpt && argv[key]) {
            if (exitProcess) setBlocking(true);

            skipValidation = true;
            self.showHelp('log');
            self.exit(0);
          } else if (key === versionOpt && argv[key]) {
            if (exitProcess) setBlocking(true);

            skipValidation = true;
            usage$$1.showVersion();
            self.exit(0);
          }
        });
      }

      // Check if any of the options to skip validation were provided
      if (!skipValidation && options.skipValidation.length > 0) {
        skipValidation = Object.keys(argv).some(function (key) {
          return options.skipValidation.indexOf(key) >= 0 && argv[key] === true
        });
      }

      // If the help or version options where used and exitProcess is false,
      // or if explicitly skipped, we won't run validations.
      if (!skipValidation) {
        if (parsed.error) throw new yerror(parsed.error.message)

        // if we're executed via bash completion, don't
        // bother with validation.
        if (!argv[completion$$1.completionKey]) {
          self._runValidation(argv, aliases, {}, parsed.error);
        }
      }
    } catch (err) {
      if (err instanceof yerror) usage$$1.fail(err.message, err);
      else throw err
    }

    return setPlaceholderKeys(argv)
  };

  self._runValidation = function (argv, aliases, positionalMap, parseErrors) {
    if (parseErrors) throw new yerror(parseErrors.message)
    validation$$1.nonOptionCount(argv);
    validation$$1.missingArgumentValue(argv);
    validation$$1.requiredArguments(argv);
    if (strict) validation$$1.unknownArguments(argv, aliases, positionalMap);
    validation$$1.customChecks(argv, aliases);
    validation$$1.limitedChoices(argv);
    validation$$1.implications(argv);
    validation$$1.conflicting(argv);
  };

  function guessLocale () {
    if (!detectLocale) return

    try {
      const osLocale = index$31;
      self.locale(osLocale.sync({ spawn: false }));
    } catch (err) {
      // if we explode looking up locale just noop
      // we'll keep using the default language 'en'.
    }
  }

  function setPlaceholderKeys (argv) {
    Object.keys(options.key).forEach(function (key) {
      // don't set placeholder keys for dot
      // notation options 'foo.bar'.
      if (~key.indexOf('.')) return
      if (typeof argv[key] === 'undefined') argv[key] = undefined;
    });
    return argv
  }

  return self
}

// rebase an absolute path to a relative one with respect to a base directory
// exported for tests
exports.rebase = rebase;
function rebase (base, dir) {
  return path.relative(base, dir)
}
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function cliResolver(yargv) {
  if (!yargv || (typeof yargv === 'undefined' ? 'undefined' : _typeof(yargv)) !== 'object') {
    return {};
  }

  var config = {};

  if (yargv.searchDir && Array.isArray(yargv.searchDir)) {
    config.searchDir = yargv.searchDir;
  } else if (yargv.searchDir) {
    config.searchDir = [yargv.searchDir];
  }

  if (yargv.outputFile) {
    config.outputFile = yargv.outputFile;
  }

  if (yargv.pattern) {
    config.pattern = yargv.pattern;
  }

  return config;
}

var logger = console;

function info(message, value) {
  var outputValue = value || '';
  logger.log(message.blue, outputValue.white);
}

function warn(message) {
  logger.log(message.yellow);
}

function loadStories(pattern) {
  // Get the files
  return glob.sync(pattern);
}

var appName = 'react-native-storybook-loader';
var encoding = 'utf-8';

dot.templateSettings.strip = false;

function getRelativePaths(fromDir, files) {
  files.sort();
  return files.map(function (file) {
    var relativePath = path.relative(fromDir, file);

    if (relativePath.substr(0, 2) !== '..' || relativePath.substr(0, 2) !== './') {
      relativePath = './' + relativePath;
    }
    relativePath = require('os').platform() === 'win32' ? relativePath.replace(/\\/g, '/') : relativePath;

    return {
      relative: relativePath,
      full: file
    };
  });
}

function ensureFileDirectoryExists(filePath) {
  var directory = path.dirname(filePath);

  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory);
  }
}

var templateContents = '\n// template for doT (https://github.com/olado/doT)\n\nfunction loadStories() {\n  \n  {{~it.files :value:index}}require(\'{{=value.relative}}\');\n  {{~}}\n}\n\nmodule.exports = {\n  loadStories,\n};\n';

function writeFile(files, outputPath) {
  var template = dot.template(templateContents);
  var relativePaths = getRelativePaths(path.dirname(outputPath), files);

  var output = template({ files: relativePaths });

  ensureFileDirectoryExists(outputPath);

  fs.writeFileSync(outputPath, output, { encoding: encoding });
}

function writeOutStoryLoader(pathConfig) {
  pathConfig.outputFiles.forEach(function (outputFileConfig) {
    info('Output file:      ', outputFileConfig.outputFile);
    info('Patterns:         ', JSON.stringify(outputFileConfig.patterns));

    var storyFiles = [];

    outputFileConfig.patterns.forEach(function (pattern) {
      var patternStories = loadStories(pattern);
      Array.prototype.push.apply(storyFiles, patternStories);
      info('Located ' + patternStories.length + ' files matching pattern \'' + pattern + '\'');
    });

    if (storyFiles.length > 0) {
      writeFile(storyFiles, outputFileConfig.outputFile);
      info('Compiled story loader for ' + storyFiles.length + ' files:\n', ' ' + storyFiles.join('\n  '));
    } else {
      warn('No files were found matching the specified pattern. Story loader was not written.');
    }
  });
}

/**
 * Returns the default value for the specified
 * @param {string} setting Name of the setting
 */
function getDefaultValue(setting) {
  switch (setting) {
    case 'pattern':
      return './storybook/stories/index.js';
    case 'outputFile':
      return './storybook/storyLoader.js';
    case 'searchDir':
      return ['./'];
    default:
      return './';
  }
}

/**
 * Verifies if the specified setting exists. Returns true if the setting exists, otherwise false.
 * @param {object} pkg the contents of the package.json in object form.
 * @param {string} setting Name of the setting to look for
 */
function hasConfigSetting(pkg, setting) {
  return pkg.config && pkg.config[appName] && pkg.config[appName][setting];
}

/**
 * Gets the value for the specified setting if the setting exists, otherwise null
 * @param {object} pkg pkg the contents of the package.json in object form.
 * @param {string} setting setting Name of the setting to look for
 * @param {bool} ensureArray flag denoting whether to ensure the setting is an array
 */
function getConfigSetting(pkg, setting, ensureArray) {
  if (!hasConfigSetting(pkg, setting)) {
    return null;
  }

  var value = pkg.config[appName][setting];
  if (ensureArray && !Array.isArray(value)) {
    return [value];
  }

  return value;
}

/**
 * Parses the package.json file and returns a config object
 * @param {string} packageJsonFile Path to the package.json file
 */
function getConfigSettings(packageJsonFile) {
  // Locate and read package.json
  var pkg = JSON.parse(fs.readFileSync(packageJsonFile));

  return {
    searchDir: getConfigSetting(pkg, 'searchDir', true) || getDefaultValue('searchDir'),
    outputFile: getConfigSetting(pkg, 'outputFile') || getDefaultValue('outputFile'),
    pattern: getConfigSetting(pkg, 'pattern') || getDefaultValue('pattern')
  };
}

/**
 * Resolves paths and returns the following schema:
 * {
 *    "outputFiles": [{
 *      "patterns":[],
 *      "outputFile": ""
 *    }, {...}]
 * }
 * @param {string} processDirectory directory of the currently running process
 */
function resolvePaths(processDirectory, cliConfig) {
  var overrides = cliConfig || {};
  // Locate and read package.json
  var packageJsonFile = path.resolve(findup.sync(processDirectory, 'package.json'), 'package.json');
  var baseDir = path.dirname(packageJsonFile);

  var config = Object.assign({}, getConfigSettings(packageJsonFile, baseDir), overrides);
  var outputFile = path.resolve(baseDir, config.outputFile);

  var outputFiles = [{
    outputFile: outputFile,
    patterns: config.searchDir.map(function (dir) {
      return path.resolve(baseDir, dir, config.pattern);
    })
  }];

  return {
    outputFiles: outputFiles
  };
}

var args = yargs().usage('$0 [options]').options({
  searchDir: {
    array: true,
    desc: 'The directory or directories, relative to the project root, to search for files in.'
  },
  pattern: {
    desc: 'The directory or directories, relative to the project root, to search for files in.',
    type: 'string'
  },
  outputFile: {
    desc: 'The directory or directories, relative to the project root, to search for files in.',
    type: 'string'
  }
}).help().argv;

var cliConfig = cliResolver(args);
var pathConfig = resolvePaths(process.cwd(), cliConfig);
info('\nGenerating Dynamic Storybook File List\n');

writeOutStoryLoader(pathConfig);
//# sourceMappingURL=rnstl-cli.js.map
