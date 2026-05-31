import * as vscode from 'vscode';

/** Configuration section name for the extension. */
const COLOR = 'color';
/** Selected workspace color configuration key. */
const SELECTED = 'selected';
/** Command identifier used to pick a workspace color. */
const COLOR_PICK = 'color.pick';

/** Color map entry: hex color, emoji icon and description text. */
type ColorEntry = {color: object; emoji: string; text: string};
/** Color name to color object map. The color names could be used as a workspace URI suffix. */
const COLOR_MAP = new Map<string, ColorEntry>([
  ['white', {color: fromHex('#eaeae1'), emoji: '🥥', text: 'coconut'}],
  ['silver', {color: fromHex('#bfc1c2'), emoji: '🪙', text: 'coin'}],
  ['gray', {color: fromHex('#808480'), emoji: '🐘', text: 'elephant'}],
  ['black', {color: fromHex('#333033'), emoji: '🪨', text: 'rock'}],

  // Red
  ['pink', {color: fromHex('#eeaabb'), emoji: '🌸', text: 'petals'}],
  ['red', {color: fromHex('#cc1111'), emoji: '🍎', text: 'apple'}],
  ['maroon', {color: fromHex('#771111'), emoji: '🌰', text: 'chestnut'}],

  // Red-green
  ['coral', {color: fromHex('#ee8877'), emoji: '🪸', text: 'reef'}],
  ['orange', {color: fromHex('#dd6611'), emoji: '🦀', text: 'crab'}],
  ['brown', {color: fromHex('#664422'), emoji: '🐻', text: 'bear'}],

  // Red-green
  ['beige', {color: fromHex('#eeddaa'), emoji: '🍮', text: 'cream'}],
  ['yellow', {color: fromHex('#ccbb11'), emoji: '🐥', text: 'chick'}],
  ['olive', {color: fromHex('#556622'), emoji: '🫒', text: 'fruit'}],

  // Green
  ['mint', {color: fromHex('#99eebb'), emoji: '🍵', text: 'tea'}],
  ['lime', {color: fromHex('#11dd11'), emoji: '🍋‍🟩', text: 'zest'}],
  ['green', {color: fromHex('#116611'), emoji: '🫑', text: 'pepper'}],

  // Green-blue
  ['aqua', {color: fromHex('#aaddee'), emoji: '🌊', text: 'foam'}],
  ['cyan', {color: fromHex('#11bbbb'), emoji: '💠', text: 'diamond'}],

  // Blue
  ['blue', {color: fromHex('#115599'), emoji: '🫐', text: 'berry'}],
  ['navy', {color: fromHex('#112266'), emoji: '🌑', text: 'moon'}],

  // Blue-red
  ['violet', {color: fromHex('#ee99ee'), emoji: '🔮', text: 'crystal'}],
  ['magenta', {color: fromHex('#cc3399'), emoji: '🦩', text: 'flamingo'}],
  ['fuchsia', {color: fromHex('#A81155'), emoji: '🌺', text: 'bloom'}],
  ['purple', {color: fromHex('#4C116B'), emoji: '🍆', text: 'eggplant'}],
]);

/** Branch suffix/prefix to color name map. */
const BRANCH_MAP = new Map<string, string>([
  ['main', 'blue'],
  ['master', 'blue'],
  ['dev', 'yellow'],
  ['devel', 'yellow'],
  ['feat', 'green'],
  ['feature', 'green'],
  ['fix', 'orange'],
  ['hotfix', 'red'],
  ['release', 'fuchsia'],
  ['refactor', 'olive'],
  ['test', 'lime'],
  ['spec', 'lime'],
  ['experiment', 'violet'],
  ['experimental', 'violet'],
  ['chore', 'silver'],

  ['infra', 'olive'],
  ['core', 'purple'],
  ['shared', 'beige'],
  ['frontend', 'pink'],
  ['backend', 'blue'],
  ['api', 'cyan'],
]);

/** If set, selected color update has been triggered. */
let selectedColorUpdateTimeout: number | undefined;

/** Triggers selected color update after a short timeout. */
function triggerSelectedColorUpdate(color: string) {
  clearTimeout(selectedColorUpdateTimeout);

  // Queue up the update to run after 100ms.
  selectedColorUpdateTimeout = setTimeout(() => {
    vscode.workspace
      .getConfiguration(COLOR)
      .update(SELECTED, color, vscode.ConfigurationTarget.Workspace);
    selectedColorUpdateTimeout = undefined;
  }, 200);
}

