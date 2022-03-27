#Locaction of binary files and the prism library required to run rover
binLoc="/home/new/Documents/git/checker2/Rover/bin"
prismLoc="/opt/resources/prism-library"

export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:${prismLoc}/prism/lib/

java -Djava.library.path=${prismLoc}/prism/lib/ -Dfile.encoding=UTF-8 -cp "${binLoc}:${prismLoc}/prism/lib/colt.jar:${prismLoc}/prism/lib/jhoafparser.jar:${prismLoc}/prism/lib/pepa.zip:${prismLoc}/prism/lib/prism.jar:/usr/lib/jvm/jdk1.8.0_181/jre/lib/jfxswt.jar:/usr/lib/jvm/jdk1.8.0_121/jre/lib/ext/jfxrt.jar" aCheck.CheckingDriver 96
