# file-processor-lambda
AWS Lambda function that reads data (.csv file) from a configured S3 bucket and stores into Dynamodb table. Infrastructure provisioning is setup using AWS CDK.

---
### Prerequisites
1. npm
2. aws cli
3. aws cdk
4. sam cli (Optional)
5. Docker Desktop

### Setup instructions
1. Install dependencies from root directory from the location of `package.json`
    ```cmd
    npm i
    ```

2. Change current directory to `file-processor-infra`.Build the project using AWS CDK CLI. This will create the AWS cloud formation template in `file-processor-infra/cdk.out` folder
    ```cdk
    cdk synth
    ```

3. Deploy the stack using AWS CDK.
    ```cmd
    cdk deploy
    ```

4. Once the above command is successful, copy the test `.csv` file to the bucket by running below command. The `testdata.csv` is located at `file-processor-app/test/testdata.csv`
    ```cmd
    aws s3 cp testdata.csv s3://csv-input-data-bucket/testdata.csv
    ```

5. 