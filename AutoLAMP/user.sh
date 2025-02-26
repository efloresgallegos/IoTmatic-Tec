#!/bin/bash
echo "Introduzca en nombre para el usuario"
read username
echo "Introduzca la contraseña para el usuario"
read userpass
sudo docker exec autolamp  mysql -uroot -e "CREATE USER '$username'@'%' IDENTIFIED BY '$userpass';"
sudo docker exec autolamp  mysql -uroot -e "GRANT ALL PRIVILEGES ON *.* TO '$username'@'localhost';"
echo "############################################"
echo "El nombre para el usuario es: $username"
echo "La contraseña para el usuario es: $userpass"
echo "Puede entrar a PHPMYADMIN para ver la estructura y canmbiar la configuracion de la base de datos desde el siguiente enlace: http://localhost/phpmyadmin/"
