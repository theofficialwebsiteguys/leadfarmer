# Running the site locally

The site is two pieces: the Angular app and a PHP + MySQL backend. Angular alone
is not enough — without the backend you get this in the `ng serve` output:

```
[vite] http proxy error: /api/public/site
AggregateError [ECONNREFUSED]
```

That means Angular is running fine but nothing is listening on port 8000.

You do **not** need to install PHP or MySQL. Docker Desktop runs the same stack
the live server uses.

---

## First time (about 2 minutes)

**1. Start Docker Desktop** and wait for the whale icon to stop animating.

**2. Start the backend.** From the project folder:

```bash
npm run dev:api
```

First run pulls the PHP and MariaDB images and creates the database, loading
`api/database/schema.sql` and `api/database/seed.sql` automatically — so you
start with the real site content: 11 strains, 16 dispensaries, all page copy.

Check it worked:

```bash
curl http://localhost:8000/api/health
# {"ok":true,"data":{"status":"up","database":"connected"}}
```

**3. Create your dashboard login:**

```bash
npm run dev:create-admin
```

It prompts for a username and a password (minimum 12 characters). Use anything
you like — this database only exists on your machine.

**4. Start Angular** (in a second terminal):

```bash
npm start
```

Then open:

| URL | What it is |
|---|---|
| http://localhost:4200 | The public site |
| http://localhost:4200/admin | The dashboard — sign in with the account from step 3 |

---

## Every time after that

```bash
npm run dev:api     # start the backend (fast — images are cached)
npm start           # start Angular
```

When you are done:

```bash
npm run dev:api:stop
```

Your local content edits persist between restarts.

---

## Things you might want

| Command | What it does |
|---|---|
| `npm run dev:api:reset` | Wipe the local database and reload it from the seed. Use after changing `schema.sql` or `seed.sql`, or to get back to a clean site. |
| `npm run dev:api:logs` | Tail the PHP/Apache log — where PHP errors show up. |
| `npm run generate-seed` | Rebuild `seed.sql` from the TypeScript data files. |

Connect a database GUI (TablePlus, DBeaver, phpMyAdmin) with:

```
host: 127.0.0.1    port: 33061
user: leadfarmer   password: devpassword    database: leadfarmer
```

---

## What to try in the dashboard

1. **Strains** — edit one, reorder with the arrows, add a new one (it needs a
   main photo; upload any JPG/PNG). Reload http://localhost:4200 to see it live.
2. **Gallery** — reorder or remove a photo from the home page strip.
3. **Dispensaries** — add one, then look at the Story page: the big statistic
   counts it automatically.
4. **Settings** — set the merch store link, then check the Merch page button.
5. Start editing something and click away in the sidebar — it warns about
   unsaved changes.

---

## Troubleshooting

**`ECONNREFUSED` on /api/public/site**
The backend is not running. `npm run dev:api`, then check
`curl http://localhost:8000/api/health`.

The site still renders when this happens — that is deliberate. Angular falls
back to the content bundled in the build so a backend outage never blanks the
page. What you see is the *original* copy, not your edits, which is the clue
that the API is unreachable.

**`docker: command not found` / "daemon is not running"**
Start Docker Desktop and wait for it to finish starting.

**Port 8000 or 33061 already in use**
Change the left-hand number in `docker-compose.yml` (`"8000:80"` →
`"8001:80"`), and update the target in `proxy.conf.json` to match.

**Signed out of the dashboard immediately**
`session.secure` must be `false` in `docker/dev-config.php` — a Secure cookie is
dropped over plain `http://`. It ships correct; only an edit would break it.

**Changed something in `api/` and nothing happened**
PHP files are read per request, so changes are live immediately — just refresh.
Only `docker-compose.yml` or `docker/dev-config.php` changes need
`npm run dev:api:stop && npm run dev:api`.

---

## Production

Nothing here is deployed. `docker-compose.yml` and `docker/` are local-only; the
live site runs on Namecheap's Apache/PHP/MySQL. See
[ADMIN-SETUP.md](ADMIN-SETUP.md).
