#NOTE process assumes you have a user named tomcat and tomcat is installed in /opt/tomcat *no version id, it is as written* and is owned by the usertomcat


#move rover resources from /setup-resources to /srv/rover  
#(Note: website uses a subprocess which should should run from and use resources from srv/rover (as srv is proper place for server flies like these))
sudo cp setup-resources/rover/ -r /srv/  #copy the rover resources to srv/rover, but this leaves it owned by root so the next command fixes this
sudo chown -R tomcat:tomcat /srv/rover #set owner to tomcat

#make prism, requires java/javac version 8 and make, gcc, g++, libcanberra-gtk-module  (sudo apt install these)
sudo -u tomcat cd 
ls
sudo -u tomcat make -C /srv/rover/main/prism-library/prism
sudo -u tomcat make -C /srv/rover/main/prism-library/prism binary
sudo -u tomcat /srv/rover/main/prism-library/prism/install.sh


#make war file from website and move it to /opt/tomcat/webapps where it will be deployed
./deploy.sh

