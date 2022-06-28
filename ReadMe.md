General Description

TODO

---

# Installation Instructions


### Installing rover on a server

First, ssh into server or run this locally,

D:\school\capstone\certs> ssh -i .\rover.pem ubuntu@138.49.185.129

## Installation on blank ubuntu 20 server instance

*did work on ubuntu 16 as lowest version tested and was successfuly deployed using these instructions on eucalytpus ubuntu 20*

### Install tomcat

[useful link](https://computingforgeeks.com/install-apache-tomcat-on-ubuntu-linux/#:~:text=%20Install%20Apache%20Tomcat%2010%20on%20Ubuntu%2020.04%7C18.04,Apache%20Tomcat%2010%20on%20Ubuntu%2020.04%2F18.04%20More%20)

1. `sudo apt update`

2. `sudo apt upgrade`

3. `sudo apt install openjdk-8-jre-headless` -- install java

4. `sudo apt install openjdk-8-jdk-headless` -- install javac

5. `sudo apt install make` -- needed to make prism

6. `sudo apt install gcc` -- install **C** compiler

7. `sudo apt install g++` -- install **C++** compiler

8. `sudo apt install libcanberra-gtk-module`

9. `sudo useradd -m -d /opt/tomcat -U -s /bin/false tomcat` -- make new user and group tomcat and set its home to /opt/tomcat

10. `sudo apt install wget` -- wget for installing tomcat

11. `wget https://dlcdn.apache.org/tomcat/tomcat-9/v9.0.64/bin/apache-tomcat-9.0.64.tar.gz` -- install tomcat (note, you may have to replace to version in the url to reflect the most recent version of tomcat 9, see here https://tomcat.apache.org/download-9.cgi)
    - Must use tomcat 9 because that is the most recent version compatible with spring boot

12. `sudo tar xzvf apache-tomcat-9.0.64.tar.gz -C /opt/tomcat --strip-components=1` -- unzip tomcat and move it to its home directory

13. `sudo chown -R tomcat:tomcat /opt/tomcat/` -- set ownership of the tomcat folder contents to tomcat (they are originally root as we used sudo to unpack it)

14. `sudo chmod -R u+x /opt/tomcat/bin` -- set permissions of tomcat bin folder (the bin contains the shell scripts to start/stop the server)

15. Go into your .bashrc file and add `unset DISPLAY` to the end of the file

16. `sudo cp .bashrc /opt/tomcat/`

17. `sudo chown tomcat:tomcat /opt/tomcat/.bashrc`

#### *Optional, set up auto run on server initilaize*
`sudo nano /opt/tomcat/conf/tomcat-users.xml` -- optional if you want to setup an admin dashboard, see this for instructions on how: https://www.linuxshelltips.com/install-apache-tomcat-ubuntu/
-- other stuff to set up above

*Note: at this point the tomcat manager should show up on at the server ip address with port 8080 (for example, http://138.49.185.129:8080/) from our local computer (see running tomcat)*

### Install SocialVerificationWebsite website on tomcat server
*Note: tomcat deploys websites from war files which are similar to jar files with a certain file structure.*

1. Switch back to our normal user
    - Press control+d or type `exit` to switch back to normal user
    - Go to your home directory (cleaner to work in here)

2. `git clone https://github.com/logan-larson/SocialVerificationWebsite.git` -- clone the project
    - If git is not installed, install with `sudo apt install git`

3. Make sure you are using java 8 and javac 8
    - `sudo update-alternatives --config java`
    - `sudo update-alternatives --config javac`

4. For java 8 you need to disable some accessibility properties for prism to work properly, this script should do that
    - sudo sed -i -e '/^assistive_technologies=/s/^/#/' /etc/java-*-openjdk/accessibility.properties

5. `./project-setup.sh` -- This should compile everything and deploy the website to port 8080


### Closing remarks

At this point the server should be all set up
    
    - If not, run `./deploy-application.sh -h` script for help deploying

The tomcat manager should show up on at the server ip address with port 8080 

- For example, http://138.49.185.129:8080/ from an external computer connected to uwl through cisgo

Access the website at the following url

(http://138.49.185.222:8080/SocialVerificationWebsite/)

## Making changes to source code and redeploying

- `./deploy-application.sh` -- this compiles the spring boot application and deploys it if given proper flags

- `./update-rover.sh` -- this compiles the back end and moves it to useful locations if given proper flags

## Notes and suggestions

If you run into segfaults or permission errors use ls-l and sudo -u {user} bash to check permissions, in development many bugs were present due to improper installation using sudo to move files or get around permissions but then erroring as sudo set the file created/moved to be owned by root and not tomcat, so when tomcat tried to access such files it would cause errors
