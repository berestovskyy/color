# Color! Extension

Add color accents to your VS Code windows, workspaces, and `git worktree`s!
A smaller, better open-source alternative to the `Window Colors` and `Peacock` extensions:

1. **Tiny:** less than 300 lines of code.
2. **Subtle:** changes just the activity and title bar, keeping the rest of the UI intact.
3. **Deterministic:** Automatically assigns a unique color to each workspace based on its URI.
4. **Intelligent:** Assigns specific colors if explicitly requested in the folder name (e.g., `my-project-red` or `my-other-project.blue`). Also recognizes branch or context keywords in workspace URIs, ensuring paths like `my-project-main` and `my-project-test` automatically receive distinct colors.
5. **Customizable:** Not a fan of the automatic selection? Easily override it using the `Color!: Pick a workspace color` command. Simply choose the `custom` option from the dropdown to input your own user-defined exact hex color.

<img src="images/color.png" width="49%" alt="Some of the workspace Color! accents">
<img src="images/pick.png" width="49%" alt="Pick your color!">

## Quick Start

1. After installation, a deterministic color accent will automatically apply to each open workspace.
2. To override the color accent, run the `Color!: Pick a workspace color` command from the Command Palette (`Cmd + Shift + P` or `Ctrl + Shift + P`).

## Frequently Asked Questions

### 1. The extension is not working and the color isn't changing

This usually happens when a workspace URI is unavailable. Please open a folder or a workspace and try again.

### 2. My `.vscode/settings.json` file is getting modified all the time

VS Code stores per-window color settings either in the workspace configuration file (e.g., `my_project.code-workspace`) or directly inside the folder (e.g., `my_project/.vscode/settings.json`).

If your `my_project/.vscode/settings.json` file is tracked by a version control system like Git, it is best practice to save your workspace outside of `my_project` folder using `File > Save Workspace As...`, like this:

```text
my_project.code-workspace
my_project/
    .vscode/
        settings.json
    [...]
```

Note: The `my_project.code-workspace` file should not be tracked by Git and should live outside of the project folder (or be explicitly added to your `.gitignore` file).

Now, when you open `my_project.code-workspace`, all window color preferences will be safely stored there, and any local `.vscode/settings.json` color modifications will be avoided.

### 3. My `.code-workspace` file is getting modified all the time

Save your workspace locally under a different name outside of your tracked folders, or add it directly to your `.gitignore`.

See the question above for more details.

## Extension Settings

This extension contributes the following settings:

- `color.selected`: Selected workspace color (default: `auto`). Possible values are `auto` (deterministic based on the workspace URI), `custom` (user-entered hex color), and a set of named predefined colors.
