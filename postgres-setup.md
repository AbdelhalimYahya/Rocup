# Local PostgreSQL Setup Guide

Follow these steps carefully to install and configure PostgreSQL on your local machine.

## Step 1: Download PostgreSQL
1. Go to the official PostgreSQL download page: [https://www.postgresql.org/download/](https://www.postgresql.org/download/)
2. Select your operating system (Windows).
3. Click on the "Download the installer" link.
4. Download the latest version of PostgreSQL for your system architecture.

## Step 2: Install PostgreSQL
1. Run the downloaded installer.
2. Follow the setup wizard.
3. **Installation Directory**: You can leave it as default.
4. **Components**: Keep all components selected (PostgreSQL Server, pgAdmin 4, Stack Builder, Command Line Tools).
5. **Data Directory**: Leave it as default.
6. **Password**: Choose a strong password for the default `postgres` superuser. **Make sure to remember this password**! You will need it to connect to the database. (If you use `your_password`, it matches the current `.env` file).
7. **Port**: Leave the default port `5432`.
8. **Advanced Options**: Leave the default locale.
9. Click "Next" until the installation begins.
10. Once finished, you can uncheck "Stack Builder" and click Finish.

## Step 3: Verify Installation (pgAdmin)
1. Open the start menu and search for **pgAdmin 4**.
2. Open pgAdmin 4. It might open in a web browser or as a desktop application.
3. In the left sidebar, under "Servers", expand "PostgreSQL [version]".
4. It will prompt you for the password you set during installation. Enter it and save it.
5. If it connects successfully, PostgreSQL is up and running!

## Step 4: Configure the Application Database

We need to create the database and tables for the `rocup` application.

### Option A: Using pgAdmin 4 (GUI)
1. In pgAdmin, right-click on "Databases" and select **Create > Database**.
2. Name the database **`rocup`** and click Save.
3. Expand the newly created `rocup` database.
4. Right-click on `rocup` and select **Query Tool**.
5. Copy the SQL code from `backend/database.sql`:

```sql
CREATE TABLE applications (
    id SERIAL PRIMARY KEY,
    team_name VARCHAR(255) NOT NULL,
    num_members INT NOT NULL,
    department VARCHAR(255),
    leader_name VARCHAR(255) NOT NULL,
    leader_phone VARCHAR(50) NOT NULL,
    leader_national_id VARCHAR(50) NOT NULL,
    leader_email VARCHAR(255) NOT NULL,
    members JSONB,
    receipt_url VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
6. Paste it into the Query Tool and click the "Execute" button (or press F5). The table is now created.

### Option B: Using SQL Shell (psql)
1. Open the Start menu and search for **SQL Shell (psql)**.
2. Press Enter to accept the default Server, Database, Port, and Username.
3. Type the password you set during installation.
4. Run the following command to create the database:
   ```sql
   CREATE DATABASE rocup;
   ```
5. Connect to the new database:
   ```sql
   \c rocup
   ```
6. Paste the table creation script:
   ```sql
   CREATE TABLE applications (
       id SERIAL PRIMARY KEY,
       team_name VARCHAR(255) NOT NULL,
       num_members INT NOT NULL,
       department VARCHAR(255),
       leader_name VARCHAR(255) NOT NULL,
       leader_phone VARCHAR(50) NOT NULL,
       leader_national_id VARCHAR(50) NOT NULL,
       leader_email VARCHAR(255) NOT NULL,
       members JSONB,
       receipt_url VARCHAR(255),
       status VARCHAR(50) DEFAULT 'pending',
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

## Step 5: Update Environment Variables
Ensure the `backend/.env` file matches your local PostgreSQL credentials:

```env
PORT=5000
DB_USER=postgres
DB_PASSWORD=your_password  # REPLACE with the password you set during installation
DB_HOST=localhost
DB_PORT=5432
DB_NAME=rocup
```

## Step 6: Start the Backend Server
1. Open a terminal in the `backend` folder.
2. Make sure you installed dependencies (`npm install`).
3. Start the server:
   ```bash
   npm run dev
   ```
4. You should see `Server is running on port 5000`.
