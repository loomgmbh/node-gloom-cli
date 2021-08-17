const FS = require('fs');
const Path = require('path');
const SpawnSync = require('child_process').spawnSync;
const SchemaValidate = require('jsonschema').validate;

const Logger = require('./Logger');

/**
 * @callback copyCallback
 * @param {string} from
 * @param {string} to
 * @param {boolean} isDir
 */

module.exports = class FileSystem {

  static findFileRoot(path, file) {
    let root = path;
    while (root) {
      if (FS.existsSync(Path.join(root, file))) {
        return Path.join(root, file);
      }
      const parent = Path.join(root, '..');
      if (parent === root) break;
      root = parent;
    }
    return null;
  }

  /**
   * @param {string} from 
   * @param {string} to 
   * @param {object} replaces
   * @param {boolean} force
   * @param {copyCallback} callback
   */
   static copyPath(from, to, replaces = {}, force = false, callback = null) {
    if (FS.statSync(from).isFile()) {
      to = FileSystem.replace(Path.join(to, Path.basename(from)), replaces, true);
      if (!FS.existsSync(to) || force) {
        if (callback) callback(from, to, false);
        FS.writeFileSync(to, FileSystem.replace(FS.readFileSync(from).toString(), replaces));
      }
    } else {
      const files = FS.readdirSync(from);
      for (const file of files) {
        const path = Path.join(from, file);
        const toPath = FileSystem.replace(Path.join(to, file), replaces, true);

        if (FS.statSync(path).isDirectory()) {
          if (!FS.existsSync(toPath)) {
            if (callback) callback(path, toPath, true);
            FS.mkdirSync(toPath);
          }
          FileSystem.copyPath(path, toPath, replaces, force, callback);
        } else {
          if (!FS.existsSync(toPath) || force) {
            if (callback) callback(path, toPath, false);
            FS.writeFileSync(toPath, FileSystem.replace(FS.readFileSync(path).toString(), replaces));
          }
        }
      }
    }
  }

  /**
   * @param {string} content 
   * @param {object} replaces 
   * @param {boolean} isPath 
   */
  static replace(content, replaces = {}, isPath = false) {
    for (const field in replaces) {
      let regex = null;
      if (isPath) {
        regex = new RegExp('_' + field + '_', 'g');
      } else {
        regex = new RegExp('\\[\\[' + field + '\\]\\]', 'g');
      }
      content = content.replace(regex, replaces[field]);
    }
    return content;
  }

  /**
   * @param {Logger} logger 
   */
  constructor(logger) {
    this.logger = logger || new Logger();
  }

  /**
   * @param  {...string} args 
   * @returns {(string|null)}
   */
  path(...args) {
    const root = this.root();
    if (root === null) return null;
    return Path.join(root, ...args);
  }

  findRoot(path, file) {
    return FileSystem.findFileRoot(path, file);
  }

  exists(path) {
    return FS.existsSync(path);
  }

  rel(path) {
    if (Path.isAbsolute(path)) {
      const root = this.root();
      
      if (root === null) {
        return path;
      } else {
        return path.substring(root.length);
      }
    }
    return path;
  }

  /**
   * @param {string} path 
   */
  rm(path) {
    if (FS.statSync(path).isDirectory()) {
      FS.rmdirSync(path);
      this.logger.log('Delete directory "' + this.rel(path) + '" ...');
    } else {
      FS.rmSync(path);
      this.logger.log('Delete file "' + this.rel(path) + '" ...');
    }
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

  /**
   * @param {string} from 
   * @param {string} to 
   * @param {object} replaces
   * @param {boolean} force
   * @param {copyCallback} callback
   */
  copyFull(from, to, replaces = {}, force = false, callback = null) {
    return FileSystem.copyPath(from, to, replaces, force, callback);
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

  /**
   * @param {object} object 
   * @param {(string|object)} schemaname 
   * @param {function} onError 
   * @returns {boolean}
   */
  checkSchema(object, schemaname, onError = null) {
    let schema = null;
    if (typeof schemaname === 'object') {
      schema = schemaname;
    } else {
      schema = require(Path.join(__dirname, '../../schema', schemaname + '.schema.json'));
    }
    
    const result = SchemaValidate(object, schema);
    if (result.errors && result.errors.length) {
      if (typeof onError === 'function') {
        onError(result);
      } else {
        this.logger.nl();
        for (const error of result.errors) {
          this.logger.errorLite('"' + error.path.join('.') + '" ' + error.message);
        }
      }
      return false;
    }
    return true;
  }

  /**
   * @returns {(string|null)}
   */
  root() {
    const path = this.findRoot(Path.join(process.cwd(), 'gloom.json'), 'gloom.json');

    if (path === null) {
      this.logger.abort('No gloom.json found, install gloom theme with "gloom init".');
      return null;
    }
    return Path.dirname(path);
  }

}