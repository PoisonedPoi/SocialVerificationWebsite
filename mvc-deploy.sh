#!/bin/bash

# FUNCTIONS
############################################################
Help()
{
   # Display Help
   echo "Compile the project and deploy to tomcat"
   echo
   echo "Syntax: mvc-deploy.sh [-h|s|r]"
   echo "options:"
   echo "h     Print this Help"
   echo "s     Start the tomcat server on port 8080"
   echo "r     Restart the tomcat server on port 8080"
   echo
}

Start()
{
    # Start the tomcat server for the first time
    echo "Start tomcat"
    sudo -u tomcat /./opt/tomcat/bin/startup.sh
}

Restart()
{
    # Restart the tomcat server
    echo
    echo "Restart tomcat"
    echo
    sudo -u tomcat /./opt/tomcat/restart.sh
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

# Handle help
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
         exit;;
   esac
done

echo
echo "No arguments provided, just compiling project"
echo

Main
