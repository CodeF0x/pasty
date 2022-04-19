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

- visit [pastebin.com](https://pastebin.com/) and login
- visit [https://pastebin.com/doc_api#1](https://pastebin.com/api_doc)
- save your api key in a file called `pasty.api` in your home directory (`~/.pasty.api`)
  - the contents of your `.pasty.api` should just be the key, nothing else

then run

```
$ pasty login <username>
```

then, create a paste:

```
$ pasty create -s 'hello world!'
```

alternativly, you can upload a file:

```
$ pasty create -f hello_world.txt
```

## other commands

list all your pastes:

```
$ pasty list
```

delete a paste:

```
$ pasty delete <unique id>
```

get a paste's content:

```
$ pasty get <unique id>
```

get info about signed in user:

```
$ pasty user
```

logout:

```
$ pasty logout
```

# more options

you can customize your newly created paste:

- syntax highlighting (default: text)
  - [supported hightlighting formats](https://pastebin.com/faq#10)
- expiry date (default: never)
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

> folders are not supported! This is due to the pasting API not processing the folder option when making the request. It can't be fixed within this repository

# installation

`npm install -g pasty`
