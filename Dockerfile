# Use Node.js as base image
FROM node:20-alpine as BUILD_IMAGE

# Set working directory in the container
WORKDIR /app

# Copy package.json and yarn.lock to container
COPY package*.json ./

# Install dependencies
RUN yarn install

# Copy the rest of the application files to container
COPY . .

# Expose port 5173   (or the port your DApp runs on)
EXPOSE 5173

# Command to run the DApp using yarn
CMD ["yarn", "run", "dev"]
