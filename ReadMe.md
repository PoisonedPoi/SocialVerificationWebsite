Installation Instructions

Installing rover on a server

First, ssh into server or run this locally,

D:\school\capstone\certs> ssh -i .\rover.pem ubuntu@138.49.185.129

--installation on blank ubuntu 20 server instance (did work on ubuntu 16 as lowest verison tested and was successfuly deployed using these instructions on eucalytpus ubuntu 20)
(install tomcat) (useful link)https://computingforgeeks.com/install-apache-tomcat-on-ubuntu-linux/#:~:text=%20Install%20Apache%20Tomcat%2010%20on%20Ubuntu%2020.04%7C18.04,Apache%20Tomcat%2010%20on%20Ubuntu%2020.04%2F18.04%20More%20

sudo apt update
sudo apt upgrade

sudo apt install openjdk-8-jre-headless (install java)
sudo apt install openjdk-8-jdk-headless (install javac)

sudo apt install make (needed to make prism)
sudo apt install gcc
sudo apt install g++
sudo apt install libcanberra-gtk-module

sudo useradd -m -d /opt/tomcat -U -s /bin/false tomcat (make new user and group tomcat and set its home to /opt/tomcat)

sudo apt install wget (wget for installing tomcat)
wget https://dlcdn.apache.org/tomcat/tomcat-10/v10.0.20/bin/apache-tomcat-10.0.20.tar.gz (install tomcat) (note, you may have to replace to version in the url to reflect the most recent verision of tomcat, see here https://tomcat.apache.org/download-10.cgi)
sudo tar xzvf apache-tomcat-10.0.20.tar.gz -C /opt/tomcat --strip-components=1 (unzip tomcat and move it to its home directory)
sudo chown -R tomcat:tomcat /opt/tomcat/ (set ownership of the tomcat folder contents to tomcat (they are originally root as we used sudo to unpack it))
sudo chmod -R u+x /opt/tomcat/bin (set permissions of tomcat bin folder (the bin contains the shell scripts to start/stop the server))

-- optional, set up auto run on server initilaize
sudo nano /opt/tomcat/conf/tomcat-users.xml ((optional if you want to setup an admin dashboard, see this for instructions on how: https://www.linuxshelltips.com/install-apache-tomcat-ubuntu/))
-- otherstuff to set up above

Note at this point the tomcat manager should show up on at the server ip address with port 8080 (for example, http://138.49.185.129:8080/) from our local computer (see running tomcat)

now we will install add our website to tomcat, note tomcat deploys websites from war files which are similar to jar files with a certain file structure.
switch back to our normal user,
press control+d to switch back to normal user and go to your home directory (cleaner to work in here)

git clone https://github.com/PoisonedPoi/SocialVerificationWebsite.git (clone the project)
then run ./setup.sh to setup initial resources

now for java 8 you need to disable some accessability properties for prism to work properly, this script should do that
sudo sed -i -e '/^assistive_technologies=/s/^/#/' /etc/java-\*-openjdk/accessibility.properties

Final Step at the note, its important and easy to forget and hard to debug
****\*\*****Note: you still have to unset DISPLAY (echo \$DISPLAY should be empty) ((comand is unset DISPLAY)****\*\*\*****

Now run tomcat

--running tomcat
sudo -u tomcat bash (switch to tomcat user and run future commands as the tomcat user)
unset DISPLAY
cd /opt/tomcat/bin
./startup.sh (starts the server)

_at this point the server should be all set up_
_The tomcat manager should show up on at the server ip address with port 8080 (for example, http://138.49.185.129:8080/) from an external computer connected to uwl through cisgo_
Access the website at the following url,

http://138.49.185.222:8080/SocialVerificationWebsite/

--making changes to source code and redeploying
pull new changes into the SocialVerificationWebsite folder,
then run ./deploy.sh as ubuntu (it will switch to tomcat using sudo -u tomcat and make the war file and deploy it to the server, wait 5 seconds and your changes should be applied if tomcat is running)

Notes and suggestions,

If you run into segfaults or permission errors use ls-l and sudo -u {user} bash to check permissions, in development many bugs were present due to improper installation using sudo to move files or g et around permissions but then erroring as sudo set the file created/moved to be owned by root and not tomcat, so when tomcat tried to access such files it would cause errors
