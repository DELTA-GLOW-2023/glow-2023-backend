# Glow API Backend

## Setup

To set up the project, run:

```bash
docker-compose up --build -d
```

Then, access minio using the credentials in the docker-compose file and generate a new access key and secret. Also, make
sure that the "images" bucket has its access policy set to "public" in the minio web UI.

Then, add the following to the docker-compose file:

* Enter the Stable Diffusion Web API URL
* Enter the minio endpoint and port
* Enter the public minio endpoint and port
* Enter the minio access key and secret that you generated above

After that you can run the front / backend together with the database and minio instance.

If the workstation is up & running you're able to use the application now.

### Convert Images to video

If you have a bunch of images saved in your minio instance, you can convert them to a video using the following command:

```bash
npx ts-node src/service/saveImagesToFileSystemService.ts
```