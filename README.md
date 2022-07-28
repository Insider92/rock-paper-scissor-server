<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

Rock paper scissor server using [Nest](https://github.com/nestjs/nest) framework repository.

## Running the app

```bash
$ npm install

# start db and app
$ docker-compose up

# start app without docker
# start db
$ docker-compose up mysql
$ npm start
```
The server will be started with both methods and will listen on ```http://localhost:3001```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
# start db
$ docker-compose up mysql
$ npm run test:e2e
```

## Assumptions 

* A user can only have mulitple game with an other spefic user at the same time
* Choices, Match Route  ```/match``` and the Auth Service are not protected by JWT authorization
* Playing against the computer will not influence your points
* There is no route to create a choice (default choices will be initialized at the start of the server & could implemented in the future with POST request)
* There is no route to update a choice (could implemented in the future with PUT request)
* There is no route to delete a choice (could implemented in the future with DELETE request)

## Swagger and OpenAPI

You can see swagger at ```/aerq/api```<br>
You can see the json for OpenAPI at ```/aerq/api-json```

## How to play the game

### Authorization

Frist of all you need to register a user and generate a JWT token to play

```bash
# register a user
$ curl 
--request POST 'http://localhost:3001/aerq/v1/auth/register' \
--header 'Content-Type: application/json' \
--data-raw '{"username": "User1",
"password": "Password1",
"email": "user1@mail.com"
}'

{
    "success": true,
    "message": "user registered"
}

# generate a jwt token
$ curl
--request POST 'http://localhost:3001/aerq/v1/auth/login' \
--header 'Content-Type: application/json' \
--data-raw '{
    "username":"User1",
    "password": "Password1"
}'

{
    "username": "User1",
    "jwtExpiresIn": "3600s",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IlNFQkkxIiwiaWF0IjoxNjU5MDA2Mzk2LCJleHAiOjE2NTkwMDk5OTZ9.zdmJaSsLcdmSH5xIRAdzlzLiLHUVpMpA4INVcII2AEI"
}

```

The token is valid for 3600s (1h) - we will use this token aus authorization in the next examples

### Play against computer

```bash
# play against computer with choice rock
$ curl
--request POST 'http://localhost:3001/aerq/v1/match/computer' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IlNFQkkxIiwiaWF0IjoxNjU5MDA2Mzk2LCJleHAiOjE2NTkwMDk5OTZ9.zdmJaSsLcdmSH5xIRAdzlzLiLHUVpMpA4INVcII2AEI' \
--header 'Content-Type: application/json' \
--data-raw '{
    "choice": "c907bbd9-f4f0-4344-a72a-ba58031e057d"
}'

# you win vs computer choice sisscor
{
    "id": "78ec2b21-f094-443b-8619-0e95cf7afd5e",
    "result": "challengerWin",
    "challengedChoice": {
        "id": "7d8a0086-a754-4b82-9c8d-0ffc90c74544",
        "createdAt": "2022-07-27T22:25:51.617Z",
        "updatedAt": "2022-07-27T22:25:51.617Z",
        "deletedAt": null,
        "name": "Sisscor"
    },
    "challengerChoice": {
        "id": "c907bbd9-f4f0-4344-a72a-ba58031e057d",
        "createdAt": "2022-07-27T22:25:51.576Z",
        "updatedAt": "2022-07-27T22:25:51.576Z",
        "deletedAt": null,
        "name": "Rock"
    }
}
```

### Play against human

Please note: We register a second user with the name ```User2``` and the user id ```864d10bf-608f-45d5-b399-9d422e9386ef``` for this example

```bash
# user 1 challenges user 2 with the choice rock
$ curl
--request POST 'http://localhost:3001/aerq/v1/match/human' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IlNFQkkxIiwiaWF0IjoxNjU5MDA2Mzk2LCJleHAiOjE2NTkwMDk5OTZ9.zdmJaSsLcdmSH5xIRAdzlzLiLHUVpMpA4INVcII2AEI' \
--header 'Content-Type: application/json' \
--data-raw '{   
    "challengedUser": "864d10bf-608f-45d5-b399-9d422e9386ef",
    "choice": "c907bbd9-f4f0-4344-a72a-ba58031e057d"
}'

# a match with the id 3c55e2f0-f737-4ccf-bfaf-6920668be98f is created
{
    "opponentType": "human",
    "challengerUser": "bf1724b9-b582-454b-b62f-dff8f95522f2",
    "challengedUser": {
        "id": "864d10bf-608f-45d5-b399-9d422e9386ef",
        "username": "User2"
    },
    "challengerChoice": {
        "id": "c907bbd9-f4f0-4344-a72a-ba58031e057d",
        "createdAt": "2022-07-27T22:25:51.576Z",
        "updatedAt": "2022-07-27T22:25:51.576Z",
        "deletedAt": null,
        "name": "Rock"
    },
    "deletedAt": null,
    "id": "3c55e2f0-f737-4ccf-bfaf-6920668be98f",
    "createdAt": "2022-07-28T09:16:08.038Z",
    "updatedAt": "2022-07-28T09:16:08.038Z",
    "status": "ongoing",
    "result": "tbd"
}

