#hard coded paths (renember to update runRover.jar)



#compile rover

#compile servlet

#move to tomcat dir
cd website 
jar cvf SocialVerificationWebsite.war .
sudo -u tomcat cp SocialVerificationWebsite.war /opt/tomcat/webapps


#javac -cp lib/servlet-api.jar webapps/SocialVerificationWebsite/WEB-INF/src/CheckerServlet.java -d webapps/SocialVerificationWebsite/WEB-INF/classes/
