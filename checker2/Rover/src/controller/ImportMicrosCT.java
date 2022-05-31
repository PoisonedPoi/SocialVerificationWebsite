package controller;
import aCheck.ModelFileChecker;
import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

import model.MicroBox;
import model_ctrl.FSManager;
import aCheck.Globals;

/*
 * Class to view and add microinteractions to microcollections in the project
 */
public class ImportMicrosCT{

	//@FXML
	//private TextField searchBar;
	//@FXML
	//private Button searchButton;
	//@FXML


	private ModelFileChecker mc;
	private ArrayList<MicroBox> allMicros;
	private String currItem = null;

	/*
	* This can probably be removed
	*/ 

	public ImportMicrosCT(ModelFileChecker mc) {

	}
}
