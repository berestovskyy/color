# Color! Extension

Add colors to your VS Code windows, workspaces, and `git worktree`s!
A smaller, better open-source alternative to the `Window Colors` and `Peacock` extensions.

![Some of the Color! accents](images/color.png)

1. **Deterministic Color Assignment:** Automatically assigns a unique color to each workspace based on its URI.
2. **Intelligent Path Recognition:** Recognizes path suffixes to assign specific colors. For instance, `git worktree` directories like `main` and `test` will get distinct colors.

## Quick Start

1. After installation, a deterministic color accent will automatically apply to each open workspace.
2. To override the color accent, run the `Color!: Pick a workspace color` command from the Command Palette (`Cmd + Shift + P` or `Ctrl + Shift + P`).

## Frequently Asked Questions

### The extension is not working and the color isn't changing

This usually happens when a workspace URI is unavailable. Please open a folder or a workspace and try again.

### My `.vscode/settings.json` file is getting modified all the time

VS Code stores per-window color settings either in the workspace configuration file (e.g., `my_workspace.code-workspace`) or directly inside the folder (e.g., `my_folder/.vscode/settings.json`).

If your `my_folder/.vscode/settings.json` file is tracked by a version control system like Git, it is best practice to save your workspace outside of `my_folder` using `File > Save Workspace As...`, like this:

```text
my_workspace.code-workspace
my_folder/
    .git
    .vscode/
        settings.json
    src/
    [...]
```

Note: The `my_workspace.code-workspace` file should not be tracked by Git and should live outside of the project folder (or be explicitly added to your `.gitignore` file).

Now, when you open `my_workspace.code-workspace`, all window color preferences will be safely stored there, and any local `.vscode/settings.json` color modifications will be avoided.

### My `.code-workspace` file is getting modified all the time

Save your workspace locally under a different name outside of your tracked folders, or add it directly to your `.gitignore`.

See the question above for more structural details.

## Features

1. It just works: By default, it deterministically selects an accent color based on the workspace URI. The extension takes into account the workspace suffix (e.g., `my-workspace-red`) or uses the full URI to calculate the color.
2. It's customizable: Easily override the automatic color by using the `Color!: Pick a workspace color` command.
3. Endless customization: Pick your favorite custom hex or named color by selecting `Color!: Pick a workspace color > Custom`.

## Extension Settings

This extension contributes the following settings:

- `color.selected`: Selected workspace color (default: `auto`). Possible values are `auto` (deterministic based on the workspace URI), `custom` (user-entered hex color), and a set of named predefined colors.
