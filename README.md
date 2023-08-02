# HimQuarterz Bible App

A Bible reading app built with React, Redux, and the Scripture API. This app provides users with the ability to read various versions of the Bible in different languages. It offers features like choosing different chapters and verses with a light or dark theme.

## Technologies Used

- **React:** A JavaScript library for building user interfaces.
- **React Router:** A collection of navigational components for React apps.
- **Redux:** A predictable state container for JavaScript apps.
- **Axios:** Promise-based HTTP client for the browser and Node.js.
- **Scripture API:** An API providing access to various versions of the Bible.

## Approach Taken

This app uses Redux for state management, with different slices of state for the theme, verses, chapters, and other relevant parts of the app. Routing is done using React Router, with parameters used to indicate the version, book, and chapter of the Bible currently being viewed.

The Scripture API is accessed using axios, with the data stored in Redux state and then displayed on the screen.

## [Live Site](https://64c9e4ada3ecda60c8779e56--sweet-blancmange-a0c993.netlify.app/)

Here is the link to the live site. Note that the site may not be accessible if the server is down or the link has changed.

## Usage Instructions

To use this app, navigate to the live site, select a version of the Bible, then select a book, and finally select a chapter to read.

## Unsolved Problems

Currently, there are no unsolved problems in this project. However, future enhancements might include adding more interactive features, improving the UI/UX design, and integrating more versions of the Bible.
