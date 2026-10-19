# Use a lightweight Nginx web server
FROM nginx:alpine

# Copy the game into Nginx's default web directory
COPY index.html /usr/share/nginx/html/index.html

# The container listens on port 80
EXPOSE 80

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]

