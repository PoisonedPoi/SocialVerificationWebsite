clear
javac -cp "./bin:prism-library/prism/lib/colt.jar:prism-library/prism/lib/jhoafparser.jar:prism-library/prism/lib/pepa.zip:prism-library/prism/lib/prism.jar:/usr/lib/jvm/jdk1.8.0_181/jre/lib/jfxswt.jar:/usr/lib/jvm/jdk1.8.0_121/jre/lib/ext/jfxrt.jar" -d bin $(find ./src/* | grep .java)

export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:prism-library/prism/lib/
# LD_LIBRARY_PATH if linux

echo 
echo DONE PARSING