// server.js
const express = require('express');
const { Kafka } = require('kafkajs');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Configure Kafka
const kafka = new Kafka({
  clientId: 'welcome-email-service',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092']
});

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

// Email template function
const createWelcomeEmail = (userName) => ({
  subject: 'Welcome to Our Platform!',
  html: `
    <h1>Welcome ${userName}!</h1>
    <p>Thank you for joining our platform. We're excited to have you on board!</p>
    <p>If you have any questions, feel free to reach out to our support team.</p>
    <p>Best regards,<br>Your Platform Team</p>
  `
});

// Kafka consumer setup
const consumer = kafka.consumer({ groupId: 'welcome-email-group' });

const runConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: 'user-registration', fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        const userData = JSON.parse(message.value.toString());
        
        // Send welcome email
        await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: userData.email,
          ...createWelcomeEmail(userData.name)
        });

        console.log(`Welcome email sent to ${userData.email}`);
      } catch (error) {
        console.error('Error processing message:', error);
      }
    },
  });
};

// Start the Express server and Kafka consumer
app.listen(port, async () => {
  console.log(`Email service listening on port ${port}`);
  try {
    await runConsumer();
    console.log('Kafka consumer is running');
  } catch (error) {
    console.error('Failed to start Kafka consumer:', error);
  }
});

// Error handling
process.on('SIGTERM', async () => {
  try {
    await consumer.disconnect();
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
});