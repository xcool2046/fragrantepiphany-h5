FROM nginx:alpine

# Copy the pre-built assets from the local dist folder
# This requires running `npm run build` locally before building the image
COPY dist /var/www/html

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
