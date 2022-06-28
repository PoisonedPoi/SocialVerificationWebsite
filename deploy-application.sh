#!/bin/bash

# FUNCTIONS
############################################################

Help()
{
   # Display Help
   echo "Compile the spring application and deploy to tomcat"
   echo "This does not compile and setup RoVer (the model checker)"
   echo "Refer to update-rover.sh for compiling RoVer"
   echo
   echo "Syntax: ./deploy-application.sh [-h|s|r]"
   echo
   echo "Options:"
   echo "   h     Print this Help"
   echo "   s     Start the tomcat server on port 8080"
   echo "   r     Restart the tomcat server on port 8080"
   echo
}

Start()
{
   # Start the tomcat server for the first time
   echo
   echo "Start tomcat"
   echo
   sudo -u tomcat /./opt/tomcat/bin/startup.sh
}

Restart()
{
   # Restart the tomcat server
   echo
   echo "Restart tomcat"
   echo
   sudo -u tomcat /./opt/tomcat/bin/shutdown.sh
   sudo -u tomcat /./opt/tomcat/bin/startup.sh
}

Main()
{
   echo
   echo "Clean target directory"
   echo
   ./mvnw clean

   # make war file out of website
   echo
   echo "Package website"
   echo
   ./mvnw package

   # copy war file on to tomcat server
   echo
   echo "Move war file to tomcat"
   echo
   sudo -u tomcat cp target/SocialVerificationWebsite.war /opt/tomcat/webapps
}

# MAIN PROGRAM
#############################################3

while getopts ":hsr" option; do
   case $option in
      h) # display Help
         Help
         exit;;
      s) # Call Start
         Main
         Start
         exit;;
      r) # Call Restart
         Main
         Restart
         exit;;
     \?) # Invalid option
         echo "Error: Invalid option"
         echo
         Help
         exit;;
   esac
done

echo
echo "No arguments provided, just compiling application"
echo

Main