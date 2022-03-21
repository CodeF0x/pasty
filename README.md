# pasty

pasty is a cli for pastebin.com. With it you can:

- upload files
- upload strings
- list all your pastes
- delete a paste
- get paste content
- get user information (signed in user)

# usage

first, login:

```shell
$ pasty login <username>
```

then, create a paste:

```shell
$ pasty create -s "hello world!"
```

alternativly, you can upload a file:

```shell
$ pasty create -f hello_world.txt
```

## other commands

list all your pastes:

```shell
$ pasty list
```

delete a paste:

```
$ pasty delete <unique id>
```

get a paste's content:

```shell
$ pasty get <unique id>
```

get info about signed in user:

```shell
$ pasty user-info
```

# more options

you can customize your newly created paste:

- syntax highlighting (default: none)
  - [supported hightlighting formats](https://pastebin.com/faq#10)
- expiry date (default: none)
  - never (N)
  - 10 minutes (10M)
  - 1 hour (1H)
  - 1 day (1D)
  - 1 week (1W)
  - 1 month (1M)
  - 6 months (6M)
  - 1 year (1Y)
- paste visibilty (default: public)
  - public
  - unlisted
  - private

# installation

download the latest built executable for your system and add it to your PATH variable.
