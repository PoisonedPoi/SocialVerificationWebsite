#run this when you update the rover source code

cd checker2/Rover/
./RoverC.sh  #compile
cd ../../
sudo cp checker2/Rover/bin -r setup-resources/rover/main/ #move to setup-resources 
sudo cp checker2/Rover/bin -r /srv/rover/main/ #move to deployment location (./setup must have been run before this will work)
#./setup.sh