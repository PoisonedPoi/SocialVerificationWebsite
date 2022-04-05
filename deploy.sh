#updates most recent copy of the checker to the src/rover/lib/bin (which is used in the hardcoded path in checker2/Rover/runRover.sh)

#then make war file out of website and send it to /opt/tomcat/webapps where it will be automatically deployed by tomcat
#NOTE, this assumes tomcat is running using the user tomcat, this should not be performed as root
cd website
jar cvf SocialVerificationWebsite.war .
sudo -u tomcat cp SocialVerificationWebsite.war /opt/tomcat/webapps
mv SocialVerificationWebsite.war ../
