import {Parameter} from "./parameter";

export class ParameterResult {

  id: number;
  type: string | null = '';

  boolResult: boolean | null = false;
  intResult: number | null = -1;
  strResult: string | null = '';
  arrayResult: Map<string, string> | null = null;
  //arrayResult: { val: string | null, linkTitle: string | null }[] | null = [];

  constructor(
    id: number = -1,
    type: string | null = null,
    br: boolean | null = null,
    ir: number | null = null,
    sr: string | null = null,
    ar: Map<string, string> | null = null,
    //ar: { val: string | null, linkTitle: string | null }[] | null = null
  ) {
      this.id = id;
      this.type = type;

      this.boolResult = br;
      this.intResult = ir;
      this.strResult = sr;
      this.arrayResult = ar;
  }

  setParameterResultFromXML(el: Element, id: number) {

    this.id = id;

    this.type = el.getAttribute("type");

    if (this.type == 'bool') {
      this.boolResult = el.getAttribute('val') == 'true';
    } else if (this.type == 'int'){
      let ir = el.getAttribute('val');

      if (ir) {
        this.intResult = parseInt(ir);
      }
    } else if (this.type == 'str') {
      let sr = el.getAttribute('val');
      if (sr) {
        this.strResult = sr;
      }
    } else if (this.type == "array") {
      let arrayItems = el.getElementsByTagName('item');
      //let arrayVariable = el.getElementsByTagName('name')[0].textContent;
      //let arrayResults = [];
      let arrayResults = new Map<string, string>();

      for (let m = 0; m < arrayItems.length; m++) {
          let curItem = arrayItems[m];
          let itemVal = curItem.getAttribute('val');
          let itemLink = curItem.getAttribute('link');
          if (itemLink == 'human_ready') {
              itemLink = 'Human Ready';
          } else if (itemLink == 'human_ignore') {
              itemLink = 'Human Suspended';
          }
          if (itemLink && itemVal) {
            arrayResults.set(itemLink, itemVal);
          }
      }

      this.arrayResult = arrayResults;
    }
  }

  getParameterResultInXML(name: string): string {
    let xmlString: string = '';

    // Guards to catch parse errors
    if (!this) {
      console.log("ERROR: something went wrong!");
      xmlString += '<parameter></parameter>'
      return xmlString;
    }

    if (this.boolResult == null &&
        this.intResult == null &&
        this.strResult == null &&
        this.arrayResult == null
    ) {
      console.log("ERROR: empty parameter");
      xmlString += '<parameter></parameter>'
      return xmlString;
    }
    
    // Clean this up; maybe with a bigger switch statement
    if (this.arrayResult != null) { //unique case
      xmlString += '<parameter type="array">';
      xmlString += '<name>answers robot can recognize</name>'

      this.arrayResult.forEach((res: any) => {
        let link = "";
        if (res.linkTitle == "Human Ready") {
            link = "human_ready";  //these are the variables needed in the back end
        } else if (res.linkTitle == "Human Suspended") {
            link = "human_ignore";
        } else {
            console.log("ERROR: interaction.exportModelToXML: linkTitle not recognized when making model");
        }
        xmlString += '<item type="string" val="' + res.val + '" link="' + link + '"/>';
      });
      xmlString += '</parameter>'
    } else if (this.boolResult != null) {
      xmlString += '<parameter type="bool" val="' + this.boolResult + '">' ;
    } else if (this.strResult != null) {
      xmlString += '<parameter type="str" val="' + this.intResult + '">';
    } else if (this.intResult != null) {
      xmlString += '<parameter type="int" val="' + this.strResult + '">';
    }

    xmlString += name + '</parameter>';
    return xmlString;
  }
}
