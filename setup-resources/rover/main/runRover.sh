#ARGS
# $1 = USEFOLDER LOCATION   (userfolder will be deleted after operation ((this can be changed in ModelFileChecker)))
# $2 = MODEL XML STRING (IN TEXT/XML FORMAT)

#Locaction of rover binary files, prism library, and the working directory(where user files are written to and resources are stored) which is all required to run rover
#update me if source code changed/recompiled and you dont want to run ./deploy.sh everytime, move me to the working directory, probably /home/{user}/Documents/{path-to-checker2}/Rover/bin
binLoc="/srv/rover/main/bin/"

#defaults
prismLoc="/srv/rover/main/prism-library"  #/opt/resources/prism-library     /srv/rover/lib/prism-library
workingDir="/srv/rover";  #  "/home/new/rover2"

#To run this in the command line type this, ./runRoVer.sh 123 ModelFileString (the modelfilestring should be an xml string of the interaction, ideally generated from the client, reference interaction.xml for example)
#All this program does is print to stdout the violations in xml format which is then supposed to be parsed by another program (process output redirection) such as apache tomcat which calls this by a process

#The prism library is not thread safe so you should uses processes to run this as an independend process instead of trying to thread it
export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:${prismLoc}/prism/lib/ #required as some .so files in prism have other .so dependencies, so this is needed as well as setting the java library path
java -Djava.library.path=${prismLoc}/prism/lib/ -Dfile.encoding=UTF-8 -cp "${binLoc}:${prismLoc}/prism/lib/colt.jar:${prismLoc}/prism/lib/jhoafparser.jar:${prismLoc}/prism/lib/pepa.zip:${prismLoc}/prism/lib/prism.jar" aCheck.CheckingDriver $1 "$2" ${workingDir} #"$2"
