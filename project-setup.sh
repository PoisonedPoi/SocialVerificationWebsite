# NOTE
# This process assumes you have a user named tomcat
# tomcat is installed in '/opt/tomcat/' -- *no version id, it is as written*
# and is owned by the user 'tomcat' 
# whose home directory is '/opt/tomcat/' 

# Remove resources if they already exist
echo
echo "Remove existing resources in '/srv/rover'"
echo
sudo rm -rf /srv/rover

# Compile RoVer locally for transport in next step
echo
echo "Compile RoVer to local folder"
echo
./update-rover.sh -l

# move rover resources from /setup-resources to /srv/rover  
# (Note: website uses a subprocess which should should run from and use resources from srv/rover (as srv is proper place for server flies like these))
echo
echo "Copy local RoVer to server folder"
echo
sudo cp setup-resources/rover/ -r /srv/  #copy the rover resources to srv/rover, but this leaves it owned by root so the next command fixes this Note: if you made change to rover source code update the bin folder in rover/main/
sudo chown -R tomcat:tomcat /srv/rover #set owner to tomcat

#make prism, requires java/javac version 8 and make, gcc, g++, libcanberra-gtk-module  (sudo apt install these)
echo
echo "Compile prism on server"
echo
sudo -u tomcat make -C /srv/rover/main/prism-library/prism
sudo -u tomcat make -C /srv/rover/main/prism-library/prism binary
sudo -u tomcat /srv/rover/main/prism-library/prism/install.sh

# Deploy application to server and start tomcat
echo
echo "Deploy application and start tomcat"
echo
./deploy-application.sh -s

