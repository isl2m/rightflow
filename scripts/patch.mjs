import * as fs from 'fs/promises';
import * as path from 'path';
import { fileExists, getCandidateRoots, patchCspTrustedTypes } from './common.mjs';

const subdirs = ['electron-sandbox', 'electron-browser'];
const cssFilename = 'rightflow.css';
const jsFilename = 'rightflow.js';

export async function patchHtml(filePath) {
  if (!(await fileExists(filePath))) return false;

  const backupPath = filePath + '.bak';
  if (!(await fileExists(backupPath))) {
    try {
      await fs.copyFile(filePath, backupPath);
    } catch (e) {}
  }

  let html = await fs.readFile(filePath, 'utf-8');
  const alreadyHasTags = html.includes(cssFilename) && html.includes(jsFilename);
  if (alreadyHasTags) {
    const cspRes = patchCspTrustedTypes(html);
    if (!cspRes.changed) {
      return false;
    }
    await fs.writeFile(filePath, cspRes.html, 'utf-8');
    console.log(`Patched Trusted Types in ${path.basename(filePath)}`);
    return true;
  }

  let changed = false;
  html = html.replace(/\s*<!--\s*(?:Antigravity (?:Chat )?RTL(?: Pro)?|RightFlow)[^-]*-->\s*<link rel="stylesheet"[^>]+>/gi, '');
  html = html.replace(/\s*<!--\s*(?:Antigravity (?:Chat )?RTL(?: Pro)?|RightFlow)[^-]*-->\s*<script[^>]+><\/script>/gi, '');

  const cssTag = `\t<!-- RightFlow -->\n\t<link rel="stylesheet" href="../../../workbench/${cssFilename}">\n</head>`;
  const jsTag = `\t<!-- RightFlow -->\n\t<script src="../../../workbench/${jsFilename}"></script>\n</html>`;

  if (!html.includes(cssFilename)) {
    html = html.replace('</head>', cssTag);
    changed = true;
  }
  if (!html.includes(jsFilename)) {
    html = html.replace('</html>', jsTag);
    changed = true;
  }

  const cspRes = patchCspTrustedTypes(html);
  if (cspRes.changed) {
    html = cspRes.html;
    changed = true;
  }

  if (changed) {
    await fs.writeFile(filePath, html, 'utf-8');
    console.log(`Patched ${path.basename(filePath)}`);
    return true;
  }
  return false;
}

