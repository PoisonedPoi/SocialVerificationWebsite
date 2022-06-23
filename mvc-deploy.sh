#updates most recent copy of the checker to the src/rover/main/bin (which is used in the hardcoded path in checker2/Rover/runRover.sh)
#sudo -u tomcat cp checker2/Rover/bin -r /srv/rover/main

# make war file out of websit
./mvnw package

# copy war file on to tomcat server
sudo -u tomcat cp target/SocialVerificationWebsite.war /opt/tomcat/webapps
