#compile then upload


cd checker2/Rover
./RoverC.sh
cd bin
jar cvf rover.jar .
#mv rover.jar ../../../website/WEB-INF/lib
sudo mv rover.jar /root/eclipse-workspace/rover-web-app/src/main/webapp/WEB-INF/lib/

#cd ../../../website
#sudo jar cvf SocialVerificationWebsite.war .
#sudo mv SocialVerificationWebsite.war /opt/tomcat/webapps


#javac -cp lib/servlet-api.jar webapps/SocialVerificationWebsite/WEB-INF/src/CheckerServlet.java -d webapps/SocialVerificationWebsite/WEB-INF/classes/
