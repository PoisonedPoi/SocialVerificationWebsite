export class ParameterResult {

  id: number;
  type: string | null = '';

  boolResult: boolean | null = false;
  intResult: number | null = -1;
  strResult: string | null = '';
  arrayResult: { val: string | null, linkTitle: string | null }[] | null = [];

  constructor(
    id: number = -1,
    type: string | null = null,
    br: boolean | null = null,
    ir: number | null = null,
    sr: string | null = null,
    ar: { val: string | null, linkTitle: string | null }[] | null = null
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
      let arrayVariable = el.getElementsByTagName('name')[0].textContent;
      let arrayResults = [];

      for (let m = 0; m < arrayItems.length; m++) {
          let curItem = arrayItems[m];
          let itemVal = curItem.getAttribute('val');
          let itemLink = curItem.getAttribute('link');
          if (itemLink == 'human_ready') {
              itemLink = 'Human Ready';
          } else if (itemLink == 'human_ignore') {
              itemLink = 'Human Suspended';
          }
          arrayResults.push({ val: itemVal, linkTitle: itemLink });
      }

      this.arrayResult = arrayResults;
    }
  }
}
