'use strict';

const fs = require('fs');
const path = require('path');

exports.name = 'install-helper';
exports.version = '0.0.1';

// Colors for console.log()
const $ = {
  reset (color) {
    return (color) ? '\x1b[0m' + color : '\x1b[0m';
  },
  get white() { return this.reset('\x1b[1m') },
  get green() { return this.reset('\x1b[32m') },
  get yellow() { return this.reset('\x1b[33m') },
  cls () { return '\x1Bc' }
}

 // require() securely
function require_s(modulePath, log = true) {
    try {
     return require(modulePath);
    }
    catch (e) {
      if (e.code !== 'MODULE_NOT_FOUND') throw e;
      if(!log) return false;
      console.log(`require_s(): ${e.message} (${e.code})`);
    }
}

exports.check = (callback) => {
  F.path.exists(F.path.configs(), (exists, size, isFile) => {
    callback(exists);
    if (!exists) {
	     console.log(
        `${$.cls()}` +
        `${$.white}==========================================\n` +
        `==========${$.green} Installation Wizard ${$.white}===========\n` +
        `==========================================\n` +
        `> To configure your ${$.green}Total.js${$.white}, please go to \n` +
        `${$.yellow}http://${F.ip}:${F.port}/install   ${$.reset()}\n`
        );

      F.route('/install/', install);
      F.route('/install/db/check', check_db, ['get', '*Install']);
      F.route('/install/db/create', create_db, ['get', '*Install']);
      F.route('/install/db/import', import_db, ['get', '*Install']);
      F.route('/install/save', save_config, ['post', '*Install']);

      function install() {
        this.layout('install');
        this.view();
      }
      //db connection check
      function check_db() {
        this.$workflow('check_db', this.query, this.callback());
      }
      //create db
      function create_db() {
        this.$workflow('create_db', this.query, this.callback());
      }
      //import db
      function import_db() {
        this.$workflow('import_db', this.query, this.callback());
      }
      //save config
      function save_config() {
        this.body.$save(this, this.callback());
      }
    }
  });
};


NEWSCHEMA('Install').make(schema => {
  
  const mysql = require_s('mysql');

  schema.define('db', Object);
  schema.define('mail', Object);
  schema.setResource('errors');
  //db connection check
  schema.addWorkflow('check_db', (error, model, query, callback) => {
    var con = mysql.createConnection({
      host: query.host,
      port: query.port,
      user: query.user,
      password: query.pass,
    });

    con.connect(function (err) {
      if (err) {
        error.push(err);
        return callback();
      }
      callback(SUCCESS(true));
    });
  })

  schema.addWorkflow('create_db', (error, model, query, callback) => {
    //need create new db        
    if (query.create && query.create.parseBoolean()) {
      var con = mysql.createConnection({
        host: query.host,
        port: query.port,
        user: query.user,
        password: query.pass,
      });

      con.connect(err => {
        if (err) {
          error.push(err);
          return callback();
        }
      });

      con.query('CREATE DATABASE ' + query.name + '  CHARACTER SET utf8 COLLATE utf8_general_ci;', (err, rows, fields) => {
        if (err) {
          error.push(err);
          return callback();
        }
        callback(SUCCESS(true));
      });

      con.end();
    } //user say db create, chech him
    else {
      var con = mysql.createConnection({
        host: query.host,
        port: query.port,
        user: query.user,
        password: query.pass,
        database: query.name
      });

      con.connect(err => {
        if (err) {
          error.push(err);
          return callback();
        }
        callback(SUCCESS(true));
      });
    }
  })
  //import db (only MYSQL)
  schema.addWorkflow('import_db', (error, model, query, callback) => {
    async = [];
    var con = mysql.createConnection({
      host: query.host,
      port: query.port,
      user: query.user,
      password: query.pass,
      database: query.name
    });
    con.connect(err => {
      if (err) {
        error.push(err);
        return callback();
      }
    });
    var exec = require('child_process').exec;
    /*
    exec('chcp 65001 | mysql -u {0} {1} {2} < {3}'.format(query.user, (query.pass.length == 0) ? "" : "-p" + query.pass, query.name, F.path.definitions('db.sql')),
      (err, stdout, stderr) => {
        if (err) {
          error.push(err);
          return callback();
        }
      });
      */
        return callback(SUCCESS(true, 'Database was successfully imported!'));
  });
  //create config
  schema.setSave((error, model, self, callback)=> {
    db = model.db;
    mail = model.mail;
    var config = "\
name                            : Example\n\
author                          : author\n\
version                         : 1.01\n\
// Please do not change the data\n\
database                        : mysql://{0}{1}@{2}:{3}/{4}\n\
\n\
// Mail settings\n\
Add a comment to this line\n\
mail.smtp                       : {5}\n\
mail.smtp.options               : {6}\n\
mail.address.from               : {7}\n\
mail.address.reply              : {8}\n\
mail.address.bcc                : {9}".format(db.user,
      (db.pass) ? ":" + db.pass : "",
      (db.host) ? db.host : "",
      (db.port) ? db.port : "",
      (db.name) ? db.name : "",
      (mail.smtp.server) ? mail.smtp.server : "",
      JSON.stringify(mail.smtp.options),
      (mail.address.from) ? mail.address.from : "",
      (mail.address.reply) ? mail.address.reply : "",
      (mail.address.bcc) ? mail.address.bcc : ""
      );
    fs.writeFile('config', config, 'utf8', function (err, res) {
      if (err) {
        return callback();
        // error.push(err);
      }
      callback(SUCCESS(true, 'Everything is configured successfully!'));
      F.restart();
    });
  })
});