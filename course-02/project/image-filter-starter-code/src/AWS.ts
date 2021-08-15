import AWS = require('aws-sdk');
import { config } from './config/config';
import * as fs from 'fs';
import * as path from 'path';

const c = config;
const signedUrlExpireSeconds = 60 * 5

if (c.aws_profile !== "DEPLOYED") {
    var credentials = new AWS.SharedIniFileCredentials({ profile: 'default' });
    AWS.config.credentials = credentials;
}

export const s3 = new AWS.S3({
    signatureVersion: 'v4',
    region: c.aws_region,
    params: { Bucket: c.aws_media_bucket }
});

export async function saveToS3(filePath: string) : Promise<string> {
    const fileName = path.basename(filePath);
    const fileStream = fs.createReadStream(filePath);
    var uploadParams: AWS.S3.Types.PutObjectRequest = { Bucket: c.aws_media_bucket, Key: fileName, Body: fileStream };
    return s3.upload(uploadParams, (err: Error, data: AWS.S3.ManagedUpload.SendData) => {
        if (!err) {
            console.log("Upload Successful");
            console.log(data);
            return data.Key;
        } else {
            console.log(err);
        }
    }).promise().then(data => data.Key);
}

export function getGetSignedUrl(key: string): string {
    const url = s3.getSignedUrl('getObject', {
        Bucket: c.aws_media_bucket,
        Key: key,
        Expires: signedUrlExpireSeconds
    });
    return url;
}