# user 2 can now see the challenge with choice paper 
$ curl 
--request GET 'http://localhost:3001/aerq/v1/match/challenges' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IlVzZXIyIiwiaWF0IjoxNjU5MDA2ODE1LCJleHAiOjE2NTkwMTA0MTV9.kRthD7gHfIt2ka2-6XntztDrSknxS5MNy4lKOPX4vqs'

# user 2 wins against user 1
{
    "id": "3c55e2f0-f737-4ccf-bfaf-6920668be98f",
    "result": "challengedWin",
    "challengedChoice": {
        "id": "508c501e-8632-4aff-8d26-f20a85868e0b",
        "createdAt": "2022-07-27T22:25:51.608Z",
        "updatedAt": "2022-07-27T22:25:51.608Z",
        "deletedAt": null,
        "name": "Paper"
    },
    "challengerChoice": {
        "id": "c907bbd9-f4f0-4344-a72a-ba58031e057d",
        "createdAt": "2022-07-27T22:25:51.576Z",
        "updatedAt": "2022-07-27T22:25:51.576Z",
        "deletedAt": null,
        "name": "Rock"
    }
}

# user 2 can answer the challenge
$ curl
--request PUT 'http://localhost:3001/aerq/v1/match/3c55e2f0-f737-4ccf-bfaf-6920668be98f' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IlVzZXIyIiwiaWF0IjoxNjU5MDA2ODE1LCJleHAiOjE2NTkwMTA0MTV9.kRthD7gHfIt2ka2-6XntztDrSknxS5MNy4lKOPX4vqs' \
--header 'Content-Type: application/json' \
--data-raw '{
    "choice": "508c501e-8632-4aff-8d26-f20a85868e0b"
}'

# user 2 wins against user1
{
    "id": "3c55e2f0-f737-4ccf-bfaf-6920668be98f",
    "result": "challengedWin",
    "challengedChoice": {
        "id": "508c501e-8632-4aff-8d26-f20a85868e0b",
        "createdAt": "2022-07-27T22:25:51.608Z",
        "updatedAt": "2022-07-27T22:25:51.608Z",
        "deletedAt": null,
        "name": "Paper"
    },
    "challengerChoice": {
        "id": "c907bbd9-f4f0-4344-a72a-ba58031e057d",
        "createdAt": "2022-07-27T22:25:51.576Z",
        "updatedAt": "2022-07-27T22:25:51.576Z",
        "deletedAt": null,
        "name": "Rock"
    }
}

# user 2 can see the finished match in the history
curl 
--request GET 'http://localhost:3001/aerq/v1/match/history' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IlVzZXIyIiwiaWF0IjoxNjU5MDA2ODE1LCJleHAiOjE2NTkwMTA0MTV9.kRthD7gHfIt2ka2-6XntztDrSknxS5MNy4lKOPX4vqs'

[
    {
        "id": "3c55e2f0-f737-4ccf-bfaf-6920668be98f",
        "updatedAt": "2022-07-28T09:19:40.000Z",
        "status": "finished",
        "opponentType": "human",
        "result": "challengedWin",
        "challengerUser": {
            "id": "bf1724b9-b582-454b-b62f-dff8f95522f2",
            "username": "User1"
        },
        "challengedUser": {
            "id": "864d10bf-608f-45d5-b399-9d422e9386ef",
            "username": "User2"
        },
        "challengerChoice": {
            "id": "c907bbd9-f4f0-4344-a72a-ba58031e057d",
            "name": "Rock"
        },
        "challengedChoice": {
            "id": "508c501e-8632-4aff-8d26-f20a85868e0b",
            "name": "Paper"
        }
    }
]
```

### Points

You will get 10 points for a win against a human and lose 5 points if you lose against a human
```bash
# see the points in the user profile (User2)
$ curl
--request GET 'http://localhost:3001/aerq/v1/user/whoami' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IlVzZXIyIiwiaWF0IjoxNjU5MDA2ODE1LCJleHAiOjE2NTkwMTA0MTV9.kRthD7gHfIt2ka2-6XntztDrSknxS5MNy4lKOPX4vqs'

{
    "id": "864d10bf-608f-45d5-b399-9d422e9386ef",
    "createdAt": "2022-07-28T09:13:25.055Z",
    "username": "User2",
    "email": "user2@mail.com",
    "points": 10
}
```


## CLI 
Didn't find a satisfying solution for authorization with cli options (other then with curl commands on started service) => CLI is not protected by JWT auth

### How to use the cli

```bash
# install dependencies if not already done
$ npm i 

