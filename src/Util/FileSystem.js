const FS = require('fs');
const Path = require('path');
const SpawnSync = require('child_process').spawnSync;

const Logger = require('./Logger');

module.exports = class FileSystem {

  /**
   * @param {Logger} logger 
   */
  constructor(logger) {
    this.logger = logger || new Logger();
  }

  exists(path) {
    return FS.existsSync(path);
  }

  copy(from, to, replaces = {}) {
    this.logger.log('Copy ' + to + ' ...');
    if (FS.existsSync(Path.normalize(to))) {
      this.logger.notice('The file "' + to + '" exists already.');
    } else {
      let content = FS.readFileSync(Path.normalize(from)).toString();
      for (const field in replaces) {
        content = content.replace(new RegExp('\\[\\[' + field + '\\]\\]', 'g'), replaces[field]);
      }
      FS.writeFileSync(Path.normalize(to), content);
    }
  }

  shell(command, ...args) {
    this.logger.log('Execute "' + command + ' ' + args.join(' ') + '" ...');
    return SpawnSync(command, args, {
      shell: true,
      stdio: 'inherit',
    });
  }

  mkdirs(cwd, ...dirs) {
    let path = cwd;
    for (const dir of dirs) {
      path = Path.join(path, dir);
      if (!FS.existsSync(path)) {
        this.logger.log('Create directory "' + path.substring(cwd.length) + '" ...');
        FS.mkdirSync(path);
      }
    }
  }

  dirs(path) {
    const dirs = [];

    for (const file of FS.readdirSync(path)) {
      if (FS.statSync(Path.join(path, file)).isDirectory()) {
        dirs.push(file);
      }
    }
    return dirs;
  }

  files(path) {
    const files = [];

    for (const file of FS.readdirSync(path)) {
      if (FS.statSync(Path.join(path, file)).isFile()) {
        files.push(file);
      }
    }
    return files;
  }

}