/** Activates the extension. */
export function activate(context: vscode.ExtensionContext) {
  console.log('Color!: Activating...');
  updateWorkspaceColor();

  context.subscriptions.push(
    vscode.commands.registerCommand(COLOR_PICK, async () => {
      const orig =
        vscode.workspace.getConfiguration(COLOR).get<string>(SELECTED) ??
        'auto';
      // Pick a color with a selection preview.
      const color = await pickColor();
      if (!color) {
        // Revert the preview selection.
        vscode.workspace
          .getConfiguration(COLOR)
          .update(SELECTED, orig, vscode.ConfigurationTarget.Workspace);
      }
    }),
  );
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(event => {
      if (!event.affectsConfiguration(COLOR)) {
        return;
      }
      console.log('Color!: Configuration has changed.');
      updateWorkspaceColor();
    }),
  );
}

/** Deactivates the extension. */
export function deactivate() {}

/** Inputs a custom color and generates the corresponding color customization. */
async function inputCustomColor(): Promise<string> {
  const re = RegExp('#[0-9a-fA-F]{6}');
  const options: vscode.InputBoxOptions = {
    title: 'Enter a hexadecimal color (#RRGGBB)',
    value: '#6789ab',
    validateInput: (hex: string) => {
      if (!re.test(hex)) {
        return 'Expecting a hexadecimal color in the form #RRGGBB, e.g. #6789ab.';
      }
      const color = fromHex(hex);
      updateColorCustomizations(color);
      return '';
    },
  };

  return (await vscode.window.showInputBox(options)) ?? '';
}

/** Picks a color. */
async function pickColor(): Promise<string> {
  interface IdQuickPickItem extends vscode.QuickPickItem {
    id: string;
  }
  const options: vscode.QuickPickOptions = {
    placeHolder: 'Pick a color for the current workspace',
    onDidSelectItem: (item: IdQuickPickItem) => {
      triggerSelectedColorUpdate(item.id);
    },
  };

  const curKey =
    vscode.workspace.getConfiguration(COLOR).get<string>(SELECTED) ?? 'auto';

  const quickPickItems: IdQuickPickItem[] = [
    {
      id: '',
      label: '',
      kind: vscode.QuickPickItemKind.Separator,
    },
    {
      id: 'auto',
      label: '🪄  auto',
      description: 'assign deterministic color based on the workspace URI',
    },
    {
      id: 'custom',
      label: '🎨  custom',
      description: 'pick a user-defined color',
    },
    ...Array.from(COLOR_MAP.entries()).map(([name, data]) => ({
      id: name,
      label: data.emoji + '  ' + name,
      description: data.text,
    })),
  ];
  const sortedItems = quickPickItems.sort((a, b) => {
    if (a.id === curKey) return -1;
    if (b.id === curKey) return 1;
    return 0;
  });
  quickPickItems[0].description += ' (current)';

  let color = '';
  let custom = '';
  do {
    const selectedItem: IdQuickPickItem | undefined =
      await vscode.window.showQuickPick(sortedItems, options);

    color = selectedItem?.id ?? '';

    if (color === 'custom') {
      custom = await inputCustomColor();
    }
  } while (color === 'custom' && custom === '');
  return color;
}

/** Calculates a positive integer digest of a string. */
function digest(s: string): number {
  return s
    ? Math.abs(
        s
          .split('')
          .map(s => s.charCodeAt(0))
          .reduce((a, c) => (a + ((a << 7) + (a << 3))) ^ c),
      )
    : 0;
}

