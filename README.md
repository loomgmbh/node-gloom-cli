
---
**ABANDONED - DO NOT USE**

This project has moved to https://gitlab.loom.de/loom/node-modules/gloom-cli 

---

# 1. - Table of Contents
- [1. - Table of Contents](#1---table-of-contents)
- [2. - Installation Command](#2---installation-command)
- [3. - Installation Theme](#3---installation-theme)
  - [3.1. - Overwrite Theme](#31---overwrite-theme)
- [4. - Update Command](#4---update-command)
- [5. - Custom Tasks](#5---custom-tasks)
  - [5.1. - Config in gloom.json](#51---config-in-gloomjson)
  - [5.2. - List all custom tasks](#52---list-all-custom-tasks)
  - [5.3. - Create a custom tasks](#53---create-a-custom-tasks)
  - [5.4. - Delete a custom tasks](#54---delete-a-custom-tasks)
- [6. - Validate config](#6---validate-config)
- [7. - Components](#7---components)
  - [7.1. - Create Component](#71---create-component)
    - [7.1.1. - Create Component with js](#711---create-component-with-js)

# 2. - Installation Command

```sh
npm install -g https://github.com/loomgmbh/node-gloom-cli.git
```

# 3. - Installation Theme

> Use it only in theme directory

```sh
cd web/themes/{theme}
gloom init
```

> This command will only create files, that are not yet existing.

## 3.1. - Overwrite Theme

> Will create all files and overwrite when existing.

```sh
cd web/themes/{theme}
gloom init true
```

# 4. - Update Command

```sh
npm update -g gloom-cli
```

# 5. - Custom Tasks

## 5.1. - Config in gloom.json

> Path to the custom tasks directory.

> ___root___: is the directory including "gloom.json".

```json
{
  "custom": {
    "tasks": "<path-to-custom-tasks-relative-from-root>"
  }
}
```

## 5.2. - List all custom tasks

```sh
gloom custom task list
```

## 5.3. - Create a custom tasks

```sh
gloom custom task create <name:string>
```

## 5.4. - Delete a custom tasks

```sh
gloom custom task delete <name:string>
```

# 6. - Validate config

> Validate the config file.

```sh
gloom check
```

# 7. - Components

## 7.1. - Create Component

> :warning: The path where the component is created is not dynamic.

```sh
gloom comp <category:string> <component:string>
```

### 7.1.1. - Create Component with js

```sh
gloom comp <category:string> <component:string> true [force:boolean]
```

> ___force___: If true overwrite the existing component.
