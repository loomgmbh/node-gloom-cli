# 1. - Table of Contents
- [1. - Table of Contents](#1---table-of-contents)
- [2. - Installation Command](#2---installation-command)
- [3. - Installation Theme](#3---installation-theme)
- [4. - Update Command](#4---update-command)
- [5. - Custom Tasks](#5---custom-tasks)
  - [5.1. - Config in gloom.json](#51---config-in-gloomjson)
  - [5.2. - List all custom tasks](#52---list-all-custom-tasks)
  - [5.3. - Create a custom tasks](#53---create-a-custom-tasks)
  - [5.4. - Delete a custom tasks](#54---delete-a-custom-tasks)

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