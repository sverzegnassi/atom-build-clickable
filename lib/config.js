'use babel';

export default {
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
};
