# Blog

This repository contains the source code for a blog built using [Hugo](https://gohugo.io/).

## Project Description
This project is a static site generated using Hugo. It is designed to be a simple and fast solution for creating and managing a blog.

## Technologies Used
- HTML
- Hugo (Static Site Generator)

## Adding a New Page in Hugo
To add a new page in Hugo, use the following command:
```
hugo new <section>/<page-name>.md
```
For example, to create a new blog post, you can run:
```
hugo new posts/my-new-post.md
```

## Generating HTML in Hugo
To generate the static HTML files from your Hugo site, use the following command:
```
hugo
```
This command will build your site and output the generated files to the `public` directory.

## Hugo Themes
For exploring different Hugo themes visit the [Hugo Templates Documentation](https://themes.gohugo.io/).

## Getting Started
1. Clone the repository
```
git clone https://github.com/Gupta-Aryaman/blog.git
cd blog
```
2. Install Hugo
Follow the instructions on the [Hugo Installation Guide](https://gohugo.io/installation/) to install Hugo on your machine.
3. Run the development server
```
hugo server
```
Open http://localhost:1313 with your browser to see the result.
