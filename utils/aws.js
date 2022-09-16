import aws from "aws-sdk";

import * as dotenv from "dotenv";
import { extname } from "path";

dotenv.config();
aws.config.update({
  secretAccessKey: process.env.Secret_Access_Key,
  accessKeyId: process.env.Access_Key_ID,
  region: "us-east-1",
});
const s3 = new aws.S3();
const sqs = new aws.SQS();
const sns = new aws.SNS();

export const uploadtos3 = async (buffer, filename, imageType = null) => {
  try {
    let filetype;
    let ext = extname(filename);
    if (ext == ".jpg" || ext == ".jpeg" || ext == ".png" || ext == ".PNG") {
      filetype = "image";
    } else {
      filetype = "video";
    }
    let params = {
      //   ACL: "public-read",
      Bucket: process.env.BUCKET_NAME,
      Body: buffer,
      Key: `${Date.now()}${filename}`,
    };
    let response = await s3.upload(params).promise();
    if (!response.Location) {
      return `${filename} could not be uploaded`;
    }
    const r = {
      url: response.Location,
      type: filetype,
      imageType,
    };
    console.log(r);
    return r;
  } catch (err) {
    console.log(err);
  }
};
export const publishSns = async (msg) => {
  var params = {
    Subject: "testing",
    Message: JSON.stringify(msg), // MESSAGE_TEXT
    TopicArn: process.env.snstopic, //TOPIC_ARN
  };
  const data = await sns.publish(params).promise();
  console.log(data);
};
export const sendToQueue = async (body) => {
  await sqs
    .sendMessage({
      MessageGroupId: "newsFeed",
      MessageDeduplicationId: body.slug,

      MessageBody: JSON.stringify(body),
      QueueUrl: process.env.QUEUE,
    })
    .promise();
};
