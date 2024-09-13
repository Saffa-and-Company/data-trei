# AWS Setup for Data Trei

To integrate AWS CloudWatch logs with Data Trei, follow these steps:

1. **Create an IAM Role:**
   - Go to the AWS IAM console
   - Create a new role
   - Choose "Another AWS account" as the trusted entity
   - Enter the Data Trei AWS account ID (contact support for this)
   - Add the following permissions to the role:
     - CloudWatchLogsReadOnlyAccess
     - AWSLambdaReadOnlyAccess (if using Lambda)

2. **Configure Data Trei:**
   - Log in to your Data Trei dashboard
   - Navigate to "AWS Integration"
   - Enter the ARN of the IAM role you created
   - Click "Connect AWS"

3. **Select Log Groups:**
   - Once connected, you can select the log groups you want to monitor
   - Typically, these will be in the format `/aws/lambda/your-function-name`

4. **View Logs:**
   - After setup, you can view your AWS CloudWatch logs directly in the Data Trei dashboard

Note: Ensure that your AWS account has the necessary permissions to create IAM roles and access CloudWatch logs.

For any issues or questions, please contact Data Trei support.
