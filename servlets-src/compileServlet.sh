#compile the servlet and move it into the proper folder in the WEB-INF (web.xml should be updated if adding a new servlet)
#make sure java has been configured properly

#Note, this is meant to be called by .sh files in parent dir

#tomcat home
TOMCAT="$1"

echo -classpath ${TOMCAT}/lib/servlet-api.jar

#note must be user atm, this shold be changed
#compile the servlet

javac -cp /opt/tomcat/lib/servlet-api.jar ViolationParser.java -d ../website/WEB-INF/classes/

#javac -classpath ${TOMCAT}/lib/servlet-api.jar ViolationParser.java -d ../website/WEB-INF/classes/
