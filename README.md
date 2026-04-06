# Azerbaijan GitHub Community Blog

Community-driven blog for the [Azerbaijan GitHub Community](https://github.com/Azerbaijan-Git-Community).

## How to contribute a blog post

1. **Fork** this repository
2. **Create a folder** in `posts/` with your post slug:
   - Use only lowercase letters, numbers, and hyphens (e.g., `my-awesome-post`)
   - The folder name becomes the URL: `/blog/my-awesome-post`
3. **Add `index.mdx`** with your content (see template below)
4. **Add a cover image** at `images/cover.png` inside your post folder
5. **Add any other images** to the same `images/` subfolder
6. **Open a pull request** targeting `main`

## Post template

```mdx
---
title: "Your Post Title"
description: "A short description of your post (shown in cards and meta tags)."
tags: [tag1, tag2, tag3]
---

Your MDX content here...
```

### Frontmatter fields

| Field | Required | Description |
|-------|----------|-------------|
| `title` | Yes | Post title |
| `description` | Yes | Short description for cards and SEO |
| `tags` | Yes | Array of tags (used for meta keywords) |
| `author` | Auto | **Do not set** — injected automatically by CI |

### Folder structure

```
posts/
  my-post-slug/
    index.mdx
    images/
      cover.png       # Required — used as the post's cover image
      diagram.png     # Optional additional images
```

## Rules

- **Folder names**: lowercase English letters, digits, and hyphens only (`^[a-z0-9]+(-[a-z0-9]+)*$`)
- **Cover image**: every post must have `images/cover.png`
- **Images**: max 1MB per image, max 5MB total per post. Allowed formats: `.png`, `.jpg`, `.jpeg`, `.webp`, `.gif`, `.svg`
- **Do not set `author`** in frontmatter — it is injected by the CI bot using your GitHub user ID
- **MDX features**: You can use standard Markdown, GitHub Flavored Markdown (tables, task lists), code blocks with syntax highlighting, and JSX

## How it works

1. You open a PR with your blog post
2. CI validates your post (folder name, frontmatter, image sizes, MDX syntax)
3. A maintainer reviews and approves your PR
4. The CI bot injects your GitHub user ID as `author` and auto-merges the PR
5. A webhook triggers the website to sync the new post
6. Your post appears on the blog within minutes!
