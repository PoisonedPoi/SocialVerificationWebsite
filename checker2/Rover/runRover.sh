#Locaction of binary files and the prism library required to run rover
binLoc="/home/new/Documents/git/checker2/Rover/bin"
prismLoc="/opt/resources/prism-library"

#NOTE, $1 is the first arg to runRoVer and represent the user folder this instance of rover will use ("user123")="123"
#The user folder will be deleted after the operation is done

#To run this in the command line type this, ./runRoVer.sh 123

#All this program does is print to stdout the xml file string which is then supposed to be parsed by another program such as apache tomcat which calls this by a process
#The prism library is not thread safe so you should uses processes to run this

export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:${prismLoc}/prism/lib/ #required as some .so files in prism have other .so dependencies, so this is needed as well as setting the java library path
java -Djava.library.path=${prismLoc}/prism/lib/ -Dfile.encoding=UTF-8 -cp "${binLoc}:${prismLoc}/prism/lib/colt.jar:${prismLoc}/prism/lib/jhoafparser.jar:${prismLoc}/prism/lib/pepa.zip:${prismLoc}/prism/lib/prism.jar:/usr/lib/jvm/jdk1.8.0_181/jre/lib/jfxswt.jar:/usr/lib/jvm/jdk1.8.0_121/jre/lib/ext/jfxrt.jar" aCheck.CheckingDriver $1
