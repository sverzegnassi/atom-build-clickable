'use babel';

import fs from 'fs';
import path from 'path';
import EventEmitter from 'events';
import { CompositeDisposable } from 'atom';
import { spawn } from 'child_process';

import meta from '../package.json';

export const config = require('./config');

export function activate() {
  if (atom.config.get(meta.name + '.manageDependencies') === true) {
    require('atom-package-deps').install(meta.name)
    .then(function() {
      if (atom.packages.isPackageDisabled("build"))
        atom.packages.enablePackage("build")
    });
  }
}

export function provideBuilder() {
  return class ClickableProvider extends EventEmitter {
    subscriptions: null
    clickableFile: null

    constructor(cwd) {
      super();
      this.cwd = cwd;
      this.subscriptions = new CompositeDisposable();
      this.clickableFile = path.join(this.cwd, 'clickable.json');

      if (this.isEligible()) {
        this.createMenu()
      }
    }

    createMenu() {
      var clickableManifest = fs.realpathSync(this.clickableFile);
      delete require.cache[clickableManifest];
      var manifest = require(clickableManifest);

      var menuTemplate = [{
        label: 'Clickable',
        submenu: [{
          label: 'Open shell [phone]',
          command: 'clickable:openshell'
        }]
      }]

      var commandsTemplate = {
        'clickable:openshell': () => {
          this.spawnTerminal("shell");
        }
      }


      if (manifest.scripts) {
        for (var key in manifest.scripts) {
          menuTemplate[0].submenu.push({
            label: 'Project command: Run \'' + key + '\'',
            command: 'clickable:custom_' + key
          });

          commandsTemplate["clickable:custom_" + key] = () => {
            this.spawnTerminal(key);
          }
        }
      }

      this.subscriptions.add(
        atom.commands.add('atom-workspace', commandsTemplate)
      );

      atom.menu.add(menuTemplate);
    }

    spawnTerminal(cmd) {
      spawn(atom.config.get(meta.name + '.terminalExec'), ['-e', 'clickable', cmd], { cwd: this.cwd });
    }

    destructor() {
      this.subscriptions.dispose();
    }

    getNiceName() {
      return 'Clickable';
    }

    isEligible() {
      if (atom.config.get(meta.name + '.alwaysEligible') === true) {
        return true;
      }

      return fs.existsSync(this.clickableFile);
    }

    settings() {
      const errorHelper = require('./check_errors');

      return [{
        name: 'Clickable: Build and run [phone]',
        exec: 'clickable',
        args: [ ],
        sh: false,
        functionMatch: function (terminal_output) {
          return errorHelper.checkBuildError(terminal_output)
        }
      },
      {
        name: 'Clickable: Build and run [desktop]',
        exec: 'clickable',
        args: [ 'desktop' ],
        sh: false,
        functionMatch: function (terminal_output) {
          return errorHelper.checkBuildError(terminal_output)
        }
      },
      {
        name: 'Clickable: Build --dirty and run [phone]',
        exec: 'clickable',
        args: [ '--dirty' ],
        sh: false,
        functionMatch: function (terminal_output) {
          return errorHelper.checkBuildError(terminal_output)
        }
      },
      {
        name: 'Clickable: Build --NVIDIA and run [desktop]',
        exec: 'clickable',
        args: [ 'desktop','--nvidia' ],
        sh: false,
        functionMatch: function (terminal_output) {
          return errorHelper.checkBuildError(terminal_output)
        }
      },
      {
        name: 'Clickable: Clean-build',
        exec: 'clickable',
        args: [ 'clean-build' ],
        sh: false,
        functionMatch: function (terminal_output) {
          return errorHelper.checkBuildError(terminal_output)
        }
      },
      {
        name: 'Clickable: Review',
        exec: 'clickable',
        args: [ 'review' ],
        sh: false,
        functionMatch: function (terminal_output) {
          return errorHelper.checkBuildError(terminal_output)
        }
      },
      {
        name: 'Clickable: Update [docker container]',
        exec: 'clickable',
        args: [ 'update' ],
        sh: false,
        functionMatch: function (terminal_output) {
          return errorHelper.checkBuildError(terminal_output)
        }
      }];
    }
  }
}
