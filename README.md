# Glow API Backend

## Setup

To set up it requires you to set the environment variables first, as stated in the .env.example.

After that, you can run the following commands to set up the project:

```bash
docker-compose up --build -d
```

Now go to the minio url and login with the credentials which are set in the docker-compose file.
Then create an Access Key within the settings, copy the access key and secret and place it in your .env file.

After that you can run the front / backend together with the database and minio instance.

If the workstation is up & running you're able to use the application now.



