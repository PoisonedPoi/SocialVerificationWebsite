#!/bin/bash

# FUNCTIONS
############################################################

Help()
{
   # Display Help
   echo "Compile RoVer and move binaries to useful locations"
   echo
   echo "Syntax: ./update-rover.sh [-h|l|s]"
   echo "Options:"
   echo
   echo "   h     Print this Help"
   echo "   l     Copy RoVer binaries to '/setup-resources/rover/main' for local testing"
   echo "   s     Copy RoVer binaries to '/srv/rover/main' for server access"
   echo

}

Local()
{
   # Compile RoVer if not already
   if [ "$COMPILED" = false ] ; then
      Main
      COMPILED=true
   fi

   # Copy RoVer binaries to local folder
   echo
   echo "Moving RoVer binaries to 'setup-resources/rover/main'"
   echo
   sudo cp checker2/Rover/bin -r setup-resources/rover/main/ 
}

Server()
{
   # Compile RoVer if not already
   if [ "$COMPILED" = false ] ; then
      Main
      COMPILED=true
   fi

   # Copy RoVer binaries to server accessable folder
   echo
   echo "Moving RoVer binaries to '/srv/rover/main'"
   echo
   sudo cp checker2/Rover/bin -r /srv/rover/main/
   sudo chown -R tomcat:tomcat /srv/rover/main
}

Main()
{
   # Compile RoVer
   echo
   echo "Compiling RoVer"
   echo

   cd checker2/Rover/
   ./RoverC.sh 
   cd ../../
}

# MAIN PROGRAM
#############################################3

COMPILED=false

while getopts ":hls" option; do
   case $option in
      h) # display Help
         Help
         exit;;
      l) # Call Local
         Local
         ;;
      s) # Call Server
         Server
         ;;
     \?) # Invalid option
         echo "Error: Invalid option"
         echo
         Help
         exit;;
   esac
done


# Compile RoVer if not already
if [ "$COMPILED" = false ] ; then
   echo
   echo "No arguments provided, just compiling RoVer"
   echo

   Main
fi

unset COMPILED