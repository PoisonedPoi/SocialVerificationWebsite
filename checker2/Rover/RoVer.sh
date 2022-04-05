#!/bin/bash


javac -cp "./bin:prism-library/prism/lib/colt.jar:prism-library/prism/lib/jhoafparser.jar:prism-library/prism/lib/pepa.zip:prism-library/prism/lib/prism.jar" -d bin $(find ./src/* | grep .java)

export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:prism-library/prism/lib/
# LD_LIBRARY_PATH if linux

workingDir="/srv/rover";

echo 
echo DONE PARSING
echo 
#-Djava.library.path=prism-library/prism/lib/ -Dfile.encoding=UTF-8
java -Djava.library.path=prism-library/prism/lib/ -Dfile.encoding=UTF-8 -cp "./bin:prism-library/prism/lib/colt.jar:prism-library/prism/lib/jhoafparser.jar:prism-library/prism/lib/pepa.zip:prism-library/prism/lib/prism.jar" aCheck.CheckingDriver 96 ${workingDir}








#javac -cp "./bin:../prism-4.3.1-src/lib/colt.jar:../prism-4.3.1-src/lib/jhoafparser.jar:../prism-4.3.1-src/lib/pepa.zip:../prism-4.3.1-src/lib/prism.jar:/Library/Java/JavaVirtualMachines/jdk1.8.0_181.jdk/Contents/Home/jre/lib/jfxswt.jar:/Library/Java/JavaVirtualMachines/jdk1.8.0_121.jdk/Contents/Home/jre/lib/ext/jfxrt.jar" -d bin $(find ./src/* | grep .java)

#export DYLD_LIBRARY_PATH=$DYLD_LIBRARY_PATH:../prism-4.3.1-src/lib/
# LD_LIBRARY_PATH if linux

#/Library/Java/JavaVirtualMachines/jdk1.8.0_181.jdk/Contents/Home/bin/java -Djava.library.path=../prism-4.3.1-src/lib/ -Dfile.encoding=UTF-8 -classpath "./bin:../prism-4.3.1-src/lib/colt.jar:../prism-4.3.1-src/lib/jhoafparser.jar:../prism-4.3.1-src/lib/pepa.zip:../prism-4.3.1-src/lib/prism.jar:/Library/Java/JavaVirtualMachines/jdk1.8.0_181.jdk/Contents/Home/jre/lib/jfxswt.jar:/Library/Java/JavaVirtualMachines/jdk1.8.0_121.jdk/Contents/Home/jre/lib/ext/jfxrt.jar" controller.Main

