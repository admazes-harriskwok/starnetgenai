# Base image
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package files from the client directory
COPY client/package*.json ./

# Install dependencies
RUN npm install

# Copy all files from the client directory
COPY client/ .

# Build the Next.js application
# Note: Next.js build requires environment variables if they are used at build time
# But for now, we'll proceed with the standard build.
RUN npm run build

# Expose the port Next.js runs on
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Start the application
CMD ["npm", "start"]
