'use babel';

import fs from 'fs';
import path from 'path';
import EventEmitter from 'events';
import { CompositeDisposable } from 'atom';
import { spawn } from 'child_process';

export const config = {
  terminalExec: {
    title: 'Terminal exec',
    description: 'Set your favorite terminal application',
    type: 'string',
    default: 'x-terminal-emulator',
    order: 0
  },

  manageDependencies: {
    title: 'Manage Dependencies',
    description: 'When enabled, third-party dependencies will be installed automatically',
    type: 'boolean',
    default: true,
    order: 1
  },

  alwaysEligible: {
    title: 'Always Eligible',
    description: 'The build provider will be available in your project, even when not eligible',
    type: 'boolean',
    default: false,
    order: 2
  }
}

export function activate() {
  if (atom.config.get('atom-build-clickable.manageDependencies') === true) {
    require('atom-package-deps').install('atom-build-clickable')
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
      spawn(atom.config.get('atom-build-clickable.terminalExec'), ['-e', 'clickable', cmd], { cwd: this.cwd });
    }

    destructor() {
      this.subscriptions.dispose();
    }

    getNiceName() {
      return 'Clickable';
    }

    isEligible() {
      if (atom.config.get('atom-build-clickable.alwaysEligible') === true) {
        return true;
      }

      return fs.existsSync(this.clickableFile);
    }

    settings() {
      return [{
        name: 'Clickable: Build and run [phone]',
        exec: 'clickable',
        args: [ ],
        sh: false
      }, {
        name: 'Clickable: Build and run [desktop]',
        exec: 'clickable',
        args: [ '--desktop' ],
        sh: false
      }];
    }
  }
}