/** Updates current workspace color. */
function updateWorkspaceColor() {
  const key =
    vscode.workspace.getConfiguration(COLOR).get<string>(SELECTED) ?? 'auto';
  switch (key) {
    case 'auto': {
      const uri = vscode.workspace.workspaceFolders?.[0]?.uri.toString() ?? '';
      const folder = uri.split('/').filter(Boolean).pop() || '';
      const items = folder.toLowerCase().split(/[._-]/);

      // Try to match folder items over the color map.
      const matchedName = items.findLast(token => COLOR_MAP.has(token));
      if (matchedName) {
        // The direct color match has a priority over the branch match.
        console.log(
          `Color!: Using ${matchedName} color based on the matched folder: ${folder}`,
        );
        updateColorCustomizations(COLOR_MAP.get(matchedName)!.color);
      } else {
        const matchedBranch = items.findLast(token => BRANCH_MAP.has(token));
        if (matchedBranch) {
          const name = BRANCH_MAP.get(matchedBranch)!;
          console.log(
            `Color!: Using ${name} color based on the matched branch: ${matchedBranch}`,
          );
          updateColorCustomizations(COLOR_MAP.get(name)!.color);
        } else {
          // Fall back to a deterministic hash-based selection.
          const idx = digest(uri) % COLOR_MAP.size;
          const name = Array.from(COLOR_MAP.keys())[idx];
          console.log(`Color!: Using deterministic ${name} color for ${uri}.`);
          updateColorCustomizations(COLOR_MAP.get(name)!.color);
        }
      }
      break;
    }

    case 'custom':
      console.log('Color!: Using a user-defined color, no need to update.');
      break;

    default: {
      console.log(`Color!: Using configured ${key} color.`);
      updateColorCustomizations(COLOR_MAP.get(key)!.color);
      break;
    }
  }
}

/** Updates workspace colors with the specified color. */
function updateColorCustomizations(color: object) {
  const config = vscode.workspace
    .getConfiguration('workbench')
    .get('colorCustomizations');
  const orig = config
    ? (JSON.parse(JSON.stringify(config)) as typeof config)
    : {};
  vscode.workspace
    .getConfiguration('workbench')
    .update(
      'colorCustomizations',
      {...orig, ...color},
      vscode.ConfigurationTarget.Workspace,
    );
}

/** Scales each color channel of the specified `hexcolor`. */
function scale(hexcolor: string, factor: number): string {
  const r = Math.min((parseInt(hexcolor.slice(1, 3), 16) * factor) | 0, 0xff);
  const g = Math.min((parseInt(hexcolor.slice(3, 5), 16) * factor) | 0, 0xff);
  const b = Math.min((parseInt(hexcolor.slice(5, 7), 16) * factor) | 0, 0xff);
  return '#' + ((r << 16) + (g << 8) + b).toString(16).padStart(6, '0');
}

/** Returns `true` if the specified `hexcolor` is dark (per http://24ways.org/2010/calculating-color-contrast). */
function isDark(hexcolor: string): boolean {
  const r = parseInt(hexcolor.slice(1, 3), 16);
  const g = parseInt(hexcolor.slice(3, 5), 16);
  const b = parseInt(hexcolor.slice(5, 7), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq < 128;
}

/** Returns a scaled foreground color for the given `hexcolor`. */
function foreground(hexcolor: string, factor: number): string {
  return isDark(hexcolor)
    ? scale('#eeeeee', factor)
    : scale('#222222', 1 / factor);
}

/** Returns `true` if the specified `hexcolor` is mostly green. */
function isGreenish(hexcolor: string): boolean {
  const r = parseInt(hexcolor.slice(1, 3), 16);
  const g = parseInt(hexcolor.slice(3, 5), 16);
  const b = parseInt(hexcolor.slice(5, 7), 16);
  return g >= r && g >= b;
}

/** Returns the active tab background based on `hexcolor`. */
function activeBackground(hexcolor: string): string {
  return isGreenish(hexcolor) ? '#770000' : '#007700';
}

/** Returns the `colorCustomizations` object based on `hexcolor`. */
function fromHex(color: string): object {
  const active = activeBackground(color);
  const badge = '#990000';
  const h = scale(color, 0xee / 0xcc);
  return {
    'activityBar.background': color,
    'activityBar.activeBackground': active,
    'activityBar.activeBorder': scale(active, 0xbb / 0x99),
    'activityBar.foreground': foreground(active, 1),
    'activityBar.inactiveForeground': foreground(color, 0xcc / 0xff),
    'activityBar.border': h,
    'activityBarBadge.background': badge,
    'activityBarBadge.foreground': foreground(badge, 1),
    'titleBar.activeBackground': h,
    'titleBar.inactiveBackground': color,
    'titleBar.activeForeground': foreground(h, 1),
    'titleBar.inactiveForeground': foreground(h, 0xcc / 0xee),
    'titleBar.border': scale(color, 0x55 / 0x77),
    'statusBar.border': scale(color, 0x55 / 0x77),
  };
}
