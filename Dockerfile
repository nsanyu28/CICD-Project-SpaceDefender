# Lightweight Nginx server for the VoltRide static website
FROM nginx:alpine

COPY index.html /usr/share/nginx/html/index.html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
