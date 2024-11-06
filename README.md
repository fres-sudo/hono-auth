<!-- TOC start (generated with https://github.com/derlin/bitdowntoc) -->

- [How to spin up a Hono Authentication System](#how-to-spin-up-a-hono-authentication-system)
  - [Introduction ](#introduction)
    - [Functionalities](#functionalities)
    - [Technologies](#technologies)
    - [Architecture Overview](#architecture-overview)
      - [Folder Structure](#folder-structure)
      - [File Naming](#file-naming)
    - [Why?](#why)
    - [Who?](#who)
    - [Where?](#where)
  - [Getting Started](#getting-started)
    - [Dependencies](#dependencies)
    - [Setup](#setup)
      - [Docker Setup](#docker-setup)
        - [Dockerfile](#dockerfile)
        - [Docker Compose](#docker-compose)
      - [Drizzle Setup](#drizzle-setup)
        - [Setup Env variables](#setup-env-variables)
          - [Configuration File](#configuration-file)
        - [Drizzle Configuration](#drizzle-configuration)
        - [Drizzle Entry Point](#drizzle-entry-point)
    - [Dipendence Injection Setup](#dipendence-injection-setup)
  - [Email and password authentication](#email-and-password-authentication)
    - [Defining routes](#defining-routes)
      - [Zod DTOs Validation](#zod-dtos-validation)
      - [Users Table](#users-table)
      - [Limiter Middleware](#limiter-middleware)
      - [Login and Signup Service](#login-and-signup-service)
      - [Error Handling](#error-handling)
      - [Hashing Service](#hashing-service)
      - [User Repository](#user-repository)
        - [Database Provider](#database-provider)
        - [User Repository Implementation](#user-repository-implementation)
      - [Starting Docker and Testing](#starting-docker-and-testing)
  - [JWT Access and Refresh Token System](#jwt-access-and-refresh-token-system)
    - [What is it?](#what-is-it)
    - [How it works?](#how-it-works)
    - [Defining Routes](#defining-routes-1)
    - [Refresh Token DTO](#refresh-token-dto)
    - [Refresh Token Service](#refresh-token-service)
    - [Refresh Token Repository](#refresh-token-repository)
      - [Sessions Table](#sessions-table)
    - [Authentication Middleware](#authentication-middleware)
    - [Update Login Flow](#update-login-flow)
    - [Testing the endpoints](#testing-the-endpoints)
  - [Email Verification](#email-verification)
    - [Defining Routes](#defining-routes-2)
    - [Email Verification Service](#email-verification-service)
      - [Token Service](#token-service)
      - [Mailer Service](#mailer-service)
      - [Email Templates](#email-templates)
    - [Email Verifications Repository](#email-verifications-repository)
    - [Email Verifications Table](#email-verifications-table)
    - [Users Table](#users-table-1)
  - [Forgot password, OTP code verification, Reset password](#forgot-password-otp-code-verification-reset-password)
    - [What is it?](#what-is-it-1)
    - [How it works?](#how-it-works-1)
    - [Defining routes](#defining-routes-3)
      - [Password Reset DTO](#password-reset-dto)
    - [Password Reset Service](#password-reset-service)
    - [Password Reset Repository](#password-reset-repository)
  - [Conclusion](#conclusion)
    - [What do to now?](#what-do-to-now)
    - [Resources](#resources)

<!-- TOC end -->

<!-- TOC --><a name="how-to-spin-up-a-hono-authentication-system"></a>

# How to spin up a Hono Authentication System

<!-- TOC --><a name="introduction"></a>

## Introduction

In this article I'm will try my best to explain to you about the creation from the ground up of a complete authentication system for your next successful application.

I'm sorry for any grammatical errors, this is my firs article and I'm not mother tongue.

<!-- TOC --><a name="functionalities"></a>

### Functionalities

Here it is a quick break down of what functionalities your app will have at the end of the article:

- Email and password authentication
- JWT Access and Refresh Token System
- Email Verification
- Forgot password, OTP code verification, Reset password

<!-- TOC --><a name="technologies"></a>

### Technologies

Those are the main technologies and libraries that you will need to spin up this simple application:

- Typescript, basically JS but a bit better,
- Hono, a ligthweigth Javascript framework to build fast web application,
- Drizzle ORM,
- Postgres SQL,
- Zod for DTOs,
- `tsrynge` an easy library for Dependence Injection in Typescript,

Notice that you can basically use what technologies you prefer, those are just based on my personal preference, you don't have to stick with them, but also notice that if you choose to go with something else you will have to make some changes at your code.

<!-- TOC --><a name="architecture-overview"></a>

### Architecture Overview

The architecture is heavy inspired by this [awesome project](https://github.com/Rykuno/TofuStack), I'll just mention more or less what the creator said in his introduction.

There are a few popular architectures for structuring backends. Technical, Onion, DDD, VSA, and the list goes on.

<!-- TOC --><a name="folder-structure"></a>

#### Folder Structure

- **controllers** - Responsible for routing requests

- **services** - Responsible for handling business logic.

- **repositories** - Responsible for retrieving and
  storing data.

- **infrastructure** - Handles the implementation of external services or backend operations.

- **middleware** - Middlware our request router is responsible for handling.

- **providers** - Injectable services

- **dtos** - Data Transfer Objects (DTOs) are used to define the shape of data that is passed.

<!-- TOC --><a name="file-naming"></a>

#### File Naming

Each file of the project is postfixed with its architectural type(e.g. `iam.service.ts`). This allows
us to easily reorganize the folder structure to suite a different architecture pattern if the domain becomes more complex.

For example, if you want to group folders by domain(DDD), you simply drag and drop all related files to that folder.

```
└── events/
    ├── events.controller.ts
    ├── events.service.ts
    └── events.repository.ts
```

<!-- TOC --><a name="why"></a>

### Why?

I am making this article to help people struggling with finding a resource that will help them to spin up a complete authentication system, often the guides and video tutorial online not includes all the functionalities that I will show you in this article.

The claim is to have a place to get a look when you feel lost while writing your authentication system.

This IS NOT the perfect authentication system, this is just _mine_ authentication system.

Authentication is usually a non-trivial area, so use my implementation at your own risk.

<!-- TOC --><a name="who"></a>

### Who?

This guide is for developers that already know the basics of Javascript or Typescript, you don't need to know any JS framework, if you already play with Express.js or something like that you will probably will understand more, but it is not required.

Of course basic understanding of how an HTTP server works and the interaction between client and server is mandatory, also what is a RESTful API and how it works.

In this article I will not go in the details of the architectural implementation of the system, or how to install the software, it will use `bun` as package manager, but you can use whatever you prefer, it will change quite nothing.

Also a basic understand of Docker is better to complete understand the course.

<!-- TOC --><a name="where"></a>

### Where?

No worries, you will find all the code in [this Github repository](https://github.com/fres-sudo/hono-auth). If you will find this article useful I will highly appreciate a Github ⭐ I still highly suggest you to follow

<!-- TOC --><a name="getting-started"></a>

## Getting Started

To get started right we first need to create a new project.

```sh
bun create hono@latest
```

This command will guide you through a wizard for the creation of your bun application, the process for other packer manager is more or the less the same.

The first thing you will get asked is to choose a target directory, this means that if you are already in your project directory you just need to type `.`, otherwise just type the name of the folder of the project, I will use `hono-auth`, you can choose your own.

After that you will prompted to choose from a template, this is the most important part, for this guide I will choose bun, this will create a basic `src/index.ts` file, that is the _entry point_ of our new application. It will also generate other files, such as the configuration of Typescript in `tsconfig.json` and the most important, the `package.json`, in here we can see that bun create a simple script for run our app.

```json
  "scripts": {
    "dev": "bun run --hot src/index.ts"
  }
```

Notice that if you choose other template for other kind of project your output would be slightly different, choose what you need!

If he ask you to install the project dependencies just say yes, and for the package manger just choose what you prefer, as I said, I'll stick with bun.

So if we run our app with `bun dev` and we try to call the `localhost:3000/` endpoint we should get some feedback.

I will use `httppie` that is just a CLI tool that can make you make request to endpoints, but you can use Postman or whatever you prefer.

so your output would be:

```json
Hello Hono!
```

or something like that.

<!-- TOC --><a name="dependencies"></a>

### Dependencies

Before even touch any code, let's add some packages to our project so we don't have to do it later on the fly.

Just type in the terminal:

```sh
bun add tsyringe drizzle-kit drizzle-orm drizzle-zod zod reflect-metadata typescript arctic postgres nodemailer hono-rate-limiter @hono/zod-validator @paralleldrive/cuid2
```

Those are the main dependencies for this project, you just add those and you are ready to go.

<!-- TOC --><a name="setup"></a>

### Setup

Before starting there will be a quite long session of setup before starting. I'll break down the major steps for you, be sure to follows every single step to not get lost.

- Docker Setup
- Drizzle Setup
- Configuration Setup
- Dipendence Injection Setup

Let's get started.

<!-- TOC --><a name="docker-setup"></a>

#### Docker Setup

This step _is not necessary_ but I personally highly reccomend to follow up and use docker, to avoid any problems related to your machine.

I will not explain the reason to choose docker, just do it, and you will not regret it! Aside from jokes, Docker will help us to ensure that we all got the same setup and you work on an isolated environment.

So first thing first you might need to install Docker (and [Docker Compose](https://docs.docker.com/compose/install/)) on you machine, you can find the installation [here](https://www.docker.com/), if you are new to docker I will suggest you to download also the desktop version if is your first time with docker so you can visually see what is going on.

<!-- TOC --><a name="dockerfile"></a>

##### Dockerfile

So the first thing we need in our **isolated environment** is obviously our app and our dependencies, so we can create an entry point for docker to download it and serve to us.

This will be accomplished by creating a `Dockerfile` in our root directory, so in my case it will be `hono-auth/Dockerfile`:

```

FROM oven/bun:1.0.35

WORKDIR /home/bun/app

COPY ./package.json .

RUN bun install

COPY . .

CMD [ "bun", "run", "dev" ]

```

So basically here we are downloading bun, setting up out work directory, copying the package.json with all the necessary information and then install the dependencies in the environment, after that we're also telling docker that it has to execute `bun run dev`.

<!-- TOC --><a name="docker-compose"></a>

##### Docker Compose

Now that we have our entry- point, since we will have two different containers, running at the same time, we have to define a **Docker Compose** file, to handle the two container and the communication between the two.

For doing that we will need to create `docker-compose.yaml` file in out root directory.

```yaml
services:
  app:
    container_name: hono-app
    build:
      dockerfile: Dockerfile
    depends_on:
      - postgres
    env_file:
      - .env
    ports:
      - 3000:3000
    restart: always
    networks:
      - app-network
  postgres:
    container_name: db
    image: postgres:latest
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - app-network

networks:
  app-network:
    driver: bridge

volumes:
  postgres_data:
```

So as you can see we are defining 2 differnet services:

- **app** : this will be the hono app, and it has a docker file, that is the file that we created earlier, it obviously depends on the `db`, since we need first the db to make the app starts, we define the `.env` file with all our secrets, the ports that we are using in the project and the port we want to expose on docker, and of course the network. The network is just a bridge that ensure the communication between 2 or more services (or containers).

- **db** : this is the postgres instance that we will use as databse in our app, the paramteres are quite the same and self explanatory.

Once we setup everything we can now define some scripts to effectively runs these 2 containers.

so in the `package.josn` we can define:

```json
"scripts": {
    "dev": "bun run --hot src/index.ts",
    "docker:up": "docker-compose up -d",
    "docker:build": "docker-compose up -d --build",
  }
```

<!-- TOC --><a name="drizzle-setup"></a>

#### Drizzle Setup

Even if Drizzle is a _fast_ ORM, it will require a small setup, nothing too crazy, don't worry. For more detailed introduction to setup Drizzle ORM I higly suggest you to check out their official [documentation](https://orm.drizzle.team/docs/get-started/postgresql-new) that is very great.

<!-- TOC --><a name="setup-env-variables"></a>

##### Setup Env variables

If you are using external database, like Neon, Supabase, ecc... Feel free to put your url as env variable.

To connect to the PostgreSQL database, you need to provide the database URL. The URL format is:

```
postgres://<user>:<password>@<host>:<port>/<database>
```

So create a `.env` file at root of the application and fill with the values you choose in the docker compose, in our case is:

```
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/postgres
```

<!-- TOC --><a name="configuration-file"></a>

###### Configuration File

For the next setup we also need to define some structure of out environment variables, so we can do that as follows.

Since I'm using `bun`, the engine gives to me some useful API to retrive environment variables, without the need of external packages.

Please notice that if you are using other engine, we will need some adjustment and most likely also using a 3rd part package to interact with env variables.

In `bun` we can retrive an environment variable in some way, for personal preference I will use:

```
process.env.[ENV_VARIABLE_NAME]
```

For a better structured setup, create a `config.type.ts` under `src/types/`.

```ts
// src/types/config.type.ts

export const config: Config = {
	isProduction: process.env.NODE_ENV === "production",
	api: {
		origin: process.env.ORIGIN ?? "",
	},
	postgres: {
		url: process.env.DATABASE_URL ?? "",
	},
};

interface Config {
	isProduction: boolean;
	api: ApiConfig;
	postgres: PostgresConfig;
}

interface ApiConfig {
	origin: string;
}

interface PostgresConfig {
	url: string;
}
```

As you can see I also add a quite useful environment variable that is:

```
ORIGIN=http://localhost:3000 //3000 is the port we define in the docker-compose.yaml file
```

Since now the project is local, we just use `localhost` but when you will deploy it you will put here your correct url.

<!-- TOC --><a name="drizzle-configuration"></a>

##### Drizzle Configuration

For correctly setup drizzle we need to define a configuration file, that will be placed in the root of our application, so in this case it will be `hono-auth/drizzle.config.ts`, this file will contains all the necessary information for drizzle to spin up.

```ts
// drizzle.config.ts
import type { Config } from "drizzle-kit";
import { config } from "./src/types/config.type";

export default {
	out: "./src/infrastructure/database/migrations",
	schema: "./src/infrastructure/database/tables/index.ts",
	breakpoints: false,
	strict: true,
	dialect: "postgresql",
	dbCredentials: {
		url: config.postgres.url,
	},
	migrations: {
		table: "migrations",
		schema: "public",
	},
	verbose: true,
} satisfies Config;
```

As you can see a lot of stuff are going on here, but let's break down the important parts real quick.

- **out** is the output directory where the migrations will be localted, you can choose whatever you want;
- **schema** is the imporant file where drizzle will pull all the schemas of your database and will reflect your postgres instance accordingly
<!-- TOC --><a name="drizzle-entry-point"></a>

##### Drizzle Entry Point

The Drizzle entry point is basically where your app tells drizzle to connect with databse, in our case it will be located under.

In our case I prefer to locate it under `src/infrastructure/database/index.ts`, the file contente of `index.ts` will be:

```ts
// src/infrastructure/database/index.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./tables";
import { config } from "../../types/config.type";

export const client = postgres(config.postgres.url, { max: 10 });
export const db = drizzle(client, { schema });
```

So far our infrastructure structure looks like this:

```
└── infrastructure/
    └── database/
    	├── utils.ts
    	├── index.ts
    	└── migrations/

```

As you can see there are also some files that we didn't meet so far. Let's break it down:

```ts
//utils.ts
import { HTTPException } from "hono/http-exception";

export const takeFirst = <T>(values: T[]): T | null => {
	if (values.length === 0) return null;
	return values[0]!;
};

export const takeFirstOrThrow = <T>(values: T[]): T => {
	if (values.length === 0)
		throw new HTTPException(404, {
			message: "Resource not found",
		});
	return values[0]!;
};
```

This file contains two crucial function that we will be using a lot in our queries.

The migration is the directory that we pointed in the index.ts file, and it will contains all our migration `.sql` file for out database.

<!-- TOC --><a name="dipendence-injection-setup"></a>

### Dipendence Injection Setup

As I said before for dependency injection, I'm going to use `tsyringe` but you can actually use whatever you want.

If you will use both `bun` and `tsyringe` you just need a small fix to make everything works, just follows these steps:

- Create `reflect-metadata-import.ts` under `src/` folder,

  ```ts
  // src/reflect-metadata-import.ts

  import "reflect-metadata";
  ```

- Create `bunfig.toml` file under root folder

  ```toml
  // /bunfig.toml

  preload = ["./src/reflect-metadata-import.ts"]
  ```

<!-- TOC --><a name="email-and-password-authentication"></a>

## Email and password authentication

Once you are done with the initial setup, we can now pass to implements the first step, that will be the creation of a basic email and password authentication.

Let's start by creating the controller, as I said in the Architecture Overview the _controllers are responsible for routing requests_.

Before define the actual controller let's explicit define how a controller is shaped.

Create a `interfaces/` folder under `src`, and add the `controller.interface.ts` file.

This file as expected will contains the shape of all out Controller classes.

```ts
// src/interfaces/controller.interface.ts

import { Hono } from "hono";
import type { HonoTypes } from "./../types/hono.type";

import type { BlankSchema } from "hono/types";

export interface Controller {
	controller: Hono<HonoTypes, BlankSchema, "/">;
	routes(): any;
}
```

The `HonoTypes` is an handy type used to define some global type, let's define it in the `src/types/hono.type.ts` file.

```ts
//src/types/hono.type.ts

import type { Promisify, RateLimitInfo } from "hono-rate-limiter";

export type HonoTypes = {
	Variables: {
		userId: string;
		rateLimit: RateLimitInfo;
		rateLimitStore: {
			getKey?: (key: string) => Promisify<RateLimitInfo | undefined>;
			resetKey: (key: string) => Promisify<void>;
		};
	};
};
```

Now let's define the Authentication Controller, create a `controllers/` folder under `src/` and add `auth.controller.ts` file.

Here we have to define a controller class that `implements` the `Controller` interface. Let's do it.

```ts
// src/controllers/auth.controller.ts

import { Hono } from "hono";
import type { HonoTypes } from "./../types/hono.type";
import { injectable } from "tsyringe";
import { Controller } from "../interfaces/controller.interface";

@injectable()
export class AuthController implements Controller {
	controller = new Hono<HonoTypes>();

	constructor() {}

	routes() {
		return this.controller;
	}
}
```

This is the shape of our `AuthController` and it will be the shape of all the other controller that you will implements in your application.

The `@injectable` keywords is a **decorator** that tells us that this class is a dependency of the project and we can retrive its instance everywhere in the application, because it will be injected at runtime, I link [here](https://github.com/microsoft/tsyringe?tab=readme-ov-file#injectable) the official documentation.

Then we will se that we can retrive it by doing:

```ts
const instance = container.resolve(AuthController);
```

But the question is: where do I have to retrieve it?
Easy, in the `index.ts` . This file is very important, it is the **entry point** of your application, every thing starts from there.

Most likely, by running

```sh
bun create hono@latest
```

You will probably get a `index.ts` like this:

```ts
// src/index.ts
import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => {
	return c.text("Hello Hono!");
});

export default app;
```

We will now edit a bit to reflect our needs.

```ts
// src/index.ts
import "reflect-metadata";
import { Hono } from "hono";
import { container } from "tsyringe";
import { AuthController } from "./controllers/auth.controller";

/* ----------------------------------- Api ---------------------------------- */

const app = new Hono().basePath("/api");

/* --------------------------------- Routes --------------------------------- */

const authRoutes = container.resolve(AuthController).routes();

app.route("/auth", authRoutes);

app.get("/", (c) => {
	return c.text("Hello Hono!");
});

/* -----------------------------------Exports----------------------------------*/

export default app;
```

Seems all clear:

- We add a base path for the application, now all the routes that out app handle are under the `/api` route.
- We "import" our instance of the `AuthController`.
- We define the `/auth` route, for handling our authentication routes.
- We add the `import "reflect-metadata";` for the `tsyringe` lib on `bun`.
- We can keep the `GET` endpoint on `/` for now, just for testing purpose, but it is up to you.

<!-- TOC --><a name="defining-routes"></a>

### Defining routes

Now that we have our controller we can just define routes inside of it.

As you can imagine for now we need just `login` and `signup`, let's see how can we do it in `Hono` with our setup.

```ts
// src/controllers/auth.controller.ts
import { Hono } from "hono";
import type { HonoTypes } from "./../types/hono.type";
import { inject, injectable } from "tsyringe";
import { Controller } from "../interfaces/controller.interface";
import { zValidator } from "@hono/zod-validator";
import { loginDTO } from "../dtos/login.dto";
import { signUpDTO } from "../dtos/signup.dto";
import { AuthService } from "../services/auth.service";
import { limiter } from "../middlewares/limiter.middleware";

@injectable()
export class AuthController implements Controller {
	controller = new Hono<HonoTypes>();

	constructor(@inject(AuthService) private readonly authService: AuthService) {}

	routes() {
		return this.controller
			.post(
				"/login",
				zValidator("json", loginDTO),
				limiter({ limit: 10, minutes: 60 }),
				async (context) => {
					const body = context.req.valid("json");
					const user = await this.authService.login(body);
					return context.json(user);
				}
			)
			.post(
				"/signup",
				zValidator("json", signUpDTO),
				limiter({ limit: 10, minutes: 60 }),
				async (context) => {
					const data = context.req.valid("json");
					const newUser = await this.authService.signup(data);
					return context.json(newUser);
				}
			);
	}
}
```

Of course we need 2 POST endpoint, and in Hono, you can pass few things as parameter in a route, I will not go in detail of everything since we will see what we need on the fly.

For now you need to know that:

- The **first** parameter is the **path** of your endpoint,
- You can eventually pass a **validator** and/or a **limiter** or whatever **middleware** you want,
- lastly you will have your **function** that will be exectued whenever the endpoint get triggered, usually it is asyncronous, for obvious reason.

As you can see I keep the response JSON as clean as possibile, to make it easier to deserialize in the frontend, but it is just my preference, you can pick wich standard you most like, in this case I will highly suggest you to make a custom response object, to be as consistent as possible.

There are a lot of stuff beign added in this snippet, so let's try to make some order.

<!-- TOC --><a name="zod-dtos-validation"></a>

#### Zod DTOs Validation

The `zValidator()` function comes from the `zod-validator` hono library, as you can imagine, this function actually takes 2 parameters, a string, that will be used to validate it, and a `zod object`.

I prefer to keep all the DTOs (Data Transfer Object) in a separate folder. You can create the folder `/dtos` under `/src` and create the file `login.dto.ts` and `user.dto.ts`.

Data Transfer Objects (DTOs) are used to define the shape of data that is passed. They are used to validate data and ensure that the correct data is being passedto the correct methods.

For the **Login DTO** is all simple, just email and password, so:

```ts
// src/dtos/login.dto.ts

import { z } from "zod";

export const loginDTO = z.object({
	email: z
		.string({
			required_error: "email-required",
		})
		.email(),
	password: z
		.string({
			required_error: "password-required",
		})
		.min(8, "password-too-short")
		.max(32, "password-too-long"),
});

export type LoginDTO = z.infer<typeof loginDTO>;
```

As you can see in Zod you can also include custom error messages, and custom type of validation, I also infer the type from the zod object, so we can use it also in the service, as object that is passed from the controller, it will be much cleaner in a minute.

Of course in the body of the function I actually validate this object that I recive as a request with:

```ts
const data = context.req.valid("json");
```

We use `"json"` as a key, and is the same key we put in the `zValidator()`. This process ensure us that we will have full **type safety** across the endpoint, and we do not get some data that we don't actually need.

The next step is to do the same for **Sign Up DTO**,

```ts
// src/dtos/signup.dto.ts

import { z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { usersTable } from "./../tables";

export const signUpDTO = createInsertSchema(usersTable)
	.extend({
		passwordConfirmation: z.string({
			required_error: "password-confirmation-required",
		}),
		email: z.string().email(),
	})
	.omit({
		id: true,
		createdAt: true,
		updatedAt: true,
	})
	.refine((data) => data.password === data.passwordConfirmation, {
		message: "passwords-donot-match",
		path: ["passwordConfirmation"],
	});

export type SignUpDTO = z.infer<typeof signUpDTO>;
```

So now the "music" is a bit different than before, as you can see we introduce two new things, `createInsertSchema` and `usersTable`.

The `createInsertSchema()` is a function that comes from `drizzle-zod` a very convenient package to use in combo with Drizzle. It provides some time-saving API that will "translate" your Drizzle Schema into zod object, both for insert and for the selection.

So the `createInsertSchema()` will take a **Zod Schema** as an argument and will return a **Zod Object**.

For the `usersTable` we will get there in a minute.

In this case we do also need some other adjustment to the created Zod Object, since we have to `extend` it with the password confirmation and we of course do not need to insert the `id`, `createdAt` and `updatedAt` when we create a new user from the signup form.

We finally refine the Zod Object by ensuring that the `password` and `passwordConfirmation` are the same.

<!-- TOC --><a name="users-table"></a>

#### Users Table

I talk about zod validation and I mention the `usersTable` but I actually never declare it, let's do it right now.

As I said early in the article we will store all the `Drizzle Schema` of the database under the `src/infrastructure/database/tables/` folder, so create the `users.table.ts` file under this folder.

```ts
// src/infrastructure/database/tables/users.table.ts
import { citext, timestamps } from "./utils";
import { boolean, pgTable, text } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

export const usersTable = pgTable("users", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => createId()),
	email: citext("email").notNull().unique(),
	password: text("password").notNull(),
	...timestamps,
});
```

This is the structure of the `usersTable` so far, I will not go in detail of the Drizzle implementation, you can find a good guide on [their documentation](https://orm.drizzle.team/docs/sql-schema-declaration).

Just a quick reminder to create a `src/infrastructure/database/tables/index.ts` file:

```ts
// src/infrastructure/database/tables/index.ts
export * from "./users.table";
```

In that way we can reference all the schemas in one in the `drizzle.config.ts`, we just mention last chapter.

```ts
// src/infrastructure/database/index.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./tables"; // Add the import here

export const client = postgres(Bun.env.DATABASE_URL ?? "", { max: 10 });
export const db = drizzle(client, { schema });
```

There are somethings that we actually did not encounter so far, the `createId()` function, that is just a function to create reliable `id` from the `paralleldrive` library, but also the `citext` and `timestamps`.

The `citext` represent the **case insensitive text** and it is just a `customType` for Drizzle, and the `timestamps` as you can imagine are just the `createdAt` and `updatedAt` fields "merged together".

You can place both under the `src/infrastructure/database/tables/utils.ts` file, that you have to create.

```ts
// src/infrastructure/database/tables/utils.ts
import { timestamp } from "drizzle-orm/pg-core";
import { customType } from "drizzle-orm/pg-core";

export const citext = customType<{ data: string }>({
	dataType() {
		return "citext";
	},
});

export const timestamps = {
	createdAt: timestamp("created_at", {
		mode: "date",
		withTimezone: true,
	})
		.notNull()
		.defaultNow(),
	updatedAt: timestamp("updated_at", {
		mode: "date",
		withTimezone: true,
	})
		.notNull()
		.defaultNow(),
};
```

A very **important** step is to create

<!-- TOC --><a name="limiter-middleware"></a>

#### Limiter Middleware

The limiter middleware comes in handy when you have to ensure that users not spam your endpoints, so you can create a `src/middleware/limiter.middleware.ts` file.

```ts
// src/middleware/limiter.middleware.ts
import { rateLimiter } from "hono-rate-limiter";
import type { HonoTypes } from "./../types/hono.type";

export function limiter({
	limit,
	minutes,
	key = "",
}: {
	limit: number;
	minutes: number;
	key?: string;
}) {
	return rateLimiter({
		windowMs: minutes * 60 * 1000, // every x minutes
		limit, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
		standardHeaders: "draft-6", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
		keyGenerator: (c) => {
			const vars = c.var as HonoTypes["Variables"];
			const clientKey = vars.userId || c.req.header("x-forwarded-for");
			const pathKey = key || c.req.routePath;
			return `${clientKey}_${pathKey}`;
		}, // Method to generate custom identifiers for clients.
	});
}
```

<!-- TOC --><a name="login-and-signup-service"></a>

#### Login and Signup Service

As you can see I almost cover everything I show you in the `AuthController` but I didn't mention the most important part, the `AuthService`.

As I mention before services in general are responsible for handling business logic.

Obviously we will use `Dependency Injection` also for the `Services`, the base of the `AuthService` and in general of the other services too, will be a basic `@injectable()` class with a bunch of methods:

```ts
@injectable()
export class AuthService {
	constructor() {}
}
```

Inside of the service a right as we saw before, we'll need only two methods for now, `login` and `signup`.

```ts
// src/services/auth.service.ts
import { inject, injectable } from "tsyringe";
import { BadRequest, InternalError } from "../common/error";
import { HTTPException } from "hono/http-exception";
import { HashingService } from "./hashing.service";
import { LoginDTO } from "../dtos/login.dto";
import { SignUpDTO } from "../dtos/signup.dto";
import { UsersRepository } from "../repositories/user.repository";

@injectable()
export class AuthService {
	constructor(
		@inject(HashingService) private readonly hashingService: HashingService,
		@inject(UsersRepository) private readonly usersRepository: UsersRepository
	) {}

	async login(data: LoginDTO) {
		try {
			const user = await this.usersRepository.findOneByEmail(data.email);
			if (!user) {
				throw BadRequest("invalid-email");
			}
			const hashedPassword = await this.hashingService.verify(
				user.password,
				data.password
			);

			if (!hashedPassword) {
				throw BadRequest("wrong-password");
			}

			return user;
		} catch (e) {
			if (e instanceof HTTPException) {
				throw e;
			}
			throw InternalError("error-login");
		}
	}

	async signup(data: SignUpDTO) {
		try {
			const existingEmail = await this.usersRepository.findOneByEmail(
				data.email
			);
			if (existingEmail) {
				throw BadRequest("email-already-in-use");
			}
			const hashedPassword = await this.hashingService.hash(data.password);
			data.password = hashedPassword;

			const newUser = await this.usersRepository.create(data);

			return newUser;
		} catch (e) {
			if (e instanceof HTTPException) {
				throw e;
			}
			throw InternalError("error-signup");
		}
	}
}
```

I know I introduced a lot of code, so let's break it down.

- Login

  - Check if an user at given email address is extisting, if not we throw error;
  - Check the password that the user send in the request and the hash of the password stored in the database, be basically hash again the password in the request and check if the two hash are the same, if yes it means it is the correct password, otherwise it is the wrong password.
  - then return the user.

- Signup

  - Check if email in the request is linked to some user, and exsist in the database;
  - If exist a user with the email sended in the request, you can't proceed with the sign up since a user with this email already exist, and the email is a unique attribute for the user.
  - If the email is not associated to any user, proceed with hashing the password in the request, set the hash as the password of the user;
  - create the new user and return it.

<!-- TOC --><a name="error-handling"></a>

#### Error Handling

With the introduction of the service, I of course introduce the error handling part.

As for the response, I want to keep it minimal. So I create some predefined `wrappers`, so I can easy reference to them in my services:

```ts
// src/commons/error.ts
import { StatusCodes } from "./../constants/status-codes";
import { HTTPException } from "hono/http-exception";

export function TooManyRequests(message: string = "Too many requests") {
	return new HTTPException(StatusCodes.TOO_MANY_REQUESTS, { message });
}

export function Forbidden(message: string = "Forbidden") {
	return new HTTPException(StatusCodes.FORBIDDEN, { message });
}

export function Unauthorized(message: string = "Unauthorized") {
	return new HTTPException(StatusCodes.UNAUTHORIZED, { message });
}

export function NotFound(message: string = "Not Found") {
	return new HTTPException(StatusCodes.NOT_FOUND, { message });
}

export function BadRequest(message: string = "Bad Request") {
	return new HTTPException(StatusCodes.BAD_REQUEST, { message });
}

export function InternalError(message: string = "Internal Error") {
	return new HTTPException(StatusCodes.INTERNAL_SERVER_ERROR, { message });
}
```

As you can see these function wraps the default `HTTPException` that `hono` give to us, the `StatusCode` is an `enum` that is stored in a separate file, I will not paste it here, since it is a quite big file, but you can find it by yourself [here](https://github.com/prettymuchbryce/http-status-codes/blob/master/src/status-codes.ts), you just need to paste it, and copy in the `src/costants/status-codes.ts` file.

<!-- TOC --><a name="hashing-service"></a>

#### Hashing Service

Before diving into the `Repository` I will first introduce the `Hashing Service`, this is a very small service that is responsible to handle, as you can imagine, the hashing part of the application.

```ts
// src/services/hashing.service.ts
import { injectable } from "tsyringe";
import { Scrypt } from "oslo/password";

@injectable()
export class HashingService {
	private readonly hasher = new Scrypt();
	// private readonly hasher = new Argon2id(); // argon2id hasher

	async hash(data: string) {
		return this.hasher.hash(data);
	}

	async verify(hash: string, data: string) {
		return this.hasher.verify(hash, data);
	}
}
```

I use `Scrpt` as the hashing algorithm due to its higher compatability and it uses less memory than `Argon2id`.

You can use `Argon2id` or any other hashing algorithm you prefer, it will be the same as you can see in the comment line of code.

<!-- TOC --><a name="user-repository"></a>

#### User Repository

As written in the introduction the `repository` layer is responsible to handle the interaction with the `db` and he does not know anything about the buisness logic or route handling.

It just write, delete, update and retrive data from the database.

Since `DrizzleORM` offers also the possibility to perform `transaction` in `PostgreSQL` we will define a general shape for a `Repository`.

```ts
// src/interfaces/repository.interface.ts
import type { DatabaseProvider } from "../providers/database.provider";

export interface Repository {
	trxHost(trx: DatabaseProvider): any;
}
```

The interface is really simple, but as usual I introduce a new piece of the puzzle.

<!-- TOC --><a name="database-provider"></a>

##### Database Provider

I do not introduced the `provider` concept so far, so let me explain better.

This is how the `DatabaseProvider` looks like.

```ts
// src/providers/database.provider.ts
import { container } from "tsyringe";
import { db } from "../infrastructure/database";

// Symbol
export const DatabaseProvider = Symbol("DATABASE_TOKEN");

// Type
export type DatabaseProvider = typeof db;

// Register
container.register<DatabaseProvider>(DatabaseProvider, { useValue: db });
```

As you can see I'm using the `db` instance that I previously declared in the infrastructure part. In that way we ensure that we are using the same instance of `db` across all the application, and we avoid the "error prone" approach of importing manually the `db` inside each repository.

Indeed in this case `tsyringe` _provides_ us the same instance of the same object across all the application, thanks to **Dependency Injection**.

<!-- TOC --><a name="user-repository-implementation"></a>

##### User Repository Implementation

In this project I will not make a separate distinction between the shape of the repository and the repository implementation it self, you follow this approach if you prefer ,but let's see how the `user repository` is made up.

```ts
// src/repositories/user.repository.ts
import { inject, injectable } from "tsyringe";
import type { Repository } from "../interfaces/repository.interface";
import { eq, type InferInsertModel } from "drizzle-orm";
import { DatabaseProvider } from "../providers/database.provider";
import { usersTable } from "../infrastructure/database/tables";
import { takeFirstOrThrow } from "../infrastructure/database/utils";
import { BadRequest } from "../common/error";

export type CreateUser = InferInsertModel<typeof usersTable>;
export type UpdateUser = Partial<CreateUser>;

@injectable()
export class UsersRepository implements Repository {
	constructor(@inject(DatabaseProvider) private db: DatabaseProvider) {}

	async findAll() {
		return this.db.query.usersTable.findMany();
	}

	async findOneById(id: string) {
		return this.db.query.usersTable.findFirst({
			where: eq(usersTable.id, id),
		});
	}

	async findOneByIdOrThrow(id: string) {
		const user = await this.findOneById(id);
		if (!user) throw BadRequest("user-not-found");
		return user;
	}

	async findOneByEmail(email: string) {
		return this.db.query.usersTable.findFirst({
			where: eq(usersTable.email, email),
		});
	}

	async create(data: CreateUser) {
		return this.db
			.insert(usersTable)
			.values(data)
			.returning()
			.then(takeFirstOrThrow);
	}

	async update(id: string, data: UpdateUser) {
		return this.db
			.update(usersTable)
			.set(data)
			.where(eq(usersTable.id, id))
			.returning()
			.then(takeFirstOrThrow);
	}

	trxHost(trx: DatabaseProvider) {
		return new UsersRepository(trx);
	}
}
```

Here we are using a lot of things that we mention in the previous paragraphs, like the `takeFirstOrThrow` function, the `DatabaseProvider` the super helpfull `InferInsertModel` from `drizzle-zod`, so I will not go in details of these, as I wont go in details of the `drizzle` query creation, since it really depends on your ORM that of course could possibly be not Drizzle.

<!-- TOC --><a name="starting-docker-and-testing"></a>

#### Starting Docker and Testing

So far we actually implement a very **basic email and password system** we will go in deep with the other features (sessions, refreshToken, email validation, etc...) later on in the article, I really wanna go **step-by-step** so you can fully understand the whole process.

For testing out what you made so far you can use `Postman` or `httpie` or what you prefer to test your endpoint.

But first you need to start the whole system.

- Generate the migration: `drizzle-kit generate`,
- Push the changes: `drizzle-kit push`,
- Start Docker: `docker-compose up -d --build`

For the for the sake of simplicity I will just put those script inside my `package.json`:

```json
"scripts": {
    "db:push": "drizzle-kit push",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio --verbose",
    "dev": "bun run --hot src/index.ts",
    "initialize": "bun install && docker-compose up --no-recreate -d && bun db:migrate",
    "docker:up": "docker-compose up -d",
    "docker:build": "docker-compose up -d --build"
  },
```

I just add some self explanatory scripts.

For spin up for the first time the system, just run:

```sh
bun db:generate
```

To generate the `SQL` file for the **migration** and:

```sh
bun initialize
```

To spin up everything, install dependencies, start docker and do the migration.

Once everything is done correctly you can move on with testing out the endpoints.

The `json` body of the `POST` request for the **signup** will be something like that:

```json
{
	"email": "email@example.com",
	"password": `test1234`,
	"passwordConfirmation": "test1234"
}
```

And the `json` body of the `POST` request for the **login** will be something like that:

```json
{
	"email": "email@example.com",
	"password": `test1234`
}
```

The url can vary depends on what you put in the controller, in the base path, your port, ecc..

In my case I just need to query `http:`

<!-- TOC --><a name="jwt-access-and-refresh-token-system"></a>

## JWT Access and Refresh Token System

Before deep diving into the implementation of the system, let me explain what a **Refresh Token** system is and how it works.

<!-- TOC --><a name="what-is-it"></a>

### What is it?

In the refresh token system, there are two different tokens `refreshToken` and `accessToken`.

- The `accessToken` is a **short-live** token (usually from couple of minutes up to few days), it is the token that is in the `Authorization` field of the `http request` from the client. This token is being validated each times we put a special `middleware` in the route (we will see it later on), it is not validated, the server will respond with a `401 Unauthorized`.

<!-- TOC --><a name="how-it-works"></a>

### How it works?

So far it seems like a normal `JWT` authentication in wich the user ,when the `accessToken` is expired, logs out even if he use the application and send request every day (very bad UX).

- In the `refreshToken` system we ensure that if the user keeps using the application, and keeps sending request to the server it will always get fresh new `accessToken` when it expires, so we the user will not logs out.
- For doing that we actually have the needs of a new token, the `refreshToken` , this is usually a **long-live** token (usually a month or so), that the client store in a persistent database, cache or shared preferences.
- The server does not have to store it, but it can be usefull if you wanna for example logs out a user if something bad happen, or if you wanna log out only certain devices (if you store the device ID), we will not cover this section in this article, but we will still **store in the database** the `refreshToken`.
- This token is responsible to handle the case in wich the user request the access to a protected routes with an expired `accessToken`, in this case the `refreshToken` "tells" the server that this user (who own the `refreshToken`) have the right to **access the resource** even if his `accessToken`, because his `refreshToken` is still valid.
- The whole process is handled both from the client and the server, the flow is the following.
  - The user request the access to a protected resource with an expired `accessToken`,
  - The server respond with a `401 Unathorized`
  - The client intercept this error from the server, and try to send a `POST` request to the `/refresh-token` endpoint in the server, with **his own refresh token** that he's is storing in some memory or disk.
  - The server recive the `POST` request within the client `refreshToken` in the body.
  - If the `refreshToken` is still valid, and it is not expired, the server will proceed to generate fresh new `accessToken` and new `refreshToken` (and store it in disk) and send it back to the client.
  - The client, if everything so far goes well, will fetch the response, stores the new `accessToken` and `refreshToken` from the server, and retry the previous request, with the updated `accessToken`, otherwise it will presumably log out the user.

As you can see there is a lot of **client-server** communication, and I will cover only the server parts, because the client implementation can be various depends on your platform and technology (web, mobile, etc...).

<!-- TOC --><a name="defining-routes-1"></a>

### Defining Routes

The first thing we need is to specify the endpoint where the user can send the `POST` request to ask for a new `refresh` and `accessToken`.

We can put in the `AuthController` since it is part of the domain of the "authentication".

As explained before, the user has to send his stored refresh token (the one in the client) to be able to request a new one. I will not separate the `DTO` for this route, since it is only a string.

```ts
// src/controllers/auth.controlle.ts

import { Hono } from "hono";
import type { HonoTypes } from "../types";
import { injectable } from "tsyringe";
import { zValidator } from "@hono/zod-validator";
import { UserService } from "../services/user.service";
import { AuthService } from "../services/auth.service";
import { RefreshTokenService } from "../services/refresh-token.service";
import { loginDto } from "./../../../dtos/login.dto";
import { limiter } from "../middleware/rate-limiter.middlware";
import { z } from "zod":

@injectable()
export class AuthController implements Controller {

 controller = new Hono<HonoTypes>();

 constructor(){
    @inject(AuthService) private readonly authService: AuthService,
    @inject(RefreshTokenService) private readonly refreshTokenService: RefreshTokenService,
 }

 routes(){
     return this.controller
        // login and signup routes...
        .post(
        "/refresh-token",
        zValidator("json", refreshTokenDTO),
        limiter({ limit: 10, minutes: 60 }),
        async (context) => {
          const refreshTokenBody = context.req.valid("json");
          const { accessToken, refreshToken } =
            await this.refreshTokenService.refreshToken(
              refreshTokenBody.refreshToken,
            );
          return context.json({ accessToken, refreshToken });
        },
      );
 }
}

```

<!-- TOC --><a name="refresh-token-dto"></a>

### Refresh Token DTO

The Refresh Token DTO is straight forward, I wont spend more time on it.

```ts
// src/dtos/refresh-token.dto.ts
import { z } from "zod";

export const refreshTokenDTO = z.object({
	refreshToken: z.string(),
});

export type RefreshTokenDTO = z.infer<typeof refreshTokenDTO>;
```

<!-- TOC --><a name="refresh-token-service"></a>

### Refresh Token Service

As for the the other endpoints, we do not want to manage the business logic inside the controller, so we create a separate class for it. Create the `refresh-token.service.ts` under the `service` folder.

```ts
// src/services/refresh-token.service.ts
import { inject, injectable } from "tsyringe";
import { sign, verify } from "hono/jwt";
import { config } from "../common/config";
import { RefreshTokenRepository } from "../repositories/refresh-token.repository";
import { BadRequest, Unauthorized } from "../common/errors";


@injectable()
export class RefreshTokenService {
  constructor(
    @inject(RefreshTokenRepository) private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  // Update refresh token by generating a new one and invalidating the old one
  async refreshToken(refreshToken: string) {
    const session =
      await this.refreshTokenRepository.getSessionByToken(refreshToken);

    if (!session || session.expiresAt < new Date()) {
      throw BadRequest("invalid-refresh-token");
    }

    const newAccessToken = await this.generateAccessToken(session.userId);
    const newRefreshToken = await this.generateRefreshToken(session.userId);

    await this.refreshTokenRepository.updateRefreshToken(
      session.userId,
      refreshToken,
      newRefreshToken,
      config.jwt.refreshExpiresInDate
    );

    return { refreshToken: newRefreshToken, accessToken: newAccessToken };
  }

  async storeSession(userId: string, refreshToken: string) {
    await this.refreshTokenRepository.storeRefreshToken(
      userId,
      refreshToken,
      config.jwt.refreshExpiresInDate
    );
  }

  async generateRefreshToken(userId: string){
    const payload = {
      sub: userId,
      exp: config.jwt.refreshExpiresIn,
    };
    const refreshToken = await sign(payload, config.jwt.refreshSecret));
    return refreshToken;
  }

  async generateAccessToken(userId: string): Promise<string> {
    const payload = {
      sub: userId,
      exp: config.jwt.accessExpiresIn,
    };
    const accessToken = await sign(payload, config.jwt.accessSecret);
    return accessToken;
  }

  async removeRefreshToken(refreshToken: string){
    await this.refreshTokenRepository.removeRefreshToken(refreshToken);
  }

  async invalidateUserSessions(userId: string) {
    await this.refreshTokenRepository.invalidateAllTokensForUser(userId);
  }
}
```

As usual I will break down the code in different steps.

- **Refresh Token Function**

  - The refresh token function is responsible to retrieve, if exist in the database, a session based on the given refresh token in the request.
  - If it does not exist or it is expired, the function will `throw` an error.
  - Otherwise it will generate both `accessToken` and `refreshToken` and it wills store them in the database.
    - Both the tokens are generated via the `hono/jwt` library, that `hono` provides us.
    - They are generated based on the configuration parameters.
  - Finally return both the tokens

- **JWT Secrets**
  I introduced new secrets that need to be added to the `.env` file.

```env
JWT_ACCESS_SECRET="your_access_secret"
JWT_REFRESH_SECRET="your_refresh_secret"
```

Now the `config.type.ts` file where there are all the `types` of the configuration need to be updated too.

```ts
// src/types/config.type.ts

export const config = (): Config => ({
	isProduction: process.env.NODE_ENV === "production",
	api: {
		origin: process.env.ORIGIN ?? "",
	},
	postgres: {
		url: process.env.DATABASE_URL ?? "",
	},
	jwt: {
		accessSecret: process.env.JWT_ACCESS_SECRET || "your_access_secret",
		refreshSecret: process.env.JWT_REFRESH_SECRET || "your_refresh_secret",
		accessExpiresIn: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
		refreshExpiresIn: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30, // 30 days
		refreshExpiresInDate: new Date(Date.now() + 60 * 60 * 24 * 30 * 1000), // 30 days
	},
});

// the rest of the configuration ...

interface Config {
	isProduction: boolean;
	api: ApiConfig;
	postgres: PostgresConfig;
	jwt: JwtConfig;
}
interface JwtConfig {
	accessSecret: string;
	refreshSecret: string;
	accessExpiresIn: number;
	refreshExpiresIn: number;
	refreshExpiresInDate: Date;
}
```

Now it is up to you to choose the expiration dates of the `accessToken` and `refreshToken`, as well as the secrets.

<!-- TOC --><a name="refresh-token-repository"></a>

### Refresh Token Repository

Also this service requires a repository since the sessions are stored in the persistent database as discussed previously.

```ts
// src/repositories/refres-token.repository.ts
import { inject, injectable } from "tsyringe";
import { DatabaseProvider } from "../providers";
import { eq } from "drizzle-orm";
import { sessionsTable } from "../tables";
import { and } from "drizzle-orm/expressions";
import { takeFirstOrThrow } from "../infrastructure/database/utils";
import { config } from "../common/config";

@injectable()
export class RefreshTokenRepository {
	constructor(@inject(DatabaseProvider) private db: DatabaseProvider) {}

	async storeRefreshToken(userId: string, token: string, expiresAt: Date) {
		return this.db
			.insert(sessionsTable)
			.values({ userId, token, expiresAt })
			.returning()
			.then(takeFirstOrThrow);
	}

	async removeRefreshToken(token: string) {
		return this.db.delete(sessionsTable).where(eq(sessionsTable.token, token));
	}

	async getSessionByToken(refreshToken: string) {
		return this.db.query.sessionsTable.findFirst({
			where: eq(sessionsTable.token, refreshToken),
		});
	}

	async updateRefreshToken(
		userId: string,
		oldToken: string,
		newToken: string,
		expiresAt: Date
	) {
		const body = { userId, token: newToken, expiresAt };
		await this.db.transaction(async (trx) => {
			await trx.delete(sessionsTable).where(eq(sessionsTable.token, oldToken));
			await trx.insert(sessionsTable).values(body);
		});
	}

	async invalidateAllTokensForUser(userId: string) {
		return this.db
			.delete(sessionsTable)
			.where(eq(sessionsTable.userId, userId));
	}
}
```

In this service the `Database Provider` that has been declared in the past is needed since a `db transaction` is needed. For a reference of what is a transaction I will leave the official definition in the [postgres documentation](https://www.postgresql.org/docs/current/tutorial-transactions.html):

> _Transactions are a fundamental concept of all database systems. The essential point of a transaction is that it bundles multiple steps into a single, all-or-nothing operation. The intermediate states between the steps are not visible to other concurrent transactions, and if some failure occurs that prevents the transaction from completing, then none of the steps ?affect the database at all._

<!-- TOC --><a name="sessions-table"></a>

#### Sessions Table

The session table introduced in the repository contains all the sessions of the users.

It will be located under the `src/infrastructure/database/tables/` folder:

```ts
// src/infrastructure/database/tables/sessions.table.ts
import { cuid2 } from "./utils";
import { usersTable } from "./users.table";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

export const sessionsTable = pgTable("sessions", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => createId()),
	token: text("token").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => usersTable.id, { onDelete: "cascade" }),
	expiresAt: timestamp("expires_at", {
		withTimezone: true,
		mode: "date",
	}).notNull(),
});

export const sessionRelationships = relations(
	sessionsTable,
	({ many, one }) => ({
		users: one(usersTable, {
			fields: [sessionsTable.userId],
			references: [usersTable.id],
		}),
	})
);
```

Since we added the relationship in the `sessionsTable` we have to do the same for the `usersTable`

```ts
// src/infrastructure/database/tables/users.table.ts
import { relations } from "drizzle-orm";
import { sessionsTable } from "./sessions.table";
// rest of the imports ...

export const usersTable = ... // table declaration

//rest of the code and table definitions ...

export const usersRelations = relations(usersTable, ({ many, one }) => ({
  sessions: many(sessionsTable),}));
```

[ ⚠️⚠️⚠️ ] Do not forget to generate the migration and push it once you have done with the editing of your schema [ ⚠️⚠️⚠️ ]

<!-- TOC --><a name="authentication-middleware"></a>

### Authentication Middleware

Once defined the routes, the logic and the database integration of the JWT refresh token system, we need to find a way to actually prevent the access to certain resources.

In `hono`, and other frameworks too, offers the possibility of defining `middleware` as we did before for the `limiter` and `zValidator()`.

Let's define one for protecting only certain routes.

```ts
// src/middleware/auth.middleware.ts
import type { MiddlewareHandler } from "hono";
import { createMiddleware } from "hono/factory";
import { verify } from "hono/jwt";
import { Unauthorized } from "../common/error";
import { config } from "../types/config.type";

export const validateAuthSession: MiddlewareHandler = async (c, next) => {
	const authHeader = c.req.header("Authorization") ?? "";
	const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

	if (!token) {
		c.set("userId", null);
		return next();
	}

	try {
		// Verify the access token
		const payload = await verify(token, config.jwt.accessSecret);
		const userId = payload.sub as string;

		if (!userId) {
			c.set("userId", null);
			return next();
		}

		// Set user id in context
		c.set("userId", userId);
	} catch (error) {
		// If token verification fails, set user to null
		c.set("user", null);
	}

	return next();
};

export const requireAuth: MiddlewareHandler<{
	Variables: {
		userId: string;
	};
}> = createMiddleware(async (c, next) => {
	const user = c.var.userId;
	if (!user)
		throw Unauthorized("You must be logged in to access this resource");
	return next();
});
```

As you can see I come up with 2 different middlewares, this is why I will use the `validateAuthSession` globally, so at each request, the `JWT` will be validated. And only where needed the `requireAuth` middleware is placed next to the route to protect it.

To define a global middleware just add this two lines in the `index.ts` :

```ts
// src/index.ts

import { validateAuthSession } from "./server/api/middleware/auth.middleware";

/* --------------------------- Global Middlewares --------------------------- */

app.use("*", cors({ origin: "*" })); // Allow CORS for all origins
app.use(validateAuthSession);
app.use(logger()); // [OPTIONAL] if you wanna log all the request and response, the import is import { logger } from "hono/logger";
```

and if you wanna protect a route, just use the `requireAuth` middleware on the route:

```ts
	.post(
        "/protected-resource",
        requireAuth,
        async (context) => {
          return context.text("Access acquired to the protected resource");
        },
      );
```

<!-- TOC --><a name="update-login-flow"></a>

### Update Login Flow

Since now handle our sessions with **JWT** we need to find a way to send back to the client his `accessToken` and `refreshToken` so he can e authenticated and can access all the protected resources.

For doing that we take advantage of the `RefreshTokenService` previously created, since this is part of the business logic we're gonna handle it in the `AuthService`.

```ts
// src/services/auth.service.ts

// Rest of the imports...
import { RefreshTokenService } from "./refresh-token.service";

@injectable()
export class AuthService {
  constructor(
    @inject(HashingService) private readonly hashingService: HashingService,
    @inject(RefreshTokenService) private readonly refreshTokenService: RefreshTokenService,
    @inject(UsersRepository) private readonly usersRepository: UsersRepository,
  ) {}

  async login(data: LoginDTO) {
    try {
      const user = await this.usersRepository.findOneByEmail(data.email);
      if (!user) {
        throw BadRequest("invalid-email");
      }

      const hashedPassword = await this.hashingService.verify(
        user.password,
        data.password,
      );

      if (!hashedPassword) {
        throw BadRequest("wrong-password");
      }

      //if everything is good, create refresh token and access token
      const accessToken = await this.refreshTokenService.generateAccessToken(
        user.id,
      );
      const refreshToken = await this.refreshTokenService.generateRefreshToken(
        user.id,
      );
      //store the refresh token session in the database
      await this.refreshTokenService.storeSession(user.id, refreshToken);

      return { user, accessToken, refreshToken };
    } catch (e) {
      if (e instanceof HTTPException) {
        throw e;
      }
      throw InternalError("error-login");
    }
  }

// Rest of the code ...
```

Now let's reflect the changes in the `AuthController`.

```ts
// src/controllers/auth.controllers.ts

// Rest of the code...
	.post(
        "/login",
        zValidator("json", loginDTO),
        limiter({ limit: 10, minutes: 60 }),
        async (context) => {
          const body = context.req.valid("json");
          const { user, accessToken, refreshToken } =
            await this.authService.login(body);
          return context.json({ user, accessToken, refreshToken });
        },
      )
// Rest of the code...
```

<!-- TOC --><a name="testing-the-endpoints"></a>

### Testing the endpoints

Now what you can do is to try is to perform a login as we seen in the last chapter.

You should receive an output like this when you login:

```json
{
	"user": {
		"id": "mdh2e14meythwnvupsbxez2r",
		"email": "test@test.com",
		"password": "5b21310d820a9f0099c6e7fc8eefac3a:28160978a8833f334bd2c92f732b7572c73e5045189cf3b3efc39f45a1bab9b56b4dc23235895b304e46e4bbb6913238f3a79de5ef225d68f399baf76f36f062",
		"createdAt": "2024-10-27T15:31:10.420Z",
		"updatedAt": "2024-10-27T15:31:10.420Z"
	},

	"accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtZGgyZTE0bWV5dGh3bnZ1cHNieGV6MnIiLCJleHAiOjE3MzA3NDA5MzF9.-O2kj5Yf1c-PeAp2oDnlYYQZPmLdEG0b9TCFW_z_Yok",

	"refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtZGgyZTE0bWV5dGh3bnZ1cHNieGV6MnIiLCJleHAiOjE3MzI3MjgxMzF9.8DYcg6-y72tNmt6guYt5ePvoGiR1ZJto3M8J4ogVR14"
}
```

Now you can perform a `POST` request to the `.../api/auth/refresh-token`

According to our implementation the body should look like this.

```json
{
	"refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtZGgyZTE0bWV5dGh3bnZ1cHNieGV6MnIiLCJleHAiOjE3MzI3MjgxMzF9.8DYcg6-y72tNmt6guYt5ePvoGiR1ZJto3M8J4ogVR14"
}
```

and you should get something like this

```json
{
	"accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtZGgyZTE0bWV5dGh3bnZ1cHNieGV6MnIiLCJleHAiOjE3MzA3NDA5MzF9.-O2kj5Yf1c-PeAp2oDnlYYQZPmLdEG0b9TCFW_z_Yok",

	"refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtZGgyZTE0bWV5dGh3bnZ1cHNieGV6MnIiLCJleHAiOjE3MzI3MjgxMzF9.8DYcg6-y72tNmt6guYt5ePvoGiR1ZJto3M8J4ogVR14"
}
```

Two brand new `accessToken` and `refreshToken`.

<!-- TOC --><a name="email-verification"></a>

## Email Verification

One thing necessary for a **robust** authentication is an email verification system, so the users cannot use incorrect or random email address to gather access at your content.

The general **flow** of an email verification system is the following:

- Once the user signup he will receive an email containing the instruction to activate his account (so verify his email), the possible ways at this point are more or less two:
  - Verify the user by making it click on a link. In this case the user will basically make a `GET` os `POST` request to a particular endpoint with some information in the query to verify himself.
  - Verify the user by sending him a verification code to enter after the registration in the client.
- Those two steps are similar but the final result is the same, the UX (for the client) will change a bit, in terms of server the system is basically identical, you will figure out how to switch between the two by your self.

<!-- TOC --><a name="defining-routes-2"></a>

### Defining Routes

We needs just one route for this purpose, since there will be only one endpoint for the email validation.

```ts
// src/controllers/auth.controller.ts

// All the imports...

@injectable()
export class AuthController implements Controller {

 controller = new Hono<HonoTypes>();

 constructor(){
    @inject(AuthService) private readonly authService: AuthService,
    @inject(RefreshTokenService) private readonly refreshTokenService: RefreshTokenService,
    @inject(EmailVerificationsService) private readonly emailVerificationsService: EmailVerificationsService,
 }

 routes(){
     return this.controller
        // login, signup and refresh token routes...
        .get(
        "/verify/:userId/:token",
        limiter({ limit: 10, minutes: 60 }),
        async (context) => {
          const { userId, token } = context.req.param();
          await this.emailVerificationsService.processEmailVerificationRequest(
            userId,
            token,
          );
		  // display or return something to the user
        return context.html(`<h1>Email verified!</h1>`)
        },
      );
  }
}
```

The returning object really depends on your client, I just put a generic title here because in my implementation the user is supposed click on a link and whenever he gets on this web page, a `GET` request will be made, and he will be validated (if `token` and `userId` are valid) .

<!-- TOC --><a name="email-verification-service"></a>

### Email Verification Service

The process here is pretty straightforward.

- Whenever a new user is created (`signup`) the service will process this request.
- It creates a new token, his hash (since we store the hash of the token, not the token itself), and the expiry.
- A new record in the `emailVerificationsTable` is created with the email that request the verification, the `userId` (the ones created in the signup), the hashed token, and the expiry.
- An email is sent to the email that request the verification.

That is when a new user is being created, let's see when the user request the actual verification.

- If a record in the `emailVerificaitonsTable` with the `userId` (the one in the param of the request) is found, the hased token is compared with the `token` in the params.
- If everything goes okay, the email verification record will be deleted.
- Finally the `verified` status inside the users record will be updated.

Let's implement what I just said.

```ts
// src/services/email-verification.service.ts
import { inject, injectable } from "tsyringe";
import { DatabaseProvider } from "../providers/database.provider";
import { HashingService } from "./hashing.service";
import { UsersRepository } from "../repositories/user.repository";
import { TokensService } from "./token.service";
import { MailerService } from "./mailer.service";
import { EmailVerificationsRepository } from "../repositories/email-verifications.repository";
import { BadRequest } from "../common/error";

@injectable()
export class EmailVerificationsService {
	constructor(
		@inject(DatabaseProvider) private readonly db: DatabaseProvider,
		@inject(TokensService) private readonly tokensService: TokensService,
		@inject(MailerService) private readonly mailerService: MailerService,
		@inject(HashingService) private readonly hashingService: HashingService,
		@inject(UsersRepository) private readonly usersRepository: UsersRepository,
		@inject(EmailVerificationsRepository)
		private readonly emailVerificationsRepository: EmailVerificationsRepository
	) {}

	async dispatchEmailVerificationRequest(
		userId: string,
		requestedEmail: string
	) {
		// generate a token and expiry
		const { token, expiry, hashedToken } =
			await this.tokensService.generateTokenWithExpiryAndHash({
				number: 15,
				time: 30,
				lifespan: "m",
				type: "STRING",
			});
		const user = await this.usersRepository.findOneByIdOrThrow(userId);

		// create a new email verification record
		await this.emailVerificationsRepository.create({
			requestedEmail,
			userId,
			hashedToken,
			expiresAt: expiry,
		});

		// A confirmation-required email message to the proposed new address, instructing the user to
		// confirm the change and providing a link for unexpected situations
		this.mailerService.sendEmailVerificationToken({
			to: requestedEmail,
			props: {
				link: token,
			},
		});
	}

	async processEmailVerificationRequest(userId: string, token: string) {
		const validRecord = await this.findAndBurnEmailVerificationToken(
			userId,
			token
		);
		if (!validRecord) throw BadRequest("invalid-token");
		await this.usersRepository.update(userId, {
			email: validRecord.requestedEmail,
			verified: true,
		});
	}

	private async findAndBurnEmailVerificationToken(
		userId: string,
		token: string
	) {
		return this.db.transaction(async (trx: any) => {
			// find a valid record
			const emailVerificationRecord = await this.emailVerificationsRepository
				.trxHost(trx)
				.findValidRecord(userId);
			if (!emailVerificationRecord) return null;

			// check if the token is valid
			const isValidRecord = await this.hashingService.verify(
				emailVerificationRecord.hashedToken,
				token
			);
			if (!isValidRecord) return null;

			// burn the token if it is valid
			await this.emailVerificationsRepository
				.trxHost(trx)
				.deleteById(emailVerificationRecord.id);
			return emailVerificationRecord;
		});
	}
}
```

This service involve the actions of other services, since we need to generate tokens, hash and verify them, we need to send email and so on. So since this two features are most likely required in other part of the application let's split them in separated services.

<!-- TOC --><a name="token-service"></a>

#### Token Service

```ts
// src/services/token.service.ts
import { inject, injectable } from "tsyringe";
import { generateRandomString } from "oslo/crypto";
import { TimeSpan, createDate, type TimeSpanUnit } from "oslo";
import { HashingService } from "./hashing.service";

@injectable()
export class TokensService {
	constructor(
		@inject(HashingService) private readonly hashingService: HashingService
	) {}

	generateNumberToken(number: number) {
		const alphabet = "1234567890";
		return generateRandomString(number, alphabet);
	}

	generateStringToken(number: number) {
		const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVZ";
		return generateRandomString(number, alphabet);
	}

	generateTokenWithExpiry({
		number,
		time,
		lifespan,
		type,
	}: {
		number: number;
		time: number;
		lifespan: TimeSpanUnit;
		type: "NUMBER" | "STRING";
	}) {
		return {
			token:
				type === "NUMBER"
					? this.generateNumberToken(number)
					: this.generateStringToken(number),
			expiry: createDate(new TimeSpan(time, lifespan)),
		};
	}

	async generateTokenWithExpiryAndHash({
		number,
		time,
		lifespan,
		type,
	}: {
		number: number;
		time: number;
		lifespan: TimeSpanUnit;
		type: "NUMBER" | "STRING";
	}) {
		const token =
			type === "NUMBER"
				? this.generateNumberToken(number)
				: this.generateStringToken(number);
		const hashedToken = await this.hashingService.hash(token);
		return {
			token,
			hashedToken,
			expiry: createDate(new TimeSpan(time, lifespan)),
		};
	}
}
```

As you can see the `token service` is pretty straightforward, it relies mainly on the `hashing service` and it expose **useful API** to generate random and secure token.

<!-- TOC --><a name="mailer-service"></a>

#### Mailer Service

The mailer service is responsible to give the possibility to send email using `html` as template language.

```ts
// src/services/mailer.service.ts
import fs from "fs";
import path from "path";
import handlebars from "handlebars";
import { injectable } from "tsyringe";
import nodemailer from "nodemailer";

type SendMail = {
	to: string | string[];
	subject: string;
	html: string;
};

type SendTemplate<T> = {
	to: string | string[];
	props: T;
};

@injectable()
export class MailerService {
	private nodemailer = nodemailer.createTransport({
		host: "smtp.ethereal.email",
		port: 587,
		secure: false, // Use `true` for port 465, `false` for all other ports
		auth: {
			user: "adella.hoppe@ethereal.email",
			pass: "dshNQZYhATsdJ3ENke",
		},
	});

	sendEmailVerificationToken(data: SendTemplate<{ link: string }>) {
		const template = handlebars.compile(this.getTemplate("email-verification"));
		return this.send({
			to: data.to,
			subject: "Email Verification",
			html: template({ link: data.props.link }),
		});
	}

	sendResetPasswordOTP(data: SendTemplate<{ otp: string }>) {
		const template = handlebars.compile(this.getTemplate("reset-password"));
		return this.send({
			to: data.to,
			subject: "Password Reset",
			html: template({ code: data.props.otp }),
		});
	}

	private async send({ to, subject, html }: SendMail) {
		const message = await this.nodemailer.sendMail({
			from: '"Example" <example@ethereal.email>', // sender address
			bcc: to,
			subject, // Subject line
			text: html,
			html,
		});
	}

	private getTemplate(template: string) {
		const __dirname = path.dirname(__filename); // get the name of the directory
		return fs.readFileSync(
			path.join(__dirname, `../infrastructure/email-templates/${template}.hbs`),
			"utf-8"
		);
	}
}
```

<!-- TOC --><a name="email-templates"></a>

#### Email Templates

Since this is not the main goal of the guide I will not dive into the email template part, but [here](https://github.com/fres-sudo/hono-auth/tree/main/src/infrastructure/email-templates/)
you can find the templates that I have used in the guide.

Those files are `.hbs` that are basically **Handlebars** file, that is a templating engine, you can find the documentation [here](https://handlebarsjs.com/guide/)

> Handlebars is a simple **templating language**.
> It uses a template and an input object to generate HTML or other text formats. Handlebars templates look like regular text with embedded Handlebars expressions.

<!-- TOC --><a name="email-verifications-repository"></a>

### Email Verifications Repository

The email verifications

```ts
// src/repositories/email-verifications.repository.ts
import { inject, injectable } from "tsyringe";
import { DatabaseProvider } from "../providers";
import { and, eq, gte, lte, type InferInsertModel } from "drizzle-orm";
import type { Repository } from "../interfaces/repository.interface";
import { takeFirst, takeFirstOrThrow } from "../infrastructure/database/utils";
import { emailVerificationsTable } from "./../../../tables";

export type CreateEmailVerification = Pick<
	InferInsertModel<typeof emailVerificationsTable>,
	"requestedEmail" | "hashedToken" | "userId" | "expiresAt"
>;

@injectable()
export class EmailVerificationsRepository implements Repository {
	constructor(
		@inject(DatabaseProvider) private readonly db: DatabaseProvider
	) {}

	// creates a new email verification record or updates an existing one
	async create(data: CreateEmailVerification) {
		return this.db
			.insert(emailVerificationsTable)
			.values(data)
			.onConflictDoUpdate({
				target: emailVerificationsTable.userId,
				set: data,
			})
			.returning()
			.then(takeFirstOrThrow);
	}

	// finds a valid record by token and userId
	async findValidRecord(userId: string) {
		return this.db
			.select()
			.from(emailVerificationsTable)
			.where(
				and(
					eq(emailVerificationsTable.userId, userId),
					gte(emailVerificationsTable.expiresAt, new Date())
				)
			)
			.then(takeFirst);
	}

	async deleteById(id: string) {
		return this.db
			.delete(emailVerificationsTable)
			.where(eq(emailVerificationsTable.id, id));
	}

	trxHost(trx: DatabaseProvider) {
		return new EmailVerificationsRepository(trx);
	}
}
```

<!-- TOC --><a name="email-verifications-table"></a>

### Email Verifications Table

The Email Verifications table will be used to store all the request of email verifications and also to store the tokens that we need to verify the email along the `userId` and `email` that performs the request.

```ts
import { createId } from "@paralleldrive/cuid2";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { usersTable } from "./users.table";
import { timestamps } from "./utils";

export const emailVerificationsTable = pgTable("email_verifications", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => createId()),
	hashedToken: text("hashed_token").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => usersTable.id)
		.unique(),
	requestedEmail: text("requested_email").notNull(),
	expiresAt: timestamp("expires_at", {
		mode: "date",
		withTimezone: true,
	}).notNull(),
	...timestamps,
});

export const emailVerificationsRelations = relations(
	emailVerificationsTable,
	({ one }) => ({
		user: one(usersTable, {
			fields: [emailVerificationsTable.userId],
			references: [usersTable.id],
		}),
	})
);
```

<!-- TOC --><a name="users-table-1"></a>

### Users Table

Since we are verifying the user email, we have to find a way to mark the user as selected, for this purpose we are gonna need a `boolean` field in the `usersTable`.

```ts
// ... all the imports
export const usersTable = pgTable("users", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => createId()),
	email: citext("email").notNull().unique(),
	password: text("password").notNull(),
	verified: boolean("verified").notNull().default(false), // flag to add
	...timestamps,
});
// ...the rest of the code
```

and also update the relations:

```ts
export const usersRelations = relations(usersTable, ({ many, one }) => ({
	sessions: many(sessionsTable),
	emailVerifications: one(emailVerificationsTable, {
		fields: [usersTable.id],
		references: [emailVerificationsTable.userId],
	}),
}));
```

<!-- TOC --><a name="forgot-password-otp-code-verification-reset-password"></a>

## Forgot password, OTP code verification, Reset password

In addition to handling user authentication through access and refresh tokens, a robust authentication system must also provide mechanisms for users to recover access to their accounts. This is where the **Forgot Password** and **Password Reset** functionalities come into play. Let’s explore what these features entail and how they operate within the authentication flow.

<!-- TOC --><a name="what-is-it-1"></a>

### What is it?

The **Forgot Password** and **Password Reset** system allows users to securely reset their passwords in case they forget them. This system typically involves the following steps:

- **Forgot Password Request**: Users initiate the password recovery process by providing their registered email address.
- **OTP (One-Time Password) Verification**: To ensure the request is legitimate, the system sends a one-time password (OTP) to the user's email, which they must verify.
- **Password Reset**: Once the OTP is validated, users can set a new password for their account.

These steps help maintain the security and integrity of user accounts by ensuring that only the rightful owner can reset the password.

<!-- TOC --><a name="how-it-works-1"></a>

### How it works?

Implementing a secure password reset mechanism involves coordinated client-server interactions. Here’s an overview of the process:

1.  **Initiating Password Reset**:

    - The user navigates to the "Forgot Password" section and submits their registered email address.
    - The client sends a `POST` request to the `/forgotpassword` endpoint with the user's email.
    - The server generates a unique password reset token, stores a hashed version of it in the database, and sends the token to the user's email via the `MailerService`.

2.  **Verifying the OTP**:

    - Upon receiving the OTP in their email, the user enters it into the application.
    - The client sends a `POST` request to the `/verify-token` endpoint with the email and OTP.
    - The server validates the token by checking its existence, ensuring it hasn't expired, and verifying its correctness using the `HashingService`.
    - If the token is valid, the server responds with a success status, allowing the user to proceed to reset their password.

3.  **Resetting the Password**:
        - The user enters a new password and confirms it.
        - The client sends a `POST` request to the `/resetpassword/:token` endpoint, including the new password and the token in the URL.
        - The server verifies the token again to ensure it's still valid.
        - Upon successful verification, the server updates the user's password in the database using the `HashingService` to securely hash the new password.
        - The server also invalidates any existing user sessions to prevent unauthorized access.
    <!-- TOC --><a name="defining-routes-3"></a>

### Defining routes

As usual we'll put the other routes inside the `AuthController` since this also those topic are parts of the _bigger domain_ of the authentication.

```ts
// src/controllers/auth.controller.ts

// All the imports...

@injectable()
export class AuthController implements Controller {

 controller = new Hono<HonoTypes>();

 constructor(){
    @inject(AuthService) private readonly authService: AuthService,
    @inject(RefreshTokenService) private readonly refreshTokenService: RefreshTokenService,
    @inject(EmailVerificationsService) private readonly emailVerificationsService: EmailVerificationsService,
 }

 routes(){
     return this.controller
        // login, signup, refresh token and email verification routes...
	.post(
		"/forgotpassword",
		zValidator("json", passwordResetEmailDTO),
		limiter({ limit: 10, minutes: 60 }),
		async (context) => {
			const { email } = context.req.valid("json");
			await this.passwordResetService.createPasswordResetToken({
				email,
			});
			return context.json({ status: "success" });
		}
	)
	.post(
		"/verify-token",
		zValidator("json", passwordResetEmailVerificationDTO),
		limiter({ limit: 10, minutes: 60 }),
		async (context) => {
			const { email, token } = context.req.valid("json");
			await this.passwordResetService.validateToken(token, email);
			return context.json({ status: "success " });
		}
	)
	.post(
		"/resetpassword/:token",
		zValidator("json", passwordResetDTO),
		limiter({ limit: 10, minutes: 60 }),
		async (context) => {
			const body = context.req.valid("json");
			const token = context.req.param("token");
			await this.passwordResetService.resetPassword(token, body);
			return context.json({ status: "success" });
		}
	);
  }
}
```

The response I choose in this case are pretty basics, you can customize them as you want.

<!-- TOC --><a name="password-reset-dto"></a>

#### Password Reset DTO

This is the definitions of the DTOs for the password reset.

- For the `passwordResetEmailDTO` in the body of the request we just need the email that perform the request.
- in the `passwordResetEmailVerificationDTO` we need to pass both the email and the token, in this case the `OTP` code.
- lastly the `passwordResetDTO`is pretty much identical to the system used in the `singUpDTO` we just need to add the email.

Notice that in this case the client is passing the email at every request, this is due the fact that the server is not caching the email, but you can implement a system to do it if you want to avoid the client to pass the email at every request.

```ts
// src/dtos/password-reset.dto.ts

import { InferInsertModel } from "drizzle-orm";
import { z } from "zod";
import { passwordResetTable } from "../infrastructure/database/tables/password-reset.table";

export const passwordResetEmailDTO = z.object({
	email: z.string().email(),
});

export const passwordResetEmailVerificationDTO = z.object({
	email: z.string().email(),
	token: z.string().min(6).max(6),
});

export const passwordResetDTO = z
	.object({
		newPassword: z
			.string({ required_error: "required-password" })
			.min(8, "password-too-short")
			.max(32, "password-too-long"),
		confirmNewPassword: z
			.string({ required_error: "required-confirmation-password" })
			.min(8, "password-too-short")
			.max(32, "password-too-long"),
		email: z.string().email(),
	})
	.refine((data) => data.newPassword === data.confirmNewPassword, {
		message: "passwords-donot-match",
		path: ["passwordConfirmation"],
	});

export type ResetPasswordEmailDto = z.infer<typeof passwordResetEmailDTO>;
export type ResetEmailVerificationDTO = z.infer<
	typeof passwordResetEmailVerificationDTO
>;
export type ResetPasswordDto = z.infer<typeof passwordResetDTO>;
export type CreatePasswordResetRecord = Pick<
	InferInsertModel<typeof passwordResetTable>,
	"hashedToken" | "email" | "expiresAt"
>;
```

<!-- TOC --><a name="password-reset-service"></a>

### Password Reset Service

```ts
import { inject, injectable } from "tsyringe";
import { MailerService } from "./mailer.service";
import { HTTPException } from "hono/http-exception";
import { isWithinExpirationDate } from "oslo";
import { HashingService } from "./hashing.service";
import { TokensService } from "./token.service";
import { UsersRepository } from "../repositories/user.repository";
import { PasswordResetRepository } from "../repositories/password-reset.repository";
import { BadRequest, InternalError } from "../common/error";
import {
	ResetPasswordDTO,
	ResetPasswordEmailDTO,
} from "../dtos/password-reset.dto";

@injectable()
export class PasswordResetService {
	constructor(
		@inject(HashingService) private readonly hashingService: HashingService,
		@inject(TokensService) private readonly tokensService: TokensService,
		@inject(MailerService) private readonly mailerService: MailerService,
		@inject(UsersRepository) private readonly usersRepository: UsersRepository,
		@inject(PasswordResetRepository)
		private readonly passwordResetRepository: PasswordResetRepository
	) {}

	async validateToken(token: string, email: string) {
		try {
			const record = await this.passwordResetRepository.findValidRecordByEmail(
				email
			);

			if (!record || !isWithinExpirationDate(record?.expiresAt)) {
				throw BadRequest("invalid-or-expired-token");
			}

			const isValidToken = await this.hashingService.verify(
				record?.hashedToken,
				token
			);

			if (!isValidToken) {
				throw BadRequest("invalid-or-expired-token");
			}

			return { status: "success" };
		} catch (e) {
			if (e instanceof HTTPException) {
				throw e;
			}
			throw InternalError("error-veryfing-token");
		}
	}

	async resetPassword(token: string, data: ResetPasswordDTO) {
		try {
			const record = await this.passwordResetRepository.findValidRecordByEmail(
				data.email
			);
			if (!record || !isWithinExpirationDate(record?.expiresAt)) {
				throw BadRequest("invalid-or-expired-token");
			}

			const isValidToken = await this.hashingService.verify(
				record?.hashedToken,
				token
			);

			if (!isValidToken) {
				throw BadRequest("invalid-or-expired-token");
			}
			const user = await this.usersRepository.findOneByEmail(data.email);

			if (!user) {
				throw BadRequest("no-user-with-this-email");
			}

			if (data.newPassword !== data.confirmNewPassword) {
				throw BadRequest("password-donot-match");
			}

			await this.passwordResetRepository.deleteById(record.id);

			const hashedPassword = await this.hashingService.hash(data.newPassword);

			await this.usersRepository.update(user.id, {
				password: hashedPassword,
			});
		} catch (e) {
			if (e instanceof HTTPException) {
				throw e;
			}
			throw InternalError("error-resetting-password");
		}
	}

	async createPasswordResetToken(data: ResetPasswordEmailDTO) {
		try {
			// generate a token, expiry and hash
			const { token, expiry, hashedToken } =
				await this.tokensService.generateTokenWithExpiryAndHash({
					number: 6,
					time: 15,
					lifespan: "m",
					type: "NUMBER",
				});
			const user = await this.usersRepository.findOneByEmail(data.email);

			if (!user) {
				throw BadRequest("no-user-with-this-email");
			}
			//if there is an existing record delete it
			await this.findRecordAndDelete(user.id);
			// create a new email verification record
			await this.passwordResetRepository.create({
				email: user.email,
				hashedToken: hashedToken,
				expiresAt: expiry,
			});

			this.mailerService.sendResetPasswordOTP({
				to: user.email,
				props: {
					otp: token,
				},
			});
		} catch (e) {
			if (e instanceof HTTPException) {
				throw e;
			}
			throw InternalError("error-creating-password-reset-token");
		}
	}

	async findRecordAndDelete(email: string) {
		const existingRecord =
			await this.passwordResetRepository.findValidRecordByEmail(email);
		if (existingRecord) {
			await this.passwordResetRepository.deleteById(existingRecord.id);
		}
	}
}
```

<!-- TOC --><a name="password-reset-repository"></a>

### Password Reset Repository

```ts
import { inject, injectable } from "tsyringe";
import { and, eq, gte, lte, type InferInsertModel } from "drizzle-orm";
import type { Repository } from "../interfaces/repository.interface";
import { takeFirst, takeFirstOrThrow } from "../infrastructure/database/utils";
import { DatabaseProvider } from "../providers/database.provider";
import { passwordResetTable } from "../infrastructure/database/tables/password-reset.table";
import { CreatePasswordResetRecord } from "../dtos/password-reset.dto";

@injectable()
export class PasswordResetRepository implements Repository {
	constructor(
		@inject(DatabaseProvider) private readonly db: DatabaseProvider
	) {}

	async create(data: CreatePasswordResetRecord) {
		return this.db
			.insert(passwordResetTable)
			.values(data)
			.onConflictDoUpdate({
				target: passwordResetTable.email,
				set: data,
			})
			.returning()
			.then(takeFirstOrThrow);
	}

	async findValidRecordByEmail(email: string) {
		return this.db
			.select()
			.from(passwordResetTable)
			.where(
				and(
					eq(passwordResetTable.email, email),
					gte(passwordResetTable.expiresAt, new Date())
				)
			)
			.then(takeFirst);
	}

	async deleteById(id: string) {
		return this.db
			.delete(passwordResetTable)
			.where(eq(passwordResetTable.id, id));
	}

	trxHost(trx: DatabaseProvider) {
		return new PasswordResetRepository(trx);
	}
}
```

<!-- TOC --><a name="conclusion"></a>

## Conclusion

Building an authentication system with Hono and Drizzle is an essential step towards securing your web application while ensuring smooth user management. From implementing basic email/password authentication to advanced features like JWT-based authentication and password reset flows, this guide covered the key building blocks required for a robust authentication mechanism.

By following this guide, you’ve learned how to create a secure environment with the following functionalities:

- **User Registration**: Secure sign-up and validation of user data.
- **Login and Session Management**: Efficient handling of JWT access and refresh tokens.
- **Password Management**: Secure password storage and recovery options.
- **Email Verification**: Ensuring that users verify their emails before full access.
- **Forgot Password**: Giving users an easy way to reset their passwords through OTP-based verification.

All of this is achieved with well-defined routes, Zod validation, and database interactions using Drizzle ORM. The integration with Docker ensures a smooth development and production environment.

This architecture provides a clean, scalable solution that can be expanded further as your application grows.

<!-- TOC --><a name="what-do-to-now"></a>

### What do to now?

Now that you've set up the foundational authentication system, it's time to take the following steps to further enhance your application:

1.  **Security Features**:

- **Two-Factor Authentication (2FA)**:
  - **Authy**: A popular app for **TOTP-based 2FA** that you can integrate into your system for an additional security layer.
  - **Duo Security**: A comprehensive 2FA solution for web and mobile apps with enterprise-grade features.

1.  **User Experience**:

- **Social Logins**:
  - **Auth0**: A popular Identity-as-a-Service (IDaaS) provider that simplifies the integration of multiple social logins (Google, Facebook, GitHub, etc.) with easy-to-use SDKs.
  - **Okta**: A powerful identity provider offering social login, SSO (Single Sign-On), and multi-factor authentication (MFA) with easy integration.
- **Custom Email Templates**:
  - **SendGrid**: A robust email delivery service that offers customizable email templates and APIs to send transactional emails such as verification and password reset emails.
  - **Mailgun**: Provides an API for sending emails with advanced analytics and email template management.

3.  **Testing and Quality Assurance**:

- **Test Coverage**:
  - **SonarCloud**: A code quality and coverage analysis tool that integrates with your CI/CD pipeline and ensures your authentication system is thoroughly tested.

4. **Documentation**:

- **Swagger / OpenAPI**:
  - **SwaggerHub**: A platform for designing, documenting, and testing your REST APIs. It offers a comprehensive interface for documenting your authentication API, and it can generate client libraries for different languages.
  - **Redocly**: Another popular OpenAPI-based API documentation tool with a more modern UI for end-users.

5.  **Monitor and Maintain**:

- **Error Monitoring**:
  - **Sentry**: Provides **real-time error tracking** and performance monitoring, which can help you track down issues in your authentication routes (like invalid tokens or failed login attempts).
  - **Rollbar**: Another tool for tracking runtime errors and sending notifications for any unhandled exceptions or performance issues.
- **Logs and Monitoring**:
  - **Datadog**: Offers infrastructure monitoring, log management, and application performance monitoring (APM). You can track authentication issues, like slow login responses or downtime.
  - **Loggly**: A logging tool for aggregating, searching, and analyzing logs. It's useful for tracking authentication-related logs, such as failed login attempts or token generation events.

6.  **Scaling**:

- **Load Balancers**:
  - **AWS Elastic Load Balancing (ELB)**: Automatically distributes incoming application traffic across multiple instances, which helps scale the authentication system as your traffic increases.
  - **Nginx**: Can be used as a reverse proxy server for load balancing to distribute requests evenly across your application servers.

7.  **User Feedback and Monitoring**:

- **New Relic**: Provides full-stack observability, including user interaction and API monitoring. It helps you track how users interact with your authentication system and whether there are any bottlenecks.
- **Hotjar**: Allows you to understand user behavior through heatmaps and session recordings. It helps identify where users are getting stuck during login or registration, making it easier to improve the flow.

8.  **CI/CD Integration**:

- **GitHub Actions**: Can be used to automate testing, deployment, and continuous integration for your authentication system.
- **CircleCI**: Another CI/CD tool that allows you to automate your build, test, and deployment process for your authentication system.

By following these next steps, you can ensure your authentication system remains secure, user-friendly, and ready for scaling as your project grows. Keep iterating and improving based on feedback, and your users will have a secure and seamless experience.

<!-- TOC --><a name="resources"></a>

### Contributing

If you think you can add value to the project, please feel free to [submit a pull request](https://github.com/fres-sudo/hono-auth/pulls) or [open a issue](https://github.com/fres-sudo/hono-auth/issues).

### Resources

The reference of the resources used in this guide.

- **Architecture**: [Tofu Stack](https://github.com/Rykuno/TofuStack)
- **Framework** [HonoJs](https://hono.dev/)
- **ORM**: [DrizzleORM](https://orm.drizzle.team/)
- **Database**: [PostgreSQL](https://www.postgresql.org/docs/)
- **Authentication Reference** : [The Copenhagen Book](https://thecopenhagenbook.com/)
