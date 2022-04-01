#ARGS
# $1 = USEFOLDER LOCATION   (userfolder will be deleted after operation ((this can be changed in ModelFileChecker)))
# $2 = MODEL XML STRING (IN TEXT/XML FORMAT)

#Locaction of binary files and the prism library required to run rover
binLoc="/home/new/Documents/git/checker2/Rover/bin"
prismLoc="/opt/resources/prism-library"

#To run this in the command line type this, ./runRoVer.sh 123 ModelFileString (the modelfilestring should be an xml string of the interaction, ideally generated from the client, reference interaction.xml for example)

#All this program does is print to stdout the violations in xml format which is then supposed to be parsed by another program (process output redirection) such as apache tomcat which calls this by a process
#The prism library is not thread safe so you should uses processes to run this
export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:${prismLoc}/prism/lib/ #required as some .so files in prism have other .so dependencies, so this is needed as well as setting the java library path
java -Djava.library.path=${prismLoc}/prism/lib/ -Dfile.encoding=UTF-8 -cp "${binLoc}:${prismLoc}/prism/lib/colt.jar:${prismLoc}/prism/lib/jhoafparser.jar:${prismLoc}/prism/lib/pepa.zip:${prismLoc}/prism/lib/prism.jar:/usr/lib/jvm/jdk1.8.0_181/jre/lib/jfxswt.jar:/usr/lib/jvm/jdk1.8.0_121/jre/lib/ext/jfxrt.jar" aCheck.CheckingDriver $1 "$2" #"$2"