export async function patchWorkbench(appRoot) {
  if (!(await fileExists(appRoot))) return false;

  const workbenchDir = path.join(appRoot, 'out', 'vs', 'workbench');
  const productJsonPath = path.join(appRoot, 'product.json');
  let touched = false;

  await fs.mkdir(workbenchDir, { recursive: true });

  // Deploy CSS and JS
  const srcCss = path.join(import.meta.dirname, '..', 'src', 'content.ts');
  if (await fileExists(srcCss)) {
    const contentTs = await fs.readFile(srcCss, 'utf-8');
    const cssMatch = contentTs.match(/export const INJECTED_CSS = `([\s\S]*?)`;/);
    const jsMatch = contentTs.match(/export const INJECTED_JS = `([\s\S]*?)`;/);

    if (cssMatch && jsMatch) {
      const cssTarget = path.join(workbenchDir, cssFilename);
      const jsTarget = path.join(workbenchDir, jsFilename);
      let needWrite = true;
      if (await fileExists(cssTarget) && await fileExists(jsTarget)) {
        const curCss = await fs.readFile(cssTarget, 'utf-8');
        const curJs = await fs.readFile(jsTarget, 'utf-8');
        if (curCss === cssMatch[1] && curJs === jsMatch[1]) {
          needWrite = false;
        }
      }
      if (needWrite) {
        await fs.writeFile(cssTarget, cssMatch[1], 'utf-8');
        await fs.writeFile(jsTarget, jsMatch[1], 'utf-8');
        console.log('Deployed assets to ' + workbenchDir);
        touched = true;
      }
    }
  }

  // Patch HTML files in all candidate subdirectories
  for (const subdir of subdirs) {
    const wbPath = path.join(appRoot, 'out', 'vs', 'code', subdir, 'workbench', 'workbench.html');
    const secPath = path.join(appRoot, 'out', 'vs', 'code', subdir, 'workbench', 'workbench-jetski-agent.html');

    if (await patchHtml(wbPath)) touched = true;
    if (await patchHtml(secPath)) touched = true;

    // Update product.json checksums
    try {
      if (await fileExists(productJsonPath)) {
        const prod = JSON.parse(await fs.readFile(productJsonPath, 'utf-8'));
        if (prod.checksums) {
          let prodChanged = false;
          const k1 = `vs/code/${subdir}/workbench/workbench.html`;
          const k2 = `vs/code/${subdir}/workbench/workbench-jetski-agent.html`;
          if (prod.checksums[k1]) {
            delete prod.checksums[k1];
            prodChanged = true;
          }
          if (prod.checksums[k2]) {
            delete prod.checksums[k2];
            prodChanged = true;
          }
          if (prodChanged) {
            await fs.writeFile(productJsonPath, JSON.stringify(prod, null, '\t'), 'utf-8');
            console.log(`Updated product.json checksums for ${subdir}`);
            touched = true;
          }
        }
      }
    } catch (e) {
      console.warn('Product.json note:', e.message);
    }
  }

  // Patch Antigravity agy extension for Chat Webview Proxy
  const agyPath = path.join(appRoot, 'extensions', 'agy', 'vscode', 'extension.js');
  if (await fileExists(agyPath)) {
    const agyBak = agyPath + '.bak';
    if (!(await fileExists(agyBak))) {
      try { await fs.copyFile(agyPath, agyBak); } catch (e) {}
    }
    let agyContent = await fs.readFile(agyPath, 'utf-8');
    if (!agyContent.includes('__rightflow_proxy')) {
      const agyTarget = 'renderIframe(a,b,c){var d=this.buildIframeUrl(b,c);console.log(`[Jetski] Loading iframe URL: ${zv(d)}`);this.renderWebviewHtml(a,b,d,c)}';
      const agyReplacement = 'async renderIframe(a,b,c){var d=this.buildIframeUrl(b,c);console.log(`[Jetski] Loading iframe URL: ${zv(d)}`);\\n' +
'try{\\n' +
'  const rf=globalThis.__rightflow_proxy||(globalThis.__rightflow_proxy=(function(){\\n' +
'    const http=require("http"),net=require("net"),fs=require("fs"),path=require("path");\\n' +
'    let wbDir=path.resolve(__dirname,"..","..","..","out","vs","workbench");\\n' +
'    if(!fs.existsSync(path.join(wbDir,"rightflow.js"))){\\n' +
'      wbDir=path.resolve(__dirname,"..","..","out","vs","workbench");\\n' +
'    }\\n' +
'    const rfJsPath=path.join(wbDir,"rightflow.js");\\n' +
'    const rfCssPath=path.join(wbDir,"rightflow.css");\\n' +
'    let targetPort=0;\\n' +
'    let readyCbs=[];\\n' +
'    const srv=http.createServer((req,res)=>{\\n' +
'      if(req.url==="/rightflow.css"){\\n' +
'        try{\\n' +
'          const css=fs.readFileSync(rfCssPath,"utf8");\\n' +
'          res.writeHead(200,{"Content-Type":"text/css; charset=utf-8"});\\n' +
'          res.end(css);return;\\n' +
'        }catch(e){res.writeHead(500);res.end();return;}\\n' +
'      }\\n' +
'      if(req.url==="/rightflow.js"){\\n' +
'        try{\\n' +
'          const js=fs.readFileSync(rfJsPath,"utf8");\\n' +
'          res.writeHead(200,{"Content-Type":"application/javascript; charset=utf-8"});\\n' +
'          res.end(js);return;\\n' +
'        }catch(e){res.writeHead(500);res.end();return;}\\n' +
'      }\\n' +
'      const isHtml=req.url==="/"||req.url.startsWith("/?");\\n' +
'      const headers={...req.headers,host:`127.0.0.1:${targetPort}`};\\n' +
'      if(isHtml)delete headers["accept-encoding"];\\n' +
'      const opt={hostname:"127.0.0.1",port:targetPort,path:req.url,method:req.method,headers:headers};\\n' +
'      const proxyReq=http.request(opt,(proxyRes)=>{\\n' +
'        if(isHtml&&proxyRes.statusCode===200){\\n' +
'          let body="";proxyRes.setEncoding("utf8");\\n' +
'          proxyRes.on("data",chunk=>{body+=chunk;});\\n' +
'          proxyRes.on("end",()=>{\\n' +
'            let injected=body.replace("</head>","<link rel=\\"stylesheet\\" href=\\"/rightflow.css\\">\\\\n</head>").replace("</body>","<script src=\\"/rightflow.js\\"></script>\\\\n</body>");\\n' +
'            if(injected.includes("trusted-types")&&!injected.includes("rightflow")){\\n' +
'              injected=injected.replace(/(trusted-types\\\\s+)([^;]+?)(;)/i,"$1$2 rightflow \'allow-duplicates\'$3");\\n' +
'            }\\n' +
'            const resHeaders={...proxyRes.headers};\\n' +
'            delete resHeaders["content-length"];\\n' +
'            delete resHeaders["content-encoding"];\\n' +
'            resHeaders["content-type"]="text/html; charset=utf-8";\\n' +
'            res.writeHead(proxyRes.statusCode,resHeaders);\\n' +
'            res.end(injected);\\n' +
'          });\\n' +
'        }else{\\n' +
'          res.writeHead(proxyRes.statusCode,proxyRes.headers);\\n' +
'          proxyRes.pipe(res);\\n' +
'        }\\n' +
'      });\\n' +
'      proxyReq.on("error",()=>res.writeHead(502).end("Bad Gateway"));\\n' +
'      req.pipe(proxyReq);\\n' +
'    });\\n' +
'    srv.on("upgrade",(req,socket,head)=>{\\n' +
'      const proxySocket=net.connect(targetPort,"127.0.0.1",()=>{\\n' +
'        let reqHeaders=`${req.method} ${req.url} HTTP/1.1\\\\r\\\\n`;\\n' +
'        for(let i=0;i<req.rawHeaders.length;i+=2){\\n' +
'          let k=req.rawHeaders[i],v=req.rawHeaders[i+1];\\n' +
'          if(k.toLowerCase()==="host")v=`127.0.0.1:${targetPort}`;\\n' +
'          reqHeaders+=`${k}: ${v}\\\\r\\\\n`;\\n' +
'        }\\n' +
'        reqHeaders+="\\\\r\\\\n";\\n' +
'        proxySocket.write(reqHeaders);\\n' +
'        if(head&&head.length)proxySocket.write(head);\\n' +
'        proxySocket.pipe(socket);socket.pipe(proxySocket);\\n' +
'      });\\n' +
'      proxySocket.on("error",()=>socket.destroy());\\n' +
'      socket.on("error",()=>proxySocket.destroy());\\n' +
'    });\\n' +
'    srv.listen(0,"127.0.0.1",()=>{\\n' +
'      readyCbs.forEach(cb=>cb());\\n' +
'      readyCbs=[];\\n' +
'    });\\n' +
'    return{\\n' +
'      setTargetPort:p=>{targetPort=p;},\\n' +
'      getPort:()=>srv.address()?.port,\\n' +
'      onReady:cb=>{if(srv.address()?.port)cb();else readyCbs.push(cb);}\\n' +
'    };\\n' +
'  })());\\n' +
'  if(!rf.getPort()){\\n' +
'    await Promise.race([\\n' +
'      new Promise(r=>rf.onReady(r)),\\n' +
'      new Promise(r=>setTimeout(r,1000))\\n' +
'    ]);\\n' +
'  }\\n' +
'  const m=b.match(/:(\\\\d+)/);\\n' +
'  if(m&&rf.getPort()){\\n' +
'    const hp=parseInt(m[1],10);\\n' +
'    rf.setTargetPort(hp);\\n' +
'    const pp=rf.getPort();\\n' +
'    b=b.replace(":"+hp,":"+pp);\\n' +
'    d=d.replace(":"+hp,":"+pp);\\n' +
'  }\\n' +
'}catch(e){console.error("[RightFlow] Proxy error:",e);}\\n' +
'this.renderWebviewHtml(a,b,d,c)}';
      if (agyContent.includes(agyTarget)) {
        agyContent = agyContent.replace(agyTarget, agyReplacement);
        await fs.writeFile(agyPath, agyContent, 'utf-8');
        console.log('Patched Antigravity Chat proxy in ' + agyPath);
        touched = true;
      }
    }
  }
  return touched;
}

export async function run() {
  console.log('Applying RightFlow patch...');

  const roots = getCandidateRoots();
  let anyPatched = false;

  for (const appRoot of roots) {
    if (await fileExists(appRoot)) {
      console.log(`Found IDE installation at: ${appRoot}`);
      if (await patchWorkbench(appRoot)) {
        anyPatched = true;
      }
    }
  }

  if (anyPatched) {
    console.log('RightFlow patch applied successfully!');
  } else {
    console.log('No eligible IDE installation modified.');
  }
  return anyPatched;
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename || '')) {
  run().catch(console.error);
}
