# Database Setup

This directory contains database setup instructions and data dumps for the Online Story App.

## MongoDB Setup

The application uses MongoDB as its database. Follow these steps to set up MongoDB:

1. Install MongoDB Community Edition from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
2. Create a data directory at `F:\data\db` (or update the connection string in the application)
3. Start MongoDB server using `mongod` command
4. Import the data dumps using the instructions below

## Data Dumps

The `mongodb` directory contains data dumps that can be imported into MongoDB using the `mongorestore` command:

```bash
# Navigate to the project root
cd /path/to/online-story-app

# Import the data dumps
mongorestore --db online-story-app database/mongodb/dump
```

## Database Structure

The database contains the following collections:

- `users`: User accounts and authentication information
- `stories`: Story metadata and content information
- `chapters`: Chapter content and metadata
- `genres`: Genre categories
- `comments`: User comments on stories
- `ratings`: User ratings for stories

## Connection String

The application connects to MongoDB using the following connection string:

```
mongodb://localhost:27017/online-story-app
```

You can modify this in the `.env` file or in `backend/src/config/database.js` if needed.
