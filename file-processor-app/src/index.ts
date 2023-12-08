import { GetObjectCommand, GetObjectCommandInput, S3Client } from "@aws-sdk/client-s3";
import { Context, S3Event } from "aws-lambda";
import * as os from "node:os";

const s3Client = new S3Client({ });

export const handlerFunc = async (event: S3Event, context: Context): Promise<void> => {
    console.info('Event -', event);
    console.info('Context - ', context);

    const bucketName = event.Records[0].s3.bucket.name;
    const key = event.Records[0].s3.object.key;

    const params: GetObjectCommandInput = {
        Bucket: bucketName,
        Key: key,
    };
    const inputCommand= new GetObjectCommand(params);

    const response = await s3Client.send(inputCommand);
    const body = await response.Body?.transformToString();
    if (body) {
        await processFile(body);
    }

    console.info('File processed -', key);
}

const processFile = async (body: string): Promise<void> => {
    const lines = body.split(os.EOL);
    for (const line of lines) {
        console.info('Line -', line);
    }
}
