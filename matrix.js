
class MatrixEngine {
  constructor(){ this.data=[]; }
  load(rows){ this.data = rows || []; }
  build(){ return this.data; }
}
window.MatrixEngine = MatrixEngine;