# run cli command
$ npx nestjs-command  
```
This will return all possible commands

```bash
$ npx nestjs-command
commands:
  cli all:user          delievers all users
  cli withoutown:user   delievers all users without your own
  cli whoami:user       your own user
  cli register:auth     registers an user
  cli login:auth        login as an user
  cli all:match         delievers all finished matches
  cli history:match     delivers all finished matches for the user
  cli challenges:match  delivers all matches where the user is challenged
  cli computer:match    challenges a computer to a match
  cli human:match       challenges a human to a match
  cli answer:match      answers a challenge from another user
  cli all:choice        delievers all choices

Options:
  -h, --help     Show help                                             [boolean]
  -v, --version  Show version number                                   [boolean]
```
All routes you can see at ```/aerq/api``` are mapped as commands

### Examples for cli usage

```bash
# Create a new user
$ npx nestjs-command  register:auth -u commandUser1 -p password1 -e command@user.com
{ success: true, message: 'user registered' }

# list all user
$ npx nestjs-command all:user
┌─────────┬────────────────────────────────────────┬────────────────┬────────┐
│ (index) │                   id                   │    username    │ points │
├─────────┼────────────────────────────────────────┼────────────────┼────────┤
│    0    │ '6e0ab49f-bcf0-46a5-9ba9-8cfc6e1cfe45' │      'JL'      │   0    │
│    1    │ 'a34b079b-b3a8-48b7-9d4f-6c88c60c7074' │     'SEBI'     │   10   │
│    2    │ 'aa7d403e-7a7c-416e-a943-bc446c18b293' │ 'commandUser1' │   0    │
└─────────┴────────────────────────────────────────┴────────────────┴────────┘

# get help for command computer:match
$ npx nestjs-command computer:match -h
cli computer:match

challenges a computer to a match

Optionen:
  -h, --help      Show help                                            [boolean]
  -c, --choiceId  the id of the choice you want to give      [string] [required]
  -u, --userId    your userId                                [string] [required]
  -v, --version   Show version number                                  [boolean]

# challenge the computer as commandUser1 with choice rock
$ npx nestjs-command computer:match -u aa7d403e-7a7c-416e-a943-bc446c18b293 -c c907bbd9-f4f0-4344-a72a-ba58031e057d
┌──────────────────┬────────────────────────────────────────┬──────────────────────────┬──────────────────────────┬───────────┬─────────┬────────────────────────────────────────┐
│     (index)      │                   id                   │        createdAt         │        updatedAt         │ deletedAt │  name   │                 Values                 │
├──────────────────┼────────────────────────────────────────┼──────────────────────────┼──────────────────────────┼───────────┼─────────┼────────────────────────────────────────┤
│        id        │                                        │                          │                          │           │         │ '05c9c009-ea54-4a6a-83ee-afffbb91750f' │
│      result      │                                        │                          │                          │           │         │            'challengedWin'             │
│ challengedChoice │ '508c501e-8632-4aff-8d26-f20a85868e0b' │ 2022-07-27T22:25:51.608Z │ 2022-07-27T22:25:51.608Z │   null    │ 'Paper' │                                        │
│ challengerChoice │ 'c907bbd9-f4f0-4344-a72a-ba58031e057d' │ 2022-07-27T22:25:51.576Z │ 2022-07-27T22:25:51.576Z │   null    │ 'Rock'  │                                        │
└──────────────────┴────────────────────────────────────────┴──────────────────────────┴──────────────────────────┴───────────┴─────────┴────────────────────────────────────────┘
# lost vs the computer

# see your match history
npx nestjs-command history:match -u aa7d403e-7a7c-416e-a943-bc446c18b293
┌─────────┬────────────────────────────────────────┬──────────────────────────┬────────────┬──────────────┬─────────────────┬─────────────────────────────────────────────────────────────────────────────────────┬────────────────┬───────────────────────────────────────────────────────────────────────────┬────────────────────────────────────────────────────────────────────────────┐
│ (index) │                   id                   │        updatedAt         │   status   │ opponentType │     result      │                                   challengerUser                                    │ challengedUser │                             challengerChoice                              │                              challengedChoice                              │
├─────────┼────────────────────────────────────────┼──────────────────────────┼────────────┼──────────────┼─────────────────┼─────────────────────────────────────────────────────────────────────────────────────┼────────────────┼───────────────────────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────┤
│    0    │ '05c9c009-ea54-4a6a-83ee-afffbb91750f' │ 2022-07-27T23:53:05.167Z │ 'finished' │  'computer'  │ 'challengedWin' │ UserEntity { id: 'aa7d403e-7a7c-416e-a943-bc446c18b293', username: 'commandUser1' } │      null      │ ChoiceEntity { id: 'c907bbd9-f4f0-4344-a72a-ba58031e057d', name: 'Rock' } │ ChoiceEntity { id: '508c501e-8632-4aff-8d26-f20a85868e0b', name: 'Paper' } │
└─────────┴────────────────────────────────────────┴──────────────────────────┴────────────┴──────────────┴─────────────────┴─────────────────────────────────────────────────────────────────────────────────────┴────────────────┴───────────────────────────────────────────────────────────────────────────┴────────────────────────────────────────────────────────────────────────────┘
```

## License

Nest is [MIT licensed](LICENSE).
