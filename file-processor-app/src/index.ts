import { GetObjectCommand, GetObjectCommandInput, S3Client } from "@aws-sdk/client-s3";
import { DynamoDBClient, PutItemCommand, PutItemCommandOutput, PutItemInput } from "@aws-sdk/client-dynamodb";
import { Context, S3Event } from "aws-lambda";
import * as os from "node:os";
import { Customer } from "./customer";

const s3Client = new S3Client({ });
const dynamodbClient = new DynamoDBClient({ });

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
};

const processFile = async (body: string): Promise<void> => {
    const lines = body.split(os.EOL);
    for (const line of lines) {
        try {
            const customer: Customer | null = await extractFields(line);
            if (customer) {
                await persistRecord(customer);
            }
        } catch(error) {
            console.error('Error parsing customer data', error);
        }
    }
};

export const extractFields = async (line: string): Promise<Customer | null> => {
    const startIndexOfSecondField = line.indexOf(",") + 1;
    let fields = [];
    let fieldData = '';

    for (let i = startIndexOfSecondField; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"' && fieldData === '') {
            fieldData+=ch;
            i++;
            while (line[i] !== '"') {
                fieldData+=line[i];
                i++;
            }
            fieldData+=line[i];
            fields.push(fieldData);
            fieldData = '';
            continue;
        }
        if (ch !== ',') {
            fieldData+=ch;
            continue;
        }
        if (ch === ',' && fieldData !== '') {
            fields.push(fieldData);
            fieldData = '';
        }
    }
    
    if (fields.length != 11) {
        console.error('Received line with incorrect set of fields', line);
        return null;
    }
    const customer: Customer = {
        id: fields[0],
        firstName: fields[1],
        lastName: fields[2],
        company: fields[3],
        city: fields[4],
        country: fields[5],
        phone1: fields[6],
        phone2: fields[7],
        email: fields[8],
        subscriptionDate: fields[9],
        website: fields[10]
    };
    return customer;
}

const persistRecord = async (item: Customer): Promise<boolean> => {
    const input: PutItemInput = {
        TableName: process.env.TABLE_NAME,
        Item: {
            'id': {
                S: item.id
            },
            'firstName': {
                S: item.firstName
            },
            'lastName': {
                S: item.lastName
            },
            'company': {
                S: item.company
            },
            'city': {
                S: item.city
            },
            'country': {
                S: item.country
            },
            'phone1': {
                S: item.phone1
            },
            'phone2': {
                S: item.phone2
            },
            'email': {
                S: item.email
            },
            'subscriptionDate': {
                S: item.subscriptionDate
            },
            'website': {
                S: item.website
            }
        }
    };
    const command: PutItemCommand = new PutItemCommand(input);
    const response: PutItemCommandOutput = await dynamodbClient.send(command);
    if (response.$metadata.httpStatusCode !== 200) {
        console.error('Error saving record to db', response.$metadata);
        return false;
    }
    return true;
};
