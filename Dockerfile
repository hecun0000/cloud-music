FROM nginx:latest
ADD ./build /var/www/html/build
ADD ./conf.d /etc/nginx/conf.d
EXPOSE 80