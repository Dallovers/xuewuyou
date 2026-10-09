'use strict';
let runtime=null, loading=null, stdout='', stderr='';
const status=message=>postMessage({type:'status',message});
async function ready(){
  if(runtime)return runtime;
  if(!loading)loading=(async()=>{
    const vendor=new URL('../vendor/pyodide/',self.location.href).href;
    status('正在加载本地 Python 环境…');const {loadPyodide}=await import(vendor+'pyodide.mjs');
    runtime=await loadPyodide({indexURL:vendor,stdout:line=>{if(stdout.length<90000)stdout+=line+'\n';},stderr:line=>{if(stderr.length<10000)stderr+=line+'\n';}});
    status('正在准备 NumPy / SymPy / Matplotlib…');await runtime.loadPackage(['numpy','sympy','matplotlib']);
    await runtime.runPythonAsync("import matplotlib\nmatplotlib.use('Agg')\nimport matplotlib.pyplot as plt\n");return runtime;
  })();return loading;
}
onmessage=async function(e){
  const code=String(e.data.code||'');if(code.length>20000)return postMessage({type:'error',message:'代码超过 20000 字符'});
  try{const py=await ready();stdout='';stderr='';await py.runPythonAsync('import matplotlib.pyplot as plt\nplt.close("all")');status('正在运行代码…');const start=performance.now();let error=false;
    try{await py.runPythonAsync(code);}catch(err){error=true;stderr+=String(err);}
    let images=[];
    if(!error){await py.runPythonAsync("import io, base64, json\n_xwy_images=[]\nfor _num in plt.get_fignums()[:3]:\n    _buf=io.BytesIO()\n    plt.figure(_num).savefig(_buf, format='png', dpi=100, bbox_inches='tight')\n    _xwy_images.append('data:image/png;base64,'+base64.b64encode(_buf.getvalue()).decode())\n_xwy_images_json=json.dumps(_xwy_images)\n");images=JSON.parse(py.globals.get('_xwy_images_json'));}
    postMessage({type:'result',code,output:(stdout+stderr).slice(0,100000),images,error,elapsed:Math.round(performance.now()-start)});
  }catch(err){postMessage({type:'error',message:String(err)});}
};
