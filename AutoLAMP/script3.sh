#!/bin/bash
echo "Introduzca en nombre para el usuario"
read username
echo "Introduzca la contraseña para el usuario"
read userpass
sudo docker exec autolamp  mysql -uroot -e "CREATE USER '$username'@'localhost' IDENTIFIED BY '$userpass';"
sudo docker exec autolamp  mysql -uroot -e "GRANT ALL PRIVILEGES ON *.* TO '$username'@'localhost';"
echo "Introduzca en nombre para la base de datos"
read bdname
sudo docker exec autolamp  mysql -uroot -e "create database $bdname"
echo "Introduzca en nombre de la tabla"
read tlname
echo "Introduzca en nombre de la variable 1"
read var1
echo "Introduzca en nombre de la variable 2"
read var2
echo "Introduzca en nombre de la variable 3"
read var3
sudo docker exec autolamp  mysql -uroot -e "use $bdname; CREATE TABLE $tlname ("id" int(11) PRIMARY KEY NOT NULL AUTO_INCREMENT,  $var1 varchar(70) COLLATE utf8mb4_spanish_ci NOT NULL,  $var2 varchar(70) COLLATE utf8mb4_spanish_ci NOT NULL, $var3 varchar(70) COLLATE utf8mb4_spanish_ci NOT NULL,  "fecha" datetime NOT NULL DEFAULT CURRENT_TIMESTAMP);"
echo "############################################"
echo "El nombre para el usuario es: $username"
echo "La contraseña para el usuario es: $userpass"
echo "El nombre para la base de datos es: $bdname"
echo "El nombre para la tabla es: $tlname"
echo "El nombre de la variable 1 es : $var1"
echo "El nombre de la variable 2 es : $var2"
echo "El nombre de la variable 2 es : $var3"
echo "Puede entrar a PHPMYADMIN para ver la estructura y canmbiar la configuracion de la base de datos desde el siguiente enlace: http://localhost/phpmyadmin/"
