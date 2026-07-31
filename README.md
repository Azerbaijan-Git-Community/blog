<img src="https://github.com/Azerbaijan-Git-Community/.github/blob/main/profile/agc-logo.png" align="left" width="200"/>

### `Azerbaijan Github Community Blog`

Community-driven blog for the [Azerbaijan GitHub Community](https://github.com/Azerbaijan-Git-Community).

<a href="https://githubcommunity.az/">Website</a> ·
<a href="https://www.linkedin.com/company/github-azerbaijan/">Linkedin</a> ·
<a href="https://t.me/github_azerbaijan">Telegram</a> ·
<a href="https://www.instagram.com/azerbaijan_github_community/">Instagram</a>

<br clear="left"/>

---

> **Example:** See [`posts/hello-world/`](./posts/hello-world/) for a complete working post you can use as a reference.

## Before you start

You must have signed up on the [Azerbaijan GitHub Community website](https://azgithub.community) with your GitHub account before submitting a post. CI will reject your PR if your account is not registered.

## Quickstart

```bash
pnpm install
pnpm create-post
```

This interactive command will ask for your GitHub username (fetches your ID automatically), post slug, title, description, and tags — then scaffold the folder structure for you.

## Contributing manually

> **Note:** We recommend using `pnpm create-post` instead — it handles all of this automatically.

1. **Fork** this repository
2. **Create a folder** in `posts/` with your post slug:
   - Lowercase letters, numbers, and hyphens only (e.g. `my-awesome-post`)
   - The folder name becomes the URL: `/blog/my-awesome-post`
3. **Add `index.mdx`** with your content (see template below)
4. **Add a cover image** at `images/cover.{png,jpg,jpeg,webp,svg}` inside your post folder
5. **Open a pull request** targeting `main`

## Post template

```mdx
---
title: "Your Post Title"
description: "A short description of your post (shown in cards and meta tags)."
tags: [tag1, tag2, tag3]
author: 123456789
---

Your MDX content here...
```

### Getting your GitHub ID

Don't know your numeric GitHub ID? Run:

```bash
pnpm get-github-id <your-github-username>
```

### Frontmatter fields

| Field         | Required | Description                                            |
| ------------- | -------- | ------------------------------------------------------ |
| `title`       | Yes      | Post title                                             |
| `description` | Yes      | Short description for cards and SEO                    |
| `tags`        | Yes      | Array of tags (e.g. `[typescript, nextjs, tutorial]`)  |
| `author`      | Yes      | Your numeric GitHub user ID (run `pnpm get-github-id`) |

### Folder structure

```
posts/
  my-post-slug/
    index.mdx
    images/
      cover.png         # Required — used as the post cover image
      diagram.png       # Optional additional images
```

### Images in content

Use **relative paths** for images stored in your `images/` folder:

```mdx
![My diagram](./images/diagram.png)
```

Or **external URLs** for images hosted elsewhere:

```mdx
![My diagram](https://example.com/diagram.png)
```

All content images are automatically centered and rendered below the surrounding paragraph.

## Rules

- **Folder names**: lowercase letters, digits, and hyphens only (`^[a-z0-9]+(-[a-z0-9]+)*$`)
- **Cover image**: every post must have `images/cover.{png,jpg,jpeg,webp,svg}`
- **Images**: max 1 MB per image, max 5 MB total per post. Allowed formats: `.png`, `.jpg`, `.jpeg`, `.webp`, `.gif`, `.svg`
- **`author`**: must be your numeric GitHub user ID — CI verifies it matches the PR opener
- **Website registration**: you must have signed up on the website before your PR can be merged

## Validate locally

Before opening a PR, run the checks to catch any issues:

```bash
pnpm check
```

This runs the same checks as CI (formatting and post validation). It validates only your
locally changed posts (staged, unstaged, and untracked).

## How it works

1. You open a PR with your blog post
2. CI validates folder name, frontmatter fields, author ID, cover image, and image sizes
3. CI checks that your GitHub account is registered on the website
4. A maintainer reviews and approves your PR
5. Once merged, a webhook triggers the website to sync the new post
6. Your post appears on the blog within minutes
